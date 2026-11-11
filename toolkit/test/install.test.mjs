import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, rm, symlink, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const { planInstall, applyInstall, planDetach, recoverInstall } = await import('../dist/install.js');

async function workspace(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'game studio install ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const bundle = { '.agents/skills/game-studio-start/SKILL.md': 'version one', '.codex/agents/game-studio-qa.toml': 'role' };

test('planning is read-only and repeat installation is idempotent', async t => {
  const root = await workspace(t);
  const plan = await planInstall(root, bundle, '0.1.0');
  await assert.rejects(readFile(join(root, '.game-studio/install.json')), { code: 'ENOENT' });
  await applyInstall(plan);
  const second = await planInstall(root, bundle, '0.1.0');
  assert.deepEqual(second.changes, []);
  assert.equal(await readFile(join(root, '.agents/skills/game-studio-start/SKILL.md'), 'utf8'), 'version one');
});

test('an edited managed file blocks the whole upgrade before any other file changes', async t => {
  const root = await workspace(t);
  await applyInstall(await planInstall(root, bundle, '0.1.0'));
  await writeFile(join(root, '.agents/skills/game-studio-start/SKILL.md'), 'user customization');
  await assert.rejects(planInstall(root, { ...bundle, '.codex/agents/game-studio-qa.toml': 'new role' }, '0.2.0'), { code: 'FILE_CONFLICT' });
  assert.equal(await readFile(join(root, '.codex/agents/game-studio-qa.toml'), 'utf8'), 'role');
});

test('unowned files are never overwritten and stale plans detect concurrent edits', async t => {
  const root = await workspace(t);
  await writeFile(join(root, 'AGENTS.md'), 'user rules');
  await assert.rejects(planInstall(root, { 'AGENTS.md': 'replacement' }, '0.1.0'), { code: 'FILE_CONFLICT' });
  const plan = await planInstall(root, bundle, '0.1.0');
  await mkdir(join(root, '.agents/skills/game-studio-start'), { recursive: true });
  await writeFile(join(root, '.agents/skills/game-studio-start/SKILL.md'), 'another installer');
  await assert.rejects(applyInstall(plan), { code: 'FILE_CONFLICT' });
  await assert.rejects(readFile(join(root, '.codex/agents/game-studio-qa.toml')), { code: 'ENOENT' });
});

test('path traversal and symlink destinations are refused', async t => {
  const root = await workspace(t);
  const outside = await workspace(t);
  for (const path of ['../escape', '/tmp/escape', 'x/../../escape', 'x\\escape']) {
    await assert.rejects(planInstall(root, { [path]: 'bad' }, '0.1.0'), { code: 'UNSAFE_PATH' });
  }
  await symlink(outside, join(root, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(planInstall(root, bundle, '0.1.0'), { code: 'UNSAFE_PATH' });
});

test('detach removes only owned integration and preserves game files', async t => {
  const root = await workspace(t);
  await applyInstall(await planInstall(root, bundle, '0.1.0'));
  await writeFile(join(root, 'game.html'), 'my game');
  await applyInstall(await planDetach(root));
  assert.equal(await readFile(join(root, 'game.html'), 'utf8'), 'my game');
  await assert.rejects(readFile(join(root, '.agents/skills/game-studio-start/SKILL.md')), { code: 'ENOENT' });
});

test('a failed apply rolls back earlier file mutations', async t => {
  const root = await workspace(t);
  const plan = await planInstall(root, { '.agents': 'cannot be a parent', '.agents/child': 'second' }, '0.1.0');
  await assert.rejects(applyInstall(plan));
  await assert.rejects(readFile(join(root, '.agents')), { code: 'ENOENT' });
});


test('interrupted apply is recovered without touching later user edits', async t => {
  const root = await workspace(t);
  const plan = await planInstall(root, bundle, '0.1.0');
  await mkdir(join(root, '.game-studio'), { recursive: true });
  await writeFile(join(root, '.game-studio/transaction.json'), JSON.stringify(plan));
  const first = plan.changes[0];
  await mkdir(join(root, '.agents/skills/game-studio-start'), { recursive: true });
  await writeFile(join(root, first.path), first.after);
  await recoverInstall(root, true);
  assert.equal(await readFile(join(root, first.path), 'utf8'), first.after);
  await writeFile(join(root, first.path), 'user edit');
  await assert.rejects(recoverInstall(root), { code: 'FILE_CONFLICT' });
  await writeFile(join(root, first.path), first.after);
  await recoverInstall(root);
  await assert.rejects(readFile(join(root, first.path)), { code: 'ENOENT' });
  await assert.rejects(readFile(join(root, '.game-studio/transaction.json')), { code: 'ENOENT' });
});

test('a live installer cannot be recovered and forged journal paths are refused', async t => {
  const root = await workspace(t);
  await mkdir(join(root, '.game-studio'));
  await writeFile(join(root, '.game-studio/install.lock'), String(process.pid));
  await assert.rejects(recoverInstall(root), { code: 'INSTALL_LOCKED' });
  await rm(join(root, '.game-studio/install.lock'));
  await writeFile(join(root, '.game-studio/transaction.json'), JSON.stringify({
    project: root, version: '0.1', changes: [{ path: '../escape', before: null, after: 'x' }],
  }));
  await assert.rejects(recoverInstall(root), { code: 'UNSAFE_PATH' });
});
