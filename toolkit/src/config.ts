import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseDocument } from 'yaml';
import { StudioError } from './contract.js';
import { exists } from './project.js';
import { readLegacyPreferences } from './legacy-config.js';

export type Json = null | string | number | boolean | Json[] | { [key: string]: Json };
type ObjectValue = { [key: string]: Json };
export interface Setting { value: Json; source: string }
export const localKeys = new Set([
  'modes.review_mode', 'modes.automation', 'modes.automation_always_ask', 'team.size',
  'testing.strict.logic', 'testing.strict.integration', 'testing.strict.visual', 'testing.strict.ui',
  'testing.strict.config', 'performance.enforce', 'features.session_state', 'features.token_budget_warn_at',
  'features.read_guard', 'features.read_guard_kb', 'updates.check',
]);
const enums: Record<string, string[]> = {
  'modes.review_mode': ['full', 'lean', 'solo'], 'modes.rigor': ['minimal', 'standard', 'full'],
  'modes.workflow': ['minimal', 'standard', 'full'], 'modes.automation': ['collaborative', 'guided', 'autonomous'],
  'modes.story_granularity': ['coarse', 'balanced', 'fine'], 'docs.density': ['terse', 'balanced', 'thorough'],
  'qa.level': ['minimal', 'standard', 'full'], 'team.size': ['individual', 'small', 'studio'],
  'performance.enforce': ['warn', 'block', 'off'], 'platform.cert_tier': ['none', 'itch', 'steam', 'console'],
  'accessibility.target': ['none', 'standard', 'aaa'], 'engine.name': ['Godot', 'Unity', 'Unreal', 'Web'],
  'project.stage': ['Concept', 'Systems Design', 'Technical Setup', 'Pre-Production', 'Production', 'Polish', 'Release'],
  'project.goal': ['jam', 'learn', 'hobby', 'portfolio', 'sell', 'early_access', 'publisher', 'mobile', 'other'],
  'features.session_state': ['on', 'off'], 'features.read_guard': ['on', 'off', 'true', 'false'],
};
for (const key of ['testing.strict.logic', 'testing.strict.integration', 'testing.strict.visual',
  'testing.strict.ui', 'testing.strict.config', 'platform.online', 'workflow_overrides.edge_cases',
  'workflow_overrides.tuning_knobs', 'workflow_overrides.art_bible_strict', 'updates.check']) enums[key] = ['true', 'false'];
const defaults: ObjectValue = {
  'modes.automation': 'guided', 'modes.rigor': 'minimal', 'performance.enforce': 'warn',
  'modes.automation_always_ask': ['scope_changes', 'file_deletions', 'schema_changes'],
};
const rigorKeys = ['modes.workflow', 'docs.density', 'qa.level', 'modes.story_granularity', 'modes.review_mode', 'team.size'];
const rigorValues: Record<string, string[]> = {
  minimal: ['minimal', 'terse', 'minimal', 'coarse', 'solo', 'individual'],
  standard: ['standard', 'balanced', 'standard', 'balanced', 'lean', 'individual'],
  full: ['full', 'thorough', 'full', 'fine', 'full', 'studio'],
};

function validateJson(value: unknown, depth = 0): asserts value is Json {
  if (depth > 50) throw new Error('Configuration nesting exceeds 50 levels');
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return;
  if (Array.isArray(value)) { for (const child of value) validateJson(child, depth + 1); return; }
  if (typeof value !== 'object') throw new Error('Expected JSON-compatible YAML');
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error(`Unsafe key: ${key}`);
    validateJson(child, depth + 1);
  }
}

export async function readConfig(path: string): Promise<ObjectValue> {
  if (!(await exists(path))) return {};
  try {
    const document = parseDocument(await readFile(path, 'utf8'), { uniqueKeys: true });
    if (document.errors.length) throw document.errors[0];
    const value: unknown = document.toJS({ maxAliasCount: 50 }) ?? {};
    validateJson(value);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Expected a mapping at the document root');
    return value;
  } catch (error) {
    throw new StudioError('INVALID_CONFIG', `${path}: ${error instanceof Error ? error.message : 'invalid YAML'}`);
  }
}

function flatten(value: ObjectValue, prefix = '', result: ObjectValue = {}): ObjectValue {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, result);
    else result[path] = child;
  }
  return result;
}

export async function readSettings(root: string, requested?: string[], options: { system?: string } = {}): Promise<{ settings: Record<string, Setting>; warnings: string[] }> {
  for (const key of requested ?? []) {
    if (!/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(key) || key.split('.').some(part => ['__proto__', 'prototype', 'constructor'].includes(part))) {
      throw new StudioError('INVALID_ARGUMENT', `Invalid configuration key: ${key}`);
    }
  }
  if (options.system !== undefined && !/^[a-zA-Z0-9_-]+$/.test(options.system)) throw new StudioError('INVALID_ARGUMENT', 'System must be a single identifier');
  const rawProject = await readConfig(join(root, 'project.yaml'));
  const project = flatten(rawProject);
  const local = flatten(await readConfig(join(root, 'project.local.yaml')));
  const warnings: string[] = [];
  const preferences = await readLegacyPreferences(root);
  for (const key of Object.keys(local)) {
    if (!localKeys.has(key) && key !== 'schema_version' && !key.startsWith('framework.')) warnings.push(`${key} in project.local.yaml is not locally overridable; ignored`);
  }
  const legacy: ObjectValue = {};
  const mirrors: Record<string, string> = { 'modes.review_mode': 'production/review-mode.txt', 'project.stage': 'production/stage.txt' };
  for (const [key, path] of Object.entries(mirrors)) {
    if (await exists(join(root, path))) legacy[key] = (await readFile(join(root, path), 'utf8')).trim();
  }
  function valid(key: string, value: Json | undefined, source: string): value is Exclude<Json, null> {
    if (value === undefined || value === null || value === '') return false;
    if (enums[key] && ((typeof value !== 'string' && typeof value !== 'boolean') || !enums[key].includes(String(value)))) {
      warnings.push(`Invalid ${key} in ${source}; ignored`); return false;
    }
    return true;
  }
  const rigor = valid('modes.rigor', project['modes.rigor'], 'project.yaml') ? String(project['modes.rigor']) : 'minimal';
  const derived = Object.fromEntries(rigorKeys.map((key, i) => [key, rigorValues[rigor]![i]!])) as ObjectValue;
  const settings: Record<string, Setting> = {};
  for (const key of requested ?? new Set([...Object.keys(enums), ...Object.keys(defaults), ...Object.keys(project), ...Object.keys(preferences.values), ...localKeys])) {
    const systemKey = options.system ? `workflow_overrides.system_overrides.${options.system}` : undefined;
    const candidates: [Json | undefined, string][] = [
      [key === 'modes.workflow' && systemKey ? project[systemKey] : undefined, `project.yaml:${systemKey}`],
      [localKeys.has(key) ? local[key] : undefined, 'project.local.yaml'], [project[key], 'project.yaml'],
      [legacy[key], mirrors[key] ?? 'legacy'],
      [key.startsWith('specialists.') && Object.hasOwn(rawProject, 'specialists') ? undefined : preferences.values[key], preferences.source],
      [derived[key], `rigor:${rigor}`], [defaults[key], 'default'],
    ];
    const selected = candidates.find(([value, source]) => valid(key, value, source));
    settings[key] = selected ? { value: selected[0]!, source: selected[1] } : { value: null, source: 'unset' };
    if (selected?.[1] === '.claude/docs/technical-preferences.md') warnings.push('Using legacy technical preferences; migrate the project-owned record to docs/technical-preferences.md');
  }
  return { settings, warnings: [...new Set(warnings)] };
}
