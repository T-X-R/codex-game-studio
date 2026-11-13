// Independent mutation/orphan controls on a completed isolated native QA fixture.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { parse } from 'yaml';
import { runProcess } from '../dist/process.js';

const directory = await realpath(process.argv[2]);
const fixture = JSON.parse(await readFile(join(directory, 'fixture.json'), 'utf8'));
const hostReport = JSON.parse(await readFile(join(directory, 'report.json'), 'utf8'));
assert.equal(fixture.scenario, 'godot');
assert.equal(hostReport.exitCode, 0);
assert.deepEqual(hostReport.changed, []); assert.deepEqual(hostReport.outsideScope, []);
const workspace = fixture.workspace;
const sourcePath = join(workspace, 'src/damage_meter.gd');
const testPath = join(workspace, 'tests/combat_damage_test.gd');
const source = await readFile(sourcePath, 'utf8');
const tests = await readFile(testPath, 'utf8');
const config = parse(await readFile(join(workspace, 'project.yaml'), 'utf8'));
const reportArgument = '-rd res://production/qa/evidence/gdunit';
assert.ok(config.commands.test.endsWith(reportArgument));
assert.equal(source.split(' - armor').length, 2);
assert.ok(tests.includes('auto_free(NodeSubject.new())'));
async function snapshot() {
  const result = {};
  for (const item of await readdir(workspace, { recursive: true, withFileTypes: true })) {
    if (!item.isFile()) continue;
    const path = join(item.parentPath, item.name);
    const relative = path.slice(workspace.length + 1).replaceAll('\\', '/');
    if (relative.startsWith('.git/') || relative.startsWith('.godot/')) continue;
    result[relative] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  return result;
}
const before = await snapshot();
const controls = [];
async function check(name, processExit) {
  const output = `production/qa/evidence/control-${name}-${randomUUID()}`;
  const command = config.commands.test.slice(0, -reportArgument.length) + `-rd res://${output}/gdunit`;
  const execution = await runProcess(process.execPath, [join(workspace, '.game-studio/run.cjs'), 'test',
    '--command', command, '--output', `${output}/command`, '--timeout', '120000', '--json'], { cwd: workspace, timeoutMs: 150000 });
  const report = JSON.parse(await readFile(join(workspace, output, 'command/report.json'), 'utf8'));
  const stdout = (await readFile(join(workspace, output, 'command/stdout.log'), 'utf8')).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
  // Exact summary contract of the fixture's pinned GdUnit4 6.2.2, not a generic XML parser.
  const summary = /Overall Summary: (\d+) test cases \| (\d+) errors \| (\d+) failures \| (\d+) flaky \| (\d+) skipped \| (\d+) orphans \|/.exec(stdout);
  assert.ok(summary, `No completed GdUnit summary for ${name}`);
  const [count, errors, failures, flaky, skipped, orphans] = summary.slice(1).map(Number);
  const xml = await readFile(join(workspace, output, 'gdunit/report_1/results.xml'), 'utf8');
  const root = /<testsuites\s[^>]*>/.exec(xml)?.[0]; assert.ok(root);
  const registered = Number(/\btests="(\d+)"/.exec(root)?.[1]);
  // On fail-fast, XML retains the discovered test count while console reports execution.
  assert.ok(registered >= count);
  if (name === 'baseline' || name === 'restored') assert.equal(registered, count);
  for (const [field, expected] of Object.entries({ failures, flaky, skipped })) {
    assert.equal(Number(new RegExp(`\\b${field}="(\\d+)"`).exec(root)?.[1]), expected);
  }
  assert.ok(count > 0); assert.equal(errors, 0); assert.equal(skipped, 0);
  assert.equal(report.processExitCode, processExit);
  if (name === 'formula-mutation') assert.ok(failures > 0);
  else assert.equal(failures, 0);
  if (name === 'orphan-control') assert.ok(orphans > 0);
  else assert.equal(orphans, 0);
  controls.push({ name, output, cliExit: execution.exitCode, processExit: report.processExitCode,
    engineErrorDetected: report.engineErrorDetected, registered, executed: count, errors, failures, flaky, skipped, orphans });
  console.log(JSON.stringify(controls.at(-1)));
}
try {
  await check('baseline', 0);
  await writeFile(sourcePath, source.replace(' - armor', ' + armor'));
  await check('formula-mutation', 100);
  await writeFile(sourcePath, source);
  await writeFile(testPath, tests.replaceAll('auto_free(NodeSubject.new())', 'NodeSubject.new()'));
  await check('orphan-control', 101);
} finally {
  await writeFile(sourcePath, source);
  await writeFile(testPath, tests);
}
await check('restored', 0);
const after = await snapshot();
const changed = Object.keys(before).filter(path => before[path] !== after[path]);
assert.deepEqual(changed, []);
await writeFile(join(directory, 'independent-controls.json'), JSON.stringify({
  status: 'passed_for_test_sensitivity_and_cleanup_only', controls, preservedFiles: Object.keys(before).length, changed,
  limitation: 'These maintainer engine runs are separate from the native host sandbox. Preserve command-level diagnostics; this is not clean host execution or human acceptance.',
}, null, 2), { flag: 'wx' });
