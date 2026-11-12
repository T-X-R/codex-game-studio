import { readdir, readFile, stat } from 'node:fs/promises';
import { posix } from 'node:path';
import { safePath } from './files.js';
import { validateSkill, validateRole, runtimeIssues, type ContentIssue } from './content-check.js';
import { commandIssues } from './content-commands.js';

interface LocatedIssue extends ContentIssue { path: string; root: string }
const roots = ['.agents/skills', 'studio/onboarding', '.codex/agents'];
const bundled = (path: string) => ['.agents/', '.codex/agents/', 'studio/'].some(prefix => path.startsWith(prefix));

export async function inspectContent(root: string, options: { projectResources?: string } = {}) {
  const issues: LocatedIssue[] = [];
  const counts = { skills: 0, onboarding: 0, roles: 0 };
  const checked = new Set<string>();
  const checkedSources = new Map<string, { root: string; path: string }>();
  const unassessedFiles: string[] = [];
  const visited = new Set<string>();
  const names = new Map<string, string>();
  const add = (path: string, code: string, message: string, base = root) => issues.push({ path, root: base, code, message });
  const record = (path: string, base: string) => { checked.add(path); checkedSources.set(`${base}\0${path}`, { root: base, path }); };

  async function reference(source: string, target: string, base: string, resource = false) {
    if (/^(https?:|mailto:|#)/i.test(target)) return;
    try {
      const decoded = decodeURIComponent(target.split('#')[0]!);
      const path = resource ? decoded : posix.normalize(posix.join(posix.dirname(source), decoded));
      if (decoded.startsWith('/') || (!options.projectResources && !bundled(path))) throw new Error('Reference leaves the packaged content roots');
      const targetRoot = resource ? options.projectResources ?? root : base;
      const absolute = await safePath(targetRoot, path);
      const info = await stat(absolute);
      if (info.isFile() && path.endsWith('.md')) await document(path, targetRoot);
      else if (info.isFile()) record(path, targetRoot);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      add(source, code === 'ENOENT' ? 'MISSING_RESOURCE' : 'UNSAFE_RESOURCE', `${target}: ${(error as Error).message}`, base);
    }
  }

  async function references(path: string, body: string, base = root) {
    issues.push(...commandIssues(body).map(issue => ({ path, root: base, ...issue })));
    for (const match of body.matchAll(/\[[^\]\n]*\]\((?:<([^>\n]+)>|([^\s)]+))(?:\s+"[^"\n]*")?\)/g)) await reference(path, (match[1] ?? match[2])!, base);
    for (const match of body.matchAll(/^ {0,3}\[[^\]\n]+\]:\s*(?:<([^>\n]+)>|(\S+))/gm)) await reference(path, (match[1] ?? match[2])!, base);
    for (const match of body.matchAll(/\bresource\s+path\s+(studio\/[a-zA-Z0-9_./-]+)/g)) await reference(path, match[1]!, base, true);
  }

  async function document(path: string, base = root) {
    const key = `${base}\0${path}`;
    if (visited.has(key)) return;
    visited.add(key);
    const body = await readFile(await safePath(base, path), 'utf8');
    record(path, base);
    // Shared migration documentation may describe retained upstream inputs.
    // Runtime syntax is forbidden in active Skill guidance and role instructions.
    if (roots.slice(0, 2).some(prefix => path.startsWith(`${prefix}/`))) {
      issues.push(...runtimeIssues(body).map(issue => ({ path, root: base, ...issue })));
    }
    await references(path, body, base);
  }

  async function descendants(path: string) {
    for (const entry of await readdir(await safePath(root, path), { withFileTypes: true })) {
      const child = `${path}/${entry.name}`;
      if (entry.isSymbolicLink()) add(child, 'UNSAFE_RESOURCE', 'Canonical resources cannot be symbolic links');
      else if (entry.isDirectory()) await descendants(child);
      else if (entry.isFile() && entry.name.endsWith('.md')) await document(child);
    }
  }

  for (const prefix of roots) {
    if (options.projectResources && prefix === 'studio/onboarding') continue;
    let entries;
    try { entries = await readdir(await safePath(root, prefix), { withFileTypes: true }); }
    catch (error) { add(prefix, 'MISSING_TREE', `Cannot inspect required content tree: ${(error as Error).message}`); continue; }
    if (options.projectResources) {
      const ownedName = (entryName: string) => {
        const name = prefix === '.codex/agents' ? entryName.replace(/\.toml$/, '') : entryName;
        return name === 'game-studio' || name.startsWith('game-studio-');
      };
      unassessedFiles.push(...entries.filter(entry => !ownedName(entry.name)).map(entry => `${prefix}/${entry.name}`));
      entries = entries.filter(entry => ownedName(entry.name));
      try {
        const expected = (await readdir(await safePath(options.projectResources, prefix))).filter(ownedName);
        if (!expected.length) add(prefix, 'EMPTY_BUNDLE_TREE', 'The running resource bundle has no expected toolkit entries', options.projectResources);
        for (const name of expected) if (!entries.some(entry => entry.name === name)) {
          add(`${prefix}/${name}`, 'MISSING_ENTRYPOINT', 'Expected installed entry from the running resource bundle is missing');
        }
      } catch (error) { add(prefix, 'MISSING_BUNDLE_TREE', (error as Error).message, options.projectResources); }
    }
    if (!entries.length) add(prefix, 'EMPTY_TREE', 'Required content tree has no entries');
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const role = prefix === '.codex/agents';
      const path = `${prefix}/${entry.name}${role ? '' : '/SKILL.md'}`;
      if (entry.isSymbolicLink() || (role ? !entry.isFile() || !entry.name.endsWith('.toml') : !entry.isDirectory())) {
        add(`${prefix}/${entry.name}`, 'UNEXPECTED_ENTRY', 'Expected a regular role TOML file or a Skill directory'); continue;
      }
      let text;
      try { text = await readFile(await safePath(root, path), 'utf8'); }
      catch (error) { add(path, 'MISSING_ENTRYPOINT', `Cannot read entrypoint: ${(error as Error).message}`); continue; }
      const result = role ? validateRole(text, entry.name.slice(0, -5)) : validateSkill(text, entry.name);
      record(path, root); visited.add(`${root}\0${path}`);
      counts[role ? 'roles' : prefix === '.agents/skills' ? 'skills' : 'onboarding']++;
      issues.push(...result.issues.map(issue => ({ path, root, ...issue })));
      if (result.name) {
        const key = `${role ? 'role' : 'skill'}:${result.name}`;
        if (names.has(key)) add(path, 'DUPLICATE_NAME', `${result.name} is already declared by ${names.get(key)}`);
        else names.set(key, path);
      }
      await references(path, result.body);
      if (!role) await descendants(`${prefix}/${entry.name}`);
    }
  }
  return { status: issues.length ? 'invalid' as const : 'valid' as const, counts,
    checkedFiles: [...checked].sort(), checkedSources: [...checkedSources.values()], unassessedFiles,
    issues, behaviorVerified: false as const };
}
