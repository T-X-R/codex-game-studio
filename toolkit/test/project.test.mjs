import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const { resolveProject } = await import('../dist/project.js');
const { readSettings } = await import('../dist/config.js');
async function fixture(t, files) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio project 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

test('discovery picks nearest game and never crosses an uninitialized nested repository', async t => {
  const root = await fixture(t, { 'project.yaml': '{}', 'child/project.yaml': '{}', 'child/src/.keep': '' });
  assert.equal(await resolveProject(undefined, join(root, 'child/src')), join(root, 'child'));
  assert.equal(await resolveProject(root, join(root, 'child/src')), root);
  await mkdir(join(root, 'nested/.git'), { recursive: true });
  await assert.rejects(resolveProject(undefined, join(root, 'nested')), { code: 'PROJECT_NOT_FOUND' });
});

test('rigor expands only absent values and local overrides use the explicit whitelist', async t => {
  const root = await fixture(t, {
    'project.yaml': 'modes:\n  rigor: full\ndocs:\n  density: terse\n',
    'project.local.yaml': 'modes:\n  review_mode: solo\n  rigor: minimal\n',
  });
  const { settings, warnings } = await readSettings(root);
  assert.deepEqual(settings['modes.workflow'], { value: 'full', source: 'rigor:full' });
  assert.deepEqual(settings['docs.density'], { value: 'terse', source: 'project.yaml' });
  assert.deepEqual(settings['modes.review_mode'], { value: 'solo', source: 'project.local.yaml' });
  assert.deepEqual(settings['modes.automation'], { value: 'guided', source: 'default' });
  assert.ok(warnings.some(x => x.includes('modes.rigor') && x.includes('ignored')));
});

test('invalid enum falls through with a warning and legacy mirrors precede rigor', async t => {
  const root = await fixture(t, {
    'project.yaml': 'modes:\n  rigor: full\n  review_mode: wrong\n',
    'project.local.yaml': 'modes:\n  review_mode: nonsense\n',
    'production/review-mode.txt': 'lean\n',
  });
  const { settings, warnings } = await readSettings(root);
  assert.deepEqual(settings['modes.review_mode'], { value: 'lean', source: 'production/review-mode.txt' });
  assert.equal(warnings.filter(x => x.includes('review_mode')).length, 2);
});

test('false is explicit, missing strictness is unset, malformed YAML is an error', async t => {
  const root = await fixture(t, { 'project.yaml': 'testing:\n  strict:\n    logic: false\n' });
  const { settings } = await readSettings(root);
  assert.deepEqual(settings['testing.strict.logic'], { value: false, source: 'project.yaml' });
  assert.deepEqual(settings['testing.strict.visual'], { value: null, source: 'unset' });
  await writeFile(join(root, 'project.yaml'), 'modes: [\n');
  await assert.rejects(readSettings(root), { code: 'INVALID_CONFIG' });
});

test('unsafe object keys and duplicate YAML keys are rejected', async t => {
  const root = await fixture(t, { 'project.yaml': '__proto__:\n  polluted: true\n' });
  await assert.rejects(readSettings(root), { code: 'INVALID_CONFIG' });
  await writeFile(join(root, 'project.yaml'), 'engine: Web\nengine: Godot\n');
  await assert.rejects(readSettings(root), { code: 'INVALID_CONFIG' });
});

test('system workflow overrides are scoped and invalid values fall back with provenance', async t => {
  const root = await fixture(t, { 'project.yaml': 'modes:\n  rigor: standard\nworkflow_overrides:\n  system_overrides:\n    combat-loop: full\n    inventory: typo\n' });
  assert.deepEqual((await readSettings(root, ['modes.workflow'], { system: 'combat-loop' })).settings['modes.workflow'],
    { value: 'full', source: 'project.yaml:workflow_overrides.system_overrides.combat-loop' });
  const invalid = await readSettings(root, ['modes.workflow'], { system: 'inventory' });
  assert.equal(invalid.settings['modes.workflow'].value, 'standard');
  assert.ok(invalid.warnings.some(warning => warning.includes('inventory')));
  assert.equal((await readSettings(root, ['modes.workflow'])).settings['modes.workflow'].value, 'standard');
  await assert.rejects(readSettings(root, undefined, { system: '../escape' }), { code: 'INVALID_ARGUMENT' });
});

test('legacy technical preferences fill absent engine fields without overriding project decisions', async t => {
  const root = await fixture(t, {
    'project.yaml': 'engine:\n  version: "5.5"\nspecialists:\n  code: null\n',
    '.claude/docs/technical-preferences.md': '- **Engine**: Unreal Engine 5.4\n- **Language**: C++\n- **Language/Code Specialist**: unreal-cpp-specialist\n',
  });
  const { settings, warnings } = await readSettings(root, ['engine.name', 'engine.version', 'engine.language', 'specialists.code']);
  assert.equal(settings['engine.name'].value, 'Unreal');
  assert.equal(settings['engine.version'].value, '5.5');
  assert.equal(settings['engine.language'].value, 'C++');
  assert.equal(settings['specialists.code'].value, null);
  assert.ok(warnings.some(warning => warning.includes('legacy')));
  await mkdir(join(root, 'docs'));
  await writeFile(join(root, 'docs/technical-preferences.md'), '- **Engine**: Godot 4.7\n- **Language**: GDScript\n');
  assert.equal((await readSettings(root, ['engine.name'])).settings['engine.name'].value, 'Godot');
});

test('legacy placeholder preferences stay unset and invalid inherited property keys are rejected', async t => {
  const root = await fixture(t, { 'project.yaml': '{}', 'docs/technical-preferences.md': '- **Engine**: [TO BE CONFIGURED]\n- **Language**: [TO BE CONFIGURED]\n' });
  const { settings } = await readSettings(root, ['engine.name', 'engine.language']);
  assert.equal(settings['engine.name'].value, null);
  assert.equal(settings['engine.language'].value, null);
  await assert.rejects(readSettings(root, ['constructor']), { code: 'INVALID_ARGUMENT' });
});

test('legacy strict boolean fills per-type settings after valid personal overrides', async t => {
  const root = await fixture(t, { 'project.yaml': 'testing:\n  strict: true\n',
    'project.local.yaml': 'testing:\n  strict:\n    config: false\n    logic: typo\n' });
  const { settings, warnings } = await readSettings(root);
  assert.deepEqual(settings['testing.strict.integration'], { value: true, source: 'project.yaml:testing.strict' });
  assert.deepEqual(settings['testing.strict.config'], { value: false, source: 'project.local.yaml' });
  assert.deepEqual(settings['testing.strict.logic'], { value: true, source: 'project.yaml:testing.strict' });
  assert.ok(warnings.some(warning => warning.includes('testing.strict.logic')));
  await writeFile(join(root, 'project.yaml'), 'testing:\n  strict: false\n');
  assert.equal((await readSettings(root)).settings['testing.strict.ui'].value, false);
  await writeFile(join(root, 'project.yaml'), 'testing:\n  strict: wrong\n');
  assert.equal((await readSettings(root)).settings['testing.strict.ui'].value, null);
});
