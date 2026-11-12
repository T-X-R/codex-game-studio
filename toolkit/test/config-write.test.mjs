import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, chmod, stat, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const { planConfigSet, planConfigSetMany } = await import('../dist/config-write.js');
const { applyInstall } = await import('../dist/install.js');
const { readSettings } = await import('../dist/config.js');
async function fixture(t, files = { 'project.yaml': '{}\n' }) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio settings 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

test('grouped configuration writes form one atomic plan and preserve unrelated settings', async t => {
  const before = '# retained\nengine:\n  name: Godot\n  version: "4.6" # pin\n  language: GDScript\nproject:\n  stage: Concept\n  name: Custom\n';
  const root = await fixture(t, { 'project.yaml': before, 'production/stage.txt': 'Concept\n' });
  const entries = [['engine.version', '4.7'], ['engine.language', 'C#'], ['project.stage', 'Technical Setup']];
  const { plan } = await planConfigSetMany(root, entries);
  assert.deepEqual(plan.changes.map(change => change.path), ['project.yaml', 'production/stage.txt']);
  assert.equal(plan.changes[0].before, before);
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), before);
  await applyInstall(plan);
  const after = await readFile(join(root, 'project.yaml'), 'utf8');
  assert.match(after, /version: "4.7" # pin/);
  assert.match(after, /# retained/);
  assert.match(after, /name: Custom/);
  assert.equal((await readSettings(root, ['engine.language'])).settings['engine.language'].value, 'C#');
  assert.equal(await readFile(join(root, 'production/stage.txt'), 'utf8'), 'Technical Setup\n');
  assert.equal((await planConfigSetMany(root, entries)).plan.changes.length, 0);
});

test('an invalid later edit or duplicate key rejects the entire grouped plan without writes', async t => {
  const root = await fixture(t);
  for (const entries of [[['engine.name', 'Web'], ['modes.rigor', 'wrong']],
    [['engine.name', 'Web'], ['engine.name', 'Godot']]]) {
    await assert.rejects(planConfigSetMany(root, entries), { code: 'INVALID_ARGUMENT' });
  }
  await assert.rejects(planConfigSetMany(root, [['modes.automation', 'guided'], ['engine.name', 'Web']], true), { code: 'INVALID_ARGUMENT' });
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), '{}\n');
  assert.deepEqual(await readdir(root), ['project.yaml']);
});

test('grouped edits keep the original before-image for concurrent writer rejection', async t => {
  const root = await fixture(t);
  const { plan } = await planConfigSetMany(root, [['engine.name', 'Web'], ['engine.version', 'recorded-version']]);
  await writeFile(join(root, 'project.yaml'), '# concurrent user edit\n');
  await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), '# concurrent user edit\n');
});

test('setting edits preserve comments, quoting, BOM, CRLF, permissions and unchanged bytes', async t => {
  const before = '\uFEFF# my game\r\nmodes:\r\n  automation: "guided" # policy\r\nproject:\r\n  name: \'Knight #1\'\r\n';
  const root = await fixture(t, { 'project.yaml': before });
  await chmod(join(root, 'project.yaml'), 0o600);
  const { plan } = await planConfigSet(root, 'modes.automation', 'autonomous');
  assert.deepEqual(await readdir(root), ['project.yaml']);
  await applyInstall(plan);
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), before.replace('"guided"', '"autonomous"'));
  if (process.platform !== 'win32') assert.equal((await stat(join(root, 'project.yaml'))).mode & 0o777, 0o600);
  assert.equal((await planConfigSet(root, 'modes.automation', 'autonomous')).plan.changes.length, 0);
});

test('new settings support typed lists and numbers, literal strings and local overrides', async t => {
  const root = await fixture(t);
  for (const [key, value] of [['platform.targets', '["PC","Web"]'], ['performance.frame_budget_ms', '16.67'],
    ['project.name', 'Knight #1: Trial'], ['engine.version', '4.7'], ['workflow_overrides.system_overrides.combat-loop', 'full']]) {
    await applyInstall((await planConfigSet(root, key, value)).plan);
  }
  await applyInstall((await planConfigSet(root, 'modes.automation', 'autonomous', true)).plan);
  const { settings } = await readSettings(root);
  assert.deepEqual(settings['platform.targets'].value, ['PC', 'Web']);
  assert.equal(settings['performance.frame_budget_ms'].value, 16.67);
  assert.equal(settings['project.name'].value, 'Knight #1: Trial');
  assert.equal(settings['engine.version'].value, '4.7');
  assert.equal(settings['modes.automation'].source, 'project.local.yaml');
  assert.equal((await readSettings(root, ['modes.workflow'], { system: 'combat-loop' })).settings['modes.workflow'].value, 'full');
  assert.ok((await planConfigSet(root, 'modes.automation', 'guided')).warnings.some(w => /shadow/i.test(w)));
  assert.ok((await planConfigSet(root, 'strict_gate_checks', 'true')).warnings.some(w => /reserved/i.test(w)));
});

test('invalid values, unknown keys, unsafe paths and forbidden local settings leave files unchanged', async t => {
  const root = await fixture(t);
  for (const [key, value, local] of [['modes.automation', 'typo'], ['qa.levl', 'full'], ['constructor.x', 'true'],
    ['workflow_overrides.system_overrides.combat', 'typo'], ['qa.coverage_minimum', '101'],
    ['platform.targets', '["PC", {}]'], ['features.read_guard_kb', '-1'], ['modes.rigor', 'full', true]]) {
    await assert.rejects(planConfigSet(root, key, value, local), { code: 'INVALID_ARGUMENT' });
  }
  assert.deepEqual(await readdir(root), ['project.yaml']);
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), '{}\n');
});

test('stage edits synchronize the mirror and refuse existing disagreement', async t => {
  const root = await fixture(t, { 'project.yaml': 'project:\n  stage: Concept\n', 'production/stage.txt': 'Concept\n' });
  const { plan } = await planConfigSet(root, 'project.stage', 'Production');
  assert.equal(plan.changes.length, 2);
  await applyInstall(plan);
  assert.equal(await readFile(join(root, 'production/stage.txt'), 'utf8'), 'Production\n');
  assert.equal((await readSettings(root, ['project.stage'])).settings['project.stage'].value, 'Production');
  await writeFile(join(root, 'production/stage.txt'), 'Polish\n');
  await assert.rejects(planConfigSet(root, 'project.stage', 'Release'), { code: 'FILE_CONFLICT' });
});

test('concurrent modification aborts before either stage file is written', async t => {
  const root = await fixture(t, { 'project.yaml': 'project:\n  stage: Concept\n', 'production/stage.txt': 'Concept\n' });
  const { plan } = await planConfigSet(root, 'project.stage', 'Production');
  await writeFile(join(root, 'production/stage.txt'), 'Polish\n');
  await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), 'project:\n  stage: Concept\n');
});

test('malformed YAML, destructive shape changes and alias targets are rejected', async t => {
  for (const yaml of ['modes: [\n', 'modes: 42\n', 'modes:\n  automation: { custom: true }\n',
    'base: &policy { automation: guided }\nmodes: *policy\n', 'modes:\n  automation: &policy guided\nother: *policy\n']) {
    const root = await fixture(t, { 'project.yaml': yaml });
    await assert.rejects(planConfigSet(root, 'modes.automation', 'autonomous'));
    assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), yaml);
  }
});

test('multiline and whitespace-sensitive string edits preserve the actual setting value', async t => {
  const root = await fixture(t, { 'project.yaml': 'commands:\n  build: |\n    old command\nproject:\n  name: Old\n' });
  const command = 'first command\nsecond command\n';
  await applyInstall((await planConfigSet(root, 'commands.build', command)).plan);
  assert.equal((await readSettings(root, ['commands.build'])).settings['commands.build'].value, command);
  const name = '  Knight\n Trial  ';
  await applyInstall((await planConfigSet(root, 'project.name', name)).plan);
  assert.equal((await readSettings(root, ['project.name'])).settings['project.name'].value, name);
});

test('CLI dry run exposes effects without creating state, then applies the setting', async t => {
  const root = await fixture(t);
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const args = [cli, 'config', 'set', 'modes.automation', 'autonomous', '--project', root, '--json'];
  const dry = spawnSync(process.execPath, [...args, '--dry-run'], { encoding: 'utf8' });
  assert.equal(dry.status, 0, dry.stdout + dry.stderr);
  assert.equal(JSON.parse(dry.stdout).data.changes[0].path, 'project.yaml');
  assert.deepEqual(await readdir(root), ['project.yaml']);
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal((await readSettings(root, ['modes.automation'])).settings['modes.automation'].value, 'autonomous');
});
