import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runtimeFiles, inspectRuntime } from '../dist/runtime.js';

test('runtime pins an exact package and refuses missing or mismatched installations', async t => {
  const root = await mkdtemp(join(tmpdir(), 'game-studio-runtime-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const files = await runtimeFiles();
  await mkdir(join(root, '.game-studio'), { recursive: true });
  for (const [path, content] of Object.entries(files)) await writeFile(join(root, path), content);
  const absent = await inspectRuntime(root);
  assert.equal(absent.state, 'missing');
  assert.match(absent.expectedVersion, /^\d+\.\d+\.\d+/);
  const dir = join(root, '.game-studio/node_modules/@t-x-r/game-studio');
  await mkdir(join(dir, 'dist'), { recursive: true });
  await writeFile(join(dir, 'package.json'), JSON.stringify({ name: '@t-x-r/game-studio', version: '999.0.0' }));
  await writeFile(join(dir, 'dist/cli.js'), '');
  assert.equal((await inspectRuntime(root)).state, 'mismatch');
  await writeFile(join(dir, 'package.json'), JSON.stringify({ name: '@t-x-r/game-studio', version: absent.expectedVersion }));
  assert.equal((await inspectRuntime(root)).state, 'ready');
});
