import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { readText, safePath } from './files.js';
import { StudioError } from './contract.js';
import { readRegistry, registryPaths, type RegistryName, type RegistryEntry, type RegistryDiagnostic } from './registry-reader.js';

const names = Object.keys(registryPaths) as RegistryName[];
const trPattern = 'TR-[a-z0-9]+(?:-[a-z0-9]+)*-[0-9]+';
const validSlug = (text = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text);
function usage(message: string): never { throw new StudioError('INVALID_ARGUMENT', message, 2); }
function registryName(value?: string): RegistryName {
  if (!names.includes(value as RegistryName)) usage(`Unknown registry: ${value}`);
  return value as RegistryName;
}
function statusValid(entry: RegistryEntry) {
  const value = entry.fields.status;
  if (value === 'active') return true;
  if (entry.registry === 'entities') return value === 'deprecated';
  if (entry.registry === 'architecture') return typeof value === 'string' && /^superseded_by: ADR-[0-9]+$/.test(value);
  return value === 'deprecated' || (typeof value === 'string' && value.startsWith('superseded-by: ') && value.slice(15).split(',').every(id => new RegExp(`^${trPattern}$`).test(id.trim())));
}
function statusIssue(entry: RegistryEntry): RegistryDiagnostic {
  return { code: 'STATUS', registry: entry.registry, path: registryPaths[entry.registry], line: entry.fieldLines.status!, name: entry.name, field: 'status', value: entry.fields.status, message: 'Status is outside this registry’s allowed values.' };
}
async function files(root: string, directory: string, recursive = false): Promise<string[]> {
  const absolute = await safePath(root, directory);
  let entries;
  try { entries = await readdir(absolute, { withFileTypes: true }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  const result: string[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new StudioError('UNSAFE_PATH', `Registry input cannot be a symbolic link: ${path}`, 4);
    if (entry.isFile()) result.push(path);
    else if (recursive && entry.isDirectory()) result.push(...await files(root, path, true));
  }
  return result;
}
async function citations(root: string) {
  const paths = (await files(root, 'production/epics', true)).filter(path => path.endsWith('.md'));
  const refs: { registry: RegistryName; name: string; how: string; path: string; line: number }[] = [];
  for (const path of paths) {
    const text = await readText(await safePath(root, path));
    if (text === null) throw new StudioError('ASSESSMENT_INCOMPLETE', `Story disappeared: ${path}`, 3);
    for (const [index, line] of text.split(/\r?\n/).entries()) for (const match of line.matchAll(new RegExp(`(?<![A-Za-z0-9-])${trPattern}(?![A-Za-z0-9])`, 'g'))) refs.push({ registry: 'tr', name: match[0], how: 'cited', path, line: index + 1 });
  }
  return { paths, refs };
}
async function nextFileId(root: string, kind: string, scope?: string) {
  const formats: Record<string, { directory: string; pattern: RegExp; prefix: string; width: number; content?: string[] }> = {
    adr: { directory: 'docs/architecture', pattern: /^adr-([0-9]+).*\.md$/, prefix: 'ADR-', width: 4 },
    bug: { directory: 'production/qa/bugs', pattern: /^bug-([0-9]+).*\.md$/i, prefix: 'BUG-', width: 4 },
    story: { directory: `production/epics/${scope}`, pattern: /^story-([0-9]+).*\.md$/, prefix: 'story-', width: 3 },
    sprint: { directory: 'production/sprints', pattern: /^sprint-([0-9]+)\.md$/, prefix: 'sprint-', width: 3 },
    season: { directory: 'design/live-ops/seasons', pattern: /^S([0-9]+)_/, prefix: 'S', width: 0 },
    asset: { directory: 'design/assets/specs', pattern: /(?<![A-Za-z0-9-])ASSET-([0-9]+)(?![A-Za-z0-9])/g, prefix: 'ASSET-', width: 3, content: ['design/assets/asset-manifest.md'] },
    td: { directory: '', pattern: /(?<![A-Za-z0-9-])TD-([0-9]+)(?![A-Za-z0-9])/g, prefix: 'TD-', width: 3, content: ['docs/tech-debt-register.md'] },
  };
  const config = formats[kind]; if (!config) usage(`Unknown ID kind: ${kind}`);
  const paths = config.directory ? await files(root, config.directory) : [];
  const values = new Set<number>();
  if (config.content) {
    for (const path of [...config.content, ...paths.filter(path => path.endsWith('.md'))]) {
      const text = await readText(await safePath(root, path));
      for (const match of (text ?? '').matchAll(config.pattern)) values.add(Number(match[1]));
    }
  } else for (const path of paths) { const match = basename(path).match(config.pattern); if (match) values.add(Number(match[1])); }
  return nextResult(kind, scope, values, config.prefix, config.width);
}
function nextResult(kind: string, scope: string | undefined, values: Set<number>, prefix: string, width: number) {
  const highest = values.size ? Math.max(...values) : null;
  if (highest !== null && (!Number.isSafeInteger(highest) || highest >= Number.MAX_SAFE_INTEGER)) usage('Observed ID exceeds safe numeric precision.');
  const format = (n: number) => prefix + String(n).padStart(width, '0');
  return { kind, scope: scope ?? null, id: format(highest === null ? 1 : highest + 1), highest: highest === null ? null : format(highest), distinctIdsSeen: values.size };
}

/** Portable internal helper. Success means observations collected, never design approval. */
export async function registryCommand(root: string, args: string[], cwd = process.cwd()) {
  if (!(await stat(root)).isDirectory()) usage('Project root must be a directory.');
  const [command, ...rest] = args;
  let selected = names;
  let system: string | undefined;
  if (command === 'list') {
    let selection: RegistryName | undefined;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--system') { if (system !== undefined || !validSlug(rest[i + 1])) usage('--system needs one system slug.'); system = rest[++i]; }
      else { if (selection) usage('Choose at most one registry.'); selection = registryName(rest[i]); }
    }
    if (system) { if (selection && selection !== 'tr') usage('--system reads only the tr registry.'); selection = 'tr'; }
    if (selection) selected = [selection];
  } else if (command === 'get') { if (!rest.length) usage('get needs one or more names.'); }
  else if (command === 'refs' || command === 'slice') { if (rest.length !== 1) usage(`${command} needs one name/path.`); }
  else if (command === 'validate') { if (rest.length) usage('validate takes no arguments.'); }
  else if (command === 'compare') { if (rest.length < 2 || rest.length > 3) usage('compare needs REGISTRY OLD [NEW].'); }
  else if (command === 'next-id') {
    const [kind, scope] = rest;
    if (!kind || !['tr', 'adr', 'bug', 'asset', 'td', 'story', 'sprint', 'season'].includes(kind)) usage('Unknown ID kind.');
    if (kind === 'tr' || kind === 'story') { if (rest.length !== 2 || !validSlug(scope)) usage(`${kind} needs one slug.`); }
    else if (rest.length !== 1) usage(`${kind} takes no scope.`);
    if (kind !== 'tr') return { exitCode: 0, data: { qualityAssessed: false, command, next: await nextFileId(root, kind, scope) } };
    selected = ['tr']; system = scope;
  } else usage(`Unknown registry command: ${command}`);

  const readExternal = async (name: RegistryName, path: string) => {
    const absolute = resolve(cwd, path);
    const result = await readRegistry(dirname(absolute), name, basename(absolute));
    result.path = path; for (const issue of result.diagnostics) issue.path = path;
    return result;
  };
  const registries = command === 'compare'
    ? await Promise.all([readExternal(registryName(rest[0]), rest[1]!), rest[2] ? readExternal(registryName(rest[0]), rest[2]) : readRegistry(root, registryName(rest[0]))])
    : await Promise.all(selected.map(name => readRegistry(root, name)));
  const entries = registries.flatMap(r => r.entries);
  const diagnostics = registries.flatMap(r => r.diagnostics);
  let exitCode = registries.some(r => r.state === 'layout') ? 4 : 0;
  let found = entries;
  let references: ReturnType<typeof flattenRefs> = [];
  let checkedStoryFiles: string[] = [];
  let removed: number | null = null;
  const missing: string[] = [];
  let next;
  if (command === 'list' && system) found = entries.filter(e => new RegExp(`^TR-${system}-[0-9]+$`).test(e.name));
  if (command === 'get') { found = entries.filter(e => rest.includes(e.name)); for (const name of rest) if (!found.some(e => e.name === name)) missing.push(name); }
  if (command === 'slice' || command === 'refs') {
    const arg = rest[0]!.replace(/^\.\//, '');
    if (command === 'slice' || arg.includes('/')) {
      found = entries.filter(e => e.refs.some(ref => ref.path === arg)); references = flattenRefs(found).filter(ref => ref.path === arg);
    } else {
      found = entries.filter(e => e.name === arg); if (!found.length) missing.push(arg);
      references = flattenRefs(found);
      if (found.some(e => e.registry === 'tr')) { const scanned = await citations(root); checkedStoryFiles = scanned.paths; references.push(...scanned.refs.filter(ref => ref.name === arg)); }
    }
  }
  if (command === 'validate') {
    const groups = new Map<string, RegistryEntry[]>();
    for (const entry of entries) { const key = `${entry.registry}/${entry.section}/${entry.name}`; const group = groups.get(key) ?? []; group.push(entry); groups.set(key, group); }
    for (const group of groups.values()) if (group.length > 1) { const e = group[0]!; diagnostics.push({ code: 'DUPLICATE', registry: e.registry, path: registryPaths[e.registry], name: e.name, section: e.section, line: e.line, value: group.map(e => e.line), message: 'Duplicate name within this registry section.' }); }
    const scanned = await citations(root); checkedStoryFiles = scanned.paths;
    if (registries.find(r => r.registry === 'tr')?.state !== 'layout') for (const ref of scanned.refs) if (!entries.some(e => e.registry === 'tr' && e.name === ref.name)) diagnostics.push({ code: 'TR_UNKNOWN', registry: 'tr', path: ref.path, name: ref.name, line: ref.line, message: 'Cited TR-ID is absent from the registry.' });
    for (const entry of entries) {
      if ('status' in entry.fields && !statusValid(entry)) diagnostics.push(statusIssue(entry));
      for (const ref of entry.refs) {
        try { await stat(await safePath(root, ref.path)); }
        catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code !== 'ENOENT' && !(error instanceof StudioError && error.code === 'UNSAFE_PATH')) throw error;
          diagnostics.push({ code: code === 'ENOENT' ? 'PATH_MISSING' : 'PATH_UNSAFE', registry: entry.registry, name: entry.name, path: ref.path, line: ref.line, field: ref.how, message: code === 'ENOENT' ? 'Referenced file or directory is absent.' : 'Reference escapes the project or uses a symbolic link.' });
        }
      }
    }
    exitCode = 0;
  }
  if (command === 'compare') {
    const [old, current] = registries;
    const key = (entry: RegistryEntry) => JSON.stringify([entry.section, entry.name]);
    const now = new Set(current!.entries.map(key)), seen = new Set<string>();
    if (old!.state === 'missing') removed = 0;
    else if (old!.state === 'read' && current!.state === 'read') {
      removed = 0;
      for (const entry of old!.entries) if (!now.has(key(entry)) && !seen.has(key(entry))) { seen.add(key(entry)); removed++; diagnostics.push({ code: 'REMOVED', registry: entry.registry, path: old!.path, line: entry.line, section: entry.section, name: entry.name, message: 'Append-only registry entry removed.' }); }
    }
    for (const entry of current!.entries) if ('status' in entry.fields && !statusValid(entry)) {
      const previous = old!.entries.find(e => key(e) === key(entry) && 'status' in e.fields);
      if (!previous || previous.fields.status !== entry.fields.status) diagnostics.push({ ...statusIssue(entry), path: current!.path });
    }
    found = current!.entries; exitCode = 0;
  }
  if (command === 'next-id' && exitCode === 0) {
    const values = new Set(entries.map(e => e.name.match(new RegExp(`^TR-${system}-([0-9]+)$`))).filter(match => match !== null).map(match => Number(match![1])));
    next = nextResult('tr', system, values, `TR-${system}-`, 3);
  }
  if (!exitCode && missing.length) exitCode = 3;
  return { exitCode, data: { qualityAssessed: false, command, registries: registries.map(({ entries: _entries, diagnostics: _diagnostics, ...r }) => r), entries: found, references, diagnostics, missing, checkedStoryFiles, ...(command === 'compare' ? { removed } : {}), ...(next ? { next } : {}) } };
}
function flattenRefs(entries: RegistryEntry[]) { return entries.flatMap(e => e.refs.map(ref => ({ registry: e.registry, name: e.name, ...ref }))); }
