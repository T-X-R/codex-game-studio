#!/usr/bin/env node
// Read-only resource; invoke the copy resolved by the project's pinned runtime.
import { readStoryStatus, formatStoryStatus } from '../../../dist/story-status.js';

const args = process.argv.slice(2);
const usage = 'Usage: node <resolved-story-status.mjs> --project ROOT [--text]';
if (args.length === 1 && ['--help', '-h'].includes(args[0])) console.log(usage);
else if (args[0] !== '--project' || !args[1] || args[1].startsWith('--') || args.length > 3 || (args[2] !== undefined && args[2] !== '--text')) {
  console.error(usage); process.exitCode = 2;
} else {
  try {
    const result = await readStoryStatus(args[1]);
    if (args[2] === '--text') process.stdout.write(formatStoryStatus(result));
    else console.log(JSON.stringify({ status: 'observed', ...result }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false,
      error: { code: error.code ?? 'READ_FAILED', message: error.message } }, null, 2));
    process.exitCode = error.code === 'UNSAFE_PATH' ? 4 : 1;
  }
}
