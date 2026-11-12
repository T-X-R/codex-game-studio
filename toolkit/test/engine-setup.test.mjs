import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'yaml';
const { planEngineSetup } = await import('../dist/engine-setup.js');
const { applyInstall } = await import('../dist/install.js');

const selection = { engine: { name: 'Godot', version: '4.6.1', language: 'GDScript', code_root: 'src', test_root: 'tests',
  rendering: 'Compatibility', physics: 'Godot Physics 2D' },
  specialists: { code: 'game-studio-godot-gdscript-specialist', additional: [] },
  naming: { variables: 'snake_case' }, commands: { test: { macos: 'custom-test --headless', windows: 'custom-test.exe --headless' } } };
async function fixture(t, files = {}) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio engine setup ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries({ 'project.yaml': '{}\n', ...files })) {
    const target = join(root, path);
    await mkdir(join(target, '..'), { recursive: true }); await writeFile(target, content);
  }
  return root;
}

test('setup plans all four blocks and a readable mirror without running commands or creating directories', async t => {
  const root = await fixture(t, { 'project.yaml': '# keep\nproject:\n  name: Custom\ncommands:\n  run: custom-run\n' });
  const { plan, layout, execution, warnings } = await planEngineSetup(root, JSON.stringify(selection));
  assert.deepEqual(plan.changes.map(c => c.path), ['project.yaml', 'docs/technical-preferences.md']);
  assert.equal(layout.code_root.state, 'missing');
  assert.equal(layout.test_root.state, 'missing');
  assert.equal(execution.state, 'not_assessed');
  assert.ok(warnings.some(w => w.includes('src')));
  assert.deepEqual(await readdir(root), ['project.yaml']);
  await applyInstall(plan);
  const content = await readFile(join(root, 'project.yaml'), 'utf8');
  const config = parse(content);
  assert.match(content, /# keep/); assert.equal(config.project.name, 'Custom');
  assert.deepEqual(config.engine, selection.engine);
  assert.deepEqual(config.specialists, selection.specialists);
  assert.deepEqual(config.naming, selection.naming);
  assert.deepEqual(config.commands, { run: 'custom-run', ...selection.commands });
  const mirror = await readFile(join(root, 'docs/technical-preferences.md'), 'utf8');
  assert.match(mirror, /\*\*Engine\*\*: Godot 4\.6\.1/);
  assert.match(mirror, /\*\*Variables\*\*: snake_case/);
  assert.match(mirror, /\*\*Additional Specialists\*\*: None/);
  assert.equal((await planEngineSetup(root, JSON.stringify(selection))).plan.changes.length, 0);
  await assert.rejects(readFile(join(root, 'project.godot')), { code: 'ENOENT' });
});

test('setup preserves mirror notes, CRLF, unspecified fields and OS command overrides', async t => {
  const before = '# Preferences\r\n- **Engine**: Godot 4.5\r\n- **Language**: GDScript\r\n- **Physics**: Custom physics\r\n\r\n## Forbidden Patterns\r\nKeep this rule.\r\n';
  const root = await fixture(t, { 'docs/technical-preferences.md': before,
    'project.yaml': 'engine:\n  physics: Custom physics\ncommands:\n  test:\n    linux: existing-test\n' });
  const input = structuredClone(selection); delete input.engine.physics;
  const { plan } = await planEngineSetup(root, JSON.stringify(input));
  await applyInstall(plan);
  const after = await readFile(join(root, 'docs/technical-preferences.md'), 'utf8');
  assert.match(after, /\*\*Physics\*\*: Custom physics\r\n/);
  assert.match(after, /Keep this rule\.\r\n/);
  assert.equal(after.replaceAll('\r\n', '').includes('\n'), false);
  assert.equal(parse(await readFile(join(root, 'project.yaml'), 'utf8')).commands.test.linux, 'existing-test');
});

test('an existing legacy preference document is preserved as migration input including custom notes', async t => {
  const legacy = '# My preferences\n- **Engine**: Unity 6000.0.1f1\n## Allowed Libraries\nOnly my-library.\n';
  const root = await fixture(t, { '.claude/docs/technical-preferences.md': legacy });
  await applyInstall((await planEngineSetup(root, JSON.stringify(selection))).plan);
  assert.equal(await readFile(join(root, '.claude/docs/technical-preferences.md'), 'utf8'), legacy);
  assert.match(await readFile(join(root, 'docs/technical-preferences.md'), 'utf8'), /Only my-library\./);
});

test('invalid input rejects the whole setup without changing files', async t => {
  const root = await fixture(t);
  const invalid = [
    { ...selection, modes: { automation: 'autonomous' } },
    { ...selection, engine: { ...selection.engine, version: 4.6 } },
    { ...selection, engine: { ...selection.engine, version: 'latest' } },
    { ...selection, engine: { ...selection.engine, code_root: undefined } },
    { ...selection, engine: { ...selection.engine, typo: 'oops' } },
    { ...selection, engine: { ...selection.engine, language: 'null' } },
    { ...selection, naming: { variables: 'snake_case\n- **Engine**: Fake' } },
    { ...selection, commands: { test: { typoOS: 'run' } } },
    { ...selection, specialists: { additional: [42] } },
  ];
  for (const input of invalid) await assert.rejects(planEngineSetup(root, JSON.stringify(input)), { code: 'INVALID_ARGUMENT' });
  await assert.rejects(planEngineSetup(root, ''), { code: 'INVALID_ARGUMENT' });
  await assert.rejects(planEngineSetup(root, 'engine: {}\nengine: {}'), { code: 'INVALID_CONFIG' });
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), '{}\n');
  assert.deepEqual(await readdir(root), ['project.yaml']);
});

test('each supported engine records explicit choices without inventing editor or platform defaults', async t => {
  for (const [name, version, language, code_root, test_root] of [
    ['Godot', '4.6.1', 'C#', 'src', 'tests'], ['Unity', '6000.0.1f1', 'C#', 'Assets', 'Assets/Tests'],
    ['Unreal', '5.7', 'C++', 'Source/MyGame', 'Source/MyGame/Tests'], ['Web', '7.3.1', 'TypeScript', 'src', 'tests'],
  ]) {
    const root = await fixture(t);
    const engine = { name, version, language, code_root, test_root };
    const { plan } = await planEngineSetup(root, JSON.stringify({ engine }));
    const config = parse(plan.changes[0].after);
    assert.deepEqual(config.engine, engine);
    assert.equal(config.commands, undefined);
    assert.equal(config.specialists, undefined);
    assert.equal(config.naming, undefined);
  }
});

test('the unchanged half of a setup pair is still guarded against concurrent edits', async t => {
  for (const target of ['project.yaml', 'docs/technical-preferences.md']) {
    const root = await fixture(t);
    await applyInstall((await planEngineSetup(root, JSON.stringify(selection))).plan);
    const input = structuredClone(selection);
    if (target === 'project.yaml') await writeFile(join(root, 'docs/technical-preferences.md'), '# Needs synchronization\n');
    else input.commands.run = 'new-run';
    const { plan } = await planEngineSetup(root, JSON.stringify(input));
    assert.equal(plan.changes.length, 2);
    const guarded = plan.changes.find(c => c.path === target);
    assert.equal(guarded.before, guarded.after);
    await writeFile(join(root, target), '# concurrent edit\n');
    await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
  }
});

test('setup permits missing directories but refuses unsafe, misspelled, framework and symlink roots', async t => {
  const root = await fixture(t); await mkdir(join(root, 'Scripts'));
  await symlink(join(root, 'Scripts'), join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  for (const code_root of ['../escape', '/absolute', 'C:/outside', 'toolkit', 'tests', 'scripts', 'linked', 'Source/<Module>']) {
    await assert.rejects(planEngineSetup(root, JSON.stringify({ engine: { ...selection.engine, code_root } })), { code: 'INVALID_ARGUMENT' });
  }
  const result = await planEngineSetup(root, JSON.stringify({ engine: { ...selection.engine, code_root: 'Scripts/new' } }));
  assert.equal(result.layout.code_root.state, 'missing');
});

test('ambiguous mirror labels and scalar-to-mapping replacements are conflicts', async t => {
  const root = await fixture(t, { 'docs/technical-preferences.md': '- **Engine**: Godot 4.5\n- **Engine**: Unity 6000.0.1f1\n' });
  await assert.rejects(planEngineSetup(root, JSON.stringify(selection)), { code: 'FILE_CONFLICT' });
  await rm(join(root, 'docs/technical-preferences.md'));
  await writeFile(join(root, 'project.yaml'), 'commands:\n  test: old-command\n');
  await assert.rejects(planEngineSetup(root, JSON.stringify(selection)), { code: 'FILE_CONFLICT' });
});

test('concurrent edits to either half of the mirror prevent all setup changes', async t => {
  for (const target of ['project.yaml', 'docs/technical-preferences.md']) {
    const root = await fixture(t, { 'docs/technical-preferences.md': '# Preferences\n' });
    const { plan } = await planEngineSetup(root, JSON.stringify(selection));
    const before = await readFile(join(root, 'project.yaml'), 'utf8');
    await writeFile(join(root, target), '# user edit\n');
    await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
    assert.equal(await readFile(join(root, target), 'utf8'), '# user edit\n');
    if (target !== 'project.yaml') assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), before);
  }
});
