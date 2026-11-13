import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { safePath } from './files.js';

type Status = 'Accepted' | 'Proposed' | 'Deprecated' | 'Superseded' | 'UNFILLED' | 'OTHER' | null;
interface Template { path: string; content: string }
interface Options { selectors?: string[]; template?: Template }
interface AdrStatus {
  id: string | null; path: string; status: Status; layer: string | null; date: string | null;
  lastVerified: string | null; version: string; dependsOn: string[] | 'none' | 'UNFILLED' | null;
  supersededBy: string | null; missing: string[]; unfilled: number;
}
export interface AdrStatusResult {
  qualityAssessed: false; scope: string; adrs: AdrStatus[]; counts: Record<string, number>;
  templateSections: number; templatePath: string | null; missingSelectors: string[]; exitCode: 0 | 3;
}
const lower = (s: string) => s.replace(/[A-Z]/g, x => x.toLowerCase());
const trim = (s: string) => s.replace(/^[ \t]+|[ \t]+$/g, '');
const norm = (s: string) => lower(trim(s)).replace(/[ \t]+/g, ' ').replace(/^[0-9]+[.)]? /, '');
const idOf = (path: string) => lower(path.split('/').at(-1)!).match(/adr-[0-9]+/)?.[0] ?? null;
const ids = (s: string) => [...new Set((s.match(/adr-[0-9]+/gi) ?? []).map(lower))];
const cell = (s: string) => trim(s.split('|')[2] ?? '');
const statuses = ['accepted', 'proposed', 'deprecated', 'superseded', 'unfilled', 'other', 'no_status'];

// ADR source uses heading/fence/comment parsing rather than Markdown rendering.
function lines(text: string): { section: string; heading: string | null; text: string }[] {
  const out: { section: string; heading: string | null; text: string }[] = [];
  let fence = '', comment = false, section = '';
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (fence) {
      const close = /^ {0,3}(`+|~+)[ \t]*$/.exec(line);
      if (close && close[1]![0] === fence[0] && close[1]!.length >= fence.length) fence = '';
      continue;
    }
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open) { fence = open[1]!; continue; }
    const beganInComment = comment; let rest = '', pending = line;
    while (pending) {
      if (comment) { const end = pending.indexOf('-->'); if (end < 0) break; pending = pending.slice(end + 3); comment = false; }
      else { const start = pending.indexOf('<!--'); if (start < 0) { rest += pending; break; } rest += pending.slice(0, start); pending = pending.slice(start + 4); comment = true; }
    }
    const heading = /^ {0,3}(#{1,6})(?:[ \t](.*)|$)/.exec(line);
    if (!beganInComment && !/^[ \t]*<!--/.test(line) && heading) {
      const title = trim(trim(heading[2] ?? '').replace(/(?:^| )#+$/, ''));
      if (heading[1]!.length <= 2) section = heading[1]!.length === 2 ? norm(title) : '';
      if (heading[1]!.length === 2) out.push({ section, heading: title, text: '' });
      continue;
    }
    if (trim(rest)) out.push({ section, heading: null, text: trim(rest) });
  }
  return out;
}
function parse(path: string, text: string, template: ReturnType<typeof lines>): AdrStatus {
  const content = lines(text), present = new Set(content.filter(l => l.heading !== null).map(l => l.section));
  const first = (section: string) => content.find(l => l.section === section && l.heading === null && !l.text.startsWith('>'))?.text ?? '';
  const statusText = first('status'), word = lower(trim(statusText.replace(/[*_`]/g, ''))).replace(/[^a-z].*$/, '');
  const status: Status = word === 'accepted' ? 'Accepted' : word === 'proposed' ? 'Proposed' : word === 'deprecated' ? 'Deprecated'
    : word === 'superseded' ? 'Superseded' : statusText.startsWith('[') ? 'UNFILLED' : statusText || present.has('status') ? 'OTHER' : null;
  const date = (section: string) => { const raw = first(section); return raw.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)?.[0] ?? (raw || present.has(section) ? 'UNFILLED' : null); };
  const created = date('date'), verified = date('last verified');
  const layerLine = content.find(l => /^\|[ \t]*\*\*Layer\*\*[ \t]*\|/.test(l.text));
  const layer = layerLine ? cell(layerLine.text) : '';
  const dep = content.find(l => l.section === 'adr dependencies' && l.text.includes('**Depends On**'));
  const id = idOf(path), targets = dep ? ids(dep.text).filter(target => target !== id) : [];
  const dependsOn = dep ? targets.length ? targets : (cell(dep.text) || dep.text).startsWith('[') ? 'UNFILLED' : 'none' : null;
  const headings = new Map<string, string>();
  for (const line of template) if (line.heading !== null && !headings.has(line.section)) headings.set(line.section, line.heading);
  const placeholders = new Set(template.filter(l => l.heading === null && l.text.includes('[')).map(l => l.text));
  return { id, path, status, layer: layer.startsWith('[') ? 'UNFILLED' : layer || null, date: created, lastVerified: verified,
    version: verified?.match(/^[0-9]/) ? verified : created?.match(/^[0-9]/) ? created : 'unversioned', dependsOn,
    supersededBy: status === 'Superseded' ? ids(statusText)[0] ?? null : null,
    missing: [...headings].filter(([key]) => !present.has(key)).map(([, title]) => title),
    unfilled: content.filter(l => l.heading === null && placeholders.has(l.text)).length };
}
export async function readAdrStatus(input: string, options: Options = {}): Promise<AdrStatusResult> {
  const root = await realpath(input), selectors = options.selectors ?? [];
  const template = lines(options.template?.content ?? '');
  const result: AdrStatusResult = { qualityAssessed: false, scope: selectors.length ? 'arguments' : 'docs/architecture/adr-*.md',
    adrs: [], counts: Object.fromEntries(statuses.map(s => [s, 0])), templateSections: new Set(template.filter(l => l.heading !== null).map(l => l.section)).size,
    templatePath: options.template?.path ?? null, missingSelectors: [], exitCode: 0 };
  let all: string[];
  try { all = (await readdir(await safePath(root, 'docs/architecture'), { withFileTypes: true })).filter(e => /^adr-.*\.md$/.test(e.name) && (e.isFile() || e.isSymbolicLink())).map(e => `docs/architecture/${e.name}`).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; all = []; }
  const regular = async (path: string) => {
    try { const info = await stat(await safePath(root, path)); return info.isFile() ? info : null; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; return null; }
  };
  const selected: string[] = [], seen = new Set<string>();
  for (const selector of selectors.length ? selectors : all) {
    let path = selector.replace(/^\.\//, ''), info = await regular(path);
    if (!info && selectors.length && /^(?:adr-)?[0-9]+$/i.test(selector)) {
      const number = BigInt(selector.replace(/^adr-/i, ''));
      const match = all.find(p => { const id = idOf(p); return id !== null && BigInt(id.slice(4)) === number; });
      if (match) { path = match; info = await regular(path); }
    }
    if (!info) { result.missingSelectors.push(selector); continue; }
    const identity = info.ino ? `${info.dev}:${info.ino}` : path;
    if (!selectors.length || !seen.has(identity)) { selected.push(path); seen.add(identity); }
  }
  for (const path of selected) {
    const row = parse(path, await readFile(await safePath(root, path), 'utf8'), template);
    result.adrs.push(row); result.counts[row.status === null ? 'no_status' : lower(row.status)]!++;
  }
  if (result.missingSelectors.length) result.exitCode = 3;
  return result;
}
export function formatAdrStatus(r: AdrStatusResult): string {
  const value = (v: string | null) => v || '-';
  const rows = [`adrs\t${r.adrs.length}\t${r.scope}`, `template_sections\t${r.templateSections}\t${value(r.templatePath)}`, ...statuses.map(s => `${s}\t${r.counts[s]}`)];
  for (const a of r.adrs) rows.push(['ADR', value(a.id), a.path.replaceAll('\t', ' '), value(a.status), value(a.layer).replaceAll('\t', ' '), value(a.date), value(a.lastVerified), a.version,
    Array.isArray(a.dependsOn) ? a.dependsOn.join(',') : value(a.dependsOn), value(a.supersededBy), a.missing.join(',') || '-', a.unfilled].join('\t'));
  rows.push(...r.missingSelectors.map(s => `NOT_FOUND\t${s}`)); return `${rows.join('\n')}\n`;
}
