import { lstat, open, readFile, realpath, rename, stat, unlink } from 'node:fs/promises';
import { constants, type Stats } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { safePath } from './files.js';
import { StudioError } from './contract.js';

type Heading = { level: number; first: number; last: number; title: string };
type Section = { status: 'COMPLETE' | 'EMPTY' | 'PLACEHOLDER' | 'NOT_FOUND'; first: number | null; last: number | null; title: string };
export interface MdSectionObservation {
  status: 'observed'; qualityAssessed: false; command: 'list' | 'status' | 'extract' | 'replace' | 'insert-before' | 'set-field'; path: string;
  action?: 'replaced' | 'inserted' | 'set' | 'added' | 'unchanged'; line?: number; applied?: boolean; dryRun?: boolean;
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
export function parseMdSections(content: string) {
  const lines = content.split('\n'); if (lines.at(-1) === '') lines.pop();
  const headings: Heading[] = [], text: boolean[] = [], marker: boolean[] = [], prose: boolean[] = [];
  const commentStarts: (number | null)[] = [], visible: string[] = [];
  let fence = '', comment = false;
  for (const [index, raw] of lines.entries()) {
    const line = raw.replace(/\r$/, ''); text[index] = false; marker[index] = false; prose[index] = false; commentStarts[index] = null; visible[index] = '';
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
      commentStarts[index] ??= start;
      rest += line.slice(cursor, start); cursor = start + 4; comment = true;
    }
    visible[index] = rest;
    const heading = line.match(/^ {0,3}(#{1,6})(?:[ \t](.*)|$)/);
    if (!startedInComment && !/^[ \t]*<!--/.test(line) && heading) {
      let title = trim(heading[2] ?? ''); if (/(^| )#+$/.test(title)) title = trim(title.replace(/#+$/, ''));
      headings.push({ level: heading[1]!.length, first: index + 1, last: lines.length, title }); continue;
    }
    text[index] = trim(rest) !== '' && !/^(---+|\*\*\*+|___+)$/.test(trim(rest));
    prose[index] = text[index]! && !startedInComment;
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
  return { lines, headings, find, section, text, prose, commentStarts, visible };
}

export interface MdSectionWriteInput {
  readInput?: () => Promise<Buffer>;
  dryRun?: boolean;
}

function decodeInput(bytes: Buffer, label: string, exitCode: number): string {
  try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { throw new StudioError('INVALID_UTF8', `${label} must be valid UTF-8. Nothing was written.`, exitCode); }
}

const lower = (s: string) => s.replace(/[A-Z]/g, c => c.toLowerCase());
function fieldPrefix(line: string, name: string): string {
  const normalized = line.replace(/^[ \t]*/, '').replace(/^> ?/, '').replace(/^- /, '').replace(/\*/g, '');
  if (!lower(normalized).startsWith(`${lower(name)}:`)) return '';
  const start = lower(line).indexOf(lower(name)); if (start < 0) return '';
  let end = start + name.length;
  while (line[end] === '*') end++;
  if (line[end] !== ':') return '';
  end++; while (line[end] === '*') end++;
  while (line[end] === ' ' || line[end] === '\t') end++;
  return line.slice(0, end);
}

async function verifySnapshot(root: string, path: string, before: Buffer, snapshot: Stats): Promise<string> {
  const full = await safePath(root, path);
  let current: Stats, bytes: Buffer;
  try { current = await lstat(full); bytes = await readFile(full); }
  catch { throw new StudioError('FILE_CONFLICT', `File changed while preparing ${path}. Nothing was written.`, 4); }
  if (!current.isFile() || current.dev !== snapshot.dev || current.ino !== snapshot.ino ||
      current.mode !== snapshot.mode || !bytes.equals(before)) {
    throw new StudioError('FILE_CONFLICT', `File changed while preparing ${path}. Nothing was written.`, 4);
  }
  return full;
}

/** One owned temporary file; deliberately not an installation transaction. */
async function commitWrite(root: string, path: string, before: Buffer, snapshot: Stats, after: Buffer): Promise<void> {
  const full = await verifySnapshot(root, path, before, snapshot);
  const temporary = `${full}.${randomUUID()}.tmp`;
  let owned = false;
  try {
    // A rename alone can replace a read-only file. Open without truncation to
    // require actual file write permission, and inspect the opened identity.
    const target = await open(full, constants.O_RDWR | (constants.O_NOFOLLOW ?? 0));
    try {
      const opened = await target.stat();
      if (opened.nlink > 1) throw new StudioError('UNSAFE_PATH', `Refusing to change a hard-linked file: ${path}.`, 4);
      if (opened.dev !== snapshot.dev || opened.ino !== snapshot.ino || !(await target.readFile()).equals(before)) {
        throw new StudioError('FILE_CONFLICT', `File changed while preparing ${path}. Nothing was written.`, 4);
      }
      const staged = await open(temporary, 'wx', 0o600); owned = true;
      try {
        await staged.writeFile(after);
        // open(mode) is filtered by umask; explicitly retain ordinary mode bits.
        await staged.chmod(snapshot.mode & 0o777); await staged.sync();
      } finally { await staged.close(); }
      await verifySnapshot(root, path, before, snapshot);
      if ((await target.stat()).nlink > 1) throw new StudioError('UNSAFE_PATH', `Refusing to change a hard-linked file: ${path}.`, 4);
    } finally { await target.close(); }
    await rename(temporary, full); owned = false;
  } catch (error) {
    if (error instanceof StudioError) throw error;
    throw new StudioError('WRITE_FAILED', `Cannot write ${path}.`, 1);
  } finally {
    if (owned) await unlink(temporary).catch(error => {
      if (error.code !== 'ENOENT') throw new StudioError('WRITE_FAILED', `Cannot clean up the owned temporary file for ${path}.`, 1);
    });
  }
}

export async function mdSectionCommand(root: string, args: string[], input: MdSectionWriteInput = {}): Promise<{ data: MdSectionObservation; exitCode: number }> {
  const [command, path, ...selectors] = args;
  const usage = () => { throw new StudioError('INVALID_ARGUMENT', 'Use list FILE, status FILE [HEADING ...], extract FILE HEADING [--body], replace FILE HEADING, insert-before FILE HEADING, or set-field FILE FIELD VALUE [--after FIELD].', 2); };
  if (command !== 'list' && command !== 'status' && command !== 'extract' && command !== 'replace' && command !== 'insert-before' && command !== 'set-field') return usage();
  if (!path) return usage();
  const writing = command === 'replace' || command === 'insert-before' || command === 'set-field';
  const canonical = await realpath(root).catch(() => { throw new StudioError('READ_FAILED', 'Cannot read project root.', 1); });
  const fullPath = await safePath(canonical, path);
  let bytes: Buffer, snapshot: Stats;
  try { snapshot = await stat(fullPath); if (!snapshot.isFile()) throw new Error('Not a file'); bytes = await readFile(fullPath); }
  catch { throw new StudioError('READ_FAILED', `Cannot read ${path}.`, 1); }
  if (command === 'list' && selectors.length || command === 'extract' && (selectors.length < 1 || selectors.length > 2 || selectors.length === 2 && selectors[1] !== '--body') ||
      (command === 'replace' || command === 'insert-before') && selectors.length !== 1 ||
      command === 'set-field' && (selectors.length !== 2 && selectors.length !== 4 || selectors.length === 4 && selectors[2] !== '--after' || selectors[1]?.includes('\n')) ||
      !writing && input.dryRun) return usage();
  const content = writing ? decodeInput(bytes, path, 1) : bytes.toString('utf8');
  const parsed = parseMdSections(content), data: MdSectionObservation = { status: 'observed', qualityAssessed: false, command, path };
  if (writing) {
    let candidate = '', line = 0, action: NonNullable<MdSectionObservation['action']>;
    const raw = parsed.lines, out = (s: string) => `${s}${raw[0]?.endsWith('\r') ? '\r' : ''}\n`;
    const retained = (lines: string[]) => lines.map(s => `${s}\n`).join('');
    if (command === 'replace' || command === 'insert-before') {
      const body = decodeInput(await input.readInput?.() ?? Buffer.alloc(0), 'stdin', 2).split('\n');
      if (body.at(-1) === '') body.pop();
      for (let n = 0; n < body.length; n++) body[n] = body[n]!.replace(/\r$/, '');
      while (body.length && /^[ \t]*$/.test(body[0]!)) body.shift();
      while (body.length && /^[ \t]*$/.test(body.at(-1)!)) body.pop();
      if (!body.length) throw new StudioError('INVALID_ARGUMENT', 'Nothing on stdin to write.', 2);
      const selector = selectors[0]!.split('\n')[0]!, found = parsed.find(selector);
      if (!found.length) throw new StudioError('HEADING_NOT_FOUND', `No heading "${selector}" in the file.`, 3);
      if (found.length > 1) throw new StudioError('AMBIGUOUS_HEADING', `"${selector}" matches ${found.length} headings (lines ${found.map(h => h.first).join(', ')}); add a level or a longer title. Nothing was written.`, 4);
      const heading = found[0]!, at = heading.first - 1;
      if (command === 'replace') {
        candidate = retained(raw.slice(0, heading.first)) + out('') + body.map(out).join('') +
          (heading.last < raw.length ? out('') : '') + retained(raw.slice(heading.last));
        action = 'replaced'; line = heading.first;
      } else {
        const start = at - body.length - 1;
        const same = start >= 0 && body.every((s, n) => raw[start + n]!.replace(/\r$/, '') === s) && /^[ \t]*$/.test(raw[at - 1]!.replace(/\r$/, ''));
        const separator = at > 0 && !/^[ \t]*$/.test(raw[at - 1]!.replace(/\r$/, ''));
        candidate = same ? content : retained(raw.slice(0, at)) + (separator ? out('') : '') + body.map(out).join('') + out('') + retained(raw.slice(at));
        action = same ? 'unchanged' : 'inserted'; line = same ? start + 1 : heading.first + Number(separator);
      }
    } else {
      const [name, value, , after = ''] = selectors;
      let at = -1, anchor = -1, prefix = '', anchorPrefix = '';
      for (let n = 0; n < raw.length; n++) {
        if (!parsed.text[n]) continue;
        const s = raw[n]!.replace(/\r$/, '');
        if (at < 0) { const p = fieldPrefix(s, name!); if (p) { at = n; prefix = p; } }
        if (after && anchor < 0) { const p = fieldPrefix(s, after); if (p) { anchor = n; anchorPrefix = p; } }
      }
      if (at >= 0) {
        const current = raw[at]!.replace(/\r$/, '').slice(prefix.length);
        const same = current === value;
        candidate = same ? content : retained(raw.map((s, n) => n === at ? `${prefix}${value}${s.endsWith('\r') ? '\r' : ''}` : s));
        action = same ? 'unchanged' : 'set'; line = at + 1;
      } else {
        if (anchor < 0) throw new StudioError('FIELD_NOT_FOUND', `No "${name}" field${after ? ` or "${after}" anchor` : ' (add --after FIELD to add it)'}.`, 3);
        const start = lower(anchorPrefix).indexOf(lower(after));
        const prefix = anchorPrefix.slice(0, start) + name + anchorPrefix.slice(start + after.length);
        candidate = retained(raw.slice(0, anchor + 1)) + `${prefix}${value}${raw[anchor]!.endsWith('\r') ? '\r' : ''}\n` + retained(raw.slice(anchor + 1));
        action = 'added'; line = anchor + 2;
      }
    }
    if (candidate === content) action = 'unchanged';
    await verifySnapshot(canonical, path, bytes, snapshot);
    const dryRun = input.dryRun ?? false;
    if (!dryRun && action !== 'unchanged') await commitWrite(canonical, path, bytes, snapshot, Buffer.from(candidate));
    Object.assign(data, { action, line, dryRun, applied: !dryRun && action !== 'unchanged' });
    return { data, exitCode: 0 };
  }
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
  if (data.action) return `${data.dryRun ? 'dry_run\ttrue\napplied\tfalse\n' : ''}file\t${data.path}\t${data.action}\nline\t${data.line}\t-\n`;
  if (data.command === 'extract') return data.content!;
  const title = (s: string) => s.replace(/\t/g, ' ');
  if (data.command === 'list') return `headings\t${data.headings!.length || ''}\n` + data.headings!.map(h => `${h.level}\t${h.first}\t${h.last}\t${title(h.title)}\n`).join('');
  return Object.entries(data.counts!).map(([key, n]) => `${key}\t${n}\n`).join('') + data.sections!.map(s => `${s.status}\t${s.first === null ? '-' : `${s.first}-${s.last}`}\t${s.status === 'NOT_FOUND' ? s.title : title(s.title)}\n`).join('');
}
