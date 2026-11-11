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
  execute(npm, ['install', '--prefix', prefix, archive, '--ignore-scripts', '--no-audit', '--no-fund', '--offline']);
  const globalRoot = join(prefix, 'node_modules/@t-x-r/game-studio');
  const globalCli = join(globalRoot, 'dist/cli.js');
  assert.equal(command(globalCli, 'version').status, 'ok');
  const project = join(temp, '我的 game');
  assert.equal(command(globalCli, 'init', project, '--engine', 'web').status, 'ok');
  command(globalCli, 'restore', '--project', project, '--archive', archive, '--offline');
  const launcher = join(project, '.game-studio/run.cjs');
  assert.equal(command(launcher, 'status', '--project', project).data.settings['engine.name'].value, 'Web');
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
  console.log('Packed install, exact runtime restore, single-hop dispatch, onboarding and detach passed.');
} finally { await rm(temp, { recursive: true, force: true }); }
