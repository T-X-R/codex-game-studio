import { readFile, realpath, stat } from 'node:fs/promises';
import { safePath } from './files.js';
import { StudioError } from './contract.js';

type Heading = { level: number; first: number; last: number; title: string };
type Section = { status: 'COMPLETE' | 'EMPTY' | 'PLACEHOLDER' | 'NOT_FOUND'; first: number | null; last: number | null; title: string };
export interface MdSectionObservation {
  status: 'observed'; qualityAssessed: false; command: 'list' | 'status' | 'extract'; path: string;
  headings?: Heading[]; sections?: Section[]; content?: string;
  counts?: { sections: number; complete: number; empty: number; placeholder: number; not_found: number };
}
const trim = (s: string): string => s.replace(/^[ \t]+|[ \t]+$/g, '');
function normalize(s: string): string {
  s = s.replace(/<!--[\s\S]*?(?:-->|$)/g, ' ').replace(/\*+/g, '');
  s = (` ${s} `).replace(/[ \t]_+/g, ' ').replace(/_+[ \t]/g, ' ');
  return trim(s).replace(/[A-Z]/g, c => c.toLowerCase()).replace(/[ \t]+/g, ' ').replace(/^[0-9]+[.)]? /, '');
}
/** Narrow retained md-section parser, not a Markdown renderer. Its status is an observation. */
function parse(content: string) {
  const lines = content.split('\n'); if (lines.at(-1) === '') lines.pop();
  const headings: Heading[] = [], text: boolean[] = [], marker: boolean[] = [];
  let fence = '', comment = false;
  for (const [index, raw] of lines.entries()) {
    const line = raw.replace(/\r$/, ''); text[index] = false; marker[index] = false;
    if (fence) {
      const close = line.match(/^ {0,3}(`+|~+)([ \t]*)$/);
      if (close && close[1]![0] === fence[0] && close[1]!.length >= fence.length) fence = '';
      continue;
    }
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (opening) { fence = opening[1]!; text[index] = true; continue; }
    const startedInComment = comment;
    let rest = '', cursor = 0;
    while (cursor < line.length) {
      if (comment) {
        const end = line.indexOf('-->', cursor); if (end < 0) break;
        cursor = end + 3; comment = false; continue;
      }
      const start = line.indexOf('<!--', cursor), tick = line.indexOf('`', cursor);
      if (tick >= 0 && (start < 0 || tick < start)) {
        let after = tick; while (line[after] === '`') after++;
        const width = after - tick; let end = after;
        while (end < line.length) {
          const next = line.indexOf('`', end); if (next < 0) break;
          let runEnd = next; while (line[runEnd] === '`') runEnd++;
          if (runEnd - next === width) { after = runEnd; break; }
          end = runEnd;
        }
        rest += line.slice(cursor, after); cursor = after; continue;
      }
      if (start < 0) { rest += line.slice(cursor); break; }
      rest += line.slice(cursor, start); cursor = start + 4; comment = true;
    }
    const heading = line.match(/^ {0,3}(#{1,6})(?:[ \t](.*)|$)/);
    if (!startedInComment && !/^[ \t]*<!--/.test(line) && heading) {
      let title = trim(heading[2] ?? ''); if (/(^| )#+$/.test(title)) title = trim(title.replace(/#+$/, ''));
      headings.push({ level: heading[1]!.length, first: index + 1, last: lines.length, title }); continue;
    }
    text[index] = trim(rest) !== '' && !/^(---+|\*\*\*+|___+)$/.test(trim(rest));
    // Retain source behavior: its line-leading TODO test uses the original line,
    // even while a multiline HTML comment is open. Do not infer a quality verdict.
    marker[index] = /\[To be designed\]|\[TBD\]|\[To be written\]/.test(rest) || /^_?TODO/.test(line);
  }
  for (const [i, heading] of headings.entries()) {
    const next = headings.slice(i + 1).find(h => h.level <= heading.level); if (next) heading.last = next.first - 1;
  }
  const find = (selector: string) => {
    const arg = trim(selector), level = arg.match(/^#+/)?.[0].length ?? 0, wanted = normalize(arg.slice(level));
    return headings.filter(h => normalize(h.title) === wanted && (!level || level === h.level));
  };
  const section = (h: Heading): Section => ({ ...h, status: marker.slice(h.first, h.last).some(Boolean) ? 'PLACEHOLDER' : text.slice(h.first, h.last).some(Boolean) ? 'COMPLETE' : 'EMPTY' });
  return { lines, headings, find, section };
}

export async function mdSectionCommand(root: string, args: string[]): Promise<{ data: MdSectionObservation; exitCode: number }> {
  const [command, path, ...selectors] = args;
  const usage = () => { throw new StudioError('INVALID_ARGUMENT', 'Use list FILE, status FILE [HEADING ...], or extract FILE HEADING [--body]. Writing commands are not implemented.', 2); };
  if (command !== 'list' && command !== 'status' && command !== 'extract') return usage();
  if (!path) return usage();
  const fullPath = await safePath(await realpath(root).catch(() => { throw new StudioError('READ_FAILED', 'Cannot read project root.', 1); }), path);
  let content: string;
  try { if (!(await stat(fullPath)).isFile()) throw new Error('Not a file'); content = await readFile(fullPath, 'utf8'); }
  catch { throw new StudioError('READ_FAILED', `Cannot read ${path}.`, 1); }
  if (command === 'list' && selectors.length || command === 'extract' && (selectors.length < 1 || selectors.length > 2 || selectors.length === 2 && selectors[1] !== '--body')) return usage();
  const parsed = parse(content), data: MdSectionObservation = { status: 'observed', qualityAssessed: false, command, path };
  if (command === 'list') data.headings = parsed.headings;
  else if (command === 'status') {
    const requests = selectors.flatMap(s => s.split('\n')).filter(Boolean);
    data.sections = selectors.length ? requests.flatMap(title => {
      const found = parsed.find(title); return found.length ? found.map(parsed.section) : [{ status: 'NOT_FOUND' as const, first: null, last: null, title }];
    }) : parsed.headings.map(parsed.section);
    data.counts = { sections: 0, complete: 0, empty: 0, placeholder: 0, not_found: 0 };
    for (const row of data.sections) {
      if (row.status === 'NOT_FOUND') data.counts.not_found++;
      else { data.counts.sections++; data.counts[row.status.toLowerCase() as 'complete' | 'empty' | 'placeholder']++; }
    }
  } else {
    const selector = selectors[0]!.split('\n')[0]!, found = parsed.find(selector);
    if (!found.length) throw new StudioError('HEADING_NOT_FOUND', `No heading "${selector}" in the file.`, 3);
    if (found.length > 1) throw new StudioError('AMBIGUOUS_HEADING', `"${selector}" matches ${found.length} headings (lines ${found.map(h => h.first).join(', ')}); add a level or a longer title. Nothing was written.`, 4);
    const heading = found[0]!, extracted = parsed.lines.slice(heading.first - (selectors[1] === '--body' ? 0 : 1), heading.last);
    data.content = extracted.map(line => line.replace(/\r$/, '') + '\n').join('');
  }
  return { data, exitCode: 0 };
}

export function formatMdSection(data: MdSectionObservation): string {
  if (data.command === 'extract') return data.content!;
  const title = (s: string) => s.replace(/\t/g, ' ');
  if (data.command === 'list') return `headings\t${data.headings!.length || ''}\n` + data.headings!.map(h => `${h.level}\t${h.first}\t${h.last}\t${title(h.title)}\n`).join('');
  return Object.entries(data.counts!).map(([key, n]) => `${key}\t${n}\n`).join('') + data.sections!.map(s => `${s.status}\t${s.first === null ? '-' : `${s.first}-${s.last}`}\t${s.status === 'NOT_FOUND' ? s.title : title(s.title)}\n`).join('');
}
