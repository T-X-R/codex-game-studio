import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, readdir, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { detectWeb, formatWebDetection } from '../dist/web-detect.js';
async function fixture(t, files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'studio web 检测 '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (p, b) => {
    await mkdir(dirname(join(root, p)), { recursive: true });
    await writeFile(join(root, p), typeof b === 'string' ? b : JSON.stringify(b));
  };
  for (const [p, b] of Object.entries(files))
    await write(p, b);
  return { root, write };
}
test('missing and malformed package JSON are distinct from an observed empty package', async (t) => {
  const { root, write } = await fixture(t);
  let r = await detectWeb(root);
  assert.equal(r.exitCode, 3);
  assert.deepEqual(r.data.rows, [['package_json', 'absent']]);
  await write('package.json', '{"scripts":');
  await assert.rejects(detectWeb(root), { code: 'INVALID_CONFIG' });
  await write('package.json', '{}');
  r = await detectWeb(root);
  assert.equal(r.exitCode, 0);
  assert.equal(r.data.qualityAssessed, false);
});
test('declared ranges stay raw and cannot become an exact bundler pin', async (t) => {
  const { root } = await fixture(t, { 'package.json': { devDependencies: { vite: '^7.3.1' }, scripts: { build: 'vite build' } } });
  const { data } = await detectWeb(root);
  assert.equal(data.engineVersion.value, null);
  assert.equal(data.engineVersion.declared, '^7.3.1');
  assert.equal(data.engineVersion.resolved, null);
  assert.equal(data.bundlers[0].name, 'Vite');
});
test('installed exact version and exact declaration carry different provenance', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': { devDependencies: { vite: '7.3.1' } } });
  let r = await detectWeb(root);
  assert.equal(r.data.engineVersion.value, '7.3.1');
  assert.equal(r.data.engineVersion.kind, 'declared-exact');
  await write('node_modules/vite/package.json', { name: 'vite', version: '7.3.2' });
  r = await detectWeb(root);
  assert.equal(r.data.engineVersion.value, '7.3.2');
  assert.equal(r.data.engineVersion.resolved, '7.3.2');
  assert.equal(r.data.engineVersion.source, 'node_modules/vite/package.json');
});
test('build-script bundler precedes dev-only bundler rather than hardcoded package order', async (t) => {
  const { root } = await fixture(t, { 'package.json': { scripts: { dev: 'vite', build: 'webpack --config webpack/prod.js' }, devDependencies: { vite: '7.3.1', webpack: '5.99.0' } } });
  const { data } = await detectWeb(root);
  assert.deepEqual(data.bundlers.map(b => b.name), ['webpack', 'Vite']);
  assert.equal(data.engineVersion.value, '5.99.0');
});
test('manager priority, conflict and commands retain source behavior without executing scripts', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': { scripts: { dev: 'touch should-not-exist', build: 'webpack', test: 'jest' } }, 'package-lock.json': '{}', 'yarn.lock': '' });
  let r = await detectWeb(root);
  assert.equal(r.data.packageManager.name, '?');
  assert.equal(r.data.commands.build.command, null);
  await write('package.json', { packageManager: 'yarn@3.8.7', scripts: { start: 'node app.js', build: 'webpack', test: 'jest' } });
  r = await detectWeb(root);
  assert.equal(r.data.packageManager.name, 'yarn');
  assert.equal(r.data.commands.install.command, 'yarn install --immutable');
  assert.equal(r.data.commands.run.command, 'yarn run start');
  r = await detectWeb(root, { packageManager: 'npm' });
  assert.equal(r.data.commands.install.command, 'npm ci');
  assert.equal(r.data.commands.test.command, 'npm test');
  assert.equal(r.data.commands.smoke.command, 'npm run build');
  assert.ok(!(await readdir(root)).includes('should-not-exist'));
  await assert.rejects(detectWeb(root, { packageManager: 'unknown' }), { code: 'INVALID_ARGUMENT' });
});
test('real roots, colocated tests and TS are observed while framework/generated trees are pruned', async (t) => {
  const { root } = await fixture(t, { 'package.json': {}, 'src/main.ts': '(window as any).game = game;', 'src/main.test.ts': 'test()', 'studio/fake.spec.ts': '', 'dist/fake.spec.ts': '', '.agents/fake.spec.ts': '' });
  const { data } = await detectWeb(root);
  assert.equal(data.files.codeRoot, 'src');
  assert.equal(data.files.testRoot.path, 'src');
  assert.equal(data.files.testCount, 1);
  assert.equal(data.language.name, 'TypeScript');
  assert.deepEqual(data.hook, { state: 'present', path: 'src/main.ts', evidence: 'lexical assignment; not runtime verification' });
});
test('empty projects have no phantom root candidate and hook comparisons are not assignments', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': {} });
  let { data } = await detectWeb(root);
  assert.deepEqual(data.files.codeRootCandidates, []);
  await write('game/main.js', 'if (window.game === undefined) {} // window.game = fake\nconst s = "globalThis.game = fake";');
  ({ data } = await detectWeb(root));
  assert.deepEqual(data.files.codeRootCandidates, ['game']);
  assert.equal(data.hook.state, 'absent');
  await write('game/main.js', 'globalThis.game = game;');
  assert.equal((await detectWeb(root)).data.hook.state, 'present');
});
test('symlink roots and their contents are never treated as actual project source', async (t) => {
  const target = await fixture(t, { 'external.ts': 'window.game = fake;' });
  const { root } = await fixture(t, { 'package.json': {} });
  await symlink(target.root, join(root, 'src'), process.platform === 'win32' ? 'junction' : 'dir');
  const { data } = await detectWeb(root);
  assert.equal(data.files.codeRoot, null);
  assert.equal(data.hook.state, 'not_assessed');
  assert.ok(data.diagnostics.some(d => d.code === 'SKIPPED_SYMLINK'));
  assert.deepEqual(await readdir(target.root), ['external.ts']);
});
test('depth and file size limits remain explicit incomplete observations', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': {} });
  await write('src/huge.js', ' '.repeat(1024 * 1024 + 1));
  await write(Array(34).fill('deep').join('/') + '/file.ts', 'window.game = fake;');
  const { data } = await detectWeb(root);
  assert.equal(data.scan.complete, false);
  assert.equal(data.hook.state, 'not_assessed');
  assert.ok(data.diagnostics.some(d => d.code === 'READ_LIMIT'));
  assert.ok(data.diagnostics.some(d => d.code === 'SCAN_DEPTH'));
});
const runnerPackages = [['vitest', 'vitest'], ['jest', 'jest'], ['playwright', '@playwright/test'], ['playwright', 'playwright'], ['mocha', 'mocha'], ['ava', 'ava'], ['uvu', 'uvu'], ['cypress', 'cypress'], ['web-test-runner', '@web/test-runner'], ['jasmine', 'jasmine'], ['tap', 'tap']];
const gameLibraries = ['phaser', 'three', 'pixi.js', '@babylonjs/core', 'babylonjs', 'excalibur', 'kaplay', 'kaboom', 'playcanvas', 'matter-js', 'planck', 'howler'];
test('all eleven runner packages are observed without claiming their tests ran', async (t) => {
  const { root, write } = await fixture(t);
  for (const [name, pkg] of runnerPackages) {
    await write('package.json', { devDependencies: { [pkg]: '^1.2.3' } });
    const { data } = await detectWeb(root);
    assert.deepEqual(data.testRunners, [{ name, source: `devDependencies.${pkg}, but no test script runs it` }]);
  }
});
test('two-level script indirection, placeholders and other commands preserve runner distinctions', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': { scripts: { test: 'npm run first', first: 'yarn run second', second: 'vitest && playwright test' }, devDependencies: { jest: '1.0.0' } } });
  let { data } = await detectWeb(root);
  assert.deepEqual(data.testRunners.map(r => r.name), ['vitest', 'playwright']);
  await write('package.json', { scripts: { test: 'node custom.js' }, devDependencies: { jest: '1.0.0' } });
  ({ data } = await detectWeb(root));
  assert.equal(data.testRunners[0].name, 'other');
  await write('package.json', { scripts: { test: 'echo "Error: no test specified" && exit 1' }, devDependencies: { jest: '1.0.0' } });
  ({ data } = await detectWeb(root));
  assert.equal(data.testRunners[0].name, 'jest');
  assert.equal(data.commands.test.command, null);
  await write('package.json', {});
  assert.equal((await detectWeb(root)).data.testRunners[0].name, 'none');
});
test('all game libraries preserve raw declared versions and dependency precedence', async (t) => {
  const { root } = await fixture(t, { 'package.json': { dependencies: Object.fromEntries(gameLibraries.map(p => [p, '^1.2.3'])), devDependencies: { phaser: '2.0.0' } } });
  const { data } = await detectWeb(root);
  assert.deepEqual(data.libraries.map(l => [l.package, l.version]), gameLibraries.map(p => [p, '^1.2.3']));
  assert.equal(data.libraries[0].source, 'dependencies.phaser');
});
test('all manager lock variants use only matching frozen install commands', async (t) => {
  const { root, write } = await fixture(t);
  for (const [lock, pm, expected] of [['package-lock.json', 'npm', 'npm ci'], ['npm-shrinkwrap.json', 'npm', 'npm ci'], ['pnpm-lock.yaml', 'pnpm', 'pnpm install --frozen-lockfile'], ['yarn.lock', 'yarn', 'yarn install --frozen-lockfile'], ['bun.lock', 'bun', 'bun install --frozen-lockfile'], ['bun.lockb', 'bun', 'bun install --frozen-lockfile']]) {
    await write('package.json', { scripts: { serve: 'serve', test: 'node test.js', smoke: 'smoke' } });
    await write(lock, '');
    const { data } = await detectWeb(root);
    assert.equal(data.packageManager.name, pm);
    assert.equal(data.commands.install.command, expected);
    assert.equal(data.commands.run.command, `${pm} run serve`);
    assert.equal(data.commands.test.command, pm === 'bun' ? 'bun run test' : `${pm} test`);
    assert.equal(data.commands.smoke.command, `${pm} run smoke`);
    await rm(join(root, lock));
  }
  await write('package-lock.json', '');
  await write('npm-shrinkwrap.json', '');
  assert.equal((await detectWeb(root)).data.packageManager.name, 'npm');
  assert.equal((await detectWeb(root, { packageManager: 'pnpm' })).data.commands.install.command, null);
});
test('all bundler package families and Bun build remain observable with script provenance', async (t) => {
  const { root, write } = await fixture(t);
  for (const [name, pkg, word] of [['Vite', 'vite', 'vite'], ['webpack', 'webpack', 'webpack-dev-server'], ['Parcel', 'parcel', 'parcel'], ['Parcel', 'parcel-bundler', 'parcel'], ['esbuild', 'esbuild', 'esbuild'], ['Rspack', '@rspack/core', 'rspack'], ['Rspack', '@rspack/cli', 'rspack']]) {
    await write('package.json', { optionalDependencies: { [pkg]: '1.2.3' }, scripts: { build: 'npm run compile', compile: word } });
    const { data } = await detectWeb(root);
    assert.equal(data.bundlers[0].name, name);
    assert.equal(data.bundlers[0].package, pkg);
    assert.equal(data.bundlers[0].scriptSource, 'scripts.build');
  }
  await write('package.json', { scripts: { build: 'bun build index.ts', dev: 'vite' }, dependencies: { vite: '1.2.3' } });
  const { data } = await detectWeb(root);
  assert.equal(data.bundlers[0].name, 'Bun');
  assert.equal(data.engineVersion.value, null);
});
test('all nonexact dependency expressions remain observations rather than manufactured pins', async (t) => {
  const { root, write } = await fixture(t);
  for (const version of ['~7.1.0', '>=7.1.0', '7', '7.1', '7.1.x', '7.1.0 || 8.0.0', '1.0.0 - 2.0.0', 'latest', 'workspace:*', 'file:../vite', 'npm:other@1.2.3', 'git+https://example.invalid/vite', 'v7.1.0']) {
    await write('package.json', { dependencies: { vite: version } });
    const { data } = await detectWeb(root);
    assert.equal(data.engineVersion.declared, version);
    assert.equal(data.engineVersion.value, null, version);
  }
  await write('package.json', { dependencies: { vite: '7.1.0-beta.1+local' } });
  assert.equal((await detectWeb(root)).data.engineVersion.value, '7.1.0-beta.1+local');
});
test('malformed structures and invalid UTF8 do not degrade to empty successful observations', async (t) => {
  const { root, write } = await fixture(t);
  for (const body of ['[]', 'null', '42', '{"scripts":[]}', '{"scripts":{"build":7}}', '{"dependencies":{"vite":null}}', '{"packageManager":[]}']) {
    await write('package.json', body);
    await assert.rejects(detectWeb(root), { code: 'INVALID_CONFIG' });
  }
  await writeFile(join(root, 'package.json'), Buffer.from([0xff]));
  await assert.rejects(detectWeb(root), { code: 'INVALID_CONFIG' });
  await write('package.json', ' '.repeat(1024 * 1024 + 1));
  await assert.rejects(detectWeb(root), { code: 'READ_LIMIT' });
});
test('installed malformed metadata cannot override an exact declaration and installed symlinks are not followed', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': { dependencies: { vite: '^7.1.0' } }, 'node_modules/vite/package.json': '{bad' });
  let { data } = await detectWeb(root);
  assert.equal(data.engineVersion.value, null);
  assert.ok(data.diagnostics.some(d => d.code === 'INVALID_CONFIG'));
  await rm(join(root, 'node_modules/vite'), { recursive: true });
  const outside = await fixture(t, { 'package.json': { version: '7.9.9' } });
  await symlink(outside.root, join(root, 'node_modules/vite'), process.platform === 'win32' ? 'junction' : 'dir');
  ({ data } = await detectWeb(root));
  assert.equal(data.engineVersion.resolved, null);
  assert.ok(data.diagnostics.some(d => d.code === 'UNSAFE_PATH'));
});
test('test root priority, flat candidates and case sensitive source directory match', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': {}, 'SRC/game.js': '', 'game.js': '', 'webpack.config.js': '', 'e2e/setup.js': '', 'checks/a.spec.js': '', 'another/b.test.js': '', '__tests__/plain.js': '' });
  let { data } = await detectWeb(root);
  assert.equal(data.files.codeRoot, null);
  assert.deepEqual(data.files.codeRootCandidates, ['.', 'SRC']);
  assert.equal(data.files.testRoot.path, '__tests__');
  assert.equal(data.files.testCount, 3);
  await write('test/a.js', '');
  assert.equal((await detectWeb(root)).data.files.testRoot.path, 'test');
  await write('tests/a.js', '');
  assert.equal((await detectWeb(root)).data.files.testRoot.path, 'tests');
  assert.equal((await detectWeb(root)).data.files.testRoot.mode, 'table');
});
test('language respects config, then dependency, then actual sources', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': { devDependencies: { typescript: '^5.0.0' } }, 'src/app.js': '' });
  assert.equal((await detectWeb(root)).data.language.source, 'devDependencies.typescript');
  await write('tsconfig.json', '{}');
  assert.equal((await detectWeb(root)).data.language.source, 'tsconfig.json');
});
test('workspace observations cover package arrays, object layouts and pnpm without choosing an app', async (t) => {
  const { root, write } = await fixture(t);
  for (const workspaces of [['packages/*'], { packages: ['apps/*'] }, []]) {
    await write('package.json', { workspaces });
    const { data } = await detectWeb(root);
    assert.equal(data.workspaces.present, true);
    assert.equal(data.qualityAssessed, false);
  }
  await write('package.json', {});
  await write('pnpm-workspace.yaml', 'packages:\n  - apps/*\n');
  assert.equal((await detectWeb(root)).data.workspaces.present, true);
});
test('hook excludes test files and test directories; source assignment does not imply execution', async (t) => {
  const { root, write } = await fixture(t, { 'package.json': {}, '__tests__/setup.js': 'window.game = fake;', 'src/a.spec.ts': 'globalThis.game = fake;', 'src/real.js': 'const f = window.game => 1;' });
  assert.equal((await detectWeb(root)).data.hook.state, 'absent');
  await write('src/real.js', '(window as any).game = actual;');
  assert.equal((await detectWeb(root)).data.hook.path, 'src/real.js');
});
test('read-only scans preserve file bytes and mtime including ignored trees', async (t) => {
  const { root } = await fixture(t, { 'package.json': { scripts: { build: 'touch unexpected' }, dependencies: { vite: '7.1.0' } }, 'src/game.js': 'window.game = game;', 'dist/generated.js': '', 'node_modules/vite/package.json': { version: '7.1.1' } });
  const paths = ['package.json', 'src/game.js', 'dist/generated.js', 'node_modules/vite/package.json'];
  const snapshot = async () => Promise.all(paths.map(async (p) => [p, (await readFile(join(root, p))).toString('base64'), (await lstat(join(root, p))).mtimeMs]));
  const before = await snapshot();
  await detectWeb(root);
  await detectWeb(root);
  assert.deepEqual(await snapshot(), before);
  assert.ok(!(await readdir(root)).includes('unexpected'));
});
const wrapper = new URL('../resources/studio/scripts/web-detect.mjs', import.meta.url);
const cli = (...args) => spawnSync(process.execPath, [fileURLToPath(wrapper), ...args], { encoding: 'utf8' });
test('installed-layout wrapper observes JSON and TSV without a top-level CLI registration', async (t) => {
  const { root } = await fixture(t, { 'package.json': { scripts: { build: 'vite build' }, dependencies: { vite: '7.1.0' } }, 'src/game.js': 'window.game = game;' });
  let result = cli('--project', root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).engineVersion.value, '7.1.0');
  result = cli('--project', root, '--text');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, formatWebDetection((await detectWeb(root)).data));
  assert.equal(cli('--help').status, 0);
  assert.match(cli('--help').stdout, /read.only/i);
});
test('wrapper preserves usage, absent package, malformed and unsafe exit codes', async (t) => {
  const { root, write } = await fixture(t);
  let r = cli('--project', root);
  assert.equal(r.status, 3);
  assert.equal(JSON.parse(r.stdout).qualityAssessed, false);
  for (const args of [[], ['--project'], ['--project', root, '--pm', 'bad'], ['--project', root, '--project', root], ['--project', root, '--text', '--text'], ['--project', root, '--install']]) {
    r = cli(...args);
    assert.equal(r.status, 2, JSON.stringify(args));
    if (args.includes('--text'))
      assert.match(r.stderr, /web-detect:/);
    else
      assert.equal(JSON.parse(r.stdout).status, 'not_assessed');
  }
  await write('package.json', '{broken');
  assert.equal(cli('--project', root).status, 1);
  r = cli('--project', root, '--text');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /web-detect:/);
  const outside = await fixture(t, { 'package.json': { version: '1.0.0' } });
  await rm(join(root, 'package.json'));
  await symlink(outside.root, join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  // Metadata under a symlink must be rejected, not observed as a resolved version.
  await write('package.json', { dependencies: { vite: '^1.0.0' } });
  await mkdir(join(root, 'node_modules'));
  await symlink(outside.root, join(root, 'node_modules/vite'), process.platform === 'win32' ? 'junction' : 'dir');
  r = cli('--project', root);
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).engineVersion.value, null);
  assert.ok(JSON.parse(r.stdout).diagnostics.some(d => d.code === 'UNSAFE_PATH'));
});
test('wrapper rejects unsafe critical metadata rather than following directory junctions', async (t) => {
  const { root } = await fixture(t);
  const outside = await fixture(t, { 'data': 'private' });
  await symlink(outside.root, join(root, 'package.json'), process.platform === 'win32' ? 'junction' : 'dir');
  const r = cli('--project', root);
  assert.equal(r.status, 4);
  assert.equal(JSON.parse(r.stdout).error.code, 'UNSAFE_PATH');
  assert.equal(cli('--project', join(root, 'missing')).status, 1);
});
test('TSV carries incomplete scan diagnostics and escapes embedded script delimiters', async (t) => {
  const { root } = await fixture(t, { 'package.json': { scripts: { build: 'echo "one\ttwo\nthree"' } }, 'src/large.js': ' '.repeat(1024 * 1024 + 1) });
  const { data } = await detectWeb(root);
  const tsv = formatWebDetection(data);
  assert.match(tsv, /scan\tincomplete/);
  assert.match(tsv, /diagnostic\tREAD_LIMIT/);
  assert.match(tsv, /one\\ttwo\\nthree/);
});
test('incomplete scans cannot silently establish JavaScript or absent roots', async (t) => {
  const { root } = await fixture(t, { 'package.json': {}, [Array(34).fill('deep').join('/') + '/main.ts']: 'window.game = fake;' });
  const { data } = await detectWeb(root);
  assert.equal(data.language.name, 'Unknown');
  assert.match(formatWebDetection(data), /code_root\t-\tsrc\/ not observed \(incomplete scan\)/);
  assert.match(data.files.testRoot.reason, /incomplete scan/);
});
test('total source read limit bounds accumulated work without claiming hook absence', async (t) => {
  const files = { 'package.json': {} };
  for (let i = 0; i < 17; i++)
    files[`src/${String(i).padStart(2, '0')}.js`] = ' '.repeat(1024 * 1024);
  const { root } = await fixture(t, files);
  const { data } = await detectWeb(root);
  assert.equal(data.scan.sourceBytes, 16 * 1024 * 1024);
  assert.equal(data.scan.complete, false);
  assert.ok(data.diagnostics.some(d => d.code === 'SCAN_BYTES'));
  assert.equal(data.hook.state, 'not_assessed');
});
test('entry budget stops traversal and reports partial observations rather than silently truncating', async (t) => {
  const { root } = await fixture(t, { 'package.json': {}, 'src/main.js': '' });
  await mkdir(join(root, 'many'));
  for (let base = 0; base < 20001; base += 200)
    await Promise.all(Array.from({ length: Math.min(200, 20001 - base) }, (_, offset) => writeFile(join(root, 'many', String(base + offset)), '')));
  const { data } = await detectWeb(root);
  assert.equal(data.scan.complete, false);
  assert.equal(data.scan.entries, 20001);
  assert.ok(data.diagnostics.some(d => d.code === 'SCAN_ENTRIES'));
  assert.equal(data.hook.state, 'not_assessed');
});
test('absent workspace and version declarations have no invented provenance', async (t) => {
  const { root } = await fixture(t, { 'package.json': { scripts: { build: 'bun build src/main.js' } } });
  const { data } = await detectWeb(root);
  assert.deepEqual(data.workspaces, { present: false, evidence: null });
  assert.equal(data.engineVersion.declared, null);
  assert.equal(data.engineVersion.declaredSource, null);
});
