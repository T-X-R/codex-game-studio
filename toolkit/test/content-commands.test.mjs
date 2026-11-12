import assert from 'node:assert/strict';
import { test } from 'node:test';
import { commandIssues } from '../dist/content-commands.js';

test('documented CLI examples use real leaves, options and argument counts', () => {
  for (const example of [
    'game-studio --help', 'game-studio version --json',
    'game-studio init <directory> --engine web --dry-run',
    'node .game-studio/run.cjs config get [KEY] --json',
    'node .game-studio/run.cjs config set platform.targets \'["PC","Web"]\'',
    'game-studio capture prototypes/<name> --log "Enter ArrowRight:1.5 wait:1" --seed=7',
    'game-studio attach --project "a game 测试" --dry-run',
    'game-studio schema config get',
  ]) assert.deepEqual(commandIssues('Run `' + example + '`.'), [], example);
  for (const example of [
    'game-studio vanished --json', 'game-studio config disappeared',
    'game-studio status --dry-run', 'game-studio version extra',
    'game-studio config set key', 'game-studio attach --project',
    'game-studio version --json=true', 'game-studio schema config disappeared',
    'game-studio --project .',
  ]) assert.ok(commandIssues('`' + example + '`').some(x => x.code === 'INVALID_COMMAND_EXAMPLE'), example);
});

test('fenced examples support continuations and quoted shell punctuation without executing commands', () => {
  const valid = '```sh\n$ game-studio attach \\\n  --project "spaces & Unicode 测试" --dry-run # preview only\n```';
  assert.deepEqual(commandIssues(valid), []);
  for (const example of [
    'game-studio version && touch SENTINEL',
    'game-studio status > output.json',
    'game-studio attach --project "$(touch SENTINEL)"',
    'game-studio attach --project "unterminated',
  ]) assert.ok(commandIssues('```sh\n' + example + '\n```').some(x => x.code === 'UNSUPPORTED_COMMAND_EXAMPLE'), example);
});

test('only explicit complete toolkit command examples are checked, with source line diagnostics', () => {
  const text = 'Historical game-studio vanished is prose.\n`node .game-studio/run.cjs` is the launcher.\n' +
    '`npm test` is external.\n``game-studio removed --json``\n```sh\nnode .game-studio/run.cjs status --removed\n```';
  const issues = commandIssues(text);
  assert.equal(issues.length, 2);
  assert.match(issues[0].message, /line 4:/);
  assert.match(issues[1].message, /line 6:/);
});
