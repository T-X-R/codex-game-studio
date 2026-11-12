// Opt-in fresh-session follow-up to an actual native review; never installed.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { runProcess } from '../dist/process.js';
import { safePath } from '../dist/files.js';

assert.equal(process.argv.length, 4, 'Usage: node test/design-review-reuse-host.mjs <completed-native-run> <gdd-path>');
const sourceRun = await realpath(resolve(process.argv[2]));
const fixture = JSON.parse(await readFile(join(sourceRun, 'fixture.json'), 'utf8'));
const previous = JSON.parse(await readFile(join(sourceRun, 'report.json'), 'utf8'));
assert.equal(previous.exitCode, 0, 'The preceding native process must have finished successfully; semantic review is still required.');
const workspace = await realpath(fixture.workspace);
const gdd = relative(workspace, await safePath(workspace, process.argv[3])).replaceAll('\\', '/');
await readFile(join(workspace, gdd));
const beforePrevious = JSON.parse(await readFile(join(sourceRun, 'before.json'), 'utf8'));
const afterPrevious = JSON.parse(await readFile(join(sourceRun, 'after.json'), 'utf8'));
const reviewLog = `design/gdd/reviews/${basename(gdd, '.md')}-review-log.md`;
assert.ok(afterPrevious[reviewLog] && afterPrevious[reviewLog] !== beforePrevious[reviewLog],
  'The preceding native run must actually have written the requested GDD review record.');

async function snapshot() {
  const files = {};
  for (const entry of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const key = relative(workspace, path).replaceAll('\\', '/');
    if (!key.startsWith('.git/')) files[key] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return files;
}
const before = await snapshot();
assert.deepEqual(before, afterPrevious, 'Reuse must start from the exact preceding workspace, without regenerated receipts or reinstalling.');
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-design-review-reuse-')));
await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
const profile = `game-studio-review-reuse-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const prompt = `Review ${gdd} before implementation using the configured review mode and installed toolkit. This assignment is read-only: do not change any project files, tracking, configuration, stage or checkpoints. Work offline; do not install packages, implement game code, run builds/tests, commit or publish. Stop after reporting your assessment. Node is available at ${process.execPath}.`;
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes('game-studio-design-review'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ sourceRun, sourceThreadId: previous.threadId, workspace, gdd,
    args, packageIntegrity: fixture.packageIntegrity, hashes: fixture.hashes, syntheticPriorReview: false }, null, 2));
  console.log(JSON.stringify({ directory, sourceRun, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: 1200000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: 'actual-review-fresh-session', sourceRun, sourceThreadId: previous.threadId,
    threadId: events.find(event => event.type === 'thread.started')?.thread_id, exitCode: result.exitCode,
    client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    changed: Object.keys(before).filter(path => before[path] !== after[path]), added: Object.keys(after).filter(path => !Object.hasOwn(before, path)),
    preservedFiles: Object.keys(before).filter(path => before[path] === after[path]).length,
    status: 'not_assessed', reason: 'Independently inspect prior native verdict, actual receipt coverage, freshness observations and fresh-session behavior. Process success is not semantic acceptance.' };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.equal(result.exitCode, 0);
  assert.ok(report.threadId && report.threadId !== previous.threadId);
  assert.deepEqual(after, before);
  process.exitCode = 3; // Retain the same manual evidence-review boundary as other native hosts.
} finally { await rm(profilePath, { force: true }); }
