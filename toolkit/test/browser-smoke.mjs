import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scaffoldPrototype } from '../dist/prototype.js';
import { capturePrototype } from '../dist/capture.js';
const root = await mkdtemp(join(tmpdir(), 'game-studio-browser-test-'));
try {
  await scaffoldPrototype(root, 'replay');
  const htmlPath = join(root, 'prototypes/replay/index.html');
  const before = await readFile(htmlPath, 'utf8');
  const options = { log: 'Enter wait:1', seed: 7, timeoutMs: 30000 };
  const first = await capturePrototype(root, 'prototypes/replay', 'evidence/first', options);
  assert.equal(first.exitCode, 0, JSON.stringify(first));
  const second = await capturePrototype(root, 'prototypes/replay', 'evidence/second', options);
  assert.equal(second.exitCode, 0);
  assert.deepEqual(first.rows.filter(row => row[0] === 'state'), second.rows.filter(row => row[0] === 'state'));
  assert.deepEqual(await readFile(join(root, 'evidence/first/screenshot.png')), await readFile(join(root, 'evidence/second/screenshot.png')));
  assert.equal(await readFile(htmlPath, 'utf8'), before);
  await writeFile(htmlPath, before.replace('<script>', '<script>throw new Error("intentional browser failure");'));
  const failed = await capturePrototype(root, 'prototypes/replay', 'evidence/failure', options);
  assert.equal(failed.exitCode, 5);
  assert.ok(failed.uncaught.length || failed.rows.some(row => ['error', 'crash'].includes(row[0])));
  await writeFile(htmlPath, '<html><body><canvas id="game"></canvas><script>document.title = "No game hook";</script></body></html>');
  const missingHook = await capturePrototype(root, 'prototypes/replay', 'evidence/missing-hook', options);
  assert.equal(missingHook.exitCode, 3, JSON.stringify(missingHook));
  assert.equal(missingHook.replayComplete, false);
  assert.ok(missingHook.rows.some(row => row[0] === 'not_assessed'));
  await writeFile(htmlPath, '<html><body><canvas id="game"></canvas><script type="module" src="entry.js"></script></body></html>');
  await writeFile(join(root, 'prototypes/replay/entry.js'), 'window.game = { scene: "play", state: {}, step() {}, press() {}, hold() {} };');
  const blockedModule = await capturePrototype(root, 'prototypes/replay', 'evidence/file-module', options);
  assert.equal(blockedModule.exitCode, 3, JSON.stringify(blockedModule));
  assert.equal(blockedModule.replayComplete, false);
  assert.ok(blockedModule.notAssessed.some(reason => reason.includes('window.game.step')));
  console.log(JSON.stringify({ browser: first.rows.find(row => row[0] === 'ua')?.[1],
    checks: ['fixed-seed state equality', 'identical screenshots', 'source preservation', 'real browser error detection', 'missing game hook is not assessed', 'file module loading failure is not assessed'] }));
} finally { await rm(root, { recursive: true, force: true }); }
