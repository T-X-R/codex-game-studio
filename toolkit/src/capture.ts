import { access, mkdtemp, readFile, rm, mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { StudioError } from './contract.js';
import { safePath } from './files.js';
import { exists } from './project.js';
import { resourcePath } from './resources.js';
import { collect, writeNewDirectory } from './prototype.js';
import { runProcess } from './process.js';

async function executable(path: string) {
  try { await access(path, constants.X_OK); return (await stat(path)).isFile(); }
  catch (error) { if (['ENOENT', 'EACCES', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) return false; throw error; }
}

export async function findHeadlessShell(): Promise<string | null> {
  const names = process.platform === 'win32' ? ['chrome-headless-shell.exe', 'chrome-headless-shell'] : ['chrome-headless-shell'];
  const candidates = (process.env.PATH ?? '').split(delimiter).flatMap(path => names.map(name => join(path, name)));
  const stores = process.env.PLAYWRIGHT_BROWSERS_PATH ? [process.env.PLAYWRIGHT_BROWSERS_PATH] : [
    join(homedir(), '.cache/ms-playwright'), join(homedir(), 'Library/Caches/ms-playwright'),
    ...(process.env.LOCALAPPDATA ? [join(process.env.LOCALAPPDATA, 'ms-playwright')] : []),
  ];
  for (const store of stores) {
    let versions: string[];
    try { versions = (await readdir(store)).filter(name => name.startsWith('chromium_headless_shell-')).sort((a, b) => b.localeCompare(a, 'en', { numeric: true })); }
    catch (error) { if (['ENOENT', 'EACCES', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) continue; throw error; }
    for (const version of versions) {
      for (const platform of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64', 'chrome-headless-shell-win64']) {
        candidates.push(...names.map(name => join(store, version, platform, name)));
      }
    }
  }
  for (const candidate of candidates) if (await executable(candidate)) return resolve(candidate);
  return null;
}

export async function findBrowser(explicit = process.env.GAME_STUDIO_BROWSER): Promise<string> {
  const names = (name: string) => process.platform === 'win32' && !name.toLowerCase().endsWith('.exe') ? [name, `${name}.exe`] : [name];
  const candidates = explicit ? /[/\\]/.test(explicit) ? [resolve(explicit)]
    : (process.env.PATH ?? '').split(delimiter).flatMap(path => names(explicit).map(name => join(path, name))) : [
    ...(process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'] : []),
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].flatMap(key => process.env[key] ? [join(process.env[key]!, 'Google/Chrome/Application/chrome.exe'), join(process.env[key]!, 'Microsoft/Edge/Application/msedge.exe')] : []),
    ...(process.env.PATH ?? '').split(delimiter).flatMap(path => ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'microsoft-edge', 'msedge', 'chrome-headless-shell'].flatMap(names).map(name => join(path, name))),
  ];
  for (const candidate of candidates) if (await executable(candidate)) return resolve(candidate);
  if (!explicit) { const shell = await findHeadlessShell(); if (shell) return shell; }
  throw new StudioError('DEPENDENCY_MISSING', 'Configure --browser or GAME_STUDIO_BROWSER with an installed Chromium-family executable', 3);
}

export function parseConsole(stderr: string) {
  const consoleLines = stderr.split('\n').filter(line => /:CONSOLE[:(]/.test(line))
    .map(line => line.replace(/^[^\]]*\]\s*"/, '').replace(/", source: .*$/, ''));
  return { console: consoleLines, rows: consoleLines.filter(line => line.startsWith('RUN|')).map(line => line.slice(4).split('|')),
    uncaught: consoleLines.filter(line => line.startsWith('Uncaught')) };
}

export async function capturePrototype(project: string, folder: string, output: string,
  options: { browser?: string; log?: string; seed?: number; timeoutMs?: number; hookless?: boolean; dryRun?: boolean } = {}) {
  const browser = await findBrowser(options.browser);
  const seed = options.seed ?? 1;
  const timeoutMs = options.timeoutMs ?? 60_000;
  if (!Number.isSafeInteger(seed) || seed < 1 || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600_000) {
    throw new StudioError('INVALID_ARGUMENT', 'Seed must be a positive integer; timeout must be 1000–600000 ms');
  }
  const source = await safePath(project, folder);
  const destination = await safePath(project, output);
  if (await exists(destination)) throw new StudioError('FILE_CONFLICT', 'Capture output must be a new evidence directory', 4);
  if (options.dryRun) return { exitCode: 0, project, source, output, browser, seed, log: options.log ?? 'wait:1', temporaryGameCopy: true };
  const files = await collect(source);
  const driver = await readFile(await resourcePath('studio/scripts/one-shot-driver.js'), 'utf8');
  const html = files['index.html']!.toString('utf8');
  if (!/<script\b/i.test(html)) throw new StudioError('ASSESSMENT_UNAVAILABLE', 'Replay requires a script-bearing HTML game', 3);
  files['index.html'] = Buffer.from(html.replace(/<script\b/i, () => `<script>\n${driver}\n</script>\n<script`));
  const temporary = await mkdtemp(join(tmpdir(), 'game-studio-capture-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      const target = join(temporary, 'game', path);
      await mkdir(dirname(target), { recursive: true }); await writeFile(target, content);
    }
    const page = pathToFileURL(join(temporary, 'game/index.html'));
    page.search = new URLSearchParams({ manual: '1', seed: String(seed), log: options.log ?? 'wait:1',
      limit: String(Math.max(1000, timeoutMs - 5000)), render: 'cheap', ...(options.hookless ? { hookless: '1' } : {}) }).toString();
    const screenshot = join(temporary, 'screenshot.png');
    const execution = await runProcess(browser, ['--headless=new', `--user-data-dir=${join(temporary, 'profile')}`, '--no-first-run',
      '--no-default-browser-check', '--hide-scrollbars', '--enable-logging=stderr', '--v=0', '--use-gl=angle', '--use-angle=swiftshader-webgl',
      '--enable-unsafe-swiftshader', '--window-size=1280,720', '--virtual-time-budget=500', `--screenshot=${screenshot}`, page.href], { timeoutMs });
    const observations = parseConsole(execution.stderr);
    const png = await exists(screenshot) ? await readFile(screenshot) : null;
    const notAssessed = observations.rows.filter(row => row[0] === 'not_assessed').map(row => row.slice(1).join(' | '));
    const complete = notAssessed.length === 0 && observations.rows.some(row => row[0] === 'done' && ['stop', 'log finished'].includes(row[3]!));
    const failed = observations.uncaught.length > 0 || observations.rows.some(row => ['crash', 'error', 'nonfinite', 'badinput', 'botfail'].includes(row[0]!));
    const exitCode = [124, 130].includes(execution.exitCode) ? execution.exitCode : failed ? 5 : !png || !complete || execution.exitCode !== 0 ? 3 : 0;
    const report = { exitCode, browser, seed, log: options.log ?? 'wait:1', hookless: !!options.hookless, source: folder,
      browserExitCode: execution.exitCode, replayComplete: complete, notAssessed, ...observations, judgment: 'Recorded replay evidence; design quality and human play acceptance are not assessed.' };
    const evidence: Record<string, Buffer> = { 'report.json': Buffer.from(`${JSON.stringify(report, null, 2)}\n`), 'browser.log': Buffer.from(execution.stderr) };
    if (png) evidence['screenshot.png'] = png;
    const artifacts = await writeNewDirectory(project, output, evidence, false);
    return { ...report, artifacts };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
