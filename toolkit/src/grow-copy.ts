import { inspectGrowth } from './grow-check.js';
import { collect, prototypeName } from './prototype.js';
import { canonicalRoot, readText, safePath } from './files.js';
import { resourceFiles } from './resources.js';
import { StudioError } from './contract.js';
import { metadata } from './metadata.js';
import type { InstallPlan } from './install.js';
import { parseConfig } from './config.js';
import { exists } from './project.js';

export async function planGrowthCopy(input: string, name: string) {
  const project = await canonicalRoot(input);
  const source = prototypeName(name);
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  for (const path of ['project.yaml', 'project.local.yaml', 'docs/technical-preferences.md', '.claude/docs/technical-preferences.md']) {
    const before = await readText(await safePath(project, path));
    plan.changes.push({ path, before, after: before });
  }
  const eligibility = await inspectGrowth(project, name);
  if (!eligibility.eligible) throw new StudioError(eligibility.exitCode === 4 ? 'GROWTH_BLOCKED' : 'ASSESSMENT_INCOMPLETE',
    eligibility.checks.filter(check => check.status !== 'pass').map(check => `${check.reason} ${check.paths.join(', ')}`).join('\n'), eligibility.exitCode);
  const files = await collect(await safePath(project, source));
  function text(path: string) {
    const bytes = files[path];
    if (!bytes || !Buffer.from(bytes.toString('utf8')).equals(bytes)) {
      throw new StudioError('GROWTH_REQUIRES_CONVERSION', `A UTF-8 source file is required: ${source}/${path}`, 3);
    }
    return bytes.toString('utf8');
  }
  const scripts = [...text('index.html').matchAll(/<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter(match => match[1] !== undefined);
  const inline = scripts.filter(match => !match[1]!.trim());
  const config = scripts.find(match => /^\s+src\s*=\s*["'](?:\.\/)?config\.js["']\s*$/i.test(match[1]!));
  const tune = scripts.find(match => /^\s+src\s*=\s*["'](?:\.\/)?tune\.js["']\s*$/i.test(match[1]!));
  if (inline.length !== 1 || scripts.some(match => match !== inline[0] && match !== config && match !== tune)
    || (config && config.index! > inline[0]!.index!) || (tune && tune.index! < inline[0]!.index!)) {
    throw new StudioError('GROWTH_REQUIRES_CONVERSION',
      'Copy supports one plain inline game script, optional preceding config.js and optional following tune.js. Convert other scripts explicitly and verify their execution order before growth.', 3);
  }
  const carried = new Set(['index.html']);
  const output: Record<string, Buffer> = {};
  function put(path: string, content: string | Buffer) { output[path] = Buffer.isBuffer(content) ? content : Buffer.from(content); }
  let main = inline[0]![2]!;
  if (config) { put('src/config.js', text('config.js')); carried.add('config.js'); main = `import './config.js';\n${main}`; }
  if (tune) {
    put('src/dev/tune.js', text('tune.js')); carried.add('tune.js');
    main += "\nif (import.meta.env.DEV) await import('./dev/tune.js');\n";
  }
  put('src/main.js', main);
  put('index.html', text('index.html').replace(/<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (whole, attrs) => {
    if (attrs === undefined) return /^<!--\s*(?:PROTOTYPE - NOT FOR PRODUCTION|Question:|Date:)/.test(whole) ? '' : whole;
    return String(attrs).trim() ? '' : '<script type="module" src="./src/main.js"></script>';
  }));
  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith('assets/')) { put(path, content); carried.add(path); }
  }
  if (files['feel-log.md']) {
    put('design/feel-log.md', text('feel-log.md').replace(/^<!--\s*(?:PROTOTYPE - NOT FOR PRODUCTION|Question:|Date:)[^\n]*-->\r?\n/gm, ''));
    carried.add('feel-log.md');
  }
  const tooling = await resourceFiles('studio/templates/web-growth');
  const pkg = JSON.parse(tooling['package.json']!);
  const lock = JSON.parse(tooling['package-lock.json']!);
  const selectedVersion = parseConfig(plan.changes[0]!.before ?? '{}', 'project.yaml').getIn(['engine', 'version']);
  if (selectedVersion != null && selectedVersion !== '' && selectedVersion !== pkg.devDependencies.vite) {
    throw new StudioError('GROWTH_REQUIRES_CONVERSION',
      `The selected Web version ${JSON.stringify(selectedVersion)} differs from bundled Vite ${pkg.devDependencies.vite}. Resolve that engine choice before copying.`, 3);
  }
  pkg.name = name; lock.name = name; lock.packages[''].name = name;
  tooling['package.json'] = `${JSON.stringify(pkg, null, 2)}\n`;
  tooling['package-lock.json'] = `${JSON.stringify(lock, null, 2)}\n`;
  for (const [path, content] of Object.entries(tooling)) put(path, content);
  // Source guards are compared as bytes and never rewritten by the transaction.
  for (const path of carried) {
    const content = files[path]!.toString('base64');
    plan.changes.push({ path: `${source}/${path}`, before: content, after: content, encoding: 'base64' });
  }
  for (const [path, content] of Object.entries(output)) {
    if (await exists(await safePath(project, path))) throw new StudioError('FILE_CONFLICT', `Growth would overwrite an existing file: ${path}`, 4);
    plan.changes.push({ path, before: null, after: content.toString('base64'), encoding: 'base64' });
  }
  const ignore = await readText(await safePath(project, '.gitignore'));
  const newline = ignore?.includes('\r\n') ? '\r\n' : '\n';
  const missing = ['node_modules/', 'dist/', 'dist-single/', 'playwright-report/', 'test-results/']
    .filter(line => !(ignore ?? '').split(/\r?\n/).includes(line));
  if (missing.length) plan.changes.push({ path: '.gitignore', before: ignore,
    after: `${ignore ?? ''}${ignore && !ignore.endsWith('\n') ? newline : ''}${newline}# Web build and test output${newline}${missing.join(newline)}${newline}` });
  const left = Object.keys(files).filter(path => !carried.has(path) && path !== 'brief.md' && path !== 'REPORT.md'
    && path !== 'bot.js' && !path.startsWith('evidence/')).sort();
  return { plan, source, stage: 'copy', tooling: { bundler: 'vite', version: pkg.devDependencies.vite }, left, warnings: [...eligibility.warnings,
    ...(config ? ['config.js is copied without evaluation; extract its values into typed data during the next conversion step.'] : []),
    ...(left.length ? [`Files requiring explicit migration remain in the prototype: ${left.join(', ')}`] : [])],
    remaining: ['Reference and built-game replay comparison', 'TypeScript conversion and game-rule tests',
      'Asset import review and configuration data extraction', 'Engine configuration, growth record and human play'],
    verification: { state: 'not_assessed', reason: 'Copy only. No dependency install, build, game execution, replay comparison or tests were performed.' } };
}
