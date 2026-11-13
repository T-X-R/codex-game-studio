#!/usr/bin/env node
// Observation-only SHA-256 receipts. Run from the game root; no writes or verdicts.
import { readFile, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isAbsolute, relative, resolve } from 'node:path';

const [mode, ...args] = process.argv.slice(2);
const root = await realpath(process.cwd());
const stamps = new Map();
let failed = false;
const normalize = value => value.replaceAll('\\', '/').replace(/^\.\//, '');
const invalid = path => /[\r\n\0]/.test(path) || isAbsolute(path) || /^[A-Za-z]:/.test(path)
  || relative(root, resolve(root, path)).split(/[\\/]/).includes('..');
const unresolved = path => /[*?[]/.test(path);
const diagnostic = message => { console.error(message); failed = true; };

async function inspect(path) {
  if (invalid(path)) return { error: 'path must stay inside the game root' };
  const location = resolve(root, path);
  try {
    const actual = await realpath(location);
    if (relative(root, actual).split(/[\\/]/).includes('..')) return { error: 'symlink leaves the game root' };
    if (!(await stat(actual)).isFile()) return { error: 'not a regular file' };
    const bytes = await readFile(actual);
    return { bytes, hash: `sha256:${createHash('sha256').update(bytes).digest('hex')}` };
  } catch (error) {
    if (error.code === 'ENOENT') return { missing: true };
    return { error: error.code ?? 'unreadable' };
  }
}

if (!['hash', 'check'].includes(mode) || args.length === 0) {
  console.error('Usage: review-receipts.mjs hash <file>... | check <review-log> [file]...');
  process.exitCode = 2;
} else if (mode === 'hash') {
  for (const path of [...new Set(args.map(normalize))]) {
    const item = await inspect(path);
    if (item.error) diagnostic(`ERROR: ${path} — ${item.error}`);
    else if (item.missing && unresolved(path)) diagnostic(`UNRESOLVED: ${path}`);
    else if (item.missing) console.error(`Not stamped, no such file: ${path}`);
    else console.log(`Reviewed-Content-Hash: ${path} ${item.hash}`);
  }
  process.exitCode = failed ? 2 : 0;
} else {
  const receiptPath = normalize(args.shift());
  const receipt = await inspect(receiptPath);
  if (receipt.error) diagnostic(`ERROR: ${receiptPath} — ${receipt.error}`);
  const content = receipt.bytes?.toString('utf8') ?? '';
  const lines = content.split(/\r?\n/);
  const historicalPaths = new Set();
  const latestEntry = lines.findLastIndex(line => /^##[ \t]+Review(?:[ \t]+[—-]|[ \t]*$)/i.test(line));
  for (const [index, line] of lines.entries()) {
    const match = /^Reviewed-Content-Hash: (.+) (\S+)$/.exec(line);
    if (!match) continue;
    const path = normalize(match[1]);
    historicalPaths.add(path);
    // Never combine older evidence with the latest entry's deeper review metadata.
    if (index > latestEntry) stamps.set(path, match[2]);
  }
  console.log(stamps.size ? `RECEIPT: ${receiptPath}` : 'RECEIPT: NONE');
  const paths = [...new Set([...args.map(normalize), ...historicalPaths])];
  for (const path of paths) {
    const item = await inspect(path);
    if (item.error) { console.log(`ERROR: ${path}`); diagnostic(`Cannot compare ${path}: ${item.error}`); }
    else if (item.missing && unresolved(path)) { console.log(`UNRESOLVED: ${path}`); failed = true; }
    else if (item.missing && historicalPaths.has(path)) console.log(`GONE: ${path}`);
    else if (!item.missing) console.log(`${!stamps.has(path) ? 'NEW' : stamps.get(path) === item.hash ? 'UNCHANGED' : 'CHANGED'}: ${path}`);
  }
  process.exitCode = failed ? 2 : 0;
}
