import { readConfig, readSettings } from './config.js';
import { StudioError } from './contract.js';
import { readText, safePath } from './files.js';
import { exists } from './project.js';
import { runProcess } from './process.js';
import { writeNewDirectory } from './prototype.js';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hasGodotErrors } from './engine-verify.js';

async function executeCommand(command: string, cwd: string, timeoutMs: number) {
  if (process.platform !== 'win32') return runProcess('/bin/sh', ['-c', command], { cwd, timeoutMs });
  const directory = await mkdtemp(join(tmpdir(), 'game-studio-command-'));
  try {
    const script = join(directory, 'run.cmd');
    // A batch context retains ERRORLEVEL (including command-not-found 9009).
    // Direct cmd /c collapses some shell errors to 1. UTF-8 supports game paths.
    await writeFile(script, `@chcp 65001 >nul\r\n@echo off\r\n${command}\r\nexit /b %errorlevel%\r\n`, { flag: 'wx' });
    return await runProcess(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', `""${script}""`],
      { cwd, timeoutMs, windowsVerbatimArguments: true });
  } finally { await rm(directory, { recursive: true, force: true }); }
}

const operations = new Set(['test', 'smoke', 'build']);
export async function resolveCommand(root: string, kind: string, platform: NodeJS.Platform = process.platform) {
  if (!operations.has(kind)) throw new StudioError('INVALID_ARGUMENT', 'Test kind must be test, smoke or build');
  const os = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'macos' : platform;
  const config = await readConfig(await safePath(root, 'project.yaml'));
  const commands = config.commands;
  if (commands !== undefined && commands !== null && (typeof commands !== 'object' || Array.isArray(commands))) {
    throw new StudioError('INVALID_CONFIG', 'commands must be a mapping');
  }
  let value = commands?.[kind];
  let source = `project.yaml:commands.${kind}`;
  let mapped = false;
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    mapped = true;
    const key = value[os] !== undefined && value[os] !== null ? os : 'default';
    value = value[key]; source += `.${key}`;
  }
  if (value !== undefined && value !== null && typeof value !== 'string') throw new StudioError('INVALID_CONFIG', `${source} must be a shell command string`);
  if (typeof value === 'string' && value.trim()) return { command: value, source, os, reason: null };
  if (mapped) return { command: null, source, os, reason: `No ${kind} command is configured for ${os}` };
  const { settings } = await readSettings(root, ['engine.name', 'engine_row']);
  const row = settings.engine_row!.value as { commands: Record<string, string | null> };
  const fallback = row.commands[kind] ?? null;
  if (!fallback) return { command: null, source: 'unset', os, reason: `No configured or engine-default ${kind} command` };
  if (settings['engine.name']!.value === 'Web') {
    const packageText = await readText(await safePath(root, 'package.json'));
    let pkg;
    try { pkg = packageText === null ? null : JSON.parse(packageText); }
    catch { throw new StudioError('INVALID_CONFIG', 'Cannot inspect scripts in malformed package.json'); }
    if (!pkg || typeof pkg.scripts?.[kind] !== 'string' || !pkg.scripts[kind].trim()) {
      return { command: null, source: 'engine table', os, reason: `Web engine default requires package.json scripts.${kind}` };
    }
  }
  if (settings['engine.name']!.value === 'Godot') {
    const required = ['project.godot', ...(kind === 'test' ? ['addons/gdUnit4/bin/GdUnitCmdTool.gd'] : [])];
    for (const path of required) if (!(await exists(await safePath(root, path)))) {
      return { command: null, source: 'engine table', os, reason: `Godot default requires ${path}; the toolkit does not install the editor or test framework` };
    }
  }
  return { command: fallback, source: 'engine table', os, reason: null };
}

export async function runConfiguredTest(project: string, kind: string, output: string,
  options: { dryRun?: boolean; timeoutMs?: number } = {}) {
  const timeoutMs = options.timeoutMs ?? 120000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 1800000) throw new StudioError('INVALID_ARGUMENT', 'Timeout must be 100–1800000 milliseconds');
  if (await exists(await safePath(project, output))) throw new StudioError('FILE_CONFLICT', 'Test evidence requires a new output directory', 4);
  const selected = await resolveCommand(project, kind);
  if (options.dryRun) return { ...selected, kind, project, output, timeoutMs, status: 'planned', exitCode: 0, processExitCode: null };
  const engine = (await readSettings(project, ['engine.name'])).settings['engine.name']!.value;
  const start = Date.now();
  let execution = { exitCode: 3, stdout: '', stderr: '' };
  let launched = false;
  let reason = selected.reason;
  if (selected.command !== null) {
    try { execution = await executeCommand(selected.command, project, timeoutMs); launched = true; }
    catch (error) {
      if (!(error instanceof StudioError) || error.code !== 'DEPENDENCY_MISSING') throw error;
      reason = error.message;
    }
  }
  const missing = selected.command === null || reason !== null || [126, 127, 9009].includes(execution.exitCode);
  const engineErrorDetected = engine === 'Godot' && hasGodotErrors(`${execution.stdout}\n${execution.stderr}`);
  const exitCode = missing ? 3 : [124, 130].includes(execution.exitCode) ? execution.exitCode : execution.exitCode === 0 && !engineErrorDetected ? 0 : 5;
  if (missing && !reason) reason = 'The configured command could not start a required executable; inspect stderr.log';
  if (engineErrorDetected && !reason) reason = 'Godot reported engine errors; inspect stdout.log and stderr.log even if its process exited zero';
  const report = { ...selected, reason, kind, project, output, timeoutMs, durationMs: Date.now() - start, engine, engineErrorDetected,
    exitCode, processExitCode: launched ? execution.exitCode : null,
    status: exitCode === 0 ? 'ok' : exitCode === 3 ? 'not_assessed' : 'failed',
    judgment: 'Command execution evidence only; inspect test reports for test coverage. Human play acceptance is not assessed.' };
  const artifacts = await writeNewDirectory(project, output, {
    'report.json': Buffer.from(JSON.stringify(report, null, 2) + '\n'),
    'stdout.log': Buffer.from(execution.stdout), 'stderr.log': Buffer.from(execution.stderr),
  }, false);
  return { ...report, artifacts };
}
