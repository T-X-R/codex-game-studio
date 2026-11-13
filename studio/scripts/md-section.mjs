#!/usr/bin/env node
import { mdSectionCommand, formatMdSection } from '../../../dist/md-section.js';
const usage = `Markdown section observations and scoped writes; qualityAssessed is always false.
Usage: node <resolved-md-section.mjs> --project ROOT COMMAND FILE [ARGS] [--text]
  list FILE                       list heading levels, inclusive lines and titles
  status FILE [HEADING ...]        COMPLETE / EMPTY / PLACEHOLDER observations
  extract FILE HEADING [--body]    bounded section, including nested headings
  replace FILE HEADING             replace complete body with piped UTF-8 stdin
  insert-before FILE HEADING       insert piped UTF-8 stdin above a heading
  set-field FILE FIELD VALUE [--after FIELD2]  update first field or add after anchor
JSON is the default; --text emits retained Bash TSV/extracted text (LF).
For writes, --dry-run previews action/line with applied:false and no file effects.
Place wrapper flags before the write command or after its mandatory operands.
Required write operands and the --after value are literal, including --text.
Relative FILE must stay in ROOT, with no symbolic links. Real writes reject hard
links and invalid UTF-8; unchanged operations preserve bytes/mtime. Existing file
write permission is required. Ordinary mode bits are retained; replacement changes
inode and does not preserve arbitrary ACLs/xattrs. No-op does not stage a tempfile.
Heading matches ignore ASCII case, numbers, comments and emphasis; # pins level.
Exit: 0 observed/applied/previewed; 1 read/write/UTF-8 file error; 2 usage or invalid
stdin; 3 missing heading/field; 4 ambiguous heading, unsafe path or file conflict.
Dry-run is not proof of write permission or a reserved transaction. No quality or
workflow approval is inferred. Use the caller's already authorized write scope.`;
let text = false;
try {
  const args = process.argv.slice(2), command = []; let root, dryRun = false;
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) { console.log(usage); process.exit(0); }
  for (let i = 0; i < args.length; i++) {
    const writing = ['replace', 'insert-before', 'set-field'].includes(command[0]);
    const required = command[0] === 'set-field' ? 4 : 3;
    if (writing && command.length < required) command.push(args[i]);
    else if (writing && command[0] === 'set-field' && args[i] === '--after') {
      command.push(args[i]); if (i + 1 < args.length) command.push(args[++i]);
    } else if (args[i] === '--project') { if (root !== undefined || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(usage); root = args[++i]; }
    else if (args[i] === '--text') { if (text) throw new Error(usage); text = true; }
    else if (args[i] === '--dry-run') { if (dryRun) throw new Error(usage); dryRun = true; }
    else if (args[i].startsWith('--') && args[i] !== '--body') throw new Error(usage);
    else command.push(args[i]);
  }
  if (!root || dryRun && !['replace', 'insert-before', 'set-field'].includes(command[0])) throw new Error(usage);
  const result = await mdSectionCommand(root, command, { dryRun, readInput: async () => {
    if (process.stdin.isTTY) throw new Error('Pipe the replacement or insertion text on stdin.');
    const chunks = []; for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  } });
  if (text) process.stdout.write(formatMdSection(result.data)); else console.log(JSON.stringify(result.data, null, 2));
  process.exitCode = result.exitCode;
} catch (error) {
  if (text) console.error(`md-section: ${error.message}`);
  else console.log(JSON.stringify({ status: 'not_assessed', qualityAssessed: false, error: { code: error.code ?? 'INVALID_ARGUMENT', message: error.message } }, null, 2));
  process.exitCode = error.exitCode ?? 2;
}
