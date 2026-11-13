// Opt-in native Codex acceptance; never launched by the installed toolkit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { mapScenarios } from './fixtures/map-systems-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(mapScenarios, name), `Choose ${Object.keys(mapScenarios).join(', ')}`);
const scenario = mapScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-map-systems-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(packageRoot, '..');
const npm = await npmPath();
function run(entry, args) {
  return execFileSync(process.execPath, [entry, ...args], { cwd: directory, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
const archive = join(directory, packed.filename);
run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const workspace = join(directory, 'Lantern game 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const role of scenario.removeRoles ?? []) {
  await rm(join(workspace, '.codex/agents', `game-studio-${role}.toml`), { force: true });
}
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const hashes = {};
const skillRoot = '.agents/skills/game-studio-map-systems';
const paths = [`${skillRoot}/SKILL.md`, `${skillRoot}/references/reviews.md`, `${skillRoot}/references/index-and-handoff.md`,
  ...['technical-director', 'producer', 'creative-director'].map(role => `.codex/agents/game-studio-${role}.toml`),
  'studio/templates/systems-index.md', 'studio/docs/integration.md', 'studio/docs/recovery.md',
  ...['td-system-boundary', 'pr-scope', 'cd-systems'].map(gate => `studio/docs/director-gates/${gate}.md`)];
for (const path of paths) {
  const installedPath = path.startsWith('.agents/') || path.startsWith('.codex/') ? join(workspace, path)
    : JSON.parse(run(join(workspace, '.game-studio/run.cjs'), ['resource', 'path', path, '--json'])).data.path;
  const installed = await readFile(installedPath);
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(installed).digest('hex');
}
const configMarker = `MAP_SYSTEMS_CONFIG_${randomUUID()}`;
await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${configMarker}"\n`);
async function snapshot() {
  const files = {};
  for (const entry of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const relative = path.slice(workspace.length + 1).replaceAll('\\', '/');
    if (!relative.startsWith('.git/')) files[relative] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return files;
}
const before = await snapshot();
await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
const profile = `game-studio-map-systems-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(configMarker));
  assert.ok(preflight.stdout.includes('game-studio-map-systems'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, packageIntegrity: packed.integrity }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 480000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const checkpoint = 'production/session-state/active.md';
  const checkpointEvents = added.filter(path => /^production\/session-logs\/events\/[A-Za-z0-9_-]+\.json$/.test(path));
  assert.equal(checkpointEvents.length, scenario.saveCheckpoint ? 1 : 0);
  for (const path of checkpointEvents) {
    const event = JSON.parse(await readFile(join(workspace, path), 'utf8'));
    assert.equal(event.schemaVersion, 1); assert.equal(event.type, 'checkpoint.saved');
    assert.equal(path, `production/session-logs/events/${event.eventId}.json`);
    assert.equal(event.previousHash, before[checkpoint] ?? 'missing');
    assert.equal(event.checkpointHash, after[checkpoint]);
    assert.match(event.operationHash, /^[a-f0-9]{64}$/);
    assert.ok(Number.isFinite(Date.parse(event.recordedAt)));
  }
  const transactionBackups = [];
  for (const path of added.filter(path => /^\.game-studio\/backups\/[a-f0-9-]+\.json$/.test(path))) {
    assert.equal(scenario.saveCheckpoint, true);
    const backup = JSON.parse(await readFile(join(workspace, path), 'utf8'));
    assert.equal(backup.project, workspace); assert.equal(backup.version, packed.version);
    assert.deepEqual(backup.changes.map(change => change.path).sort(), [checkpoint, ...checkpointEvents].sort());
    for (const change of backup.changes) {
      if (before[change.path] === undefined) assert.equal(change.before, null);
      else assert.equal(createHash('sha256').update(change.before).digest('hex'), before[change.path]);
      assert.equal(createHash('sha256').update(change.after).digest('hex'), after[change.path]);
    }
    transactionBackups.push(path);
  }
  assert.equal(transactionBackups.length, scenario.saveCheckpoint ? 1 : 0);
  const outsideScope = added.filter(path => !scenario.expectedFiles.includes(path) && !transactionBackups.includes(path) && !checkpointEvents.includes(path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review native Skill selection, mapping and schema, role sequence, preservation, handoff and checkpoint semantics against map-systems-codex.md.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, transactionBackups, checkpointEvents, outsideScope, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(changed.filter(path => !(scenario.allowedChanges ?? []).includes(path)), []); assert.deepEqual(outsideScope, []);
  for (const path of scenario.expectedFiles) assert.ok(added.includes(path), `Missing artifact: ${path}`);
  if (scenario.saveCheckpoint) {
    const launcher = join(workspace, '.game-studio/run.cjs');
    const observed = JSON.parse(run(launcher, ['checkpoint', 'show', '--project', workspace, '--json'])).data;
    const stage = JSON.parse(run(launcher, ['config', 'get', 'project.stage', '--project', workspace, '--json'])).data.settings['project.stage'].value;
    await writeFile(join(directory, 'checkpoint-readback.json'), JSON.stringify(observed, null, 2), { mode: 0o600 });
    if (observed.fields.Branch) assert.equal(observed.fields.Branch.replace(/^`|`$/g, ''), observed.git.branch);
    if (observed.fields.Stage) assert.equal(observed.fields.Stage.replace(/^`|`$/g, ''), stage);
  }
  // Success is pending semantic review, not an automatic behavior pass.
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
