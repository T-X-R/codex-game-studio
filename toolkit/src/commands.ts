import { metadata } from './metadata.js';
import { success, StudioError, type Result } from './contract.js';
import { resolveProject } from './project.js';
import { readSettings } from './config.js';
import { setupCommands } from './setup-commands.js';
import { gameCommands } from './game-commands.js';
import { planConfigSet } from './config-write.js';
import { applyInstall, describePlan } from './install.js';
import { planCheckpointSave, showCheckpoint } from './checkpoint.js';
import { readText, safePath } from './files.js';

export interface Option { type: 'string' | 'boolean'; description: string }
export interface Input { args: string[]; values: Record<string, string | boolean | undefined> }
export interface Command {
  description: string;
  effect: 'read' | 'write' | 'process';
  options?: Record<string, Option>;
  minArgs?: number;
  maxArgs?: number;
  run(input: Input): Promise<Result> | Result;
}
export const commonOptions: Record<string, Option> = {
  json: { type: 'boolean', description: 'Return a single JSON result' },
  help: { type: 'boolean', description: 'Show command usage' },
};
export const commands: Record<string, Command> = {
  ...setupCommands,
  ...gameCommands,
  'checkpoint show': {
    description: 'Read a bounded recovery record and observe current Git state', effect: 'read',
    options: { project: { type: 'string', description: 'Game workspace directory' } },
    run: async ({ values }) => {
      const data = await showCheckpoint(await resolveProject(values.project as string | undefined));
      return { ...success('checkpoint show', data), warnings: data.warnings };
    },
  },
  'checkpoint save': {
    description: 'Replace the checkpoint region after verifying its previously observed hash', effect: 'write',
    options: { project: { type: 'string', description: 'Game workspace directory' },
      input: { type: 'string', description: 'Project-relative Markdown file containing the checkpoint body' },
      'expect-hash': { type: 'string', description: 'Required sha256 from checkpoint show, or missing for a new record' },
      'event-id': { type: 'string', description: 'Stable event identifier for idempotent lifecycle retries' },
      'dry-run': { type: 'boolean', description: 'Describe changes without writing files' } },
    run: async ({ values }) => {
      const root = await resolveProject(values.project as string | undefined);
      if (!values.input) throw new StudioError('INVALID_ARGUMENT', '--input is required');
      const input = await readText(await safePath(root, values.input as string));
      if (input === null) throw new StudioError('INVALID_ARGUMENT', 'Checkpoint input file does not exist');
      const { plan, warnings, duplicate, eventId } = await planCheckpointSave(root, input,
        values['expect-hash'] as string | undefined, values['event-id'] as string | undefined);
      if (!values['dry-run']) await applyInstall(plan);
      return { ...success('checkpoint save', { ...describePlan(plan), duplicate, eventId, dryRun: !!values['dry-run'] }), warnings };
    },
  },
  'config set': {
    description: 'Write one project setting and synchronize the stage mirror when applicable', effect: 'write', minArgs: 2, maxArgs: 2,
    options: { project: { type: 'string', description: 'Game workspace directory' },
      local: { type: 'boolean', description: 'Write an allowed personal override to project.local.yaml' },
      'dry-run': { type: 'boolean', description: 'Describe changes without writing files' } },
    run: async ({ args, values }) => {
      const root = await resolveProject(values.project as string | undefined);
      const { plan, warnings } = await planConfigSet(root, args[0]!, args[1]!, !!values.local);
      if (!values['dry-run']) await applyInstall(plan);
      return { ...success('config set', { ...describePlan(plan), dryRun: !!values['dry-run'] }), warnings };
    },
  },
  'config get': {
    description: 'Read effective project settings with provenance', effect: 'read', maxArgs: 1,
    options: { project: { type: 'string', description: 'Game workspace directory' },
      system: { type: 'string', description: 'Resolve the workflow tier for a named system' } },
    run: async ({ args, values }) => {
      const root = await resolveProject(values.project as string | undefined);
      const { settings, annotations, warnings } = await readSettings(root, args.length ? args : undefined, { system: values.system as string | undefined });
      return { ...success('config get', { project: root, settings, annotations }), warnings };
    },
  },
  status: {
    description: 'Inspect recorded project configuration without guessing its stage', effect: 'read',
    options: { project: { type: 'string', description: 'Game workspace directory' } },
    run: async ({ values }) => {
      const root = await resolveProject(values.project as string | undefined);
      const { settings, warnings } = await readSettings(root, ['engine.name', 'engine.version', 'project.stage', 'modes.rigor', 'modes.automation']);
      return { ...success('status', { project: root, settings }), warnings };
    },
  },
  version: {
    description: 'Show the running toolkit version', effect: 'read',
    run: () => success('version', { name: metadata.name, version: metadata.version }),
  },
  schema: {
    description: 'Describe an implemented command', effect: 'read', minArgs: 1, maxArgs: 2,
    run: ({ args }) => {
      const name = args.join(' ');
      const command = commands[name];
      if (!Object.hasOwn(commands, name) || !command) throw new StudioError('INVALID_ARGUMENT', `Unknown command: ${name}`);
      return success('schema', { name, description: command.description, effect: command.effect,
        minArgs: command.minArgs ?? 0, maxArgs: command.maxArgs ?? 0,
        options: { ...commonOptions, ...command.options } });
    },
  },
};
