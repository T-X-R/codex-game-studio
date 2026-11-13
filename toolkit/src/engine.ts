import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Json, Setting } from './config.js';
import { StudioError } from './contract.js';
import { safePath } from './files.js';
import { resourcePath } from './resources.js';

const frameworkDirectories = ['.claude', '.codex', '.agents', '.game-studio', '.git', 'toolkit', 'studio',
  'production', 'design', 'docs', 'studio-tests', 'prototypes'];
export const excludedCodeDirectories = [...frameworkDirectories, 'tests', 'tools', 'node_modules', 'dist'];

async function inspectRoot(root: string, value: Json, source: string, kind: 'code' | 'test' | 'asset', explicit: boolean, allowMissing = false): Promise<Json> {
  if (value === null) return { value: null, source: 'unset', state: 'unset' };
  const invalid = (reason: string): Json => ({ value, source, state: 'invalid', reason });
  if (typeof value !== 'string') return invalid('Expected a project-relative directory');
  if (/[<>]/.test(value)) return { value, source, state: 'not_assessed', reason: 'Replace the engine module placeholder with an explicit project directory' };
  let path = value;
  while (path.startsWith('./')) path = path.slice(2);
  path = path.replace(/\/+$/, '') || '.';
  if (value.startsWith('/') || value.startsWith('~') || /[\\:]/.test(value)) return invalid('Use a project-relative path with forward slashes');
  if (path === '.') return { value: '.', source, state: 'available' };
  const first = path.split('/')[0]!.toLowerCase();
  if (kind !== 'asset' && (frameworkDirectories.includes(first) || kind === 'code' && first === 'tests')) return invalid('Framework or test directories are not a game code root');
  try {
    await safePath(root, path);
    let directory = root;
    for (const part of path.split('/')) {
      const entries = await readdir(directory);
      if (!entries.includes(part)) {
        const actual = entries.find(entry => entry.toLowerCase() === part.toLowerCase());
        if (actual) return invalid(`Directory is spelled ${actual}, not ${part}`);
        return { value: path, source, state: explicit && !allowMissing ? 'invalid' : 'missing', reason: `Directory does not exist: ${path}` };
      }
      directory = join(directory, part);
      if (!(await stat(directory)).isDirectory()) return invalid(`Not a directory: ${part}`);
    }
    return { value: path, source, state: 'available' };
  } catch (error) {
    if (error instanceof StudioError && error.code === 'UNSAFE_PATH') return invalid(error.message);
    throw error;
  }
}

export async function resolveEngineRow(root: string, settings: Record<string, Setting>, options: { allowMissing?: boolean } = {}): Promise<Json> {
  const table = await readFile(await resourcePath('studio/engines/engines.tsv'), 'utf8');
  const [header, ...rows] = table.trimEnd().split(/\r?\n/).map(line => line.split('\t'));
  if (header?.join(',') !== 'engine,code_root,test_root,asset_root,run,build,test,smoke' || rows.some(row => row.length !== 8)) {
    throw new StudioError('INVALID_RESOURCE', 'The bundled engine command table is malformed', 3);
  }
  const engine = settings['engine.name']!;
  const row = rows.find(row => row[0] === engine.value);
  const defaults = Object.fromEntries((header ?? []).map((key, i) => [key, row?.[i] === '-' ? null : row?.[i] ?? null]));
  const code = settings['engine.code_root']!;
  const tests = settings['engine.test_root']!;
  let codeValue = code.value ?? defaults.code_root ?? null;
  let codeSource = code.value !== null ? code.source : engine.source;
  let ambiguous = false;
  if (codeValue === null) {
    const candidates = (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory() && ['src', 'Assets', 'Source'].includes(entry.name));
    if (candidates.length === 1) { codeValue = candidates[0]!.name; codeSource = 'detected'; }
    else if (candidates.length > 1) ambiguous = true;
  }
  return {
    engine: { value: engine.value, source: engine.source },
    code_root: ambiguous ? { value: null, source: 'detected', state: 'not_assessed', reason: 'Multiple engine code roots exist; configure engine.name or engine.code_root' }
      : await inspectRoot(root, codeValue, codeSource, 'code', code.value !== null, options.allowMissing),
    test_root: await inspectRoot(root, tests.value ?? defaults.test_root ?? null, tests.value !== null ? tests.source : engine.source, 'test', tests.value !== null, options.allowMissing),
    asset_root: await inspectRoot(root, defaults.asset_root ?? null, 'engine table', 'asset', false),
    commands: Object.fromEntries(['run', 'build', 'test', 'smoke'].map(key => [key, defaults[key] ?? null])),
    excluded_code_directories: excludedCodeDirectories,
  };
}
