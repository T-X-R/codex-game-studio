import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { planConfigSet } from '../dist/config-write.js';
import { planEngineSetup } from '../dist/engine-setup.js';
import { verifyEngine } from '../dist/engine-verify.js';
import { readSettings } from '../dist/config.js';
import { applyInstall } from '../dist/install.js';
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
async function fixture(t, path) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio engine path 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), `engine:\n  name: Godot\n  version: "4.6.1"\n  language: GDScript\n${path === undefined ? '' : `  path: ${JSON.stringify(path)}\n`}commands:\n  run: 'original --literal $HOME'\n`);
  await writeFile(join(root, 'project.godot'), 'config_version=5\n');
  return root;
}
const selection = path => JSON.stringify({ engine: { name: 'Godot', version: '4.6.1', language: 'GDScript', code_root: 'src', test_root: 'tests', ...(path === undefined ? {} : { path }) } });

test('config set stores literal external editor paths, supports null, and leaves commands unchanged', async t => {
  const root = await fixture(t);
  for (const value of ['/Applications/Game Tools/Godot 测试', 'C:\\Game Tools\\Godot.exe', '~/bin/godot', '$(touch never-created); editor']) {
    await applyInstall((await planConfigSet(root, 'engine.path', value)).plan);
    assert.equal((await readSettings(root, ['engine.path'])).settings['engine.path'].value, value);
    assert.match(await readFile(join(root, 'project.yaml'), 'utf8'), /run: 'original --literal \$HOME'/);
    assert.equal((await planConfigSet(root, 'engine.path', value)).plan.changes.length, 0);
  }
  await applyInstall((await planConfigSet(root, 'engine.path', 'null')).plan);
  assert.equal((await readSettings(root, ['engine.path'])).settings['engine.path'].value, null);
});

test('path rejects empty/control-line input and local override without writing', async t => {
  const root = await fixture(t); const before = await readFile(join(root, 'project.yaml'));
  for (const value of ['', '   ', 'one\ntwo', 'one\rtwo', 'one\0two']) {
    await assert.rejects(planConfigSet(root, 'engine.path', value), { code: 'INVALID_ARGUMENT' });
    await assert.rejects(planEngineSetup(root, selection(value)), { code: 'INVALID_ARGUMENT' });
  }
  await assert.rejects(planConfigSet(root, 'engine.path', 'godot', true), /not locally overridable/);
  assert.deepEqual(await readFile(join(root, 'project.yaml')), before);
});

test('setup mirrors path, preserves omitted path, clears explicit null, and remains idempotent', async t => {
  const root = await fixture(t);
  await applyInstall((await planEngineSetup(root, selection('/Applications/Godot 测试'))).plan);
  assert.match(await readFile(join(root, 'docs/technical-preferences.md'), 'utf8'), /\*\*Engine Path\*\*: \/Applications\/Godot 测试/);
  assert.equal((await planEngineSetup(root, selection())).plan.changes.length, 0);
  assert.equal((await readSettings(root, ['engine.path'])).settings['engine.path'].value, '/Applications/Godot 测试');
  await applyInstall((await planEngineSetup(root, selection(null))).plan);
  assert.match(await readFile(join(root, 'docs/technical-preferences.md'), 'utf8'), /\*\*Engine Path\*\*: \[TO BE CONFIGURED\]/);
  assert.equal((await planEngineSetup(root, selection(null))).plan.changes.length, 0);
  assert.match(await readFile(join(root, 'project.yaml'), 'utf8'), /run: 'original --literal \$HOME'/);
});

test('verify dry-run selects invocation, then project path, then godot without any probe or writes', async t => {
  const root = await fixture(t, '~/Godot 测试/editor');
  const before = await readdir(root);
  assert.equal((await verifyEngine(root, 'evidence', { dryRun: true })).command.executable, '~/Godot 测试/editor');
  assert.equal((await verifyEngine(root, 'evidence', { executable: '/override path', dryRun: true })).command.executable, '/override path');
  assert.deepEqual(await readdir(root), before);
  for (const path of [undefined, null]) {
    const fallback = await fixture(t, path);
    assert.equal((await verifyEngine(fallback, 'evidence', { dryRun: true })).command.executable, 'godot');
  }
});

test('actual import uses configured executable and recorded argv without rewriting commands', async t => {
  const root = await fixture(t, process.execPath);
  const script = join(root, 'fake editor 测试.cjs');
  await writeFile(script, `const fs = require('node:fs'); const args = process.argv.slice(2); fs.appendFileSync('calls.jsonl', JSON.stringify(args)+'\\n'); if(args[0]==='--version') console.log('4.6.1.stable.official.fixture'); else if(args[0]==='--help') console.log('--import'); else console.log('imported');`);
  const result = await verifyEngine(root, 'evidence', { executableArgs: [script] });
  assert.equal(result.status, 'ok'); assert.equal(result.command.executable, process.execPath);
  assert.deepEqual((await readFile(join(root, 'calls.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse), [['--version'], ['--help'], ['--headless', '--path', root, '--import']]);
  assert.match(await readFile(join(root, 'project.yaml'), 'utf8'), /run: 'original --literal \$HOME'/);
});

test('stale and shell-looking paths report unavailable literally, never invoke a shell', async t => {
  const root = await fixture(t, '$(touch injected); no-such-editor');
  const result = await verifyEngine(root, 'evidence');
  assert.equal(result.exitCode, 3); assert.equal(result.status, 'not_assessed');
  assert.equal(result.command.executable, '$(touch injected); no-such-editor');
  assert.equal(result.checks.length, 1);
  await assert.rejects(readFile(join(root, 'injected')), { code: 'ENOENT' });
});

test('malformed configured path is rejected unless an explicit executable overrides it', async t => {
  for (const path of [42, ['godot'], { binary: 'godot' }, '', '   ', 'bad\npath', 'bad\rpath', 'bad\0path']) {
    const root = await fixture(t, path);
    const before = await readdir(root);
    await assert.rejects(verifyEngine(root, 'evidence'), { code: 'INVALID_ARGUMENT' });
    assert.deepEqual(await readdir(root), before);
    assert.equal((await verifyEngine(root, 'evidence', { executable: 'override', dryRun: true })).command.executable, 'override');
  }
});

test('CLI JSON config set and verify dry-run expose the stored and overridden executable', async t => {
  const root = await fixture(t);
  const run = args => spawnSync(process.execPath, [cli, ...args, '--project', root, '--json'], { encoding: 'utf8' });
  const set = run(['config', 'set', 'engine.path', '/missing/Godot editor']);
  assert.equal(set.status, 0, set.stdout + set.stderr);
  const before = await readdir(root);
  const result = run(['engine', 'verify', '--output', 'evidence', '--dry-run']);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).data.command.executable, '/missing/Godot editor');
  const override = run(['engine', 'verify', '--output', 'evidence', '--dry-run', '--executable', 'explicit']);
  assert.equal(JSON.parse(override.stdout).data.command.executable, 'explicit');
  assert.deepEqual(await readdir(root), before);
});


test('CLI setup dry-run plans both records without launching or writing, then applies the same path', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'selection.json'), selection('~/missing/editor'));
  const before = await readFile(join(root, 'project.yaml'));
  const run = args => spawnSync(process.execPath, [cli, 'engine', 'setup', '--input', 'selection.json', '--project', root, '--json', ...args], { encoding: 'utf8' });
  const dry = run(['--dry-run']);
  assert.equal(dry.status, 0, dry.stdout + dry.stderr);
  assert.equal(JSON.parse(dry.stdout).data.dryRun, true);
  assert.equal(JSON.parse(dry.stdout).data.execution.state, 'not_assessed');
  assert.deepEqual(await readFile(join(root, 'project.yaml')), before);
  await assert.rejects(readFile(join(root, 'docs/technical-preferences.md')), { code: 'ENOENT' });
  const applied = run([]);
  assert.equal(applied.status, 0, applied.stdout + applied.stderr);
  assert.equal((await readSettings(root, ['engine.path'])).settings['engine.path'].value, '~/missing/editor');
  assert.match(await readFile(join(root, 'docs/technical-preferences.md'), 'utf8'), /Engine Path\*\*: ~\/missing\/editor/);
});
