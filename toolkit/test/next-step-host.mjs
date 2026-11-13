// Opt-in native observation; never runs from an installed game workflow.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { nextStepScenarios } from './fixtures/next-step-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(nextStepScenarios, name), `Choose ${Object.keys(nextStepScenarios).join(', ')}`);
const scenario = nextStepScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-next-step-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(packageRoot, '..');
const npm = await npmPath();
function run(entry, args, cwd = directory) {
  return execFileSync(process.execPath, [entry, ...args], { cwd, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
const archive = join(directory, packed.filename);
run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const workspace = join(directory, 'Next action 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', '--initial-branch=fixture-next-step', workspace])).exitCode, 0);
// The fixture owns stage absence as well as explicit stage values.
await rm(join(workspace, 'production/stage.txt'), { force: true });
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const skill = '.agents/skills/game-studio-next-step';
const runtime = '.game-studio/node_modules/@t-x-r/game-studio';
const hashes = {};
const resources = [`${skill}/SKILL.md`, ...['minimal', 'studio', 'output'].map(ref => `${skill}/references/${ref}.md`)];
for (const path of resources) {
  const bytes = await readFile(join(workspace, path));
  assert.deepEqual(bytes, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(bytes).digest('hex');
}
for (const path of ['studio/docs/workflow-catalog.yaml', 'studio/scripts/story-status.mjs']) {
  const bytes = await readFile(join(workspace, runtime, 'resources', path));
  assert.deepEqual(bytes, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(bytes).digest('hex');
}
// The resource is a thin import: record and compare the actual packaged logic too.
for (const path of ['story-status.js', 'artifact-check.js', 'checkpoint.js', 'config.js', 'engine.js', 'files.js']) {
  const bytes = await readFile(join(workspace, runtime, 'dist', path));
  assert.deepEqual(bytes, await readFile(join(packageRoot, 'dist', path)), path);
  hashes[`dist/${path}`] = createHash('sha256').update(bytes).digest('hex');
}
for (const path of scenario.removeResources ?? []) await rm(join(workspace, runtime, 'resources', path));
const marker = `NEXT_STEP_CONFIG_${randomUUID()}`;
await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${marker}"\n`);
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
const profile = `game-studio-next-step-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0); assert.ok(preflight.stdout.includes(marker)); assert.ok(preflight.stdout.includes('game-studio-next-step'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes,
    packageIntegrity: packed.integrity, syntheticInputs: true, intentionallyRemovedResources: scenario.removeResources ?? [] }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 600000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !Object.hasOwn(before, path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Inspect actual config/checkpoint/catalog/helper reads and ordering, single observation counts, primary action, scope/capability honesty and complete unchanged files. Exit zero is not behavioral acceptance.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }, null, 2));
  assert.deepEqual(after, before);
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath, { force: true }); }
