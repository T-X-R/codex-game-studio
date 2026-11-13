import { lstat, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { canonicalRoot, readText, safePath } from './files.js';
import { parseConfig, readSettings } from './config.js';
import { prototypeName } from './prototype.js';
import { exists } from './project.js';
import { runProcess } from './process.js';
import { StudioError } from './contract.js';
import { isMap } from 'yaml';

interface Check { id: string; status: 'pass' | 'blocked' | 'not_assessed'; reason: string; paths: string[] }

/** Read-only prerequisites, not permission to grow or proof of gameplay equivalence. */
export async function inspectGrowth(input: string, name: string) {
  const project = await canonicalRoot(input);
  const source = prototypeName(name);
  const checks: Check[] = [];
  const add = (id: string, pass: boolean, reason: string, paths: string[] = []) => {
    checks.push({ id, status: pass ? 'pass' : 'blocked', reason, paths });
  };
  const entry = await safePath(project, `${source}/index.html`);
  add('prototype', !/(?:-concept$|-spike-|-vertical-slice$)/.test(name) && await exists(entry) && (await lstat(entry)).isFile(),
    'Growth needs a standalone index.html prototype, not a concept, engine spike or vertical slice.', [source]);
  // Validate declared values before settings fallback can discard an invalid engine name.
  const content = await readText(await safePath(project, 'project.yaml'));
  const document = parseConfig(content ?? '{}', 'project.yaml');
  const engineBlock = document.get('engine', true);
  const { settings, warnings } = await readSettings(project, ['engine.name', 'engine.code_root']);
  const engine = document.getIn(['engine', 'name']) ?? settings['engine.name']?.value;
  const validBlock = engineBlock === undefined || document.get('engine') === null || isMap(engineBlock);
  add('engine', validBlock && (engine == null || engine === '' || engine === 'Web'),
    validBlock ? `Growth requires an unset or Web engine; found ${JSON.stringify(engine ?? null)}.` : 'engine must be a mapping with a name field, or unset.');
  const codeRoot = document.getIn(['engine', 'code_root']) ?? settings['engine.code_root']?.value;
  const normalized = typeof codeRoot === 'string' ? codeRoot.replace(/^\.\//, '').replace(/\/$/, '') : codeRoot;
  add('code_root', codeRoot == null || codeRoot === '' || normalized === 'src', 'The Web growth scaffold uses src/; a different configured code root must be resolved first.');

  const conflicts: string[] = [];
  for (const path of ['package.json', 'index.html', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock',
    'bun.lock', 'bun.lockb', 'tsconfig.json', 'vite.config.ts', 'vite.config.js', 'playwright.config.ts', 'playwright.config.js']) {
    if (await exists(await safePath(project, path))) conflicts.push(path);
  }
  async function inspectCode(path: string) {
    const absolute = await safePath(project, path);
    if (!(await exists(absolute))) return;
    if (!(await lstat(absolute)).isDirectory()) { conflicts.push(path); return; }
    for (const entry of await readdir(absolute, { withFileTypes: true })) {
      const child = `${path}/${entry.name}`;
      await safePath(project, child);
      if (entry.isDirectory()) await inspectCode(child);
      else if (!entry.isFile() || !(entry.name === '.gitkeep' || ['src/AGENTS.md', 'src/CLAUDE.md', 'src/README.md'].includes(child))) conflicts.push(child);
    }
  }
  await inspectCode('src');
  const git = { state: 'none', sourceCommit: null as string | null, prototypeTag: null as string | null,
    grownTags: [] as string[], dirtyBriefs: [] as string[] };
  let marker = project;
  while (!(await exists(join(marker, '.git'))) && dirname(marker) !== marker) marker = dirname(marker);
  if (await exists(join(marker, '.git'))) {
    git.state = 'not_assessed';
    async function run(...args: string[]) {
      const result = await runProcess('git', ['--no-optional-locks', '--literal-pathspecs', '-c', 'core.fsmonitor=false',
        '-c', 'status.relativePaths=true', '-c', 'log.showSignature=false', ...args], { cwd: project, timeoutMs: 15_000 });
      if (result.exitCode !== 0) throw new StudioError('GIT_INSPECTION_FAILED', `Git inspection failed (${result.exitCode}): ${result.stderr.trim()}`, 3);
      return result.stdout;
    }
    try {
      const status = await run('status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=matching', '--', source, 'design/game-brief.md');
      const dirty = new Set<string>();
      const records = status.split('\0');
      const briefs = new Set<string>();
      for (let index = 0; index < records.length; index++) {
        const record = records[index]!;
        if (!record) continue;
        const paths = [record.slice(3)];
        // In -z format a rename's destination is followed by its original path.
        if (/[RC]/.test(record.slice(0, 2))) paths.push(records[++index]!);
        for (const path of paths) {
          if (path === `${source}/brief.md` || path === 'design/game-brief.md') briefs.add(path);
          else if (path.startsWith(`${source}/`) && !path.startsWith(`${source}/evidence/`) && !path.startsWith(`${source}/dist/`)) dirty.add(path);
        }
      }
      git.dirtyBriefs = [...briefs].sort();
      add('clean', dirty.size === 0, dirty.size ? 'Prototype changes must be committed or undone by their owner before growing.' : 'No uncommitted prototype code changes.', [...dirty].sort());
      const tags = (await run('tag', '--list', 'grown/*', `one-shot/${name}`)).trim().split('\n').filter(Boolean);
      git.grownTags = tags.filter(tag => tag.startsWith('grown/'));
      if ((await run('rev-parse', '--is-inside-work-tree')).trim() !== 'true') {
        throw new StudioError('GIT_INSPECTION_FAILED', 'Growth requires a working tree, not a bare repository.', 3);
      }
      // An unborn repository has no source commit; status still blocks untracked game files.
      if ((await run('rev-parse', '--revs-only', 'HEAD')).trim()) {
        git.sourceCommit = (await run('log', '-1', '--format=%H', '--', source)).trim() || null;
      }
      if (tags.includes(`one-shot/${name}`)) git.prototypeTag = (await run('rev-parse', '--verify', `refs/tags/one-shot/${name}^{commit}`)).trim();
      git.state = 'available';
    } catch (error) {
      if (!(error instanceof StudioError)) throw error;
      checks.push({ id: 'git', status: 'not_assessed', reason: error.message, paths: [] });
    }
  } else {
    warnings.push('Not a Git project: the unchanged prototype folder is the backup; no commits or tags are available.');
  }
  add('root', conflicts.length === 0 && git.grownTags.length === 0,
    git.grownTags.length ? `This repository already has grown tags: ${git.grownTags.join(', ')}.` : 'Growth requires no existing game files or conflicting Web toolchain configuration.', conflicts.sort());
  if (!(await exists(await safePath(project, `${source}/config.js`)))) warnings.push('No config.js: imported values remain in code until explicitly extracted; no tuning data was assessed.');
  const exitCode = checks.some(row => row.status === 'blocked') ? 4 : checks.some(row => row.status === 'not_assessed') ? 3 : 0;
  return { project, source, eligible: exitCode === 0, exitCode, checks, git, warnings,
    verification: { state: 'not_assessed', reason: 'Eligibility only. No copy, dependency install, build, replay, tests or human play occurred.' } };
}
