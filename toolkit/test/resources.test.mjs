import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { resourcePath, resourceFiles } from '../dist/resources.js';

test('bundled onboarding and shared guidance resolve independently of cwd', async () => {
  const files = await resourceFiles('studio/onboarding');
  assert.ok(files['game-studio/SKILL.md']);
  assert.match(await readFile(await resourcePath('studio/docs/integration.md'), 'utf8'), /exact version/);
  await assert.rejects(resourcePath('../package.json'), { code: 'UNSAFE_PATH' });
  await assert.rejects(resourcePath('nonexistent'), { code: 'RESOURCE_MISSING' });
});
