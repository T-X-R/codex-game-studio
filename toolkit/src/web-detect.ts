import { lstat, open, realpath, opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { constants } from 'node:fs';
import { StudioError } from './contract.js';
import { safePath } from './files.js';
const managers = ['npm', 'pnpm', 'yarn', 'bun'];
const lockNames = [['package-lock.json', 'npm'], ['npm-shrinkwrap.json', 'npm'], ['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lock', 'bun'], ['bun.lockb', 'bun']];
const bundlerPackages = [['Vite', 'vite', 'vite'], ['webpack', 'webpack', 'webpack'], ['Parcel', 'parcel', 'parcel'], ['Parcel', 'parcel-bundler', 'parcel'], ['esbuild', 'esbuild', 'esbuild'], ['Rspack', '@rspack/core', 'rspack'], ['Rspack', '@rspack/cli', 'rspack']];
const scriptsToRead = ['dev', 'start', 'serve', 'build', 'test', 'smoke'];
const exactVersion = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const maxFileBytes = 1024 * 1024;
type Diagnostic = {
  code: string;
  path: string;
  message: string;
};
type Row = string[];
type Mapping = Record<string, unknown>;
function mapping(value: unknown, label: string): Mapping {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new StudioError('INVALID_CONFIG', `${label} must be an object`, 1);
  return value as Mapping;
}
function strings(value: unknown, label: string): Record<string, string> {
  if (value === undefined)
    return {};
  const result = mapping(value, label);
  for (const [key, item] of Object.entries(result))
    if (typeof item !== 'string')
      throw new StudioError('INVALID_CONFIG', `${label}.${key} must be a string`, 1);
  return result as Record<string, string>;
}
async function info(root: string, path: string) {
  const absolute = await safePath(root, path);
  try {
    return await lstat(absolute);
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return null;
    throw error;
  }
}
async function text(root: string, path: string): Promise<string | null> {
  const found = await info(root, path);
  if (found === null)
    return null;
  if (!found.isFile())
    throw new StudioError('READ_FAILED', `${path} is not a regular file`, 1);
  if (found.size > maxFileBytes)
    throw new StudioError('READ_LIMIT', `${path} exceeds ${maxFileBytes} bytes`, 1);
  const handle = await open(await safePath(root, path), constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    if (!(await handle.stat()).isFile())
      throw new StudioError('READ_FAILED', `${path} is not a regular file`, 1);
    const buffer = Buffer.alloc(maxFileBytes + 1);
    let length = 0;
    while (length < buffer.length) {
      const read = await handle.read(buffer, length, buffer.length - length, null);
      if (!read.bytesRead)
        break;
      length += read.bytesRead;
    }
    if (length > maxFileBytes)
      throw new StudioError('READ_LIMIT', `${path} exceeds ${maxFileBytes} bytes`, 1);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length));
    }
    catch {
      throw new StudioError('INVALID_CONFIG', `${path} is not valid UTF-8`, 1);
    }
  }
  finally {
    await handle.close();
  }
}
async function json(root: string, path: string): Promise<Mapping | null> {
  const content = await text(root, path);
  if (content === null)
    return null;
  try {
    return mapping(JSON.parse(content), path);
  }
  catch (error) {
    throw new StudioError('INVALID_CONFIG', `${path}: ${error instanceof Error ? error.message : 'invalid JSON'}`, 1);
  }
}
function words(value: string): string[] { return value.replace(/[/&;|()'"\s]+/g, ' ').trim().split(' ').filter(Boolean); }
function hasWord(value: string, word: string): boolean { return (` ${words(value).join(' ')} `).includes(` ${word} `); }
function expandedScript(scripts: Record<string, string>, value: string): string {
  let result = value, next = value;
  for (let depth = 0; depth < 2 && next; depth++) {
    const tokens = words(next), names: string[] = [];
    for (let i = 0; i < tokens.length; i++)
      if (managers.includes(tokens[i]!)) {
        let name = tokens[++i];
        if (name === 'run' || name === 'run-script')
          name = tokens[++i];
        if (name && !name.startsWith('-'))
          names.push(['t', 'tst'].includes(name) ? 'test' : name);
      }
    next = names.map(name => Object.hasOwn(scripts, name) ? scripts[name] : '').filter(Boolean).join(' ; ');
    result += next ? ` ; ${next}` : '';
  }
  return result;
}
const excludedDirectories = new Set(['node_modules', '.git', 'dist', 'dist-single', 'build', '.claude', 'coverage', '.cache', 'production', 'docs', 'design', '.agents', '.codex', '.game-studio', 'toolkit', 'studio', 'studio-tests', '.next', '.nuxt', 'out']);
const limits = { entries: 20000, depth: 32, fileBytes: maxFileBytes, sourceBytes: 16 * maxFileBytes };
const comparePaths = (a: string, b: string) => Buffer.compare(Buffer.from(a), Buffer.from(b));
const isTest = (path: string) => /(?:^|\/)[^/]*\.(?:test|spec)\.[a-z]+$/.test(path) || /(?:^|\/)__tests__\//.test(path);
const folder = (path: string) => path.includes('/') ? path.split('/')[0]! : '.';
// This is a lexical observation, not a JavaScript parser or proof of execution.
function assignment(content: string): boolean {
  const masked = content.replace(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`/g, match => ' '.repeat(match.length));
  return /\b(?:window|globalThis)[^.;=\r\n]{0,24}\.game\s*=(?!=|>)/.test(masked);
}
async function scanFiles(root: string, diagnostics: Diagnostic[]) {
  const sourceFiles: string[] = [], rootDirectories = new Set<string>();
  let entries = 0, complete = true, stopped = false, sourceBytes = 0;
  const issue = (code: string, path: string, message: string) => { complete = false; diagnostics.push({ code, path, message }); };
  async function walk(path: string, depth: number): Promise<void> {
    if (stopped)
      return;
    if (depth > limits.depth) {
      issue('SCAN_DEPTH', path, 'Directory depth limit reached');
      return;
    }
    try {
      const directory = await opendir(path ? await safePath(root, path) : root);
      const children: string[] = [];
      for await (const child of directory) {
        if (++entries > limits.entries) {
          issue('SCAN_ENTRIES', path || '.', 'Directory entry limit reached');
          stopped = true;
          break;
        }
        children.push(child.name);
      }
      children.sort(comparePaths);
      for (const name of children) {
        const relative = path ? `${path}/${name}` : name;
        try {
          const stat = await lstat(join(root, relative));
          if (stat.isSymbolicLink()) {
            issue('SKIPPED_SYMLINK', relative, 'Symbolic link was not followed');
            continue;
          }
          if (stat.isDirectory()) {
            if (!path)
              rootDirectories.add(name);
            if (!excludedDirectories.has(name))
              await walk(relative, depth + 1);
          }
          else if (stat.isFile() && /\.(?:js|mjs|ts|tsx|jsx)$/.test(name))
            sourceFiles.push(relative);
        }
        catch (error) {
          issue('SCAN_READ', relative, error instanceof Error ? error.message : 'Cannot inspect entry');
        }
      }
    }
    catch (error) {
      issue('SCAN_READ', path || '.', error instanceof Error ? error.message : 'Cannot inspect directory');
    }
  }
  await walk('', 0);
  sourceFiles.sort(comparePaths);
  const tests = sourceFiles.filter(isTest), testFolders = [...new Set(tests.map(folder))].sort(comparePaths).slice(0, 5);
  const codeRoot = rootDirectories.has('src') ? 'src' : null;
  const codeRootCandidates = codeRoot ? [] : [...new Set(sourceFiles.filter(p => !isTest(p) && !/\.config\.[a-z]+$/.test(p) && !/^(?:test|tests|__tests__|e2e)\//.test(p)).map(folder))].sort(comparePaths);
  const testRoot = rootDirectories.has('tests') ? { path: 'tests', mode: 'table', reason: 'tests/ exists' } : rootDirectories.has('test') ? { path: 'test', mode: 'write', reason: 'test/ exists, not tests/' } : rootDirectories.has('__tests__') ? { path: '__tests__', mode: 'write', reason: '__tests__/ exists, not tests/' } : tests.some(p => codeRoot && p.startsWith(`${codeRoot}/`)) ? { path: codeRoot, mode: 'write', reason: 'the tests sit beside the code' } : tests.length ? { path: testFolders[0]!, mode: 'write', reason: 'the first folder holding test files' } : { path: null, mode: 'table', reason: "no test files: the engine table's tests/" };
  let hookPath: string | null = null;
  for (const path of sourceFiles.filter(p => !isTest(p))) {
    try {
      const size = (await info(root, path))?.size ?? 0;
      if (size > limits.sourceBytes - sourceBytes) {
        issue('SCAN_BYTES', path, 'Total source read limit reached');
        break;
      }
      const content = await text(root, path);
      if (content === null) {
        issue('SCAN_READ', path, 'Source disappeared while reading');
        continue;
      }
      sourceBytes += Buffer.byteLength(content);
      if (!hookPath && assignment(content))
        hookPath = path;
    }
    catch (error) {
      issue(error instanceof StudioError ? error.code : 'SCAN_READ', path, error instanceof Error ? error.message : 'Cannot read source');
    }
  }
  if (!complete && !testRoot.path)
    testRoot.reason = 'no test files observed (incomplete scan)';
  return { files: { codeRoot, codeRootCandidates, testRoot, testCount: tests.length, testFolders, sourceFiles },
    scan: { complete, entries, sourceBytes, limits, excludedDirectories: [...excludedDirectories] },
    hook: { state: hookPath ? 'present' : complete ? 'absent' : 'not_assessed', path: hookPath, evidence: 'lexical assignment; not runtime verification' } };
}
export async function detectWeb(project: string, options: {
  packageManager?: string;
} = {}) {
  if (options.packageManager !== undefined && !managers.includes(options.packageManager))
    throw new StudioError('INVALID_ARGUMENT', '--pm must be npm, pnpm, yarn or bun', 2);
  let root: string;
  try {
    root = await realpath(project);
    if (!(await lstat(root)).isDirectory())
      throw new Error('not a directory');
  }
  catch (error) {
    throw new StudioError('READ_FAILED', `Cannot read project root: ${error instanceof Error ? error.message : project}`, 1);
  }
  const rows: Row[] = [], diagnostics: Diagnostic[] = [];
  const pkg = await json(root, 'package.json');
  if (pkg === null)
    return { exitCode: 3, data: { qualityAssessed: false as const, packageJson: { path: 'package.json', state: 'absent' }, rows: [['package_json', 'absent']], diagnostics } };
  rows.push(['package_json', 'present']);
  const workspaces = { present: Object.hasOwn(pkg, 'workspaces') || (await info(root, 'pnpm-workspace.yaml'))?.isFile() === true,
    evidence: (Object.hasOwn(pkg, 'workspaces') ? `package.json workspaces: ${JSON.stringify(pkg.workspaces)}` : 'pnpm-workspace.yaml') as string | null };
  if (!workspaces.present) workspaces.evidence = null;
  rows.push(workspaces.present ? ['workspaces', 'yes', workspaces.evidence!] : ['workspaces', 'no']);
  const lockfiles: {
    path: string;
    manager: string;
  }[] = [];
  for (const [path, manager] of lockNames)
    if ((await info(root, path!))?.isFile()) {
      lockfiles.push({ path: path!, manager: manager! });
      rows.push(['lockfile', path!, manager!]);
    }
  if (pkg.packageManager !== undefined && typeof pkg.packageManager !== 'string')
    throw new StudioError('INVALID_CONFIG', 'packageManager must be a string', 1);
  const declaredManager = typeof pkg.packageManager === 'string' ? pkg.packageManager : '';
  const declaredName = declaredManager.split('@')[0]!, lockedManagers = [...new Set(lockfiles.map(file => file.manager))];
  const packageManager = { name: options.packageManager ?? (managers.includes(declaredName) ? declaredName : lockedManagers.length === 1 ? lockedManagers[0]! : lockedManagers.length ? '?' : 'npm'),
    source: options.packageManager ? '--pm' : managers.includes(declaredName) ? `packageManager: ${declaredManager}` : lockedManagers.length > 1 ? `lockfiles of more than one manager: ${lockfiles.map(f => f.path).join(', ')}` : lockfiles.length ? lockfiles.map(f => f.path).join(', ') : 'no lockfile (npm, the default)', declared: declaredManager || null, conflict: lockedManagers.length > 1 };
  rows.push(['package_manager', packageManager.name, packageManager.source]);
  const allScripts = strings(pkg.scripts, 'scripts'), scripts = Object.fromEntries(scriptsToRead.filter(s => allScripts[s]).map(s => [s, allScripts[s]!]));
  for (const [name, value] of Object.entries(scripts))
    rows.push(['script', name, value]);
  const command = (script: string) => script === 'test' && packageManager.name !== 'bun' ? `${packageManager.name} test` : `${packageManager.name} run ${script}`;
  const commands: Record<string, {
    command: string | null;
    source: string;
  }> = {};
  const set = (name: string, value: string | null, source: string) => { commands[name] = { command: value, source }; rows.push(['command', name, value ?? '-', source]); };
  if (packageManager.name === '?')
    for (const key of ['run', 'build', 'test', 'smoke', 'install'])
      set(key, null, 'which package manager: two lockfiles (--pm)');
  else {
    const run = ['dev', 'start', 'serve'].find(s => scripts[s]);
    set('run', run ? command(run) : null, run ? `scripts.${run}` : 'no dev, start or serve script');
    set('build', scripts.build ? command('build') : null, scripts.build ? 'scripts.build' : 'no build script');
    set('test', scripts.test && !scripts.test.includes('no test specified') ? command('test') : null, !scripts.test ? 'no test script' : scripts.test.includes('no test specified') ? "the test script is npm's placeholder (no test specified)" : 'scripts.test');
    set('smoke', scripts.smoke ? command('smoke') : commands.build!.command, scripts.smoke ? 'scripts.smoke' : commands.build!.command ? 'no smoke script: the build command' : 'no smoke or build script');
    const locked = lockedManagers.includes(packageManager.name);
    const install = packageManager.name === 'npm' ? 'npm ci' : packageManager.name === 'yarn' ? `yarn install --${/^yarn@(?:[2-9]|[1-9]\d)/.test(declaredManager) ? 'immutable' : 'frozen-lockfile'}` : `${packageManager.name} install --frozen-lockfile`;
    set('install', locked ? install : null, locked ? 'the lockfile, unchanged' : `no ${packageManager.name} lockfile: an install would write one`);
  }
  const dependencies = new Map<string, {
    value: string;
    source: string;
  }>();
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'])
    for (const [name, value] of Object.entries(strings(pkg[section], section)))
      if (!dependencies.has(name))
        dependencies.set(name, { value, source: `${section}.${name}` });
  const observation = await scanFiles(root, diagnostics), { files, scan, hook } = observation;
  rows.push(['code_root', files.codeRoot ?? '-', files.codeRoot ? "src/ exists (the engine table's)" : scan.complete ? 'no src/: the person names it (. for a flat game)' : 'src/ not observed (incomplete scan)']);
  for (const candidate of files.codeRootCandidates)
    rows.push(['code_root_candidate', candidate]);
  rows.push(['test_root', files.testRoot.path ?? '-', files.testRoot.mode, files.testRoot.reason], ['test_files', String(files.testCount), files.testFolders.join(' ') || '-']);
  const tsconfig = await info(root, 'tsconfig.json');
  const language = tsconfig?.isFile() ? { name: 'TypeScript', source: 'tsconfig.json' } : dependencies.has('typescript') ? { name: 'TypeScript', source: dependencies.get('typescript')!.source } : files.sourceFiles.some(p => /\.tsx?$/.test(p)) ? { name: 'TypeScript', source: '.ts files' } : !scan.complete ? { name: 'Unknown', source: 'source scan incomplete; no TypeScript evidence among observed files' } : { name: 'JavaScript', source: 'no tsconfig.json, no typescript dependency' };
  rows.push(['language', language.name, language.source]);
  const scriptOrder = ['build', 'dev', 'start', 'serve'];
  const rank = (word: string) => { const index = scriptOrder.findIndex(s => hasWord(expandedScript(allScripts, scripts[s] ?? ''), word) || hasWord(expandedScript(allScripts, scripts[s] ?? ''), `${word}-dev-server`)); return index < 0 ? scriptOrder.length : index; };
  const bundlers: {
    name: string;
    package: string | null;
    declaredVersion: string | null;
    evidence: string;
    scriptSource: string | null;
    rank: number;
  }[] = [];
  for (const [name, dependency, word] of bundlerPackages) {
    const dep = dependencies.get(dependency!);
    if (!dep || bundlers.some(b => b.name === name))
      continue;
    const priority = rank(word!);
    bundlers.push({ name: name!, package: dependency!, declaredVersion: dep.value, evidence: dep.source, scriptSource: scriptOrder[priority] ? `scripts.${scriptOrder[priority]}` : null, rank: priority });
  }
  const bun = rank('bun build');
  if (bun < scriptOrder.length)
    bundlers.push({ name: 'Bun', package: null, declaredVersion: null, evidence: 'bun build in a script', scriptSource: `scripts.${scriptOrder[bun]}`, rank: bun });
  bundlers.sort((a, b) => a.rank - b.rank);
  for (const b of bundlers)
    rows.push(['bundler', b.name, b.package ?? '-', b.declaredVersion ?? '-', b.evidence]);
  if (!bundlers.length)
    rows.push(['bundler', '-', '-', '-', 'none of Vite, webpack, Parcel, esbuild, Rspack or Bun']);
  const first = bundlers[0];
  let installed: Mapping | null = null;
  const installedPath = first?.package ? `node_modules/${first.package}/package.json` : null;
  if (installedPath)
    try {
      installed = await json(root, installedPath);
    }
    catch (error) {
      diagnostics.push({ code: error instanceof StudioError ? error.code : 'READ_FAILED', path: installedPath, message: error instanceof Error ? error.message : 'Could not inspect installed version' });
    }
  const resolved = typeof installed?.version === 'string' && exactVersion.test(installed.version) ? installed.version : null;
  if (installed && !resolved)
    diagnostics.push({ code: 'INVALID_VERSION', path: installedPath!, message: 'Installed package has no exact version' });
  const declared = first?.declaredVersion ?? null, exactDeclared = declared !== null && exactVersion.test(declared) ? declared : null;
  const engineVersion = { value: resolved ?? exactDeclared, declared, declaredSource: declared !== null ? first!.evidence : null, resolved, resolvedSource: resolved ? installedPath : null,
    kind: resolved ? 'installed' : exactDeclared ? 'declared-exact' : 'unknown', source: resolved ? installedPath : exactDeclared ? `package.json ${declared} (not installed)` : null };
  rows.push(['engine_version', engineVersion.value ?? '-', engineVersion.source ?? (!first ? 'no bundler' : declared ? `package.json ${declared} (not an exact version)` : `no version for ${first.name}`)]);
  const runnerPackages = [['vitest', 'vitest'], ['jest', 'jest'], ['playwright', '@playwright/test'], ['playwright', 'playwright'], ['mocha', 'mocha'], ['ava', 'ava'], ['uvu', 'uvu'], ['cypress', 'cypress'], ['web-test-runner', '@web/test-runner'], ['jasmine', 'jasmine'], ['tap', 'tap']];
  const testRunners: {
    name: string;
    source: string;
  }[] = [], testScript = expandedScript(allScripts, scripts.test ?? '');
  for (const [name] of runnerPackages)
    if (hasWord(testScript, name!) && !testRunners.some(r => r.name === name))
      testRunners.push({ name: name!, source: 'the test script runs it' });
  if (!testRunners.length && testScript.trim() && !testScript.includes('no test specified'))
    testRunners.push({ name: 'other', source: `the test script: ${scripts.test}` });
  if (!testRunners.length)
    for (const [name, pkg] of runnerPackages) {
      const dependency = dependencies.get(pkg!);
      if (dependency && !testRunners.some(r => r.name === name))
        testRunners.push({ name: name!, source: `${dependency.source}, but no test script runs it` });
    }
  if (!testRunners.length)
    testRunners.push({ name: 'none', source: 'no test script and no test runner in the dependencies' });
  for (const runner of testRunners)
    rows.push(['test_runner', runner.name, runner.source]);
  const libraries: {
    package: string;
    version: string;
    source: string;
  }[] = [];
  for (const pkg of ['phaser', 'three', 'pixi.js', '@babylonjs/core', 'babylonjs', 'excalibur', 'kaplay', 'kaboom', 'playcanvas', 'matter-js', 'planck', 'howler']) {
    const dependency = dependencies.get(pkg);
    if (dependency) {
      libraries.push({ package: pkg, version: dependency.value, source: dependency.source });
      rows.push(['library', pkg, dependency.value]);
    }
  }
  rows.push(['hook', hook.state, hook.path ?? '-']);
  if (!scan.complete)
    rows.push(['scan', 'incomplete', 'Inspect diagnostics before concluding absence']);
  for (const diagnostic of diagnostics)
    rows.push(['diagnostic', diagnostic.code, diagnostic.path, diagnostic.message]);
  return { exitCode: 0, data: { qualityAssessed: false as const, packageJson: { path: 'package.json', state: 'present' }, workspaces, lockfiles, packageManager, scripts, commands, files, scan, hook, language, bundlers, engineVersion, testRunners, libraries, rows, diagnostics } };
}
export function formatWebDetection(data: {
  rows: Row[];
}): string {
  return data.rows.map(row => row.map(cell => cell.replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n')).join('\t')).join('\n') + '\n';
}
