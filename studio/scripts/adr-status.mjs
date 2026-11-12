#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { readAdrStatus, formatAdrStatus } from '../../../dist/adr-status.js';

const usage = 'Usage: node <resolved-adr-status.mjs> --project ROOT [ID|PATH...] [--text]';
try {
  const args = process.argv.slice(2), selectors = []; let root, text = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') { console.log(usage); process.exit(0); }
    if (arg === '--project') { root = args[++i]; if (!root || root.startsWith('--')) throw new Error(usage); }
    else if (arg === '--text') text = true;
    else if (arg.startsWith('-')) throw new Error(usage);
    else selectors.push(arg);
  }
  if (!root) throw new Error(usage);
  let template;
  try { template = { path: 'studio/templates/architecture-decision-record.md', content: await readFile(new URL('../templates/architecture-decision-record.md', import.meta.url), 'utf8') }; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const result = await readAdrStatus(root, { selectors, template });
  if (text) process.stdout.write(formatAdrStatus(result));
  else console.log(JSON.stringify({ status: 'observed', ...result }, null, 2));
  process.exitCode = result.exitCode;
} catch (error) {
  console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? (error.code ? 1 : 2);
}
