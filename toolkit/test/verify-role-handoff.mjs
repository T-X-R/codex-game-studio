// Maintainer checks for the completed native chain, independent of both children.
// Writes only beside the disposable game; native trace review remains separate.
import assert from 'node:assert/strict';
import { readFile, writeFile, realpath, access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { handoffScenarios } from './fixtures/role-handoff-case.mjs';

if (process.argv.length !== 3) throw new Error('Usage: node test/verify-role-handoff.mjs <completed-fixture-directory>');
const directory = await realpath(process.argv[2]);
const output = join(directory, 'independent-handoff-checks.json');
try { await access(output); throw new Error('Independent evidence already exists; preserve it'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const report = JSON.parse(await readFile(join(directory, 'report.json'), 'utf8'));
assert.equal(report.scenario, 'role-handoff'); assert.equal(report.exitCode, 0);
assert.deepEqual(report.changed, []); assert.deepEqual(report.outsideScope, []);
for (const path of handoffScenarios['role-handoff'].expectedFiles) {
  assert.ok(report.added.includes(path), `Missing required artifact: ${path}`);
}
const workspace = join(directory, 'QA game 测试');
const source = join(workspace, 'src/charge.mjs');
const { createCharge } = await import(pathToFileURL(source).href);
const defaults = JSON.parse(await readFile(join(workspace, 'assets/data/charge.json'), 'utf8'));
const evidence = { sourceSha256: createHash('sha256').update(await readFile(source)).digest('hex'),
  node: process.version, scope: 'maintainer pure-logic checks, separate from native QA and static review', status: 'failed', passedGroups: [] };
const setup = (config = defaults) => {
  const events = []; return { c: createCharge({ ...config }, e => events.push(e)), events };
};
try {
  {
    const { c, events } = setup();
    assert.deepEqual(c.state(), { energy: 10, paused: false });
    assert.equal(c.use(), true); assert.equal(c.use(), true); assert.equal(c.use(), false);
    assert.equal(c.tick(0), 2); assert.equal(c.tick(1000), 4); assert.equal(c.use(), true);
    assert.deepEqual(c.state(), { energy: 0, paused: false });
    assert.deepEqual(events, [6, 2, 0].map(remaining => ({ type: 'used', remaining })));
    assert.equal(c.tick(10000), 10); assert.equal(c.tick(10000), 10);
    assert.equal(events.length, 3); evidence.passedGroups.push('exact affordability, rejection, zero delta, cap and events');
  }
  {
    const { c, events } = setup(); c.use();
    assert.equal(c.setPaused(true), undefined); assert.equal(c.use(), false); assert.equal(c.tick(10000), 6);
    assert.equal(c.setPaused(false), undefined); assert.equal(c.tick(500), 7);
    c.setPaused(true); assert.equal(c.reset(), undefined);
    assert.deepEqual(c.state(), { energy: 10, paused: false });
    assert.equal(c.tick(0), 10); assert.equal(events.length, 1);
    evidence.passedGroups.push('pause, no queued recovery, resume and reset');
  }
  {
    const { c, events } = setup(); const snapshot = c.state();
    snapshot.energy = 0; snapshot.paused = true;
    assert.deepEqual(c.state(), { energy: 10, paused: false }); assert.deepEqual(events, []);
    c.use(); assert.notDeepEqual(snapshot, c.state());
    evidence.passedGroups.push('detached state and side-effect-free queries');
  }
  {
    const { c, events } = setup({ capacity: 6, cost: 3, regenPerSecond: 0 });
    assert.equal(c.use(), true); assert.equal(c.use(), true); assert.equal(c.use(), false);
    assert.equal(c.tick(10000), 0); c.reset(); assert.equal(c.state().energy, 6);
    assert.deepEqual(events, [3, 0].map(remaining => ({ type: 'used', remaining })));
    evidence.passedGroups.push('external tuning and zero regeneration');
  }
  {
    const config = { ...defaults }; const events = [];
    const a = createCharge(config, e => events.push(e)); const b = createCharge(config, e => events.push(e));
    a.use(); a.setPaused(true);
    assert.deepEqual(b.state(), { energy: 10, paused: false });
    b.use(); b.tick(1000); assert.deepEqual(a.state(), { energy: 6, paused: true });
    assert.deepEqual(config, defaults); evidence.passedGroups.push('independent instances sharing configuration');
  }
  {
    const a = setup(); const b = setup(); a.c.use(); b.c.use();
    a.c.tick(1000); for (const dt of [333, 333, 334]) b.c.tick(dt);
    assert.ok(Math.abs(a.c.state().energy - b.c.state().energy) <= 1e-9);
    assert.deepEqual(a.events, b.events); evidence.passedGroups.push('equivalent partitioned elapsed time');
  }
  const red = JSON.parse(await readFile(join(workspace, 'production/qa/evidence/charge/implementation/red/report.json'), 'utf8'));
  assert.equal(red.status, 'failed'); assert.equal(red.exitCode, 5);
  assert.notEqual(red.processExitCode, 0);
  evidence.nativeRed = { status: red.status, exitCode: red.exitCode, processExitCode: red.processExitCode };
  evidence.nativeRuns = {};
  const qaReports = report.added.filter(path => path.startsWith('production/qa/evidence/charge/independent/') && path.endsWith('/report.json'));
  assert.equal(qaReports.length, 1, 'Exactly one retained independent suite report is required');
  const qaPhase = qaReports[0].slice('production/qa/evidence/charge/'.length, -'/report.json'.length);
  evidence.independentReport = qaReports[0];
  for (const phase of ['implementation/green', qaPhase]) {
    const base = join(workspace, 'production/qa/evidence/charge', phase);
    const run = JSON.parse(await readFile(join(base, 'report.json'), 'utf8'));
    assert.equal(run.exitCode, 0); assert.equal(run.status, 'ok');
    const stdout = await readFile(join(base, 'stdout.log'), 'utf8');
    const counts = Object.fromEntries([...stdout.matchAll(/^# (tests|pass|fail|skipped) (\d+)$/gm)].map(m => [m[1], Number(m[2])]));
    assert.ok(counts.tests > 0); assert.equal(counts.pass, counts.tests);
    assert.equal(counts.fail, 0); assert.equal(counts.skipped, 0);
    evidence.nativeRuns[phase] = counts;
  }
  assert.ok(evidence.nativeRuns[qaPhase].tests > evidence.nativeRuns['implementation/green'].tests);
  evidence.status = 'passed';
} catch (error) { evidence.error = error.message; process.exitCode = 1; }
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ output, ...evidence }));
