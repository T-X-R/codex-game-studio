import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { join, relative, isAbsolute, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { crc32 } from 'node:zlib';
import { canonicalRoot, safePath } from './files.js';
import { StudioError } from './contract.js';
import { exists } from './project.js';
import { findBrowser, findHeadlessShell, parseConsole } from './capture.js';
import { runProcess } from './process.js';
import { writeNewDirectory } from './prototype.js';

export interface PageShotOptions {
  browser?: string; query?: string; size?: string; waitMs?: number; timeoutMs?: number;
  profile?: string; software?: boolean; fileAccess?: boolean; full?: boolean; once?: boolean; dryRun?: boolean;
  /** Internal process prefix for portable subprocess fixtures, not a CLI option. */
  browserArgs?: string[];
}

function inside(parent: string, child: string) {
  const path = relative(parent, child);
  return !path || (path.split(sep)[0] !== '..' && !isAbsolute(path));
}

// Container integrity only; decoding and judging the rendered pixels remain separate.
function hasPngStructure(bytes: Buffer) {
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return false;
  let offset = 8, imageBytes = 0;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    if (length > 0x7fffffff || end > bytes.length) return false;
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) return false;
    if (offset === 8) {
      if (type !== 'IHDR' || length !== 13) return false;
      const width = bytes.readUInt32BE(offset + 8), height = bytes.readUInt32BE(offset + 12);
      if (!width || !height || width > 0x7fffffff || height > 0x7fffffff) return false;
    } else if (type === 'IHDR') return false;
    if (type === 'IDAT') imageBytes += length;
    if (type === 'IEND') return length === 0 && imageBytes > 0 && end === bytes.length;
    offset = end;
  }
  return false;
}

export async function pageShot(root: string, page: string, output: string, options: PageShotOptions = {}) {
  const project = await canonicalRoot(root);
  const waitMs = options.waitMs ?? 2000, timeoutMs = options.timeoutMs ?? 60000, size = options.size ?? '1280x720';
  const dimensions = /^(\d+)x(\d+)$/.exec(size);
  if (!dimensions || dimensions.slice(1).some(n => !Number.isSafeInteger(Number(n)) || Number(n) < 1 || Number(n) > 16384) ||
      !Number.isSafeInteger(waitMs) || waitMs < 0 || waitMs > 600000 ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600000) {
    throw new StudioError('INVALID_ARGUMENT', 'Size must be 1–16384 pixels per axis; wait 0–600000 ms; timeout 1000–600000 ms');
  }
  const source = await safePath(project, page), destination = await safePath(project, output);
  if (!(await exists(source)) || !(await stat(source)).isFile()) throw new StudioError('FILE_MISSING', 'Page must be an existing regular project file', 1);
  const keptProfile = options.profile ? await safePath(project, options.profile) : null;
  if (keptProfile && (keptProfile === project || inside(keptProfile, source) || inside(keptProfile, destination) || inside(destination, keptProfile))) {
    throw new StudioError('INVALID_ARGUMENT', 'A kept browser profile must be separate from the page and evidence output');
  }
  if (keptProfile && await exists(keptProfile) && !(await stat(keptProfile)).isDirectory()) throw new StudioError('INVALID_ARGUMENT', 'Profile must be a directory');
  if (await exists(destination)) throw new StudioError('FILE_CONFLICT', 'Screenshot evidence requires a new output directory', 4);
  const browser = await findBrowser(options.browser);
  const url = pathToFileURL(source);
  const query = new URLSearchParams(options.query ?? '');
  if (!options.full) query.set('render', 'cheap');
  url.search = query.toString();
  const base = { project, page, url: url.href, output, browser, size, waitMs, timeoutMs,
    render: options.full ? 'full' : 'cheap', software: !!options.software, fileAccess: !!options.fileAccess,
    profile: keptProfile, qualityAssessed: false as const, replayAssessed: false as const };
  if (options.dryRun) return { ...base, status: 'planned', exitCode: 0, attempts: [], console: [], uncaught: [],
    effects: ['Run the original file page in a separate browser profile', 'Preserve screenshot and all attempted browser logs in a new evidence directory'] };

  const temporary = await mkdtemp(join(tmpdir(), 'game-studio-page-shot-'));
  const profile = keptProfile ?? join(temporary, 'profile');
  const evidence: Record<string, Buffer> = {};
  const attempts: { browser: string; timing: 'virtual' | 'real'; args: string[]; exitCode: number; signal: string | null; screenshot: boolean; console: string[]; consoleEntries: { line: string | null; message: string }[]; uncaught: string[] }[] = [];
  let png: Buffer | null = null;
  try {
    await mkdir(profile, { recursive: true });
    async function shoot(executable: string, timing: 'virtual' | 'real') {
      const screenshot = join(temporary, `attempt-${attempts.length + 1}.png`);
      const args = [...(options.browserArgs ?? []), '--headless=new', `--user-data-dir=${profile}`, '--no-first-run',
        '--no-default-browser-check', '--hide-scrollbars', '--enable-logging=stderr', '--v=0',
        ...(options.software ? ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] : []),
        ...(options.fileAccess ? ['--allow-file-access-from-files'] : []), `--window-size=${dimensions![1]},${dimensions![2]}`,
        timing === 'virtual' ? `--virtual-time-budget=${waitMs}` : `--timeout=${Math.max(1000, Math.floor(timeoutMs / 2))}`,
        `--screenshot=${screenshot}`, url.href];
      let execution;
      try { execution = await runProcess(executable, args, { cwd: project, timeoutMs }); }
      catch (error) {
        if (!(error instanceof StudioError) || error.code !== 'DEPENDENCY_MISSING') throw error;
        execution = { exitCode: 3, signal: null, stdout: '', stderr: error.message };
      }
      const number = attempts.length + 1;
      evidence[`attempt-${number}.stdout.log`] = Buffer.from(execution.stdout);
      evidence[`attempt-${number}.stderr.log`] = Buffer.from(execution.stderr);
      const observed = parseConsole(execution.stderr);
      const rawConsole = execution.stderr.split('\n').filter(line => /:CONSOLE[:(]/.test(line));
      const consoleEntries = observed.console.map((message, index) => ({ line: rawConsole[index]?.match(/:CONSOLE[:(](\d+)/)?.[1] ?? null, message }));
      const bytes = await exists(screenshot) ? await readFile(screenshot) : null;
      const valid = bytes !== null && hasPngStructure(bytes);
      if (bytes) evidence[`attempt-${number}.png`] = bytes;
      if (valid) png = bytes;
      const attempt = { browser: executable, timing, args, exitCode: execution.exitCode, signal: execution.signal,
        screenshot: valid, console: observed.console, consoleEntries, uncaught: observed.uncaught };
      attempts.push(attempt);
      return attempt;
    }
    let last = await shoot(browser, 'virtual');
    // An explicit browser is authoritative; automatic discovery may try an installed shell.
    if (!png && ![124, 130].includes(last.exitCode) && !options.browser && !process.env.GAME_STUDIO_BROWSER) {
      const shell = await findHeadlessShell();
      if (shell && shell !== browser) last = await shoot(shell, 'virtual');
    }
    if (!png && last.exitCode === 124 && !options.once) last = await shoot(last.browser, 'real');
    const exitCode = [124, 130].includes(last.exitCode) ? last.exitCode : png && last.exitCode === 0 ? 0 : 3;
    const report = { ...base, capturedAt: new Date().toISOString(), status: exitCode === 0 ? 'recorded' : 'not_assessed', exitCode, attempts,
      console: attempts.flatMap(a => a.console), uncaught: attempts.flatMap(a => a.uncaught),
      judgment: 'Screenshot and console observations only. Image content, asset loading, game behavior, replay and human acceptance require review.' };
    evidence['report.json'] = Buffer.from(JSON.stringify(report, null, 2) + '\n');
    if (png) evidence['screenshot.png'] = png;
    const artifacts = await writeNewDirectory(project, output, evidence, false);
    return { ...report, artifacts };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export function formatPageShot(data: Awaited<ReturnType<typeof pageShot>>) {
  const rows: string[][] = [['browser', data.browser], ['render', data.render]];
  if ('capturedAt' in data) rows.push(['time', data.capturedAt]);
  for (const [index, attempt] of data.attempts.entries()) {
    if (index && attempt.browser !== data.attempts[index - 1]!.browser) rows.push(['browser', attempt.browser]);
    rows.push(['attempt', String(index + 1), attempt.timing, String(attempt.exitCode)]);
    if (!attempt.screenshot) rows.push(['stopped', attempt.browser, `exit ${attempt.exitCode}${attempt.signal ? `; ${attempt.signal}` : ''}; no PNG`]);
    if (attempt.timing === 'real') rows.push(['capped', String(data.timeoutMs), String(Math.max(1000, Math.floor(data.timeoutMs / 2)))]);
    for (const entry of attempt.consoleEntries) rows.push(['console', entry.line ?? '-', entry.message]);
  }
  rows.push(['uncaught', String(data.uncaught.length)]);
  if ('artifacts' in data) {
    const shot = data.artifacts.files.find(file => file.path === `${data.output}/screenshot.png`);
    rows.push(['shot', shot?.path ?? '-', String(shot?.bytes ?? 0)]);
  }
  if (data.status === 'planned') rows.push(['planned', 'No browser executed or evidence written']);
  else if (data.exitCode) rows.push(['not_assessed', 'Inspect preserved attempt logs and report']);
  return rows.map(row => row.map(cell => cell.replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n')).join('\t')).join('\n') + '\n';
}
