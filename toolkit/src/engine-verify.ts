import { stat } from 'node:fs/promises';
import { readConfig, readSettings } from './config.js';
import { StudioError } from './contract.js';
import { canonicalRoot, safePath } from './files.js';
import { exists } from './project.js';
import { runProcess } from './process.js';
import { writeNewDirectory } from './prototype.js';

function pin(value: string): string | null {
  const match = /^(4)\.(\d+)(?:\.(\d+))?(?:[-.](stable|rc\d+|beta\d+|dev\d+))?$/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3] ?? '0'}.${match[4] ?? 'stable'}` : null;
}
function observedVersion(value: string) {
  const line = value.trim();
  const match = /^(4\.\d+(?:\.\d+)?)\.(stable|rc\d+|beta\d+|dev\d+)(?:\.[A-Za-z0-9_-]+)*$/.exec(line);
  return match ? { raw: line, pin: pin(`${match[1]}.${match[2]}`) } : null;
}
export function hasGodotErrors(output: string, portZeroDebuggerExpected = false) {
  const plain = output.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
  return plain.split('\n').some(line => {
    const trimmed = line.trim();
    if (portZeroDebuggerExpected && [
      'ERROR: The remote port number must be between 1 and 65535 (inclusive).',
      "ERROR: Remote Debugger: Unable to connect to host '127.0.0.1:0'.",
    ].includes(trimmed)) return false;
    return /^(?:SCRIPT ERROR|ERROR|FATAL ERROR|Parse Error):/i.test(trimmed);
  });
}

export async function verifyEngine(root: string, output: string,
  options: { executable?: string; executableArgs?: string[]; timeoutMs?: number; dryRun?: boolean } = {}) {
  const project = await canonicalRoot(root);
  const timeoutMs = options.timeoutMs ?? 120000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 600000) throw new StudioError('INVALID_ARGUMENT', 'Timeout must be 100–600000 milliseconds');
  if (await exists(await safePath(project, output))) throw new StudioError('FILE_CONFLICT', 'Engine evidence requires a new output directory', 4);
  const { settings, warnings } = await readSettings(project, ['engine.name', 'engine.version', 'engine.language']);
  let selectedExecutable: unknown = options.executable;
  if (selectedExecutable === undefined) {
    const config = await readConfig(await safePath(project, 'project.yaml'));
    const engineConfig = config.engine;
    const configuredPath = engineConfig && typeof engineConfig === 'object' && !Array.isArray(engineConfig) ? engineConfig.path : undefined;
    selectedExecutable = configuredPath ?? 'godot';
  }
  if (typeof selectedExecutable !== 'string' || !selectedExecutable.trim() || /[\0\r\n]/.test(selectedExecutable)) {
    throw new StudioError('INVALID_ARGUMENT', 'Provide a nonempty single-line engine executable path or name');
  }
  const executable = selectedExecutable;
  const engine = settings['engine.name']!.value;
  const declaredVersion = settings['engine.version']!.value;
  const expected = typeof declaredVersion === 'string' ? pin(declaredVersion) : null;
  if (engine === 'Godot' && !expected) throw new StudioError('INVALID_CONFIG', 'Engine verification requires an explicit Godot 4.x version string');
  let reason: string | null = engine === 'Godot' ? null : `No import verifier is implemented for ${engine ?? 'an unconfigured engine'}; use its configured build/test command and editor workflow.`;
  if (engine === 'Godot') {
    const path = await safePath(project, 'project.godot');
    if (!(await exists(path)) || !(await stat(path)).isFile()) reason = 'A regular project.godot file is required before engine verification';
  }
  const command = { executable, args: [...(options.executableArgs ?? []), '--headless', '--path', project, '--import'] };
  const start = Date.now();
  if (options.dryRun) return { project, engine, declaredVersion, command, timeoutMs, output,
    status: reason ? 'not_assessed' : 'planned', exitCode: reason ? 3 : 0, reason, warnings,
    effects: ['Probe the executable version and --help', 'Run editor import, which may create engine cache and import metadata', 'Write logs and report in the new evidence directory'] };
  let exitCode = reason ? 3 : 0;
  let actualVersion: string | null = null;
  const files: Record<string, Buffer> = {};
  const checks: { phase: string; args: string[]; processExitCode: number | null; signal: string | null; errorDetected: boolean }[] = [];
  async function phase(name: string, args: string[]) {
    let execution;
    try { execution = await runProcess(executable, [...(options.executableArgs ?? []), ...args], { cwd: project, timeoutMs }); }
    catch (error) {
      if (!(error instanceof StudioError) || error.code !== 'DEPENDENCY_MISSING') throw error;
      reason = error.message; exitCode = 3;
      execution = { exitCode: null, signal: null, stdout: '', stderr: error.message };
    }
    const errorDetected = hasGodotErrors(`${execution.stdout}\n${execution.stderr}`);
    files[`${name}.stdout.log`] = Buffer.from(execution.stdout);
    files[`${name}.stderr.log`] = Buffer.from(execution.stderr);
    checks.push({ phase: name, args, processExitCode: execution.exitCode, signal: execution.signal, errorDetected });
    if (execution.exitCode !== null && (execution.exitCode !== 0 || errorDetected)) {
      exitCode = [124, 130].includes(execution.exitCode) ? execution.exitCode : 5;
      reason = errorDetected ? `${name} reported engine errors; inspect its logs even though the process may have exited zero`
        : `${name} exited ${execution.exitCode}${execution.signal ? ` (${execution.signal})` : ''}`;
    }
    return execution;
  }
  if (!reason) {
    const version = await phase('version', ['--version']);
    if (!exitCode) {
      const observed = observedVersion(version.stdout);
      actualVersion = observed?.raw ?? version.stdout.trim();
      if (!observed || observed.pin !== expected) {
        reason = `Installed version ${actualVersion || '(unrecognized)'} does not match pinned ${declaredVersion}`; exitCode = 3;
      } else if (settings['engine.language']!.value === 'C#' && !actualVersion.includes('.mono.')) {
        reason = 'The configured C# project requires a Godot .NET editor; the selected executable is not the mono edition'; exitCode = 3;
      }
    }
    if (!exitCode) {
      const help = await phase('help', ['--help']);
      if (!exitCode && !/--import\b/.test(help.stdout)) {
        reason = 'The selected executable does not advertise the editor --import capability'; exitCode = 3;
      }
    }
    if (!exitCode) {
      const imported = await phase('import-1', ['--headless', '--path', project, '--import']);
      if (expected!.startsWith('4.7.') && (imported.exitCode === 139 || imported.signal === 'SIGSEGV')) {
        warnings.push(`First Godot 4.7 import crashed (${imported.signal ?? imported.exitCode}); retrying once and retaining both attempts.`);
        exitCode = 0; reason = null;
        await phase('import-2', ['--headless', '--path', project, '--import']);
      }
    }
  }
  const report = { project, engine, declaredVersion, actualVersion, command, timeoutMs, output,
    durationMs: Date.now() - start, status: exitCode === 0 ? 'ok' : exitCode === 3 ? 'not_assessed' : 'failed', exitCode, reason, warnings, checks,
    judgment: 'Editor import only; builds, test coverage, main-scene execution and human play acceptance are not assessed.' };
  files['report.json'] = Buffer.from(JSON.stringify(report, null, 2) + '\n');
  const artifacts = await writeNewDirectory(project, output, files, false);
  return { ...report, artifacts };
}
