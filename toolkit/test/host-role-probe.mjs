// Explicit live host probe, excluded from the offline test suite. Uses the existing Codex login.
import { mkdtemp, mkdir, writeFile, readFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { runProcess } from '../dist/process.js';

const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-role-host-')));
const workspace = join(directory, 'workspace');
await mkdir(join(workspace, '.codex/agents'), { recursive: true });
const marker = `ROLE_LOADED_${randomUUID()}`;
const profile = `name = "game-studio-probe"
description = "Return the configured identity for a host compatibility probe."
developer_instructions = "Your entire final response must be exactly: ${marker}. Do not use tools or read files."
`;
await writeFile(join(workspace, '.codex/agents/game-studio-probe.toml'), profile);
await writeFile(join(workspace, '.codex/config.toml'), '[agents]\nenabled = true\nmax_concurrent_threads_per_session = 1\n');
const prompt = 'Host compatibility test: use the native custom-agent selection mechanism to spawn exactly one game-studio-probe agent, asking it to return its configured identity response. Do not read any files, use shell or web tools, or tell it what identity to return. Wait for the child and copy its final response exactly. If custom role selection is unavailable, return ROLE_SELECTION_UNAVAILABLE and explain the missing interface briefly. Do not simulate the custom agent with a generic agent.';
const args = ['exec', '--ignore-user-config', '--strict-config', '--skip-git-repo-check', '--sandbox', 'read-only',
  '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '-c', 'skills.include_instructions=false',
  '-c', `projects.${JSON.stringify(workspace)}.trust_level="trusted"`, '--cd', workspace, '--json',
  '-o', join(directory, 'final.txt')];
if (process.env.GAME_STUDIO_HOST_MODEL) args.push('--model', process.env.GAME_STUDIO_HOST_MODEL);
args.push(prompt);
await writeFile(join(directory, 'fixture.json'), JSON.stringify({ workspace, marker, args }, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ evidenceDirectory: directory, status: 'running', timeoutMs: 180000 }));
const version = await runProcess('codex', ['--version']);
const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: 180000 });
await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
const final = await readFile(join(directory, 'final.txt'), 'utf8').catch(error => {
  if (error.code === 'ENOENT') return '';
  throw error;
});
const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
const report = {
  client: version.stdout.trim(), exitCode: result.exitCode, markerObserved: final.trim() === marker,
  profileSha256: createHash('sha256').update(profile).digest('hex'),
  profileUnchanged: await readFile(join(workspace, '.codex/agents/game-studio-probe.toml'), 'utf8') === profile,
  threadId: events.find(event => event.type === 'thread.started')?.thread_id ?? null,
  // A marker is necessary, not sufficient: review selected-role and child execution evidence.
  status: 'not_assessed', reason: final.trim() === marker
    ? 'Marker returned; inspect the trace for native role selection and independent child execution.'
    : 'No exact hidden-role response; native role loading has not been proved.',
};
await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ evidenceDirectory: directory, ...report }));
process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
