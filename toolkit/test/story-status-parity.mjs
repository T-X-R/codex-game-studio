// Opt-in retained Bash-source comparison; not a cross-platform Bash availability claim.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { readStoryStatus, formatStoryStatus } from '../dist/story-status.js';

const source = await readFile(new URL('../../.claude/scripts/story-status.sh', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-story-parity-')));
const words = ['Complete', 'COMPLETE.', 'done!', 'Not Done', 'Completed', 'Ready', 'Readying', 'Not Started (later)',
  'In Review', 'In Reviewer', 'In Progress — partial', 'Blocked: asset', 'Draft', '', 'DoneK', 'Doneİ', 'READYK'];
const cases = {
  empty: {},
  complete: { 'a/story-01.md': 'Status: Complete\n', 'a/story-02.md': '**Status:** DONE.\n' },
  priority: { 'a/story-01.md': 'Status: Ready\n', 'a/story-10.md': 'Status: In Progress\n', 'a/story-2.md': 'Status: In Review\n',
    'a/story-03.md': '# Missing\n', 'a/story-04.md': 'Status: Draft\n', 'a/story-05.md': 'Status: Blocked\n',
    'a/story-回合.md': 'Status: Ready\n', 'a/story-06.md': 'Status: Done\n' },
  headers: { 'a/story-01.md': '> **Status**: In Review\r\nStatus: Done\r\n',
    'a/story-02.md': '- **Status**: In Progress\n', 'a/story-03.md': '  > - **Status:** Ready \n',
    'a/story-04.md': 'status: Complete\n', 'a/story-05.md': 'Status: \nStatus: Done\n' },
  boundaries: Object.fromEntries(words.map((word, index) => [`a/story-${String(index).padStart(2, '0')}.md`, `Status: ${word}\n`])),
  discovery: { '.hidden/story-01.md': 'Status: Ready\n', 'story-root.md': 'Status: Ready\n',
    'a/nested/story-01.md': 'Status: Ready\n', 'a/EPIC.md': 'Status: Done\n', 'a/story-01.md': 'Status: Not Started\n' },
};
const results = [];
for (const [name, files] of Object.entries(cases)) {
  const root = join(directory, name);
  const original = join(root, '.claude/scripts/story-status.sh');
  await mkdir(dirname(original), { recursive: true }); await writeFile(original, source);
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, 'production/epics', path);
    await mkdir(dirname(target), { recursive: true }); await writeFile(target, content);
  }
  const baseline = spawnSync('bash', [original], { cwd: tmpdir(), encoding: 'utf8', env: { ...process.env, LC_ALL: 'C' } });
  assert.equal(baseline.status, 0, baseline.error?.message ?? baseline.stderr);
  const observed = await readStoryStatus(root);
  const actual = formatStoryStatus(observed);
  await writeFile(join(root, 'source.txt'), baseline.stdout);
  await writeFile(join(root, 'codex.txt'), actual);
  assert.equal(actual, baseline.stdout, `${name}: observations differ`);
  for (const [path, content] of Object.entries(files)) assert.equal(await readFile(join(root, 'production/epics', path), 'utf8'), content);
  results.push({ name, status: 'PASS', files: Object.keys(files).length, outputSha256: digest(actual), counts: observed.counts });
}
await writeFile(join(directory, 'parity.json'), JSON.stringify({ source: '.claude/scripts/story-status.sh',
  sourceSha256: digest(source), node: process.version, platform: process.platform, locale: 'C', results }, null, 2));
console.log(JSON.stringify({ directory, comparisons: results.length, status: 'PASS', scope: 'Named fixtures, exact text observations and unchanged input bytes; not workflow acceptance.' }));
