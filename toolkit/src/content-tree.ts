import { readdir, readFile, stat } from 'node:fs/promises';
import { posix } from 'node:path';
import { safePath } from './files.js';
import { validateSkill, validateRole, runtimeIssues, type ContentIssue } from './content-check.js';

interface LocatedIssue extends ContentIssue { path: string }
const roots = ['.agents/skills', 'studio/onboarding', '.codex/agents'];
const bundled = (path: string) => ['.agents/', '.codex/agents/', 'studio/'].some(prefix => path.startsWith(prefix));

export async function inspectContent(root: string) {
  const issues: LocatedIssue[] = [];
  const counts = { skills: 0, onboarding: 0, roles: 0 };
  const checked = new Set<string>();
  const visited = new Set<string>();
  const names = new Map<string, string>();
  const add = (path: string, code: string, message: string) => issues.push({ path, code, message });

  async function reference(source: string, target: string, resource = false) {
    if (/^(https?:|mailto:|#)/i.test(target)) return;
    try {
      const decoded = decodeURIComponent(target.split('#')[0]!);
      const path = resource ? decoded : posix.normalize(posix.join(posix.dirname(source), decoded));
      if (decoded.startsWith('/') || !bundled(path)) throw new Error('Reference leaves the packaged content roots');
      const absolute = await safePath(root, path);
      const info = await stat(absolute);
      if (info.isFile() && path.endsWith('.md')) await document(path);
      else if (info.isFile()) checked.add(path);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      add(source, code === 'ENOENT' ? 'MISSING_RESOURCE' : 'UNSAFE_RESOURCE', `${target}: ${(error as Error).message}`);
    }
  }

  async function references(path: string, body: string) {
    for (const match of body.matchAll(/\[[^\]\n]*\]\((?:<([^>\n]+)>|([^\s)]+))(?:\s+"[^"\n]*")?\)/g)) await reference(path, (match[1] ?? match[2])!);
    for (const match of body.matchAll(/^ {0,3}\[[^\]\n]+\]:\s*(?:<([^>\n]+)>|(\S+))/gm)) await reference(path, (match[1] ?? match[2])!);
    for (const match of body.matchAll(/\bresource\s+path\s+(studio\/[a-zA-Z0-9_./-]+)/g)) await reference(path, match[1]!, true);
  }

  async function document(path: string) {
    if (visited.has(path)) return;
    visited.add(path);
    const body = await readFile(await safePath(root, path), 'utf8');
    checked.add(path);
    // Shared migration documentation may describe retained upstream inputs.
    // Runtime syntax is forbidden in active Skill guidance and role instructions.
    if (roots.slice(0, 2).some(prefix => path.startsWith(`${prefix}/`))) {
      issues.push(...runtimeIssues(body).map(issue => ({ path, ...issue })));
    }
    await references(path, body);
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
    let entries;
    try { entries = await readdir(await safePath(root, prefix), { withFileTypes: true }); }
    catch (error) { add(prefix, 'MISSING_TREE', `Cannot inspect required content tree: ${(error as Error).message}`); continue; }
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
      checked.add(path); visited.add(path);
      counts[role ? 'roles' : prefix === '.agents/skills' ? 'skills' : 'onboarding']++;
      issues.push(...result.issues.map(issue => ({ path, ...issue })));
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
    checkedFiles: [...checked].sort(), issues, behaviorVerified: false as const };
}
