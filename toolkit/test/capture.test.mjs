import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runProcess } from '../dist/process.js';
import { parseConsole, findBrowser } from '../dist/capture.js';
test('child execution uses argument arrays, preserves output and enforces a timeout', async () => {
  const result = await runProcess(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', '$(not-a-shell-command)']);
  assert.equal(result.stdout, '$(not-a-shell-command)');
  assert.equal(result.exitCode, 0);
  const timeout = await runProcess(process.execPath, ['-e', 'setInterval(()=>{}, 1000)'], { timeoutMs: 40 });
  assert.equal(timeout.exitCode, 124);
});
test('console parsing preserves full replay measurements and reports uncaught errors', () => {
  const text = '[1:INFO:CONSOLE:12] "RUN|done|90|play|log finished|1.5|23", source: file:///a (12)\n[1:INFO:CONSOLE:2] "Uncaught Error: bad", source: file:///a (2)';
  const parsed = parseConsole(text);
  assert.deepEqual(parsed.rows[0], ['done', '90', 'play', 'log finished', '1.5', '23']);
  assert.equal(parsed.uncaught.length, 1);
});
test('an explicitly missing browser does not silently fall back to another executable', async () => {
  await assert.rejects(findBrowser('/missing/browser'), { code: 'DEPENDENCY_MISSING' });
});
