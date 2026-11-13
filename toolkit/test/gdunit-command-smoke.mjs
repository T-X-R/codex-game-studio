// Repackage the current CLI and run a previously generated native QA suite in a fresh game.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, cp, realpath } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';
import { runProcess } from '../dist/process.js';
import { godotScenario } from './fixtures/qa-godot-case.mjs';
import { parse } from 'yaml';

const original = JSON.parse(await readFile(join(process.argv[2], 'fixture.json'), 'utf8'));
assert.equal(original.scenario, 'godot');
const scenario = await godotScenario();
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-gdunit-command-')));
const workspace = join(directory, 'game');
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const npm = await npmPath();
const pack = JSON.parse(execFileSync(process.execPath, [npm, 'pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json'], { encoding: 'utf8' }))[0];
const cli = join(packageRoot, 'dist/cli.js');
const invocations = [];
async function call(entry, args, expected = 0) {
  const result = await runProcess(process.execPath, [entry, ...args, '--json'], { cwd: directory, timeoutMs: 150000 });
  invocations.push({ args, ...result });
  await writeFile(join(directory, 'invocations.json'), JSON.stringify(invocations, null, 2));
  assert.equal(result.exitCode, expected, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}
await call(cli, ['init', workspace, '--engine', 'godot']);
await call(cli, ['restore', '--project', workspace, '--archive', join(directory, pack.filename), '--offline']);
for (const [path, content] of Object.entries(scenario.inputs)) {
  await mkdir(dirname(join(workspace, path)), { recursive: true });
  await writeFile(join(workspace, path), content);
}
await mkdir(join(workspace, 'tests'), { recursive: true });
await cp(join(original.workspace, 'tests/combat_damage_test.gd'), join(workspace, 'tests/combat_damage_test.gd'));
await scenario.prepare(workspace, directory);
const launcher = join(workspace, '.game-studio/run.cjs');
const passed = await call(launcher, ['test', '--project', workspace, '--output', 'production/qa/evidence/command-pass']);
assert.equal(passed.data.processExitCode, 0);
assert.equal(passed.data.engineErrorDetected, false);
assert.equal(passed.data.portZeroDebuggerExpected, true);
const stdout = (await readFile(join(workspace, 'production/qa/evidence/command-pass/stdout.log'), 'utf8'))
  .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
assert.match(stdout, /Overall Summary: [1-9]\d* test cases \| 0 errors \| 0 failures \| 0 flaky \| 0 skipped \| 0 orphans/);
const stderr = await readFile(join(workspace, 'production/qa/evidence/command-pass/stderr.log'), 'utf8');
assert.match(stderr, /ERROR: The remote port number must be between 1 and 65535/);
assert.match(stderr, /ERROR: Remote Debugger: Unable to connect to host '127\.0\.0\.1:0'/);
await writeFile(join(workspace, 'tests/broken_test.gd'), 'extends GdUnitTestSuite\nfunc test_broken( -> void:\n\tpass\n');
const failed = await call(launcher, ['test', '--project', workspace,
  // A fresh report location preserves the positive run's original GdUnit report.
  '--command', parse(scenario.inputs['project.yaml']).commands.test.replace('res://production/qa/evidence/gdunit', 'res://production/qa/evidence/gdunit-broken'),
  '--output', 'production/qa/evidence/command-broken'], 5);
assert.equal(failed.data.engineErrorDetected, true);
assert.notEqual(failed.data.processExitCode, 0);
const summary = { directory, workspace, status: 'passed_for_gdunit_command_contract',
  positive: passed.data, parseError: failed.data,
  limits: 'Maintainer execution; native Codex sandbox, other editors/platforms and human play are not certified.' };
await writeFile(join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ directory, positive: passed.data.exitCode, parseError: failed.data.processExitCode }));
