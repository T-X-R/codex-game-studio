import { lstat, readFile, readdir } from 'node:fs/promises';
import { parseDocument } from 'yaml';
import { StudioError } from './contract.js';
import { safePath } from './files.js';
import { resourcePath } from './resources.js';

interface MatchSpec { glob: string; pattern?: string }
interface Artifact { glob?: string; pattern?: string; min_count?: number; any_of?: MatchSpec[]; note?: string }
interface Step { id: string; name?: string; command?: string; required?: boolean; repeatable?: boolean; artifact?: Artifact }
interface Group { steps: Step[] }
interface Catalog { phases: Record<string, Group>; paths?: Record<string, Group> }
type Observation = { status: 'PRESENT' | 'ABSENT' | 'SHORT' | 'PATTERN_MISS' | 'NO_CHECK' | 'UNKNOWN';
  check: 'glob' | 'any_of' | 'none'; details: Record<string, unknown> };
const mapping = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

function patternRegex(pattern: string) {
  // The catalog uses POSIX space, escaped literals and ordinary ERE operators.
  // Match one line at a time, as grep -E does; do not let whitespace span lines.
  const translated = pattern.replaceAll('[[:space:]]', '[\\t\\v\\f\\r ]');
  if (/\[:[a-z]+:\]/i.test(translated)) throw new Error('Unsupported POSIX character class');
  return new RegExp(translated);
}

function validateMatch(spec: Record<string, unknown>) {
  const glob = spec.glob;
  if (typeof glob !== 'string' || !glob || glob.includes('\\') || glob.includes(':') ||
      glob.split('/').some(part => !part || part === '.' || part === '..') ||
      glob.includes('**') || ['?', '[', ']', '{', '}'].some(char => glob.includes(char))) {
    throw new Error('Expected a safe relative catalog glob with literal segments or * wildcards');
  }
  if (spec.pattern !== undefined) {
    if (typeof spec.pattern !== 'string' || !spec.pattern) throw new Error('Artifact pattern must be a nonempty string');
    patternRegex(spec.pattern);
  }
}

async function loadCatalog(path: string): Promise<Catalog> {
  try {
    const document = parseDocument(await readFile(path, 'utf8'), { uniqueKeys: true });
    if (document.errors.length) throw new Error(document.errors[0]!.message);
    const value: unknown = document.toJS({ maxAliasCount: 20 });
    if (!mapping(value) || !mapping(value.phases) || !Object.keys(value.phases).length) throw new Error('Catalog needs nonempty phases');
    for (const section of [value.phases, value.paths ?? {}]) {
      if (!mapping(section)) throw new Error('Catalog phases and paths must be mappings');
      for (const [id, group] of Object.entries(section)) {
        if (!/^[a-z0-9-]+$/.test(id) || !mapping(group) || !Array.isArray(group.steps) || !group.steps.length) throw new Error(`Invalid or empty group: ${id}`);
        const ids = new Set<string>();
        for (const step of group.steps) {
          if (!mapping(step) || typeof step.id !== 'string' || !/^[a-z0-9-]+$/.test(step.id) || ids.has(step.id)) throw new Error(`Invalid or duplicate step in ${id}`);
          ids.add(step.id);
          for (const key of ['required', 'repeatable']) if (step[key] !== undefined && typeof step[key] !== 'boolean') throw new Error(`Invalid ${key} in ${id}.${step.id}`);
          for (const key of ['name', 'command']) if (step[key] !== undefined && typeof step[key] !== 'string') throw new Error(`Invalid ${key} in ${id}.${step.id}`);
          const art = step.artifact;
          if (art === undefined) continue;
          if (!mapping(art)) throw new Error(`Invalid artifact in ${id}.${step.id}`);
          if (art.note !== undefined && typeof art.note !== 'string') throw new Error('Artifact note must be a string');
          if (art.min_count !== undefined && (typeof art.min_count !== 'number' || !Number.isSafeInteger(art.min_count) || art.min_count < 1)) throw new Error('Artifact min_count must be a positive integer');
          if (art.any_of !== undefined) {
            if (!Array.isArray(art.any_of) || !art.any_of.length || art.glob !== undefined || art.pattern !== undefined || art.min_count !== undefined) throw new Error('Invalid artifact alternatives');
            for (const alt of art.any_of) {
              if (!mapping(alt)) throw new Error('Invalid artifact alternative');
              validateMatch(alt);
            }
          } else if (art.glob !== undefined) validateMatch(art);
          else if (art.pattern !== undefined || art.min_count !== undefined) throw new Error('Artifact pattern/count requires a glob');
        }
      }
    }
    return value as unknown as Catalog;
  } catch (error) {
    throw new StudioError('INVALID_CATALOG', `Cannot assess artifact catalog ${path}: ${(error as Error).message}`, 3);
  }
}

async function matchFiles(root: string, glob: string) {
  const parts = glob.split('/'), files: string[] = [];
  async function visit(prefix: string, index: number): Promise<void> {
    const part = parts[index]!;
    let names = [part];
    if (part.includes('*')) {
      const directory = prefix ? await safePath(root, prefix) : root;
      const matcher = new RegExp(`^${part.split('*').map(text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
      try { names = (await readdir(directory)).filter(name => (part.startsWith('.') || !name.startsWith('.')) && matcher.test(name)).sort(); }
      catch (error) { if (['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) return; throw error; }
    }
    for (const name of names) {
      const relative = prefix ? `${prefix}/${name}` : name;
      const path = await safePath(root, relative);
      let stat;
      try { stat = await lstat(path); }
      catch (error) { if (['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) continue; throw error; }
      if (index === parts.length - 1) { if (stat.isFile()) files.push(relative); }
      else if (stat.isDirectory()) await visit(relative, index + 1);
    }
  }
  await visit('', 0);
  return files.sort();
}

async function matches(root: string, spec: MatchSpec) {
  const files = await matchFiles(root, spec.glob);
  if (!spec.pattern) return { files, hits: files };
  const regex = patternRegex(spec.pattern), hits: string[] = [];
  for (const file of files) {
    const text = await readFile(await safePath(root, file), 'utf8');
    if (text.split('\n').some(line => regex.test(line))) hits.push(file);
  }
  return { files, hits };
}

async function observe(root: string, art?: Artifact): Promise<Observation> {
  const check = art?.any_of ? 'any_of' : art?.glob ? 'glob' : 'none';
  try {
    if (art?.any_of) {
      for (const [index, alternative] of art.any_of.entries()) {
        const { hits } = await matches(root, alternative);
        if (hits.length) return { status: 'PRESENT', check, details: { alternative: index + 1, glob: alternative.glob, files: hits } };
      }
      return { status: 'ABSENT', check, details: { alternatives: art.any_of.length } };
    }
    if (!art?.glob) return { status: 'NO_CHECK', check, details: art?.note ? { note: art.note } : {} };
    const { files, hits } = await matches(root, { glob: art.glob, pattern: art.pattern });
    const minimum = art.min_count ?? 1;
    const status = !files.length ? 'ABSENT' : art.pattern && !hits.length ? 'PATTERN_MISS' : hits.length < minimum ? 'SHORT' : 'PRESENT';
    return { status, check, details: { glob: art.glob, files, matches: hits, count: hits.length, minimum, ...(art.note ? { note: art.note } : {}) } };
  } catch (error) {
    if (error instanceof StudioError) throw error;
    return { status: 'UNKNOWN', check, details: { reason: (error as Error).message } };
  }
}

export async function inspectArtifacts(root: string, filters: { phase?: string; path?: string } = {}, catalogFile?: string) {
  if (filters.phase !== undefined && filters.path !== undefined) throw new StudioError('INVALID_ARGUMENT', '--phase and --path are exclusive');
  const catalog = catalogFile ?? await resourcePath('studio/docs/workflow-catalog.yaml');
  const content = await loadCatalog(catalog);
  const selection = filters.path === undefined ? 'phases' : 'paths';
  const filter = filters.path ?? filters.phase;
  const selected = Object.entries(content[selection] ?? {}).filter(([id]) => filter === undefined || id === filter);
  if (!selected.length) throw new StudioError('INVALID_ARGUMENT', `Unknown ${selection === 'paths' ? 'path' : 'phase'}: ${filter}`);
  const groups = [];
  const counts = { groups: selected.length, steps: 0, noCheck: 0, unknown: 0 };
  for (const [id, group] of selected) {
    const steps = [];
    for (const step of group.steps) {
      const observation = await observe(root, step.artifact);
      steps.push({ id: step.id, name: step.name ?? step.id, command: step.command ?? null,
        required: step.required ?? false, repeatable: step.repeatable ?? false, ...observation });
      counts.steps++;
      if (observation.status === 'NO_CHECK') counts.noCheck++;
      if (observation.status === 'UNKNOWN') counts.unknown++;
    }
    groups.push({ id, steps });
  }
  return { project: root, catalog, scope: 'workflow-artifacts', qualityAssessed: false, selection, counts, groups };
}
