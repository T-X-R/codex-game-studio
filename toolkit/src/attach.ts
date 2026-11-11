import { readdir } from 'node:fs/promises';
import { basename } from 'node:path';
import { stringify } from 'yaml';
import { StudioError } from './contract.js';
import { canonicalRoot, readText, safePath } from './files.js';
import { planInstall } from './install.js';
import { metadata } from './metadata.js';
import { runtimeFiles } from './runtime.js';
import { resourceFiles, resourcePath } from './resources.js';
import { readConfig } from './config.js';

const pointer = `<!-- game-studio:start -->
## Codex Game Studio

Run toolkit operations from this directory with \`node .game-studio/run.cjs\`.
Use \`--help\` for the installed command set. If the runtime is missing, run
\`game-studio restore --project .\` explicitly; no command downloads it implicitly.
Read installed \`.agents/skills/game-studio-*/SKILL.md\` for the relevant workflow.
Use \`resource path studio/docs/integration.md\` for shared collaboration guidance.
Respect existing project instructions and the user's confirmed scope. In guided
mode, continue implementation and verification without per-file approvals.
<!-- game-studio:end -->`;
const ignores = `# game-studio:start
.game-studio/node_modules/
.game-studio/backups/
.game-studio/cache/
.game-studio/*.lock
.game-studio/transaction.json
project.local.yaml
# game-studio:end`;

function appendBlock(before: string | null, block: string, start: string, end: string) {
  if (before?.includes(start)) {
    if (before.split(start).length !== 2 || before.split(end).length !== 2) {
      throw new StudioError('FILE_CONFLICT', 'Malformed or duplicate managed integration markers', 4);
    }
    return before.slice(0, before.indexOf(start)) + block + before.slice(before.indexOf(end) + end.length);
  }
  if (before?.includes(end)) throw new StudioError('FILE_CONFLICT', 'Unmatched integration marker', 4);
  return `${before ?? ''}${before && !before.endsWith('\n') ? '\n' : ''}${before ? '\n' : ''}${block}\n`;
}

export async function planAttach(rootInput: string, options: { initialize?: boolean; engine?: string } = {}) {
  const root = await canonicalRoot(rootInput);
  const engines: Record<string, string> = { web: 'Web', godot: 'Godot', unity: 'Unity', unreal: 'Unreal' };
  const engine = options.engine ? engines[options.engine.toLowerCase()] : undefined;
  if (options.engine && !engine) throw new StudioError('INVALID_ARGUMENT', 'Engine must be web, godot, unity, or unreal');
  if (options.initialize) {
    let entries: string[] = [];
    try { entries = await readdir(root); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (entries.some(entry => !['.git', '.gitignore', 'AGENTS.md'].includes(entry))) {
      throw new StudioError('FILE_CONFLICT', 'init requires a fresh directory; use attach for an existing game', 4);
    }
    if (!engine) throw new StudioError('NEEDS_INPUT', 'Choose --engine web, godot, unity, or unreal', 4);
  }
  await readConfig(await safePath(root, 'project.yaml'));
  const files = await runtimeFiles();
  const merges: Record<string, string> = {};
  for (const [path, block, start, end] of [
    ['AGENTS.md', pointer, '<!-- game-studio:start -->', '<!-- game-studio:end -->'],
    ['.gitignore', ignores, '# game-studio:start', '# game-studio:end'],
  ] as const) {
    const before = await readText(await safePath(root, path));
    files[path] = appendBlock(before, block, start, end);
    if (before !== null) merges[path] = before;
  }
  for (const prefix of ['.agents/skills', '.codex/agents']) {
    try { await resourcePath(prefix); }
    catch (error) { if (error instanceof StudioError && error.code === 'RESOURCE_MISSING') continue; throw error; }
    for (const [path, content] of Object.entries(await resourceFiles(prefix))) files[`${prefix}/${path}`] = content;
  }
  const plan = await planInstall(root, files, metadata.version, merges);
  if (await readText(await safePath(root, 'project.yaml')) === null) {
    // Project configuration belongs to the game; detach must retain it.
    plan.changes.unshift({ path: 'project.yaml', before: null, after: stringify({ schema_version: 1,
      project: { name: basename(root), ...(options.initialize ? { stage: 'Concept' } : {}) },
      ...(engine ? { engine: { name: engine } } : {}), modes: { automation: 'guided', rigor: 'minimal' } }) });
  }
  return plan;
}
