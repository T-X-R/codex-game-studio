#!/usr/bin/env node
import { mdSectionCommand, formatMdSection } from '../../../dist/md-section.js';
const usage = `Read-only Markdown section observations; qualityAssessed is always false.
Usage: node <resolved-md-section.mjs> --project ROOT COMMAND FILE [ARGS] [--text]
  list FILE                       list heading levels, inclusive lines and titles
  status FILE [HEADING ...]        COMPLETE / EMPTY / PLACEHOLDER observations
  extract FILE HEADING [--body]    bounded section, including nested headings
JSON is the default; --text emits the retained Bash TSV/extracted text (LF).
Relative FILE must stay in ROOT, with no symbolic links. Heading matches ignore
ASCII case, numbers, comments and emphasis; a # prefix pins the heading level.
Exit: 0 observed (including status NOT_FOUND); 1 unreadable; 2 usage/unsupported
write command; 3 extract heading missing; 4 ambiguous heading or unsafe path.
replace, insert-before and set-field are not implemented. No files are written.`;
let text = false;
try {
  const args = process.argv.slice(2), command = []; let root;
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project') { if (root !== undefined || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(usage); root = args[++i]; }
    else if (args[i] === '--text') { if (text) throw new Error(usage); text = true; }
    else if (args[i].startsWith('--') && args[i] !== '--body') throw new Error(usage);
    else command.push(args[i]);
  }
  if (!root) throw new Error(usage);
  const result = await mdSectionCommand(root, command);
  if (text) process.stdout.write(formatMdSection(result.data)); else console.log(JSON.stringify(result.data, null, 2));
  process.exitCode = result.exitCode;
} catch (error) {
  if (text) console.error(`md-section: ${error.message}`);
  else console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? 2;
}
