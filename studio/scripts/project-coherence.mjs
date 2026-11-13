#!/usr/bin/env node
import { inspectProjectCoherence, formatProjectCoherence } from '../../../dist/project-coherence.js';
const usage = 'Usage: node <resolved-project-coherence.mjs> --project ROOT [--probe] [--timeout MS] [--text]';
try {
  const args = process.argv.slice(2), seen = new Set(); let root, probe = false, text = false, timeoutMs;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { console.log(usage); process.exit(0); }
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`); seen.add(arg);
    if (arg === '--project' || arg === '--timeout') {
      const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(usage);
      if (arg === '--project') root = value; else timeoutMs = Number(value);
    } else if (arg === '--probe') probe = true;
    else if (arg === '--text') text = true;
    else throw new Error(usage);
  }
  if (!root) throw new Error(usage);
  const result = await inspectProjectCoherence(root, { probe, timeoutMs });
  if (text) process.stdout.write(formatProjectCoherence(result));
  else console.log(JSON.stringify({ status: 'observed', ...result }, null, 2));
  process.exitCode = result.exitCode;
} catch (error) {
  console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? (error.code ? 1 : 2);
}
