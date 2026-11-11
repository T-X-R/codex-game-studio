import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { metadata } from './metadata.js';
import { resourcePath } from './resources.js';
import { exists } from './project.js';
import { readText, safePath, atomicWrite } from './files.js';
import { StudioError } from './contract.js';

const execute = promisify(execFile);
export async function runtimeFiles(): Promise<Record<string, string>> {
  return {
    '.game-studio/package.json': `${JSON.stringify({ name: 'game-studio-project-runtime', private: true,
      dependencies: { [metadata.name]: metadata.version } }, null, 2)}\n`,
    '.game-studio/run.cjs': await readFile(await resourcePath('studio/codex/run.cjs.template'), 'utf8'),
  };
}

export async function inspectRuntime(project: string) {
  const packagePath = await safePath(project, '.game-studio/package.json');
  const content = await readText(packagePath);
  if (content === null) return { state: 'unattached', expectedVersion: null, installedVersion: null, entry: null };
  let expectedVersion: string;
  try {
    expectedVersion = JSON.parse(content).dependencies[metadata.name];
    if (typeof expectedVersion !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(expectedVersion)) throw new Error();
  } catch { throw new StudioError('INVALID_INSTALLATION', 'Runtime package must pin an exact toolkit version', 4); }
  const root = await safePath(project, `.game-studio/node_modules/${metadata.name}`);
  const entry = join(root, 'dist/cli.js');
  const installed = await readText(join(root, 'package.json'));
  if (installed === null) return { state: 'missing', expectedVersion, installedVersion: null, entry };
  let value;
  try { value = JSON.parse(installed); }
  catch { throw new StudioError('INVALID_INSTALLATION', 'Malformed installed toolkit package', 4); }
  const state = value.name !== metadata.name || value.version !== expectedVersion ? 'mismatch'
    : await exists(entry) ? 'ready' : 'missing';
  return { state, expectedVersion, installedVersion: value.version, entry };
}

export async function npmPath(): Promise<string> {
  const binary = dirname(process.execPath);
  const candidates = [join(binary, '../lib/node_modules/npm/bin/npm-cli.js'), join(binary, 'node_modules/npm/bin/npm-cli.js')];
  if (process.env.npm_execpath) candidates.unshift(process.env.npm_execpath);
  for (const candidate of candidates) if (await exists(candidate)) return resolve(candidate);
  throw new StudioError('DEPENDENCY_MISSING', 'npm is required to explicitly restore the project runtime', 3);
}

export async function restoreRuntime(project: string, archive?: string, dryRun = false, offline = false) {
  const runtime = await inspectRuntime(project);
  if (runtime.state === 'unattached') throw new StudioError('NEEDS_INPUT', 'Attach this project before restoring its runtime', 4);
  const root = await safePath(project, '.game-studio');
  const lock = await safePath(project, '.game-studio/package-lock.json');
  const locked = await exists(lock);
  if (archive && locked) throw new StudioError('FILE_CONFLICT', 'A runtime lock already exists; restore it without --archive', 4);
  if (!locked && !archive && metadata.private) throw new StudioError('DEPENDENCY_MISSING', 'This build is distributed as a GitHub archive. For the first restore, supply --archive /path/to/game-studio.tgz.', 3);
  const args = [locked ? 'ci' : 'install', '--ignore-scripts', '--no-audit', '--no-fund'];
  if (archive) args.push(join(root, 'runtime.tgz'));
  if (offline) args.push('--offline');
  const plan = { project, expectedVersion: runtime.expectedVersion, process: { executable: 'npm', args, cwd: root },
    network: !offline, writes: ['.game-studio/node_modules/', ...(!locked ? ['.game-studio/package-lock.json'] : []), ...(archive ? ['.game-studio/runtime.tgz'] : [])],
    archive: archive ? resolve(archive) : null };
  if (dryRun) return plan;
  const packagePath = await safePath(project, '.game-studio/package.json');
  const original = (await readText(packagePath))!;
  if (archive) {
    const target = await safePath(project, '.game-studio/runtime.tgz');
    const content = await readFile(resolve(archive));
    if (await exists(target)) {
      if (!(await readFile(target)).equals(content)) throw new StudioError('FILE_CONFLICT', 'Project runtime.tgz differs from the selected archive', 4);
    } else await writeFile(target, content, { flag: 'wx' });
  }
  try {
    await execute(process.execPath, [await npmPath(), ...args], { cwd: root, timeout: 120_000, maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, npm_config_ignore_scripts: 'true' } });
  } catch (error) {
    throw new StudioError('RESTORE_FAILED', `npm could not restore the project runtime: ${(error as Error).message.slice(0, 1000)}`, 3);
  } finally { if (await readText(packagePath) !== original) await atomicWrite(packagePath, original); }
  if (archive) {
    const value = JSON.parse((await readText(lock))!);
    value.packages[''].dependencies = JSON.parse(original).dependencies;
    if (!value.packages[`node_modules/${metadata.name}`]) throw new StudioError('RUNTIME_MISMATCH', 'Archive did not install the expected toolkit package', 4);
    value.packages[`node_modules/${metadata.name}`].resolved = 'file:runtime.tgz';
    await atomicWrite(lock, `${JSON.stringify(value, null, 2)}\n`);
  }
  if ((await inspectRuntime(project)).state !== 'ready') throw new StudioError('RUNTIME_MISMATCH', 'Restored archive does not match the project version pin', 4);
  return plan;
}

export const ownEntry = fileURLToPath(new URL('./cli.js', import.meta.url));
