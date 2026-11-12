import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const { readSettings } = await import('../dist/config.js');
async function fixture(t, project = '{}', local) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio derived settings ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), project);
  if (local) await writeFile(join(root, 'project.local.yaml'), local);
  return root;
}

test('gate defaults distinguish story config review from smoke-check blocking without defaulting stored strictness', async t => {
  const root = await fixture(t);
  const { settings } = await readSettings(root, ['gate_level']);
  assert.deepEqual(Object.keys(settings), ['gate_level']);
  assert.deepEqual(settings.gate_level.value.logic, { level: 'blocking', source: 'default' });
  assert.deepEqual(settings.gate_level.value.config, { level: 'advisory', source: 'default', smokeCheck: 'blocking' });
  assert.equal((await readSettings(root, ['testing.strict.logic'])).settings['testing.strict.logic'].value, null);
});

test('gate levels preserve local and legacy strictness provenance, including explicit false', async t => {
  const root = await fixture(t, 'testing:\n  strict: true\n', 'testing:\n  strict:\n    logic: false\n    config: false\n    visual: invalid\n');
  const { settings, warnings } = await readSettings(root, ['gate_level']);
  assert.deepEqual(settings.gate_level.value.logic, { level: 'advisory', source: 'project.local.yaml' });
  assert.deepEqual(settings.gate_level.value.visual, { level: 'blocking', source: 'project.yaml:testing.strict' });
  assert.deepEqual(settings.gate_level.value.config, { level: 'advisory', source: 'project.local.yaml', smokeCheck: 'advisory' });
  assert.ok(warnings.some(w => /testing.strict.visual/.test(w)));
  assert.equal((await readSettings(root, ['testing.strict.unknown'])).settings['testing.strict.unknown'].value, null);
});

test('review gates follow full, lean and solo modes with rigor and local precedence', async t => {
  const root = await fixture(t, 'modes:\n  rigor: standard\n');
  let result = (await readSettings(root, ['review_gate'])).settings.review_gate;
  assert.deepEqual(result.value, { skillGates: 'skip', phaseGates: 'run', reviewMode: 'lean' });
  assert.equal(result.source, 'rigor:standard');
  await writeFile(join(root, 'project.local.yaml'), 'modes:\n  review_mode: full\n');
  result = (await readSettings(root, ['review_gate'])).settings.review_gate;
  assert.deepEqual(result.value, { skillGates: 'run', phaseGates: 'run', reviewMode: 'full' });
  assert.equal(result.source, 'project.local.yaml');
  await writeFile(join(root, 'project.local.yaml'), 'modes:\n  review_mode: solo\n');
  assert.deepEqual((await readSettings(root, ['review_gate'])).settings.review_gate.value,
    { skillGates: 'skip', phaseGates: 'skip', reviewMode: 'solo' });
});

test('engine values combine explicit fields and legacy preferences without inventing a default engine', async t => {
  const root = await fixture(t, 'engine:\n  version: "4.8"\n');
  assert.equal((await readSettings(root, ['engine_values'])).settings.engine_values.value.name.value, null);
  await mkdir(join(root, 'docs'));
  await writeFile(join(root, 'docs/technical-preferences.md'), '- **Engine**: Godot 4.7\n- **Language**: GDScript\n');
  const { settings } = await readSettings(root, ['engine_values', 'engine.version']);
  assert.deepEqual(settings.engine_values.value.name, { value: 'Godot', source: 'docs/technical-preferences.md' });
  assert.deepEqual(settings.engine_values.value.version, { value: '4.8', source: 'project.yaml' });
  assert.deepEqual(settings.engine_values.value.language, { value: 'GDScript', source: 'docs/technical-preferences.md' });
  assert.deepEqual(Object.keys(settings).sort(), ['engine.version', 'engine_values']);
});

test('performance summaries retain unset budgets and reject locally shadowing committed budgets', async t => {
  const root = await fixture(t, 'performance:\n  target_framerate: 60\n  draw_call_limit: 0\n', 'performance:\n  target_framerate: 120\n');
  const { settings, warnings } = await readSettings(root, ['perf_budgets']);
  assert.deepEqual(settings.perf_budgets.value.target_framerate, { value: 60, source: 'project.yaml' });
  assert.deepEqual(settings.perf_budgets.value.draw_call_limit, { value: 0, source: 'project.yaml' });
  assert.deepEqual(settings.perf_budgets.value.memory_ceiling_mb, { value: null, source: 'unset' });
  assert.ok(warnings.some(w => /not locally overridable/.test(w)));
});
