import { constants } from 'node:fs';
import { lstat, open, opendir, realpath } from 'node:fs/promises';
import { isAbsolute, join, delimiter } from 'node:path';
import { homedir } from 'node:os';
import { parseConfig, type Json, type Setting } from './config.js';
import { StudioError } from './contract.js';
import { canonicalRoot, safePath } from './files.js';
import { resolveEngineRow, excludedCodeDirectories } from './engine.js';
import { resolveCommand } from './run-tests.js';
import { runProcess } from './process.js';
import { detectWeb } from './web-detect.js';
import { parseMdSections } from './md-section.js';

type State = 'MATCH' | 'DIFFERS' | 'NOT_CHECKED';
interface Observation { check: string; state: State; declared: unknown; observed: unknown; sources: string[]; reason: string }
interface Reading { path: string; state: 'read' | 'missing' | 'unavailable'; content: string | null; reason: string | null }
interface Candidate { value: string; source: string; path: string | null; reason: string | null }
const maxBytes = 1024 * 1024;
const engines: Record<string, string> = { godot: 'Godot', unity: 'Unity', unreal: 'Unreal', web: 'Web' };
function record(value: unknown): Record<string, Json> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : null;
}
async function readBounded(path: string): Promise<Reading> {
  try {
    const metadata = await lstat(path);
    if (!metadata.isFile()) throw new Error('Not a regular file (links are not followed)');
    if (metadata.size > maxBytes) throw new Error(`File exceeds ${maxBytes} bytes`);
    const file = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
      if (!(await file.stat()).isFile()) throw new Error('Not a regular file');
      const buffer = Buffer.alloc(maxBytes + 1); let length = 0;
      while (length < buffer.length) { const read = await file.read(buffer, length, buffer.length - length, null); if (!read.bytesRead) break; length += read.bytesRead; }
      if (length > maxBytes) throw new Error(`File exceeds ${maxBytes} bytes`);
      return { path, state: 'read', content: new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length)), reason: null };
    } finally { await file.close(); }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { path, state: 'missing', content: null, reason: 'File does not exist' };
    return { path, state: 'unavailable', content: null, reason: error instanceof Error ? error.message : 'Read failed' };
  }
}
async function readProject(root: string, path: string): Promise<Reading> {
  try { const result = await readBounded(await safePath(root, path)); return { ...result, path }; }
  catch (error) { return { path, state: 'unavailable', content: null, reason: error instanceof Error ? error.message : 'Unsafe path' }; }
}
function series(value: unknown, reference = false): string | null {
  if (typeof value !== 'string') return null;
  const literal = reference ? value.trim().replace(/^(?:Godot|Unity|Unreal(?: Engine)?|Vite)\s+/i, '').replace(/\s+LTS$/i, '') : value;
  // A configured version is a literal release, not a historical sentence or choice.
  // References may add only the engine label and Unity's LTS designation.
  if (!/^\d+\.\d+(?:\.\d+)*(?:[abfp]\d+|[-+][0-9A-Za-z][0-9A-Za-z.-]*|\.(?:stable|dev|alpha|beta|rc)[0-9A-Za-z._+-]*)?$/.test(literal)) return null;
  const match = literal.match(/^(\d+)\.(\d+)/)!;
  return `${match[1] === '6000' ? '6' : match[1]}.${Number(match[2])}`;
}
function tableValues(content: string, label: string, webPinned = false): string[] {
  const parsed = parseMdSections(content), values: string[] = [];
  const pinnedSections = webPinned ? parsed.find('## Pinned versions') : [];
  let pinnedTable = false;
  for (const [index, line] of parsed.visible.entries()) {
    if (!parsed.prose[index] || !line.trimStart().startsWith('|')) { pinnedTable = false; continue; }
    if (/^\s*\|\s*Package\s*\|\s*Pinned\s*\|\s*Published\s*\|\s*First release of this major\s*\|\s*Node\s*\|\s*$/.test(line)) {
      const owner = parsed.headings.filter(section => index + 1 > section.first && index + 1 <= section.last).at(-1);
      pinnedTable = owner !== undefined && pinnedSections.includes(owner);
    }
    const cells = line.split('|').map(x => x.trim());
    if (cells[1]?.replace(/[*`]/g, '') === label && (cells.length === 4 || webPinned && pinnedTable && cells.length >= 7)) values.push(cells[2]!);
  }
  return values;
}
function ini(content: string): Map<string, (string | null)[]> {
  const result = new Map<string, (string | null)[]>(); let section = '';
  for (const line of content.split(/\r?\n/)) {
    const header = /^\s*\[([^\]]+)\]\s*(?:;.*)?$/.exec(line);
    if (header) { section = header[1]!; continue; }
    const item = /^\s*([^;#=\s][^=]*?)\s*=\s*(.*?)\s*$/.exec(line);
    if (!item) continue;
    let value: string | null = item[2]!;
    if (value.startsWith('"')) { try { value = JSON.parse(value); } catch { value = null; } }
    else value = value.replace(/\s+;.*$/, '');
    const key = `${section}/${item[1]!.trim()}`; result.set(key, [...(result.get(key) ?? []), value]);
  }
  return result;
}
// Recognize literal words only. Never evaluate command text or shell expansion.
function words(command: string): string[] | null {
  const result: string[] = []; let i = 0;
  while (i < command.length) {
    while (i < command.length && /\s/.test(command[i]!)) i++;
    if (i === command.length) break;
    let word = '';
    while (i < command.length && !/\s/.test(command[i]!)) {
      if (command[i] === '"' || command[i] === "'") {
        const quote = command[i++]!; const end = command.indexOf(quote, i);
        if (end < 0) return null;
        word += command.slice(i, end); i = end + 1;
      } else {
        const char = command[i++]!;
        if (/[;&|<>`$()]/.test(char)) return null;
        word += char;
      }
    }
    if (/[\0\r\n`$]/.test(word)) return null;
    result.push(word);
  }
  return result;
}
function editorWord(engine: string, word: string | undefined): boolean {
  const name = word?.replace(/\\/g, '/').split('/').at(-1) ?? '';
  return engine === 'godot' ? /^godot(?:[_.-].*)?$/i.test(name) : engine === 'unity' ? /^Unity(?:\.exe)?$/i.test(name) : /^UnrealEditor(?:-Cmd)?(?:\.exe)?$/i.test(name);
}
async function locate(root: string, value: string, source: string): Promise<Candidate> {
  const result: Candidate = { value, source, path: null, reason: null };
  if (!value.trim() || /[\0\r\n]/.test(value)) return { ...result, reason: 'Executable/root must be a nonempty single-line string' };
  if (process.platform !== 'win32' && (/^[A-Za-z]:[\\/]/.test(value) || value.includes('\\'))) return { ...result, reason: 'Windows path cannot be resolved on this host' };
  const paths: string[] = [];
  if (isAbsolute(value)) paths.push(value);
  else if (value.includes('/') || value.includes('\\')) {
    try { paths.push(await safePath(root, value.replace(/^\.\//, '').replace(/\\/g, '/'))); }
    catch (error) { return { ...result, reason: error instanceof Error ? error.message : 'Unsafe path' }; }
  } else {
    for (const entry of (process.env.PATH ?? '').split(delimiter).slice(0, 128)) {
      if (!entry || !isAbsolute(entry)) continue;
      paths.push(join(entry, value));
      if (process.platform === 'win32' && !/\.[a-z]+$/i.test(value)) paths.push(join(entry, value + '.exe'));
    }
  }
  for (const path of paths) {
    try { const actual = await realpath(path); const stat = await lstat(actual); if (stat.isFile() || stat.isDirectory()) return { ...result, path: actual }; }
    catch (error) { if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) return { ...result, reason: (error as Error).message }; }
  }
  return { ...result, reason: 'Named executable/root was not found; no alternative version was selected' };
}
async function shape(root: string, layout: Record<string, Json>) {
  const code = record(layout.code_root); const twoD: string[] = [], threeD: string[] = [], issues: string[] = [];
  let entries = 0, bytes = 0;
  if (code?.state !== 'available' || typeof code.value !== 'string') return { codeRoot: code, complete: false, twoD, threeD, issues: [String(code?.reason ?? 'Code root is unavailable')] };
  const visit = async (relative: string, depth: number): Promise<void> => {
    if (entries > 20000 || bytes > 16 * maxBytes) return;
    if (depth > 32) { issues.push('Source traversal depth exceeds 32'); return; }
    const path = relative === '.' ? root : await safePath(root, relative);
    const directory = await opendir(path);
    for await (const entry of directory) {
      if (++entries > 20000) { issues.push('Source traversal exceeds 20000 entries'); break; }
      if (entry.name.startsWith('.') || [...excludedCodeDirectories, 'build', 'coverage'].includes(entry.name)) continue;
      const child = relative === '.' ? entry.name : `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) { issues.push(`Skipped source link: ${child}`); continue; }
      if (entry.isDirectory()) { await visit(child, depth + 1); continue; }
      if (!entry.isFile() || !/\.(gd|tscn)$/.test(entry.name)) continue;
      const read = await readProject(root, child);
      if (read.content === null) { issues.push(`${child}: ${read.reason}`); continue; }
      bytes += Buffer.byteLength(read.content); if (bytes > 16 * maxBytes) { issues.push('Source content exceeds 16 MiB'); break; }
      const classes = entry.name.endsWith('.gd') ? [...read.content.matchAll(/^\s*extends\s+(\w+)/gm)].map(m => m[1]!)
        : [...read.content.matchAll(/^\s*\[node\s+[^\r\n]*\btype="(\w+)"/gm)].map(m => m[1]!);
      if (classes.some(c => /2D$/.test(c))) twoD.push(child);
      if (classes.some(c => /3D$/.test(c))) threeD.push(child);
    }
  };
  try { await visit(code.value, 0); } catch (error) { issues.push((error as Error).message); }
  return { codeRoot: code, complete: issues.length === 0, twoD: twoD.sort(), threeD: threeD.sort(), issues };
}

export async function inspectProjectCoherence(input: string, options: { probe?: boolean; timeoutMs?: number } = {}) {
  const root = await canonicalRoot(input); if (!(await lstat(root)).isDirectory()) throw new StudioError('INVALID_ARGUMENT', 'Project root must be a directory');
  const timeoutMs = options.timeoutMs ?? 10000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 60000) throw new StudioError('INVALID_ARGUMENT', 'Probe timeout must be 100–60000 milliseconds');
  const observations: Observation[] = [], probes: { source: string; executable: string; args: string[]; exitCode: number | null; signal: string | null; stdout: string; stderr: string }[] = [];
  const add = (check: string, state: State, declared: unknown, observed: unknown, sources: string[], reason: string) => observations.push({ check, state, declared, observed, sources, reason });
  const result = { project: root, qualityAssessed: false as const, exitCode: 0, observations, probes, candidates: [] as Candidate[],
    shape: null as Awaited<ReturnType<typeof shape>> | null, web: null as Awaited<ReturnType<typeof detectWeb>>['data'] | null,
    comparison: 'major.minor series; Unity 6000.N is marketed as 6.N. This is not exact Godot import verification.',
    effects: options.probe ? 'May invoke one selected Godot/Unity editor version command. No project writes or configured build/test command execution by this helper; the selected executable may have side effects.' : 'Static reads only; no process is launched.' };
  const configRead = await readProject(root, 'project.yaml');
  if (configRead.state === 'missing') { add('engine', 'NOT_CHECKED', null, null, ['project.yaml'], 'No project.yaml'); return result; }
  if (configRead.content === null) throw new StudioError('INVALID_CONFIG', configRead.reason!, 1);
  let config: Record<string, Json>;
  try { config = record(parseConfig(configRead.content, 'project.yaml').toJS({ maxAliasCount: 50 }))!; if (!config) throw new Error('Expected a mapping'); }
  catch (error) { throw new StudioError('INVALID_CONFIG', (error as Error).message, 1); }
  const engine = record(config.engine) ?? {}; const name = typeof engine.name === 'string' ? engine.name.toLowerCase() : '';
  if (!Object.hasOwn(engines, name)) { add('engine', 'NOT_CHECKED', engine.name ?? null, null, ['project.yaml:engine.name'], 'Engine is missing or unsupported'); return result; }
  const declared = engine.version ?? null;
  const settings: Record<string, Setting> = Object.fromEntries(['name', 'code_root', 'test_root'].map(key => [`engine.${key}`, { value: key === 'name' ? engines[name]! : engine[key] ?? null, source: engine[key] === undefined ? 'unset' : 'project.yaml' }]));
  const layout = await resolveEngineRow(root, settings) as Record<string, Json>;
  const declaredCommand = async (kind: 'build' | 'test') => {
    const value = record(config.commands)?.[kind];
    if (value === undefined || value === null || typeof value === 'string' && !value.trim()) return { command: null, source: `project.yaml:commands.${kind}`, reason: 'No declared command; engine-table examples are not configured commands' };
    return resolveCommand(root, kind);
  };
  if (config.commands !== undefined && config.commands !== null && !record(config.commands)) throw new StudioError('INVALID_CONFIG', 'commands must be a mapping', 1);
  const commands = { build: await declaredCommand('build'), test: await declaredCommand('test') };
  if (name === 'web') result.web = (await detectWeb(root)).data;
  const verfile = `docs/engine-reference/${name}/VERSION.md`, reference = await readProject(root, verfile);
  if (reference.content === null) {
    add('reference-installed-record', 'NOT_CHECKED', null, reference.state, [verfile], reference.reason!);
    add('reference-series', 'NOT_CHECKED', declared, null, [verfile], reference.reason!);
  } else {
    const installed = tableValues(reference.content, 'Installed at pin time');
    const value = installed[0] ?? null;
    add('reference-installed-record', installed.length > 1 ? 'NOT_CHECKED' : !value ? 'DIFFERS' : /NOT DETERMINED|^PER PROJECT/.test(value!) ? 'NOT_CHECKED' : 'MATCH', null, value, [verfile],
      installed.length > 1 ? 'Duplicate Installed at pin time rows' : !value ? 'Installed at pin time row was not recorded or is empty' : /NOT DETERMINED|^PER PROJECT/.test(value!) ? 'Recorded probe is unresolved or per project' : 'Recorded installed-version text is present; this is not proof of a current installed match');
    let pinned = tableValues(reference.content, 'Engine Version');
    if (name === 'web' && !pinned.length) pinned = tableValues(reference.content, 'vite', true);
    const webPackage = result.web && 'bundlers' in result.web ? result.web.bundlers?.[0]?.package : null;
    const want = series(declared), got = series(pinned[0], true);
    const reason = name === 'web' && webPackage !== 'vite' ? 'The Web reference template pin is not the detected project bundler (or no bundler was detected)'
      : pinned.length !== 1 ? 'Exactly one Engine Version (or Web vite) row is required' : !want || !got ? 'Declared or reference version has no determinate major.minor series' : null;
    add('reference-series', reason ? 'NOT_CHECKED' : want === got ? 'MATCH' : 'DIFFERS', declared, pinned[0] ?? null, ['project.yaml:engine.version', verfile], reason ?? 'Compared declared and reference major.minor series');
  }

  const tokens = commands.test.command ? words(commands.test.command) : null;
  const commandEditor = commands.test.source.startsWith('project.yaml:') && editorWord(name, tokens?.[0]) ? tokens![0]! : null;
  const configured = engine.path;
  let installedVersion: string | null = null, installedReason = '', installedSource = '';
  if (name === 'web') {
    const web = result.web!;
    const version = 'engineVersion' in web ? web.engineVersion : null;
    if (version?.source?.startsWith('node_modules/')) { installedVersion = version.value; installedSource = version.source; }
    else installedReason = 'No exact installed bundler version was observed; declarations/ranges are not installed evidence';
  } else {
    if (configured !== undefined && configured !== null && (typeof configured !== 'string' || !configured.trim() || /[\0\r\n]/.test(configured))) installedReason = 'engine.path is malformed; no alternate target selected';
    const explicit: Candidate[] = [];
    const locateEditor = (value: string, source: string): Promise<Candidate> =>
      name === 'unity' && !value.includes('/') && !value.includes('\\')
        ? Promise.resolve({ value, source, path: null, reason: 'Bare Unity on PATH may be the separate CLI; supply the actual editor path' })
        : locate(root, value, source);
    if (!installedReason && typeof configured === 'string') explicit.push(await locateEditor(name === 'unreal' && !isAbsolute(configured) && !configured.includes('/') && !configured.includes('\\') ? `./${configured}` : configured, 'project.yaml:engine.path'));
    if (commandEditor) explicit.push(await locateEditor(commandEditor, commands.test.source));
    const engineRoot = (path: string) => { const normalized = path.replace(/\\/g, '/'); const marker = normalized.lastIndexOf('/Engine/'); return marker >= 0 ? normalized.slice(0, marker) : normalized.endsWith('/Engine') ? normalized.slice(0, -7) : normalized; };
    if (!installedReason && explicit.length === 2) {
      const identities = explicit.map(c => name === 'unreal' ? engineRoot(c.path ?? c.value) : c.path ?? c.value);
      if (identities[0] !== identities[1]) installedReason = 'commands.test and engine.path identify different targets; resolve the conflict before probing';
    }
    result.candidates.push(...explicit);
    if (!installedReason && !explicit.length) {
      if (name === 'godot') result.candidates.push(await locate(root, 'godot', 'PATH:godot'));
      if (name === 'unity') {
        if (typeof declared === 'string' && /^[0-9][A-Za-z0-9._+-]*$/.test(declared)) {
          const value = process.platform === 'darwin' ? `/Applications/Unity/Hub/Editor/${declared}/Unity.app/Contents/MacOS/Unity` : process.platform === 'win32' ? `C:/Program Files/Unity/Hub/Editor/${declared}/Editor/Unity.exe` : join(homedir(), 'Unity/Hub/Editor', declared, 'Editor/Unity');
          result.candidates.push(await locate(root, value, 'Unity Hub exact declared-version location'));
        } else installedReason = 'No explicit Unity editor or exact-version Hub path; bare Unity on PATH is not assumed to be the editor';
      }
      if (name === 'unreal') {
        const projects: string[] = []; const directory = await opendir(root); let rootEntries = 0;
        for await (const entry of directory) {
          if (++rootEntries > 20000) { installedReason = 'Root enumeration exceeds 20000 entries; engine association is unresolved'; break; }
          if (!entry.name.startsWith('.') && entry.name.endsWith('.uproject') && entry.isFile()) projects.push(entry.name);
        }
        if (!installedReason && projects.length === 1) {
          const project = await readProject(root, projects[0]!);
          try {
            const association = project.content === null ? null : record(JSON.parse(project.content))?.EngineAssociation;
            if (typeof association === 'string' && /^\d+\.\d+(?:\.\d+)?$/.test(association) && process.platform !== 'linux') {
              result.candidates.push(await locate(root, process.platform === 'darwin' ? `/Users/Shared/Epic Games/UE_${association}` : `C:/Program Files/Epic Games/UE_${association}`, `${projects[0]}:EngineAssociation launcher location`));
            }
          } catch { installedReason = `${projects[0]} is not readable valid JSON`; }
        } else if (projects.length > 1) installedReason = 'Multiple .uproject files; engine association is ambiguous';
        if (!result.candidates.length && !installedReason) result.candidates.push(await locate(root, 'UnrealEditor-Cmd', 'PATH:UnrealEditor-Cmd (metadata lookup only)'));
      }
    }
    const selected = result.candidates.find(c => c.path) ?? result.candidates[0];
    if (!installedReason && selected) {
      installedSource = selected.source;
      if (!selected.path) installedReason = selected.reason ?? 'Target could not be resolved';
      else if (name === 'unreal') {
        const base = engineRoot(selected.path); let version: Reading;
        try { version = await readBounded(await safePath(base, 'Engine/Build/Build.version')); }
        catch (error) { version = { path: join(base, 'Engine/Build/Build.version'), state: 'unavailable', content: null, reason: (error as Error).message }; }
        installedSource = version.path;
        try {
          const data = version.content === null ? null : record(JSON.parse(version.content));
          if (data && ['MajorVersion', 'MinorVersion'].every(k => Number.isSafeInteger(data[k]) && Number(data[k]) >= 0) && (data.PatchVersion === undefined || Number.isSafeInteger(data.PatchVersion) && Number(data.PatchVersion) >= 0)) installedVersion = `${data.MajorVersion}.${data.MinorVersion}${data.PatchVersion === undefined ? '' : `.${data.PatchVersion}`}`;
          else installedReason = version.reason ?? 'Build.version requires nonnegative integer MajorVersion/MinorVersion and an optional nonnegative integer PatchVersion';
        } catch { installedReason = 'Build.version is malformed JSON'; }
      } else if (!options.probe) installedReason = 'Version process not authorized by this invocation; pass --probe when process execution is authorized';
      else if (!(await lstat(selected.path)).isFile()) installedReason = 'Selected editor path is not a regular file';
      else if (name === 'unity' && !editorWord('unity', selected.path)) installedReason = 'Selected Unity target is not an editor named Unity or Unity.exe';
      else {
        const args = [name === 'unity' ? '-version' : '--version'];
        try {
          const ran = await runProcess(selected.path, args, { cwd: root, timeoutMs }); probes.push({ source: selected.source, executable: selected.path, args, ...ran });
          const line = ran.stdout.trim().split(/\r?\n/)[0] ?? '';
          if (ran.exitCode !== 0) installedReason = `Version probe exited ${ran.exitCode}${ran.signal ? ` (${ran.signal})` : ''}`;
          else if (!/^\d+\.\d+(?:\.|\b)/.test(line)) installedReason = 'Version probe did not return a recognized editor version line';
          else installedVersion = line;
        } catch (error) {
          installedReason = (error as Error).message; probes.push({ source: selected.source, executable: selected.path, args, exitCode: null, signal: null, stdout: '', stderr: installedReason });
        }
      }
    }
    if (!selected && !installedReason) installedReason = 'No editor metadata target was found; absence is not proof of no installed engine';
  }
  const want = series(declared), got = series(installedVersion);
  if (!installedReason && (!want || !got)) installedReason = 'Declared or installed version has no determinate major.minor series';
  add('installed-series', installedReason ? 'NOT_CHECKED' : want === got ? 'MATCH' : 'DIFFERS', declared, installedVersion,
    ['project.yaml:engine.version', installedSource].filter(Boolean), installedReason || 'Compared installed and declared major.minor series, not exact patch/import acceptance');

  if (name === 'godot') {
    const project = await readProject(root, 'project.godot'); const data = ini(project.content ?? '');
    const renderer = data.get('rendering/renderer/rendering_method') ?? [];
    const renderMap: Record<string, string> = { Compatibility: 'gl_compatibility', compatibility: 'gl_compatibility', 'GL Compatibility': 'gl_compatibility', 'Forward+': 'forward_plus', forward_plus: 'forward_plus', 'Forward Plus': 'forward_plus', Mobile: 'mobile', mobile: 'mobile' };
    const expected = typeof engine.rendering === 'string' ? renderMap[engine.rendering] : null;
    add('godot-renderer', project.content === null || renderer.length !== 1 || renderer[0] === null || !expected ? 'NOT_CHECKED' : expected === renderer[0] ? 'MATCH' : 'DIFFERS', engine.rendering ?? null, renderer[0] ?? null, ['project.yaml:engine.rendering', 'project.godot'],
      project.content === null ? project.reason! : renderer.length !== 1 || renderer[0] === null ? 'No unique valid explicit rendering method; engine defaults are not guessed' : !expected ? 'Missing or unmapped renderer declaration' : 'Compared explicit rendering method');
    result.shape = await shape(root, layout);
    const physics = typeof engine.physics === 'string' ? engine.physics : '';
    const jolt = /jolt/i.test(physics); const dimension = jolt || /3D/i.test(physics) ? '3d' : /2D/i.test(physics) ? '2d' : null;
    const backend = dimension ? data.get(`physics/${dimension}/physics_engine`) ?? [] : [];
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^jolt$/, 'joltphysics');
    let state: State = 'NOT_CHECKED', reason = !physics ? 'No declared physics backend' : !result.shape.complete ? 'Code-root scan is incomplete; no absence or backend match inferred' : 'No unique explicit backend for the declared dimension; engine defaults are not guessed';
    if (project.content !== null && result.shape.complete && jolt && result.shape.twoD.length && !result.shape.threeD.length) { state = 'DIFFERS'; reason = 'Observed declared nodes are 2D-only while Jolt is a 3D backend; resolve the declaration against game scope'; }
    else if (project.content !== null && result.shape.complete && dimension && backend.length === 1 && backend[0] !== null) { state = normalize(physics) === normalize(backend[0]!) ? 'MATCH' : 'DIFFERS'; reason = `Compared explicit ${dimension} backend; other dimensions and runtime-created nodes are not inferred`; }
    add('godot-physics', state, engine.physics ?? null, { dimension, explicitBackend: backend, shape: result.shape }, ['project.yaml:engine.physics', 'project.godot', String(record(layout.code_root)?.value ?? '')], project.content === null ? project.reason! : reason);
  } else add('project-file', 'NOT_CHECKED', name, null, [], 'Rendering/physics project-file comparison is implemented for Godot only');

  const buildWords = commands.build.command ? words(commands.build.command) : null;
  const exportIndex = buildWords?.findIndex(w => /^--export-(debug|release|pack)$/.test(w)) ?? -1;
  if (exportIndex >= 0) {
    const preset = buildWords![exportIndex + 1] ?? null, file = await readProject(root, 'export_presets.cfg');
    const names = [...ini(file.content ?? '')].filter(([key]) => /^preset\.\d+\/name$/.test(key)).flatMap(([, values]) => values);
    const matches = names.filter(v => v === preset).length;
    add('export-preset', file.state === 'unavailable' || !preset || names.includes(null) ? 'NOT_CHECKED' : file.state === 'missing' || !matches ? 'DIFFERS' : matches === 1 ? 'MATCH' : 'NOT_CHECKED', preset, names, [commands.build.source, 'export_presets.cfg'],
      file.content === null ? file.reason! : !preset ? 'Export flag lacks a literal preset name' : names.includes(null) ? 'Malformed preset name entry; uniqueness cannot be established' : matches > 1 ? 'Duplicate preset names are ambiguous' : matches ? 'Named export preset exists; export/build execution is not assessed' : 'Named export preset is absent');
  } else add('export-preset', 'NOT_CHECKED', commands.build.command, null, [commands.build.source], commands.build.reason ?? (!buildWords ? 'Build command is absent or not statically tokenizable' : 'No literal export preset argument'));
  const runners = tokens?.filter(w => /\.(gd|cs|py|sh)$/.test(w)) ?? [];
  if (!runners.length) add('test-runner', 'NOT_CHECKED', commands.test.command, null, [commands.test.source], commands.test.reason ?? 'No literal supported script runner reference; no command or wrapper was evaluated');
  for (const runner of [...new Set(runners)]) {
    const relative = runner.replace(/^res:\/\//, '').replace(/^\.\//, '');
    const file = await readProject(root, relative);
    add('test-runner', file.state === 'read' ? 'MATCH' : file.state === 'missing' ? 'DIFFERS' : 'NOT_CHECKED', runner, file.state, [commands.test.source, relative], file.state === 'read' ? 'Referenced runner file exists; tests were not executed' : `${file.reason}${relative.startsWith('addons/gdUnit4/') ? '; gdUnit4 may still need its separate test-setup step; do not rewrite the command to hide this' : ''}`);
  }
  return result;
}

export function formatProjectCoherence(result: Awaited<ReturnType<typeof inspectProjectCoherence>>): string {
  const clean = (s: string) => s.replace(/[\r\n\t]/g, ' ');
  return ['=== project coherence ===', ...result.observations.map(o => `[${o.state === 'NOT_CHECKED' ? 'NOT CHECKED' : o.state}] ${o.check} — ${clean(o.reason)}; declared=${JSON.stringify(o.declared)}; observed=${JSON.stringify(o.observed)}`), '',
    `checked ${result.observations.filter(o => o.state !== 'NOT_CHECKED').length} · differs ${result.observations.filter(o => o.state === 'DIFFERS').length} · not checked ${result.observations.filter(o => o.state === 'NOT_CHECKED').length}`, '',
    'Observations only — no verdict. Not checked is not agreement.'].join('\n') + '\n';
}
