import { basename } from 'node:path';
import { success } from './contract.js';
import type { Command, Input, Option } from './commands.js';
import { resolveProject } from './project.js';
import { safePath } from './files.js';
import { scaffoldPrototype, importPrototype, packagePrototype } from './prototype.js';
import { startPreview } from './preview.js';
import { checkPrototype } from './check.js';
import { capturePrototype } from './capture.js';
import { runConfiguredTest } from './run-tests.js';

const project: Option = { type: 'string', description: 'Game workspace directory' };
const dryRun: Option = { type: 'boolean', description: 'Describe effects without creating files or starting a server' };
async function root(input: Input) { return resolveProject(input.values.project as string | undefined); }
export const gameCommands: Record<string, Command> = {
  test: { description: 'Run a configured test, smoke or build command with a timeout and preserved evidence', effect: 'process',
    options: { project, 'dry-run': dryRun, kind: { type: 'string', description: 'Configured operation: test (default), smoke or build' },
      output: { type: 'string', description: 'New project-relative evidence directory' },
      timeout: { type: 'string', description: 'Maximum execution time in milliseconds (100–600000, default 120000)' } },
    run: async input => {
      const data = await runConfiguredTest(await root(input), input.values.kind as string ?? 'test',
        input.values.output as string ?? `production/evidence/test-${Date.now()}`, {
          dryRun: !!input.values['dry-run'], timeoutMs: input.values.timeout === undefined ? undefined : Number(input.values.timeout),
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
  check: { description: 'Parse classic scripts referenced by index.html; does not run a browser', effect: 'read', minArgs: 1, maxArgs: 1,
    options: { project }, run: async input => {
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
