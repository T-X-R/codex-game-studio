// Opt-in native Codex acceptance. Host setup is separate from the workflow under test.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, writeFile, readdir, readlink, realpath, rm, copyFile } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { safePath } from '../dist/files.js';
import { storyDoneScenarios, targetStory, checkpointPath, imagePath, captureFolder, closeAssertions } from './fixtures/story-done-cases.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function snapshot(workspace) {
  const files = {}, symlinks = {}, directories = [workspace];
  while (directories.length) {
    const directory = directories.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), key = relative(workspace, path).replaceAll('\\', '/');
      if (key === '.git') continue;
      if (entry.isSymbolicLink()) symlinks[key] = await readlink(path);
      else if (entry.isDirectory()) directories.push(await safePath(workspace, key));
      else if (entry.isFile()) files[key] = hash(await readFile(await safePath(workspace, key)));
    }
  }
  return { files, symlinks };
}
async function main() {
  const name = process.argv[2];
  assert.ok(process.argv.length === 3 && Object.hasOwn(storyDoneScenarios, name), `Choose ${Object.keys(storyDoneScenarios).join(', ')}`);
  const scenario = storyDoneScenarios[name];
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-story-done-')));
  const packageRoot = fileURLToPath(new URL('..', import.meta.url)), sourceRoot = resolve(packageRoot, '..');
  const npm = await npmPath();
  function run(entry, args, cwd = directory) {
    return execFileSync(process.execPath, [entry, ...args], { cwd, encoding: 'utf8', timeout: 120000,
      env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
  }
  // An explicitly provided frozen archive avoids even npm pack; never build here.
  let archive;
  if (process.env.GAME_STUDIO_ARCHIVE) {
    archive = join(directory, 'frozen-toolkit.tgz'); await copyFile(resolve(process.env.GAME_STUDIO_ARCHIVE), archive);
  } else {
    const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
    archive = join(directory, packed.filename);
  }
  run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
  const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
  const packageJson = JSON.parse(await readFile(join(dirname(cli), '../package.json'), 'utf8'));
  const parseYaml = createRequire(cli)('yaml').parse;
  const workspace = join(directory, 'Supply Shop 测试');
  run(cli, ['init', workspace, '--engine', 'web', '--json']);
  run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
  const launcher = join(workspace, '.game-studio/run.cjs');
  for (const [path, content] of Object.entries(scenario.inputs)) {
    const target = await safePath(workspace, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, content);
  }
  const skillRoot = '.agents/skills/game-studio-story-done';
  const paths = [`${skillRoot}/SKILL.md`, ...['review-gates', 'sprint-next', 'tech-debt-row'].map(ref => `${skillRoot}/references/${ref}.md`),
    ...['qa-lead', 'lead-programmer'].map(role => `.codex/agents/game-studio-${role}.toml`),
    ...['story-facts', 'story-status', 'adr-status', 'registry', 'md-section', 'review-receipts'].map(script => `studio/scripts/${script}.mjs`),
    'studio/docs/integration.md', 'studio/docs/recovery.md', 'studio/docs/director-gates/ql-test-coverage.md',
    'studio/docs/director-gates/lp-code-review.md', 'studio/templates/architecture-decision-record.md',
    'studio/engines/engines.tsv', 'studio/scripts/one-shot-driver.js'];
  const hashes = {}, installedPaths = {};
  for (const path of paths) {
    const actual = path.startsWith('.') ? await safePath(workspace, path)
      : JSON.parse(run(launcher, ['resource', 'path', path, '--json'], workspace)).data.path;
    const installed = await readFile(actual); assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
    hashes[path] = hash(installed); installedPaths[path] = relative(workspace, actual).replaceAll('\\', '/');
  }
  const runtimeDist = resolve(dirname(join(workspace, installedPaths['studio/scripts/md-section.mjs'])), '../../../dist');
  for (const module of ['md-section', 'story-facts', 'story-status', 'adr-status', 'registry', 'registry-reader', 'config',
    'config-derived', 'legacy-config', 'engine', 'resources', 'project', 'files', 'contract', 'checkpoint', 'install', 'capture']) {
    const path = `${module}.js`, actual = join(runtimeDist, path), bytes = await readFile(actual);
    assert.deepEqual(bytes, await readFile(join(packageRoot, 'dist', path)), path);
    hashes[`toolkit/dist/${path}`] = hash(bytes); installedPaths[`toolkit/dist/${path}`] = relative(workspace, actual).replaceAll('\\', '/');
  }
  const marker = `STORY_DONE_CONFIG_${randomUUID()}`;
  await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${marker}"\n[agents]\nenabled = true\nmax_concurrent_threads_per_session = 2\n`);
  async function git(args) {
    const result = await runProcess('git', args, { cwd: workspace, timeoutMs: 120000 });
    assert.equal(result.exitCode, 0, result.stderr); return result.stdout;
  }
  // Local synthetic baseline makes uncommitted implementation scope meaningful.
  // It is not a user repository commit or a claim of prior feature delivery.
  await git(['init', '--quiet', '-b', 'fixture']);
  const originalHtml = scenario.inputs['src/shop/index.html'];
  await writeFile(join(workspace, 'src/shop/index.html'), '<!doctype html><title>Shop not implemented yet</title>\n');
  await git(['add', '--', '.']);
  await git(['-c', 'user.name=Fixture Setup', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Synthetic acceptance fixture baseline']);
  await writeFile(join(workspace, 'src/shop/index.html'), originalHtml);
  await writeFile(join(workspace, 'docs/owner-note.md'), scenario.inputs['docs/owner-note.md'] + 'Additional unrelated staged work.\n');
  await git(['add', '--', 'docs/owner-note.md']);

  // Real browser capture happens in setup, never in the native story-done request.
  // If capture cannot complete, preserve that failure and do not start native.
  const setupArgs = ['capture', 'src/shop', '--project', workspace, '--output', captureFolder,
    '--hookless', '--seed', '7', '--log', 'wait:0.1', '--json'];
  const capture = await runProcess(process.execPath, [launcher, ...setupArgs], { cwd: workspace, timeoutMs: 120000 });
  await writeFile(join(directory, 'setup-capture.json'), capture.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'setup-capture.stderr'), capture.stderr, { mode: 0o600 });
  if (capture.exitCode !== 0) {
    await writeFile(join(directory, 'report.json'), JSON.stringify({ scenario: name, status: 'not_assessed', phase: 'fixture-setup',
      reason: 'Actual retained browser capture unavailable; native was not started.', captureExitCode: capture.exitCode, captureSignal: capture.signal }, null, 2));
    console.log(JSON.stringify({ directory, scenario: name, status: 'not_assessed', phase: 'fixture-setup' })); process.exitCode = 3; return;
  }
  const png = await readFile(join(workspace, imagePath)); assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const receipt = run(join(workspace, installedPaths['studio/scripts/review-receipts.mjs']), ['hash', 'src/shop/index.html', 'src/shop/data.js'], workspace);
  await writeFile(join(workspace, captureFolder, 'stamp.txt'), receipt);
  const checkpoint = scenario.inputs[checkpointPath].replace('{{CAPTURE_RESULT}}', `OBSERVED — automated fixture browser capture retained at ${imagePath}; contents must be inspected, no human play acceptance`);
  await writeFile(join(workspace, checkpointPath), checkpoint);
  const before = await snapshot(workspace);
  const gitBefore = { head: (await git(['rev-parse', 'HEAD'])).trim(), staged: await git(['diff', '--cached', '--binary']), status: await git(['status', '--porcelain=1', '-z']) };
  await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
  await writeFile(join(directory, 'git-before.json'), JSON.stringify(gitBefore, null, 2));
  await writeFile(join(directory, 'inputs.json'), JSON.stringify(scenario.inputs, null, 2));
  await writeFile(join(directory, 'setup.json'), JSON.stringify({ syntheticDesignAndStoryInputs: true, syntheticGitBaseline: true,
    captureArgs: setupArgs, imagePath, imageSha256: hash(png), actualCheckpoint: checkpoint,
    limitation: 'Automated static screen capture only; not human play acceptance or story quality assessment.' }, null, 2));
  const profile = `game-studio-story-done-${randomUUID()}`;
  const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
  await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
  try {
    const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
    const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
    const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
    await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
    assert.equal(preflight.exitCode, 0); assert.ok(preflight.stdout.includes(marker)); assert.ok(preflight.stdout.includes('game-studio-story-done'));
    const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
    await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, sourceCases: scenario.sourceCases, workspace, args,
      requestSha256: hash(prompt), fixtureInputsSha256: hash(JSON.stringify(scenario.inputs)), hashes, installedPaths,
      packageVersion: packageJson.version, archiveSha256: hash(await readFile(archive)), sandbox: scenario.sandbox,
      runtimeLock: JSON.parse(await readFile(join(workspace, '.game-studio/package-lock.json'), 'utf8')) }, null, 2));
    console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
    const version = await runProcess('codex', ['--version']);
    const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 900000 });
    await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
    await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
    const after = await snapshot(workspace); await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
    const gitAfter = { head: (await git(['rev-parse', 'HEAD'])).trim(), staged: await git(['diff', '--cached', '--binary']), status: await git(['status', '--porcelain=1', '-z']) };
    await writeFile(join(directory, 'git-after.json'), JSON.stringify(gitAfter, null, 2));
    const changed = Object.keys(before.files).filter(path => before.files[path] !== after.files[path]);
    const added = Object.keys(after.files).filter(path => !Object.hasOwn(before.files, path));
    const changedLinks = [...new Set([...Object.keys(before.symlinks), ...Object.keys(after.symlinks)])].filter(path => before.symlinks[path] !== after.symlinks[path]);
    const events = [], eventParseErrors = [];
    for (const [index, line] of result.stdout.split('\n').entries()) if (line.trim()) {
      try { events.push(JSON.parse(line)); } catch { eventParseErrors.push(index + 1); }
    }
    const checkpointEvents = added.filter(path => /^production\/session-logs\/events\/[A-Za-z0-9_-]+\.json$/.test(path));
    const transactionBackups = added.filter(path => /^\.game-studio\/backups\/[a-f0-9-]+\.json$/.test(path));
    const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
      exitCode: result.exitCode, signal: result.signal, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
      status: 'not_assessed', behaviorSpec: 'studio-tests/skills/readiness/story-done-codex.md',
      reason: 'Independent review must check actual opened image, every AC/evidence/own-call finding, source tiers, authorization, edits, final verdict versus status, next route and checkpoint. Structural checks and native zero never imply PASS.',
      changed, added, changedLinks, checkpointEvents, transactionBackups, eventParseErrors, hashes, structuralErrors: [] };
    const check = (description, fn) => { try { fn(); } catch (error) { report.structuralErrors.push({ description, message: error.message }); } };
    check('allowed modified paths', () => assert.deepEqual(changed.filter(path => !scenario.allowedChanges.includes(path)), []));
    check('preserved links', () => assert.deepEqual(changedLinks, []));
    check('no commit or unrelated index changes', () => { assert.equal(gitAfter.head, gitBefore.head); assert.equal(gitAfter.staged, gitBefore.staged); });
    check('complete event stream', () => assert.deepEqual(eventParseErrors, []));
    if (!scenario.close) check('read-only preservation', () => { assert.deepEqual(changed, []); assert.deepEqual(added, []); });
    else {
      try {
      check('only checkpoint generated artifacts', () => assert.deepEqual(added.filter(path => !checkpointEvents.includes(path) && !transactionBackups.includes(path)), []));
      check('required companion updates', () => assert.deepEqual(scenario.allowedChanges.filter(path => !changed.includes(path)), []));
      for (const [path, expected] of [[closeAssertions.briefPath, closeAssertions.expectedBrief], [closeAssertions.epicPath, closeAssertions.expectedEpic]]) {
        const content = await readFile(join(workspace, path), 'utf8'); check(`exact companion change ${path}`, () => assert.equal(content, expected));
      }
      const closedStory = await readFile(join(workspace, targetStory), 'utf8');
      check('story status, date and original history', () => {
        assert.match(closedStory, /^> \*\*Status\*\*: Complete$/m);
        assert.match(closedStory, /^(?:> )?\*{0,2}Last Updated\*{0,2}:\*{0,2} \d{4}-\d{2}-\d{2}$/m);
        const oldPrefix = closedStory.replace('> **Status**: Complete', '> **Status**: In Progress').replace(/^(?:> )?\*{0,2}Last Updated\*{0,2}:\*{0,2}[^\n]*\n/m, '');
        assert.ok(oldPrefix.startsWith(scenario.inputs[targetStory]), 'Original story text/history changed');
      });
      const actualSprint = parseYaml(await readFile(join(workspace, closeAssertions.sprintPath), 'utf8'));
      check('exact sprint identity and unrelated fields', () => {
        const expected = parseYaml(scenario.inputs[closeAssertions.sprintPath]);
        const row = actualSprint.stories.find(s => s.file === targetStory); assert.ok(row); assert.equal(row.status, 'done');
        assert.match(row.completed, /^\d{4}-\d{2}-\d{2}$/); assert.equal(actualSprint.updated, row.completed);
        expected.updated = actualSprint.updated; const expectedRow = expected.stories.find(s => s.file === targetStory);
        expectedRow.status = 'done'; expectedRow.completed = row.completed; assert.deepEqual(actualSprint, expected);
      });
      const afterCheckpoint = await readFile(join(workspace, checkpointPath), 'utf8');
      check('checkpoint surrounding history', () => { assert.ok(afterCheckpoint.startsWith(closeAssertions.checkpointPrefix)); assert.ok(afterCheckpoint.endsWith(closeAssertions.checkpointSuffix)); });
      try {
        const eventMap = new Map();
        assert.ok(checkpointEvents.length > 0); assert.equal(transactionBackups.length, checkpointEvents.length);
        for (const path of checkpointEvents) {
          const event = JSON.parse(await readFile(join(workspace, path), 'utf8'));
          assert.equal(event.type, 'checkpoint.saved'); assert.equal(event.schemaVersion, 1);
          assert.equal(path, `production/session-logs/events/${event.eventId}.json`); assert.ok(!eventMap.has(event.previousHash));
          eventMap.set(event.previousHash, { path, event });
        }
        let cursor = before.files[checkpointPath] ?? 'missing'; const visited = new Set();
        while (eventMap.has(cursor)) { const row = eventMap.get(cursor); assert.ok(!visited.has(row.path)); visited.add(row.path); cursor = row.event.checkpointHash; }
        assert.equal(visited.size, checkpointEvents.length); assert.equal(cursor, after.files[checkpointPath]);
        const backedUp = new Set();
        for (const path of transactionBackups) {
          const backup = JSON.parse(await readFile(join(workspace, path), 'utf8'));
          assert.equal(backup.project, workspace); assert.equal(backup.version, packageJson.version); assert.equal(backup.changes.length, 2);
          const saved = backup.changes.find(c => c.path === checkpointPath), eventChange = backup.changes.find(c => checkpointEvents.includes(c.path));
          assert.ok(saved && eventChange); assert.ok(!backedUp.has(eventChange.path)); backedUp.add(eventChange.path);
          const event = JSON.parse(eventChange.after); assert.equal(eventChange.before, null); assert.equal(hash(eventChange.after), after.files[eventChange.path]);
          assert.equal(saved.before === null ? 'missing' : hash(saved.before), event.previousHash); assert.equal(hash(saved.after), event.checkpointHash);
        }
        const readback = JSON.parse(run(launcher, ['checkpoint', 'show', '--json'], workspace)).data;
        await writeFile(join(directory, 'checkpoint-readback.json'), JSON.stringify(readback, null, 2));
        if (readback.fields.Branch) assert.equal(readback.fields.Branch.replace(/^`|`$/g, ''), readback.git.branch);
        if (readback.fields.Stage) assert.equal(readback.fields.Stage.replace(/^`|`$/g, ''), 'Production');
        report.checkpointChainVerified = true;
      } catch (error) { report.structuralErrors.push({ description: 'checkpoint chain/backups', message: error.message }); }
      } catch (error) { report.structuralErrors.push({ description: 'close artifacts unreadable or malformed', message: error.message }); }
    }
    await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ directory, ...report }));
    process.exitCode = result.exitCode !== 0 ? result.exitCode : report.structuralErrors.length ? 1 : 3;
  } finally { await rm(profilePath); }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
