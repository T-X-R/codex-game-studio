// Explicit live CLI fixture. Never approves hooks or bypasses their trust checks.
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm, copyFile } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { runProcess } from '../dist/process.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const supplied = process.argv[2];
if (process.argv.length > 3) throw new Error('Use without arguments to prepare, or supply the prepared fixture directory to run');
if (process.platform === 'win32') throw new Error('This live host fixture currently targets macOS/Linux; offline fixture tests run on Windows too');
const directory = await realpath(supplied ?? await mkdtemp(join(tmpdir(), 'game-studio-hooks-host-')));
if (!basename(directory).startsWith('game-studio-hooks-host-')) throw new Error('Expected an isolated hook fixture directory');
const workspace = join(directory, 'workspace');
const profileName = basename(directory);
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profileName}.config.toml`);
const common = ['--profile', profileName, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories',
  '-c', 'skills.include_instructions=false', '--cd', workspace];
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
    await readFile(profilePath); // A missing profile must not silently fall back to user defaults.
    const fixture = JSON.parse(await readFile(join(directory, 'fixture.json'), 'utf8'));
    if (sha(await readFile(join(workspace, '.codex/write-gate.cjs'))) !== fixture.scriptSha256 ||
        sha(await readFile(join(workspace, '.codex/hooks.json'))) !== fixture.hooksSha256) throw new Error('Fixture hook files changed; prepare a fresh fixture');
    for (const file of ['allowed.txt', 'blocked.txt']) if (await readFile(join(workspace, file), 'utf8') !== 'original\n') throw new Error('Fixture already used; prepare a fresh fixture');
    const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', 'Confirm the isolated host configuration.'], { cwd: workspace, timeoutMs: 30000 });
    await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
    if (preflight.exitCode !== 0 || !preflight.stdout.includes(fixture.configMarker)) throw new Error('Project configuration did not load');
    const prompt = 'This is an authorized disposable hook compatibility test. allowed.txt and blocked.txt both currently contain exactly original followed by a newline. Make exactly two separate apply_patch tool calls: first replace original with changed in allowed.txt, then do the same in blocked.txt. Do not read files or use shell, web, other write tools, or subagents. If a hook rejects a call, do not bypass or retry it; report that rejection. Report both results accurately. The file name blocked.txt alone is not a prohibition; attempt its patch so the fixture hook can decide.';
    console.log(JSON.stringify({ directory, status: 'running', timeoutMs: 180000 }));
    const result = await runProcess('codex', ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json',
      '-o', join(directory, 'final.txt'), prompt], { cwd: workspace, timeoutMs: 180000 });
    await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
    await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
    const hookEvents = await readFile(join(workspace, 'hook-events.jsonl'), 'utf8').catch(error => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    const report = { client: (await runProcess('codex', ['--version'])).stdout.trim(), exitCode: result.exitCode,
      configLoaded: true, allowed: await readFile(join(workspace, 'allowed.txt'), 'utf8'),
      blocked: await readFile(join(workspace, 'blocked.txt'), 'utf8'), hookEventCount: hookEvents.trim() ? hookEvents.trim().split('\n').length : 0,
      status: 'not_assessed', reason: 'Inspect host trust warnings, actual patch calls, hook payloads and before/after files before accepting this fixture.' };
    await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ directory, ...report }));
    process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
  } finally { await rm(profilePath, { force: true }); }
}
