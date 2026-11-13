import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const step = (data, group, id) => data.groups.find(x => x.id === group).steps.find(x => x.id === id);
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-artifacts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, text) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  await write('project.yaml', 'engine:\n  name: Web\n');
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, 'check', '--kind', 'artifacts', '--project', root, ...args, '--json'], { cwd: tmpdir(), encoding: 'utf8' });
    return { ...result, body: JSON.parse(result.stdout) };
  };
  return { root, write, run };
}

test('artifact scan uses the packaged catalog and reports full phase denominators without inventing verdicts', async t => {
  const { write, run } = await fixture(t);
  await write('studio/docs/workflow-catalog.yaml', 'phases: {}');
  const result = run();
  assert.equal(result.status, 0, result.stdout);
  const data = result.body.data;
  assert.equal(data.scope, 'workflow-artifacts');
  assert.equal(data.qualityAssessed, false);
  assert.equal(data.selection, 'phases');
  assert.equal(data.counts.groups, 7);
  assert.equal(data.counts.steps, 49);
  assert.ok(data.counts.noCheck > 0);
  assert.equal(step(data, 'concept', 'game-concept').status, 'ABSENT');
  assert.equal(step(data, 'concept', 'engine-setup').status, 'PRESENT');
  assert.equal(step(data, 'concept', 'engine-setup').command, '$game-studio-setup-engine');
  assert.equal(step(data, 'production', 'implement').status, 'NO_CHECK');
  assert.match(step(data, 'production', 'implement').details.note, /In Progress/);
});

test('minimal path scans only its five steps and engine alternatives handle quotes, real tabs and placeholders', async t => {
  const { root, write, run } = await fixture(t);
  await write('project.yaml', 'engine:\n  name:\t"Godot"\n');
  const inspect = () => run('--path', 'minimal');
  let result = inspect();
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.body.data.selection, 'paths');
  assert.deepEqual(result.body.data.counts, { groups: 1, steps: 5, noCheck: 2, unknown: 0 });
  assert.equal(step(result.body.data, 'minimal', 'engine-setup').status, 'PRESENT');
  await write('project.yaml', 'engine: {}\n');
  await write('docs/technical-preferences.md', '- **Engine**: [TO BE CONFIGURED]\n');
  assert.equal(step(inspect().body.data, 'minimal', 'engine-setup').status, 'ABSENT');
  const preference = '- **Engine**: Godot 4.7\n';
  await write('docs/technical-preferences.md', preference);
  const engine = step(inspect().body.data, 'minimal', 'engine-setup');
  assert.equal(engine.status, 'PRESENT');
  assert.equal(engine.details.alternative, 2);
  assert.equal(await readFile(join(root, 'docs/technical-preferences.md'), 'utf8'), preference);
});

test('artifact counts distinguish absent, short and present files, ignoring matching directory names', async t => {
  const { root, write, run } = await fixture(t);
  const inspect = () => step(run('--phase', 'technical-setup').body.data, 'technical-setup', 'architecture-decision');
  assert.equal(inspect().status, 'ABSENT');
  await write('docs/architecture/adr-0001 战斗.md', '# ADR');
  await mkdir(join(root, 'docs/architecture/adr-directory.md'));
  assert.equal(inspect().status, 'SHORT');
  assert.equal(inspect().details.count, 1);
  await write('docs/architecture/adr-0002.md', '# ADR');
  await write('docs/architecture/adr-0003.md', '# ADR');
  assert.equal(inspect().status, 'PRESENT');
  assert.equal(inspect().details.minimum, 3);
});

test('concept and vertical-slice reports cannot accidentally satisfy each other', async t => {
  const { write, run } = await fixture(t);
  await write('prototypes/game-vertical-slice/REPORT.md', '# Vertical Slice Report:\n');
  let data = run('--phase', 'pre-production').body.data;
  assert.equal(step(data, 'pre-production', 'prototype').status, 'ABSENT');
  assert.equal(step(data, 'pre-production', 'vertical-slice').status, 'PRESENT');
  await write('prototypes/浏览器 game/REPORT.md', '# Concept Prototype Report: combat\n');
  data = run('--phase', 'pre-production').body.data;
  assert.equal(step(data, 'pre-production', 'prototype').status, 'PRESENT');
  assert.equal(step(data, 'pre-production', 'prototype').details.alternative, 2);
});

test('artifact selectors reject conflicts and unknown groups; symlink matches cannot escape the workspace', async t => {
  const { root, write, run } = await fixture(t);
  for (const args of [['--phase', 'unknown'], ['--path', 'unknown'], ['--phase', 'concept', '--path', 'minimal'], ['unexpected'], ['--phase', '']]) {
    assert.equal(run(...args).status, 2, JSON.stringify(args));
  }
  await write('outside/story-001.md', 'Do not read through a symlink.');
  await mkdir(join(root, 'production/epics'), { recursive: true });
  await symlink(join(root, 'outside'), join(root, 'production/epics/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run('--path', 'minimal').status, 4);
  const invalid = spawnSync(process.execPath, [cli, 'check', '--kind', 'gdd', '--phase', 'concept', '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(invalid.status, 2);
});

test('artifact pattern misses and thresholds count only matching files and preserve NO_CHECK notes', async t => {
  const { root, write } = await fixture(t);
  const { inspectArtifacts } = await import('../dist/artifact-check.js');
  const catalog = join(root, 'catalog.yaml');
  await write('catalog.yaml', 'phases:\n  test:\n    steps:\n      - id: report\n        required: true\n        artifact:\n          glob: "reports/*.md"\n          pattern: "^Ready:[[:space:]]+yes$"\n          min_count: 2\n      - id: human\n        artifact:\n          note: "Ask the player"\npaths: {}\n');
  const inspect = () => inspectArtifacts(root, {}, catalog);
  await write('reports/a.md', 'Ready:\nyes\n');
  assert.equal(step(await inspect(), 'test', 'report').status, 'PATTERN_MISS');
  await write('reports/a.md', 'Ready:\tyes\n');
  assert.equal(step(await inspect(), 'test', 'report').status, 'SHORT');
  await write('reports/b.md', 'Ready: yes\r\n');
  assert.equal(step(await inspect(), 'test', 'report').status, 'SHORT'); // grep -E keeps CR before the end anchor.
  await write('reports/b.md', 'Ready: yes\n');
  assert.equal(step(await inspect(), 'test', 'report').status, 'PRESENT');
  assert.equal(step(await inspect(), 'test', 'human').details.note, 'Ask the player');
});

test('broken or empty catalogs cannot produce a zero-step successful scan', async t => {
  const { root, write } = await fixture(t);
  const { inspectArtifacts } = await import('../dist/artifact-check.js');
  const prefix = 'phases:\n  test:\n    steps:\n      - id: report\n        artifact:\n';
  for (const text of ['phases: {}\npaths: {}\n', 'phases: [', 'phases: {}\nphases: {}\n',
    prefix + '          glob: "../outside/*"\n', prefix + '          glob: "reports/*.md"\n          min_count: 0\n',
    prefix + '          glob: "reports/*.md"\n          pattern: "["\n']) {
    await write('catalog.yaml', text);
    await assert.rejects(inspectArtifacts(root, {}, join(root, 'catalog.yaml')), error => error.code === 'INVALID_CATALOG' && error.exitCode === 3);
  }
});
