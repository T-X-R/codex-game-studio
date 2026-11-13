import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const script = fileURLToPath(new URL('./fixtures/codex/write-gate.cjs', import.meta.url));

test('host write-gate fixture records allowed and denied patch inputs without modifying targets', async t => {
  const root = await mkdtemp(join(tmpdir(), 'studio-hook-fixture-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  function run(event) {
    return spawnSync(process.execPath, [script, root], { input: JSON.stringify(event), encoding: 'utf8' });
  }
  const startup = run({ hook_event_name: 'SessionStart', source: 'startup' });
  assert.equal(startup.status, 0, startup.stderr);
  assert.match(JSON.parse(startup.stdout).hookSpecificOutput.additionalContext, /FIXTURE_LOADED/);
  for (const [file, denied] of [['allowed.txt', false], ['blocked.txt', true]]) {
    const result = run({ hook_event_name: 'PreToolUse', tool_name: 'apply_patch',
      tool_input: { command: `*** Begin Patch\n*** Update File: ${file}\n@@\n-original\n+changed\n*** End Patch` } });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput?.permissionDecision, denied ? 'deny' : undefined);
  }
  assert.deepEqual(await readdir(root), ['hook-events.jsonl']);
  const events = (await readFile(join(root, 'hook-events.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(events.length, 3);
  assert.equal(events[2].tool_name, 'apply_patch');
});

test('host fixture rejects unsupported and malformed inputs without inventing an allow decision', async t => {
  const root = await mkdtemp(join(tmpdir(), 'studio-hook-invalid-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const input of ['{', '{}', '{"hook_event_name":"Stop"}', '{"hook_event_name":"PreToolUse","tool_input":{}}']) {
    const result = spawnSync(process.execPath, [script, root], { input, encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Invalid host fixture input/);
  }
  assert.deepEqual(await readdir(root), []);
});
