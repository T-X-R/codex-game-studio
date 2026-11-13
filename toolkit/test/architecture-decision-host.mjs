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
import { architectureScenarios } from './fixtures/architecture-decision-cases.mjs';

const name = process.argv[2];
assert.ok(process.argv.length === 3 && Object.hasOwn(architectureScenarios, name), `Choose ${Object.keys(architectureScenarios).join(', ')}`);
const scenario = architectureScenarios[name];
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-architecture-decision-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(packageRoot, '..');
const npm = await npmPath();
function run(entry, args) {
  return execFileSync(process.execPath, [entry, ...args], { cwd: directory, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
const archive = join(directory, packed.filename);
run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const workspace = join(directory, 'Lantern game 测试');
run(cli, ['init', workspace, '--engine', 'web', '--json']);
run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
for (const role of scenario.removeRoles ?? []) {
  await rm(join(workspace, '.codex/agents', `game-studio-${role}.toml`), { force: true });
}
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
const hashes = {};
const skillRoot = '.agents/skills/game-studio-architecture-decision';
const paths = [`${skillRoot}/SKILL.md`, ...['authoring', 'validation-and-writing', 'acceptance', 'retrofit', 'registry-and-handoff'].map(name => `${skillRoot}/references/${name}.md`),
  ...['technical-director', 'lead-programmer'].map(role => `.codex/agents/game-studio-${role}.toml`),
  'studio/templates/architecture-decision-record.md', 'studio/docs/integration.md', 'studio/docs/recovery.md',
  'studio/docs/director-gates/td-adr.md', 'studio/scripts/registry.mjs'];
for (const path of paths) {
  const installedPath = path.startsWith('.agents/') || path.startsWith('.codex/') ? join(workspace, path)
    : JSON.parse(run(join(workspace, '.game-studio/run.cjs'), ['resource', 'path', path, '--json'])).data.path;
  const installed = await readFile(installedPath);
  assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
  hashes[path] = createHash('sha256').update(installed).digest('hex');
}
const configMarker = `ARCHITECTURE_DECISION_CONFIG_${randomUUID()}`;
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
const profile = `game-studio-architecture-decision-${randomUUID()}`;
const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
try {
  const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
  const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
  const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
  await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
  assert.equal(preflight.exitCode, 0);
  assert.ok(preflight.stdout.includes(configMarker));
  assert.ok(preflight.stdout.includes('game-studio-architecture-decision'));
  const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox, '--json', '-o', join(directory, 'final.txt'), prompt];
  await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, packageIntegrity: packed.integrity }, null, 2));
  console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
  const version = await runProcess('codex', ['--version']);
  const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 480000 });
  await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
  await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
  const after = await snapshot();
  await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
  const changed = Object.keys(before).filter(path => before[path] !== after[path]);
  const added = Object.keys(after).filter(path => !(path in before));
  const outsideScope = added.filter(path => !scenario.expectedFiles.includes(path));
  const missingPlannedArtifacts = scenario.expectedFiles.filter(path => !added.includes(path));
  const events = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
  const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
    exitCode: result.exitCode, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
    status: 'not_assessed', reason: 'Review native Skill selection, actual engine/TD roles, ADR status/dependencies, registry/GDD evidence, exact story effects and preservation against architecture-decision-codex.md.',
    preservedFiles: Object.keys(before).length - changed.length, changed, added, outsideScope, missingPlannedArtifacts, hashes };
  await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ directory, ...report }));
  assert.deepEqual(changed.filter(path => !(scenario.allowedChanges ?? []).includes(path)), []); assert.deepEqual(outsideScope, []);
  if (!scenario.allowReviewStop) assert.deepEqual(missingPlannedArtifacts, [], 'Missing required artifact');
  for (const path of added.filter(path => /^docs\/architecture\/adr-.*\.md$/.test(path))) {
    const content = await readFile(join(workspace, path), 'utf8');
    const layer = content.match(/^\|\s*\*\*Layer\*\*\s*\|([^|]+)\|/m)?.[1].trim();
    assert.ok(['Foundation', 'Core', 'Feature', 'Presentation'].includes(layer), `Invalid Layer cell: ${layer}`);
  }
  for (const [path, expected] of Object.entries(scenario.exactChanges ?? {})) {
    if (changed.includes(path)) assert.equal(await readFile(join(workspace, path), 'utf8'), expected, `Unexpected field changes: ${path}`);
  }
  for (const path of scenario.appendOnly ?? []) {
    assert.ok((await readFile(join(workspace, path), 'utf8')).startsWith(scenario.inputs[path]), `Existing content changed: ${path}`);
  }
  // Success is pending semantic review, not an automatic behavior pass.
  process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
} finally { await rm(profilePath); }
