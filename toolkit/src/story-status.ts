import { readFile, readdir, realpath } from 'node:fs/promises';
import { safePath } from './files.js';

type StoryGroup = 'IN_REVIEW' | 'IN_PROGRESS' | 'TODO' | 'BLOCKED' | 'OTHER' | 'NO_STATUS' | 'COMPLETE';
interface StoryStatus { path: string; status: string | null; line: number | null; group: Exclude<StoryGroup, 'COMPLETE'> }
export interface StoryStatusResult {
  qualityAssessed: false;
  stories: StoryStatus[];
  counts: { complete: number; total: number };
}
const ranks = { IN_REVIEW: 0, IN_PROGRESS: 1, TODO: 2, BLOCKED: 3, OTHER: 4, NO_STATUS: 4 };
const byteOrder = (a: string, b: string) => Buffer.compare(Buffer.from(a), Buffer.from(b));

function group(status: string | null): StoryGroup {
  if (status === null) return 'NO_STATUS';
  // The retained parser uses ASCII words in LC_ALL=C; Unicode folding changes boundaries.
  const value = status.replace(/[A-Z]/g, letter => letter.toLowerCase());
  if (/^(complete|done)([^a-z]|$)/.test(value)) return 'COMPLETE';
  if (/^in review([^a-z]|$)/.test(value)) return 'IN_REVIEW';
  if (/^in progress([^a-z]|$)/.test(value)) return 'IN_PROGRESS';
  if (/^(ready|not started)([^a-z]|$)/.test(value)) return 'TODO';
  if (/^blocked([^a-z]|$)/.test(value)) return 'BLOCKED';
  return 'OTHER';
}

/** Retained story-status.sh observations, not a decision to implement or close a story. */
export async function readStoryStatus(input: string): Promise<StoryStatusResult> {
  const root = await realpath(input);
  const result: StoryStatusResult = { qualityAssessed: false, stories: [], counts: { complete: 0, total: 0 } };
  const container = await safePath(root, 'production/epics');
  let epics;
  try { epics = await readdir(container, { withFileTypes: true }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return result; throw error; }
  const paths: string[] = [];
  for (const epic of epics) {
    if (epic.name.startsWith('.')) continue;
    const path = `production/epics/${epic.name}`;
    const directory = await safePath(root, path); // Do not follow linked epic directories.
    if (!epic.isDirectory()) continue;
    for (const story of await readdir(directory, { withFileTypes: true })) {
      if (!/^story-.*\.md$/.test(story.name)) continue;
      await safePath(root, `${path}/${story.name}`);
      if (story.isFile()) paths.push(`${path}/${story.name}`);
    }
  }
  for (const path of paths.sort(byteOrder)) {
    const lines = (await readFile(await safePath(root, path), 'utf8')).split('\n');
    let status: string | null = null, line: number | null = null;
    for (const [index, original] of lines.entries()) {
      const text = original.replace(/\r$/, '').replace(/^[ \t]+/, '').replace(/^> /, '').replace(/^- /, '').replaceAll('*', '');
      if (!text.startsWith('Status:')) continue;
      status = text.slice(7).replace(/^[ \t]+|[ \t]+$/g, ''); line = index + 1; break;
    }
    result.counts.total++;
    const kind = group(status);
    if (kind === 'COMPLETE') result.counts.complete++;
    else result.stories.push({ path, status, line, group: kind });
  }
  // Stable sorting preserves byte/file order inside a group, including OTHER/NO_STATUS.
  result.stories.sort((a, b) => ranks[a.group] - ranks[b.group]);
  return result;
}

export function formatStoryStatus(result: StoryStatusResult): string {
  if (!result.counts.total) return 'STORIES      none\n';
  const lines = result.stories.map(row => `${row.group.padEnd(13)}${row.path}${['TODO', 'BLOCKED', 'OTHER'].includes(row.group) ? `  (${row.status})` : ''}`);
  lines.push(`COMPLETE     ${result.counts.complete} of ${result.counts.total}`);
  return `${lines.join('\n')}\n`;
}
