import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { resolveCommand, runConfiguredTest } = await import('../dist/run-tests.js');
async function fixture(t, config, script = 'console.log("test output");') {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio run tests 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), config);
  await mkdir(join(root, 'test folder'));
  await writeFile(join(root, 'test folder/check.cjs'), script);
  return root;
}
const command = 'node "test folder/check.cjs"';

test('Godot errors cannot pass on exit zero, while other engines keep their own output semantics', async t => {
  for (const [engine, code] of [['Godot', 0], ['Web', 0], ['Godot', 3]]) {
    const root = await fixture(t, `engine:\n  name: ${engine}\ncommands:\n  smoke: ${JSON.stringify(command)}\n`,
      `console.error("\\u001b[31mSCRIPT ERROR:\\u001b[0m Parse Error: broken script"); process.exitCode=${code};`);
    const result = await runConfiguredTest(root, 'smoke', 'evidence');
    assert.equal(result.processExitCode, code);
    assert.equal(result.exitCode, engine === 'Godot' ? 5 : 0);
    assert.equal(result.engineErrorDetected, engine === 'Godot');
    assert.equal(result.status, engine === 'Godot' ? 'failed' : 'ok');
    if (engine === 'Godot') assert.match(result.reason, /engine errors/);
  }
});

test('command selection honors OS keys then default and ignores personal command overrides', async t => {
  const root = await fixture(t, 'commands:\n  test:\n    windows: echo win\n    macos: echo mac\n    default: echo default\n');
  await writeFile(join(root, 'project.local.yaml'), 'commands:\n  test: echo personal\n');
  assert.equal((await resolveCommand(root, 'test', 'win32')).command, 'echo win');
  assert.equal((await resolveCommand(root, 'test', 'darwin')).command, 'echo mac');
  assert.equal((await resolveCommand(root, 'test', 'linux')).command, 'echo default');
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\ncommands:\n  test:\n    windows: echo win\n');
  assert.equal((await resolveCommand(root, 'test', 'linux')).command, null);
  await writeFile(join(root, 'project.yaml'), 'commands:\n  test: [invalid]\n');
  await assert.rejects(resolveCommand(root, 'test'), { code: 'INVALID_CONFIG' });
});

test('missing engine tests and absent Web scripts are not assessed with a durable report', async t => {
  for (const name of ['Unity', 'Unreal', 'Web', 'Godot']) {
    const root = await fixture(t, `engine:\n  name: ${name}\n`);
    const result = await runConfiguredTest(root, 'test', 'production/evidence/missing');
    assert.equal(result.exitCode, 3, name);
    assert.equal(result.processExitCode, null);
    const report = JSON.parse(await readFile(join(root, 'production/evidence/missing/report.json'), 'utf8'));
    assert.equal(report.status, 'not_assessed');
    assert.ok(report.reason);
  }
});

test('dry run does not execute code or create evidence; a real run preserves stdout and stderr', async t => {
  const root = await fixture(t, `commands:\n  test: ${JSON.stringify(command)}\n`,
    'require("node:fs").writeFileSync("ran.txt", "yes"); console.log("test output"); console.error("diagnostic output");');
  const initial = await readdir(root);
  const preview = await runConfiguredTest(root, 'test', 'production/evidence/run', { dryRun: true });
  assert.equal(preview.status, 'planned');
  assert.deepEqual(await readdir(root), initial);
  const result = await runConfiguredTest(root, 'test', 'production/evidence/run');
  assert.equal(result.exitCode, 0);
  assert.equal(result.processExitCode, 0);
  assert.equal(await readFile(join(root, 'ran.txt'), 'utf8'), 'yes');
  assert.match(await readFile(join(root, 'production/evidence/run/stdout.log'), 'utf8'), /test output/);
  assert.match(await readFile(join(root, 'production/evidence/run/stderr.log'), 'utf8'), /diagnostic output/);
  await assert.rejects(runConfiguredTest(root, 'test', 'production/evidence/run'), { code: 'FILE_CONFLICT' });
});

test('a failed test preserves the original exit code while toolkit returns CHECK_FAILED semantics', async t => {
  const root = await fixture(t, `commands:\n  test: ${JSON.stringify(command)}\n`, 'console.error("assertion failed"); process.exitCode=7;');
  const result = await runConfiguredTest(root, 'test', 'production/evidence/failure');
  assert.equal(result.exitCode, 5);
  assert.equal(result.processExitCode, 7);
  assert.equal(result.status, 'failed');
  assert.match(await readFile(join(root, 'production/evidence/failure/stderr.log'), 'utf8'), /assertion failed/);
});

test('timeouts terminate the process and retain evidence instead of reporting success', async t => {
  const root = await fixture(t, `commands:\n  test: ${JSON.stringify(command)}\n`, 'console.log("started"); setInterval(()=>{}, 1000);');
  const result = await runConfiguredTest(root, 'test', 'production/evidence/timeout', { timeoutMs: 300 });
  assert.equal(result.exitCode, 124);
  assert.equal(result.status, 'failed');
  assert.equal(JSON.parse(await readFile(join(root, 'production/evidence/timeout/report.json'), 'utf8')).exitCode, 124);
});

test('unknown operations and unsafe evidence paths fail before invoking the command', async t => {
  const root = await fixture(t, `commands:\n  test: ${JSON.stringify(command)}\n`);
  await assert.rejects(runConfiguredTest(root, 'deploy', 'evidence'), { code: 'INVALID_ARGUMENT' });
  await assert.rejects(runConfiguredTest(root, 'test', '../escape'), { code: 'UNSAFE_PATH' });
  await assert.rejects(runConfiguredTest(root, 'test', 'evidence', { timeoutMs: NaN }), { code: 'INVALID_ARGUMENT' });
});

test('Web fallback runs the actual npm script and unavailable executables remain not assessed', async t => {
  const root = await fixture(t, 'engine:\n  name: Web\n');
  await writeFile(join(root, 'package.json'), JSON.stringify({ private: true, scripts: { test: command } }));
  const result = await runConfiguredTest(root, 'test', 'production/evidence/npm');
  assert.equal(result.source, 'engine table');
  assert.equal(result.exitCode, 0);
  assert.match(await readFile(join(root, 'production/evidence/npm/stdout.log'), 'utf8'), /test output/);
  await writeFile(join(root, 'project.yaml'), 'commands:\n  test: game-studio-executable-that-does-not-exist\n');
  const missing = await runConfiguredTest(root, 'test', 'production/evidence/missing-exe');
  assert.equal(missing.exitCode, 3, JSON.stringify(missing) + '\n' + await readFile(join(root, 'production/evidence/missing-exe/stderr.log'), 'utf8'));
  assert.notEqual(missing.processExitCode, 0);
});

test('CLI exit and result status distinguish an unavailable runner from a failing test', async t => {
  const root = await fixture(t, '{}', 'process.exitCode=7;');
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const args = [cli, 'test', '--project', root, '--json'];
  const missing = spawnSync(process.execPath, [...args, '--output', 'evidence/missing'], { encoding: 'utf8' });
  assert.equal(missing.status, 3, missing.stdout + missing.stderr);
  assert.equal(JSON.parse(missing.stdout).status, 'not_assessed');
  await writeFile(join(root, 'project.yaml'), `commands:\n  test: ${JSON.stringify(command)}\n`);
  const failed = spawnSync(process.execPath, [...args, '--output', 'evidence/failed'], { encoding: 'utf8' });
  assert.equal(failed.status, 5, failed.stdout + failed.stderr);
  assert.equal(JSON.parse(failed.stdout).error.code, 'CHECK_FAILED');
  assert.equal(JSON.parse(failed.stdout).data.processExitCode, 7);
});

test('quoted Unicode script paths and arguments survive shell execution without hiding exit one', async t => {
  const root = await fixture(t, '{}');
  await writeFile(join(root, 'test folder/检查 & check.cjs'), 'console.log(JSON.stringify(process.argv.slice(2))); process.exitCode=1;');
  const configured = 'node "test folder/检查 & check.cjs" "玩家 & one"';
  await writeFile(join(root, 'project.yaml'), `commands:\n  test: ${JSON.stringify(configured)}\n`);
  const result = await runConfiguredTest(root, 'test', 'evidence/unicode');
  const stdout = await readFile(join(root, 'evidence/unicode/stdout.log'), 'utf8');
  assert.equal(result.exitCode, 5, JSON.stringify(result));
  assert.equal(result.processExitCode, 1);
  assert.deepEqual(JSON.parse(stdout), ['玩家 & one']);
});
