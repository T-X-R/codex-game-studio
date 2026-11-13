// Opt-in native Codex acceptance. Fixture definitions and native exit zero are not passes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, readlink, realpath, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { safePath } from '../dist/files.js';
import { storyReadinessScenarios } from './fixtures/story-readiness-cases.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function snapshot(workspace) {
  const files = {}, symlinks = {}, directories = [workspace];
  while (directories.length) {
    const directory = directories.pop();
    // Node recursive readdir can enumerate descendants of directory links.
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

async function main() {
  const name = process.argv[2];
  assert.ok(process.argv.length === 3 && Object.hasOwn(storyReadinessScenarios, name), `Choose ${Object.keys(storyReadinessScenarios).join(', ')}`);
  const scenario = storyReadinessScenarios[name];
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-story-readiness-')));
  const packageRoot = fileURLToPath(new URL('..', import.meta.url));
  const sourceRoot = join(packageRoot, '..');
  const npm = await npmPath();
  function run(entry, args, cwd = directory) {
    return execFileSync(process.execPath, [entry, ...args], { cwd, encoding: 'utf8', timeout: 120000,
      env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
  }
  // Pack the root-reviewed frozen build; this runner never builds shared resources.
  const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']));
  const archive = join(directory, packed.filename);
  run(npm, ['install', '--prefix', join(directory, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
  const cli = join(directory, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
  const workspace = join(directory, 'Lantern readiness 测试');
  run(cli, ['init', workspace, '--engine', 'web', '--json']);
  run(cli, ['restore', '--project', workspace, '--archive', archive, '--offline', '--json']);
  assert.equal((await runProcess('git', ['init', '--quiet', workspace])).exitCode, 0);
  for (const [path, content] of Object.entries(scenario.inputs)) {
    const target = await safePath(workspace, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  const skillRoot = '.agents/skills/game-studio-story-readiness';
  const paths = [`${skillRoot}/SKILL.md`, ...['facts-and-policy', 'checklist', 'qa-lead-gate'].map(name => `${skillRoot}/references/${name}.md`),
    '.codex/agents/game-studio-qa-lead.toml', 'studio/docs/director-gates/ql-story-ready.md', 'studio/docs/integration.md',
    'studio/scripts/story-facts.mjs', 'studio/scripts/adr-status.mjs', 'studio/scripts/registry.mjs', 'studio/templates/architecture-decision-record.md'];
  const hashes = {}, installedPaths = {};
  for (const path of paths) {
    const actual = path.startsWith('.') ? await safePath(workspace, path)
      : JSON.parse(run(join(workspace, '.game-studio/run.cjs'), ['resource', 'path', path, '--json'], workspace)).data.path;
    const installed = await readFile(actual);
    assert.deepEqual(installed, await readFile(join(sourceRoot, path)), path);
    hashes[path] = hash(installed);
    installedPaths[path] = relative(workspace, actual).replaceAll('\\', '/');
  }
  // Thin resource entries import these exact compiled observer modules from the pinned archive.
  const observerRoot = resolve(dirname(join(workspace, installedPaths['studio/scripts/story-facts.mjs'])), '../../../dist');
  for (const name of ['story-facts.js', 'adr-status.js', 'registry.js', 'registry-reader.js', 'config.js', 'config-derived.js',
    'legacy-config.js', 'engine.js', 'resources.js', 'project.js', 'files.js', 'contract.js']) {
    const actual = join(observerRoot, name), installed = await readFile(actual);
    assert.deepEqual(installed, await readFile(join(packageRoot, 'dist', name)), name);
    hashes[`toolkit/dist/${name}`] = hash(installed);
    installedPaths[`toolkit/dist/${name}`] = relative(workspace, actual).replaceAll('\\', '/');
  }
  // Check literal fixture Layer observations using the actual installed observer.
  // This catches fixture/template drift; it makes no claim about criticality or verdicts.
  const adrObservations = JSON.parse(run(join(workspace, installedPaths['studio/scripts/adr-status.mjs']), ['--project', workspace], workspace));
  for (const [path, content] of Object.entries(scenario.inputs)) {
    if (!/^docs\/architecture\/adr-.*\.md$/.test(path)) continue;
    const layer = content.match(/^\| \*\*Layer\*\* \| (Feature|Foundation) \|$/m)?.[1];
    if (layer) assert.equal(adrObservations.adrs.find(row => row.path === path)?.layer, layer, `${path}: literal Layer observation`);
  }
  for (const name of scenario.removeRoles ?? []) {
    assert.equal(name, 'game-studio-qa-lead');
    // Verify installed bytes above before intentionally testing actual absence.
    await rm(await safePath(workspace, `.codex/agents/${name}.toml`));
  }
  const configMarker = `STORY_READINESS_CONFIG_${randomUUID()}`;
  await writeFile(join(workspace, '.codex/config.toml'), `developer_instructions = "Fixture config ${configMarker}"\n[agents]\nenabled = true\nmax_concurrent_threads_per_session = 2\n`);
  const before = await snapshot(workspace);
  await writeFile(join(directory, 'before.json'), JSON.stringify(before, null, 2));
  // Raw inputs are retained separately from the live workspace for exact-byte review.
  await writeFile(join(directory, 'inputs.json'), JSON.stringify(scenario.inputs, null, 2));
  const profile = `game-studio-story-readiness-${randomUUID()}`;
  const profilePath = join(process.env.CODEX_HOME ?? join(homedir(), '.codex'), `${profile}.config.toml`);
  await writeFile(profilePath, `[projects.${JSON.stringify(workspace)}]\ntrust_level = "trusted"\n`, { flag: 'wx', mode: 0o600 });
  try {
    const common = ['--profile', profile, '--disable', 'plugins', '--disable', 'apps', '--disable', 'memories', '--cd', workspace];
    const prompt = `${scenario.request} Node is available at ${process.execPath}.`;
    const preflight = await runProcess('codex', [...common, 'debug', 'prompt-input', prompt], { cwd: workspace, timeoutMs: 30000 });
    await writeFile(join(directory, 'prompt-input.json'), preflight.stdout, { mode: 0o600 });
    assert.equal(preflight.exitCode, 0); assert.ok(preflight.stdout.includes(configMarker)); assert.ok(preflight.stdout.includes('game-studio-story-readiness'));
    const args = ['exec', ...common, '--strict-config', '--sandbox', scenario.sandbox ?? 'read-only', '--json', '-o', join(directory, 'final.txt'), prompt];
    // No model/effort/approval override. Child inheritance must still be checked in actual session logs.
    await writeFile(join(directory, 'fixture.json'), JSON.stringify({ scenario: name, workspace, args, hashes, installedPaths,
      packageIntegrity: packed.integrity, archiveSha256: hash(await readFile(archive)), syntheticInputs: true,
      intentionallyRemovedRoles: scenario.removeRoles ?? [], sandbox: scenario.sandbox ?? 'read-only',
      runtimeLock: JSON.parse(await readFile(join(workspace, '.game-studio/package-lock.json'), 'utf8')) }, null, 2));
    console.log(JSON.stringify({ directory, scenario: name, status: 'running' }));
    const version = await runProcess('codex', ['--version']);
    const result = await runProcess('codex', args, { cwd: workspace, timeoutMs: scenario.timeoutMs ?? 720000 });
    await writeFile(join(directory, 'events.jsonl'), result.stdout, { mode: 0o600 });
    await writeFile(join(directory, 'stderr.txt'), result.stderr, { mode: 0o600 });
    const after = await snapshot(workspace);
    await writeFile(join(directory, 'after.json'), JSON.stringify(after, null, 2));
    const changed = Object.keys(before.files).filter(path => before.files[path] !== after.files[path]);
    const added = Object.keys(after.files).filter(path => !Object.hasOwn(before.files, path));
    const changedLinks = [...new Set([...Object.keys(before.symlinks), ...Object.keys(after.symlinks)])]
      .filter(path => before.symlinks[path] !== after.symlinks[path]);
    // Preserve raw events even if a terminated process left a truncated final JSON line.
    const events = [], eventParseErrors = [];
    for (const [index, line] of result.stdout.split('\n').entries()) if (line.trim()) {
      try { events.push(JSON.parse(line)); } catch { eventParseErrors.push(index + 1); }
    }
    const report = { scenario: name, client: version.stdout.trim(), node: process.version, platform: process.platform, arch: process.arch,
      exitCode: result.exitCode, signal: result.signal, threadId: events.find(event => event.type === 'thread.started')?.thread_id,
      status: 'not_assessed', behaviorSpec: 'studio-tests/skills/readiness/story-readiness-codex.md',
      reason: 'Manually review scope, whole story reads, six groups/tiers, verdict precedence, handoff, actual QA identity/order/context inheritance and coordinator gate-definition isolation; audit every command for writes/scratch/execution even outside the workspace. Native zero and structural checks do not prove behavior.',
      preservedFiles: Object.keys(before.files).length - changed.length, changed, added, changedLinks, eventParseErrors, hashes };
    await writeFile(join(directory, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ directory, ...report }));
    assert.deepEqual(changed, [], 'Readiness changed or deleted project files');
    assert.deepEqual(added, [], 'Readiness added project files');
    assert.deepEqual(changedLinks, [], 'Readiness changed symbolic links');
    assert.deepEqual(eventParseErrors, [], 'Incomplete native event log needs investigation');
    process.exitCode = result.exitCode === 0 ? 3 : result.exitCode;
  } finally { await rm(profilePath); }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
