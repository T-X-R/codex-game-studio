import type { Json, Setting } from './config.js';
import { resolveEngineRow } from './engine.js';

const testTypes = ['logic', 'integration', 'visual', 'ui', 'config'];
export const derivedDependencies: Record<string, string[]> = {
  gate_level: testTypes.map(type => `testing.strict.${type}`),
  review_gate: ['modes.review_mode'],
  engine_values: ['engine.name', 'engine.version', 'engine.language'],
  perf_budgets: ['performance.target_framerate', 'performance.frame_budget_ms',
    'performance.draw_call_limit', 'performance.memory_ceiling_mb'],
  engine_row: ['engine.name', 'engine.code_root', 'engine.test_root'],
};

export async function deriveSetting(key: string, settings: Record<string, Setting>, root: string): Promise<Setting> {
  if (key === 'engine_row') return { value: await resolveEngineRow(root, settings), source: 'derived:engine table' };
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
