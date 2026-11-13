import { enums, parseConfig, type Json, type Setting } from './config.js';
import { planConfigSetMany } from './config-write.js';
import { StudioError } from './contract.js';
import { resolveEngineRow } from './engine.js';
import { deriveSetting } from './config-derived.js';
import { parseMdSections } from './md-section.js';
import { canonicalRoot, readText, safePath } from './files.js';

const fields: Record<string, string[]> = {
  engine: ['name', 'path', 'version', 'language', 'rendering', 'physics', 'code_root', 'test_root'],
  specialists: ['primary', 'code', 'shader', 'ui', 'additional'],
  naming: ['classes', 'variables', 'constants', 'signals', 'files', 'scenes'],
  commands: ['run', 'build', 'test', 'smoke'],
  platform: ['targets', 'primary_input', 'gamepad_support', 'touch_support'],
  performance: ['target_framerate', 'frame_budget_ms', 'draw_call_limit', 'memory_ceiling_mb'],
  testing: ['framework'],
  qa: ['coverage_minimum'],
};
const labels: Record<string, string> = {
  'engine.path': 'Engine Path', 'engine.language': 'Language', 'engine.rendering': 'Rendering', 'engine.physics': 'Physics',
  'specialists.primary': 'Primary', 'specialists.code': 'Language/Code Specialist',
  'specialists.shader': 'Shader Specialist', 'specialists.ui': 'UI Specialist', 'specialists.additional': 'Additional Specialists',
  'naming.classes': 'Classes', 'naming.variables': 'Variables', 'naming.constants': 'Constants',
  'naming.signals': 'Signals/Events', 'naming.files': 'Files', 'naming.scenes': 'Scenes/Prefabs',
  'platform.targets': 'Target Platforms', 'platform.primary_input': 'Primary Input',
  'platform.gamepad_support': 'Gamepad Support', 'platform.touch_support': 'Touch Support',
  'performance.target_framerate': 'Target Framerate', 'performance.frame_budget_ms': 'Frame Budget',
  'performance.draw_call_limit': 'Draw Calls', 'performance.memory_ceiling_mb': 'Memory Ceiling',
  'testing.framework': 'Framework', 'qa.coverage_minimum': 'Minimum Coverage',
};
function object(value: Json | undefined, key: string): Record<string, Json> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new StudioError('INVALID_ARGUMENT', `${key} requires a mapping`);
  return value;
}
function text(value: Json | undefined, key: string, multiline = false): string {
  if (typeof value !== 'string' || !value.trim() || value === 'null' || value.includes('\0') || (!multiline && /[\r\n]/.test(value))) {
    throw new StudioError('INVALID_ARGUMENT', `${key} requires a nonempty ${multiline ? '' : 'single-line '}string; quote versions in YAML`);
  }
  return value;
}
function edits(input: string): [string, string][] {
  const data = (parseConfig(input, 'engine setup input').toJS({ maxAliasCount: 50 }) ?? {}) as Record<string, Json>;
  const engine = object(data.engine, 'engine');
  for (const key of ['name', 'language']) text(engine[key], `engine.${key}`);
  if (!enums['engine.name']!.includes(engine.name as string)) throw new StudioError('INVALID_ARGUMENT', 'engine.name must be Godot, Unity, Unreal or Web');
  const unversionedWeb = engine.name === 'Web' && engine.version === null;
  if (!unversionedWeb) text(engine.version, 'engine.version');
  if (!unversionedWeb && (!/^\d[0-9A-Za-z.+_-]*$/.test(engine.version as string) || /(?:^|[.-])[xX](?:$|[.-])/.test(engine.version as string))) {
    throw new StudioError('INVALID_ARGUMENT', 'engine.version must record an explicit version, not latest, a range or a placeholder');
  }
  const entries: [string, string][] = [];
  const append = (key: string, value: Json, multiline = false) => entries.push([key, value === null ? 'null' : text(value, key, multiline)]);
  for (const [block, blockValue] of Object.entries(data)) {
    if (!Object.hasOwn(fields, block)) throw new StudioError('INVALID_ARGUMENT', `Unknown engine setup block: ${block}`);
    for (const [field, value] of Object.entries(object(blockValue, block))) {
      const key = `${block}.${field}`;
      if (!fields[block]!.includes(field)) throw new StudioError('INVALID_ARGUMENT', `Unknown engine setup field: ${key}`);
      if ((key === 'specialists.additional' || key === 'platform.targets') && value !== null) {
        if (!Array.isArray(value)) throw new StudioError('INVALID_ARGUMENT', `${key} requires an array of names`);
        value.forEach(item => text(item, key));
        entries.push([key, JSON.stringify(value)]);
      } else if (block === 'commands' && value !== null && typeof value === 'object') {
        const commands = object(value, key);
        if (!Object.keys(commands).length) throw new StudioError('INVALID_ARGUMENT', `${key} requires at least one OS command`);
        for (const [os, command] of Object.entries(commands)) {
          if (!['windows', 'macos', 'linux', 'default'].includes(os)) throw new StudioError('INVALID_ARGUMENT', `Unknown command OS: ${os}`);
          append(`${key}.${os}`, command, true);
        }
      } else if ((block === 'performance' || key === 'qa.coverage_minimum') && value !== null) {
        if (typeof value !== 'number' || !Number.isFinite(value)) throw new StudioError('INVALID_ARGUMENT', `${key} requires a number or null`);
        entries.push([key, String(value)]);
      } else {
        if (['platform.gamepad_support', 'platform.touch_support'].includes(key) && value !== null &&
            (typeof value !== 'string' || !/^(Full|Partial|None)$/i.test(value))) throw new StudioError('INVALID_ARGUMENT', `${key} requires Full, Partial, None or null`);
        append(key, value, block === 'commands');
      }
    }
  }
  return entries;
}

const mirrorSections: Record<string, string[]> = {
  'Engine & Language': ['Engine', 'Engine Path', 'Language', 'Rendering', 'Physics'],
  'Naming Conventions': ['Classes', 'Variables', 'Constants', 'Signals/Events', 'Files', 'Scenes/Prefabs'],
  'Engine Specialists': ['Primary', 'Language/Code Specialist', 'Shader Specialist', 'UI Specialist', 'Additional Specialists'],
  'Input & Platform': ['Target Platforms', 'Input Methods', 'Primary Input', 'Gamepad Support', 'Touch Support'],
  'Performance Budgets': ['Target Framerate', 'Frame Budget', 'Draw Calls', 'Memory Ceiling'],
  Testing: ['Framework', 'Minimum Coverage'],
};
function mirror(content: string, values: Map<string, string>, previousEngine: unknown, previousLanguage: unknown, engine: unknown): string {
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  // Keep original line endings/BOM; the parser supplies visibility and hierarchy only.
  const parsed = parseMdSections(content.replace(/^\uFEFF/, ''));
  const lines = content.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const sections = new Map<string, ReturnType<typeof parseMdSections>['headings'][number]>();
  for (const title of Object.keys(mirrorSections)) {
    const matches = parsed.find(`## ${title}`);
    if (matches.length > 1) throw new StudioError('FILE_CONFLICT', `Duplicate technical preference section: ${title}`, 4);
    if (matches[0]) sections.set(title, matches[0]);
  }
  const found = new Set<string>();
  const changedLanguage = previousEngine !== engine || previousLanguage !== values.get('Language');
  for (const [index, line] of lines.entries()) {
    if (!parsed.prose[index]) continue;
    const match = line.match(/^(\uFEFF? {0,3}(?:[-*][ \t]*)?\*\*([^*]+)\*\*:[ \t]*)([^\r\n]*)(\r?\n)?$/);
    if (!match || !values.has(match[2]!)) continue;
    const label = match[2]!;
    const owner = parsed.headings.filter(h => h.first <= index + 1 && h.last >= index + 1).at(-1);
    const expected = Object.entries(mirrorSections).find(([, labels]) => labels.includes(label))![0];
    if (owner && owner.level >= 2 && owner !== sections.get(expected)) continue;
    if (found.has(label)) throw new StudioError('FILE_CONFLICT', `Duplicate technical preference label: ${label}`, 4);
    found.add(label);
    let value = values.get(label)!;
    let approved = match[3]!, comment = '';
    const commentStart = parsed.commentStarts[index];
    if (commentStart != null) {
      const start = commentStart + (index === 0 && content.startsWith('\uFEFF') ? 1 : 0);
      const beforeComment = line.slice(0, start).replace(/^\uFEFF/, '');
      if (parsed.visible[index]!.trimEnd() !== beforeComment.trimEnd()) {
        throw new StudioError('FILE_CONFLICT', `Reconcile interleaved comment and value text at technical preference label: ${label}`, 4);
      }
      approved = line.slice(match[1]!.length, start).trimEnd();
      comment = match[3]!.slice(approved.length);
    }
    if (label === 'Language') {
      const both = /^(?:Both\b|GDScript\s*\([^)]*\)\s*,\s*C#\s*\(|GDScript\s*\+\s*C#(?=$|\s|[,;(]))/i.test(approved);
      if (both && (changedLanguage || engine !== 'Godot' || value !== 'GDScript')) {
        throw new StudioError('FILE_CONFLICT', 'The approved Both language choice needs explicit rich-language reconciliation before changing engine or primary language.', 4);
      }
      if (!changedLanguage && (both || approved.startsWith(`${value} (`))) value = approved;
    }
    lines[index] = match[1] + value + comment + (match[4] ?? '');
  }
  if (changedLanguage) {
    for (const title of ['Engine & Language', 'Naming Conventions', 'Engine Specialists']) {
      const parent = sections.get(title);
      if (!parent) continue;
      const nested = parsed.headings.filter(h => h.level > 2 && h.first > parent.first && h.first <= parent.last);
      const populatedRouting = previousEngine !== engine && parsed.find('File Extension Routing')
        .filter(h => h.first > parent.first && h.first <= parent.last)
        .some(h => parsed.visible.slice(h.first, h.last).some((line, offset) => {
          if (!parsed.prose[h.first + offset] || !line.trimStart().startsWith('|')) return false;
          const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
          return cells.length >= 2 && !/^(?:Extension|File(?: Type| Extension)?|[-: ]+|\[.*\])$/i.test(cells[0]!) &&
            cells.slice(1).some(cell => !/^(?:[-: ]+|\[.*\])$/.test(cell));
        }));
      if (populatedRouting || nested.some(h => /(?:GDScript|C#|\.gd\b|\.cs\b|\.csproj\b)/i.test(h.title) ||
          parsed.lines.slice(h.first, h.last).some((line, offset) => parsed.prose[h.first + offset] && /(?:\.gd|\.cs|\.csproj)\b/.test(line)))) {
        throw new StudioError('FILE_CONFLICT', 'Existing per-file language rules need explicit reconciliation before changing engine or primary language.', 4);
      }
    }
  }
  const insertions = new Map<number, string>();
  for (const [title, labels] of Object.entries(mirrorSections)) {
    const missing = labels.filter(label => values.has(label) && !found.has(label));
    if (!missing.length) continue;
    const section = sections.get(title);
    const nested = section && parsed.headings.find(h => h.first > section.first && h.first <= section.last);
    const at = section ? nested ? nested.first - 1 : section.last : lines.length;
    const addition = (section ? '' : `## ${title}${newline}${newline}`) +
      missing.map(label => `- **${label}**: ${values.get(label)}`).join(newline) + newline + newline;
    insertions.set(at, (insertions.get(at) ?? '') + addition);
  }
  // Insert before existing nested contexts, without trimming/reformatting any retained bytes.
  let after = '';
  for (let index = 0; index <= lines.length; index++) {
    const addition = insertions.get(index);
    if (addition) after += (after.endsWith('\n') || !after ? '' : newline) + newline + addition;
    after += lines[index] ?? '';
  }
  return after;
}

export async function planEngineSetup(root: string, input: string) {
  const entries = edits(input);
  const project = await canonicalRoot(root);
  const configBefore = await readText(await safePath(project, 'project.yaml'));
  const { plan, warnings } = await planConfigSetMany(project, entries);
  const configChange = plan.changes.find(change => change.path === 'project.yaml');
  if (configChange && configChange.before !== configBefore) throw new StudioError('FILE_CONFLICT', 'project.yaml changed during engine setup planning', 4);
  const configAfter = configChange?.after ?? configBefore!;
  const document = parseConfig(configAfter, 'project.yaml');
  const config = document.toJS({ maxAliasCount: 50 }) as Record<string, Json>;
  const settings: Record<string, Setting> = {};
  for (const key of ['engine.name', 'engine.code_root', 'engine.test_root']) {
    settings[key] = { value: document.getIn(key.split('.')) as Json ?? null, source: 'project.yaml' };
  }
  const layout = await resolveEngineRow(project, settings, { allowMissing: true }) as Record<string, Json>;
  for (const key of ['code_root', 'test_root']) {
    const directory = layout[key] as Record<string, Json>;
    const unresolvedModule = document.getIn(['engine', 'name']) === 'Unreal' && key === 'test_root' &&
      document.getIn(['engine', key]) == null && directory.state === 'not_assessed';
    if (unresolvedModule) warnings.push(`test_root remains unresolved: ${directory.reason}; configure the actual Unreal module when known.`);
    else if (!['available', 'missing'].includes(directory.state as string)) throw new StudioError('INVALID_ARGUMENT', `engine.${key}: ${directory.reason}`);
    if (directory.state === 'missing') warnings.push(`${key} ${directory.value} has not been created; configure its scaffold before running engine operations.`);
  }
  const version = document.getIn(['engine', 'version']);
  const values = new Map<string, string>([['Engine', `${document.getIn(['engine', 'name'])}${version === null ? '' : ` ${version}`}`]]);
  for (const [key, label] of Object.entries(labels)) {
    const [block, field] = key.split('.');
    const value = (config[block!] as Record<string, Json> | undefined)?.[field!];
    if (value === undefined) continue;
    if ((key === 'specialists.additional' || key === 'platform.targets') && Array.isArray(value)) {
      value.forEach(item => text(item, key));
      values.set(label, value.length ? value.join(', ') : 'None');
    } else if ((key.startsWith('performance.') || key === 'qa.coverage_minimum') && value !== null) {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new StudioError('INVALID_ARGUMENT', `${key} requires a number or null`);
      values.set(label, String(value));
    } else values.set(label, value === null ? '[TO BE CONFIGURED]' : text(value, key));
  }
  if (config.platform !== undefined) {
    const platform = object(config.platform, 'platform');
    const inputSettings = Object.fromEntries(['targets', 'primary_input', 'gamepad_support', 'touch_support']
      .map(field => [`platform.${field}`, { value: platform[field] ?? null, source: 'project.yaml' }]));
    const methods = (await deriveSetting('input_methods', inputSettings, project, { project: config,
      preferences: { values: {}, source: 'unset', input: { methods: null, primary: null } } })).value as Record<string, Json>;
    const names: Record<string, string> = { 'keyboard/mouse': 'Keyboard/Mouse', gamepad: 'Gamepad', touch: 'Touch' };
    const selected = methods.methods as string[];
    values.set('Input Methods', selected.length ? selected.map(value => names[value] ?? value).join(', ') : '[TO BE CONFIGURED]');
  }
  const path = 'docs/technical-preferences.md';
  const before = await readText(await safePath(project, path));
  const legacy = before === null ? await readText(await safePath(project, '.claude/docs/technical-preferences.md')) : null;
  if (legacy !== null) warnings.push('Preserved the legacy technical preference document as migration input; review its retained notes for obsolete instructions.');
  const after = mirror(before ?? legacy ?? '# Technical Preferences\n\nProject configuration is recorded in `project.yaml`; this document mirrors its engine choices.\n', values, parseConfig(configBefore ?? '{}', 'project.yaml').getIn(['engine', 'name']),
    parseConfig(configBefore ?? '{}', 'project.yaml').getIn(['engine', 'language']), document.getIn(['engine', 'name']));
  // Guard both documents even when only one needs new bytes, so a concurrent edit
  // cannot leave the pair inconsistent. Neither file becomes installer-owned.
  if (configBefore !== configAfter || before !== after) {
    plan.changes = [{ path: 'project.yaml', before: configBefore, after: configAfter }, { path, before, after }];
  }
  return { plan, warnings, layout,
    execution: { state: 'not_assessed', reason: 'Configuration only: no editor, scaffold, command, build or test was executed.' } };
}
