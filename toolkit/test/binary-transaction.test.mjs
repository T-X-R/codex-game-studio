import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, realpath, mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { applyInstall, describePlan, recoverInstall } from '../dist/install.js';
const before = Buffer.from([0, 255, 128, 13, 10]);
const after = Buffer.from([255, 254, 0, 9, 13]);
async function fixture(t) {
  const project = await realpath(await mkdtemp(join(tmpdir(), 'studio binary ')));
  t.after(() => rm(project, { recursive: true, force: true }));
  await writeFile(join(project, 'image.png'), before);
  return { project, version: '0.1', changes: [{ path: 'image.png', encoding: 'base64', before: before.toString('base64'), after: after.toString('base64') }] };
}
test('binary transactions preserve bytes and hash the actual asset rather than its journal encoding', async t => {
  const plan = await fixture(t);
  assert.equal(describePlan(plan).changes[0].afterHash, createHash('sha256').update(after).digest('hex'));
  await applyInstall(plan);
  assert.deepEqual(await readFile(join(plan.project, 'image.png')), after);
});
test('binary rollback restores original bytes and stale plans refuse user edits', async t => {
  const plan = await fixture(t);
  plan.changes.push({ path: 'parent', before: null, after: 'file' }, { path: 'parent/child', before: null, after: 'cannot create' });
  await assert.rejects(applyInstall(plan), { code: 'ENOTDIR' });
  assert.deepEqual(await readFile(join(plan.project, 'image.png')), before);
  await writeFile(join(plan.project, 'image.png'), after);
  await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
  assert.deepEqual(await readFile(join(plan.project, 'image.png')), after);
});
test('interrupted binary transactions recover through JSON while preserving concurrent changes', async t => {
  const plan = await fixture(t);
  await mkdir(join(plan.project, '.game-studio'));
  await writeFile(join(plan.project, '.game-studio/transaction.json'), JSON.stringify(plan));
  await writeFile(join(plan.project, 'image.png'), after);
  const preview = await recoverInstall(plan.project, true);
  assert.equal(preview.changes[0].encoding, 'base64');
  await writeFile(join(plan.project, 'image.png'), 'user edit');
  await assert.rejects(recoverInstall(plan.project), { code: 'FILE_CONFLICT' });
  await writeFile(join(plan.project, 'image.png'), after);
  await recoverInstall(plan.project);
  assert.deepEqual(await readFile(join(plan.project, 'image.png')), before);
});
test('invalid encoding is rejected before any writes and unchanged guards retain file metadata', async t => {
  for (const change of [{ encoding: 'hex' }, { after: 'not base64!' }, { before: 'YQ' }]) {
    const plan = await fixture(t);
    Object.assign(plan.changes[0], change);
    await assert.rejects(applyInstall(plan), { code: 'INVALID_INSTALLATION' });
    assert.deepEqual(await readFile(join(plan.project, 'image.png')), before);
    await mkdir(join(plan.project, '.game-studio'));
    await writeFile(join(plan.project, '.game-studio/transaction.json'), JSON.stringify(plan));
    await assert.rejects(recoverInstall(plan.project), { code: 'INVALID_INSTALLATION' });
  }
  const plan = await fixture(t);
  plan.changes[0].after = plan.changes[0].before;
  const original = await stat(join(plan.project, 'image.png'));
  await applyInstall(plan);
  assert.equal((await stat(join(plan.project, 'image.png'))).mtimeMs, original.mtimeMs);
});
