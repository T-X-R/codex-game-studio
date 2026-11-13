import { lstat } from 'node:fs/promises';
import { enums, parseConfig, type Json } from './config.js';
import { StudioError } from './contract.js';
import { canonicalRoot, hash, readText, safePath } from './files.js';
import type { InstallPlan } from './install.js';
import { metadata } from './metadata.js';
import { parseMdSections } from './md-section.js';
import { resourceFiles } from './resources.js';

function pin(content: string | null, engine: string): string | null {
  const parsed = parseMdSections(content ?? '');
  let lines: string[];
  if (engine === 'Web') {
    const sections = parsed.headings.filter(h => h.level === 2 && h.title === 'Pinned versions');
    if (sections.length !== 1) return null;
    const section = sections[0]!;
    const next = parsed.headings.find(h => h.first > section.first);
    lines = parsed.visible.slice(section.first, next ? next.first - 1 : section.last);
    const cells = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|')
      ? line.trim().slice(1, -1).split(/(?<!\\)\|/).map(cell => cell.trim()) : [];
    const header = ['Package', 'Pinned', 'Published', 'First release of this major', 'Node'];
    const headers = lines.map((line, index) => ({ values: cells(line), index }))
      .filter(row => row.values.length === 5 && row.values.every((value, index) => value === header[index]));
    if (headers.length !== 1) return null;
    const start = headers[0]!.index + 1;
    const divider = cells(lines[start] ?? '');
    if (divider.length !== 5 || !divider.every(cell => /^:?-{3,}:?$/.test(cell))) return null;
    const rows: string[] = [];
    for (const line of lines.slice(start + 1)) {
      if (cells(line).length !== 5) break;
      rows.push(line);
    }
    lines = rows;
  } else {
    const firstSection = parsed.headings.find(h => h.level >= 2);
    lines = parsed.visible.slice(0, firstSection ? firstSection.first - 1 : undefined);
  }
  const pattern = engine === 'Web' ? /^\|\s*`vite`\s*\|\s*([^|]+)\|/
    : /^\|\s*\*\*Engine Version\*\*\s*\|\s*([^|]+)\|/;
  const matches = lines.map(line => pattern.exec(line)).filter(match => match !== null);
  return matches.length === 1 ? matches[0]![1]!.trim() || null : null;
}
function series(value: Json | undefined, engine: string) {
  if (typeof value !== 'string') return null;
  const literal = value.trim().replace(/^(?:Godot|Unity|Unreal(?: Engine)?|Vite)\s+/, '').replace(/ LTS$/, '');
  const match = /^(\d+)\.(\d+)(?:\.\d+)*(?:[abfp]\d+|[-+][0-9A-Za-z.-]+|\.(?:stable|dev|alpha|beta|rc)[0-9A-Za-z.-]*)?$/.exec(literal);
  if (!match) return null;
  return `${engine === 'Unity' && match[1] === '6000' ? '6' : match[1]}.${match[2]}`;
}
async function regularText(project: string, relative: string) {
  const path = await safePath(project, relative);
  try {
    if (!(await lstat(path)).isFile()) throw new StudioError('FILE_CONFLICT', `Expected a regular reference file: ${relative}`, 4);
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  return readText(path);
}

/** Initial project-owned snapshot copy only; refresh and upgrades remain sourced workflow decisions. */
export async function planEngineReferences(root: string) {
  const project = await canonicalRoot(root);
  const config = await regularText(project, 'project.yaml');
  if (config === null) throw new StudioError('INVALID_CONFIG', 'Configure engine.name in project.yaml before copying references');
  const document = parseConfig(config, 'project.yaml');
  const engine = document.getIn(['engine', 'name']);
  if (typeof engine !== 'string' || !enums['engine.name']!.includes(engine)) {
    throw new StudioError('INVALID_CONFIG', 'Choose a supported engine.name before copying references');
  }
  const projectPin = (document.toJS({ maxAliasCount: 50 }).engine?.version ?? null) as Json;
  const name = engine.toLowerCase();
  const resourcePrefix = `studio/engine-reference/${name}`;
  const targetPrefix = `docs/engine-reference/${name}`;
  const bundled = await resourceFiles(resourcePrefix);
  if (!Object.hasOwn(bundled, 'VERSION.md')) throw new StudioError('RESOURCE_MISSING', `Missing required ${resourcePrefix}/VERSION.md; nothing copied`, 3);
  const templatePin = pin(bundled['VERSION.md']!, engine);
  let present = false;
  try {
    const info = await lstat(await safePath(project, targetPrefix));
    if (!info.isDirectory()) throw new StudioError('FILE_CONFLICT', `Expected a reference directory: ${targetPrefix}`, 4);
    present = true;
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const projectReferencePin = pin(await regularText(project, `${targetPrefix}/VERSION.md`), engine);
  const configuredSeries = series(projectPin, engine), templateSeries = series(templatePin, engine);
  const seriesRelation = configuredSeries && templateSeries ? configuredSeries === templateSeries ? 'same_series' : 'different_series' : 'unknown';
  const warnings = ['Bundled references are historical upstream snapshots. Copying does not verify engine facts or measure the installed editor.'];
  if (seriesRelation !== 'same_series') warnings.push(`Project pin and bundled reference applicability is ${seriesRelation}; reconcile before declaring setup complete. No project pin is changed.`);
  if (engine === 'Web') warnings.push('The template pin describes bundled Vite only; inspect the actual project bundler and library versions separately.');
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  const files: { path: string; state: 'create' | 'identical' | 'preserved' | 'missing'; sourceHash: string; beforeHash: string | null }[] = [];
  for (const [relative, after] of Object.entries(bundled)) {
    const path = `${targetPrefix}/${relative}`, before = await regularText(project, path);
    files.push({ path, state: !present ? 'create' : before === null ? 'missing' : before === after ? 'identical' : 'preserved',
      sourceHash: hash(after), beforeHash: before === null ? null : hash(before) });
    if (!present) plan.changes.push({ path, before: null, after });
  }
  if (!present) {
    const readmePath = 'docs/engine-reference/README.md';
    const before = await regularText(project, readmePath);
    const after = (await resourceFiles('studio/engine-reference'))['README.md'];
    if (after === undefined) throw new StudioError('RESOURCE_MISSING', 'Missing bundled engine-reference README', 3);
    files.push({ path: readmePath, state: before === null ? 'create' : before === after ? 'identical' : 'preserved', sourceHash: hash(after), beforeHash: before === null ? null : hash(before) });
    plan.changes.unshift({ path: 'project.yaml', before: config, after: config });
    plan.changes.push({ path: readmePath, before, after: before ?? after });
  }
  const state = !present ? 'planned' : files.every(file => file.state === 'identical') ? 'already_present' : 'preserved';
  if (state === 'preserved') warnings.push('Existing reference directory preserved as a whole, including missing files. Inspect its version and research before any explicit update.');
  return { plan, engine, projectPin, reference: {resourcePrefix, targetPrefix, templatePin, projectReferencePin, seriesRelation},
    outcome: { state, reason: present ? 'Existing project references are never overwritten or supplemented by seeding.' : 'Complete selected-engine historical snapshot; project configuration retained.' },
    files, warnings, qualityAssessed: false, installedVersionAssessed: false };
}
