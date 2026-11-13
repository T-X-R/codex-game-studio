import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
const { showCheckpoint, planCheckpointSave } = await import('../dist/checkpoint.js');
const { applyInstall, recoverInstall } = await import('../dist/install.js');
const path = 'production/session-state/active.md';
const body = '**Branch:** `old-branch`\n**Current task:** Implement jump buffering\n**Next step:** Test landing\n**Blocked on:** nothing\n';
async function fixture(t, content) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio checkpoint 测试 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), '{}\n');
  if (content !== undefined) {
    await mkdir(join(root, 'production/session-state'), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

test('missing checkpoint is reported without inventing state or creating files', async t => {
  const root = await fixture(t);
  const result = await showCheckpoint(root);
  assert.equal(result.state, 'absent');
  assert.equal(result.sha256, 'missing');
  assert.equal(result.preview, '');
  assert.equal(result.git.state, 'not_assessed');
  assert.deepEqual(await readdir(root), ['project.yaml']);
});

test('save creates a checkpoint and one immutable event; unchanged content is a no-op', async t => {
  const root = await fixture(t);
  const { plan } = await planCheckpointSave(root, body, 'missing', 'turn-1');
  assert.deepEqual(await readdir(root), ['project.yaml']);
  await applyInstall(plan);
  const shown = await showCheckpoint(root);
  assert.equal(shown.state, 'recorded');
  assert.equal(shown.fields['Current task'], 'Implement jump buffering');
  assert.match(shown.preview, /Test landing/);
  const repeated = await planCheckpointSave(root, body, 'missing', 'turn-1');
  assert.equal(repeated.duplicate, true);
  assert.deepEqual(repeated.plan.changes, []);
  assert.deepEqual((await planCheckpointSave(root, body, shown.sha256)).plan.changes, []);
  assert.equal((await readdir(join(root, 'production/session-logs/events'))).length, 1);
});

test('updating a legacy checkpoint preserves status, narrative, quotes and CRLF', async t => {
  const prefix = '# Game\r\n<!-- STATUS -->\r\nEpic: Movement\r\n<!-- /STATUS -->\r\n\r\n<!-- CHECKPOINT -->\r\n';
  const suffix = '<!-- /CHECKPOINT -->\r\n\r\n## Notes\r\nKeep my history.\r\n';
  const root = await fixture(t, prefix + 'Old task\r\n' + suffix);
  const initial = await showCheckpoint(root);
  await applyInstall((await planCheckpointSave(root, body, initial.sha256)).plan);
  assert.equal(await readFile(join(root, path), 'utf8'), prefix + body.replaceAll('\n', '\r\n') + suffix);
});

test('markerless legacy records retain their entire narrative during migration', async t => {
  const legacy = '# Old notes\nThe player rejected the original controls.\n';
  const root = await fixture(t, legacy);
  const shown = await showCheckpoint(root);
  assert.equal(shown.state, 'legacy');
  await applyInstall((await planCheckpointSave(root, body, shown.sha256)).plan);
  assert.ok((await readFile(join(root, path), 'utf8')).endsWith(legacy));
});

test('malformed markers, empty input, missing hash and reused event IDs cannot overwrite state', async t => {
  for (const content of ['<!-- CHECKPOINT -->\nmissing close\n', '<!-- /CHECKPOINT -->\n<!-- CHECKPOINT -->\n',
    '<!-- CHECKPOINT -->\na\n<!-- /CHECKPOINT -->\n<!-- CHECKPOINT -->\nb\n<!-- /CHECKPOINT -->\n']) {
    const root = await fixture(t, content);
    await assert.rejects(showCheckpoint(root), { code: 'INVALID_CHECKPOINT' });
    await assert.rejects(planCheckpointSave(root, body, 'missing'));
    assert.equal(await readFile(join(root, path), 'utf8'), content);
  }
  const root = await fixture(t);
  for (const input of ['', '   ', '<!-- CHECKPOINT -->\nunclosed', '<!-- STATUS -->\nwrong']) {
    await assert.rejects(planCheckpointSave(root, input, 'missing'), { code: 'INVALID_ARGUMENT' });
  }
  await assert.rejects(planCheckpointSave(root, body), { code: 'INVALID_ARGUMENT' });
  await applyInstall((await planCheckpointSave(root, body, 'missing', 'once')).plan);
  await assert.rejects(planCheckpointSave(root, 'different', 'missing', 'once'), { code: 'FILE_CONFLICT' });
});

test('competing saves reject stale state and retries never rewind a newer checkpoint', async t => {
  const root = await fixture(t);
  const first = await planCheckpointSave(root, body, 'missing', 'first');
  const competing = await planCheckpointSave(root, 'Other task', 'missing', 'other');
  await applyInstall(first.plan);
  await assert.rejects(applyInstall(competing.plan), { code: 'FILE_CONFLICT' });
  const current = await showCheckpoint(root);
  await applyInstall((await planCheckpointSave(root, '**Current task:** New task\n**Next step:** Ship\n', current.sha256, 'second')).plan);
  const retry = await planCheckpointSave(root, body, 'missing', 'first');
  assert.equal(retry.duplicate, true);
  await applyInstall(retry.plan);
  assert.equal((await showCheckpoint(root)).fields['Current task'], 'New task');
  assert.equal((await readdir(join(root, 'production/session-logs/events'))).length, 2);
});

test('an interrupted two-file save rolls back from its journal and can be retried', async t => {
  const root = await fixture(t);
  const { plan } = await planCheckpointSave(root, body, 'missing', 'interrupt');
  await mkdir(join(root, '.game-studio'));
  await writeFile(join(root, '.game-studio/transaction.json'), JSON.stringify(plan));
  await mkdir(join(root, 'production/session-state'), { recursive: true });
  await writeFile(join(root, path), plan.changes[0].after);
  await recoverInstall(root);
  assert.equal((await showCheckpoint(root)).state, 'absent');
  await applyInstall((await planCheckpointSave(root, body, 'missing', 'interrupt')).plan);
  assert.equal((await showCheckpoint(root)).state, 'recorded');
});

test('recovery preview is bounded and compares recorded branch with actual Git state', async t => {
  const root = await fixture(t);
  execFileSync('git', ['init', '-b', 'current'], { cwd: root, stdio: 'ignore' });
  const long = body + Array.from({ length: 60 }, (_, i) => `Decision ${i}: ${'x'.repeat(80)}`).join('\n');
  const planned = await planCheckpointSave(root, long, 'missing');
  assert.ok(planned.warnings.some(w => /25|3000/.test(w)));
  await applyInstall(planned.plan);
  const shown = await showCheckpoint(root);
  assert.equal(shown.truncated, true);
  assert.ok(shown.preview.split('\n').length <= 25);
  assert.ok(shown.preview.length <= 3000);
  assert.equal(shown.git.branch, 'current');
  assert.equal(shown.git.dirty, true);
  assert.equal(shown.git.head, null);
  assert.ok(shown.warnings.some(w => /old-branch/.test(w) && /current/.test(w)));
  assert.ok(shown.warnings.some(w => /process/i.test(w)));
});

test('CLI requires the expected hash, previews without writes and resumes through another process', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'draft.md'), body);
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [cli, 'checkpoint', ...args, '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(run('save', '--input', 'draft.md').status, 2);
  const dry = run('save', '--input', 'draft.md', '--expect-hash', 'missing', '--dry-run');
  assert.equal(dry.status, 0, dry.stdout);
  assert.equal(JSON.parse(dry.stdout).data.changes.length, 2);
  assert.deepEqual((await readdir(root)).sort(), ['draft.md', 'project.yaml']);
  const saved = run('save', '--input', 'draft.md', '--expect-hash', 'missing');
  assert.equal(saved.status, 0, saved.stdout);
  const resumed = run('show');
  assert.equal(resumed.status, 0, resumed.stdout);
  assert.equal(JSON.parse(resumed.stdout).data.fields['Next step'], 'Test landing');
});
