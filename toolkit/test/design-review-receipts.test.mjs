import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const script = resolve(import.meta.dirname, '../../.agents/skills/game-studio-design-review/scripts/review-receipts.mjs');
async function workspace(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-review-receipts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
  return { root, run };
}

test('receipt comparison retains unseen dependencies and detects new, changed and deleted inputs', async t => {
  const { root, run } = await workspace(t);
  await mkdir(join(root, 'design'));
  await writeFile(join(root, 'design/letter 数据.md'), '# Rules\n');
  await writeFile(join(root, 'world.md'), 'Calm world\n');
  const stamped = run('hash', 'design/letter 数据.md', 'world.md', 'optional.yaml');
  assert.equal(stamped.status, 0); assert.match(stamped.stderr, /Not stamped/);
  await writeFile(join(root, 'review.md'), `## Review\r\n${stamped.stdout.replaceAll('\n', '\r\n')}`);
  const before = await readFile(join(root, 'review.md'));
  const unchanged = run('check', 'review.md', 'design/letter 数据.md', 'optional.yaml');
  assert.equal(unchanged.status, 0);
  assert.match(unchanged.stdout, /UNCHANGED: design\/letter 数据.md/);
  assert.match(unchanged.stdout, /UNCHANGED: world.md/);
  assert.doesNotMatch(unchanged.stdout, /optional/);
  await writeFile(join(root, 'world.md'), 'Changed world\n');
  await writeFile(join(root, 'optional.yaml'), 'entities: []\n');
  const changed = run('check', 'review.md', 'design/letter 数据.md', 'optional.yaml');
  assert.match(changed.stdout, /CHANGED: world.md/); assert.match(changed.stdout, /NEW: optional.yaml/);
  await rm(join(root, 'world.md'));
  assert.match(run('check', 'review.md').stdout, /GONE: world.md/);
  assert.deepEqual(await readFile(join(root, 'review.md')), before);
});

test('latest stamp wins; old or missing receipts never prove identity', async t => {
  const { root, run } = await workspace(t);
  await writeFile(join(root, 'gdd.md'), 'v1');
  const old = run('hash', 'gdd.md').stdout;
  await writeFile(join(root, 'gdd.md'), 'v2');
  const current = run('hash', 'gdd.md').stdout;
  await writeFile(join(root, 'review.md'), old + current);
  assert.match(run('check', 'review.md').stdout, /UNCHANGED: gdd.md/);
  await writeFile(join(root, 'review.md'), current + old);
  assert.match(run('check', 'review.md').stdout, /CHANGED: gdd.md/);
  await writeFile(join(root, 'review.md'), 'Reviewed-Content-Hash: gdd.md aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n');
  assert.match(run('check', 'review.md').stdout, /CHANGED: gdd.md/);
  assert.match(run('check', 'absent.md', 'gdd.md').stdout, /RECEIPT: NONE\nNEW: gdd.md/);
  assert.equal(run('check', 'review.md', 'design/*.md').status, 2);
  assert.match(run('check', 'review.md', 'design/*.md').stdout, /UNRESOLVED:/);
});

test('receipt paths cannot read outside the game root or certify unreadable inputs', async t => {
  const { root, run } = await workspace(t);
  await writeFile(join(root, 'review.md'), 'Reviewed-Content-Hash: ../outside.md sha256:' + '0'.repeat(64) + '\n');
  const unsafe = run('check', 'review.md');
  assert.equal(unsafe.status, 2); assert.match(unsafe.stdout, /ERROR: ..\/outside.md/);
  assert.doesNotMatch(unsafe.stdout, /UNCHANGED/);
  assert.equal(run('hash', '/etc/passwd').status, 2);
  assert.equal(run('hash', 'line\nbreak').status, 2);
  await mkdir(join(root, 'directory'));
  assert.equal(run('hash', 'directory').status, 2);
  if (process.platform !== 'win32') {
    await symlink(tmpdir(), join(root, 'outside'));
    assert.equal(run('hash', 'outside').status, 2);
  }
});

test('newer review metadata cannot borrow target evidence from an older entry', async t => {
  const { root, run } = await workspace(t);
  await writeFile(join(root, 'gdd.md'), 'unchanged design');
  await writeFile(join(root, 'world.md'), 'unchanged world');
  const gdd = run('hash', 'gdd.md').stdout;
  const world = run('hash', 'world.md').stdout;
  const older = `## Review — 2026-11-10 — Verdict: APPROVED\nReview mode: lean · Workflow: standard\n${gdd}${world}`;
  const newer = '## Review — 2026-11-11 — Verdict: APPROVED\nReview mode: full · Workflow: full\n';
  await writeFile(join(root, 'review.md'), older + newer + world);
  const missingTarget = run('check', 'review.md', 'gdd.md');
  assert.equal(missingTarget.status, 0);
  assert.match(missingTarget.stdout, /NEW: gdd.md/);
  assert.match(missingTarget.stdout, /UNCHANGED: world.md/);
  assert.doesNotMatch(missingTarget.stdout, /UNCHANGED: gdd.md/);
  await writeFile(join(root, 'review.md'), older + newer);
  const noStamps = run('check', 'review.md', 'gdd.md');
  assert.match(noStamps.stdout, /RECEIPT: NONE/);
  assert.match(noStamps.stdout, /NEW: gdd.md/);
  assert.doesNotMatch(noStamps.stdout, /UNCHANGED/);
  await rm(join(root, 'world.md'));
  assert.match(run('check', 'review.md', 'gdd.md').stdout, /GONE: world.md/);
  await writeFile(join(root, 'review.md'), older + newer + gdd);
  assert.match(run('check', 'review.md', 'gdd.md').stdout, /UNCHANGED: gdd.md/);
});
