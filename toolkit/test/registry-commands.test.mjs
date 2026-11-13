import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { registryCommand } from '../dist/registry.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-registry-command-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, text) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  const run = (...args) => registryCommand(root, args, root);
  return { root, write, run };
}
const tr = 'requirements:\n- id: TR-combat-001\n  gdd: design/gdd/combat.md\n  status: deprecated\n- id: TR-combat-010\n  gdd: design/gdd/combat.md\n  status: "superseded-by: TR-combat-011, TR-combat-012"\n- id: TR-combat-ai-900\n  status: active\n';

test('list/get/refs/slice share complete entries, exact system scope and cited story locations', async t => {
  const { write, run } = await fixture(t);
  await write('docs/architecture/tr-registry.yaml', tr);
  await write('production/epics/e/story-001.md', 'TR-combat-001 TR-combat-001\nxTR-combat-001 TR-combat-001x\n');
  assert.deepEqual((await run('list', '--system', 'combat')).data.entries.map(e => e.name), ['TR-combat-001', 'TR-combat-010']);
  assert.equal((await run('get', 'TR-combat-001', 'unknown')).exitCode, 3);
  const slice = (await run('slice', './design/gdd/combat.md')).data;
  assert.equal(slice.entries.length, 2); assert.ok(slice.entries[0].raw.includes('status: deprecated'));
  const refs = (await run('refs', 'TR-combat-001')).data.references;
  assert.deepEqual(refs.map(r => [r.how, r.path, r.line]), [['gdd', 'design/gdd/combat.md', 3], ['cited', 'production/epics/e/story-001.md', 1], ['cited', 'production/epics/e/story-001.md', 1]]);
  assert.equal((await run('refs', 'design/gdd/combat.md')).data.references.length, 2);
});

test('validate reports duplicate names, invalid statuses, absent paths and unknown TR citations without approving them', async t => {
  const { write, run } = await fixture(t);
  await write('design/registry/entities.yaml', 'entities:\n  - name: health\n    status: invented\n    source: missing.md\n  - name: health\n    status: deprecated\n    source: design\nitems:\n  - name: health\n    status: active\n');
  await write('docs/architecture/tr-registry.yaml', tr);
  await write('production/epics/e/story-001.md', 'TR-combat-001 TR-unknown-001\n');
  const result = await run('validate');
  assert.equal(result.exitCode, 0); assert.equal(result.data.qualityAssessed, false);
  assert.deepEqual(result.data.diagnostics.map(d => d.code).sort(), ['DUPLICATE', 'PATH_MISSING', 'PATH_MISSING', 'PATH_MISSING', 'STATUS', 'TR_UNKNOWN'].sort());
  assert.equal(result.data.diagnostics.find(d => d.code === 'TR_UNKNOWN').name, 'TR-unknown-001');
  assert.equal(result.data.diagnostics.filter(d => d.code === 'DUPLICATE').length, 1);
  await write('docs/architecture/tr-registry.yaml', 'requirements: bad\n');
  const malformed = await run('validate');
  assert.equal(malformed.exitCode, 0); assert.ok(malformed.data.diagnostics.some(d => d.code === 'LAYOUT'));
  assert.equal(malformed.data.diagnostics.some(d => d.code === 'TR_UNKNOWN'), false);
  assert.equal((await run('list')).exitCode, 4);
});

test('compare distinguishes removal, changed invalid status, prior findings and unknown sides', async t => {
  const { root, write, run } = await fixture(t);
  const old = 'entities:\n  - name: health\n    status: invalid-old\n  - name: damage\n    status: active\n';
  const now = 'entities:\n  - name: health\n    status: invalid-old\n  - name: shield\n    status: invalid-new\n';
  await write('old.yaml', old); await write('new.yaml', now);
  const compared = await run('compare', 'entities', 'old.yaml', 'new.yaml');
  assert.equal(compared.data.removed, 1);
  assert.deepEqual(compared.data.diagnostics.map(d => [d.code, d.name]), [['REMOVED', 'damage'], ['STATUS', 'shield']]);
  assert.equal((await run('compare', 'entities', 'old.yaml', 'absent.yaml')).data.removed, null);
  assert.equal((await run('compare', 'entities', 'absent.yaml', 'new.yaml')).data.removed, 0);
  assert.equal(await readFile(join(root, 'old.yaml'), 'utf8'), old);
  assert.equal(await readFile(join(root, 'new.yaml'), 'utf8'), now);
});

test('next-id counts highest observed identity including deprecated IDs without reserving it', async t => {
  const { write, run } = await fixture(t);
  await write('docs/architecture/tr-registry.yaml', tr);
  await write('docs/architecture/adr-0012-archived.md', '# Superseded');
  await write('production/qa/bugs/BUG-0007-fixed.md', '');
  await write('production/epics/combat/story-004.md', '');
  await write('production/sprints/sprint-009.md', '');
  await write('production/sprints/sprint-099-retrospective.md', '');
  await write('design/live-ops/seasons/S3_spring.md', '');
  await write('design/assets/asset-manifest.md', 'ASSET-004 XASSET-999 ASSET-999x');
  await write('design/assets/specs/thing.md', 'ASSET-008 ASSET-004');
  await write('docs/tech-debt-register.md', 'TD-003 TD-003');
  for (const [args, expected] of [[['tr', 'combat'], 'TR-combat-011'], [['adr'], 'ADR-0013'], [['bug'], 'BUG-0008'], [['story', 'combat'], 'story-005'], [['sprint'], 'sprint-010'], [['season'], 'S4'], [['asset'], 'ASSET-009'], [['td'], 'TD-004']]) {
    const result = await run('next-id', ...args); assert.equal(result.exitCode, 0); assert.equal(result.data.next.id, expected);
    assert.equal((await run('next-id', ...args)).data.next.id, expected);
  }
  assert.equal((await run('next-id', 'tr', 'new')).data.next.id, 'TR-new-001');
});

test('usage, unsafe references and source parity remain observable', async t => {
  const { root, write, run } = await fixture(t);
  for (const args of [[], ['list', 'bad'], ['list', 'entities', '--system', 'combat'], ['next-id', 'tr', '../escape'], ['validate', 'extra']]) await assert.rejects(run(...args));
  await write('design/registry/entities.yaml', 'entities:\n  - name: health\n    source: ../outside.md\n');
  assert.equal((await run('validate')).data.diagnostics[0].code, 'PATH_UNSAFE');
  await write('docs/architecture/tr-registry.yaml', tr);
  // Independent retained Bash implementation is an optional local parity oracle,
  // not a prerequisite for portable runtime operation.
  const source = fileURLToPath(new URL('../../.claude/scripts/registry.sh', import.meta.url));
  const available = spawnSync('bash', ['--version'], { encoding: 'utf8' });
  if (available.status !== 0 || process.platform === 'win32') { t.diagnostic('Upstream Bash parity unavailable; portable assertions above ran.'); return; }
  const old = spawnSync('bash', [source, '--root', root, 'list', '--system', 'combat'], { encoding: 'utf8' });
  assert.equal(old.status, 0, old.stderr);
  const oldRows = old.stdout.split('\n').filter(line => line.startsWith('ENTRY\t')).map(line => { const cells = line.split('\t'); return [cells[1], cells[2], cells[3], cells[4], cells[5], cells[6], Number(cells[7])]; });
  assert.deepEqual((await run('list', '--system', 'combat')).data.entries.map(e => [e.registry, e.section, e.key, e.name, e.fields.status, e.fields.gdd, e.line]), oldRows);
});
