#!/usr/bin/env node
// Read-only observations, resolved from the project's pinned resource archive.
import { readStoryFacts, formatStoryFacts } from '../../../dist/story-facts.js';

const usage = 'Usage: node <resolved-story-facts.mjs> --project ROOT [--all | --sprint | PATH...] [--lint] [--granularity coarse|balanced|fine] [--text]';
const args = process.argv.slice(2);
if (args.length === 1 && ['--help', '-h'].includes(args[0])) console.log(usage);
else {
  try {
    let root, text = false;
    const options = { scope: 'all', paths: [], lint: false, granularity: 'coarse' };
    const take = index => { const value = args[index + 1]; if (!value || value.startsWith('--')) throw new Error(usage); return value; };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--help' || arg === '-h') { console.log(usage); process.exit(0); }
      if (arg === '--project') { root = take(i); i++; }
      else if (arg === '--all') options.scope = 'all';
      else if (arg === '--sprint') options.scope = 'sprint';
      else if (arg === '--lint') options.lint = true;
      else if (arg === '--text') text = true;
      else if (arg === '--granularity') { options.granularity = take(i); i++; }
      else if (arg.startsWith('--granularity=')) options.granularity = arg.slice('--granularity='.length);
      else if (arg.startsWith('-')) throw new Error(usage);
      else { options.paths.push(arg); options.scope = 'paths'; }
    }
    if (!root) throw new Error(usage);
    const result = await readStoryFacts(root, options);
    if (text) { process.stdout.write(formatStoryFacts(result)); if (result.sprintMissing) console.error('story-facts: no production/sprint-status.yaml; --sprint has no story paths to read (try --all)'); }
    else console.log(JSON.stringify({ status: 'observed', ...result }, null, 2));
    process.exitCode = result.exitCode;
  } catch (error) {
    console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
    process.exitCode = error.exitCode ?? (error.code ? 1 : 2);
  }
}
