#!/usr/bin/env node
// Skill-private input collection; shared review-receipts owns hashing/comparison.
import { readdir, realpath, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { isAbsolute, relative, resolve } from 'node:path';

const skill = '.agents/skills/game-studio-architecture-review';
const [mode, ...args] = process.argv.slice(2);
const root = await realpath(process.cwd());
const normalize = path => path.replaceAll('\\', '/').replace(/^\.\//, '');
const within = path => !isAbsolute(path) && !/^[A-Za-z]:|[\r\n\0]/.test(path)
  && !relative(root, resolve(root, path)).split(/[\\/]/).includes('..');
function pinned(args) {
  const result = spawnSync(process.execPath, [resolve(root, '.game-studio/run.cjs'), ...args, '--json'],
    { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`Pinned ${args[0]} failed: ${result.error?.message ?? result.stderr.trim()}`);
  const response = JSON.parse(result.stdout);
  if (response.status !== 'ok' || !response.data) throw new Error(`Invalid pinned ${args[0]} response`);
  return response.data;
}
async function expand(directory, matches, pattern) {
  try {
    const actual = await realpath(resolve(root, directory));
    if (!within(relative(root, actual))) throw new Error(`Unsafe input directory: ${directory}`);
    const paths = (await readdir(actual, { withFileTypes: true }))
      .filter(entry => !entry.name.startsWith('.') && (entry.isFile() || entry.isSymbolicLink()) && matches(entry.name))
      .map(entry => `${directory}/${entry.name}`);
    return paths.length ? paths : [pattern];
  } catch (error) {
    if (error.code === 'ENOENT') return [pattern];
    throw error;
  }
}
try {
  if (!['list', 'hash', 'check'].includes(mode) || (mode === 'check' && !args.length)) {
    throw new Error('Usage: review-inputs.mjs list [extra-file...] | hash [extra-file...] | check <prior-report> [extra-file...]');
  }
  const report = mode === 'check' ? args.shift() : undefined;
  if (report !== undefined && !within(report)) throw new Error('Review path must stay inside the game root');
  const config = pinned(['config', 'get']);
  const settings = config.settings;
  if (!settings || !Object.hasOwn(settings, 'engine.name')) throw new Error('Config response lacks engine.name setting');
  const engine = settings['engine.name'].value;
  if (engine !== null && !['Godot', 'Unity', 'Unreal', 'Web'].includes(engine)) throw new Error('Invalid configured engine');
  const resource = pinned(['resource', 'path', 'studio/scripts/review-receipts.mjs']);
  if (typeof resource.path !== 'string') throw new Error('Receipt resource has no path');
  const helper = normalize(relative(root, await realpath(resource.path)));
  if (!within(helper)) throw new Error('Receipt helper must be inside the pinned game root');
  const paths = [
    'AGENTS.md', 'project.yaml', 'project.local.yaml', 'docs/technical-preferences.md',
    'docs/architecture/tr-registry.yaml', 'docs/architecture/architecture.md', 'docs/consistency-failures.md',
    '.codex/config.toml', '.game-studio/run.cjs', '.game-studio/package.json', '.game-studio/runtime-lock.json',
    `${skill}/SKILL.md`, `${skill}/scripts/review-inputs.mjs`, helper, ...args,
    ...await expand('docs/architecture', name => /^adr-.*\.md$/.test(name), 'docs/architecture/adr-*.md'),
    ...await expand('design/gdd', name => name.endsWith('.md'), 'design/gdd/*.md'),
    ...await expand(`${skill}/references`, name => name.endsWith('.md'), `${skill}/references/*.md`),
  ];
  if (engine !== null) {
    const directory = `docs/engine-reference/${engine.toLowerCase()}`;
    paths.push(...await expand(directory, name => name.endsWith('.md'), `${directory}/*.md`),
      ...await expand(`${directory}/modules`, name => name.endsWith('.md'), `${directory}/modules/*.md`));
  }
  // Settings can originate in a local override, a project field or a legacy mirror.
  for (const setting of Object.values(settings)) {
    const source = typeof setting?.source === 'string' ? setting.source.split(':')[0] : '';
    if (/\.(?:md|ya?ml|json|toml|txt)$/.test(source)) paths.push(source);
  }
  const inputs = [...new Set(paths.map(normalize))].sort();
  if (inputs.some(path => !within(path))) throw new Error('Input paths must stay inside the game root');
  if (mode === 'list') {
    const missing = [], unresolved = [];
    for (const path of inputs) {
      try {
        const actual = await realpath(resolve(root, path));
        if (!within(relative(root, actual)) || !(await stat(actual)).isFile()) throw new Error(`Unsafe/non-file input: ${path}`);
      } catch (error) {
        if (error.code === 'ENOENT') (/[*?[]/.test(path) ? unresolved : missing).push(path);
        else throw error;
      }
    }
    console.log(JSON.stringify({ qualityAssessed: false, engine, inputs, missing, unresolved, warnings: config.warnings ?? [] }));
    if (unresolved.length) process.exitCode = 2;
  } else {
    const result = spawnSync(process.execPath, [resolve(root, helper), mode, ...(report === undefined ? [] : [report]), ...inputs],
      { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 2;
  }
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 2;
}
