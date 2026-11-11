import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { success, StudioError } from './contract.js';
import type { Command, Option } from './commands.js';
import { planAttach } from './attach.js';
import { applyInstall, describePlan, planDetach, recoverInstall } from './install.js';
import { setupSkill } from './skills-setup.js';
import { inspectRuntime, restoreRuntime } from './runtime.js';
import { resourcePath } from './resources.js';
import { resolveProject } from './project.js';

const project: Option = { type: 'string', description: 'Game workspace directory' };
const dryRun: Option = { type: 'boolean', description: 'Describe effects without writing files or launching processes' };
const engine: Option = { type: 'string', description: 'Engine: web, godot, unity, or unreal' };
export const setupCommands: Record<string, Command> = {
  init: { description: 'Create a game workspace with managed Codex integration', effect: 'write', minArgs: 1, maxArgs: 1,
    options: { engine, 'dry-run': dryRun },
    run: async ({ args, values }) => {
      const plan = await planAttach(args[0]!, { initialize: true, engine: values.engine as string | undefined });
      if (!values['dry-run']) await applyInstall(plan);
      return success('init', { ...describePlan(plan), runtime: 'Restore the pinned runtime explicitly before running game operations.' });
    } },
  attach: { description: 'Add managed integration while preserving game code and existing instructions', effect: 'write',
    options: { project, engine, 'dry-run': dryRun },
    run: async ({ values }) => {
      const plan = await planAttach(resolve(values.project as string ?? '.'), { engine: values.engine as string | undefined });
      if (!values['dry-run']) await applyInstall(plan);
      return success('attach', { ...describePlan(plan), runtime: 'Restore the pinned runtime explicitly before running game operations.' });
    } },
  detach: { description: 'Restore or remove unchanged files owned by the toolkit', effect: 'write',
    options: { project, 'dry-run': dryRun },
    run: async ({ values }) => {
      const plan = await planDetach(await resolveProject(values.project as string | undefined));
      if (!values['dry-run']) await applyInstall(plan);
      return success('detach', { ...describePlan(plan), retained: ['Game configuration and artifacts', 'Runtime dependencies, lock and installation backups'] });
    } },
  recover: { description: 'Roll back an interrupted integration transaction after its writer has exited', effect: 'write',
    options: { project, 'dry-run': dryRun },
    run: async ({ values }) => success('recover', describePlan(await recoverInstall(resolve(values.project as string ?? '.'), !!values['dry-run']))) },
  restore: { description: 'Explicitly install the pinned project runtime with npm scripts disabled', effect: 'process',
    options: { project, 'dry-run': dryRun, archive: { type: 'string', description: 'Local npm archive for the initial unpublished development install' },
      offline: { type: 'boolean', description: 'Use only the npm cache and local archive' } },
    run: async ({ values }) => success('restore', await restoreRuntime(await resolveProject(values.project as string | undefined),
      values.archive as string | undefined, !!values['dry-run'], !!values.offline)) },
  'skills setup': { description: 'Install the single global onboarding Skill', effect: 'write',
    options: { home: { type: 'string', description: 'Codex home (default CODEX_HOME or ~/.codex)' },
      scope: { type: 'string', description: 'Supported scope: user' }, target: { type: 'string', description: 'Supported target: codex' }, 'dry-run': dryRun },
    run: async ({ values }) => {
      if (values.scope && values.scope !== 'user' || values.target && values.target !== 'codex') throw new StudioError('INVALID_ARGUMENT', 'Supported setup: --scope user --target codex');
      return success('skills setup', await setupSkill(values.home as string | undefined, false, !!values['dry-run']));
    } },
  'skills remove': { description: 'Remove unchanged owned global onboarding files', effect: 'write',
    options: { home: { type: 'string', description: 'Codex home (default CODEX_HOME or ~/.codex)' }, 'dry-run': dryRun },
    run: async ({ values }) => success('skills remove', await setupSkill(values.home as string | undefined, true, !!values['dry-run'])) },
  'resource path': { description: 'Resolve a bundled resource without relying on the maintainer checkout', effect: 'read', minArgs: 1, maxArgs: 1,
    options: { project }, run: async ({ args }) => success('resource path', { path: await resourcePath(args[0]!) }) },
  doctor: { description: 'Report runtime installation and unverified host capabilities', effect: 'read', options: { project },
    run: async ({ values }) => {
      const root = await resolveProject(values.project as string | undefined);
      return success('doctor', { project: root, node: process.version, runtime: await inspectRuntime(root),
        onboardingHome: process.env.CODEX_HOME || join(homedir(), '.codex'),
        hooks: { state: 'not_configured', reason: 'Hook adapter migration is not shipped in this alpha.' },
        customRoles: { state: 'not_assessed', reason: 'Requires observed execution in the current Codex host.' },
        desktop: { state: 'not_assessed', reason: 'Desktop compatibility has not passed the release gate.' } });
    } },
};
