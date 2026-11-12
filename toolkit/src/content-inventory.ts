import { readFile, readdir, stat } from 'node:fs/promises';
import { safePath } from './files.js';

const inventoryPath = 'tasks/migration-inventory.md';
const settingsPath = '.claude/settings.json';
const totals = { hooks: 18, scripts: 54, rules: 14 };
type Kind = keyof typeof totals;

export async function inspectInventory(root: string) {
  const issues: { path: string; code: string; message: string }[] = [];
  const counts = { hooks: 0, scripts: 0, rules: 0 };
  const rows = new Map<string, string[]>();
  let registeredHooks = 0;
  const add = (path: string, code: string, message: string) => issues.push({ path, code, message });
  const result = () => ({ status: issues.length ? 'invalid' as const : 'valid' as const,
    counts, registeredHooks, sourceCoverageComplete: issues.length === 0, behaviorVerified: false as const, issues });
  let text;
  try { text = await readFile(await safePath(root, inventoryPath), 'utf8'); }
  catch (error) { add(inventoryPath, 'MISSING_INVENTORY', (error as Error).message); return result(); }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\| \[([^\]]+)\]\(\.\.\/(\.claude\/(hooks|scripts|rules)\/[^)]+)\) \| (.*) \|$/);
    if (!match) continue;
    const [, name, path, kind, tail] = match as [string, string, string, Kind, string];
    const cells = tail.split('|').map(value => value.trim());
    counts[kind]++;
    if (rows.has(path)) add(inventoryPath, 'DUPLICATE_SOURCE', `Duplicate source row: ${path}`);
    rows.set(path, cells);
    if (name !== path.split('/').at(-1) || cells.length !== (kind === 'hooks' ? 3 : 2) || cells.some(value => !value)) {
      add(inventoryPath, 'INVALID_INVENTORY_ROW', `Expected a matching source label and nonempty disposition columns: ${path}`);
    }
    try {
      if (!(await stat(await safePath(root, path))).isFile()) throw new Error('Expected a regular file');
    } catch (error) { add(path, 'MISSING_SOURCE', (error as Error).message); }
  }
  for (const kind of Object.keys(totals) as Kind[]) {
    const prefix = `.claude/${kind}`;
    if (counts[kind] !== totals[kind]) add(inventoryPath, 'INVENTORY_COUNT', `${kind}: expected ${totals[kind]} rows, found ${counts[kind]}`);
    let entries;
    try { entries = await readdir(await safePath(root, prefix), { withFileTypes: true }); }
    catch (error) { add(prefix, 'MISSING_SOURCE_TREE', (error as Error).message); continue; }
    if (entries.length !== totals[kind]) add(prefix, 'SOURCE_COUNT', `Expected ${totals[kind]} retained entries, found ${entries.length}`);
    for (const entry of entries) {
      const path = `${prefix}/${entry.name}`;
      if (!entry.isFile() || entry.isSymbolicLink()) add(path, 'INVALID_SOURCE_ENTRY', 'Retained source must be a regular file, not a directory or link');
      if (!rows.has(path)) add(inventoryPath, 'UNACCOUNTED_SOURCE', `Missing disposition for ${path}`);
    }
  }

  // Inspect retained registration strings only. Never execute or trust a Hook.
  const registrations = new Map<string, string[]>();
  try {
    const settings = JSON.parse(await readFile(await safePath(root, settingsPath), 'utf8'));
    if (!settings?.hooks || typeof settings.hooks !== 'object' || Array.isArray(settings.hooks)) throw new Error('Expected hooks mapping');
    for (const [event, groups] of Object.entries(settings.hooks)) {
      if (!Array.isArray(groups)) throw new Error(`Expected groups for ${event}`);
      for (const group of groups) {
        if (!group || typeof group.matcher !== 'string' || !Array.isArray(group.hooks)) throw new Error(`Invalid group for ${event}`);
        const label = event + (group.matcher ? ` (${group.matcher.replaceAll('|', '/')})` : '');
        for (const hook of group.hooks) {
          if (hook?.type !== 'command' || typeof hook.command !== 'string') throw new Error(`Expected command Hook for ${event}`);
          const references = [...hook.command.matchAll(/\.claude\/hooks\/[a-zA-Z0-9_.-]+/g)];
          if (references.length !== 1) throw new Error(`Expected one literal retained Hook path for ${event}`);
          const path = references[0]![0];
          const labels = registrations.get(path) ?? [];
          labels.push(label); registrations.set(path, labels);
          if (!rows.has(path)) add(settingsPath, 'UNKNOWN_HOOK', `Registered Hook has no inventory row: ${path}`);
        }
      }
    }
  } catch (error) { add(settingsPath, 'INVALID_HOOK_SETTINGS', (error as Error).message); }
  registeredHooks = registrations.size;
  if (registeredHooks !== 15) add(settingsPath, 'HOOK_REGISTRATION_COUNT', `Expected 15 registered Hook files, found ${registeredHooks}`);
  for (const [path, cells] of rows) {
    if (!path.startsWith('.claude/hooks/')) continue;
    const actual = registrations.get(path) ?? [];
    const expected = cells[0] === 'Not registered' ? [] : [cells[0]];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) add(inventoryPath, 'HOOK_REGISTRATION_MISMATCH', `${path}: declared ${JSON.stringify(expected)}, observed ${JSON.stringify(actual)}`);
  }
  return result();
}
