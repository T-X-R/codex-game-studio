import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-gdd-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, text) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); };
  await write('project.yaml', 'engine:\n  name: Web\n');
  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, 'check', '--kind', 'gdd', '--project', root, ...args, '--json'], { cwd: tmpdir(), encoding: 'utf8' });
    return { ...result, body: JSON.parse(result.stdout) };
  };
  return { root, write, run };
}

test('GDD observations preserve numbered headings, tabs, Detailed Design alias and placeholders without assigning completeness', async t => {
  const { root, write, run } = await fixture(t);
  const path = 'design/gdd/战斗 x=1.md';
  const text = ['# Combat', '##\t1. Overview', '[To be designed]', '### Notes', '',
    '## 2) Player Fantasy', 'A fragile hero.', '## 3 Detailed Design', '### Damage', 'Base damage is 10.',
    '## Formulas', '[To be designed]', '## Edge Cases', '', '## Dependencies', 'None.',
    '## Tuning Knobs', '[To be designed]', '## Acceptance Criteria', '- Damage is clamped.'].join('\r\n');
  await write(path, text);
  const result = run(path);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.body.data.qualityAssessed, false);
  assert.equal(result.body.data.scope, 'gdd-structure');
  const observation = result.body.data.files[0];
  assert.equal(observation.path, path);
  assert.deepEqual(observation.present, ['Overview', 'Player Fantasy', 'Detailed Rules', 'Formulas', 'Edge Cases', 'Dependencies', 'Tuning Knobs', 'Acceptance Criteria']);
  assert.deepEqual(observation.absent, []);
  assert.deepEqual(observation.placeholder, ['Overview', 'Formulas', 'Edge Cases', 'Tuning Knobs']);
  assert.equal(await readFile(join(root, path), 'utf8'), text);
});

test('GDD first matching section and same-or-higher heading boundaries match upstream observations', async t => {
  const { write, run } = await fixture(t);
  await write('design/gdd/combat.md', '# Overview\n##tPlayer Fantasy\n## Overview\n[To be designed]\n### Notes\n## Unrelated\nreal unrelated text\n## Overview\nsecond populated copy\n### Detailed Rules\n[To be designed]\n#### Details\nreal rules\n## FORMULAS\n[To be designed]\n# End\nnot formulas\n');
  const result = run();
  assert.equal(result.status, 0, result.stdout);
  assert.deepEqual(result.body.data.files[0], {
    path: 'design/gdd/combat.md', present: ['Overview', 'Detailed Rules', 'Formulas'],
    absent: ['Player Fantasy', 'Edge Cases', 'Dependencies', 'Tuning Knobs', 'Acceptance Criteria'],
    placeholder: ['Overview', 'Formulas'],
  });
});

test('default GDD scan excludes governance and review outputs but explicit file selection remains possible', async t => {
  const { write, run } = await fixture(t);
  for (const file of ['game-concept.md', 'systems-index.md', 'game-pillars.md', 'gdd-cross-review-1.md', 'gameplay-tags.md', 'fixture-swap-ledger.md', 'entity-registry.md', 'sound-bible.md', 'reviews/combat.md', 'notes.txt']) {
    await write(`design/gdd/${file}`, '## Overview\nNotes.\n');
  }
  let result = run();
  assert.equal(result.status, 3, result.stdout);
  assert.equal(result.body.status, 'not_assessed');
  assert.deepEqual(result.body.data.files, []);
  await write('design/gdd/z.md', 'No sections yet.');
  await write('design/gdd/a.md', '## Overview\nNotes.');
  result = run();
  assert.equal(result.status, 0);
  assert.deepEqual(result.body.data.files.map(x => x.path), ['design/gdd/a.md', 'design/gdd/z.md']);
  assert.equal(result.body.data.files[1].absent.length, 8);
  assert.equal(run('design/gdd/game-concept.md').status, 0);
});

test('empty and missing GDD inputs are unassessed, invalid paths cannot read outside the project', async t => {
  const { root, write, run } = await fixture(t);
  assert.equal(run().status, 3);
  assert.equal(run('design/gdd/missing.md').status, 3);
  await mkdir(join(root, 'folder'));
  assert.equal(run('folder').status, 2);
  assert.equal(run('../outside.md').status, 4);
  assert.equal(run('a.md', 'b.md').status, 2);
  await write('design/gdd/normal.md', '## Overview\nExample.');
  await symlink(join(root, 'design/gdd'), join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run('linked/normal.md').status, 4);
});
