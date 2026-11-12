// Explicit native-host acceptance; not called by the installed toolkit or unit tests.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { systemsDesignerScenarios } from './fixtures/systems-designer-cases.mjs';

const scenarioName = process.argv[2] ?? 'formula-range';
if (process.argv.length > 3 || !Object.hasOwn(systemsDesignerScenarios, scenarioName)) {
  throw new Error(`Choose ${Object.keys(systemsDesignerScenarios).join(', ')}`);
}
const scenario = systemsDesignerScenarios[scenarioName];
const roleName = 'game-studio-systems-designer';
const roleIntroduction = 'You are the Systems Designer for an indie game project.';
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-systems-designer-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(packageRoot, '..');
const npm = await npmPath();
function run(entry, args) {
  return execFileSync(process.execPath, [entry, ...args], {
    cwd: directory, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
const archive = join(directory, packed.filename);
run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const workspace = join(directory, 'Systems math 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const hashes = {};
for (const name of scenario.roles ?? [roleName]) {
  const path = `.codex/agents/${name}.toml`;
  const installed = await readFile(join(workspace, path));
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)));
  hashes[path] = digest(installed);
}
const sharedResources = ['studio/docs/roles/systems-designer.md'];
if (scenario.workflow) sharedResources.push('studio/scripts/review-receipts.mjs');
for (const path of sharedResources) {
  const installed = await readFile(join(workspace, '.game-studio/node_modules/@t-x-r/game-studio/resources', path));
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)));
  hashes[path] = digest(installed);
}
if (scenario.workflow) {
  const skill = '.agents/skills/game-studio-design-review';
  for (const relative of ['SKILL.md', 'references/freshness-and-inputs.md', 'references/assessment-and-output.md', 'references/specialists.md', 'references/follow-up-and-records.md', 'scripts/review-receipts.mjs']) {
    const path = `${skill}/${relative}`;
    const installed = await readFile(join(workspace, path));
    assert.deepEqual(installed, await readFile(join(sourceRoot, path)));
    hashes[path] = digest(installed);
  }
}
const marker = `SYSTEMS_CONFIG_${randomUUID()}`;
await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${marker}"\n[agents]\nenabled = true\nmax_concurrent_threads_per_session = ${scenario.workflow ? 4 : 1}\n`);
async function snapshot() {
  const files = {};
  for (const entry of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const relative = path.slice(workspace.length + 1).replaceAll('\\', '/');
    if (!relative.startsWith('.git/')) files[relative] = digest(await readFile(path));
  }
  return files;
}
const before = await snapshot();
await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
const profile = `game-studio-systems-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const prompt = scenario.workflow
    ? `${scenario.request} Node is available at ${process.execPath}.`
    : `Use native custom-role selection to delegate exactly one task to ${roleName}: ${scenario.request} The child may inspect the installed runtime with Node at ${process.execPath}. Wait for completion and summarize its actual findings, artifacts and remaining decisions. You as parent must not inspect project files, run shell commands or write the answer yourself. Do not simulate the role with a generic agent; if unavailable, report ROLE_SELECTION_UNAVAILABLE.`;
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  if (!scenario.workflow) common.push('-c', 'skills.include_instructions=false');
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(marker));
  assert.ok(!preflight.stdout.includes(roleIntroduction));
  const args = ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: scenarioName, workspace, args, hashes, packageIntegrity: packed.integrity, syntheticInputs: true }, null, 2));
  const timeoutMs = scenario.timeoutMs ?? 600000;
  console.log(JSON.stringify({ directory, status: 'running', timeoutMs }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !Object.hasOwn(before, path));
  const allowed = scenario.allowedChanges ?? [];
  const outsideScope = [...changed, ...added].filter(path => !allowed.includes(path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: scenarioName, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review actual child selection, inherited runtime, complete formula mathematics, scope, artifacts and specialist sequence against systems-designer-codex.md. Exit 0 is not a behavior pass.',
    preservedFiles: Object.keys(before).filter(path => after[path] === before[path]).length, changed, added, outsideScope, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }, null, 2));
  assert.equal(result.exitCode, 0, result.stderr || result.stdout);
  assert.deepEqual(outsideScope, []);
  for (const path of scenario.expectedFiles ?? []) assert.ok(after[path], `Missing authorized output: ${path}`);
  for (const path of scenario.preservePrefix ?? []) {
    const content = await readFile(join(workspace, path), 'utf8');
    assert.ok(content.startsWith(scenario.inputs[path]), `Existing prefix changed: ${path}`);
    assert.ok(content.length > scenario.inputs[path].length, `No section appended: ${path}`);
  }
  if (!allowed.length) assert.deepEqual(after, before);
  process.exitCode = 3; // Semantic and native-role review remains mandatory.
} finally {
  await rm(profilePath, { force: true });
}
