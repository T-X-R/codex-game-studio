import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { parseDocument } from 'yaml';

test('bundled workflow catalog preserves every upstream phase, path, step and artifact requirement', async () => {
  const names = await readdir(new URL('../../.claude/skills/', import.meta.url));
  const skills = new RegExp(`(?<![A-Za-z0-9_.])/(?:${names.sort((a, b) => b.length - a.length).join('|')})(?![A-Za-z0-9_-])`, 'g');
  const source = await readFile(new URL('../../.claude/docs/workflow-catalog.yaml', import.meta.url), 'utf8');
  const expected = source.replaceAll('.claude/docs/technical-preferences.md', 'docs/technical-preferences.md')
    .replace(skills, match => `$game-studio-${match.slice(1)}`);
  const current = await readFile(new URL('../../studio/docs/workflow-catalog.yaml', import.meta.url), 'utf8');
  const parse = text => {
    const document = parseDocument(text, { uniqueKeys: true });
    assert.deepEqual(document.errors, []);
    return document.toJS();
  };
  assert.deepEqual(parse(current), parse(expected));
  assert.doesNotMatch(current, /\.claude\//);
  const bundled = await readFile(new URL('../resources/studio/docs/workflow-catalog.yaml', import.meta.url), 'utf8');
  assert.equal(bundled, current);
  const catalog = parse(current);
  assert.equal(Object.keys(catalog.phases).length, 7);
  assert.equal(Object.keys(catalog.paths).length, 1);
  assert.equal(catalog.paths.minimal.steps.length, 5);
});
