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
import { designReviewScenarios } from './fixtures/design-review-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(designReviewScenarios, name), `Choose ${Object.keys(designReviewScenarios).join(', ')}`);
const scenario = designReviewScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-design-review-')));
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
const workspace = join(directory, 'Lantern review 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const skillRoot = '.agents/skills/game-studio-design-review';
const paths = [`${skillRoot}/SKILL.md`, `${skillRoot}/scripts/review-receipts.mjs`,
  ...['freshness-and-inputs', 'assessment-and-output', 'specialists', 'follow-up-and-records'].map(ref => `${skillRoot}/references/${ref}.md`),
  ...['game-designer', 'qa-lead', 'creative-director'].map(role => `.codex/agents/game-studio-${role}.toml`)];
const hashes = {};
for (const path of paths) {
  const installed = await readFile(join(workspace, path));
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(installed).digest('hex');
}
for (const role of scenario.removeRoles ?? []) await rm(join(workspace, '.codex/agents', `game-studio-${role}.toml`), { force: true });
if (scenario.receipt) {
  const inputPaths = [...new Set(['AGENTS.md', ...Object.keys(scenario.inputs), ...paths.filter(path => path.startsWith(skillRoot))])];
  const stamps = run(join(workspace, skillRoot, 'scripts/review-receipts.mjs'), ['hash', ...inputPaths], workspace);
  const logPath = join(workspace, 'design/gdd/reviews/resolve-hit-review-log.md');
  await mkdir(dirname(logPath), { recursive: true });
  await writeFile(logPath, `# Review history\nKEEP-PRIOR-REVIEW\n\n## Review — 2026-11-10 — Verdict: ${scenario.receipt.verdict}\nReview mode: ${scenario.receipt.mode} · Workflow: ${scenario.receipt.workflow}\nScope signal: S\nSpecialists: none\nBlocking items: 0 | Recommended: 0\nSummary: The supplied hit rule was assessed with the stated inputs.\nPrior verdict resolved: First review\nFindings:\n- none\n${stamps}`);
  if (scenario.incompleteLatestReceipt) {
    const contextStamp = run(join(workspace, skillRoot, 'scripts/review-receipts.mjs'), ['hash', 'design/gdd/game-concept.md'], workspace);
    await writeFile(logPath, await readFile(logPath, 'utf8') + `\n## Review — 2026-11-11 — Verdict: APPROVED\nReview mode: full · Workflow: full\nSummary: The supplied hit rule was assessed with the stated inputs.\n${contextStamp}`);
  }
  for (const [path, content] of Object.entries(scenario.afterReceipt ?? {})) await writeFile(join(workspace, path), content);
}
const configMarker = `DESIGN_REVIEW_CONFIG_${randomUUID()}`;
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
const profile = `game-studio-design-review-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0); assert.ok(preflight.stdout.includes(configMarker)); assert.ok(preflight.stdout.includes('game-studio-design-review'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, packageIntegrity: packed.integrity, syntheticPriorReview: Boolean(scenario.receipt) }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 480000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const outsideScope = [...changed.filter(path => !(scenario.allowedChanges ?? []).includes(path)), ...added.filter(path => !scenario.expectedFiles.includes(path))];
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review actual Skill discovery, source reads, verdict/coverage, specialist sequence, receipts and authorized tracking semantics against design-review-codex.md.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, outsideScope, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(outsideScope, []);
  // Tracking is conditional on the actual verdict; absence alone is not a failure.
  // Native success remains pending semantic review, never an automatic behavior pass.
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
