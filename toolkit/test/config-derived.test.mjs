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

test('input methods combine platform support and primary aliases exactly once', async t => {
  const root = await fixture(t, 'platform:\n  targets: [PC, Web]\n  gamepad_support: Partial\n  touch_support: FULL\n  primary_input: Controller\n',
    'platform:\n  primary_input: Voice\n');
  let result = (await readSettings(root, ['input_methods'])).settings.input_methods;
  assert.deepEqual(result.value, { methods: ['keyboard/mouse', 'gamepad', 'touch'], primary: 'Controller' });
  assert.equal(result.source, 'project.yaml:platform');
  for (const [input, expected] of [['Keyboard & Mouse', 'keyboard/mouse'], ['Joypad', 'gamepad'], ['Touchscreen', 'touch'], ['Motion', 'motion']]) {
    await writeFile(join(root, 'project.yaml'), `platform:\n  targets: []\n  primary_input: ${input}\n`);
    result = (await readSettings(root, ['input_methods'])).settings.input_methods;
    assert.deepEqual(result.value.methods, [expected]);
  }
});

test('legacy input methods only apply when the platform block is absent', async t => {
  const root = await fixture(t);
  let result = (await readSettings(root, ['input_methods'])).settings.input_methods;
  assert.deepEqual(result, { value: { methods: null, primary: null }, source: 'unset' });
  await mkdir(join(root, 'docs'));
  await writeFile(join(root, 'docs/technical-preferences.md'), '- **Input Methods**: Keyboard + Mouse, Gamepad, Controller\n- **Primary Input**: Gamepad\n');
  result = (await readSettings(root, ['input_methods'])).settings.input_methods;
  assert.deepEqual(result, { value: { methods: ['keyboard/mouse', 'gamepad'], primary: 'Gamepad' }, source: 'docs/technical-preferences.md' });
  for (const block of ['{}', 'null', '{targets: [], gamepad_support: None}']) {
    await writeFile(join(root, 'project.yaml'), `platform: ${block}\n`);
    assert.deepEqual((await readSettings(root, ['input_methods'])).settings.input_methods,
      { value: { methods: [], primary: null }, source: 'project.yaml:platform' });
  }
});

test('specialist summaries use engine primary and preserve explicit null and shared selections', async t => {
  const root = await fixture(t, 'engine:\n  name: Godot\nspecialists:\n  code: godot-csharp-specialist\n  shader: null\n  additional: [technical-artist]\n',
    'specialists:\n  code: ignored-specialist\n');
  await mkdir(join(root, 'docs'));
  await writeFile(join(root, 'docs/technical-preferences.md'), '- **Primary**: lead-programmer\n- **Shader Specialist**: godot-shader-specialist\n');
  const result = (await readSettings(root, ['specialists'])).settings.specialists.value;
  assert.deepEqual(result.primary, { value: 'godot-specialist', source: 'derived:engine.name' });
  assert.deepEqual(result.code, { value: 'godot-csharp-specialist', source: 'project.yaml' });
  assert.equal(result.shader.value, null);
  assert.deepEqual(result.additional.value, ['technical-artist']);
  for (const [engine, primary] of [['Web', 'lead-programmer'], ['Unity', 'unity-specialist'], ['Unreal', 'unreal-specialist']]) {
    await writeFile(join(root, 'project.yaml'), `engine:\n  name: ${engine}\n`);
    assert.equal((await readSettings(root, ['specialists'])).settings.specialists.value.primary.value, primary);
  }
  await writeFile(join(root, 'project.yaml'), '{}');
  const fallback = (await readSettings(root, ['specialists'])).settings.specialists.value;
  assert.deepEqual(fallback.primary, { value: 'lead-programmer', source: 'docs/technical-preferences.md' });
  assert.equal(fallback.shader.value, 'godot-shader-specialist');
});

test('malformed input support and specialist lists cannot masquerade as usable summaries', async t => {
  const root = await fixture(t);
  for (const [config, key] of [['platform: {targets: PC}', 'input_methods'],
    ['platform: {primary_input: [Keyboard]}', 'input_methods'],
    ['specialists: {additional: [null, {name: bad}]}', 'specialists'],
    ['specialists: {code: 12}', 'specialists']]) {
    await writeFile(join(root, 'project.yaml'), config);
    await assert.rejects(readSettings(root, [key]), { code: 'INVALID_CONFIG' });
  }
});
