import { basename } from 'node:path';
import { success, StudioError } from './contract.js';
import type { Command, Input, Option } from './commands.js';
import { resolveProject } from './project.js';
import { readText, safePath } from './files.js';
import { scaffoldPrototype, importPrototype, packagePrototype } from './prototype.js';
import { startPreview } from './preview.js';
import { checkPrototype } from './check.js';
import { inspectContent } from './content-tree.js';
import { resourceRoot } from './resources.js';
import { capturePrototype } from './capture.js';
import { runConfiguredTest } from './run-tests.js';
import { readSettings } from './config.js';
import { planEngineSetup } from './engine-setup.js';
import { planEngineScaffold } from './engine-scaffold.js';
import { verifyEngine } from './engine-verify.js';
import { applyInstall, describePlan } from './install.js';
import { inspectGrowth } from './grow-check.js';
import { planGrowthCopy } from './grow-copy.js';
import { inspectGdd } from './gdd-structure.js';
import { inspectAdrDependencies } from './adr-deps.js';
import { inspectArtifacts } from './artifact-check.js';

const project: Option = { type: 'string', description: 'Game workspace directory' };
const dryRun: Option = { type: 'boolean', description: 'Describe effects without creating files or starting a server' };
async function root(input: Input) { return resolveProject(input.values.project as string | undefined); }
export const gameCommands: Record<string, Command> = {
  'engine verify': { description: 'Verify a pinned Godot editor and run headless import with preserved logs', effect: 'process',
    options: { project, 'dry-run': dryRun, executable: { type: 'string', description: 'Godot editor executable path or name (overrides engine.path; fallback godot)' },
      output: { type: 'string', description: 'New project-relative evidence directory' },
      timeout: { type: 'string', description: 'Maximum time per process in milliseconds (100–600000, default 120000)' } },
    run: async input => {
      const data = await verifyEngine(await root(input), input.values.output as string ?? `production/evidence/engine-${Date.now()}`, {
        executable: input.values.executable as string | undefined, dryRun: !!input.values['dry-run'],
        timeoutMs: input.values.timeout === undefined ? undefined : Number(input.values.timeout),
      });
      const result = { ...success('engine verify', data), warnings: data.warnings };
      if ('artifacts' in data && data.artifacts) result.artifacts = data.artifacts.files.map(file => ({ path: file.path, type: 'evidence', sha256: file.sha256 }));
      if (data.exitCode) {
        process.exitCode = data.exitCode; result.status = data.exitCode === 3 ? 'not_assessed' : 'failed';
        result.error = { code: data.exitCode === 124 ? 'TIMEOUT' : data.exitCode === 130 ? 'INTERRUPTED' : data.exitCode === 3 ? 'ASSESSMENT_INCOMPLETE' : 'CHECK_FAILED',
          message: data.reason ?? 'Inspect the engine verification report.' };
      }
      return result;
    } },
  'engine scaffold': { description: 'Create a missing Godot project or chosen Web starter; preserve existing projects and report editor-owned requirements', effect: 'write',
    options: { project, 'dry-run': dryRun, starter: { type: 'string', description: 'Web starter: none, three, phaser or pixi (explicit choice required)' },
      title: { type: 'string', description: 'Web page title; defaults to project.name or folder name' },
      gitignore: { type: 'boolean', description: 'Authorize appending missing Web patterns to an existing .gitignore' } }, run: async input => {
      const { plan, ...details } = await planEngineScaffold(await root(input), {
        starter: input.values.starter as string | undefined, title: input.values.title as string | undefined,
        gitignore: input.values.gitignore as boolean | undefined,
      });
      const { outcome } = details;
      if (!input.values['dry-run']) await applyInstall(plan);
      const result = success('engine scaffold', { ...describePlan(plan), ...details, dryRun: !!input.values['dry-run'],
        outcome: { ...outcome, state: outcome.state === 'planned' && !input.values['dry-run'] ? 'created' : outcome.state } });
      if (outcome.state === 'not_assessed') {
        process.exitCode = 3; result.status = 'not_assessed';
        result.error = { code: 'ASSESSMENT_INCOMPLETE', message: outcome.reason! };
      }
      return result;
    } },
  'engine setup': { description: 'Apply explicit engine choices and synchronize the technical preference document', effect: 'write',
    options: { project, 'dry-run': dryRun, input: { type: 'string', description: 'Project-relative YAML or JSON containing the agreed engine configuration' } },
    run: async input => {
      const workspace = await root(input);
      if (!input.values.input) throw new StudioError('INVALID_ARGUMENT', '--input is required');
      const content = await readText(await safePath(workspace, input.values.input as string));
      if (content === null) throw new StudioError('INVALID_ARGUMENT', 'Engine setup input file does not exist');
      const { plan, warnings, layout, execution } = await planEngineSetup(workspace, content);
      if (!input.values['dry-run']) await applyInstall(plan);
      return { ...success('engine setup', { ...describePlan(plan), layout, execution, dryRun: !!input.values['dry-run'] }), warnings };
    } },
  'engine inspect': { description: 'Read declared engine metadata and observed directories without launching an editor', effect: 'read',
    options: { project }, run: async input => {
      const workspace = await root(input);
      const { settings, warnings } = await readSettings(workspace, ['engine_values', 'engine_row']);
      return { ...success('engine inspect', { project: workspace, engine: settings.engine_values!.value, layout: settings.engine_row!.value,
        execution: { state: 'not_assessed', reason: 'Directory inspection does not prove editor, license, build or test availability.' } }), warnings };
    } },
  test: { description: 'Run a configured test, smoke or build command with a timeout and preserved evidence', effect: 'process',
    options: { project, 'dry-run': dryRun, kind: { type: 'string', description: 'Configured operation: test (default), smoke or build' },
      command: { type: 'string', description: 'Explicit shell command for this run only; preserves project configuration' },
      output: { type: 'string', description: 'New project-relative evidence directory' },
      timeout: { type: 'string', description: 'Maximum execution time in milliseconds (100–1800000, default 120000)' } },
    run: async input => {
      const data = await runConfiguredTest(await root(input), input.values.kind as string ?? 'test',
        input.values.output as string ?? `production/evidence/test-${Date.now()}`, {
          dryRun: !!input.values['dry-run'], timeoutMs: input.values.timeout === undefined ? undefined : Number(input.values.timeout),
          command: input.values.command as string | undefined,
        });
      const result = success('test', data);
      if ('artifacts' in data && data.artifacts) result.artifacts = data.artifacts.files.map(file => ({ path: file.path, type: 'evidence', sha256: file.sha256 }));
      if (data.exitCode !== 0) {
        process.exitCode = data.exitCode; result.status = data.exitCode === 3 ? 'not_assessed' : 'failed';
        result.error = { code: data.exitCode === 124 ? 'TIMEOUT' : data.exitCode === 130 ? 'INTERRUPTED' : data.exitCode === 3 ? 'ASSESSMENT_INCOMPLETE' : 'CHECK_FAILED',
          message: data.reason ?? 'Configured command did not complete successfully; inspect the report and logs.' };
      }
      return result;
    } },
  capture: { description: 'Record a seeded Web replay, browser log and screenshot from a temporary game copy', effect: 'process', minArgs: 1, maxArgs: 1,
    options: { project, 'dry-run': dryRun, output: { type: 'string', description: 'New project-relative evidence directory' },
      browser: { type: 'string', description: 'Installed Chromium-family executable path' },
      log: { type: 'string', description: 'Replay inputs, e.g. Enter ArrowRight:1.5 wait:1' }, seed: { type: 'string', description: 'Positive deterministic seed (default 1)' },
      timeout: { type: 'string', description: 'Maximum real time in milliseconds (1000–600000, default 60000)' },
      hookless: { type: 'boolean', description: 'Instrument an imported game without window.game; CSS animation, workers and pointer lock are not covered' } },
    run: async input => {
      const data = await capturePrototype(await root(input), input.args[0]!, input.values.output as string ?? `production/evidence/capture-${Date.now()}`, {
        browser: input.values.browser as string | undefined, log: input.values.log as string | undefined,
        seed: input.values.seed === undefined ? undefined : Number(input.values.seed),
        timeoutMs: input.values.timeout === undefined ? undefined : Number(input.values.timeout),
        hookless: !!input.values.hookless, dryRun: !!input.values['dry-run'],
      });
      const result = success('capture', data);
      if ('artifacts' in data && data.artifacts) result.artifacts = data.artifacts.files.map(file => ({ path: file.path, type: file.path.endsWith('.png') ? 'screenshot' : 'evidence', sha256: file.sha256 }));
      if (data.exitCode !== 0) {
        process.exitCode = data.exitCode; result.status = data.exitCode === 3 ? 'not_assessed' : 'failed';
        result.error = { code: data.exitCode === 124 ? 'TIMEOUT' : data.exitCode === 130 ? 'INTERRUPTED' : data.exitCode === 5 ? 'CHECK_FAILED' : 'ASSESSMENT_INCOMPLETE', message: 'Inspect the captured report and browser log.' };
      }
      return result;
    } },
  'prototype grow': { description: 'Copy a standalone JavaScript prototype into pinned Web tooling; full growth still requires conversion and verification', effect: 'write', minArgs: 1, maxArgs: 1,
    options: { project, 'dry-run': dryRun, stage: { type: 'string', description: 'Required migration stage: copy (other stages remain under migration)' } }, run: async input => {
      if (input.values.stage !== 'copy') throw new StudioError('INVALID_ARGUMENT', 'Choose --stage copy explicitly; this command does not complete the full growth workflow');
      const { plan, ...data } = await planGrowthCopy(await root(input), input.args[0]!);
      if (!input.values['dry-run']) await applyInstall(plan);
      return { ...success('prototype grow', { ...describePlan({ ...plan, changes: plan.changes.filter(change => change.before !== change.after) }),
        ...data, outcome: input.values['dry-run'] ? 'planned' : 'copied' }), warnings: data.warnings };
    } },
  'prototype grow-check': { description: 'Inspect Web growth prerequisites without changing files, installing tools or playing the game', effect: 'read', minArgs: 1, maxArgs: 1,
    options: { project }, run: async input => {
      const data = await inspectGrowth(await root(input), input.args[0]!);
      const result = { ...success('prototype grow-check', data), warnings: data.warnings };
      if (data.exitCode) {
        process.exitCode = data.exitCode; result.status = data.exitCode === 4 ? 'blocked' : 'not_assessed';
        result.error = { code: data.exitCode === 4 ? 'GROWTH_BLOCKED' : 'ASSESSMENT_INCOMPLETE', message: 'Resolve the reported growth prerequisites before copying the prototype.' };
      }
      return result;
    } },
  'prototype scaffold': { description: 'Create the fixed-step Web prototype starter in prototypes/<name>', effect: 'write', minArgs: 1, maxArgs: 1,
    options: { project, 'dry-run': dryRun, title: { type: 'string', description: 'Player-facing title' }, question: { type: 'string', description: 'The prototype hypothesis' } },
    run: async input => success('prototype scaffold', await scaffoldPrototype(await root(input), input.args[0]!,
      input.values.title as string | undefined, input.values.question as string | undefined, !!input.values['dry-run'])) },
  'prototype import': { description: 'Copy an existing standalone Web game without modifying its source', effect: 'write', minArgs: 2, maxArgs: 2,
    options: { project, 'dry-run': dryRun },
    run: async input => success('prototype import', await importPrototype(await root(input), input.args[0]!, input.args[1]!, !!input.values['dry-run'])) },
  package: { description: 'Create a new static Web distribution directory, excluding development evidence', effect: 'write', minArgs: 1, maxArgs: 1,
    options: { project, 'dry-run': dryRun, output: { type: 'string', description: 'New project-relative output directory (defaults to builds/<name>-<timestamp>)' } },
    run: async input => success('package', await packagePrototype(await root(input), input.args[0]!,
      input.values.output as string ?? `builds/${basename(input.args[0]!)}-${Date.now()}`, !!input.values['dry-run'])) },
  check: { description: 'Inspect scripts, toolkit content, GDDs, ADR dependencies or workflow artifacts without executing them', effect: 'read', maxArgs: 1,
    options: { project, kind: { type: 'string', description: 'prototype (default; requires a path), content (no path), gdd (optional file), adr-deps (optional directory), or artifacts (no positional path)' },
      phase: { type: 'string', description: 'For artifacts only: restrict to one phase ID' },
      path: { type: 'string', description: 'For artifacts only: select a tier path ID instead of the phase ladder (exclusive with --phase)' } }, run: async input => {
      const kind = input.values.kind ?? 'prototype';
      if (!['prototype', 'content', 'gdd', 'adr-deps', 'artifacts'].includes(String(kind)) ||
          (['content', 'artifacts'].includes(String(kind)) && input.args.length !== 0) || (kind === 'prototype' && input.args.length !== 1) ||
          (kind !== 'artifacts' && (input.values.phase !== undefined || input.values.path !== undefined))) {
        throw new StudioError('INVALID_ARGUMENT', 'Use check <path> [--kind prototype], check --kind content, check [file] --kind gdd, check [directory] --kind adr-deps, or check --kind artifacts [--phase <id> | --path <id>]');
      }
      if (kind === 'artifacts') {
        const data = await inspectArtifacts(await root(input), { phase: input.values.phase as string | undefined, path: input.values.path as string | undefined });
        const result = success('check', data);
        if (data.counts.unknown) {
          process.exitCode = 3; result.status = 'not_assessed';
          result.error = { code: 'ASSESSMENT_INCOMPLETE', message: 'Some artifact observations could not be collected; inspect UNKNOWN rows.' };
        }
        return result;
      }
      if (kind === 'gdd' || kind === 'adr-deps') {
        const data = kind === 'gdd' ? await inspectGdd(await root(input), input.args[0]) :
          await inspectAdrDependencies(await root(input), input.args[0]);
        const result = success('check', data);
        if (!data.files.length) {
          process.exitCode = 3; result.status = 'not_assessed';
          result.error = { code: 'ASSESSMENT_INCOMPLETE', message: data.reason! };
        }
        return result;
      }
      if (kind === 'content') {
        const project = await root(input);
        const data = { project, resourceRoot, scope: 'project-content',
          ...await inspectContent(project, { projectResources: resourceRoot }) };
        const result = success('check', data);
        if (data.status === 'invalid') {
          process.exitCode = 5; result.status = 'failed'; result.error = { code: 'CHECK_FAILED', message: 'Installed toolkit content checks failed' };
        }
        return result;
      }
      const data = await checkPrototype(await safePath(await root(input), input.args[0]!));
      const result = success('check', data);
      if (data.checks.some(check => check.status === 'failed')) {
        process.exitCode = 5; result.status = 'failed'; result.error = { code: 'CHECK_FAILED', message: 'Static script checks failed' };
      } else if (!data.checks.length || data.checks.some(check => check.status === 'not_assessed')) {
        process.exitCode = 3; result.status = 'not_assessed'; result.error = { code: 'ASSESSMENT_INCOMPLETE', message: 'Some scripts could not be assessed by the classic-script parser' };
      }
      return result;
    } },
  preview: { description: 'Serve a game on localhost in the foreground; stop with Ctrl-C', effect: 'process', minArgs: 1, maxArgs: 1,
    options: { project, 'dry-run': dryRun, port: { type: 'string', description: 'Local port (0 chooses an available port)' } },
    run: async input => {
      const directory = await safePath(await root(input), input.args[0]!);
      const port = input.values.port === undefined ? 0 : Number(input.values.port);
      if (input.values['dry-run']) return success('preview', { directory, host: '127.0.0.1', port, foreground: true });
      const { server, url } = await startPreview(directory, port);
      const stop = () => { server.closeAllConnections(); server.close(); process.exitCode = 130; };
      process.once('SIGINT', stop); process.once('SIGTERM', stop);
      server.once('close', () => { process.off('SIGINT', stop); process.off('SIGTERM', stop); });
      return success('preview', { directory, url, foreground: true });
    } },
};
