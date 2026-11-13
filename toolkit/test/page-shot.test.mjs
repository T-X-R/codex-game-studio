import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pageShot, formatPageShot } from '../dist/page-shot.js';
import { findBrowser, findHeadlessShell } from '../dist/capture.js';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio plain page 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'build'));
  await writeFile(join(root, 'build/index.html'), '<h1>Existing static page</h1>');
  const fake = join(root, 'fake-browser.cjs');
  await writeFile(fake, `const fs=require('node:fs');
const args=process.argv.slice(2), mode=args.shift();
fs.appendFileSync(${JSON.stringify(join(root, 'calls.jsonl'))},JSON.stringify(args)+'\\n');
if(mode==='timeout' && args.some(a=>a.startsWith('--virtual-time-budget='))) setInterval(()=>{},1000);
else if(mode==='missing') process.exit(7);
else {
  const path=args.find(a=>a.startsWith('--screenshot=')).slice(13);
  let image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=','base64');
  if(mode==='header-only') image=Buffer.concat([image.subarray(0,8),Buffer.alloc(16)]);
  if(mode==='truncated') image=image.subarray(0,45);
  if(mode==='bad-crc') image[45]^=1;
  if(mode==='no-end') image=image.subarray(0,image.length-12);
  if(mode==='zero-width') { image.writeUInt32BE(0,16); image.writeUInt32BE(require('node:zlib').crc32(image.subarray(12,29)),29); }
  fs.writeFileSync(path,image);
  process.stderr.write('[1:INFO:CONSOLE:2] "plain console", source: file:///page (2)\\n');
  if(mode==='uncaught') process.stderr.write('[1:INFO:CONSOLE:3] "Uncaught Error: page failed", source: file:///page (3)\\n');
}`);
  return { root, options: { browser: process.execPath, browserArgs: [fake, 'ok'], timeoutMs: 2000 } };
}

test('plain capture opens the original scriptless page, records artifacts and never injects replay inputs', async t => {
  const { root, options } = await fixture(t);
  const before = await readFile(join(root, 'build/index.html'));
  const r = await pageShot(root, 'build/index.html', 'evidence', { ...options, query: 'scene=title', software: true, fileAccess: true });
  assert.equal(r.exitCode, 0); assert.equal(r.qualityAssessed, false);
  assert.equal(r.attempts.length, 1); assert.deepEqual(r.console, ['plain console']);
  assert.match(formatPageShot(r), /console\t2\tplain console/);
  assert.match(formatPageShot(r), /shot\tevidence\/screenshot.png\t\d+/);
  const args = JSON.parse((await readFile(join(root, 'calls.jsonl'), 'utf8')).trim());
  assert.ok(args.includes('--allow-file-access-from-files'));
  assert.ok(args.includes('--use-angle=swiftshader-webgl'));
  const url = new URL(args.at(-1));
  assert.equal(url.protocol, 'file:'); assert.ok(decodeURIComponent(url.pathname).endsWith('/build/index.html'));
  assert.equal(url.searchParams.get('scene'), 'title'); assert.equal(url.searchParams.get('render'), 'cheap');
  for (const key of ['manual', 'seed', 'log']) assert.equal(url.searchParams.has(key), false);
  const profile = args.find(a => a.startsWith('--user-data-dir=')).slice(16);
  await assert.rejects(readdir(profile), { code: 'ENOENT' });
  assert.deepEqual(await readFile(join(root, 'build/index.html')), before);
  assert.ok((await readFile(join(root, 'evidence/screenshot.png'))).length > 8);
  assert.ok(await readFile(join(root, 'evidence/attempt-1.stderr.log')));
});

test('browser discovery resolves explicit PATH names and installed headless-shell stores without running them', async t => {
  const { root } = await fixture(t), oldPath = process.env.PATH, oldStore = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const name = process.platform === 'win32' ? 'test-browser.exe' : 'test-browser';
  const shellName = process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell';
  const platform = process.platform === 'win32' ? 'chrome-headless-shell-win64' : 'chrome-headless-shell-linux64';
  await writeFile(join(root, name), '', { mode: 0o755 });
  const shell = join(root, 'cache/chromium_headless_shell-123', platform, shellName);
  await mkdir(join(shell, '..'), { recursive: true }); await writeFile(shell, '', { mode: 0o755 });
  try {
    process.env.PATH = root; process.env.PLAYWRIGHT_BROWSERS_PATH = join(root, 'cache');
    assert.equal(await findBrowser(name), join(root, name));
    assert.equal(await findHeadlessShell(), shell);
    await assert.rejects(findBrowser(join(root, 'cache')), { code: 'DEPENDENCY_MISSING' });
  } finally {
    if (oldPath === undefined) delete process.env.PATH; else process.env.PATH = oldPath;
    if (oldStore === undefined) delete process.env.PLAYWRIGHT_BROWSERS_PATH; else process.env.PLAYWRIGHT_BROWSERS_PATH = oldStore;
  }
});

test('installed-layout wrapper validates options, resolves browser and previews without execution', async t => {
  const { root } = await fixture(t);
  const wrapper = fileURLToPath(new URL('../resources/studio/scripts/page-shot.mjs', import.meta.url));
  const run = args => spawnSync(process.execPath, [wrapper, ...args], { encoding: 'utf8' });
  assert.equal(run(['--which', '--browser', process.execPath]).stdout.trim(), process.execPath);
  const args = ['--project', root, 'build/index.html', 'evidence', '--browser', process.execPath, '--dry-run'];
  let result = run(args); assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, 'planned');
  result = run([...args, '--text']); assert.equal(result.status, 0); assert.match(result.stdout, /planned\tNo browser/);
  for (const invalid of [[], ['--which', 'page'], ['--which', '--software'], [...args, '--dry-run'], [...args, '--unknown'], [...args, '--wait', 'NaN']]) {
    assert.equal(run(invalid).status, 2, JSON.stringify(invalid));
  }
  await assert.rejects(readFile(join(root, 'calls.jsonl')), { code: 'ENOENT' });
});

test('dry run validates the page and output but runs no browser or persistent profile writes', async t => {
  const { root, options } = await fixture(t); const before = await readdir(root);
  const r = await pageShot(root, 'build/index.html', 'evidence', { ...options, profile: 'profiles/inspection', full: true, dryRun: true });
  assert.equal(r.status, 'planned'); assert.equal(r.url.includes('render='), false);
  assert.deepEqual(await readdir(root), before);
  await assert.rejects(pageShot(root, 'missing.html', 'evidence', { ...options, dryRun: true }), { code: 'FILE_MISSING' });
});

test('explicit persistent profiles are retained and full rendering keeps query unchanged', async t => {
  const { root, options } = await fixture(t);
  const r = await pageShot(root, 'build/index.html', 'evidence', { ...options, profile: 'profiles/inspection', full: true, query: 'scene=full' });
  assert.equal(r.exitCode, 0); assert.equal(new URL(r.url).search, '?scene=full');
  assert.deepEqual(await readdir(join(root, 'profiles/inspection')), []);
});

test('page errors are retained as observations rather than a clean game verdict', async t => {
  const { root, options } = await fixture(t); options.browserArgs[1] = 'uncaught';
  const r = await pageShot(root, 'build/index.html', 'evidence', options);
  assert.equal(r.exitCode, 0); assert.equal(r.uncaught.length, 1); assert.equal(r.qualityAssessed, false);
  assert.equal(r.replayAssessed, false);
});

test('no screenshot preserves a failed browser attempt without claiming a clean page', async t => {
  const { root, options } = await fixture(t); options.browserArgs[1] = 'missing';
  const r = await pageShot(root, 'build/index.html', 'evidence', options);
  assert.equal(r.exitCode, 3); assert.equal(r.status, 'not_assessed');
  assert.equal(r.attempts[0].exitCode, 7);
  await assert.rejects(readFile(join(root, 'evidence/screenshot.png')), { code: 'ENOENT' });
  assert.ok(await readFile(join(root, 'evidence/report.json')));
});

test('incomplete or corrupt PNGs remain raw attempt artifacts and never become successful screenshots', async t => {
  const { root, options } = await fixture(t);
  for (const mode of ['header-only', 'truncated', 'bad-crc', 'no-end', 'zero-width']) {
    const r = await pageShot(root, 'build/index.html', mode, { ...options, browserArgs: [options.browserArgs[0], mode] });
    assert.equal(r.exitCode, 3, mode); assert.equal(r.status, 'not_assessed', mode);
    assert.equal(r.attempts[0].exitCode, 0); assert.equal(r.attempts[0].screenshot, false);
    assert.ok((await readFile(join(root, mode, 'attempt-1.png'))).length);
    await assert.rejects(readFile(join(root, mode, 'screenshot.png')), { code: 'ENOENT' });
  }
});

test('automatic Windows PATH discovery includes executable suffixes without requiring a standard installation', async t => {
  const { root } = await fixture(t);
  await writeFile(join(root, 'msedge.exe'), '', { mode: 0o755 });
  const module = new URL('../dist/capture.js', import.meta.url).href;
  const script = `Object.defineProperty(process, 'platform', { value: 'win32' });
    const { findBrowser } = await import(${JSON.stringify(module)});
    console.log(await findBrowser());`;
  const env = { ...process.env, PATH: root, PLAYWRIGHT_BROWSERS_PATH: join(root, 'empty-cache') };
  for (const key of ['GAME_STUDIO_BROWSER', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA']) delete env[key];
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), join(root, 'msedge.exe'));
});

test('timeout uses one explicitly recorded real-time retry and once suppresses it', async t => {
  const { root, options } = await fixture(t); options.browserArgs[1] = 'timeout'; options.timeoutMs = 1000;
  const r = await pageShot(root, 'build/index.html', 'retried', options);
  assert.equal(r.exitCode, 0); assert.equal(r.attempts.length, 2);
  assert.equal(r.attempts[0].exitCode, 124); assert.equal(r.attempts[1].timing, 'real');
  const once = await pageShot(root, 'build/index.html', 'once', { ...options, once: true });
  assert.equal(once.exitCode, 124); assert.equal(once.attempts.length, 1);
});

test('invalid options, path escapes, profile overlap and existing evidence fail before execution', async t => {
  const { root, options } = await fixture(t);
  for (const extra of [{ waitMs: -1 }, { waitMs: 1.5 }, { timeoutMs: 0 }, { size: '0x720' }, { size: '1280x0' }, { size: '1280;bad' }, { profile: 'evidence/cache' }]) {
    await assert.rejects(pageShot(root, 'build/index.html', 'evidence', { ...options, ...extra }), { code: 'INVALID_ARGUMENT' });
  }
  await assert.rejects(pageShot(root, 'build/index.html', 'evidence', { ...options, profile: '.' }), { code: 'UNSAFE_PATH' });
  await assert.rejects(pageShot(root, '../page.html', 'evidence', options), { code: 'UNSAFE_PATH' });
  await mkdir(join(root, 'evidence'));
  await assert.rejects(pageShot(root, 'build/index.html', 'evidence', options), { code: 'FILE_CONFLICT' });
  await assert.rejects(readFile(join(root, 'calls.jsonl')), { code: 'ENOENT' });
});
