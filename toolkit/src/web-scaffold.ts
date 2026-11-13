import { basename } from 'node:path';
import { lstat, readFile } from 'node:fs/promises';
import { parseConfig } from './config.js';
import { StudioError } from './contract.js';
import { safePath } from './files.js';
import { resourceFiles } from './resources.js';
import { metadata } from './metadata.js';
import type { InstallPlan } from './install.js';
export interface WebScaffoldOptions {
  starter?: string;
  title?: string;
  gitignore?: boolean;
}
const choices = ['none', 'three', 'phaser', 'pixi'];
const verification = { state: 'not_assessed', reason: 'Files only. No dependency install, build, unit test, browser, replay or gameplay verification was performed.' };
async function present(project: string, path: string) {
  try {
    return await lstat(await safePath(project, path));
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return null;
    throw error;
  }
}
// Called by engine scaffold with the already-read, guarded Web configuration.
export async function planWebScaffold(project: string, config: string, options: WebScaffoldOptions) {
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  const runtime = { version: process.versions.node, dependencyInstall: 'not_run', toolchainExecution: 'not_assessed' };
  if (options.starter !== undefined && !choices.includes(options.starter))
    throw new StudioError('INVALID_ARGUMENT', '--starter must be none, three, phaser or pixi');
  if (options.title !== undefined && (typeof options.title !== 'string' || !options.title.trim() || options.title.includes('\0')))
    throw new StudioError('INVALID_ARGUMENT', '--title must be nonempty text without NUL');
  if (await present(project, 'package.json'))
    throw new StudioError('EXISTING_WEB_PROJECT', 'package.json already exists. Record the existing Web project as it is; no scaffold files were copied.', 3);
  if (options.starter === undefined)
    return { plan, engine: 'Web', choices, runtime, verification, outcome: { state: 'not_assessed', reason: 'Choose a Web starter: none, three, phaser or pixi. An unanswered choice does not select none.' } };
  const common = await resourceFiles('studio/templates/web-growth');
  const support = await resourceFiles('studio/templates/web-growth-support');
  const game = await resourceFiles('studio/templates/web-setup');
  const overlay = options.starter === 'none' ? {} : await resourceFiles(`studio/templates/web-starters/${options.starter}`);
  const files: Record<string, string> = { ...common, ...game, 'src/hook.ts': support['hook.ts']!, ...overlay };
  const pkg = JSON.parse(files['package.json']!), lock = JSON.parse(files['package-lock.json']!);
  const pins: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, version] of Object.entries(pins)) {
    const section = Object.hasOwn(pkg.dependencies ?? {}, name) ? 'dependencies' : 'devDependencies';
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(version) || lock.packages?.['']?.[section]?.[name] !== version || lock.packages?.[`node_modules/${name}`]?.version !== version) {
      throw new StudioError('INVALID_RESOURCE', `Bundled package and lock disagree for ${name}; no scaffold planned.`, 4);
    }
  }
  if (pkg.name !== lock.name || pkg.name !== lock.packages?.['']?.name || !pkg.devDependencies?.vite || !files['src/hook.ts'])
    throw new StudioError('INVALID_RESOURCE', 'Bundled Web scaffold metadata or hook is incomplete', 4);
  const document = parseConfig(config, 'project.yaml');
  const selected = document.getIn(['engine', 'version']);
  if (selected !== pkg.devDependencies.vite)
    throw new StudioError('SCAFFOLD_CHOICE_CONFLICT', `Selected engine.version ${JSON.stringify(selected)} differs from bundled Vite ${pkg.devDependencies.vite}. Resolve this engine choice before creating files.`, 3);
  const title = options.title ?? document.getIn(['project', 'name']) ?? basename(project);
  if (typeof title !== 'string' || !title.trim() || title.includes('\0'))
    throw new StudioError('INVALID_CONFIG', 'The project title must be nonempty text without NUL');
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  files['index.html'] = files['index.html']!.replaceAll('@TITLE@', () => escaped);
  const ignorePath = await safePath(project, '.gitignore'), ignoreStat = await present(project, '.gitignore');
  if (ignoreStat && !ignoreStat.isFile())
    throw new StudioError('FILE_CONFLICT', '.gitignore must be a regular file', 4);
  const ignoreBytes = ignoreStat ? await readFile(ignorePath) : null;
  let before: string | null = null;
  if (ignoreBytes) {
    try {
      before = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(ignoreBytes);
    }
    catch {
      throw new StudioError('FILE_CONFLICT', 'Preserve the existing .gitignore: it is not valid UTF-8', 4);
    }
  }
  const patterns = files['.gitignore.tmpl']!.split(/\r?\n/).filter(Boolean);
  const missing = patterns.filter(line => !(before ?? '').replace(/^\uFEFF/, '').split(/\r?\n/).includes(line));
  const newline = before?.includes('\r\n') ? '\r\n' : '\n';
  let after = before;
  if (before === null)
    after = files['.gitignore.tmpl']!;
  else if (options.gitignore && missing.length)
    after = `${before}${before && !before.endsWith('\n') ? newline : ''}${newline}# === Web: Vite, Vitest and Playwright output ===${newline}${missing.join(newline)}${newline}`;
  plan.changes.push({ path: 'project.yaml', before: config, after: config });
  for (const stored of Object.keys(files).sort()) {
    const path = stored.replace(/\.tmpl$/, '');
    if (path === '.gitignore') {
      plan.changes.push({ path, before, after });
      continue;
    }
    if (await present(project, path))
      throw new StudioError('FILE_CONFLICT', `Web scaffold would overwrite an existing path: ${path}`, 4);
    plan.changes.push({ path, before: null, after: files[stored]! });
  }
  return { plan, engine: 'Web', runtime: { ...runtime, gameNodeRange: pkg.engines?.node }, verification,
    starter: { name: options.starter, libraries: pkg.dependencies ?? {}, toolchain: pkg.devDependencies },
    gitignore: { missing, appendAuthorized: !!options.gitignore, changed: before !== after },
    outcome: { state: 'planned', path: 'package.json', reason: 'Complete Web starter planned; installation and verification remain separate.' } };
}
