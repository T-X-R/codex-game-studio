import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planAttach } from '../dist/attach.js';
import { applyInstall, planDetach } from '../dist/install.js';
import { setupSkill } from '../dist/skills-setup.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'game studio 接入 '));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
test('attach preserves existing rules, game dependencies and configuration; detach restores originals', async t => {
  const root = await fixture(t);
  const originals = { 'AGENTS.md': '# My instructions\n', 'package.json': '{"name":"my-game"}', 'project.yaml': 'engine:\n  name: Web\n', '.gitignore': 'secret.txt\n' };
  for (const [path, value] of Object.entries(originals)) await writeFile(join(root, path), value);
  const plan = await planAttach(root);
  assert.deepEqual((await readdir(root)).sort(), Object.keys(originals).sort());
  await applyInstall(plan);
  assert.deepEqual((await planAttach(root)).changes, []);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), originals['package.json']);
  assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), originals['project.yaml']);
  assert.ok((await readFile(join(root, 'AGENTS.md'), 'utf8')).startsWith(originals['AGENTS.md']));
  await applyInstall(await planDetach(root));
  for (const [path, value] of Object.entries(originals)) assert.equal(await readFile(join(root, path), 'utf8'), value);
});
test('init refuses occupied directories and supports a new Unicode path without writing during planning', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'keep.txt'), 'game');
  await assert.rejects(planAttach(root, { initialize: true, engine: 'web' }), { code: 'FILE_CONFLICT' });
  const target = join(root, '新游戏');
  const plan = await planAttach(target, { initialize: true, engine: 'web' });
  await assert.rejects(readdir(target), { code: 'ENOENT' });
  await applyInstall(plan);
  assert.match(await readFile(join(target, 'project.yaml'), 'utf8'), /Web/);
});
test('onboarding setup previews, is idempotent, and removes only its own files', async t => {
  const root = await fixture(t);
  await setupSkill(root, false, true);
  assert.deepEqual(await readdir(root), []);
  await setupSkill(root);
  await setupSkill(root);
  await writeFile(join(root, 'skills/game-studio/personal.md'), 'keep');
  await setupSkill(root, true);
  assert.equal(await readFile(join(root, 'skills/game-studio/personal.md'), 'utf8'), 'keep');
});
