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
import { createArchitectureScenarios } from './fixtures/create-architecture-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(createArchitectureScenarios, name), `Choose ${Object.keys(createArchitectureScenarios).join(', ')}`);
const scenario = createArchitectureScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-create-architecture-')));
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
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const hashes = {};
const skillRoot = '.agents/skills/game-studio-create-architecture';
const skillFiles = (await readdir(join(sourceRoot, skillRoot), { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile()).map(entry => join(entry.parentPath, entry.name).slice(sourceRoot.length + 1).replaceAll('\\', '/'));
const paths = [...skillFiles, ...['technical-director', 'lead-programmer'].map(role => `.codex/agents/game-studio-${role}.toml`),
  'studio/docs/integration.md', 'studio/docs/recovery.md', 'studio/scripts/registry.mjs',
  'studio/docs/director-gates/td-architecture.md', 'studio/docs/director-gates/lp-feasibility.md'];
for (const path of paths) {
  const installedPath = path.startsWith('.agents/') || path.startsWith('.codex/') ? join(workspace, path)
    : JSON.parse(run(join(workspace, '.game-studio/run.cjs'), ['resource', 'path', path, '--json'])).data.path;
  const installed = await readFile(installedPath);
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(installed).digest('hex');
}
for (const role of scenario.removeRoles ?? []) {
  await rm(join(workspace, '.codex/agents', `game-studio-${role}.toml`), { force: true });
}
const configMarker = `CREATE_ARCHITECTURE_CONFIG_${randomUUID()}`;
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
const profile = `game-studio-create-architecture-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(configMarker));
  assert.ok(preflight.stdout.includes('game-studio-create-architecture'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, packageIntegrity: packed.integrity }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 1200000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const checkpoint = 'production/session-state/active.md';
  const checkpointEvents = added.filter(path => /^production\/session-logs\/events\/[A-Za-z0-9_-]+\.json$/.test(path));
  const transactionBackups = added.filter(path => /^\.game-studio\/backups\/[a-f0-9-]+\.json$/.test(path));
  const outsideScope = added.filter(path => !scenario.expectedFiles.includes(path) && !transactionBackups.includes(path) && !checkpointEvents.includes(path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review native discovery, complete source baseline and stable IDs, one-write architecture chronology, exact update preservation, real parallel TD/LP roles and checkpoint semantics against create-architecture-codex.md.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, transactionBackups, checkpointEvents, outsideScope, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(changed.filter(path => !(scenario.allowedChanges ?? []).includes(path)), []); assert.deepEqual(outsideScope, []);
  for (const path of scenario.expectedFiles) assert.ok(added.includes(path), `Missing artifact: ${path}`);
  if (scenario.saveCheckpoint) {
    assert.ok(checkpointEvents.length >= scenario.minimumCheckpoints, 'Missing incremental checkpoint milestones');
    assert.equal(transactionBackups.length, checkpointEvents.length);
    const savedEvents = new Map();
    for (const path of checkpointEvents) {
      const event = JSON.parse(await readFile(join(workspace, path), 'utf8'));
      assert.equal(event.schemaVersion, 1); assert.equal(event.type, 'checkpoint.saved');
      assert.equal(path, `production/session-logs/events/${event.eventId}.json`);
      assert.match(event.checkpointHash, /^[a-f0-9]{64}$/); assert.match(event.operationHash, /^[a-f0-9]{64}$/);
      assert.ok(Number.isFinite(Date.parse(event.recordedAt)));
      assert.ok(!savedEvents.has(event.previousHash), 'Checkpoint history must form one chain');
      savedEvents.set(event.previousHash, { path, event });
    }
    let currentHash = before[checkpoint] ?? 'missing';
    const visited = new Set();
    while (savedEvents.has(currentHash)) {
      const { path, event } = savedEvents.get(currentHash);
      assert.ok(!visited.has(path), 'Checkpoint cycle'); visited.add(path);
      currentHash = event.checkpointHash;
    }
    assert.equal(visited.size, checkpointEvents.length);
    assert.equal(currentHash, after[checkpoint]);
    const backedUpEvents = new Set();
    for (const path of transactionBackups) {
      const backup = JSON.parse(await readFile(join(workspace, path), 'utf8'));
      assert.equal(backup.project, workspace); assert.equal(backup.version, packed.version);
      const checkpointChange = backup.changes.find(change => change.path === checkpoint);
      const eventChange = backup.changes.find(change => checkpointEvents.includes(change.path));
      assert.ok(checkpointChange && eventChange); assert.equal(backup.changes.length, 2);
      assert.ok(!backedUpEvents.has(eventChange.path)); backedUpEvents.add(eventChange.path);
      const event = JSON.parse(eventChange.after);
      assert.equal(createHash('sha256').update(eventChange.after).digest('hex'), after[eventChange.path]);
      assert.equal(eventChange.before, null);
      assert.equal(checkpointChange.before === null ? 'missing' : createHash('sha256').update(checkpointChange.before).digest('hex'), event.previousHash);
      assert.equal(createHash('sha256').update(checkpointChange.after).digest('hex'), event.checkpointHash);
    }
    const launcher = join(workspace, '.game-studio/run.cjs');
    const observed = JSON.parse(run(launcher, ['checkpoint', 'show', '--project', workspace, '--json'])).data;
    const stage = JSON.parse(run(launcher, ['config', 'get', 'project.stage', '--project', workspace, '--json'])).data.settings['project.stage'].value;
    await writeFile(join(directory, 'checkpoint-readback.json'), JSON.stringify(observed, null, 2), { mode: 0o600 });
    if (observed.fields.Branch) assert.equal(observed.fields.Branch.replace(/^`|`$/g, ''), observed.git.branch);
    if (observed.fields.Stage) assert.equal(observed.fields.Stage.replace(/^`|`$/g, ''), stage);
    report.checkpointChainVerified = true;
  } else {
    assert.deepEqual(checkpointEvents, []); assert.deepEqual(transactionBackups, []);
  }
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  // Success is pending semantic review, not an automatic behavior pass.
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
