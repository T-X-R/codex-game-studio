import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { planEngineScaffold } from '../dist/engine-scaffold.js';
import { applyInstall } from '../dist/install.js';
const config = 'project:\n  name: Web Test\nengine:\n  name: Web\n  version: "8.3.4"\n  language: TypeScript\n';
async function fixture(t, files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'studio web scaffold 检测 '));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries({ 'project.yaml': config, ...files })) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}
const changed = plan => plan.changes.filter(c => c.before !== c.after);
test('four explicit starters produce complete guarded plans without installs or implicit writes', async (t) => {
  for (const starter of ['none', 'three', 'phaser', 'pixi']) {
    const root = await fixture(t);
    const result = await planEngineScaffold(root, { starter });
    assert.equal(result.outcome.state, 'planned');
    assert.equal(result.starter.name, starter);
    assert.equal(result.verification.state, 'not_assessed');
    assert.equal(result.runtime.version, process.versions.node);
    assert.equal(changed(result.plan).length, 14);
    assert.deepEqual(await readdir(root), ['project.yaml']);
    assert.ok(result.plan.changes.some(c => c.path === 'project.yaml' && c.before === c.after));
    await applyInstall(result.plan);
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
    assert.equal(pkg.name, 'web-game');
    assert.equal(pkg.devDependencies.vite, '8.3.4');
    assert.equal(pkg.name, lock.packages[''].name);
    const library = { three: 'three', phaser: 'phaser', pixi: 'pixi.js' }[starter];
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}), library ? [library] : []);
    assert.ok((await readFile(join(root, 'tests/integration/boot.spec.ts'), 'utf8')).includes('same seed repeats'));
    assert.ok((await readFile(join(root, 'tests/unit/rules.test.ts'), 'utf8')).includes('keeps the square inside'));
    assert.ok(!(await readdir(root)).includes('node_modules'));
    assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), config);
    await assert.rejects(planEngineScaffold(root, { starter }), { code: 'EXISTING_WEB_PROJECT' });
  }
});
test('a missing starter is an unanswered choice and Web options cannot silently affect Godot', async (t) => {
  const root = await fixture(t);
  const result = await planEngineScaffold(root);
  assert.equal(result.outcome.state, 'not_assessed');
  assert.deepEqual(result.choices, ['none', 'three', 'phaser', 'pixi']);
  assert.deepEqual(result.plan.changes, []);
  for (const starter of ['', '../three', 'unknown'])
    await assert.rejects(planEngineScaffold(root, { starter }), { code: 'INVALID_ARGUMENT' });
  const godot = await fixture(t, { 'project.yaml': 'engine:\n  name: Godot\n  version: "4.7.2"\n  rendering: Compatibility\n' });
  for (const options of [{ starter: 'none' }, { title: 'No' }, { gitignore: true }])
    await assert.rejects(planEngineScaffold(godot, options), { code: 'INVALID_ARGUMENT' });
});
test('title HTML is escaped once, replacement tokens remain literal, and explicit title wins', async (t) => {
  const root = await fixture(t);
  const title = 'Game </title><script>bad()</script> & "$&" @TITLE@';
  const { plan } = await planEngineScaffold(root, { starter: 'none', title });
  const html = plan.changes.find(c => c.path === 'index.html').after;
  assert.ok(html.includes('<title>Game &lt;/title&gt;&lt;script&gt;bad()&lt;/script&gt; &amp; "$&amp;" @TITLE@</title>'));
  assert.ok(!html.includes('<script>bad()'));
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
});
test('existing package, game targets and symlink ancestors refuse all scaffold changes', async (t) => {
  for (const [path, code] of [['package.json', 'EXISTING_WEB_PROJECT'], ['src/main.ts', 'FILE_CONFLICT'], ['tests/unit/rules.test.ts', 'FILE_CONFLICT']]) {
    const root = await fixture(t, { [path]: 'user content\r\n' });
    await assert.rejects(planEngineScaffold(root, { starter: 'three' }), { code });
    assert.equal(await readFile(join(root, path), 'utf8'), 'user content\r\n');
    if (path !== 'package.json')
      await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
  }
  const outside = await fixture(t);
  const root = await fixture(t);
  await symlink(outside, join(root, 'src'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(planEngineScaffold(root, { starter: 'none' }), { code: 'UNSAFE_PATH' });
  assert.deepEqual(await readdir(outside), ['project.yaml']);
});
test('gitignore changes require the flag, preserve existing bytes/newlines and append missing patterns only', async (t) => {
  const original = '# mine\r\nnode_modules/\r\ncustom/';
  const root = await fixture(t, { '.gitignore': original });
  const readOnly = await planEngineScaffold(root, { starter: 'none' });
  assert.ok(readOnly.gitignore.missing.includes('dist/'));
  assert.ok(!readOnly.gitignore.missing.includes('node_modules/'));
  assert.ok(!changed(readOnly.plan).some(c => c.path === '.gitignore'));
  assert.equal(await readFile(join(root, '.gitignore'), 'utf8'), original);
  const { plan } = await planEngineScaffold(root, { starter: 'none', gitignore: true });
  const ignore = plan.changes.find(c => c.path === '.gitignore');
  assert.ok(ignore.after.startsWith(original + '\r\n'));
  assert.equal((ignore.after.match(/node_modules\//g) ?? []).length, 1);
  assert.ok(!/(?<!\r)\n/.test(ignore.after));
  await applyInstall(plan);
  assert.equal(await readFile(join(root, '.gitignore'), 'utf8'), ignore.after);
  const complete = await fixture(t, { '.gitignore': ignore.after });
  const noop = await planEngineScaffold(complete, { starter: 'none', gitignore: true });
  assert.deepEqual(noop.gitignore.missing, []);
  assert.ok(!changed(noop.plan).some(c => c.path === '.gitignore'));
});
test('config, ignore or target appearing after planning fails before game writes', async (t) => {
  for (const path of ['project.yaml', '.gitignore', 'src/main.ts']) {
    const root = await fixture(t);
    const { plan } = await planEngineScaffold(root, { starter: 'pixi', gitignore: true });
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), 'changed concurrently');
    await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
    assert.equal(await readFile(join(root, path), 'utf8'), 'changed concurrently');
    await assert.rejects(readFile(join(root, 'package.json')), { code: 'ENOENT' });
  }
});
test('an incompatible or unresolved engine pin is not silently changed to the starter pin', async (t) => {
  for (const value of ['"7.3.1"', 'null', '"4.2.1"']) {
    const root = await fixture(t, { 'project.yaml': config.replace('"8.3.4"', value) });
    await assert.rejects(planEngineScaffold(root, { starter: 'phaser' }), { code: 'SCAFFOLD_CHOICE_CONFLICT' });
    assert.deepEqual(await readdir(root), ['project.yaml']);
  }
});
test('the installed command exposes only Web options on the existing engine scaffold route', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const root = await fixture(t, { '.gitignore': '# original\n' });
  const run = (...args) => spawnSync(process.execPath, [cli, 'engine', 'scaffold', '--project', root, '--json', ...args], { encoding: 'utf8' });
  let observed = run('--starter', 'three', '--title', 'Actual CLI <title>', '--gitignore', '--dry-run');
  assert.equal(observed.status, 0, observed.stdout + observed.stderr);
  let result = JSON.parse(observed.stdout);
  assert.equal(result.data.dryRun, true);
  assert.equal(result.data.starter.libraries.three, '0.186.1');
  assert.equal(result.data.starter.toolchain.vite, '8.3.4');
  assert.equal(result.data.verification.state, 'not_assessed');
  assert.equal(result.data.changes.filter(c => c.action === 'create').length, 13);
  assert.deepEqual((await readdir(root)).sort(), ['.gitignore', 'project.yaml']);
  observed = run('--starter', 'three', '--title', 'Actual CLI <title>', '--gitignore');
  assert.equal(observed.status, 0, observed.stdout + observed.stderr);
  result = JSON.parse(observed.stdout);
  assert.equal(result.data.outcome.state, 'created');
  assert.equal(result.data.verification.state, 'not_assessed');
  assert.match(await readFile(join(root, 'index.html'), 'utf8'), /<title>Actual CLI &lt;title&gt;<\/title>/);
  assert.ok(!(await readdir(root)).includes('node_modules'));
  observed = run('--starter', 'three');
  assert.equal(observed.status, 3);
  assert.equal(JSON.parse(observed.stdout).error.code, 'EXISTING_WEB_PROJECT');
});
test('title defaults follow project name then directory, and invalid title choices do not create a plan', async (t) => {
  const root = await fixture(t);
  const first = await planEngineScaffold(root, { starter: 'none' });
  assert.match(first.plan.changes.find(c => c.path === 'index.html').after, /<title>Web Test<\/title>/);
  const folder = await fixture(t, { 'project.yaml': 'engine:\n  name: Web\n  version: "8.3.4"\n' });
  const second = await planEngineScaffold(folder, { starter: 'none' });
  assert.ok(second.plan.changes.find(c => c.path === 'index.html').after.includes(folder.split(/[/\\]/).at(-1)));
  for (const title of ['', '  ', 'bad\0title'])
    await assert.rejects(planEngineScaffold(root, { starter: 'none', title }), { code: 'INVALID_ARGUMENT' });
});
test('gitignore BOM and LF are preserved; invalid UTF8 or directory destinations remain untouched', async (t) => {
  const original = '\uFEFF# owner\nnode_modules/\n';
  const root = await fixture(t, { '.gitignore': original });
  const { plan } = await planEngineScaffold(root, { starter: 'none', gitignore: true });
  await applyInstall(plan);
  const after = await readFile(join(root, '.gitignore'), 'utf8');
  assert.ok(after.startsWith(original));
  assert.ok(!after.includes('\r'));
  const binary = await fixture(t, { '.gitignore': Buffer.from([0xff, 0x0a]) });
  await assert.rejects(planEngineScaffold(binary, { starter: 'none', gitignore: true }), { code: 'FILE_CONFLICT' });
  assert.deepEqual(await readFile(join(binary, '.gitignore')), Buffer.from([0xff, 0x0a]));
  const directory = await fixture(t);
  await mkdir(join(directory, '.gitignore'));
  await assert.rejects(planEngineScaffold(directory, { starter: 'none' }), { code: 'FILE_CONFLICT' });
});
test('four package manifests preserve all direct pins and complete install paths', async (t) => {
  const paths = ['.gitignore', 'assets/provenance.yaml', 'data/config.json', 'index.html', 'package-lock.json', 'package.json', 'playwright.config.ts', 'src/game/rules.ts', 'src/hook.ts', 'src/main.ts', 'tests/integration/boot.spec.ts', 'tests/unit/rules.test.ts', 'tsconfig.json', 'vite.config.ts'].sort();
  for (const starter of ['none', 'three', 'phaser', 'pixi']) {
    const root = await fixture(t);
    const { plan } = await planEngineScaffold(root, { starter });
    assert.deepEqual(changed(plan).map(c => c.path).sort(), paths);
    const content = Object.fromEntries(plan.changes.map(c => [c.path, c.after]));
    const pkg = JSON.parse(content['package.json']), lock = JSON.parse(content['package-lock.json']);
    for (const section of ['dependencies', 'devDependencies']) {
      assert.deepEqual(pkg[section], lock.packages[''][section]);
      for (const [name, version] of Object.entries(pkg[section] ?? {}))
        assert.equal(lock.packages['node_modules/' + name].version, version);
    }
    assert.deepEqual(pkg.scripts, { dev: 'vite', build: 'tsc --noEmit && vite build', 'build:single': 'tsc --noEmit && vite build --mode single', test: 'npm run test:unit && npm run test:e2e', 'test:unit': 'vitest run', 'test:e2e': 'npm run build:single && playwright test', smoke: 'npm run build:single && playwright test --grep @boot' });
    assert.match(content['playwright.config.ts'], /GAME_STUDIO_BROWSER/);
    assert.doesNotMatch(content['playwright.config.ts'], /\.claude|PAGE_SHOT_BROWSER|spawnSync|webServer/);
    assert.match(content['tests/integration/boot.spec.ts'], /manual=1&seed=7/);
    assert.match(content['tests/integration/boot.spec.ts'], /g\.step\(60\)/);
    assert.match(content['src/hook.ts'], /window\.game = hook/);
  }
});
test('BOM-prefixed first ignore rule already exists and complete CRLF rules remain byte-identical',async t=>{
 const original='\uFEFFnode_modules/\r\ndist/\r\ndist-single/\r\n*.zip\r\n.vitest/\r\n/test-results/\r\n/playwright-report/\r\n';
 const root=await fixture(t,{'.gitignore':original});
 const {plan,gitignore}=await planEngineScaffold(root,{starter:'none',gitignore:true});
 assert.deepEqual(gitignore.missing,[]);assert.equal(gitignore.changed,false);
 assert.equal(plan.changes.find(c=>c.path==='.gitignore').after,original);
 await applyInstall(plan);assert.deepEqual(await readFile(join(root,'.gitignore')),Buffer.from(original));
});
test('ignore template uses a distributable resource name while target stays .gitignore',async t=>{
 const {resourceFiles}=await import('../dist/resources.js');const resources=await resourceFiles('studio/templates/web-setup');
 assert.equal(typeof resources['.gitignore.tmpl'],'string');assert.equal(Object.hasOwn(resources,'.gitignore'),false);
 const root=await fixture(t);const {plan}=await planEngineScaffold(root,{starter:'none'});
 assert.equal(plan.changes.find(c=>c.path==='.gitignore').after,resources['.gitignore.tmpl']);
 assert.equal(plan.changes.some(c=>c.path==='.gitignore.tmpl'),false);
});
