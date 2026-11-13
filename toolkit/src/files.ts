import { createHash, randomUUID } from 'node:crypto';
import { lstat, readFile, mkdir, open, rename, unlink, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { StudioError } from './contract.js';

export const hash = (content: string | Buffer): string => createHash('sha256').update(content).digest('hex');

export async function canonicalRoot(input: string): Promise<string> {
  const absolute = resolve(input);
  try { return await realpath(absolute); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const parent = dirname(absolute);
    if (parent === absolute) throw error;
    return join(await canonicalRoot(parent), absolute.slice(parent.length));
  }
}

export async function safePath(root: string, relative: string): Promise<string> {
  if (!relative || isAbsolute(relative) || relative.includes('\\') || relative.includes(':') ||
      relative.split('/').some(part => !part || part === '..' || part === '.')) {
    throw new StudioError('UNSAFE_PATH', `Unsafe relative path: ${relative}`, 4);
  }
  let path = root;
  for (const part of relative.split('/')) {
    path = join(path, part);
    try {
      if ((await lstat(path)).isSymbolicLink()) throw new StudioError('UNSAFE_PATH', `Symbolic link is not a managed file destination: ${path}`, 4);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return path;
}

export async function readText(path: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string | null> {
  try { return await readFile(path, encoding); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function atomicWrite(path: string, content: string | Buffer | null, permissions?: number): Promise<void> {
  if (content === null) {
    try { await unlink(path); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  let mode = permissions ?? 0o644;
  if (permissions === undefined) {
    try { mode = (await lstat(path)).mode & 0o777; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  const handle = await open(temporary, 'wx', mode);
  try {
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    await rename(temporary, path);
  } finally {
    await handle.close();
    await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}
