import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectContent } from '../dist/content-tree.js';

const skill = '---\nname: game-studio-test\ndescription: Test a game.\n---\n';
async function fixture(t) {
  const temp = await mkdtemp(join(tmpdir(), 'studio-project-content-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const project = join(temp, 'game 测试'), bundle = join(temp, 'bundle');
  const write = async (root, path, text) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  for (const root of [project, bundle]) {
    await write(root, '.agents/skills/game-studio-test/SKILL.md', skill + 'Read the brief.\n');
    await write(root, '.codex/agents/game-studio-review.toml', 'name="game-studio-review"\ndescription="Review."\ndeveloper_instructions="Return findings."\n');
  }
  const inspect = () => inspectContent(project, { projectResources: bundle });
  return { project, bundle, write, inspect };
}

test('project content checks actual installed instructions and reports unrelated content without reading it', async t => {
  const { project, write, inspect } = await fixture(t);
  await write(project, '.agents/skills/personal/SKILL.md', 'not a toolkit Skill');
  await write(project, '.codex/agents/personal.toml', 'not toolkit TOML');
  let result = await inspect();
  assert.equal(result.status, 'valid', JSON.stringify(result.issues));
  assert.deepEqual(result.counts, { skills: 1, onboarding: 0, roles: 1 });
  assert.deepEqual(result.unassessedFiles.sort(), ['.agents/skills/personal', '.codex/agents/personal.toml']);
  await write(project, '.agents/skills/game-studio-test/SKILL.md', skill + '`game-studio nonexistent`\n');
  result = await inspect();
  assert.ok(result.issues.some(x => x.code === 'INVALID_COMMAND_EXAMPLE' && x.root === project));
  assert.equal(result.behaviorVerified, false);
});

test('literal resource calls use the bundle while Markdown links stay in their original filesystem root', async t => {
  const { project, bundle, write, inspect } = await fixture(t);
  await write(bundle, 'studio/docs/shared.md', '[More](nested.md)\n');
  await write(bundle, 'studio/docs/nested.md', '# Shared resource\n');
  await write(project, 'studio/docs/shared.md', 'This local shadow must not be read.\n');
  await write(project, '.agents/skills/game-studio-test/SKILL.md', skill + '`node .game-studio/run.cjs resource path studio/docs/shared.md --json`\n');
  let result = await inspect();
  assert.equal(result.status, 'valid', JSON.stringify(result.issues));
  assert.ok(result.checkedSources.some(x => x.root === bundle && x.path === 'studio/docs/nested.md'));
  assert.ok(!result.checkedSources.some(x => x.root === project && x.path === 'studio/docs/shared.md'));
  await write(project, '.agents/skills/game-studio-test/SKILL.md', skill + '[Local](../../../studio/docs/nested.md)\n');
  result = await inspect();
  assert.ok(result.issues.some(x => x.code === 'MISSING_RESOURCE' && x.root === project));
  await write(project, 'docs/game-guide.md', '# Actual game guide\n');
  await write(project, '.agents/skills/game-studio-test/SKILL.md', skill + '[Guide](../../../docs/game-guide.md)\n');
  assert.equal((await inspect()).status, 'valid');
  await write(project, '.agents/skills/game-studio-test/SKILL.md', skill + '[Escape](../../../../outside.md)\n');
  assert.ok((await inspect()).issues.some(x => x.code === 'UNSAFE_RESOURCE'));
});

test('removing a whole installed Skill or role cannot pass as a smaller valid collection', async t => {
  const { project, inspect } = await fixture(t);
  await rm(join(project, '.agents/skills/game-studio-test'), { recursive: true });
  await rm(join(project, '.codex/agents/game-studio-review.toml'));
  const result = await inspect();
  assert.equal(result.status, 'invalid');
  assert.equal(result.issues.filter(x => x.code === 'MISSING_ENTRYPOINT').length, 2);
});

test('an empty or missing package baseline cannot certify installed project content', async t => {
  const { bundle, inspect } = await fixture(t);
  await rm(join(bundle, '.agents/skills/game-studio-test'), { recursive: true });
  await rm(join(bundle, '.codex/agents'), { recursive: true });
  const result = await inspect();
  assert.equal(result.status, 'invalid');
  for (const code of ['EMPTY_BUNDLE_TREE', 'MISSING_BUNDLE_TREE']) assert.ok(result.issues.some(x => x.code === code && x.root === bundle), code);
});

test('CLI content check is read-only, reports real defects with exit five, and preserves prototype checks', async t => {
  const root = await mkdtemp(join(tmpdir(), 'studio-content-cli-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const prefix of ['.agents/skills', '.codex/agents']) await cp(new URL(`../resources/${prefix}`, import.meta.url), join(root, prefix), { recursive: true });
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Web\n');
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [cli, 'check', ...args, '--project', root, '--json'], { cwd: tmpdir(), encoding: 'utf8' });
  let result = run('--kind', 'content');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(JSON.parse(result.stdout).data.behaviorVerified, false);
  const path = join(root, '.agents/skills/game-studio-start/SKILL.md');
  const changed = await readFile(path, 'utf8') + '\n`game-studio invalid-command`\n';
  await writeFile(path, changed); result = run('--kind', 'content');
  assert.equal(result.status, 5); assert.equal(JSON.parse(result.stdout).error.code, 'CHECK_FAILED');
  assert.equal(await readFile(path, 'utf8'), changed);
  for (const args of [[], ['--kind', 'unknown'], ['ignored-path', '--kind', 'content']]) assert.equal(run(...args).status, 2);
  await mkdir(join(root, 'demo')); await writeFile(join(root, 'demo/index.html'), '<script>const valid = 1;</script>');
  assert.equal(run('demo').status, 0); assert.equal(run('demo', '--kind', 'prototype').status, 0);
});
