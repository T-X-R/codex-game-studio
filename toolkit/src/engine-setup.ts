import { enums, parseConfig, type Json, type Setting } from './config.js';
import { planConfigSetMany } from './config-write.js';
import { StudioError } from './contract.js';
import { resolveEngineRow } from './engine.js';
import { canonicalRoot, readText, safePath } from './files.js';

const fields: Record<string, string[]> = {
  engine: ['name', 'version', 'language', 'rendering', 'physics', 'code_root', 'test_root'],
  specialists: ['primary', 'code', 'shader', 'ui', 'additional'],
  naming: ['classes', 'variables', 'constants', 'signals', 'files', 'scenes'],
  commands: ['run', 'build', 'test', 'smoke'],
};
const labels: Record<string, string> = {
  'engine.language': 'Language', 'engine.rendering': 'Rendering', 'engine.physics': 'Physics',
  'specialists.primary': 'Primary', 'specialists.code': 'Language/Code Specialist',
  'specialists.shader': 'Shader Specialist', 'specialists.ui': 'UI Specialist', 'specialists.additional': 'Additional Specialists',
  'naming.classes': 'Classes', 'naming.variables': 'Variables', 'naming.constants': 'Constants',
  'naming.signals': 'Signals/Events', 'naming.files': 'Files', 'naming.scenes': 'Scenes/Prefabs',
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
  for (const key of ['name', 'version', 'language', 'code_root', 'test_root']) text(engine[key], `engine.${key}`);
  if (!enums['engine.name']!.includes(engine.name as string)) throw new StudioError('INVALID_ARGUMENT', 'engine.name must be Godot, Unity, Unreal or Web');
  if (!/^\d[0-9A-Za-z.+_-]*$/.test(engine.version as string) || /(?:^|[.-])[xX](?:$|[.-])/.test(engine.version as string)) {
    throw new StudioError('INVALID_ARGUMENT', 'engine.version must record an explicit version, not latest, a range or a placeholder');
  }
  const entries: [string, string][] = [];
  const append = (key: string, value: Json, multiline = false) => entries.push([key, value === null ? 'null' : text(value, key, multiline)]);
  for (const [block, blockValue] of Object.entries(data)) {
    if (!Object.hasOwn(fields, block)) throw new StudioError('INVALID_ARGUMENT', `Unknown engine setup block: ${block}`);
    for (const [field, value] of Object.entries(object(blockValue, block))) {
      const key = `${block}.${field}`;
      if (!fields[block]!.includes(field)) throw new StudioError('INVALID_ARGUMENT', `Unknown engine setup field: ${key}`);
      if (key === 'specialists.additional') {
        if (!Array.isArray(value)) throw new StudioError('INVALID_ARGUMENT', `${key} requires an array of specialist names`);
        value.forEach(item => text(item, key));
        entries.push([key, JSON.stringify(value)]);
      } else if (block === 'commands' && value !== null && typeof value === 'object') {
        const commands = object(value, key);
        if (!Object.keys(commands).length) throw new StudioError('INVALID_ARGUMENT', `${key} requires at least one OS command`);
        for (const [os, command] of Object.entries(commands)) {
          if (!['windows', 'macos', 'linux', 'default'].includes(os)) throw new StudioError('INVALID_ARGUMENT', `Unknown command OS: ${os}`);
          append(`${key}.${os}`, command, true);
        }
      } else append(key, value, block === 'commands');
    }
  }
  return entries;
}

function mirror(content: string, values: Map<string, string>): string {
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const found = new Set<string>();
  let after = content.replace(/^([ \t]*(?:[-*][ \t]*)?\*\*([^*]+)\*\*:[ \t]*)([^\r\n]*)/gm, (line, prefix: string, label: string) => {
    if (!values.has(label)) return line;
    if (found.has(label)) throw new StudioError('FILE_CONFLICT', `Duplicate technical preference label: ${label}`, 4);
    found.add(label);
    return prefix + values.get(label);
  });
  const missing = [...values].filter(([label]) => !found.has(label));
  if (missing.length) after = after.replace(/[\r\n]*$/, '') + newline + newline +
    missing.map(([label, value]) => `- **${label}**: ${value}`).join(newline) + newline;
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
    settings[key] = { value: document.getIn(key.split('.')) as Json, source: 'project.yaml' };
  }
  const layout = await resolveEngineRow(project, settings, { allowMissing: true }) as Record<string, Json>;
  for (const key of ['code_root', 'test_root']) {
    const directory = layout[key] as Record<string, Json>;
    if (!['available', 'missing'].includes(directory.state as string)) throw new StudioError('INVALID_ARGUMENT', `engine.${key}: ${directory.reason}`);
    if (directory.state === 'missing') warnings.push(`${key} ${directory.value} has not been created; configure its scaffold before running engine operations.`);
  }
  const values = new Map<string, string>([['Engine', `${document.getIn(['engine', 'name'])} ${document.getIn(['engine', 'version'])}`]]);
  for (const [key, label] of Object.entries(labels)) {
    const [block, field] = key.split('.');
    const value = (config[block!] as Record<string, Json> | undefined)?.[field!];
    if (value === undefined) continue;
    if (key === 'specialists.additional' && Array.isArray(value)) {
      value.forEach(item => text(item, key));
      values.set(label, value.length ? value.join(', ') : 'None');
    } else values.set(label, value === null ? '[TO BE CONFIGURED]' : text(value, key));
  }
  const path = 'docs/technical-preferences.md';
  const before = await readText(await safePath(project, path));
  const legacy = before === null ? await readText(await safePath(project, '.claude/docs/technical-preferences.md')) : null;
  if (legacy !== null) warnings.push('Preserved the legacy technical preference document as migration input; review its retained notes for obsolete instructions.');
  const after = mirror(before ?? legacy ?? '# Technical Preferences\n\nProject configuration is recorded in `project.yaml`; this document mirrors its engine choices.\n', values);
  // Guard both documents even when only one needs new bytes, so a concurrent edit
  // cannot leave the pair inconsistent. Neither file becomes installer-owned.
  if (configBefore !== configAfter || before !== after) {
    plan.changes = [{ path: 'project.yaml', before: configBefore, after: configAfter }, { path, before, after }];
  }
  return { plan, warnings, layout,
    execution: { state: 'not_assessed', reason: 'Configuration only: no editor, scaffold, command, build or test was executed.' } };
}
