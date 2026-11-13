import { lstat, readdir } from 'node:fs/promises';
import { StudioError } from './contract.js';
import { readText, safePath } from './files.js';

const sections = ['Overview', 'Player Fantasy', 'Detailed Rules', 'Formulas', 'Edge Cases',
  'Dependencies', 'Tuning Knobs', 'Acceptance Criteria'];
const governance = new Set(['game-concept.md', 'systems-index.md', 'game-pillars.md', 'gameplay-tags.md',
  'fixture-swap-ledger.md', 'entity-registry.md', 'sound-bible.md']);

// Preserve the upstream heading-prefix and first-match rules. These are text
// observations, not Markdown validation or a judgment of design completeness.
function observe(path: string, text: string) {
  const lines = text.split(/\r?\n/);
  const present: string[] = [], absent: string[] = [], placeholder: string[] = [];
  for (const name of sections) {
    const pattern = name === 'Detailed Rules' ? 'Detailed (Rules|Design)' : name;
    const heading = new RegExp(`^##+[\\t ]+([0-9]+[.)]?[\\t ]*)?${pattern}`, 'i');
    const index = lines.findIndex(line => heading.test(line));
    if (index < 0) { absent.push(name); continue; }
    present.push(name);
    const level = lines[index]!.match(/^#+/)![0].length;
    let held = true;
    for (const line of lines.slice(index + 1)) {
      const next = line.match(/^(#+)[\t ]/);
      if (next) {
        if (next[1]!.length <= level) break;
        continue;
      }
      const body = line.replace(/^[\t ]+|[\t ]+$/g, '');
      if (body && body !== '[To be designed]') { held = false; break; }
    }
    if (held) placeholder.push(name);
  }
  return { path, present, absent, placeholder };
}

export async function inspectGdd(root: string, selected?: string) {
  let paths: string[];
  if (selected !== undefined) paths = [selected];
  else {
    const directory = await safePath(root, 'design/gdd');
    try {
      paths = (await readdir(directory, { withFileTypes: true }))
        .filter(entry => (entry.isFile() || entry.isSymbolicLink()) && entry.name.endsWith('.md') &&
          !governance.has(entry.name) && !/^gdd-cross-review-.*\.md$/.test(entry.name))
        .map(entry => `design/gdd/${entry.name}`).sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      paths = [];
    }
  }
  const files = [];
  for (const path of paths) {
    const absolute = await safePath(root, path);
    try {
      if (!(await lstat(absolute)).isFile()) throw new StudioError('INVALID_ARGUMENT', `GDD input must be a regular file: ${path}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const text = await readText(absolute);
    if (text === null) throw new StudioError('ASSESSMENT_INCOMPLETE', `GDD file not found: ${path}`, 3);
    files.push(observe(path, text));
  }
  return { project: root, scope: 'gdd-structure', qualityAssessed: false, files,
    reason: files.length ? null : 'No system GDDs found in design/gdd/.' };
}
