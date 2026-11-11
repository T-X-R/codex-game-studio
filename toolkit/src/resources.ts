import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { safePath } from './files.js';
import { exists } from './project.js';
import { StudioError } from './contract.js';

export const resourceRoot = fileURLToPath(new URL('../resources/', import.meta.url));

export async function resourcePath(id: string): Promise<string> {
  const path = await safePath(resourceRoot, id);
  if (!(await exists(path))) throw new StudioError('RESOURCE_MISSING', `No bundled resource: ${id}`, 3);
  return path;
}

export async function resourceFiles(prefix: string): Promise<Record<string, string>> {
  const root = await resourcePath(prefix);
  const files: Record<string, string> = {};
  async function visit(directory: string, relative: string) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new StudioError('UNSAFE_PATH', `Resource cannot be a symbolic link: ${path}`, 4);
      if (entry.isDirectory()) await visit(join(directory, entry.name), path);
      else files[path] = await readFile(join(directory, entry.name), 'utf8');
    }
  }
  await visit(root, '');
  return files;
}
