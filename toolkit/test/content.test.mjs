import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseDocument } from 'yaml';

const root = fileURLToPath(new URL('../../', import.meta.url));
function validateSkill(text, directory) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  assert.ok(match, 'Skill needs YAML frontmatter');
  const document = parseDocument(match[1], { uniqueKeys: true });
  assert.equal(document.errors.length, 0);
  const value = document.toJS({ maxAliasCount: 20 });
  assert.equal(value.name, directory);
  assert.match(value.name, /^game-studio(?:-[a-z0-9-]+)?$/);
  assert.ok(typeof value.description === 'string' && value.description.trim());
  for (const key of Object.keys(value)) assert.ok(['name', 'description', 'metadata'].includes(key), `Unsupported migrated metadata: ${key}`);
  assert.doesNotMatch(text, /CLAUDE_SKILL_DIR|\$ARGUMENTS|AskUserQuestion|allowed-tools:|\.claude\//);
  return value;
}
test('canonical Skills have Codex metadata and identical packaged bodies', async () => {
  for (const relative of ['.agents/skills', 'studio/onboarding']) {
    for (const directory of await readdir(join(root, relative))) {
      const path = `${relative}/${directory}/SKILL.md`;
      const text = await readFile(join(root, path), 'utf8');
      validateSkill(text, directory);
      assert.equal(await readFile(join(root, 'toolkit/resources', path), 'utf8'), text);
    }
  }
});
test('invalid metadata and a legacy runtime reference fail content validation', () => {
  const valid = '---\nname: game-studio-example\ndescription: Example\n---\nBody\n';
  validateSkill(valid, 'game-studio-example');
  assert.throws(() => validateSkill(valid.replace('description: Example', 'description: Example\nmodel: haiku'), 'game-studio-example'));
  assert.throws(() => validateSkill(`${valid}Read .claude/docs/example.md`, 'game-studio-example'));
});
