// Opt-in A040 fixture. No build, install outside its temporary project, or auto-PASS.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { safePath } from '../dist/files.js';
import { uiScenarios, mutable, allowedNew } from './fixtures/ui-programmer-cases.mjs';

const roleName = 'game-studio-ui-programmer';
const rolePath = `.codex/agents/${roleName}.toml`;
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = bytes => JSON.parse(bytes.toString());
const lines = bytes => bytes.toString().split('\n').filter(Boolean).map(JSON.parse);
const context = rows => rows.filter(row => row.type === 'turn_context').map(row =>
  Object.fromEntries(['model', 'effort', 'approval_policy', 'sandbox_policy'].map(key => [key, row.payload[key]])));
const engineSidecar = path => ['src/inventory_model.gd.uid', 'i18n/en.po.import', 'tests/ui_inventory_observer.gd.uid', 'src/ui/inventory_screen.gd.uid', 'src/ui/inventory_screen.tscn.uid'].includes(path);
const writeJson = (directory, name, value) => writeFile(join(directory, name), JSON.stringify(value, null, 2)+'\n', { flag: 'wx', mode: 0o600 });

async function snapshot(workspace) {
  const files = {}; const symlinks = {}; const todo = [workspace];
  while (todo.length) {
    const directory = todo.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const key = relative(workspace, join(directory, entry.name)).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) symlinks[key] = await readlink(join(directory, entry.name));
      else if (key === '.git' || key === '.godot') continue;
      else if (entry.isDirectory()) todo.push(await safePath(workspace, key));
      else if (entry.isFile()) files[key] = hash(await readFile(await safePath(workspace, key)));
    }
  }
  return { files, symlinks };
}
async function engineEvidence(expected, required) {
  const executable = process.env.GAME_STUDIO_GODOT;
  if (!executable) return { status: required ? 'not_assessed' : 'not_requested', reason: 'GAME_STUDIO_GODOT is not set; no editor is installed or downloaded by this host.' };
  let actualPath;
  try { actualPath = await realpath(executable); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return { status: 'not_assessed', executable, reason: 'Configured editor path is missing.' }; }
  const result = await runProcess(actualPath, ['--version'], { timeoutMs: 30000 });
  const version = result.stdout.trim();
  const compatible = result.exitCode === 0 && (version === expected || version.startsWith(expected+'.'));
  return { status: compatible ? 'available' : 'not_assessed', executable: actualPath, expected,
    version, executableSha256: hash(await readFile(actualPath)), ...result,
    reason: compatible ? 'Version probe only; GUI/render/input are not yet assessed.' : 'Actual editor does not match fixture pin.' };
}
function scope(before, after, writable, resumed) {
  const changed = Object.keys(before.files).filter(key => before.files[key] !== after.files[key]);
  const added = Object.keys(after.files).filter(key => !Object.hasOwn(before.files, key));
  const outsideScope = [...changed.filter(key => !writable || !resumed || !mutable(key) || !after.files[key]),
    ...added.filter(key => !writable || (!allowedNew(key) && !engineSidecar(key)))];
  if (Object.keys(before.symlinks).length !== Object.keys(after.symlinks).length ||
    Object.entries(before.symlinks).some(([key, value]) => after.symlinks[key] !== value)) outsideScope.push('[symlink change]');
  return { changed, added, outsideScope };
}
async function freeze(workspace, expected, destination) {
  for (const [key, digest] of Object.entries(expected.files)) {
    const bytes = await readFile(await safePath(workspace, key));
    assert.equal(hash(bytes), digest, `Changed before freezing: ${key}`);
    const target = await safePath(destination, key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes, { flag: 'wx', mode: 0o400 });
  }
  assert.deepEqual((await snapshot(destination)).files, expected.files);
}
async function nativeRun({ directory, workspace, scenarioName, scenario, before, engine, packageIntegrity, prompt, resume }) {
  const profile = `game-studio-ui-${randomUUID()}`;
  const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
  await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
  try {
    const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories',
      '-c', 'skills.include_instructions=false', '--cd', workspace];
    const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
    await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { flag: 'wx', mode: 0o600 });
    assert.equal(preflight.exitCode, 0);
    assert.ok(preflight.stdout.includes('UI_FIXTURE_'));
    assert.ok(!preflight.stdout.includes('You are a UI Programmer for an indie game project.'));
    const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox,
      ...(resume ? ['resume'] : []), '--json', '-o', join(directory, 'final.txt'), ...(resume ? [resume.parentId] : []), prompt];
    await writeJson(directory, 'fixture.json', { scenario: scenarioName, workspace, args, role: roleName,
      roleSha256: before.files[rolePath], packageIntegrity, engine, resume: resume && { sourceRun: resume.sourceRun, parentId: resume.parentId, childId: resume.childId } });
    const version = await runProcess('codex', ['--version']);
    console.log(JSON.stringify({ directory, scenario: scenarioName, status: 'running' }));
    const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs });
    await writeFile(join(directory, 'events.jsonl'), result.stdout, { flag: 'wx', mode: 0o600 });
    await writeFile(join(directory, 'stderr.txt'), result.stderr, { flag: 'wx', mode: 0o600 });
    const after = await snapshot(workspace); await writeJson(directory, 'after.json', after);
    const events = [], eventParseErrors = [];
    for (const [index, line] of result.stdout.split('\n').entries()) if (line.trim()) {
      try { events.push(JSON.parse(line)); } catch { eventParseErrors.push(index+1); }
    }
    const threadId = events.find(row => row.type === 'thread.started')?.thread_id;
    const report = { scenario: scenarioName, role: roleName, client: version.stdout.trim(), exitCode: result.exitCode,
      threadId, eventParseErrors, signal: result.signal, node: process.version, platform: process.platform, arch: process.arch, roleSha256: before.files[rolePath], status: 'not_assessed',
      reason: 'Manual native role/permission/semantic review and independent live UI observation required; native zero is not PASS.',
      ...scope(before, after, scenario.sandbox !== 'read-only' && (resume || !scenario.continuation), Boolean(resume)) };
    await writeJson(directory, 'report.json', report);
    if (resume) {
      assert.equal(threadId, resume.parentId, 'Parent session must continue');
      for (const saved of resume.traces) {
        const updated = await readFile(saved.path);
        await writeFile(join(directory, `${saved.kind}-after.jsonl`), updated, { flag: 'wx', mode: 0o400 });
        assert.deepEqual(updated.subarray(0, saved.bytes.length), saved.bytes, 'Prior trace prefix changed');
        const appended = lines(updated.subarray(saved.bytes.length));
        const contexts = context(appended);
        assert.ok(contexts.length, `${saved.kind} was not actually resumed`);
        for (const actual of contexts) assert.deepEqual(actual, saved.context, 'Model/effort/permissions changed');
      }
      for (const [name, digest] of Object.entries(resume.sourceHashes)) assert.equal(hash(await readFile(join(resume.sourceRun, name))), digest);
      assert.deepEqual((await snapshot(join(directory, 'before-workspace'))).files, before.files);
    }
    console.log(JSON.stringify({ directory, ...report }));
    assert.deepEqual(report.outsideScope, []);
    assert.deepEqual(eventParseErrors, [], 'Native event stream contains malformed or truncated JSON');
    process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
  } finally { await rm(profilePath, { force: true }); }
}

async function fresh(name) {
  assert.ok(Object.hasOwn(uiScenarios, name), `Choose ${Object.keys(uiScenarios).join(', ')}`);
  const scenario = uiScenarios[name];
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-ui-role-')));
  await writeJson(directory, 'inputs.json', scenario.inputs);
  const engine = await engineEvidence(scenario.expectedVersion, scenario.needsEngine);
  await writeJson(directory, 'engine-preflight.json', engine);
  if (scenario.needsEngine && engine.status !== 'available') {
    await writeJson(directory, 'report.json', { scenario: name, status: 'not_assessed', reason: engine.reason });
    console.log(JSON.stringify({ directory, status: 'not_assessed', reason: engine.reason })); process.exitCode = 3; return;
  }
  const npm = await npmPath();
  const run = (entry, args) => execFileSync(process.execPath, [entry, ...args], { cwd: directory, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' } });
  const [packed] = json(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
  const archive = join(directory, packed.filename);
  run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
  const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
  const workspace = join(directory, 'UI game 测试');
  run(cli, ['init', workspace, '--engine', 'godot', '--json']);
  run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
  assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
  for (const [path, content] of Object.entries(scenario.inputs)) {
    await mkdir(dirname(join(workspace, path)), { recursive: true }); await writeFile(join(workspace, path), content);
  }
  const observer = await readFile(new URL('./fixtures/ui-inventory-observer.gd', import.meta.url));
  await mkdir(join(workspace, 'tests'), { recursive: true });
  await writeFile(join(workspace, 'tests/ui_inventory_observer.gd'), observer, { flag: 'wx' });
  assert.deepEqual(await readFile(join(workspace, rolePath)), await readFile(join(packageRoot, '..', rolePath)));
  await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "UI_FIXTURE_${randomUUID()}"\n[agents]\nenabled = true\nmax_concurrent_threads_per_session = 1\n`);
  const before = await snapshot(workspace); await writeJson(directory, 'before.json', before);
  const engineHint = engine.status === 'available' ? `The installed Godot executable is ${JSON.stringify(engine.executable)}, observed version ${engine.version}. It may create engine cache and import/uid sidecars; it is not permission to change project settings.` : 'No compatible engine is established in this turn.';
  const prompt = `Delegate exactly one task to the native custom role ${roleName}: ${scenario.request} ${engineHint} Node is ${JSON.stringify(process.execPath)}. Wait and summarize the actual result and any question. Parent must not read game inputs, implement or write artifacts. Do not replace this role with a generic agent; report ROLE_SELECTION_UNAVAILABLE if unavailable. Keep the child available for a possible owner response.`;
  await nativeRun({ directory, workspace, scenarioName: name, scenario, before, engine, packageIntegrity: packed.integrity, prompt });
}

// Invoke only after a maintainer reviews the actual unanswered owner question.
// This checks continuity and scope, not semantic question quality by keywords.
async function resumeQuestion(source, parentPath, childPath) {
  const sourceRun = await realpath(resolve(source));
  const fixture = json(await readFile(join(sourceRun, 'fixture.json')));
  const previous = json(await readFile(join(sourceRun, 'report.json')));
  const scenario = uiScenarios[fixture.scenario];
  assert.ok(scenario?.continuation && !fixture.resume, 'Only an actual first question run can continue');
  assert.equal(previous.exitCode, 0); assert.deepEqual(previous.outsideScope, []);
  const client = await runProcess('codex', ['--version']);
  assert.equal(client.stdout.trim(), previous.client, 'Continuation requires the original Codex client version');
  const workspace = await realpath(fixture.workspace);
  const before = await snapshot(workspace);
  assert.deepEqual(before, json(await readFile(join(sourceRun, 'after.json'))), 'Question workspace changed');
  assert.deepEqual(before, json(await readFile(join(sourceRun, 'before.json'))), 'First question phase must preserve every file');
  const traces = [];
  for (const [kind, path] of [['parent', parentPath], ['child', childPath]]) {
    const bytes = await readFile(path); const rows = lines(bytes); const meta = rows.find(row => row.type === 'session_meta')?.payload;
    assert.equal(await realpath(meta.cwd), workspace);
    assert.ok(rows.some(row => row.payload?.type === 'task_complete'), 'Trace has no completed turn');
    const contexts = context(rows); assert.ok(contexts.length);
    traces.push({ kind, path: await realpath(path), bytes, meta, context: contexts.at(-1) });
  }
  const [parent, child] = traces;
  assert.equal(parent.meta.id, previous.threadId);
  assert.equal(child.meta.agent_role, roleName);
  assert.equal(child.meta.source?.subagent?.thread_spawn?.parent_thread_id, parent.meta.id);
  assert.deepEqual(child.context, parent.context, 'Original child did not inherit model/permissions');
  const engine = await engineEvidence(scenario.expectedVersion, true);
  if (engine.status !== 'available') { console.log(JSON.stringify(engine)); process.exitCode = 3; return; }
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-ui-answer-')));
  await writeJson(directory, 'before.json', before); await writeJson(directory, 'engine-preflight.json', engine);
  await freeze(workspace, before, join(directory, 'before-workspace'));
  const sourceHashes = {};
  await mkdir(join(directory, 'source-evidence'));
  for (const name of ['fixture.json', 'report.json', 'events.jsonl', 'before.json', 'after.json', 'final.txt', 'inputs.json']) {
    const bytes = await readFile(join(sourceRun, name)); sourceHashes[name] = hash(bytes);
    await writeFile(join(directory, 'source-evidence', name), bytes, { flag: 'wx', mode: 0o400 });
  }
  for (const saved of traces) await writeFile(join(directory, `${saved.kind}-prefix.jsonl`), saved.bytes, { flag: 'wx', mode: 0o400 });
  await writeJson(directory, 'continuity.json', { sourceRun, sourceHashes, traces: traces.map(saved => ({ kind: saved.kind, path: saved.path, id: saved.meta.id,
    prefixBytes: saved.bytes.length, prefixSha256: hash(saved.bytes), context: saved.context })) });
  assert.deepEqual(await snapshot(workspace), before);
  for (const saved of traces) assert.deepEqual(await readFile(saved.path), saved.bytes);
  const prompt = `Send this owner answer to the same existing ${roleName} child (${child.meta.id}), then wait and summarize its actual work: ${scenario.continuation} Godot is ${JSON.stringify(engine.executable)} (${engine.version}); engine cache and import/uid sidecars are allowed. Node is ${JSON.stringify(process.execPath)}. Do not spawn a substitute or implement/read workspace files yourself; report inability to continue the actual child if unavailable.`;
  await nativeRun({ directory, workspace, scenarioName: fixture.scenario, scenario, before, engine, packageIntegrity: fixture.packageIntegrity, prompt,
    resume: { sourceRun, parentId: parent.meta.id, childId: child.meta.id, traces, sourceHashes } });
}

async function observe(source) {
  const sourceRun = await realpath(resolve(source)); const fixture = json(await readFile(join(sourceRun, 'fixture.json')));
  const report = json(await readFile(join(sourceRun, 'report.json')));
  assert.equal(report.exitCode, 0); assert.deepEqual(report.outsideScope, []);
  const workspace = await realpath(fixture.workspace); const before = await snapshot(workspace);
  assert.deepEqual(before, json(await readFile(join(sourceRun, 'after.json'))));
  assert.ok(before.files['src/ui/inventory_screen.tscn'], 'No actual UI scene to observe');
  const engine = await engineEvidence(uiScenarios[fixture.scenario].expectedVersion, true);
  if (engine.status !== 'available') { console.log(JSON.stringify(engine)); process.exitCode = 3; return; }
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-ui-observation-')));
  await writeJson(directory, 'before.json', before);
  await freeze(workspace, before, join(directory, 'before-workspace'));
  const sourceHashes = {};
  await mkdir(join(directory, 'source-evidence'));
  for (const name of ['fixture.json', 'report.json', 'events.jsonl', 'before.json', 'after.json', 'final.txt']) {
    const bytes = await readFile(join(sourceRun, name)); sourceHashes[name] = hash(bytes);
    await writeFile(join(directory, 'source-evidence', name), bytes, { flag: 'wx', mode: 0o400 });
  }
  assert.deepEqual(await snapshot(workspace), before);
  const out = `production/qa/evidence/observer-${randomUUID()}`;
  const args = ['--path', workspace, '--script', 'res://tests/ui_inventory_observer.gd', '--', `res://${out}`];
  const result = await runProcess(engine.executable, args, { cwd: workspace, timeoutMs: 120000 });
  await writeJson(directory, 'execution.json', { sourceRun, sourceHashes, engine, args, ...result });
  const after = await snapshot(workspace); await writeJson(directory, 'after.json', after);
  const changes = scope(before, after, true, false);
  const outsideObservation = changes.added.filter(path => !path.startsWith(out+'/') && !engineSidecar(path));
  await writeJson(directory, 'report.json', { status: 'not_assessed', sourceRun, output: out, exitCode: result.exitCode,
    ...changes, outsideObservation, reason: 'Inspect original engine logs, actual screenshots, state and input observations; no automated semantic PASS.' });
  for (const [name, digest] of Object.entries(sourceHashes)) assert.equal(hash(await readFile(join(sourceRun, name))), digest);
  assert.deepEqual((await snapshot(join(directory, 'before-workspace'))).files, before.files);
  assert.deepEqual(changes.changed, []); assert.deepEqual(changes.outsideScope, []); assert.deepEqual(outsideObservation, []);
  console.log(JSON.stringify({ directory, sourceRun, output: out, exitCode: result.exitCode, status: 'not_assessed' }));
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
}
const args = process.argv.slice(2);
if (args.length === 2 && args[0] === 'fresh') await fresh(args[1]);
else if (args.length === 4 && args[0] === 'resume') await resumeQuestion(...args.slice(1));
else if (args.length === 2 && args[0] === 'observe') await observe(args[1]);
else throw new Error('Usage: ui-programmer-host.mjs fresh CASE | resume RUN PARENT_TRACE CHILD_TRACE | observe RUN');
