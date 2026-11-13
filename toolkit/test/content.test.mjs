import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { validateSkill, validateRole } from '../dist/content-check.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('canonical Skills have Codex metadata and identical packaged bodies', async () => {
  for (const relative of ['.agents/skills', 'studio/onboarding']) {
    for (const directory of await readdir(join(root, relative))) {
      const path = `${relative}/${directory}/SKILL.md`;
      const text = await readFile(join(root, path), 'utf8');
      assert.deepEqual(validateSkill(text, directory).issues, [], path);
      assert.equal(await readFile(join(root, 'toolkit/resources', path), 'utf8'), text);
    }
  }
});
test('canonical roles parse as TOML and preserve exact packaged instructions', async () => {
  for (const filename of await readdir(join(root, '.codex/agents'))) {
    const path = `.codex/agents/${filename}`;
    const text = await readFile(join(root, path), 'utf8');
    assert.deepEqual(validateRole(text, filename.replace(/\.toml$/, '')).issues, [], path);
    assert.equal(await readFile(join(root, 'toolkit/resources', path), 'utf8'), text);
  }
});
