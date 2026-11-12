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
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
const inputs = {
  'src/score.cjs': 'exports.score = value => value + 1;\n',
  'docs/score.md': '# Score action\nType: Logic\nEach action adds two to the prior score. Accept non-negative safe integers whose result is safe. UI response should feel snappy.\n',
  'tests/score.test.cjs': '// Test implementation pending.\n',
  'production/qa/bugs/BUG-0007-old.md': '# Historical bug\n**ID**: BUG-0007\n**Status**: Closed\n',
  'production/qa/smoke-old.md': '# Smoke\nVerdict: PASS\nEvidence: production/qa/evidence/old/stdout.log\n',
  'production/qa/evidence/old/stdout.log': 'TAP version 13\n1..0\n# tests 0\n# pass 0\n# fail 0\n# skipped 0\n',
};
for (const [path, content] of Object.entries(inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const rolePath = '.codex/agents/game-studio-qa-tester.toml';
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
    if (relative.startsWith('.git/')) continue;
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
  const request = 'Audit docs/score.md, src/score.cjs, tests/score.test.cjs and production/qa. Decide what current evidence proves and identify defects and acceptance gaps. Write a QA report and measurable test cases in production/qa/audit.md; if supported, create a bug report in production/qa/bugs/. Preserve all existing files. Only new Markdown files under production/qa/ may be written. No fixes, installs, test execution, commits or publishing. No human observations have been supplied. This is unattended: return unresolved decisions to the caller rather than asking the user.';
  const prompt = `Use native custom-role selection to delegate exactly one task to game-studio-qa-tester: ${request} The child may use the installed runtime for read-only configuration queries; its Node executable is ${process.execPath}. Wait for completion and summarize its actual findings, artifacts and remaining decisions. You as parent must not inspect workspace files, run shell commands or write the report yourself. Do not simulate this role with a generic agent; if unavailable, report ROLE_SELECTION_UNAVAILABLE.`;
  const common = ['--profile', profileName, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories',
    '-c', 'skills.include_instructions=false', '--cd', workspace];
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(configMarker));
  assert.ok(!preflight.stdout.includes('You are the QA Tester for an indie game project.'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', 'workspace-write', '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ workspace, args, roleSha256: before[rolePath] }, null, 2));
  console.log(JSON.stringify({ directory, status: 'running', timeoutMs: 480000 }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: 480000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const outsideScope = added.filter(path => !path.startsWith('production/qa/') || !path.endsWith('.md'));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { status: 'not_assessed', reason: 'Review native parent/child trace and semantic output against studio-tests/roles/qa-tester-codex.md.',
    client: version.stdout.trim(), exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    preservedFiles: Object.keys(before).length, changed, added, outsideScope, roleSha256: before[rolePath] };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(changed, []); assert.deepEqual(outsideScope, []);
  assert.ok(added.includes('production/qa/audit.md'));
  assert.ok(added.includes('production/qa/bugs/BUG-0008.md'));
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
