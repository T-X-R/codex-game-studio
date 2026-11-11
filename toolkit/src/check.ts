import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { safePath } from './files.js';
import { exists } from './project.js';

export async function checkPrototype(directory: string) {
  const html = await readFile(await safePath(directory, 'index.html'), 'utf8');
  const checks: { id: string; status: 'ok' | 'failed' | 'not_assessed'; message: string }[] = [];
  let index = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attributes = match[1]!;
    const source = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1];
    const type = /\btype\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1];
    const id = source ?? `inline-script-${++index}`;
    if (type && !['text/javascript', 'application/javascript'].includes(type)) {
      checks.push({ id, status: 'not_assessed', message: `Static classic-script parser does not assess ${type}` }); continue;
    }
    let code = match[2]!;
    if (source) {
      if (/^(?:[a-z]+:|\/\/)/i.test(source)) {
        checks.push({ id, status: 'not_assessed', message: 'Remote script was not fetched' }); continue;
      }
      const path = await safePath(directory, decodeURIComponent(source.split(/[?#]/)[0]!.replace(/^\.\//, '')));
      if (!(await exists(path))) { checks.push({ id, status: 'failed', message: 'Local script is missing' }); continue; }
      code = await readFile(path, 'utf8');
    }
    try { new Script(code, { filename: id }); checks.push({ id, status: 'ok', message: 'Classic JavaScript parses; not executed' }); }
    catch (error) { checks.push({ id, status: 'failed', message: (error as Error).message }); }
  }
  return { checks, browser: { status: 'not_assessed', reason: 'Static parsing does not establish browser behavior, playability or fun.' } };
}
