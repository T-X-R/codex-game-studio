import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { readSettings } from '../dist/config.js';
import { planConfigSet } from '../dist/config-write.js';
import { applyInstall } from '../dist/install.js';
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio path observation 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\n  version: null\n  language: JavaScript\n  code_root: .\n  test_root: tests\ncommands:\n  run: "original command"\n');
  return root;
}
function inspect(root, args) {
  const result = spawnSync(process.execPath, [cli, ...args, '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}

test('stored engine path appears with shared provenance in grouped config and actual engine inspect', async t => {
  const root = await fixture(t);
  const path = '/missing/Game Tools/编辑器';
  await applyInstall((await planConfigSet(root, 'engine.path', path)).plan);
  await writeFile(join(root, 'project.local.yaml'), 'engine:\n  path: ignored-local-editor\n');
  const before = await readFile(join(root, 'project.yaml'));
  const filesBefore = await readdir(root);
  const expected = { value: path, source: 'project.yaml' };
  const read = await readSettings(root, ['engine_values', 'engine.path']);
  assert.deepEqual(read.settings.engine_values.value.path, expected);
  assert.deepEqual(read.settings['engine.path'], expected);
  assert.ok(read.warnings.some(w => w.includes('engine.path') && w.includes('not locally overridable')));
  const grouped = inspect(root, ['config', 'get', 'engine_values']);
  assert.deepEqual(grouped.data.settings.engine_values.value.path, expected);
  const observed = inspect(root, ['engine', 'inspect']);
  assert.deepEqual(observed.data.engine.path, expected);
  assert.equal(observed.data.execution.state, 'not_assessed');
  assert.deepEqual(await readFile(join(root, 'project.yaml')), before);
  assert.deepEqual(await readdir(root), filesBefore);
});

test('missing and explicitly cleared engine paths stay unset in observation without inventing executable availability', async t => {
  const root = await fixture(t);
  for (const clear of [false, true]) {
    if (clear) await applyInstall((await planConfigSet(root, 'engine.path', 'null')).plan);
    const before = await readFile(join(root, 'project.yaml'));
    const read = await readSettings(root, ['engine_values']);
    assert.deepEqual(read.settings.engine_values.value.path, { value: null, source: 'unset' });
    const observed = inspect(root, ['engine', 'inspect']);
    assert.deepEqual(observed.data.engine.path, { value: null, source: 'unset' });
    assert.equal(observed.data.engine.version.value, null);
    assert.equal(observed.data.execution.state, 'not_assessed');
    assert.deepEqual(await readFile(join(root, 'project.yaml')), before);
  }
});
