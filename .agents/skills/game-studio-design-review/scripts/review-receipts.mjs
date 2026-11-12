#!/usr/bin/env node
// Compatibility entry point; use the project's pinned shared implementation.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const result = spawnSync(process.execPath, [resolve('.game-studio/run.cjs'),
  'resource', 'path', 'studio/scripts/review-receipts.mjs', '--json'], { encoding: 'utf8' });
let resource;
try { resource = JSON.parse(result.stdout); } catch { /* handled below */ }
if (result.status !== 0 || resource?.status !== 'ok' || typeof resource?.data?.path !== 'string') {
  console.error('Cannot resolve review receipts from the pinned project runtime. Restore the project runtime before reviewing.');
  process.exitCode = 2;
} else {
  const child = spawnSync(process.execPath, [resource.data.path, ...process.argv.slice(2)], { stdio: 'inherit' });
  if (child.error || child.signal) console.error('The pinned review receipt helper could not complete.');
  process.exitCode = child.status ?? 2;
}
