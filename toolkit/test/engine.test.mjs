import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const { readSettings } = await import('../dist/config.js');
async function fixture(t, config, directories = []) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio engine paths ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), config);
  for (const path of directories) await mkdir(join(root, path), { recursive: true });
  return root;
}
async function row(root) { return (await readSettings(root, ['engine_row'])).settings.engine_row.value; }

test('each engine preserves its upstream roots and missing command capabilities', async t => {
  for (const [name, code, tests, assets] of [['Godot', 'src', 'tests', 'assets'], ['Web', 'src', 'tests', 'assets'],
    ['Unity', 'Assets', 'Assets/Tests', 'Assets'], ['Unreal', 'Source', null, 'Content']]) {
    const root = await fixture(t, `engine:\n  name: ${name}\n`, [code, ...(tests ? [tests] : []), assets]);
    const result = await row(root);
    assert.equal(result.engine.value, name);
    assert.equal(result.code_root.value, code);
    assert.equal(result.code_root.state, 'available');
    assert.equal(result.asset_root.value, assets);
    if (tests) assert.equal(result.test_root.value, tests);
    else assert.equal(result.test_root.state, 'not_assessed');
    if (name === 'Unity' || name === 'Unreal') assert.equal(result.commands.test, null);
    if (name === 'Web') assert.equal(result.commands.test, 'npm test');
  }
});

test('a bad explicit root is invalid and never falls back to the default engine folder', async t => {
  const root = await fixture(t, 'engine:\n  name: Web\n  code_root: typo\n', ['src']);
  const result = await row(root);
  assert.equal(result.code_root.state, 'invalid');
  assert.equal(result.code_root.value, 'typo');
  assert.equal(result.test_root.state, 'missing');
});

test('case mismatch, framework directories, traversal, absolute paths and symlink roots are invalid', async t => {
  const root = await fixture(t, '{}', ['Scripts', 'src', 'tests', 'toolkit']);
  await symlink(join(root, 'src'), join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  for (const value of ['scripts', 'toolkit', 'tests', '../escape', '/tmp', 'C:/outside', 'linked', 'src/../Scripts']) {
    await writeFile(join(root, 'project.yaml'), `engine:\n  name: Web\n  code_root: ${JSON.stringify(value)}\n`);
    assert.equal((await row(root)).code_root.state, 'invalid', value);
  }
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\n  code_root: ./Scripts/\n  test_root: tests\n');
  assert.equal((await row(root)).code_root.value, 'Scripts');
  assert.equal((await row(root)).test_root.state, 'available');
});

test('unknown engine does not guess a test root or code root when multiple candidates exist', async t => {
  const root = await fixture(t, '{}', ['src', 'assets', 'tests']);
  let result = await row(root);
  assert.equal(result.engine.value, null);
  assert.equal(result.code_root.value, 'src');
  assert.equal(result.code_root.source, 'detected');
  assert.equal(result.test_root.state, 'unset');
  await mkdir(join(root, 'Source'));
  result = await row(root);
  assert.equal(result.code_root.state, 'not_assessed');
  assert.equal(result.code_root.value, null);
});

test('local engine overrides are ignored, explicit roots beat table values and root dot is allowed', async t => {
  const root = await fixture(t, 'engine:\n  name: Web\n  code_root: .\n', ['Assets', 'Assets/Tests']);
  await writeFile(join(root, 'project.local.yaml'), 'engine:\n  name: Unity\n  code_root: Assets\n');
  const result = await row(root);
  assert.equal(result.engine.value, 'Web');
  assert.equal(result.code_root.value, '.');
  assert.equal(result.code_root.state, 'available');
  assert.ok(result.excluded_code_directories.includes('toolkit'));
});
