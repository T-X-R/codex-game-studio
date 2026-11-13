// Opt-in same-session revision acceptance. Never installed; never rebuilds a fixture.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess } from '../dist/process.js';
import { safePath } from '../dist/files.js';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const architecture = 'docs/architecture/architecture.md';
const checkpoint = 'production/session-state/active.md';
const eventPattern = /^production\/session-logs\/events\/[a-f0-9]+\.json$/;
const backupPattern = /^\.game-studio\/backups\/[a-f0-9-]+\.json$/;
const prompt = 'Revise the flagged items first, preserve my settled scope/decisions, do not accept concerns or run downstream work.';
const parseLines = bytes => bytes.toString('utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
const context = row => Object.fromEntries(['model', 'effort', 'approval_policy', 'sandbox_policy'].map(key => [key, row.payload[key]]));

export async function snapshot(workspace) {
  const files = {}; const symlinks = {};
  const directories = [workspace];
  while (directories.length) {
    const directory = directories.pop();
    // Recursive readdir can descend into directory links on supported Node versions.
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const key = relative(workspace, path).replaceAll('\\', '/');
      if (key === '.git') continue;
      if (entry.isSymbolicLink()) symlinks[key] = await readlink(path);
      else if (entry.isDirectory()) directories.push(await safePath(workspace, key));
      else if (entry.isFile()) files[key] = hash(await readFile(await safePath(workspace, key)));
    }
  }
  return { files, symlinks };
}

export async function freezeWorkspace(workspace, expected, destination) {
  // Resolve every source without following links, including parent components.
  for (const [key, digest] of Object.entries(expected)) {
    const source = await safePath(workspace, key);
    assert.ok((await lstat(source)).isFile(), `Not a regular file: ${key}`);
    const bytes = await readFile(source);
    assert.equal(hash(bytes), digest, `Source changed before freezing: ${key}`);
    const target = await safePath(destination, key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes, { flag: 'wx', mode: 0o444 });
    assert.equal(hash(await readFile(target)), digest, `Frozen bytes do not match: ${key}`);
  }
  assert.deepEqual((await snapshot(destination)).files, expected);
}

export function verifyScope(before, after) {
  assert.deepEqual(after.symlinks, before.symlinks, 'Symbolic links changed');
  const changed = Object.keys(before.files).filter(key => before.files[key] !== after.files[key]);
  const added = Object.keys(after.files).filter(key => !Object.hasOwn(before.files, key));
  assert.deepEqual(changed.filter(key => ![architecture, checkpoint].includes(key)), [], 'Changed outside revision scope');
  assert.deepEqual(added.filter(key => !eventPattern.test(key) && !backupPattern.test(key)), [], 'Added outside revision scope');
  assert.ok(after.files[architecture] && after.files[checkpoint], 'Revision may not delete its documents');
  return { changed, added };
}

async function verifyTransactions(workspace, before, after, added) {
  const events = added.filter(key => eventPattern.test(key));
  const backups = added.filter(key => backupPattern.test(key));
  assert.ok(events.length > 0, 'Revision must save actual recovery evidence');
  assert.equal(backups.length, events.length);
  const chain = new Map(); const backedUp = new Set();
  for (const key of events) {
    const event = JSON.parse(await readFile(join(workspace, key), 'utf8'));
    assert.equal(event.type, 'checkpoint.saved'); assert.equal(event.schemaVersion, 1);
    assert.equal(key, `production/session-logs/events/${event.eventId}.json`);
    assert.ok(!chain.has(event.previousHash), 'Forked checkpoint chain');
    chain.set(event.previousHash, event.checkpointHash);
  }
  let cursor = before.files[checkpoint]; let count = 0;
  while (chain.has(cursor)) {
    const next = chain.get(cursor); chain.delete(cursor); cursor = next; count++;
  }
  assert.equal(count, events.length); assert.equal(cursor, after.files[checkpoint]);
  for (const key of backups) {
    const backup = JSON.parse(await readFile(join(workspace, key), 'utf8'));
    assert.equal(backup.project, workspace); assert.equal(backup.changes.length, 2);
    const state = backup.changes.find(change => change.path === checkpoint);
    const eventChange = backup.changes.find(change => events.includes(change.path));
    assert.ok(state && eventChange); assert.equal(eventChange.before, null);
    assert.ok(!backedUp.has(eventChange.path)); backedUp.add(eventChange.path);
    assert.equal(hash(eventChange.after), after.files[eventChange.path]);
    const event = JSON.parse(eventChange.after);
    assert.equal(hash(state.before), event.previousHash);
    assert.equal(hash(state.after), event.checkpointHash);
  }
  return { checkpointEvents: events, transactionBackups: backups, checkpointChainVerified: true };
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length === 2 || (args.length === 3 && args[2] === '--preflight'),
    'Usage: node test/create-architecture-resume-host.mjs <completed-native-run> <source-session-jsonl> [--preflight]');
  const sourceRun = await realpath(resolve(args[0]));
  const sourceSession = await realpath(resolve(args[1]));
  const fixture = JSON.parse(await readFile(join(sourceRun, 'fixture.json'), 'utf8'));
  const previous = JSON.parse(await readFile(join(sourceRun, 'report.json'), 'utf8'));
  assert.equal(previous.scenario, 'full-native', 'Expected a completed full-native source run');
  assert.equal(previous.exitCode, 0, 'Source native process did not complete');
  const workspace = await realpath(fixture.workspace);
  const priorAfter = JSON.parse(await readFile(join(sourceRun, 'after.json'), 'utf8'));
  const before = await snapshot(workspace);
  assert.deepEqual(before.files, priorAfter, 'Workspace must match the exact previous after.json');
  assert.ok(before.files[architecture] && before.files[checkpoint]);
  const prefix = await readFile(sourceSession); const rows = parseLines(prefix);
  const meta = rows.find(row => row.type === 'session_meta')?.payload;
  assert.equal(meta?.id, previous.threadId, 'Source session does not match completed run');
  assert.equal(await realpath(meta.cwd), workspace, 'Source session workspace differs');
  assert.ok(rows.some(row => row.payload?.type === 'task_complete'), 'Source session has no completed turn');
  const previousContext = context(rows.filter(row => row.type === 'turn_context').at(-1));
  assert.equal(previousContext.sandbox_policy.type, 'workspace-write');
  assert.equal(previousContext.sandbox_policy.network_access, false);
  const version = await runProcess('codex', ['--version']);
  assert.equal(version.exitCode, 0); assert.equal(version.stdout.trim(), previous.client);
  if (args[2] === '--preflight') {
    console.log(JSON.stringify({ status: 'preflight_ok', sourceRun, sourceSession, threadId: previous.threadId,
      workspace, files: Object.keys(before.files).length, sourceTracePrefixSha256: hash(prefix), previousContext,
      note: 'Read-only preflight; no profile, snapshot destination or model request created.' }));
    return;
  }

  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-architecture-revision-')));
  const writeJson = (name, data) => writeFile(join(directory, name), JSON.stringify(data, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  await writeJson('before.json', before.files); await writeJson('before-symlinks.json', before.symlinks);
  await writeFile(join(directory, 'source-session-prefix.jsonl'), prefix, { flag: 'wx', mode: 0o400 });
  const sourceEvidenceHashes = {};
  await mkdir(join(directory, 'source-evidence'));
  for (const name of ['fixture.json', 'report.json', 'events.jsonl', 'before.json', 'after.json', 'final.txt']) {
    const bytes = await readFile(join(sourceRun, name)); sourceEvidenceHashes[name] = hash(bytes);
    await writeFile(join(directory, 'source-evidence', name), bytes, { flag: 'wx', mode: 0o400 });
  }
  const frozen = join(directory, 'before-workspace');
  await freezeWorkspace(workspace, priorAfter, frozen);
  // Freeze directories after copying, and recheck the live source before any continuation.
  for (const entry of await readdir(frozen, { recursive: true, withFileTypes: true })) {
    if (entry.isDirectory()) await chmod(join(entry.parentPath, entry.name), 0o555);
  }
  await chmod(frozen, 0o555);
  assert.deepEqual(await snapshot(workspace), before, 'Workspace changed during freezing');
  assert.deepEqual(await readFile(sourceSession), prefix, 'Source session changed during freezing');
  const profile = `game-studio-architecture-resume-${randomUUID()}`;
  const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
  await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
  try {
    const nativeArgs = ['exec', '--profile', profile, '--cd', workspace, '--sandbox', 'workspace-write', '--strict-config',
      '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', 'resume', '--json', '-o', join(directory, 'final.txt'), previous.threadId, prompt];
    await writeJson('fixture.json', { scenario: 'same-session-architecture-revision', sourceRun, sourceSession,
      sourceThreadId: previous.threadId, workspace, frozenWorkspace: frozen, sourceEvidenceHashes,
      sourceTracePrefixBytes: prefix.length, sourceTracePrefixSha256: hash(prefix), previousContext,
      args: nativeArgs, prompt, packageIntegrity: fixture.packageIntegrity, hashes: fixture.hashes });
    console.log(JSON.stringify({ directory, sourceRun, threadId: previous.threadId, status: 'running' }));
    const result = await runProcess('codex', nativeArgs, { cwd: workspace, timeoutMs: 1200000 });
    await writeFile(join(directory, 'events.jsonl'), result.stdout, { flag: 'wx', mode: 0o600 });
    await writeFile(join(directory, 'stderr.txt'), result.stderr, { flag: 'wx', mode: 0o600 });
    const after = await snapshot(workspace);
    await writeJson('after.json', after.files); await writeJson('after-symlinks.json', after.symlinks);
    const trace = await readFile(sourceSession);
    await writeFile(join(directory, 'resumed-session.jsonl'), trace, { flag: 'wx', mode: 0o400 });
    const events = parseLines(result.stdout);
    const report = { scenario: 'same-session-architecture-revision', sourceRun, sourceSession, sourceThreadId: previous.threadId,
      threadId: events.find(event => event.type === 'thread.started')?.thread_id, exitCode: result.exitCode,
      client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
      sourceTracePrefixBytes: prefix.length, sourceTracePrefixSha256: hash(prefix), resumedTraceSha256: hash(trace),
      status: 'not_assessed', reason: 'Native continuation requires independent review of actual revision, scope, history, inheritance and unresolved findings. Exit zero is not semantic acceptance.' };
    await writeJson('report.json', report);
    assert.equal(report.threadId, previous.threadId, 'Continuation must use the same session');
    assert.deepEqual(trace.subarray(0, prefix.length), prefix, 'Original trace prefix changed');
    for (const [name, digest] of Object.entries(sourceEvidenceHashes)) assert.equal(hash(await readFile(join(sourceRun, name))), digest, `Original run evidence changed: ${name}`);
    assert.deepEqual((await snapshot(frozen)).files, priorAfter, 'Frozen original workspace changed');
    const appended = parseLines(trace.subarray(prefix.length));
    const contexts = appended.filter(row => row.type === 'turn_context').map(context);
    assert.ok(contexts.length, 'No resumed turn context');
    for (const actual of contexts) assert.deepEqual(actual, previousContext, 'Resumed model or permissions changed');
    Object.assign(report, verifyScope(before, after), { contexts, originalTracePrefixPreserved: true, originalEvidencePreserved: true,
      frozenWorkspaceVerified: true, preservedFiles: Object.keys(before.files).filter(key => before.files[key] === after.files[key]).length });
    Object.assign(report, await verifyTransactions(workspace, before, after, report.added));
    await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
    console.log(JSON.stringify({ directory, ...report }));
    process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
  } finally { await rm(profilePath); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
