import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { readStoryStatus, formatStoryStatus } from '../dist/story-status.js';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-story-status-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, content) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), content); };
  return { root, write };
}

test('story route prioritizes review, progress and ready groups before blocked or unknown work', async t => {
  const { root, write } = await fixture(t);
  const rows = [['01', 'Ready'], ['02', 'In Progress'], ['03', 'In Review'], ['04', 'Blocked: needs input'],
    ['05', 'Draft'], ['06', null], ['07', 'Done.'], ['08', 'COMPLETE'], ['10', 'Not Started'], ['2', 'Ready']];
  for (const [id, value] of rows) await write(`production/epics/game/story-${id}.md`, value === null ? '# Untagged\n' : `Status: ${value}\n`);
  const result = await readStoryStatus(root);
  assert.equal(result.qualityAssessed, false);
  assert.deepEqual(result.counts, { complete: 2, total: 10 });
  assert.deepEqual(result.stories.map(row => row.path.split('/').at(-1)), ['story-03.md', 'story-02.md', 'story-01.md', 'story-10.md', 'story-2.md', 'story-04.md', 'story-05.md', 'story-06.md']);
  assert.deepEqual(result.stories.map(row => row.group), ['IN_REVIEW', 'IN_PROGRESS', 'TODO', 'TODO', 'TODO', 'BLOCKED', 'OTHER', 'NO_STATUS']);
  assert.equal(formatStoryStatus(result), 'IN_REVIEW    production/epics/game/story-03.md\nIN_PROGRESS  production/epics/game/story-02.md\nTODO         production/epics/game/story-01.md  (Ready)\nTODO         production/epics/game/story-10.md  (Not Started)\nTODO         production/epics/game/story-2.md  (Ready)\nBLOCKED      production/epics/game/story-04.md  (Blocked: needs input)\nOTHER        production/epics/game/story-05.md  (Draft)\nNO_STATUS    production/epics/game/story-06.md\nCOMPLETE     2 of 10\n');
});

test('story statuses retain first-header, Markdown, CRLF and leading-word semantics', async t => {
  const { root, write } = await fixture(t);
  const variants = [
    ['**Status:** Ready', 'Ready', 'TODO'], ['> **Status**: In Review (QA)', 'In Review (QA)', 'IN_REVIEW'],
    ['- **Status**: In Progress', 'In Progress', 'IN_PROGRESS'], ['  > - **Status**: blocked.', 'blocked.', 'BLOCKED'],
    ['Status: Not Done', 'Not Done', 'OTHER'], ['Status: Completed', 'Completed', 'OTHER'],
    ['Status: Readying', 'Readying', 'OTHER'], ['Status: In Reviewer', 'In Reviewer', 'OTHER'],
    ['status: Ready', null, 'NO_STATUS'], ['Status:   ', '', 'OTHER'],
  ];
  for (const [index, [header, status, group]] of variants.entries()) {
    const path = `production/epics/a/story-${index}.md`;
    const content = `# Story\r\n${header}\r\n${status === null ? '' : 'Status: Done\r\n'}`;
    await write(path, content);
    const row = (await readStoryStatus(root)).stories.find(row => row.path === path);
    assert.deepEqual({ status: row.status, group: row.group, line: row.line }, { status, group, line: status === null ? null : 2 });
    assert.equal(await readFile(join(root, path), 'utf8'), content);
  }
  assert.deepEqual((await readStoryStatus(root)).stories.filter(row => ['OTHER', 'NO_STATUS'].includes(row.group))
    .map(row => row.path.split('/').at(-1)), ['story-4.md', 'story-5.md', 'story-6.md', 'story-7.md', 'story-8.md', 'story-9.md']);
});

test('discovery matches the retained one-epic-level glob and distinguishes no stories from all complete', async t => {
  const { root, write } = await fixture(t);
  assert.equal(formatStoryStatus(await readStoryStatus(root)), 'STORIES      none\n');
  for (const path of ['production/epics/story-root.md', 'production/epics/.hidden/story-1.md', 'production/epics/a/nested/story-2.md', 'production/epics/a/EPIC.md']) await write(path, 'Status: Ready\n');
  assert.equal(formatStoryStatus(await readStoryStatus(root)), 'STORIES      none\n');
  await write('production/epics/a/story-1.md', 'Status: done!\n');
  const result = await readStoryStatus(root);
  assert.deepEqual(result.stories, []); assert.deepEqual(result.counts, { complete: 1, total: 1 });
  assert.equal(formatStoryStatus(result), 'COMPLETE     1 of 1\n');
});

test('status word boundaries use the retained C-locale ASCII case folding', async t => {
  const { root, write } = await fixture(t);
  await write('production/epics/a/story-1.md', 'Status: DONEK\n');
  await write('production/epics/a/story-2.md', 'Status: Doneİ\n');
  await write('production/epics/a/story-3.md', 'Status: READYK\n');
  const result = await readStoryStatus(root);
  assert.deepEqual(result.counts, { complete: 2, total: 3 });
  assert.deepEqual(result.stories.map(({ status, group }) => ({ status, group })), [{ status: 'READYK', group: 'TODO' }]);
});

test('unsafe or non-directory story containers fail explicitly instead of reporting no work', async t => {
  const { root, write } = await fixture(t);
  await write('outside/story-1.md', 'Status: Ready\n');
  await mkdir(join(root, 'production/epics'), { recursive: true });
  await symlink(join(root, 'outside'), join(root, 'production/epics/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readStoryStatus(root), error => error.code === 'UNSAFE_PATH');
  await rm(join(root, 'production/epics'), { recursive: true });
  await write('production/epics', 'not a directory');
  await assert.rejects(readStoryStatus(root), error => error.code === 'ENOTDIR');
});
