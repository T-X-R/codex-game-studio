// Independent contract checks for a completed native implementation fixture.
// Reads generated code; writes evidence beside the fixture, never into the game.
import assert from 'node:assert/strict';
import { readFile, writeFile, realpath, access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

if (process.argv.length !== 3) throw new Error('Usage: node test/verify-gameplay.mjs <completed-fixture-directory>');
const directory = await realpath(process.argv[2]);
const output = join(directory, 'independent-gameplay-checks.json');
try { await access(output); throw new Error('Independent evidence already exists; preserve it'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const report = JSON.parse(await readFile(join(directory, 'report.json'), 'utf8'));
assert.ok(['gameplay-implement', 'gameplay-minimal'].includes(report.scenario));
assert.equal(report.role, 'game-studio-gameplay-programmer');
assert.equal(report.exitCode, 0); assert.deepEqual(report.changed, []); assert.deepEqual(report.outsideScope, []);
const workspace = join(directory, 'QA game 测试');
const source = join(workspace, 'src/combo.mjs');
const config = JSON.parse(await readFile(join(workspace, 'assets/data/combo.json'), 'utf8'));
const { createCombo } = await import(pathToFileURL(source).href);
assert.equal(typeof createCombo, 'function');

function checkContract(factory) {
  let groups = 0;
  function setup(values = config) {
    const events = [];
    const combo = factory({ ...values }, event => events.push(event));
    return { combo, events };
  }
  const light = (step, at) => ({ type: 'light', step, at });
  const finish = (step, at) => ({ type: 'finisher', step, at });
  {
    const { combo: c, events } = setup();
    assert.deepEqual(c.state(0), { step: 0, coolingDown: false });
    for (const time of [0, 350, 700]) assert.equal(c.attack(time), true);
    assert.deepEqual(events, [light(1, 0), light(2, 350), finish(3, 700)]);
    assert.deepEqual(c.state(700), { step: 0, coolingDown: true });
    assert.equal(c.attack(899), false);
    assert.deepEqual(events, [light(1, 0), light(2, 350), finish(3, 700)]);
    assert.deepEqual(c.state(900), { step: 0, coolingDown: false });
    assert.equal(c.attack(900), true);
    assert.deepEqual(events.at(-1), light(1, 900)); groups++;
  }
  {
    const { combo: c, events } = setup();
    c.attack(100);
    assert.deepEqual(c.state(450), { step: 1, coolingDown: false });
    assert.deepEqual(c.state(451), { step: 0, coolingDown: false });
    assert.deepEqual(events, [light(1, 100)]);
    assert.equal(c.attack(451), true);
    assert.deepEqual(events, [light(1, 100), light(1, 451)]); groups++;
  }
  {
    const { combo: c, events } = setup();
    c.attack(0); c.state(200); c.attack(351);
    assert.deepEqual(events, [light(1, 0), light(1, 351)]);
    c.attack(352); c.attack(353);
    assert.deepEqual(events.at(-1), finish(3, 353));
    c.reset(); assert.deepEqual(c.state(353), { step: 0, coolingDown: false });
    assert.equal(events.length, 4); assert.equal(c.attack(353), true);
    assert.deepEqual(events.at(-1), light(1, 353));
    c.reset(); assert.equal(events.length, 5);
    assert.deepEqual(c.state(354), { step: 0, coolingDown: false }); groups++;
  }
  {
    const { combo: c, events } = setup({ steps: 4, windowMs: 10, cooldownMs: 20 });
    for (const time of [0, 10, 20, 30]) assert.equal(c.attack(time), true);
    assert.deepEqual(events, [light(1, 0), light(2, 10), light(3, 20), finish(4, 30)]);
    assert.equal(c.attack(49), false); assert.equal(c.attack(50), true);
    assert.deepEqual(events.at(-1), light(1, 50)); groups++;
  }
  {
    const { combo: c, events } = setup({ steps: 2, windowMs: 0, cooldownMs: 0 });
    for (const time of [7, 7, 7, 8, 8]) assert.equal(c.attack(time), true);
    assert.deepEqual(events, [light(1, 7), finish(2, 7), light(1, 7), light(1, 8), finish(2, 8)]);
    assert.deepEqual(c.state(8), { step: 0, coolingDown: false }); groups++;
  }
  {
    const shared = { ...config }; const aEvents = []; const bEvents = [];
    const a = factory(shared, event => aEvents.push(event));
    const b = factory(shared, event => bEvents.push(event));
    a.attack(0); a.attack(1);
    assert.deepEqual(b.state(1), { step: 0, coolingDown: false }); b.attack(1);
    assert.deepEqual(aEvents, [light(1, 0), light(2, 1)]);
    assert.deepEqual(bEvents, [light(1, 1)]); groups++;
  }
  {
    const a = setup(); const b = setup();
    for (const time of [0, 350, 700]) a.combo.attack(time);
    b.combo.attack(0);
    for (const time of [100, 200, 349, 350]) b.combo.state(time);
    b.combo.attack(350);
    for (const time of [500, 699, 700]) b.combo.state(time);
    b.combo.attack(700);
    assert.deepEqual(a.events, b.events); assert.deepEqual(a.combo.state(700), b.combo.state(700)); groups++;
  }
  return groups;
}

const evidence = { scenario: report.scenario, sourceSha256: createHash('sha256').update(await readFile(source)).digest('hex'),
  node: process.version, scope: 'maintainer contract checks on generated pure logic; not browser, engine or human acceptance', status: 'failed' };
try {
  evidence.passedBehaviorGroups = checkContract(createCombo);
  evidence.negativeControls = [];
  for (const [name, transform] of [
    ['shortened-window', values => ({ ...values, windowMs: Math.max(0, values.windowMs - 0.001) })],
    ['hardcoded-three-steps', values => ({ ...values, steps: 3 })],
    ['extended-cooldown', values => ({ ...values, cooldownMs: values.cooldownMs + 1 })],
  ]) {
    assert.throws(() => checkContract((values, emit) => createCombo(transform(values), emit)), { code: 'ERR_ASSERTION' });
    evidence.negativeControls.push({ name, result: 'contract checker rejected altered behavior' });
  }
  for (const phase of ['red', 'green']) {
    const base = join(workspace, 'production/qa/evidence/combo', phase);
    const execution = JSON.parse(await readFile(join(base, 'report.json'), 'utf8'));
    assert.equal(execution.exitCode, phase === 'red' ? 5 : 0);
    assert.equal(execution.status, phase === 'red' ? 'failed' : 'ok');
    if (phase === 'green') {
      const stdout = await readFile(join(base, 'stdout.log'), 'utf8');
      const counts = Object.fromEntries([...stdout.matchAll(/^# (tests|pass|fail|skipped) (\d+)$/gm)].map(match => [match[1], Number(match[2])]));
      assert.ok(counts.tests > 0); assert.equal(counts.pass, counts.tests);
      assert.equal(counts.fail, 0); assert.equal(counts.skipped, 0); evidence.nativeGreenCounts = counts;
    }
  }
  evidence.status = 'passed';
} catch (error) { evidence.error = error.message; process.exitCode = 1; }
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ output, ...evidence }));
