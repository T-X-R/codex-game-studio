import { parseArgs } from 'node:util';
import { commands, commonOptions } from './commands.js';
import type { ContentIssue } from './content-check.js';

// A deliberately small documentation syntax, never a shell interpreter.
function words(text: string): string[] {
  const result: string[] = [];
  let word = '', quote = '', started = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quote !== "'" && (char === '`' || (char === '$' && text[i + 1] === '('))) throw new Error('Command substitution is not supported');
    if (char === '\\' && quote !== "'") {
      const next = text[++i];
      if (next === undefined) throw new Error('Unfinished escape');
      word += quote === '"' && !['$', '`', '"', '\\'].includes(next) ? `\\${next}` : next;
      started = true;
    } else if (quote) {
      if (char === quote) quote = ''; else word += char;
    } else if (char === '"' || char === "'") { quote = char; started = true; }
    else if (/\s/.test(char)) {
      if (started) result.push(word);
      word = ''; started = false;
    } else if (char === '#' && !started) break;
    else if (';&|>'.includes(char)) {
      // A closing angle bracket is allowed only as part of a placeholder.
      if (char === '>' && /<[\w-]+$/.test(word)) word += char;
      else throw new Error('Shell operators are not supported; document each invocation separately');
    } else if (char === '<') {
      if (!/^<[\w-]+>/.test(text.slice(i))) throw new Error('Shell redirection is not supported');
      word += char; started = true;
    } else { word += char; started = true; }
  }
  if (quote) throw new Error('Unclosed quote');
  if (started) result.push(word);
  return result;
}

function validate(argv: string[]) {
  const options = { ...commonOptions };
  for (const command of Object.values(commands)) Object.assign(options, command.options);
  const { positionals, values } = parseArgs({ args: argv, allowPositionals: true, options });
  if (!positionals.length) {
    if (Object.keys(values).some(key => !Object.hasOwn(commonOptions, key))) throw new Error('A command is required');
    return;
  }
  const pair = positionals.slice(0, 2).join(' ');
  const name = Object.hasOwn(commands, pair) ? pair : positionals[0]!;
  if (!Object.hasOwn(commands, name)) throw new Error(`Unknown command: ${name}`);
  const command = commands[name]!;
  const allowed = { ...commonOptions, ...command.options };
  for (const key of Object.keys(values)) if (!Object.hasOwn(allowed, key)) throw new Error(`--${key} is not accepted by ${name}`);
  const args = positionals.slice(name.split(' ').length);
  if (values.help) return;
  if (args.length < (command.minArgs ?? 0) || args.length > (command.maxArgs ?? 0)) throw new Error(`Unexpected positional arguments for ${name}`);
  if (name === 'schema' && !Object.hasOwn(commands, args.join(' '))) throw new Error(`Unknown schema command: ${args.join(' ')}`);
}

export function commandIssues(body: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const lines = body.split(/\r?\n/);
  let fence = '';
  function example(text: string, line: number) {
    const prefix = text.trim().match(/^(?:\$\s+)?(?:game-studio|node\s+\.game-studio\/run\.cjs)(?:\s+(.+))?$/s);
    // A launcher name by itself is a reference, not an invocation example.
    if (!prefix?.[1]) return;
    let argv;
    try { argv = words(prefix[1]); }
    catch (error) { issues.push({ code: 'UNSUPPORTED_COMMAND_EXAMPLE', message: `line ${line}: ${(error as Error).message}` }); return; }
    try { validate(argv); }
    catch (error) { issues.push({ code: 'INVALID_COMMAND_EXAMPLE', message: `line ${line}: ${(error as Error).message}` }); }
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const delimiter = line.match(/^\s*(`{3,}|~{3,})/);
    if (delimiter) {
      if (!fence) fence = delimiter[1]!;
      else if (delimiter[1]![0] === fence[0] && delimiter[1]!.length >= fence.length) fence = '';
      continue;
    }
    if (fence) {
      let text = line;
      const start = i + 1;
      while (/\\$/.test(text) && i + 1 < lines.length) text = text.slice(0, -1) + ' ' + lines[++i]!.trim();
      example(text, start);
    } else {
      for (const match of line.matchAll(/(`+)(.*?)\1/g)) example(match[2]!, i + 1);
    }
  }
  return issues;
}
