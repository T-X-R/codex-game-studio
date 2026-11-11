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
