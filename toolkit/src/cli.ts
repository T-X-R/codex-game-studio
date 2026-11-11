#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { commands, commonOptions } from './commands.js';
import { failure, StudioError } from './contract.js';

const argv = process.argv.slice(2);
let name = argv[0] ?? 'help';
try {
  const options = { ...commonOptions };
  for (const command of Object.values(commands)) Object.assign(options, command.options);
  let parsed;
  try {
    parsed = parseArgs({ args: argv, allowPositionals: true, options: Object.fromEntries(
      Object.entries(options).map(([key, value]) => [key, { type: value.type }]),
    ) });
  } catch (error) {
    throw new StudioError('INVALID_ARGUMENT', error instanceof Error ? error.message : 'Invalid arguments');
  }
  const { values, positionals } = parsed;
  if (positionals.length === 0) {
    if (Object.keys(values).some(key => !(key in commonOptions))) throw new StudioError('INVALID_ARGUMENT', 'A command is required');
    process.stdout.write(`Codex Game Studio\n\n${Object.entries(commands).map(([key, value]) => `  ${key.padEnd(22)} ${value.description}`).join('\n')}\n`);
  } else {
    const pair = positionals.slice(0, 2).join(' ');
    name = pair in commands ? pair : positionals[0]!;
    const command = commands[name];
    if (!command) throw new StudioError('INVALID_ARGUMENT', `Unknown command: ${name}`);
    const allowed = { ...commonOptions, ...command.options };
    for (const key of Object.keys(values)) {
      if (!(key in allowed)) throw new StudioError('INVALID_ARGUMENT', `--${key} is not accepted by ${name}`);
    }
    const args = positionals.slice(name.split(' ').length);
    if (values.help) {
      process.stdout.write(`game-studio ${name}\n${command.description}\n\n${Object.entries(allowed).map(([key, value]) => `  --${key}${value.type === 'string' ? ' <value>' : ''}: ${value.description}`).join('\n')}\n`);
    } else {
      if (args.length < (command.minArgs ?? 0) || args.length > (command.maxArgs ?? 0)) {
        throw new StudioError('INVALID_ARGUMENT', `Unexpected positional arguments for ${name}; see --help`);
      }
      const result = await command.run({ args, values });
      process.stdout.write(`${JSON.stringify(result, null, values.json ? undefined : 2)}\n`);
    }
  }
} catch (error) {
  const { result, exitCode } = failure(name, error);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = exitCode;
}
