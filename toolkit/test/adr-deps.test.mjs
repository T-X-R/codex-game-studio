import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const adr = deps => `# Decision\r\n## ADR Dependencies\r\n| Relation | ADR |\r\n| **Depends On** | ${deps} |\r\n## Notes\r\n| **Depends On** | ADR-9999 |\r\n`;
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-adr-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, text) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  await write('project.yaml', 'engine:\n  name: Web\n');
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, 'check', '--kind', 'adr-deps', '--project', root, ...args, '--json'], { cwd: tmpdir(), encoding: 'utf8' });
    return { ...result, body: JSON.parse(result.stdout) };
  };
  return { root, write, run };
}

test('ADR graph normalizes references, deduplicates edges and orders dependencies by layer', async t => {
  const { root, write, run } = await fixture(t);
  await write('docs/architecture/adr-0001 base.md', adr('None'));
  await write('docs/architecture/adr-0002-战斗.md', adr('ADR-0001, adr-0001'));
  await write('docs/architecture/adr-0003.md', adr('ADR-0001'));
  await write('docs/architecture/adr-0004.md', adr('ADR-0003 and ADR-0002'));
  const result = run();
  assert.equal(result.status, 0, result.stdout);
  const data = result.body.data;
  assert.equal(data.qualityAssessed, false);
  assert.equal(data.files.length, 4);
  assert.deepEqual(data.order, ['adr-0001', 'adr-0002', 'adr-0003', 'adr-0004']);
  assert.deepEqual(data.edges, [
    { from: 'adr-0002', to: 'adr-0001' }, { from: 'adr-0003', to: 'adr-0001' },
    { from: 'adr-0004', to: 'adr-0002' }, { from: 'adr-0004', to: 'adr-0003' },
  ]);
  assert.deepEqual(data.cycles, []);
  assert.equal(await readFile(join(root, 'docs/architecture/adr-0002-战斗.md'), 'utf8'), adr('ADR-0001, adr-0001'));
});

test('ADR cycles distinguish cycle members from transitive dependents and independent work', async t => {
  const { write, run } = await fixture(t);
  for (const [id, deps] of [['01', 'ADR-02'], ['02', 'ADR-01, ADR-06'], ['03', 'ADR-01'], ['04', 'ADR-03'], ['05', 'None'], ['06', 'ADR-07'], ['07', 'ADR-06']]) {
    await write(`docs/architecture/adr-${id}.md`, adr(deps));
  }
  const result = run();
  assert.equal(result.status, 0);
  assert.deepEqual(result.body.data.cycles, [
    { id: 'adr-01', dependencies: ['adr-02'] }, { id: 'adr-02', dependencies: ['adr-01'] },
    { id: 'adr-06', dependencies: ['adr-07'] }, { id: 'adr-07', dependencies: ['adr-06'] },
  ]);
  assert.deepEqual(result.body.data.blockedByCycle, ['adr-03', 'adr-04']);
  assert.deepEqual(result.body.data.order, ['adr-05']);
});

test('unknown dependency declarations and nonexistent targets remain visible beside tentative ordering', async t => {
  const { write, run } = await fixture(t);
  await write('docs/architecture/adr-001.md', '# ADR\nNo dependency section.');
  await write('docs/architecture/adr-002.md', adr('[List dependencies]'));
  await write('docs/architecture/adr-003.md', adr('ADR-999'));
  await write('docs/architecture/adr-004.md', adr('ADR-004'));
  await write('docs/architecture/adr-005.md', '## ADR Dependencies\nNo row yet.');
  const data = run().body.data;
  assert.deepEqual(data.noDepsSection, ['adr-001', 'adr-005']);
  assert.deepEqual(data.unfilledDeps, ['adr-002']);
  assert.deepEqual(data.missingDependencies, ['adr-999']);
  assert.deepEqual(data.ignoredSelfReferences, ['adr-004']);
  assert.deepEqual(data.order, ['adr-001', 'adr-002', 'adr-004', 'adr-005', 'adr-999', 'adr-003']);
});

test('explicit ADR directory is shallow and identities come from filenames, with ambiguous IDs reported', async t => {
  const { write, run } = await fixture(t);
  await write('adr-999 archive/adr-01-a.md', adr('None'));
  await write('adr-999 archive/adr-01-b.md', adr('ADR-02'));
  await write('adr-999 archive/adr-02.md', adr('None'));
  await write('adr-999 archive/adr-overview.md', adr('ADR-10'));
  await write('adr-999 archive/nested/adr-03.md', adr('None'));
  const result = run('adr-999 archive');
  assert.equal(result.status, 0);
  assert.deepEqual(result.body.data.duplicateIds, ['adr-01']);
  assert.deepEqual(result.body.data.invalidFiles, ['adr-999 archive/adr-overview.md']);
  assert.deepEqual(result.body.data.order, ['adr-02', 'adr-01']);
  assert.equal(result.body.data.files.length, 4);
});

test('ADR missing inputs are not assessed and unsafe directories are blocked', async t => {
  const { root, write, run } = await fixture(t);
  assert.equal(run().status, 3);
  assert.equal(run('missing').status, 3);
  assert.equal(run('../outside').status, 4);
  await write('file.md', 'No directory');
  assert.equal(run('file.md').status, 2);
  await mkdir(join(root, 'docs/architecture'), { recursive: true });
  await symlink(join(root, 'docs/architecture'), join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run('linked').status, 4);
});
