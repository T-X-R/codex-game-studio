import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { npmPath } from '../dist/runtime.js';
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const temp = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-pack-')));
const npm = await npmPath();
function execute(entry, args, cwd = temp) {
  return execFileSync(process.execPath, [entry, ...args], { cwd, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
function command(entry, ...args) { return JSON.parse(execute(entry, [...args, '--json'])); }
try {
  const [packed] = JSON.parse(execute(npm, ['pack', packageRoot, '--pack-destination', temp, '--ignore-scripts', '--json']));
  assert.ok(packed.files.some(file => file.path === 'resources/studio/onboarding/game-studio/SKILL.md'));
  assert.ok(packed.files.every(file => !file.path.startsWith('src/') && !file.path.includes('.claude')));
  const archive = join(temp, packed.filename);
  const prefix = join(temp, 'cli');
  execute(npm, ['install', '--prefix', prefix, archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
  const globalRoot = join(prefix, 'node_modules/@t-x-r/game-studio');
  const globalCli = join(globalRoot, 'dist/cli.js');
  assert.equal(command(globalCli, 'version').status, 'ok');
  const project = join(temp, '我的 game');
  assert.equal(command(globalCli, 'init', project, '--engine', 'web').status, 'ok');
  assert.match(await readFile(join(project, '.agents/skills/game-studio-prototype/SKILL.md'), 'utf8'), /name: game-studio-prototype/);
  assert.equal(await readFile(join(project, '.agents/skills/game-studio-prototype/references/grow.md'), 'utf8'),
    await readFile(join(packageRoot, '../.agents/skills/game-studio-prototype/references/grow.md'), 'utf8'));
  for (const path of ['hook.ts', 'tune.ts']) {
    assert.equal(await readFile(join(globalRoot, 'resources/studio/templates/web-growth-support', path), 'utf8'),
      await readFile(join(packageRoot, '../studio/templates/web-growth-support', path), 'utf8'));
  }
  command(globalCli, 'restore', '--project', project, '--archive', archive, '--offline');
  const launcher = join(project, '.game-studio/run.cjs');
  assert.equal(command(launcher, 'status', '--project', project).data.settings['engine.name'].value, 'Web');
  command(globalCli, 'config', 'set', 'project.stage', 'Concept', '--project', project);
  assert.equal(await readFile(join(project, 'production/stage.txt'), 'utf8'), 'Concept\n');
  command(launcher, 'config', 'set', 'modes.automation', 'autonomous', '--local', '--project', project);
  assert.equal(command(globalCli, 'config', 'get', 'modes.automation', '--project', project).data.settings['modes.automation'].source, 'project.local.yaml');
  assert.equal(command(launcher, 'config', 'get', 'engine_values', '--project', project).data.settings.engine_values.value.name.value, 'Web');
  assert.equal(command(launcher, 'config', 'get', 'gate_level', '--project', project).data.settings.gate_level.value.config.smokeCheck, 'blocking');
  assert.equal(command(launcher, 'config', 'get', 'engine_row', '--project', project).data.settings.engine_row.value.commands.test, 'npm test');
  const engineInspection = command(launcher, 'engine', 'inspect', '--project', project);
  assert.equal(engineInspection.data.engine.name.value, 'Web');
  assert.equal(engineInspection.data.execution.state, 'not_assessed');
  const setupInput = 'engine-setup.json';
  await writeFile(join(project, setupInput), JSON.stringify({ engine: {
    name: 'Web', version: '7.3.1', language: 'TypeScript', code_root: 'src', test_root: 'tests',
  }, naming: { variables: 'camelCase' } }));
  const beforeSetup = await readFile(join(project, 'project.yaml'), 'utf8');
  const setupPreview = command(launcher, 'engine', 'setup', '--input', setupInput, '--dry-run', '--project', project);
  assert.deepEqual(setupPreview.data.changes.map(change => change.path), ['project.yaml', 'docs/technical-preferences.md']);
  assert.equal(await readFile(join(project, 'project.yaml'), 'utf8'), beforeSetup);
  const setup = command(globalCli, 'engine', 'setup', '--input', setupInput, '--project', project);
  assert.equal(setup.status, 'ok'); assert.equal(setup.data.execution.state, 'not_assessed');
  assert.equal(command(launcher, 'config', 'get', 'engine.version', '--project', project).data.settings['engine.version'].value, '7.3.1');
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /\*\*Engine\*\*: Web 7\.3\.1/);
  assert.equal(command(launcher, 'engine', 'setup', '--input', setupInput, '--project', project).data.changes.length, 0);
  await writeFile(join(project, 'test-fixture.cjs'), 'console.log("packed test executed");\n');
  command(launcher, 'config', 'set', 'commands.test', 'node test-fixture.cjs', '--project', project);
  assert.equal(command(launcher, 'test', '--output', 'production/evidence/packed-test', '--project', project).data.processExitCode, 0);
  assert.match(await readFile(join(project, 'production/evidence/packed-test/stdout.log'), 'utf8'), /packed test executed/);
  await writeFile(join(project, 'checkpoint-draft.md'), '**Current task:** Prototype movement\n**Next step:** Test controls\n');
  command(launcher, 'checkpoint', 'save', '--input', 'checkpoint-draft.md', '--expect-hash', 'missing', '--project', project);
  assert.equal(command(globalCli, 'checkpoint', 'show', '--project', project).data.fields['Next step'], 'Test controls');
  command(globalCli, 'prototype', 'scaffold', 'smoke', '--project', project);
  const growth = command(globalCli, 'prototype', 'grow-check', 'smoke', '--project', project);
  assert.equal(growth.data.eligible, true);
  assert.equal(growth.data.verification.state, 'not_assessed');
  await writeFile(join(project, 'package.json'), '{"name":"existing-game"}\n');
  try {
    command(launcher, 'prototype', 'grow-check', 'smoke', '--project', project);
    assert.fail('An existing game must block prototype growth');
  } catch (error) {
    assert.equal(error.status, 4); assert.equal(JSON.parse(error.stdout).data.eligible, false);
  }
  assert.equal(await readFile(join(project, 'package.json'), 'utf8'), '{"name":"existing-game"}\n');
  await rm(join(project, 'package.json'));
  assert.equal(command(globalCli, 'check', 'prototypes/smoke', '--project', project).status, 'ok');
  command(globalCli, 'package', 'prototypes/smoke', '--output', 'builds/smoke', '--project', project);
  assert.ok(await readFile(join(project, 'builds/smoke/index.html')));
  const godotProject = join(temp, 'Godot scaffold');
  command(globalCli, 'init', godotProject, '--engine', 'godot');
  command(globalCli, 'restore', '--project', godotProject, '--archive', archive, '--offline');
  const godotLauncher = join(godotProject, '.game-studio/run.cjs');
  await writeFile(join(godotProject, 'engine.json'), JSON.stringify({ engine: {
    name: 'Godot', version: '4.6.1', language: 'GDScript', rendering: 'Compatibility', code_root: 'src', test_root: 'tests',
  } }));
  command(godotLauncher, 'engine', 'setup', '--input', 'engine.json', '--project', godotProject);
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--dry-run', '--project', godotProject).data.outcome.state, 'planned');
  await assert.rejects(readFile(join(godotProject, 'project.godot')), { code: 'ENOENT' });
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--project', godotProject).data.outcome.state, 'created');
  assert.equal(command(godotLauncher, 'engine', 'scaffold', '--project', godotProject).data.outcome.state, 'already_present');
  assert.equal(command(godotLauncher, 'engine', 'verify', '--dry-run', '--project', godotProject).data.status, 'planned');
  try {
    command(godotLauncher, 'engine', 'verify', '--executable', join(temp, 'missing-editor'), '--project', godotProject);
    assert.fail('A missing editor must not pass verification');
  } catch (error) {
    assert.equal(error.status, 3); assert.equal(JSON.parse(error.stdout).status, 'not_assessed');
  }
  command(globalCli, 'detach', '--project', godotProject);
  assert.match(await readFile(join(godotProject, 'project.godot'), 'utf8'), /config_version=5/);
  const lock = await readFile(join(project, '.game-studio/package-lock.json'), 'utf8');
  assert.equal(JSON.parse(lock).packages['node_modules/@t-x-r/game-studio'].resolved, 'file:runtime.tgz');
  await rm(archive);
  assert.ok((await readFile(join(project, '.game-studio/runtime.tgz'))).length > 0);
  command(globalCli, 'restore', '--project', project, '--offline');
  assert.equal(await readFile(join(project, '.game-studio/package-lock.json'), 'utf8'), lock);
  const packageFile = join(globalRoot, 'package.json');
  const metadata = JSON.parse(await readFile(packageFile, 'utf8'));
  metadata.version = '999.0.0';
  await writeFile(packageFile, JSON.stringify(metadata));
  const resource = command(globalCli, 'resource', 'path', 'studio/docs/integration.md', '--project', project);
  assert.ok(resource.data.path.startsWith(join(project, '.game-studio/node_modules')));
  command(globalCli, 'skills', 'setup', '--home', join(temp, 'codex-home'));
  command(globalCli, 'skills', 'remove', '--home', join(temp, 'codex-home'));
  command(globalCli, 'detach', '--project', project);
  assert.ok(await readFile(join(project, 'project.yaml'), 'utf8'));
  assert.match(await readFile(join(project, 'docs/technical-preferences.md'), 'utf8'), /Web 7\.3\.1/);
  assert.match(await readFile(join(project, 'production/session-state/active.md'), 'utf8'), /Test controls/);
  console.log('Packed install, exact runtime restore, single-hop dispatch, onboarding and detach passed.');
} finally { await rm(temp, { recursive: true, force: true }); }
