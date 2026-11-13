import type { Json, Setting } from './config.js';
import { resolveEngineRow } from './engine.js';
import { StudioError } from './contract.js';
import type { readLegacyPreferences } from './legacy-config.js';

const testTypes = ['logic', 'integration', 'visual', 'ui', 'config'];
export const derivedDependencies: Record<string, string[]> = {
  gate_level: testTypes.map(type => `testing.strict.${type}`),
  review_gate: ['modes.review_mode'],
  engine_values: ['engine.name', 'engine.version', 'engine.language', 'engine.path'],
  perf_budgets: ['performance.target_framerate', 'performance.frame_budget_ms',
    'performance.draw_call_limit', 'performance.memory_ceiling_mb'],
  engine_row: ['engine.name', 'engine.code_root', 'engine.test_root'],
  input_methods: ['platform.targets', 'platform.primary_input', 'platform.gamepad_support', 'platform.touch_support'],
  specialists: ['engine.name', 'specialists.primary', 'specialists.code', 'specialists.shader', 'specialists.ui', 'specialists.additional'],
};

function method(value: string) {
  const lower = value.trim().toLowerCase();
  const compact = lower.replace(/\s+/g, '');
  if (['keyboard', 'mouse', 'keyboard/mouse', 'mouse/keyboard', 'keyboard+mouse', 'mouse+keyboard',
    'keyboard&mouse', 'mouse&keyboard', 'keyboardandmouse', 'mouseandkeyboard', 'keyboard-mouse', 'kbm', 'kb/m', 'kb+m', 'm+kb', 'mkb'].includes(compact)) return 'keyboard/mouse';
  if (['gamepad', 'controller', 'gamecontroller', 'joypad'].includes(compact)) return 'gamepad';
  if (['touch', 'touchscreen'].includes(compact)) return 'touch';
  return lower;
}

export async function deriveSetting(key: string, settings: Record<string, Setting>, root: string,
  context: { project: Record<string, Json>; preferences: Awaited<ReturnType<typeof readLegacyPreferences>> }): Promise<Setting> {
  if (key === 'engine_row') return { value: await resolveEngineRow(root, settings), source: 'derived:engine table' };
  if (key === 'input_methods') {
    if (!Object.hasOwn(context.project, 'platform')) {
      const { methods, primary } = context.preferences.input;
      return { value: { methods: methods === null ? null : [...new Set(methods.split(',').map(method).filter(Boolean))], primary },
        source: methods === null ? 'unset' : context.preferences.source };
    }
    const platform = context.project.platform;
    if (platform !== null && (typeof platform !== 'object' || Array.isArray(platform))) throw new StudioError('INVALID_CONFIG', 'platform must be a mapping');
    const targets = settings['platform.targets']!.value;
    if (targets !== null && (!Array.isArray(targets) || targets.some(value => typeof value !== 'string'))) throw new StudioError('INVALID_CONFIG', 'platform.targets must be a string array');
    for (const path of ['platform.primary_input', 'platform.gamepad_support', 'platform.touch_support']) {
      const value = settings[path]!.value;
      if (value !== null && typeof value !== 'string') throw new StudioError('INVALID_CONFIG', `${path} must be a string`);
    }
    const methods = new Set<string>();
    if ((targets as string[] | null)?.some(value => ['pc', 'web'].includes(value.toLowerCase()))) methods.add('keyboard/mouse');
    if (/^(full|partial)$/i.test(String(settings['platform.gamepad_support']!.value))) methods.add('gamepad');
    if (/^(full|partial)$/i.test(String(settings['platform.touch_support']!.value))) methods.add('touch');
    const primary = settings['platform.primary_input']!.value as string | null;
    if (primary && method(primary)) methods.add(method(primary));
    return { value: { methods: [...methods], primary }, source: 'project.yaml:platform' };
  }
  if (key === 'specialists') {
    const primaryByEngine: Record<string, string> = { Godot: 'godot-specialist', Unity: 'unity-specialist', Unreal: 'unreal-specialist', Web: 'lead-programmer' };
    const primary = primaryByEngine[String(settings['engine.name']!.value)];
    const value: Record<string, Json> = {};
    for (const role of ['primary', 'code', 'shader', 'ui', 'additional']) {
      const setting = settings[`specialists.${role}`]!;
      if (setting.value !== null && (role === 'additional'
        ? !Array.isArray(setting.value) || setting.value.some(item => typeof item !== 'string')
        : typeof setting.value !== 'string')) throw new StudioError('INVALID_CONFIG', `Invalid specialists.${role}`);
      value[role] = role === 'primary' && primary ? { value: primary, source: 'derived:engine.name' } : { ...setting };
    }
    return { value, source: 'derived:specialists' };
  }
  if (key === 'gate_level') {
    const value: Record<string, Json> = {};
    for (const type of testTypes) {
      const setting = settings[`testing.strict.${type}`]!;
      const explicit = setting.value !== null;
      const blocking = explicit ? String(setting.value) === 'true' : type !== 'config';
      value[type] = { level: blocking ? 'blocking' : 'advisory', source: explicit ? setting.source : 'default',
        ...(type === 'config' ? { smokeCheck: !explicit || blocking ? 'blocking' : 'advisory' } : {}) };
    }
    return { value, source: 'derived:testing.strict' };
  }
  if (key === 'review_gate') {
    const mode = settings['modes.review_mode']!;
    return { value: { skillGates: mode.value === 'full' ? 'run' : 'skip',
      phaseGates: mode.value === 'full' || mode.value === 'lean' ? 'run' : 'skip', reviewMode: mode.value }, source: mode.source };
  }
  const value: Record<string, Json> = {};
  for (const path of derivedDependencies[key]!) {
    const setting = settings[path]!;
    value[path.split('.').at(-1)!] = { value: setting.value, source: setting.source };
  }
  return { value, source: 'derived' };
}
