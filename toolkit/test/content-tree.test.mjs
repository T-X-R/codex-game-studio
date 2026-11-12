import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectContent } from '../dist/content-tree.js';

const skill = name => `---\nname: ${name}\ndescription: Work on a game.\n---\nRead the brief.\n`;
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-content-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, body) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), body); };
  await write('.agents/skills/game-studio-test/SKILL.md', skill('game-studio-test'));
  await write('studio/onboarding/game-studio/SKILL.md', skill('game-studio'));
  await write('.codex/agents/game-studio-review.toml', 'name="game-studio-review"\ndescription="Review a game."\ndeveloper_instructions="Return findings."\n');
  return { root, write };
}

test('content inspection follows local and bundled references without a maintainer checkout', async t => {
  const { root, write } = await fixture(t);
  await write('.agents/skills/game-studio-test/SKILL.md', skill('game-studio-test') + '[Details](references/details.md#rules)\nRead `node .game-studio/run.cjs resource path studio/docs/shared.md --json`.\n');
  await write('.agents/skills/game-studio-test/references/details.md', '[More](more.md)\n');
  await write('.agents/skills/game-studio-test/references/more.md', '[Back](details.md)\n');
  await write('studio/docs/shared.md', '# Shared\n[Official](https://example.com/ignored.md)\n');
  const result = await inspectContent(root);
  assert.equal(result.status, 'valid'); assert.deepEqual(result.issues, []);
  assert.deepEqual(result.counts, { skills: 1, onboarding: 1, roles: 1 });
  assert.ok(result.checkedFiles.includes('studio/docs/shared.md'));
  assert.equal(new Set(result.checkedFiles).size, result.checkedFiles.length);
  assert.equal(result.behaviorVerified, false);
});

test('missing entrypoints, empty trees and duplicate names never report valid content', async t => {
  const { root, write } = await fixture(t);
  await rm(join(root, '.codex/agents'), { recursive: true });
  await write('.agents/skills/game-studio-other/references/details.md', '# No entrypoint\n');
  await write('studio/onboarding/game-studio/SKILL.md', skill('game-studio-test'));
  const result = await inspectContent(root);
  for (const code of ['MISSING_TREE', 'MISSING_ENTRYPOINT', 'DUPLICATE_NAME']) assert.ok(result.issues.some(x => x.code === code), code);
  assert.equal(result.status, 'invalid');
  await rm(join(root, '.agents/skills'), { recursive: true }); await mkdir(join(root, '.agents/skills'));
  assert.ok((await inspectContent(root)).issues.some(x => x.code === 'EMPTY_TREE'));
});

test('missing, escaping and personal filesystem references are actionable errors', async t => {
  const { root, write } = await fixture(t);
  await write('.agents/skills/game-studio-test/SKILL.md', skill('game-studio-test') + '[Missing](references/missing.md)\n[Escape](../../../../outside.md)\n[Personal](/Users/example/note.md)\n`resource path studio/docs/missing.md --json`\n');
  const result = await inspectContent(root);
  assert.equal(result.status, 'invalid');
  assert.ok(result.issues.some(x => x.code === 'MISSING_RESOURCE' && x.message.includes('references/missing.md')));
  assert.equal(result.issues.filter(x => x.code === 'UNSAFE_RESOURCE').length, 2);
  assert.ok(result.issues.every(x => x.path === '.agents/skills/game-studio-test/SKILL.md'));
});

test('legacy runtime syntax in nested guidance cannot hide behind a valid entrypoint', async t => {
  const { root, write } = await fixture(t);
  await write('.agents/skills/game-studio-test/references/unused.md', 'Run .claude/scripts/old.sh\n');
  const result = await inspectContent(root);
  assert.ok(result.issues.some(x => x.code === 'LEGACY_RUNTIME' && x.path.endsWith('/unused.md')));
});

test('resource symlinks are refused without following a link outside the content root', async t => {
  const { root, write } = await fixture(t);
  const external = await mkdtemp(join(tmpdir(), 'studio-content-outside-'));
  t.after(() => rm(external, { recursive: true, force: true }));
  await write('.agents/skills/game-studio-test/SKILL.md', skill('game-studio-test') + '[Linked](references/linked/secret.md)\n');
  await mkdir(join(root, '.agents/skills/game-studio-test/references'));
  await symlink(external, join(root, '.agents/skills/game-studio-test/references/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await inspectContent(root);
  assert.ok(result.issues.some(x => x.code === 'UNSAFE_RESOURCE'));
  assert.ok(!result.checkedFiles.some(x => x.includes('secret')));
});

test('angle-bracket links and reference definitions resolve encoded names and report missing files', async t => {
  const { root, write } = await fixture(t);
  await write('.agents/skills/game-studio-test/SKILL.md', skill('game-studio-test') + '[Notes](<references/with space.md>)\n[More][details]\n[details]: references/with%20space.md "Notes"\n');
  await write('.agents/skills/game-studio-test/references/with space.md', '# Notes\n');
  assert.equal((await inspectContent(root)).status, 'valid');
  await rm(join(root, '.agents/skills/game-studio-test/references/with space.md'));
  assert.equal((await inspectContent(root)).issues.filter(x => x.code === 'MISSING_RESOURCE').length, 2);
});

test('maintainer command supports an explicit tree and returns distinct content and usage exits', async t => {
  const { root, write } = await fixture(t);
  const script = fileURLToPath(new URL('../scripts/lint-content.mjs', import.meta.url));
  const result = JSON.parse(execFileSync(process.execPath, [script, '--root', root, '--bundle-only'], { cwd: tmpdir(), encoding: 'utf8' }));
  assert.equal(result.status, 'valid'); assert.equal(result.behaviorVerified, false);
  assert.equal(result.catalog.status, 'not_assessed');
  await write('.codex/agents/game-studio-review.toml', 'invalid TOML');
  const bad = spawnSync(process.execPath, [script, '--root', root, '--bundle-only'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.ok(JSON.parse(bad.stdout).issues.some(x => x.code === 'INVALID_TOML'));
  assert.equal(spawnSync(process.execPath, [script, '--unknown'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [script, '--complete', '--bundle-only'], { encoding: 'utf8' }).status, 2);
});
