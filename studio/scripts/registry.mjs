#!/usr/bin/env node
// Invoke the bundled resource returned by `game-studio resource path`.
import { resolve } from 'node:path';
import { registryCommand } from '../../../dist/registry.js';

const help = `Read-only registry observations (JSON; never a semantic verdict).
Usage: node <resolved-registry.mjs> --project ROOT COMMAND [ARGS]
  list [entities|tr|architecture] [--system SLUG]
  get NAME ...
  refs NAME|PATH
  slice PATH
  validate
  compare entities|tr|architecture OLD [NEW]
  next-id tr SLUG | story EPIC | adr | bug | asset | td | sprint | season
Compare snapshot paths are relative to the caller directory, not ROOT.
Exit: 0 observed; 1 unreadable input; 2 usage; 3 unknown name/incomplete read;
4 unsafe path/unsupported layout. validate/compare return 0 for collected findings;
inspect registries[].state and diagnostics. qualityAssessed is always false.
No registry, source document, status or ID reservation is written.
`;
try {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) console.log(help);
  else {
    let project;
    const command = [];
    for (let index = 0; index < args.length; index++) {
      if (args[index] === '--project') {
        if (project !== undefined || !args[index + 1] || args[index + 1].startsWith('--')) throw Object.assign(new Error('--project requires one root.'), { exitCode: 2 });
        project = args[++index];
      } else command.push(args[index]);
    }
    if (!project) throw Object.assign(new Error('Supply --project ROOT explicitly.'), { exitCode: 2 });
    const result = await registryCommand(resolve(project), command);
    console.log(JSON.stringify(result.data, null, 2)); process.exitCode = result.exitCode;
  }
} catch (error) {
  console.log(JSON.stringify({ qualityAssessed: false, error: { code: error.code ?? 'READ_FAILED', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? 1;
}
