import { spawn, execFile } from 'node:child_process';
import { StudioError } from './contract.js';

export async function runProcess(executable: string, args: string[], options: { cwd?: string; timeoutMs?: number; windowsVerbatimArguments?: boolean } = {}) {
  const timeoutMs = options.timeoutMs ?? 60_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new StudioError('INVALID_ARGUMENT', 'Process timeout must be positive');
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(executable, args, { cwd: options.cwd, shell: false, windowsVerbatimArguments: options.windowsVerbatimArguments,
      detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = ''; let stopped: number | undefined;
    function stop(code: number) {
      if (stopped !== undefined) return;
      stopped = code;
      if (!child.pid) return;
      if (process.platform === 'win32') execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], () => {});
      else { try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') child.kill('SIGKILL'); } }
    }
    const timer = setTimeout(() => stop(124), timeoutMs);
    const interrupt = () => stop(130);
    process.once('SIGINT', interrupt); process.once('SIGTERM', interrupt);
    function cleanup() { clearTimeout(timer); process.off('SIGINT', interrupt); process.off('SIGTERM', interrupt); }
    child.stdout.on('data', chunk => { stdout += chunk.toString(); if (stdout.length + stderr.length > 4 * 1024 * 1024) stop(1); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); if (stdout.length + stderr.length > 4 * 1024 * 1024) stop(1); });
    child.once('error', error => { cleanup(); reject(new StudioError('DEPENDENCY_MISSING', `Cannot launch ${executable}: ${error.message}`, 3)); });
    child.once('close', code => { cleanup(); resolve({ exitCode: stopped ?? code ?? 1, stdout, stderr }); });
  });
}
