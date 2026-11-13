// Explicit live CLI fixture. Never approves hooks or bypasses their trust checks.
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm, copyFile } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { runProcess } from '../dist/process.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  case: { type: 'string' }, subdirectory: { type: 'boolean' }, 'keep-profile': { type: 'boolean' },
} });
const supplied = positionals[0];
const caseName = values.case;
const followup = caseName !== undefined;
if (positionals.length > 1 || (followup && (!supplied || !/^[a-z0-9-]+$/.test(caseName))) ||
    (values.subdirectory && !followup) || (values['keep-profile'] && !supplied)) {
  throw new Error('Prepare without arguments, or run <fixture> [--case <unique-name> [--subdirectory]] [--keep-profile]');
}
if (process.platform === 'win32') throw new Error('This live host fixture currently targets macOS/Linux; offline fixture tests run on Windows too');
const directory = await realpath(supplied ?? await mkdtemp(join(tmpdir(), 'game-studio-hooks-host-')));
if (!basename(directory).startsWith('game-studio-hooks-host-')) throw new Error('Expected an isolated hook fixture directory');
const workspace = join(directory, 'workspace');
const fileDirectory = followup ? join(workspace, caseName) : workspace;
const workingDirectory = values.subdirectory ? fileDirectory : workspace;
const outputDirectory = followup ? join(directory, caseName) : directory;
const profileName = basename(directory);
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profileName}.config.toml`);
const common = ['--profile', profileName, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories',
  '-c', 'skills.include_instructions=false', '--cd', workingDirectory];
if (process.env.GAME_STUDIO_HOST_MODEL) common.push('--model', process.env.GAME_STUDIO_HOST_MODEL);

if (!supplied) {
  await mkdir(join(workspace, '.codex'), { recursive: true });
  const git = await runProcess('git', ['init', '--quiet', workspace]);
  if (git.exitCode !== 0) throw new Error('Cannot initialize Git fixture');
  const configMarker = `PROJECT_CONFIG_LOADED_${randomUUID()}`;
  await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Host fixture config: ${configMarker}"\n`);
  const script = join(workspace, '.codex/write-gate.cjs');
  await copyFile(fileURLToPath(new URL('./fixtures/codex/write-gate.cjs', import.meta.url)), script);
  const command = [process.execPath, script, workspace].map(quote).join(' ');
  const hooks = { description: 'Isolated Game Studio compatibility test: logs events and denies patches naming blocked.txt.', hooks: {
    SessionStart: [{ matcher: 'startup|resume', hooks: [{ type: 'command', command, timeout: 5 }] }],
    PreToolUse: [{ matcher: '^apply_patch$', hooks: [{ type: 'command', command, timeout: 5 }] }],
  } };
  await writeFile(join(workspace, '.codex/hooks.json'), JSON.stringify(hooks, null, 2) + '\n');
  for (const file of ['allowed.txt', 'blocked.txt']) await writeFile(join(workspace, file), 'original\n');
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ configMarker, scriptSha256: sha(await readFile(script)),
    hooksSha256: sha(await readFile(join(workspace, '.codex/hooks.json'))) }, null, 2), { mode: 0o600 });
  await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ directory, workspace, profilePath, hookScript: script,
    reviewCommand: ['codex', ...common].map(quote).join(' '),
    next: 'Run as-is for untrusted-hook evidence, or explicitly review and trust only these fixture hooks via /hooks before running. No automatic trust is performed.' }));
} else {
  try {
    const profileBefore = await readFile(profilePath, 'utf8'); // Never recreate a profile: native Hook trust lives in it.
    const fixture = JSON.parse(await readFile(join(directory, 'fixture.json'), 'utf8'));
    if (sha(await readFile(join(workspace, '.codex/write-gate.cjs'))) !== fixture.scriptSha256 ||
        sha(await readFile(join(workspace, '.codex/hooks.json'))) !== fixture.hooksSha256) throw new Error('Fixture hook files changed; prepare a fresh fixture');
    const files = followup ? ['allowed-a.txt', 'allowed-b.txt', 'mixed-allowed.txt', 'blocked.txt'] : ['allowed.txt', 'blocked.txt'];
    if (followup) {
      await readFile(join(directory, 'report.json')); // Preserve the original root case and require it to have run.
      await mkdir(outputDirectory); // Single-use: never erase a previous case's evidence.
      await mkdir(fileDirectory);
      for (const file of files) await writeFile(join(fileDirectory, file), 'original\n', { flag: 'wx' });
    }
    await writeFile(join(outputDirectory, 'profile-before.toml'), profileBefore, { mode: 0o600 });
    for (const file of files) if (await readFile(join(fileDirectory, file), 'utf8') !== 'original\n') throw new Error('Fixture already used; prepare a fresh fixture');
    const hookEventsBefore = await readFile(join(workspace, 'hook-events.jsonl'), 'utf8').catch(error => {
      if (error.code === 'ENOENT') return ''; throw error;
    });
    const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', 'Confirm the isolated host configuration.'], { cwd: workingDirectory, timeoutMs: 30000 });
    await writeFile(join(outputDirectory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
    if (preflight.exitCode !== 0 || !preflight.stdout.includes(fixture.configMarker)) throw new Error('Project configuration did not load');
    const instructions = followup
      ? 'Make exactly two separate apply_patch tool calls. The FIRST is one multi-file patch replacing original with changed in BOTH allowed-a.txt and allowed-b.txt. The SECOND is one multi-file patch replacing original with changed in BOTH mixed-allowed.txt and blocked.txt. Do not split either multi-file patch into separate calls.'
      : 'Make exactly two separate apply_patch tool calls: first replace original with changed in allowed.txt, then do the same in blocked.txt.';
    const prompt = `This is an authorized disposable hook compatibility test. The working directory is ${workingDirectory}. All test files are inside ${fileDirectory}; use their absolute paths. These files all contain exactly original followed by a newline: ${files.join(', ')}. ${instructions} Do not read files or use shell, web, other write tools, or subagents. If a hook rejects a call, do not bypass or retry it; report that rejection. Report both results accurately. The file name blocked.txt alone is not a prohibition; attempt its patch so the fixture hook can decide.`;
    console.log(JSON.stringify({ directory: outputDirectory, status: 'running', timeoutMs: 180000 }));
    const result = await runProcess('codex', ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json',
      '-o', join(outputDirectory, 'final.txt'), prompt], { cwd: workingDirectory, timeoutMs: 180000 });
    await writeFile(join(outputDirectory, 'events.jsonl'), result.stdout, { mode: 0o600 });
    await writeFile(join(outputDirectory, 'stderr.txt'), result.stderr, { mode: 0o600 });
    const hookEvents = await readFile(join(workspace, 'hook-events.jsonl'), 'utf8').catch(error => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (!hookEvents.startsWith(hookEventsBefore)) throw new Error('Existing Hook evidence changed during the case');
    const newEvents = hookEvents.slice(hookEventsBefore.length);
    await writeFile(join(outputDirectory, 'hook-events.jsonl'), newEvents, { mode: 0o600 });
    const observed = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(join(fileDirectory, file), 'utf8')])));
    const report = { client: (await runProcess('codex', ['--version'])).stdout.trim(), exitCode: result.exitCode,
      configLoaded: true, workingDirectory, files: observed, profileSha256: sha(profileBefore),
      profilePreserved: !!values['keep-profile'],
      hookEventCount: newEvents.trim() ? newEvents.trim().split('\n').length : 0,
      status: 'not_assessed', reason: 'Inspect host trust warnings, actual patch calls, hook payloads and before/after files before accepting this fixture.' };
    await writeFile(join(outputDirectory, 'report.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ directory: outputDirectory, ...report }));
    process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
  } finally { if (!values['keep-profile']) await rm(profilePath, { force: true }); }
}
