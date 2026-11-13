import { readFile, readdir, stat } from 'node:fs/promises';
import { parseDocument } from 'yaml';
import { safePath } from './files.js';

const catalogPath = 'studio-tests/catalog.yaml';
const totals = { skills: 75, agents: 49, aliases: 3 }; // Approved upstream 1.3.0 inventory.
const aliasTargets: Record<string, string> = { changelog: 'write-changelog', help: 'next-step', settings: 'project-settings' };
type Row = Record<string, unknown>;
const mapping = (value: unknown): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const emptyCounts = () => ({ total: 0, pending: 0, partial: 0, verified: 0 });

export async function inspectCatalog(root: string, requireComplete = false) {
  const issues: { path: string; code: string; message: string }[] = [];
  const counts = { skills: emptyCounts(), agents: emptyCounts(), aliases: emptyCounts() };
  const add = (code: string, message: string) => issues.push({ path: catalogPath, code, message });
  const result = () => ({ status: issues.length ? 'invalid' as const : 'valid' as const, counts,
    declaredComplete: issues.length === 0 && Object.values(counts).every(c => c.total > 0 && c.verified === c.total),
    behaviorVerified: false as const, issues });
  async function file(path: unknown) {
    if (typeof path !== 'string') return false;
    try { return (await stat(await safePath(root, path))).isFile(); } catch { return false; }
  }
  async function entries(path: string, skills: boolean) {
    try {
      const rows = await readdir(await safePath(root, path), { withFileTypes: true });
      return rows.filter(row => skills ? row.isDirectory() : row.isFile() && row.name.endsWith('.md'))
        .map(row => skills ? row.name : row.name.slice(0, -3));
    } catch (error) { add('MISSING_SOURCE_TREE', `${path}: ${(error as Error).message}`); return []; }
  }
  let catalog: Row;
  try {
    const document = parseDocument(await readFile(await safePath(root, catalogPath), 'utf8'), { uniqueKeys: true });
    if (document.errors.length) throw new Error(document.errors[0]!.message);
    const value: unknown = document.toJS({ maxAliasCount: 20 });
    if (!mapping(value) || value.version !== 3 || value.target_platform !== 'codex') throw new Error('Expected catalog version 3 and target_platform codex');
    catalog = value;
  } catch (error) { add('INVALID_CATALOG', (error as Error).message); return result(); }

  const sourceSkills = await entries('.claude/skills', true);
  const sourceRoles = await entries('.claude/agents', false);
  if (sourceSkills.length !== totals.skills + totals.aliases || sourceRoles.length !== totals.agents) {
    add('SOURCE_COUNT', `Expected 78 retained Skill inputs and 49 roles; found ${sourceSkills.length} and ${sourceRoles.length}`);
  }
  const coveredSkills = new Set<string>(); const coveredRoles = new Set<string>();
  const targets = new Set<string>(); const primaryNames = new Set<string>();
  const rowsByKind: Record<string, Row[]> = {};
  for (const kind of ['skills', 'agents', 'aliases'] as const) {
    const rows: unknown = catalog[kind];
    if (!Array.isArray(rows) || rows.some(row => !mapping(row))) {
      add('INVALID_CATALOG', `${kind} must be an array of mappings`); continue;
    }
    rowsByKind[kind] = rows;
    counts[kind].total = rows.length;
    if (rows.length !== totals[kind]) add('INVENTORY_COUNT', `${kind}: expected ${totals[kind]}, found ${rows.length}`);
    for (const row of rows as Row[]) {
      const name = row.name;
      if (typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        add('INVALID_CATALOG', `${kind}: invalid upstream source name`); continue;
      }
      const label = `${kind}:${name}`;
      const covered = kind === 'agents' ? coveredRoles : coveredSkills;
      if (covered.has(name)) add('DUPLICATE_SOURCE', `${label} is declared more than once`);
      covered.add(name);
      if (kind === 'skills') primaryNames.add(name);
      if (!(kind === 'agents' ? sourceRoles : sourceSkills).includes(name)) add('UNKNOWN_SOURCE', `${label} has no retained source`);
      const source = kind === 'agents' ? `.claude/agents/${name}.md` : `.claude/skills/${name}/SKILL.md`;
      if (!(await file(source))) add('MISSING_SOURCE', `${label}: unreadable regular source file ${source}`);
      const state = row.migration_state;
      if (state !== 'pending' && state !== 'partial' && state !== 'verified') add('INVALID_STATE', `${label}: expected pending, partial or verified`);
      else counts[kind][state]++;
      if (state === 'verified') {
        if (!(await file(row.codex_spec))) add('MISSING_EVIDENCE', `${label}: verified declaration needs a readable codex_spec`);
        if (!Array.isArray(row.evidence) || !row.evidence.length) add('MISSING_EVIDENCE', `${label}: verified declaration needs evidence paths`);
        else for (const path of row.evidence) {
          if (typeof path !== 'string' || !path.startsWith('docs/evidence/') || !(await file(path))) add('MISSING_EVIDENCE', `${label}: invalid or missing evidence ${String(path)}`);
        }
      }
      if (kind === 'aliases') continue;
      if (!(await file(row.spec))) add('MISSING_SPEC', `${label}: source behavioral specification is missing`);
      const expected = kind === 'skills' ? `.agents/skills/game-studio-${name}/SKILL.md` : `.codex/agents/game-studio-${name}.toml`;
      if (row.target !== expected) add('INVALID_TARGET', `${label}: expected ${expected}`);
      targets.add(expected);
      const present = await file(expected);
      if (state === 'pending' && present) add('STATE_MISMATCH', `${label}: target exists but migration is still pending`);
      if ((state === 'partial' || state === 'verified') && !present) add('MISSING_TARGET', `${label}: declared target is missing`);
    }
  }
  for (const [names, covered] of [[sourceSkills, coveredSkills], [sourceRoles, coveredRoles]] as const) {
    for (const name of names) if (!covered.has(name)) add('UNACCOUNTED_SOURCE', `No catalog disposition for retained source ${name}`);
  }
  for (const row of rowsByKind.aliases ?? []) {
    const { name, replacement } = row;
    if (typeof name !== 'string' || typeof replacement !== 'string' || !Object.hasOwn(aliasTargets, name) || aliasTargets[name] !== replacement || !primaryNames.has(replacement)) {
      add('INVALID_ALIAS', `Alias ${String(name)} must retain its approved primary replacement`); continue;
    }
    if (await file(`.agents/skills/game-studio-${name}/SKILL.md`)) add('ACTIVE_ALIAS', `Retired alias ${name} must not have an active duplicate entrypoint`);
    if (row.migration_state === 'verified' && !(await file(`.agents/skills/game-studio-${replacement}/SKILL.md`))) add('MISSING_TARGET', `Verified alias ${name} has no installed replacement`);
  }
  for (const [prefix, skill] of [['.agents/skills', true], ['.codex/agents', false]] as const) {
    let rows;
    try { rows = await readdir(await safePath(root, prefix), { withFileTypes: true }); }
    catch { continue; } // Entry presence/type errors are also reported by the content-tree validator.
    for (const row of rows) {
      const path = `${prefix}/${row.name}${skill ? '/SKILL.md' : ''}`;
      if ((skill ? row.isDirectory() : row.name.endsWith('.toml')) && !targets.has(path)) add('UNTRACKED_TARGET', `Canonical artifact has no primary catalog row: ${path}`);
    }
  }
  if (requireComplete && Object.values(counts).some(c => c.verified !== c.total || c.total === 0)) add('MIGRATION_INCOMPLETE', 'Every workflow, role and alias needs a verified declaration with evidence before the complete catalog gate can pass');
  return result();
}
