// Opt-in native Codex acceptance; never launched by the installed toolkit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { architectureReviewScenarios } from './fixtures/architecture-review-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(architectureReviewScenarios, name), `Choose ${Object.keys(architectureReviewScenarios).join(', ')}`);
const scenario = architectureReviewScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-architecture-review-')));
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
const workspace = join(directory, 'Harbor review 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const skillRoot = '.agents/skills/game-studio-architecture-review';
const paths = [`${skillRoot}/SKILL.md`,
  ...['inputs-and-freshness', 'requirements-and-traceability', 'conflicts-and-engine', 'engine-lens', 'report-and-handoff', 'writes-and-records'].map(ref => `${skillRoot}/references/${ref}.md`),
  'studio/scripts/review-receipts.mjs', 'studio/scripts/registry.mjs', 'studio/docs/integration.md', 'studio/docs/recovery.md'];
const hashes = {}, installedPaths = {};
for (const path of paths) {
  const actual = path.startsWith('.agents/') ? join(workspace, path)
    : JSON.parse(run(join(workspace, '.game-studio/run.cjs'), ['resource', 'path', path, '--json'], workspace)).data.path;
  const installed = await readFile(actual);
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(installed).digest('hex');
  installedPaths[path] = relative(workspace, actual).replaceAll('\\', '/');
}
const configMarker = `ARCHITECTURE_REVIEW_CONFIG_${randomUUID()}`;
await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${configMarker}"\n`);
if (scenario.receipt) {
  const inputPaths = [...new Set(['AGENTS.md', '.codex/config.toml', '.game-studio/run.cjs', '.game-studio/package.json', '.game-studio/runtime-lock.json',
    ...Object.keys(scenario.inputs), ...Object.values(installedPaths)])];
  const stamps = run(join(workspace, installedPaths['studio/scripts/review-receipts.mjs']), ['hash', ...inputPaths], workspace);
  const path = join(workspace, 'docs/architecture/architecture-review-2026-11-10.md');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `# Architecture Review Report\nDate: ${scenario.receipt.date}\nMode: ${scenario.receipt.mode}\nWorkflow: ${scenario.receipt.workflow}\nEngine: Godot 4.6\nScope: Two system GDDs and three ADRs; document assessment only.\n${stamps}\n## Traceability Summary\nThree registered requirements traced to Accepted ADRs.\n## Verdict: ${scenario.receipt.verdict}\nPrior documentary assessment; no runtime/test execution or independent specialist invoked.\n`);
  for (const [path, content] of Object.entries(scenario.afterReceipt ?? {})) await writeFile(join(workspace, path), content);
  for (const path of scenario.removeAfterReceipt ?? []) await rm(join(workspace, path));
}
async function snapshot() {
  const files = {};
  for (const entry of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const relativePath = relative(workspace, path).replaceAll('\\', '/');
    if (!relativePath.startsWith('.git/')) files[relativePath] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return files;
}
const before = await snapshot();
const originals = {};
for (const path of scenario.allowedChanges ?? []) if (before[path]) originals[path] = await readFile(join(workspace, path), 'utf8');
await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
await writeFile(join(directory, 'originals.json'), JSON.stringify(originals, null, 2));
const profile = `game-studio-architecture-review-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0); assert.ok(preflight.stdout.includes(configMarker)); assert.ok(preflight.stdout.includes('game-studio-architecture-review'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, installedPaths, packageIntegrity: packed.integrity, syntheticPriorReview: Boolean(scenario.receipt) }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 720000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const outsideScope = [...changed.filter(path => !(scenario.allowedChanges ?? []).includes(path)), ...added.filter(path => !scenario.expectedFiles.includes(path))];
  const missingPlannedArtifacts = scenario.expectedFiles.filter(path => !added.includes(path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review actual scope, reads, matrix/verdict, no-spawn lens order, receipts, stable TR identities and field-level authorized effects against architecture-review-codex.md.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, outsideScope, missingPlannedArtifacts, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(outsideScope, []);
  for (const path of scenario.appendOnly ?? []) if (changed.includes(path)) assert.ok((await readFile(join(workspace, path), 'utf8')).startsWith(originals[path]), `${path}: prior bytes must be preserved`);
  for (const [path, expected] of Object.entries(scenario.exactChanges ?? {})) if (changed.includes(path)) assert.equal(await readFile(join(workspace, path), 'utf8'), expected, `${path}: only the named status cell may change`);
  for (const [path, lines] of Object.entries(scenario.preserveLines ?? {})) for (const line of lines) assert.ok((await readFile(join(workspace, path), 'utf8')).split('\n').includes(line), `${path}: unrelated row removed or changed`);
  const registryPath = 'docs/architecture/tr-registry.yaml';
  if (scenario.preserveRegistrySystems?.length && changed.includes(registryPath)) {
    const beforeEntries = parse(originals[registryPath]).requirements;
    const afterEntries = parse(await readFile(join(workspace, registryPath), 'utf8')).requirements;
    for (const system of scenario.preserveRegistrySystems) assert.deepEqual(afterEntries.filter(entry => entry.system === system), beforeEntries.filter(entry => entry.system === system), `Unreviewed registry system ${system} changed`);
  }
  // Missing output may reflect a legitimate unresolved-input stop; review the actual cause.
  // No native exit or wrapper assertion establishes content quality automatically.
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
