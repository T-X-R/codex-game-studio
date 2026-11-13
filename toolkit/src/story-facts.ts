import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { safePath } from './files.js';
import { StudioError } from './contract.js';
import { parseDocument } from 'yaml';

type State = 'COMPLETE' | 'IN_REVIEW' | 'IN_PROGRESS' | 'TODO' | 'BLOCKED' | 'OTHER' | 'NO_STATUS';
interface Options { scope?: 'all' | 'sprint' | 'paths'; paths?: string[]; lint?: boolean; granularity?: 'coarse' | 'balanced' | 'fine' }
interface StoryFact {
  path: string; state: State; status: string | null; type: string | null; layer: string | null; estimate: string | null;
  trIds: string[]; adrs: string[]; ac: number | null; qaCases: number | null;
  testEvidence: string | null; dependsOn: string | null; sprintStatus: string | null;
}
interface Lint { path: string; rule: string; detail: string }
export interface StoryFactsResult {
  qualityAssessed: false; scope: string; stories: StoryFact[]; lint: Lint[]; lintEnabled: boolean;
  missingPaths: string[]; counts: Record<State, number>; sprintMissing: boolean; exitCode: 0 | 3;
}
const states: State[] = ['COMPLETE', 'IN_REVIEW', 'IN_PROGRESS', 'TODO', 'BLOCKED', 'OTHER', 'NO_STATUS'];
const lower = (s: string) => s.replace(/[A-Z]/g, x => x.toLowerCase());
const trim = (s: string) => s.replace(/^[ \t]+|[ \t]+$/g, '');
const norm = (s: string) => s.replace(/^[ \t]+/, '').replace(/^> /, '').replace(/^- /, '').replaceAll('*', '');
const bracket = (s: string) => s.startsWith('[');
const value = (s: string) => s ? bracket(s) ? 'UNFILLED' : s : null;
const field = (s: string, name: string) => lower(norm(s).slice(0, name.length + 1)) === `${lower(name)}:` ? trim(norm(s).slice(name.length + 1)) : null;
const ids = (s: string, regex: RegExp) => [...new Set(s.match(regex) ?? [])];
const clean = (s: string | number | null) => s === null || s === '' ? '-' : typeof s === 'number' ? s : trim(s.replaceAll('\t', ' '));

// Match the source's inline-backtick handling: a comment opener inside a closed
// code span is text. Markers inside that span still count; fenced blocks do not.
function uncomment(line: string, inside: boolean): [string, boolean] {
  let rest = '', s = line;
  while (s) {
    if (inside) { const end = s.indexOf('-->'); if (end < 0) break; s = s.slice(end + 3); inside = false; continue; }
    const comment = s.indexOf('<!--'), tick = s.indexOf('`');
    if (tick >= 0 && (comment < 0 || tick < comment)) {
      const run = /^`+/.exec(s.slice(tick))![0];
      const tail = s.slice(tick + run.length);
      const end = [...tail.matchAll(/`+/g)].find(m => m[0].length === run.length);
      const length = end ? tick + run.length + end.index + run.length : tick + run.length;
      rest += s.slice(0, length); s = s.slice(length); continue;
    }
    if (comment < 0) { rest += s; break; }
    rest += s.slice(0, comment); s = s.slice(comment + 4); inside = true;
  }
  return [rest, inside];
}
function parseStory(path: string, text: string, sprintStatus: string | null, options: Options): { story: StoryFact; lint: Lint[] } {
  const row: StoryFact = { path, state: 'NO_STATUS', status: null, type: null, layer: null, estimate: null,
    trIds: [], adrs: [], ac: null, qaCases: null, testEvidence: null, dependsOn: null, sprintStatus };
  const fields = new Map<string, string>(), markers: string[] = [];
  let fence = '', comment = false, section = '', governing: string | null = null;
  for (const [index, raw] of text.split('\n').entries()) {
    const line = raw.replace(/\r$/, '');
    if (row.status === null && norm(line).startsWith('Status:')) row.status = trim(norm(line).slice(7));
    if (fence) {
      const close = /^ {0,3}(`+|~+)[ \t]*$/.exec(line);
      if (close && close[1]![0] === fence[0] && close[1]!.length >= fence.length) fence = '';
      continue;
    }
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (open) { fence = open[1]!; continue; }
    const beganInComment = comment;
    const [visible, nextComment] = uncomment(line, comment); comment = nextComment;
    const heading = /^ {0,3}(#{1,6})[ \t](.*)$/.exec(line);
    if (!beganInComment && heading) {
      if (heading[1]!.length <= 2) section = heading[1]!.length === 2 ? lower(heading[2]!).replace(/^[ \t]+|[ \t#]+$/g, '') : '';
      continue;
    }
    const content = trim(visible); if (!content) continue;
    for (const name of ['Type', 'Layer', 'Estimate', 'Epic', 'Manifest Version']) {
      const v = field(content, name); if (!fields.has(name) && v !== null) fields.set(name, v);
    }
    if (governing === null) for (const name of ['ADR Governing Implementation', 'Governing ADRs', 'ADR']) {
      const v = field(content, name); if (v !== null) { governing = v || '-'; break; }
    }
    row.trIds = [...new Set([...row.trIds, ...ids(content, /TR-[A-Za-z0-9][A-Za-z0-9-]*-[0-9]+/g)])];
    if (section === 'acceptance criteria') { row.ac ??= 0; if (/^[-*] \[[ xX]\]/.test(content)) row.ac++; }
    if (section === 'qa test cases') { row.qaCases ??= 0; if (/^[-*] \*\*AC-[0-9]+\*\*/.test(content)) row.qaCases++; }
    if (section === 'test evidence' && !row.testEvidence) row.testEvidence = field(content, 'Status');
    if (section === 'dependencies' && !row.dependsOn) row.dependsOn = field(content, 'Depends on');
    for (const m of content.matchAll(/(?<![A-Za-z0-9_])(TBD|TODO|UNRESOLVED)(?![A-Za-z0-9_])/g)) markers.push(`${m[1]} line ${index + 1}`);
  }
  const status = lower(row.status ?? '');
  row.state = row.status === null ? 'NO_STATUS' : /^(complete|done)([^a-z]|$)/.test(status) ? 'COMPLETE'
    : /^in progress([^a-z]|$)/.test(status) ? 'IN_PROGRESS' : /^in review([^a-z]|$)/.test(status) ? 'IN_REVIEW'
    : /^(ready|not started)([^a-z]|$)/.test(status) ? 'TODO' : /^blocked([^a-z]|$)/.test(status) ? 'BLOCKED' : 'OTHER';
  row.type = value(fields.get('Type') ?? ''); row.layer = value(fields.get('Layer') ?? ''); row.estimate = value(fields.get('Estimate') ?? '');
  if (governing !== null) { row.adrs = ids(lower(governing), /adr-[0-9]+/g); if (!row.adrs.length) row.adrs = /n\/a/.test(lower(governing)) ? ['n/a'] : bracket(governing) ? ['UNFILLED'] : []; }
  const lint: Lint[] = [], add = (rule: string, detail = '-') => lint.push({ path, rule, detail });
  if (options.lint) {
    if (row.status === null) add('no_status');
    const type = fields.get('Type') ?? '', known = ['logic', 'integration', 'visual/feel', 'ui', 'config/data'].includes(lower(type));
    if (!type) add('type_missing');
    else if (!bracket(type)) {
      if (!known) add('type_unknown', clean(type) as string);
      else {
        const min = options.granularity === 'fine' || lower(type) === 'config/data' ? 1
          : options.granularity === 'balanced' || ['visual/feel', 'ui'].includes(lower(type)) ? 2 : 3;
        if (row.ac !== null && row.ac < min) add('ac_below_min', `${row.ac} < ${min} (${type})`);
      }
    }
    for (const [name, v] of fields) if (bracket(v)) add('unfilled', name);
    if (!row.trIds.length) add('no_tr_id');
    if (row.ac === null) add('no_ac_section');
    for (const marker of markers) add('marker', marker);
  }
  return { story: row, lint };
}

export async function readStoryFacts(input: string, options: Options = {}): Promise<StoryFactsResult> {
  const scope = options.scope ?? 'all';
  if (!['all', 'sprint', 'paths'].includes(scope) || !['coarse', 'balanced', 'fine'].includes(options.granularity ?? 'coarse')) throw new StudioError('INVALID_ARGUMENT', 'Invalid story scope or granularity');
  const root = await realpath(input), result: StoryFactsResult = { qualityAssessed: false,
    scope: scope === 'all' ? 'production/epics/**/story-*.md' : scope === 'sprint' ? 'production/sprint-status.yaml' : 'paths',
    stories: [], lint: [], lintEnabled: options.lint ?? false, missingPaths: [], counts: Object.fromEntries(states.map(s => [s, 0])) as Record<State, number>, sprintMissing: false, exitCode: 0 };
  const paths: string[] = [], sprint = new Map<string, string>();
  if (scope === 'all') {
    const walk = async (path: string): Promise<void> => {
      let entries; try { entries = await readdir(await safePath(root, path), { withFileTypes: true }); }
      catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return; throw e; }
      for (const entry of entries) {
        const p = `${path}/${entry.name}`; await safePath(root, p);
        if (entry.isDirectory()) await walk(p); else if (entry.isFile() && /^story-.*\.md$/.test(entry.name)) paths.push(p);
      }
    };
    await walk('production/epics'); paths.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  } else if (scope === 'paths') paths.push(...(options.paths ?? []));
  else {
    let text;
    try { text = await readFile(await safePath(root, 'production/sprint-status.yaml'), 'utf8'); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; result.sprintMissing = true; result.exitCode = 3; return result; }
    const document = parseDocument(text);
    if (document.errors.length) throw new StudioError('INVALID_SPRINT', `Cannot parse production/sprint-status.yaml: ${document.errors[0]!.message}`, 1);
    let plan;
    try { plan = document.toJS(); }
    catch (error) { throw new StudioError('INVALID_SPRINT', `Cannot convert production/sprint-status.yaml: ${(error as Error).message}`, 1); }
    const invalid = () => new StudioError('INVALID_SPRINT', 'Sprint plan must be a mapping with a stories array of file paths and optional string statuses', 1);
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) throw invalid();
    if (plan.stories !== undefined && !Array.isArray(plan.stories)) throw invalid();
    for (const entry of plan.stories ?? []) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.file !== 'string' || !entry.file.trim()
          || (entry.status !== undefined && typeof entry.status !== 'string')) throw invalid();
      const path = entry.file.replace(/^\.\//, '');
      paths.push(path); sprint.set(path, entry.status || '-');
    }
  }
  for (const original of paths) {
    const path = original.replace(/^\.\//, ''), absolute = await safePath(root, path);
    try {
      if (!(await stat(absolute)).isFile()) { result.missingPaths.push(path); continue; }
      const parsed = parseStory(path, await readFile(absolute, 'utf8'), sprint.get(path) ?? null, options);
      result.stories.push(parsed.story); result.lint.push(...parsed.lint); result.counts[parsed.story.state]++;
    } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; result.missingPaths.push(path); }
  }
  if (result.missingPaths.length) result.exitCode = 3;
  return result;
}
export function formatStoryFacts(r: StoryFactsResult): string {
  if (r.sprintMissing) return '';
  const lines = [`stories\t${r.stories.length}\t${r.scope}`, ...states.map(s => `${lower(s)}\t${r.counts[s]}`)];
  if (r.lintEnabled) lines.push(`lint\t${r.lint.length}`);
  for (const s of r.stories) lines.push(['STORY', s.path, s.state, clean(s.status), clean(s.type), clean(s.layer), clean(s.estimate),
    s.trIds.join(',') || '-', s.adrs.join(',') || '-', clean(s.ac), clean(s.qaCases), clean(s.testEvidence), clean(s.dependsOn), clean(s.sprintStatus)].join('\t'));
  lines.push(...r.lint.map(l => ['LINT', l.path, l.rule, l.detail].join('\t')), ...r.missingPaths.map(p => `NOT_FOUND\t${p}`));
  return `${lines.join('\n')}\n`;
}
