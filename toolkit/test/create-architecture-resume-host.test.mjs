import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { snapshot, freezeWorkspace, verifyScope } from './create-architecture-resume-host.mjs';

test('freezes exact prior bytes without following external links; rejects stale and unsafe manifests', async t => {
  const root = await mkdtemp(join(tmpdir(), 'architecture-resume-protection-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = join(root, 'project');
  await mkdir(workspace); await writeFile(join(workspace, 'keep.md'), 'original');
  const external = join(root, 'external-directory');
  await mkdir(external); await writeFile(join(external, 'private.txt'), 'outside');
  await symlink(external, join(workspace, 'external'), process.platform === 'win32' ? 'junction' : 'dir');
  const before = await snapshot(workspace);
  assert.deepEqual(Object.keys(before.files), ['keep.md']);
  assert.ok(before.symlinks.external);
  await freezeWorkspace(workspace, before.files, join(root, 'frozen'));
  await writeFile(join(workspace, 'keep.md'), 'later');
  assert.equal(await readFile(join(root, 'frozen/keep.md'), 'utf8'), 'original');
  await assert.rejects(freezeWorkspace(workspace, before.files, join(root, 'stale')), /changed|match/i);
  await assert.rejects(freezeWorkspace(workspace, { 'external/private.txt': before.files['keep.md'] }, join(root, 'linked')), /link/i);
  await assert.rejects(freezeWorkspace(workspace, { '../external-directory/private.txt': before.files['keep.md'] }, join(root, 'escape')), /Unsafe/);
});

test('permits only architecture/checkpoint changes and checks preserved files and links', () => {
  const before = { files: { 'docs/architecture/architecture.md': 'a', 'production/session-state/active.md': 'b', 'design/gdd/rules.md': 'c' }, symlinks: { bin: 'tool' } };
  const after = { files: { ...before.files, 'docs/architecture/architecture.md': 'd', 'production/session-state/active.md': 'e' }, symlinks: { ...before.symlinks } };
  assert.deepEqual(verifyScope(before, after).changed.sort(), ['docs/architecture/architecture.md', 'production/session-state/active.md']);
  assert.throws(() => verifyScope(before, { ...after, files: { ...after.files, 'design/gdd/rules.md': 'changed' } }), /scope/i);
  assert.throws(() => verifyScope(before, { ...after, files: { ...after.files, 'docs/architecture/adr-new.md': 'new' } }), /scope/i);
  assert.throws(() => verifyScope(before, { ...after, symlinks: { bin: '/outside' } }), /link/i);
});
