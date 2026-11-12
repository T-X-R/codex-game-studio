import { LineCounter, isMap, isScalar, isSeq, parseDocument, visit } from 'yaml';
import { readText, safePath } from './files.js';

export const registryPaths = {
  entities: 'design/registry/entities.yaml',
  tr: 'docs/architecture/tr-registry.yaml',
  architecture: 'docs/registry/architecture.yaml',
} as const;
export type RegistryName = keyof typeof registryPaths;
export interface RegistryDiagnostic {
  code: string; registry: RegistryName; path: string; line: number; message: string;
  name?: string; section?: string; field?: string; value?: unknown;
}
export interface RegistryEntry {
  registry: RegistryName; section: string; key: string; name: string; line: number;
  fields: Record<string, unknown>; fieldLines: Record<string, number>; raw: string;
  refs: { how: string; path: string; line: number }[];
}
export interface RegistryObservation {
  registry: RegistryName; path: string; state: 'read' | 'missing' | 'layout';
  entries: RegistryEntry[]; diagnostics: RegistryDiagnostic[];
}
const nameKeys: Record<RegistryName, Record<string, string[]>> = {
  entities: Object.fromEntries(['entities', 'items', 'formulas', 'constants'].map(key => [key, ['name']])),
  tr: { requirements: ['id'] },
  architecture: { state_ownership: ['state'], interfaces: ['contract'], performance_budgets: ['system', 'target_fps'], api_decisions: ['purpose'], forbidden_patterns: ['pattern'] },
};
const sourceFields: Record<RegistryName, string> = { entities: 'source', tr: 'gdd', architecture: 'adr' };

/** Read observations only. A malformed registry never contributes guessed entries. */
export async function readRegistry(root: string, registry: RegistryName, path: string = registryPaths[registry]): Promise<RegistryObservation> {
  const original = await readText(await safePath(root, path));
  const result: RegistryObservation = { registry, path, state: original === null ? 'missing' : 'read', entries: [], diagnostics: [] };
  if (original === null) return result;
  const lines = original.replace(/^\uFEFF/, '').split(/\r?\n/);
  let text = lines.join('\n');
  let counter = new LineCounter();
  let doc = parseDocument(text, { lineCounter: counter, uniqueKeys: true });
  const diagnostic = (code: string, line: number, message: string) => result.diagnostics.push({ code, registry, path, line, message });
  // The upstream writer emitted this one invalid YAML scalar before 1.2.0.
  // Repair only a parser-reported error line in memory, never matching block text.
  if (registry === 'architecture' && doc.errors.length) {
    const repairs = new Map<number, string>();
    for (const error of doc.errors) {
      const line = counter.linePos(error.pos[0]).line;
      const match = lines[line - 1]?.match(/^( {2}| {4})status: (superseded_by: [^#\r\n]+?)(\s+#.*)?$/);
      if (match && !match[2]!.slice('superseded_by: '.length).includes(':')) repairs.set(line, `${match[1]}status: ${JSON.stringify(match[2]!.trim())}${match[3] ?? ''}`);
    }
    if (repairs.size) {
      text = lines.map((line, index) => repairs.get(index + 1) ?? line).join('\n');
      counter = new LineCounter(); doc = parseDocument(text, { lineCounter: counter, uniqueKeys: true });
      for (const line of repairs.keys()) diagnostic('UNQUOTED', line, 'Quote the legacy superseded_by status; input bytes were not changed.');
    }
  }
  for (const error of [...doc.errors, ...doc.warnings]) diagnostic('LAYOUT', counter.linePos(error.pos[0]).line, error.message);
  visit(doc, { Alias(_key, node) { diagnostic('LAYOUT', counter.linePos(node.range?.[0] ?? 0).line, 'Registry aliases are unsupported; write the explicit value.'); } });
  if (!isMap(doc.contents)) diagnostic('LAYOUT', 1, 'Registry must be a mapping of metadata and block-list sections.');
  if (!result.diagnostics.some(d => d.code === 'LAYOUT') && isMap(doc.contents)) {
    for (const pair of doc.contents.items) {
      const section = isScalar(pair.key) ? String(pair.key.value) : '';
      const line = counter.linePos(pair.key?.range?.[0] ?? 0).line;
      const expected = Object.hasOwn(nameKeys[registry], section) ? nameKeys[registry][section] : undefined;
      if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(section) || counter.linePos(pair.key?.range?.[0] ?? 0).col !== 1) diagnostic('LAYOUT', line, 'Registry section/metadata keys must start at column 0.');
      if (!isSeq(pair.value)) {
        if (expected || isMap(pair.value)) diagnostic('LAYOUT', line, `${section} must contain a block list or [].`);
        continue;
      }
      if (pair.value.flow && pair.value.items.length) { diagnostic('LAYOUT', line, 'Registry entries require a block list, not an inline sequence.'); continue; }
      let dashColumn: number | undefined;
      for (const node of pair.value.items) {
        const position = counter.linePos(node?.range?.[0] ?? 0);
        if (!isMap(node) || node.flow || !node.items.length) { diagnostic('LAYOUT', position.line, 'Each entry must be a nonempty block mapping.'); continue; }
        const dash = lines[position.line - 1]?.match(/^( *)- /)?.[1]?.length;
        if ((dash !== 0 && dash !== 2) || (dashColumn !== undefined && dashColumn !== dash)) diagnostic('LAYOUT', position.line, 'Entry dashes must consistently use column 0 or 2 in each section.');
        dashColumn = dash;
        const first = node.items[0]!;
        const key = isScalar(first.key) ? String(first.key.value) : '';
        const name = isScalar(first.value) && first.value.value !== null ? String(first.value.value) : '';
        if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(key) || !name || (expected && !expected.includes(key))) diagnostic('LAYOUT', position.line, `Entry must start with ${expected?.join(' or ') ?? 'a scalar name key'}.`);
        const fields = node.toJSON() as Record<string, unknown>;
        const fieldLines: Record<string, number> = {};
        const refs: RegistryEntry['refs'] = [];
        for (const field of node.items) {
          const fieldName = isScalar(field.key) ? String(field.key.value) : '';
          const fieldLine = counter.linePos(field.key?.range?.[0] ?? 0).line;
          fieldLines[fieldName] = fieldLine;
          if (fieldName !== sourceFields[registry] && fieldName !== 'referenced_by') continue;
          const values = fieldName === 'referenced_by' && isSeq(field.value) ? field.value.items : [field.value];
          for (const value of values) {
            if (value === null || (isScalar(value) && (value.value === null || value.value === ''))) continue;
            if (!isScalar(value) || typeof value.value !== 'string') { diagnostic('LAYOUT', fieldLine, `${fieldName} must name paths as strings.`); continue; }
            refs.push({ how: fieldName, path: value.value, line: counter.linePos(value.range?.[0] ?? 0).line });
          }
        }
        const lastLine = counter.linePos(Math.max(node.range![0], node.range![1] - 1)).line;
        result.entries.push({ registry, section, key, name, line: position.line, fields, fieldLines, refs, raw: lines.slice(position.line - 1, lastLine).join('\n') });
      }
    }
  }
  if (result.diagnostics.some(d => d.code === 'LAYOUT')) { result.state = 'layout'; result.entries = []; }
  return result;
}
