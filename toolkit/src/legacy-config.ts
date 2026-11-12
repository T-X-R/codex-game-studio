import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exists } from './project.js';
import type { Json } from './config.js';

// Legacy files are optional import inputs, never bundled runtime dependencies.
export async function readLegacyPreferences(root: string) {
  for (const source of ['docs/technical-preferences.md', '.claude/docs/technical-preferences.md']) {
    if (!(await exists(join(root, source)))) continue;
    const content = await readFile(join(root, source), 'utf8');
    const labels = new Map<string, string>();
    for (const match of content.matchAll(/^\s*[-*]?\s*\*\*([^*]+)\*\*:\s*([^\r\n]*)/gm)) {
      const value = match[2]!.trim();
      if (value && !value.startsWith('[') && !labels.has(match[1]!)) labels.set(match[1]!, value);
    }
    const values: Record<string, Json> = {};
    const engine = labels.get('Engine');
    if (engine) {
      const match = /^(Godot|Unity|Unreal(?: Engine)?|Web)(?:\s+(\d\S*))?$/i.exec(engine);
      if (match) {
        values['engine.name'] = ['Godot', 'Unity', 'Unreal', 'Web'].find(name => match[1]!.toLowerCase().startsWith(name.toLowerCase()))!;
        if (match[2]) values['engine.version'] = match[2];
      }
    }
    for (const [key, label] of Object.entries({ 'engine.language': 'Language', 'specialists.primary': 'Primary',
      'specialists.code': 'Language/Code Specialist', 'specialists.shader': 'Shader Specialist', 'specialists.ui': 'UI Specialist' })) {
      if (labels.has(label)) values[key] = labels.get(label)!;
    }
    const additional = labels.get('Additional Specialists');
    if (additional && additional.toLowerCase() !== 'none') values['specialists.additional'] = additional.split(',').map(value => value.trim());
    return { values, source, input: { methods: labels.get('Input Methods') ?? null, primary: labels.get('Primary Input') ?? null } };
  }
  return { values: {} as Record<string, Json>, source: 'unset', input: { methods: null, primary: null } };
}
