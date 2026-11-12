import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { readRegistry } from '../dist/registry-reader.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-registry-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, content) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), content); };
  return { root, write };
}

test('registry parses complete nested values and exact references without scanning comments or block text', async t => {
  const { root, write } = await fixture(t);
  const source = '\uFEFFversion: 1\r\nentities:\r\n  - name: "玩家, HP"\r\n    status: active\r\n    source: design/gdd/health.md\r\n    fields: {max: 100, min: 0}\r\n    note: |\r\n      referenced_by:\r\n        - ignored.md\r\n    referenced_by:\r\n      - "design/gdd/combat, ui.md"\r\n      - docs/data.md\r\n# - name: ignored\r\n';
  await write('design/registry/entities.yaml', source);
  const result = await readRegistry(root, 'entities');
  assert.equal(result.state, 'read'); assert.equal(result.entries.length, 1);
  const entry = result.entries[0];
  assert.equal(entry.name, '玩家, HP'); assert.equal(entry.line, 3);
  assert.deepEqual(entry.fields.fields, { max: 100, min: 0 });
  assert.deepEqual(entry.refs.map(r => [r.how, r.path, r.line]), [['source', 'design/gdd/health.md', 5], ['referenced_by', 'design/gdd/combat, ui.md', 11], ['referenced_by', 'docs/data.md', 12]]);
  assert.ok(entry.raw.includes('note: |')); assert.deepEqual(result.diagnostics, []);
  assert.equal(await readFile(join(root, 'design/registry/entities.yaml'), 'utf8'), source);
});

test('empty and missing registries remain distinguishable, while malformed registries withhold all entries', async t => {
  const { root, write } = await fixture(t);
  assert.equal((await readRegistry(root, 'tr')).state, 'missing');
  await write('docs/architecture/tr-registry.yaml', 'requirements: []\n');
  assert.deepEqual((await readRegistry(root, 'tr')).entries, []);
  for (const source of ['requirements: [{id: TR-game-001}]\n', 'requirements:\n  - status: active\n    id: TR-game-001\n', 'requirements:\n  - id: TR-game-001\n    status: active\n    status: deprecated\n', 'requirements:\n - id: TR-game-001\n', 'requirements:\n  - id: TR-game-001\ninvalid: [\n']) {
    await write('docs/architecture/tr-registry.yaml', source);
    const result = await readRegistry(root, 'tr');
    assert.equal(result.state, 'layout', source); assert.deepEqual(result.entries, []);
    assert.ok(result.diagnostics.every(d => d.code === 'LAYOUT'));
  }
});

test('legacy architecture status is observed and warned without rewriting input or block scalars', async t => {
  const { root, write } = await fixture(t);
  const source = 'state_ownership:\n  - state: player\n    status: superseded_by: ADR-0012\n    adr: docs/architecture/adr-0001-player.md\n    notes: |\n      status: superseded_by: ADR-9999\n';
  await write('docs/registry/architecture.yaml', source);
  const result = await readRegistry(root, 'architecture');
  assert.equal(result.state, 'read'); assert.equal(result.entries[0].fields.status, 'superseded_by: ADR-0012');
  assert.equal(result.entries[0].fields.notes, 'status: superseded_by: ADR-9999\n');
  assert.deepEqual(result.diagnostics.map(d => [d.code, d.line]), [['UNQUOTED', 3]]);
  assert.equal(await readFile(join(root, 'docs/registry/architecture.yaml'), 'utf8'), source);
});

test('registry refuses unsafe input paths and symlinks instead of treating them as absent', async t => {
  const { root, write } = await fixture(t);
  await assert.rejects(readRegistry(root, 'entities', '../outside.yaml'));
  await write('other.yaml', 'entities: []\n');
  await mkdir(join(root, 'design/registry'), { recursive: true });
  await symlink(join(root, 'other.yaml'), join(root, 'design/registry/entities.yaml'));
  await assert.rejects(readRegistry(root, 'entities'));
});

test('project-defined section names do not inherit JavaScript object members', async t => {
  const { root, write } = await fixture(t);
  await write('design/registry/entities.yaml', 'constructor:\n  - key: custom\n    status: active\ntoString: []\n');
  const result = await readRegistry(root, 'entities');
  assert.equal(result.state, 'read'); assert.equal(result.entries[0].section, 'constructor');
  assert.equal(result.entries[0].name, 'custom');
});
