import { metadata } from './metadata.js';
import { success, StudioError, type Result } from './contract.js';
import { resolveProject } from './project.js';
import { readSettings } from './config.js';
import { setupCommands } from './setup-commands.js';
import { gameCommands } from './game-commands.js';
import { planConfigSet } from './config-write.js';
import { applyInstall, describePlan } from './install.js';

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
      const { settings, warnings } = await readSettings(root, args.length ? args : undefined, { system: values.system as string | undefined });
      return { ...success('config get', { project: root, settings }), warnings };
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
