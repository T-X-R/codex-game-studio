import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const { planEngineScaffold } = await import('../dist/engine-scaffold.js');
const { applyInstall } = await import('../dist/install.js');
const settings = rendering => `project:\n  name: 'My "game" \\ studio'\nengine:\n  name: Godot\n  version: "4.6.1"\n  language: GDScript\n  rendering: ${rendering}\n`;
async function fixture(t, config = settings('Compatibility')) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio engine scaffold ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), config);
  return root;
}

test('Godot scaffolding respects renderer choices, escapes names and leaves the main scene unset', async t => {
  for (const [rendering, feature, method] of [['Compatibility', 'GL Compatibility', 'gl_compatibility'],
    ['Forward+', 'Forward Plus', 'forward_plus'], ['Mobile', 'Mobile', 'mobile']]) {
    const root = await fixture(t, settings(rendering));
    const { plan, outcome, verification } = await planEngineScaffold(root);
    assert.equal(outcome.state, 'planned'); assert.equal(verification.state, 'not_assessed');
    assert.deepEqual(await readdir(root), ['project.yaml']);
    await applyInstall(plan);
    const content = await readFile(join(root, 'project.godot'), 'utf8');
    assert.match(content, /^config_version=5$/m);
    assert.ok(content.includes(`config/features=PackedStringArray("4.6", "${feature}")`));
    assert.ok(content.includes(`renderer/rendering_method="${method}"`));
    assert.ok(content.includes('config/name="My \\"game\\" \\\\ studio"'));
    assert.doesNotMatch(content, /^run\/main_scene=/m);
    assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), settings(rendering));
  }
});

test('existing Godot projects are preserved byte for byte even when the selected settings differ', async t => {
  const root = await fixture(t, settings('Unknown custom renderer'));
  const custom = '\uFEFF; my project\r\nconfig_version=5\r\n[application]\r\nrun/main_scene="res://main.tscn"\r\n';
  await writeFile(join(root, 'project.godot'), custom);
  const { plan, outcome } = await planEngineScaffold(root);
  assert.equal(outcome.state, 'already_present'); assert.equal(plan.changes.length, 0);
  await applyInstall(plan);
  assert.equal(await readFile(join(root, 'project.godot'), 'utf8'), custom);
});

test('missing choices and unsupported Godot versions cannot produce a plausible but guessed project', async t => {
  for (const config of [settings('null'), settings('Custom'), settings('Compatibility').replace('"4.6.1"', '4.6'),
    settings('Compatibility').replace('4.6.1', '3.6.1'), settings('Compatibility').replace('4.6.1', '4.x'), '{}\n']) {
    const root = await fixture(t, config);
    await assert.rejects(planEngineScaffold(root), { code: 'INVALID_CONFIG' });
    assert.deepEqual(await readdir(root), ['project.yaml']);
  }
});

test('editor-owned Unity and Unreal projects are not fabricated and Web points to its growth workflow', async t => {
  for (const name of ['Unity', 'Unreal', 'Web']) {
    const root = await fixture(t, `engine:\n  name: ${name}\n`);
    const { plan, outcome } = await planEngineScaffold(root);
    assert.equal(outcome.state, 'not_assessed'); assert.equal(plan.changes.length, 0);
    assert.ok(outcome.reason.includes(name));
    assert.deepEqual(await readdir(root), ['project.yaml']);
  }
});

test('a changed configuration or a newly appearing project prevents scaffold writes', async t => {
  for (const target of ['project.yaml', 'project.godot']) {
    const root = await fixture(t);
    const { plan } = await planEngineScaffold(root);
    await writeFile(join(root, target), 'user file\n');
    await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
    assert.equal(await readFile(join(root, target), 'utf8'), 'user file\n');
    if (target === 'project.yaml') await assert.rejects(readFile(join(root, 'project.godot')), { code: 'ENOENT' });
  }
});

test('scaffolding rejects symbolic links and directories at the project file path', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'linked-target'));
  await symlink(join(root, 'linked-target'), join(root, 'project.godot'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(planEngineScaffold(root), { code: 'UNSAFE_PATH' });
  await rm(join(root, 'project.godot')); await mkdir(join(root, 'project.godot'));
  await assert.rejects(planEngineScaffold(root), { code: 'FILE_CONFLICT' });
});
