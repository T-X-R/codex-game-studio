import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startPreview } from '../dist/preview.js';
import { checkPrototype } from '../dist/check.js';
test('preview serves only the chosen directory and rejects private paths, symlinks and foreign hosts', async t => {
  const root = await mkdtemp(join(tmpdir(), 'game-studio-preview-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'index.html'), '<title>Game</title>');
  await writeFile(join(root, '.env'), 'secret');
  await symlink(join(root, '.env'), join(root, 'leak.txt'));
  const { server, url } = await startPreview(root, 0);
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  assert.equal(await (await fetch(url)).text(), '<title>Game</title>');
  assert.equal((await fetch(`${url}.env`)).status, 403);
  assert.equal((await fetch(`${url}leak.txt`)).status, 403);
  const foreignHost = await new Promise((resolve, reject) => {
    get(url, { headers: { host: 'attacker.example' } }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject);
  });
  assert.equal(foreignHost, 403);
  assert.equal((await fetch(`${url}missing.js`)).status, 404);
});
test('static checks find syntax errors and missing local scripts without executing the game', async t => {
  const root = await mkdtemp(join(tmpdir(), 'game-studio-check-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'index.html'), '<script>globalThis.executed = true;</script>');
  assert.equal((await checkPrototype(root)).checks[0].status, 'ok');
  assert.equal(globalThis.executed, undefined);
  await writeFile(join(root, 'index.html'), '<script src="missing.js"></script><script>const = ;</script>');
  const result = await checkPrototype(root);
  assert.equal(result.checks.filter(check => check.status === 'failed').length, 2);
  assert.equal(result.browser.status, 'not_assessed');
});
