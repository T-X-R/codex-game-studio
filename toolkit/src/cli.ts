#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { commands, commonOptions } from './commands.js';
import { failure, success, StudioError } from './contract.js';
import { inspectRuntime, ownEntry } from './runtime.js';
import { resolveProject } from './project.js';
import { pathToFileURL } from 'node:url';

const bootstrap = new Set(['init', 'attach', 'detach', 'recover', 'restore', 'doctor', 'version', 'schema', 'skills setup', 'skills remove']);
async function dispatch(command: string, project?: string): Promise<boolean> {
  if (bootstrap.has(command)) return false;
  let root;
  try { root = await resolveProject(project); }
  catch (error) {
    if (!project && error instanceof StudioError && error.code === 'PROJECT_NOT_FOUND') return false;
    throw error;
  }
  const runtime = await inspectRuntime(root);
  if (runtime.state === 'unattached') return false;
  if (runtime.state !== 'ready') throw new StudioError('RUNTIME_UNAVAILABLE', `Run game-studio restore --project ${JSON.stringify(root)}`, 3);
  if (runtime.entry === ownEntry) return false;
  await import(pathToFileURL(runtime.entry!).href);
  return true;
}

const argv = process.argv.slice(2);
let name = argv[0] ?? 'help';
try {
  if (Number(process.versions.node.split('.')[0]) < 24 || Number(process.versions.node.split('.')[0]) > 26) {
    throw new StudioError('UNSUPPORTED_NODE', 'Codex Game Studio requires Node.js 24 through 26', 3);
  }
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
    if (Object.keys(values).some(key => !Object.hasOwn(commonOptions, key))) throw new StudioError('INVALID_ARGUMENT', 'A command is required');
    process.stdout.write(values.json ? `${JSON.stringify(success('help', { commands: Object.fromEntries(Object.entries(commands).map(([key, value]) => [key, value.description])) }))}\n`
      : `Codex Game Studio\n\n${Object.entries(commands).map(([key, value]) => `  ${key.padEnd(22)} ${value.description}`).join('\n')}\n`);
  } else {
    const pair = positionals.slice(0, 2).join(' ');
    name = Object.hasOwn(commands, pair) ? pair : positionals[0]!;
    const command = commands[name];
    if (!Object.hasOwn(commands, name) || !command) throw new StudioError('INVALID_ARGUMENT', `Unknown command: ${name}`);
    const allowed = { ...commonOptions, ...command.options };
    for (const key of Object.keys(values)) {
      if (!Object.hasOwn(allowed, key)) throw new StudioError('INVALID_ARGUMENT', `--${key} is not accepted by ${name}`);
    }
    const args = positionals.slice(name.split(' ').length);
    if (values.help) {
      process.stdout.write(`game-studio ${name}\n${command.description}\n\n${Object.entries(allowed).map(([key, value]) => `  --${key}${value.type === 'string' ? ' <value>' : ''}: ${value.description}`).join('\n')}\n`);
    } else {
      if (args.length < (command.minArgs ?? 0) || args.length > (command.maxArgs ?? 0)) {
        throw new StudioError('INVALID_ARGUMENT', `Unexpected positional arguments for ${name}; see --help`);
      }
      if (!(await dispatch(name, values.project as string | undefined))) {
        const result = await command.run({ args, values });
        process.stdout.write(`${JSON.stringify(result, null, values.json ? undefined : 2)}\n`);
      }
    }
  }
} catch (error) {
  const { result, exitCode } = failure(name, error);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = exitCode;
}
