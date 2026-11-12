// Explicit live Codex acceptance fixture; never invoked by the installed toolkit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { scenarios } from './fixtures/qa-role-cases.mjs';
import { godotScenario } from './fixtures/qa-godot-case.mjs';
import { leadScenarios } from './fixtures/qa-lead-cases.mjs';
import { designerScenarios } from './fixtures/game-designer-cases.mjs';
import { programmerScenarios } from './fixtures/lead-programmer-cases.mjs';
import { gameplayScenarios } from './fixtures/gameplay-programmer-cases.mjs';

const scenarioName = process.argv[2] ?? 'audit';
const cases = { ...scenarios, ...leadScenarios, ...designerScenarios, ...programmerScenarios, ...gameplayScenarios };
if (process.argv.length > 3 || (scenarioName !== 'godot' && !Object.hasOwn(cases, scenarioName))) throw new Error(`Choose ${[...Object.keys(cases), 'godot'].join(', ')}`);
const scenario = scenarioName === 'godot' ? await godotScenario() : cases[scenarioName];
const roleName = scenario.role ?? 'game-studio-qa-tester';
const timeoutMs = scenario.timeoutMs ?? 480000;

const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-qa-role-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const npm = await npmPath();
function run(entry, args) {
  return execFileSync(process.execPath, [entry, ...args], { cwd: directory, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
const archive = join(directory, packed.filename);
run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const workspace = join(directory, 'QA game 测试');
run(cli, ['init', workspace, '--engine', scenario.engine ?? 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
await scenario.prepare?.(workspace, directory);
const rolePath = `.codex/agents/${roleName}.toml`;
const role = await readFile(join(workspace, rolePath), 'utf8');
assert.equal(role, await readFile(join(packageRoot, '..', rolePath), 'utf8'));
const configMarker = `QA_CONFIG_${randomUUID()}`;
await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${configMarker}"\n[agents]\nenabled = true\nmax_concurrent_threads_per_session = 1\n`);
async function snapshot() {
  const files = {};
  for (const entry of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const relative = path.slice(workspace.length + 1).replaceAll('\\', '/');
    if (relative.startsWith('.git/') || scenario.ignoredFile?.(relative)) continue;
    files[relative] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return files;
}
const before = await snapshot();
await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
const profileName = `game-studio-qa-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profileName}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const request = scenario.request;
  const prompt = `Use native custom-role selection to delegate exactly one task to ${roleName}: ${request} The child may use the installed runtime within the assigned scope; its Node executable is ${process.execPath}. Wait for completion and summarize its actual findings, artifacts and remaining decisions. You as parent must not inspect workspace files, run shell commands or write the report yourself. Do not simulate this role with a generic agent; if unavailable, report ROLE_SELECTION_UNAVAILABLE.`;
  const common = ['--profile', profileName, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories',
    '-c', 'skills.include_instructions=false', '--cd', workspace];
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(configMarker));
  assert.ok(!preflight.stdout.includes(scenario.roleIntroduction ?? 'You are the QA Tester for an indie game project.'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: scenarioName, role: roleName, workspace, args, roleSha256: before[rolePath] }, null, 2));
  console.log(JSON.stringify({ directory, status: 'running', timeoutMs }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const outsideScope = added.filter(path => scenario.sandbox === 'read-only' || !(scenario.allowedNewFile?.(path) ?? (path.startsWith('production/qa/') && path.endsWith('.md'))));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: scenarioName, role: roleName, sandbox: scenario.sandbox, status: 'not_assessed', reason: `Review native parent/child trace and semantic output against ${scenario.behaviorSpec ?? 'studio-tests/roles/qa-tester-codex.md'}.`,
    client: version.stdout.trim(), exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    preservedFiles: Object.keys(before).length, changed, added, outsideScope, roleSha256: before[rolePath] };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(changed, []); assert.deepEqual(outsideScope, []);
  for (const path of scenario.expectedFiles) assert.ok(added.includes(path), `Missing expected artifact: ${path}`);
  if (scenario.sandbox === 'read-only') assert.deepEqual(added, []);
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
