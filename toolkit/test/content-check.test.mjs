import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateSkill, validateRole } from '../dist/content-check.js';

const skill = '---\nname: game-studio-example\ndescription: Explain a game mechanic.\n---\nRead the agreed brief.\n';
const role = 'name = "game-studio-example"\ndescription = "Review a mechanic."\ndeveloper_instructions = \'\'\'Read the brief.\nReturn findings.\'\'\'\n';

test('Codex metadata accepts YAML and TOML strings, including CRLF and multiline instructions', () => {
  assert.deepEqual(validateSkill(skill, 'game-studio-example').issues, []);
  assert.deepEqual(validateSkill(skill.replaceAll('\n', '\r\n'), 'game-studio-example').issues, []);
  assert.equal(validateRole(role, 'game-studio-example').name, 'game-studio-example');
  assert.deepEqual(validateRole(role, 'game-studio-example').issues, []);
  const quoted = role.replace('name =', '"name" =').replace("'''Read the brief.\nReturn findings.'''", '"Read the brief.\\nReturn findings."');
  assert.deepEqual(validateRole(quoted, 'game-studio-example').issues, []);
});

test('malformed or missing Skill metadata and empty bodies cannot pass', () => {
  for (const text of [
    'No metadata', skill.replace('---\nRead', 'Read'),
    skill.replace('description: Explain a game mechanic.', 'description: [unterminated'),
    skill.replace('description: Explain a game mechanic.', 'description: true'),
    skill.replace('description: Explain a game mechanic.', 'description: " "'),
    skill.replace('description: Explain a game mechanic.', 'name: game-studio-duplicate'),
    skill.replace('Read the agreed brief.', ''),
    skill.replace('name: game-studio-example', 'name: game-studio-Example'),
    skill.replace('name: game-studio-example', 'name: game-studio-other'),
  ]) assert.ok(validateSkill(text, 'game-studio-example').issues.length > 0, text);
});

test('role syntax, duplicate keys, wrong types and ignored host settings are reported', () => {
  for (const text of [
    role + 'name = "duplicate"\n', role.replace('"Review a mechanic."', 'false'),
    role.replace('"game-studio-example"', '"game-studio-other"'),
    role.replace("'''Read the brief.\nReturn findings.'''", '" "'),
    role.replace("'''Read the brief.\nReturn findings.'''", "'''unclosed"),
    role + 'sandbox_mode = "read-only"\n', role + 'model = "claude-sonnet"\n',
    role + 'developer_instruction = "Typo"\n',
  ]) assert.ok(validateRole(text, 'game-studio-example').issues.length > 0, text);
});

test('migration metadata rejects Claude-specific fields and active runtime syntax', () => {
  for (const field of ['model: haiku', 'allowed-tools: Read', 'context: fork', 'argument-hint: mode']) {
    assert.ok(validateSkill(skill.replace('---\nRead', `${field}\n---\nRead`), 'game-studio-example').issues.length > 0);
  }
  for (const runtime of ['.claude/scripts/run.sh', '${CLAUDE_SKILL_DIR}', '$ARGUMENTS', 'AskUserQuestion']) {
    assert.ok(validateSkill(skill + runtime, 'game-studio-example').issues.some(x => x.code === 'LEGACY_RUNTIME'));
    assert.ok(validateRole(role.replace('Read the brief.', runtime), 'game-studio-example').issues.some(x => x.code === 'LEGACY_RUNTIME'));
  }
  assert.deepEqual(validateSkill(skill + 'Derived from Claude Code Game Studios; preserve upstream attribution.', 'game-studio-example').issues, []);
});
