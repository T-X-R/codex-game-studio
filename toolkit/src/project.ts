import { access, realpath, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { StudioError } from './contract.js';

export async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

export async function resolveProject(explicit?: string, cwd = process.cwd()): Promise<string> {
  let path = resolve(explicit ?? cwd);
  if (!(await exists(path)) || !(await stat(path)).isDirectory()) {
    throw new StudioError('PROJECT_NOT_FOUND', `Not a directory: ${path}`, 4);
  }
  path = await realpath(path);
  while (true) {
    if (await exists(join(path, 'project.yaml')) || await exists(join(path, '.game-studio/install.json'))) return path;
    const parent = dirname(path);
    if (explicit || path === parent || await exists(join(path, '.git'))) break;
    path = parent;
  }
  throw new StudioError('PROJECT_NOT_FOUND', 'No initialized game project found. Use game-studio init or attach.', 4);
}
