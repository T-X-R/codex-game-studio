import { Document, isAlias, isMap, isScalar } from 'yaml';
import { StudioError } from './contract.js';
import { enums, localKeys, parseConfig, readConfig, type Json } from './config.js';
import { canonicalRoot, readText, safePath } from './files.js';
import type { InstallPlan } from './install.js';
import { metadata } from './metadata.js';

// Keys from upstream effects-map headings and the complete project example.
// Keeping this catalog in the runtime avoids a dependency on the retained .claude tree.
const extraKeys = new Set(`schema_version project.name project.genre project.version project.kind
engine.version engine.language engine.rendering engine.physics engine.code_root engine.test_root
testing.framework testing.strict strict_gate_checks qa.coverage_minimum platform.multiplayer
platform.targets platform.primary_input platform.gamepad_support platform.touch_support
cadence.sprint_length cadence.milestone_length performance.target_framerate performance.frame_budget_ms
performance.draw_call_limit performance.memory_ceiling_mb`.split(/\s+/));
const prefixes = ['commands.', 'specialists.', 'naming.', 'framework.'];
const reserved = new Set(['strict_gate_checks', 'accessibility.target', 'cadence.sprint_length',
  'cadence.milestone_length', 'project.kind', 'features.token_budget_warn_at']);
const numeric: Record<string, [number, number, boolean]> = {
  schema_version: [1, 1, true], 'qa.coverage_minimum': [0, 100, true],
  'features.token_budget_warn_at': [0, 1, false], 'features.read_guard_kb': [0, Infinity, false],
  'performance.target_framerate': [0, Infinity, false], 'performance.frame_budget_ms': [0, Infinity, false],
  'performance.draw_call_limit': [0, Infinity, true], 'performance.memory_ceiling_mb': [0, Infinity, false],
};
const lists = new Set(['modes.automation_always_ask', 'platform.targets', 'specialists.additional']);
const booleans = new Set(['testing.strict', 'strict_gate_checks', 'platform.multiplayer']);

function settingValue(key: string, raw: string): Json {
  if (!/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(key) ||
      key.split('.').some(part => ['__proto__', 'prototype', 'constructor'].includes(part))) {
    throw new StudioError('INVALID_ARGUMENT', `Invalid configuration key: ${key}`);
  }
  const system = /^workflow_overrides\.system_overrides\.[a-zA-Z0-9_-]+$/.test(key);
  if (!Object.hasOwn(enums, key) && !localKeys.has(key) && !extraKeys.has(key) &&
      !prefixes.some(prefix => key.startsWith(prefix)) && !system) {
    throw new StudioError('INVALID_ARGUMENT', `Unknown configuration key: ${key}`);
  }
  if (raw === 'null') return null;
  const allowed = system ? enums['modes.workflow'] : enums[key];
  if (allowed && !allowed.includes(raw)) throw new StudioError('INVALID_ARGUMENT', `${key} must be one of: ${allowed.join(', ')}`);
  if (booleans.has(key) || allowed?.join('|') === 'true|false') {
    if (!['true', 'false'].includes(raw)) throw new StudioError('INVALID_ARGUMENT', `${key} must be true or false`);
    return raw === 'true';
  }
  if (Object.hasOwn(numeric, key)) {
    const [min, max, integer] = numeric[key]!;
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      throw new StudioError('INVALID_ARGUMENT', `${key} requires ${integer ? 'an integer' : 'a number'} between ${min} and ${max}`);
    }
    return value;
  }
  if (lists.has(key)) {
    try {
      const value: unknown = JSON.parse(raw);
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new Error();
      return value;
    } catch { throw new StudioError('INVALID_ARGUMENT', `${key} requires a JSON array of strings`); }
  }
  return raw;
}

export async function planConfigSet(root: string, key: string, raw: string, local = false): Promise<{ plan: InstallPlan; warnings: string[] }> {
  const value = settingValue(key, raw);
  if (local && !localKeys.has(key)) throw new StudioError('INVALID_ARGUMENT', `${key} is not locally overridable`);
  const project = await canonicalRoot(root);
  const projectPath = await safePath(project, 'project.yaml');
  const projectContent = await readText(projectPath);
  if (projectContent === null) throw new StudioError('INVALID_CONFIG', 'project.yaml is required before editing settings');
  const base = parseConfig(projectContent, projectPath);
  const path = local ? 'project.local.yaml' : 'project.yaml';
  const before = local ? await readText(await safePath(project, path)) : projectContent;
  const bom = before?.startsWith('\uFEFF') ? '\uFEFF' : '';
  const content = (before ?? '').slice(bom.length);
  const document = parseConfig(content, path);
  const parts = key.split('.');
  for (let i = 1; i <= parts.length; i++) {
    const node = document.getIn(parts.slice(0, i), true);
    if (isAlias(node) || (node && typeof node === 'object' && 'anchor' in node && node.anchor) ||
        (i < parts.length && node !== undefined && !isMap(node)) || (i === parts.length && isMap(node))) {
      throw new StudioError('FILE_CONFLICT', `Refusing to replace a mapping, alias, anchor or scalar parent at ${parts.slice(0, i).join('.')}`, 4);
    }
  }
  const warnings: string[] = [];
  if (reserved.has(key)) warnings.push(`${key} is reserved upstream; storing it does not implement enforcement`);
  if (!local && localKeys.has(key)) {
    const overrides = await readConfig(await safePath(project, 'project.local.yaml'));
    let override: Json | undefined = overrides;
    for (const part of parts) override = override && typeof override === 'object' && !Array.isArray(override) ? override[part] : undefined;
    if (override !== undefined && override !== null && override !== '') warnings.push(`${key} is shadowed by project.local.yaml`);
  }
  const plan: InstallPlan = { project, version: metadata.version, changes: [] };
  const current = document.getIn(parts);
  if (JSON.stringify(current) !== JSON.stringify(value)) {
    const node = document.getIn(parts, true);
    let after: string;
    if (isScalar(node) && node.range && !Array.isArray(value) &&
        !node.type?.startsWith('BLOCK_') && !(typeof value === 'string' && /[\r\n]/.test(value))) {
      const scalarDocument = new Document(value);
      if (typeof value === 'string' && isScalar(scalarDocument.contents)) scalarDocument.contents.type = node.type;
      const encoded = scalarDocument.toString({ lineWidth: 0 }).trimEnd();
      after = content.slice(0, node.range[0]) + encoded + content.slice(node.range[1]);
    } else {
      document.setIn(parts, value);
      after = document.toString({ lineWidth: 0 });
    }
    if (content.includes('\r\n')) after = after.replace(/\r?\n/g, '\r\n');
    const check = parseConfig(after, path).getIn(parts);
    if (JSON.stringify(check) !== JSON.stringify(value)) throw new StudioError('INVALID_CONFIG', `Cannot preserve the requested value for ${key}`);
    plan.changes.push({ path, before, after: bom + after });
  }
  if (key === 'project.stage') {
    if (value === null) throw new StudioError('INVALID_ARGUMENT', 'project.stage cannot be unset while synchronizing its mirror');
    const mirrorPath = 'production/stage.txt';
    const mirror = await readText(await safePath(project, mirrorPath));
    const declared = base.getIn(['project', 'stage']);
    if (mirror !== null && declared !== undefined && declared !== null && mirror.trim() !== declared) {
      throw new StudioError('FILE_CONFLICT', 'project.yaml and production/stage.txt disagree; reconcile the recorded stage first', 4);
    }
    const after = `${value}${mirror?.includes('\r\n') ? '\r\n' : '\n'}`;
    if (mirror !== after) plan.changes.push({ path: mirrorPath, before: mirror, after });
  }
  return { plan, warnings };
}
