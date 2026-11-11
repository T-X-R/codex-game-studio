import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { resourceFiles } from './resources.js';
import { safePath, readText } from './files.js';
import { exists } from './project.js';
import { StudioError } from './contract.js';

type Files = Record<string, Buffer>;
function prototypeName(name: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(name)) throw new StudioError('INVALID_ARGUMENT', 'Prototype name must contain 1–40 lowercase letters, digits or hyphens, starting with a letter or digit');
  return `prototypes/${name}`;
}
async function writeNewDirectory(project: string, relative: string, files: Files, dryRun: boolean) {
  const target = await safePath(project, relative);
  if (await exists(target)) throw new StudioError('FILE_CONFLICT', `Destination already exists: ${relative}`, 4);
  for (const path of Object.keys(files)) await safePath(target, path);
  const plan = { project, directory: relative, files: Object.entries(files).map(([path, content]) => ({
    path: `${relative}/${path}`, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex'),
  })) };
  if (dryRun) return plan;
  await mkdir(dirname(target), { recursive: true });
  // Claim the new directory exclusively. Never replace even an empty existing folder.
  try { await mkdir(target); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StudioError('FILE_CONFLICT', `Destination appeared during planning: ${relative}`, 4);
    throw error;
  }
  for (const [path, content] of Object.entries(files)) {
    const destination = await safePath(target, path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content, { flag: 'wx' });
  }
  return plan;
}

export async function scaffoldPrototype(project: string, name: string, title = name.replaceAll('-', ' '), question = '(not set)', dryRun = false) {
  const relative = prototypeName(name);
  const template = await resourceFiles('studio/templates/web-prototype');
  const html = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const line = question.replace(/[\r\n\u2028\u2029]/g, ' ').replace(/--+/g, '- ');
  const replacements: Record<string, string> = {
    "const TITLE = '@TITLE@';": `const TITLE = ${JSON.stringify(title).replaceAll('<', '\\u003c')};`,
    '@TITLE@': html(title), '@QUESTION@': line, '@DATE@': new Date().toISOString().slice(0, 10),
  };
  const files: Files = {};
  for (const [path, content] of Object.entries(template)) {
    files[path] = Buffer.from(content.replace(/const TITLE = '@TITLE@';|@TITLE@|@QUESTION@|@DATE@/g, token => replacements[token]!));
  }
  files['assets/provenance.yaml'] = Buffer.from('# Record origin, licence, source URL and date for each shipped asset.\nassets: []\n');
  const brief = await readText(await safePath(project, 'design/game-brief.md'));
  if (brief !== null) files['brief.md'] = Buffer.from(brief);
  return writeNewDirectory(project, relative, files, dryRun);
}

async function collect(source: string, packaging = false): Promise<Files> {
  const files: Files = {};
  const excluded = new Set(['node_modules', 'dist', ...(packaging ? ['evidence', 'tune.js', 'bot.js', 'brief.md', 'feel-log.md', 'REPORT.md'] : [])]);
  async function visit(relative: string) {
    for (const entry of await readdir(join(source, relative), { withFileTypes: true })) {
      if (entry.name.startsWith('.') || excluded.has(entry.name)) continue;
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      const absolute = await safePath(source, path);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files[path] = await readFile(absolute);
      else throw new StudioError('UNSAFE_PATH', `Only regular game files can be copied: ${path}`, 4);
    }
  }
  await visit('');
  if (!files['index.html']) throw new StudioError('DEPENDENCY_MISSING', 'The game directory must contain index.html', 3);
  return files;
}

export async function importPrototype(project: string, source: string, name: string, dryRun = false) {
  return writeNewDirectory(project, prototypeName(name), await collect(resolve(source)), dryRun);
}

export async function packagePrototype(project: string, folder: string, output: string, dryRun = false) {
  const source = await safePath(project, folder);
  const target = await safePath(project, output);
  if (target === source || target.startsWith(`${source}/`)) throw new StudioError('INVALID_ARGUMENT', 'Package output must be outside the source game directory');
  const files = await collect(source, true);
  files['index.html'] = Buffer.from(files['index.html']!.toString('utf8').replace(/<script\b[^>]*\bsrc\s*=\s*["'](?:\.\/)?tune\.js["'][^>]*>\s*<\/script>/gi, ''));
  for (const [path, content] of Object.entries(files)) {
    if (/\.(?:html?|[cm]?js|css|json)$/i.test(path) && /\btune\.js\b/.test(content.toString('utf8'))) {
      throw new StudioError('CHECK_FAILED', `Development-only tune.js reference remains in ${path}`, 5);
    }
  }
  return writeNewDirectory(project, output, files, dryRun);
}
