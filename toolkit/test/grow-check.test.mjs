import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectGrowth } from '../dist/grow-check.js';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
async function fixture(t, config = '{}\n') {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio grow 检查 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), config);
  await mkdir(join(root, 'prototypes/demo'), { recursive: true });
  await writeFile(join(root, 'prototypes/demo/index.html'), '<canvas></canvas>');
  return root;
}
function git(root, ...args) {
  return execFileSync('git', ['-c', 'core.hooksPath=', '-c', 'commit.gpgsign=false', '-C', root, ...args], { encoding: 'utf8' });
}
function repository(root) {
  git(root, 'init', '--quiet'); git(root, 'add', '.');
  git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture');
}
const check = (report, id) => report.checks.find(row => row.id === id);

test('growth inspection is read-only and distinguishes a no-Git backup from verification', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'src/nested'), { recursive: true });
  await writeFile(join(root, 'src/AGENTS.md'), 'Keep these instructions.');
  await writeFile(join(root, 'src/nested/.gitkeep'), '');
  const before = await readdir(root, { recursive: true });
  const report = await inspectGrowth(root, 'demo');
  assert.equal(report.exitCode, 0); assert.equal(report.eligible, true);
  assert.equal(report.git.state, 'none');
  assert.ok(report.warnings.some(row => row.includes('backup')));
  assert.ok(report.warnings.some(row => row.includes('config.js')));
  assert.equal(report.verification.state, 'not_assessed');
  assert.deepEqual(await readdir(root, { recursive: true }), before);
  assert.equal(await readFile(join(root, 'src/AGENTS.md'), 'utf8'), 'Keep these instructions.');
});

test('engine, configured paths and existing game files block growth without rewriting them', async t => {
  for (const config of ['engine:\n  name: Godot\n', 'engine:\n  name: Typo\n', 'engine:\n  name: false\n',
    'engine:\n  name: Web\n  code_root: game\n', 'engine:\n  name: Web\n  code_root: false\n', 'engine: Web\n', 'engine: []\n']) {
    const root = await fixture(t, config);
    const report = await inspectGrowth(root, 'demo');
    assert.equal(report.exitCode, 4); assert.equal(report.eligible, false);
    assert.equal(await readFile(join(root, 'project.yaml'), 'utf8'), config);
  }
  for (const path of ['package.json', 'index.html', 'tsconfig.json', 'pnpm-lock.yaml', 'src/game.ts', 'src/nested/README.md']) {
    const root = await fixture(t, 'engine:\n  name: Web\n  code_root: ./src/\n');
    if (path.includes('/')) await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), 'existing user content');
    const report = await inspectGrowth(root, 'demo');
    assert.equal(check(report, 'root').status, 'blocked', path);
    assert.ok(check(report, 'root').paths.includes(path), path);
    assert.equal(await readFile(join(root, path), 'utf8'), 'existing user content');
  }
});

test('real Git reports staged and untracked source changes but separates debrief and evidence', async t => {
  const root = await fixture(t); repository(root);
  await mkdir(join(root, 'design'));
  await writeFile(join(root, 'design/game-brief.md'), 'Keep / Avoid / Out of scope');
  await writeFile(join(root, 'prototypes/demo/brief.md'), 'Player feedback');
  await mkdir(join(root, 'prototypes/demo/evidence'));
  await writeFile(join(root, 'prototypes/demo/evidence/log.txt'), 'capture');
  let report = await inspectGrowth(root, 'demo');
  assert.equal(report.exitCode, 0);
  assert.deepEqual(report.git.dirtyBriefs, ['design/game-brief.md', 'prototypes/demo/brief.md']);
  assert.match(report.git.sourceCommit, /^[a-f0-9]{40}$/);
  await writeFile(join(root, 'prototypes/demo/雨 game.js'), 'user code');
  report = await inspectGrowth(root, 'demo');
  assert.equal(report.exitCode, 4);
  assert.deepEqual(check(report, 'clean').paths, ['prototypes/demo/雨 game.js']);
  git(root, 'add', '--', 'prototypes/demo/雨 game.js');
  assert.equal((await inspectGrowth(root, 'demo')).exitCode, 4);
  assert.equal(git(root, 'log', '--format=%s').trim(), 'fixture');
});

test('rename records retain both paths and grown tags prevent a second growth', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'prototypes/demo/code.js'), 'game');
  repository(root);
  git(root, 'mv', 'prototypes/demo/code.js', 'prototypes/demo/brief.md');
  const report = await inspectGrowth(root, 'demo');
  assert.equal(report.exitCode, 4);
  assert.ok(check(report, 'clean').paths.includes('prototypes/demo/code.js'));
  git(root, 'tag', 'grown/other');
  assert.equal(check(await inspectGrowth(root, 'demo'), 'root').status, 'blocked');
});

test('unsafe names, missing entry pages and linked code roots cannot be declared eligible', async t => {
  const root = await fixture(t);
  await assert.rejects(inspectGrowth(root, '../escape'), { code: 'INVALID_ARGUMENT' });
  assert.equal(check(await inspectGrowth(root, 'missing'), 'prototype').status, 'blocked');
  await mkdir(join(root, 'prototypes/demo-vertical-slice'));
  await writeFile(join(root, 'prototypes/demo-vertical-slice/index.html'), '<canvas></canvas>');
  assert.equal(check(await inspectGrowth(root, 'demo-vertical-slice'), 'prototype').status, 'blocked');
  await symlink(join(root, 'prototypes/demo'), join(root, 'src'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(inspectGrowth(root, 'demo'), { code: 'UNSAFE_PATH' });
});

test('unborn repositories and ignored game code cannot masquerade as a clean committed prototype', async t => {
  const root = await fixture(t);
  git(root, 'init', '--quiet');
  let report = await inspectGrowth(root, 'demo');
  assert.equal(report.git.state, 'available'); assert.equal(report.git.sourceCommit, null);
  assert.equal(check(report, 'clean').status, 'blocked');
  git(root, 'add', '.');
  git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture');
  await writeFile(join(root, '.gitignore'), '*.js\n');
  await writeFile(join(root, 'prototypes/demo/ignored.js'), 'uncommitted code');
  report = await inspectGrowth(root, 'demo');
  assert.equal(check(report, 'clean').status, 'blocked');
  assert.ok(check(report, 'clean').paths.includes('prototypes/demo/ignored.js'));
});

test('a broken Git marker reports not assessed instead of silently disabling the clean guard', async t => {
  const root = await fixture(t);
  await writeFile(join(root, '.git'), 'gitdir: missing-metadata\n');
  const report = await inspectGrowth(root, 'demo');
  assert.equal(report.exitCode, 3); assert.equal(report.eligible, false);
  assert.equal(report.git.state, 'not_assessed');
  assert.equal(check(report, 'git').status, 'not_assessed');
});

test('CLI emits machine-readable eligibility and a nonzero conflict exit for existing games', async t => {
  const root = await fixture(t);
  const run = () => spawnSync(process.execPath, [cli, 'prototype', 'grow-check', 'demo', '--project', root, '--json'], { encoding: 'utf8' });
  let result = run(); assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).data.eligible, true);
  await writeFile(join(root, 'package.json'), '{}');
  result = run(); assert.equal(result.status, 4, result.stdout);
  assert.equal(JSON.parse(result.stdout).status, 'blocked');
  assert.equal(JSON.parse(result.stdout).data.eligible, false);
});
