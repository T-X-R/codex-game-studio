// Live packed-runtime growth acceptance. Requires npm access and installed Chrome.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess } from '../dist/process.js';
import { npmPath } from '../dist/runtime.js';
import { findBrowser } from '../dist/capture.js';

const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-growth-live-')));
const project = join(directory, 'Web game 验证');
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const launcher = join(project, '.game-studio/run.cjs');
const invocations = [];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function execute(entry, args, cwd = directory, expected = 0) {
  const result = await runProcess(process.execPath, [entry, ...args], { cwd, timeoutMs: 240000 });
  invocations.push({ args, expected, ...result });
  await writeFile(join(directory, 'commands.json'), JSON.stringify(invocations, null, 2), { mode: 0o600 });
  assert.equal(result.exitCode, expected, result.stdout + result.stderr);
  return result;
}
async function command(entry, args, expected = 0) { return JSON.parse((await execute(entry, [...args, '--json'], directory, expected)).stdout); }
try {
  const browser = await findBrowser();
  const npm = await npmPath();
  const packed = await execute(npm, ['pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json']);
  const archive = join(directory, JSON.parse(packed.stdout)[0].filename);
  // First installation is online; offline restore requires its dependency cache.
  const prefix = join(directory, 'installed-cli');
  await execute(npm, ['install', '--prefix', prefix, archive, '--ignore-scripts', '--no-audit', '--no-fund']);
  const cli = join(prefix, 'node_modules/@t-x-r/game-studio/dist/cli.js');
  await command(cli, ['init', project, '--engine', 'web']);
  await command(cli, ['restore', '--project', project, '--archive', archive, '--offline']);
  await command(launcher, ['prototype', 'scaffold', 'demo', '--project', project]);
  const source = join(project, 'prototypes/demo/index.html');
  // A small observable rule exercises input and scoring, not just a static title screen.
  let html = (await readFile(source, 'utf8')).replace('state.t += dt; // the game',
    "state.t += dt; if (pressed('Space')) state.score += 2; // growth fixture rule");
  assert.ok(html.includes('growth fixture rule'));
  html = html.replace('</body>', '<script src="tune.js"></script>\n</body>');
  await writeFile(source, html);
  const tuning = 'window.DEVELOPMENT_TUNING_SENTINEL = true;';
  await writeFile(join(project, 'prototypes/demo/tune.js'), tuning);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB9sAAAAASUVORK5CYII=', 'base64');
  await writeFile(join(project, 'prototypes/demo/assets/fixture.png'), png);
  const input = ['--browser', browser, '--log', 'Enter Space wait:1 Space wait:1', '--seed', '7', '--project', project];
  const reference = await command(launcher, ['capture', 'prototypes/demo', '--output', 'production/evidence/reference', ...input]);
  const repeated = await command(launcher, ['capture', 'prototypes/demo', '--output', 'production/evidence/repeated', ...input]);
  const rows = report => report.data.rows.filter(row => ['state', 'scene'].includes(row[0]));
  assert.ok(rows(reference).some(row => row.join('|').includes('score')));
  assert.equal(JSON.parse(reference.data.rows.filter(row => row[0] === 'state').at(-1)[3]).score, 4);
  assert.deepEqual(rows(repeated), rows(reference));
  const referenceImage = await readFile(join(project, 'production/evidence/reference/screenshot.png'));
  assert.deepEqual(await readFile(join(project, 'production/evidence/repeated/screenshot.png')), referenceImage);
  const preview = await command(launcher, ['prototype', 'grow', 'demo', '--stage', 'copy', '--dry-run', '--project', project]);
  assert.equal(preview.data.outcome, 'planned');
  await assert.rejects(readFile(join(project, 'package.json')), { code: 'ENOENT' });
  const copy = await command(launcher, ['prototype', 'grow', 'demo', '--stage', 'copy', '--project', project]);
  assert.equal(copy.data.outcome, 'copied'); assert.equal(copy.data.verification.state, 'not_assessed');
  await execute(npm, ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], project);
  const build = await command(launcher, ['test', '--kind', 'build', '--output', 'production/evidence/build', '--project', project]);
  assert.equal(build.data.processExitCode, 0);
  const folderCapture = await command(launcher, ['capture', 'dist', '--output', 'production/evidence/folder-file', ...input], 3);
  assert.equal(folderCapture.status, 'not_assessed');
  assert.equal(folderCapture.data.replayComplete, false);
  assert.ok(folderCapture.data.notAssessed.length > 0);
  await execute(npm, ['run', 'build:single'], project);
  const built = await readFile(join(project, 'dist-single/index.html'), 'utf8');
  assert.ok(!built.includes('DEVELOPMENT_TUNING_SENTINEL'));
  const replay = await command(launcher, ['capture', 'dist-single', '--output', 'production/evidence/copied', ...input]);
  assert.deepEqual(rows(replay), rows(reference));
  assert.deepEqual(await readFile(join(project, 'production/evidence/copied/screenshot.png')), referenceImage);
  assert.equal(await readFile(source, 'utf8'), html);
  assert.equal(await readFile(join(project, 'prototypes/demo/tune.js'), 'utf8'), tuning);
  assert.deepEqual(await readFile(join(project, 'assets/fixture.png')), png);
  // The copy stage must not invent passing game tests before rules are extracted.
  await execute(npm, ['run', 'test:unit'], project, 1);
  const report = { status: 'passed', stage: 'copy', node: process.version,
    browser: reference.data.rows.find(row => row[0] === 'ua')?.[1],
    sourceSha256: digest(Buffer.from(html)), screenshotSha256: digest(referenceImage),
    assetSha256: digest(png), builtSha256: digest(Buffer.from(built)),
    seed: 7, log: 'Enter Space wait:1 Space wait:1', states: rows(replay),
    checks: ['online packed CLI install', 'offline project runtime restore', 'reference repeatability', 'dry-run', 'source preservation', 'binary asset preservation',
      'npm ci from lock', 'configured build discovery', 'file module capture is not assessed', 'single-file build', 'development tuning excluded', 'copy replay equality', 'empty tests do not pass'],
    notAssessed: ['full TypeScript conversion', 'configuration data extraction', 'game-rule unit tests', 'all asset loading patterns', 'human play'] };
  await writeFile(join(directory, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, evidence: directory }));
} catch (error) {
  console.error(`Growth evidence retained at ${directory}`);
  if (error.code === 'DEPENDENCY_MISSING') { console.error(`NOT ASSESSED: ${error.message}`); process.exitCode = 3; }
  else throw error;
}
