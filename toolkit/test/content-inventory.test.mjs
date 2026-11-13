import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { inspectInventory } from '../dist/content-inventory.js';

async function fixture(t, ending = '\n') {
  const root = await mkdtemp(join(tmpdir(), 'studio-inventory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, text = '# Source fixture\n') => {
    await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text);
  };
  let inventory = (await readFile(new URL('../../tasks/migration-inventory.md', import.meta.url), 'utf8')).replace(/\r?\n/g, ending);
  const settings = JSON.parse(await readFile(new URL('../../.claude/settings.json', import.meta.url), 'utf8'));
  for (const match of inventory.matchAll(/\]\(\.\.\/(\.claude\/(?:hooks|scripts|rules)\/[^)]+)\)/g)) await write(match[1]);
  const save = async () => { await write('tasks/migration-inventory.md', inventory); await write('.claude/settings.json', JSON.stringify(settings)); };
  await save(); return { root, settings, write, save, edit: f => {
    const changed = f(inventory); assert.ok(changed !== inventory, 'Negative fixture must actually mutate the inventory'); inventory = changed;
  } };
}

for (const [label, ending] of [['LF', '\n'], ['CRLF', '\r\n']]) {
  test(`inventory reconciles all 86 sources and 15 actual registrations without claiming behavior (${label})`, async t => {
    const { root } = await fixture(t, ending);
    const result = await inspectInventory(root);
    assert.equal(result.status, 'valid'); assert.deepEqual(result.issues, []);
    assert.deepEqual(result.counts, { hooks: 18, scripts: 54, rules: 14 });
    assert.equal(result.registeredHooks, 15); assert.equal(result.sourceCoverageComplete, true);
    assert.equal(result.behaviorVerified, false);
  });

  test(`missing and duplicate rows fail even when the total number of rows is unchanged (${label})`, async t => {
    const { root, edit, save } = await fixture(t, ending);
    edit(text => text.replace(/\| \[ai-code.md\][^\r\n]*\r?\n/, text.match(/\| \[data-files.md\][^\r\n]*\r?\n/)[0]));
    await save(); const result = await inspectInventory(root);
    for (const code of ['DUPLICATE_SOURCE', 'UNACCOUNTED_SOURCE']) assert.ok(result.issues.some(x => x.code === code), code);
    assert.equal(result.sourceCoverageComplete, false);
  });

  test(`missing files, undeclared additions and empty dispositions cannot pass (${label})`, async t => {
    const { root, edit, save, write } = await fixture(t, ending);
    await rm(join(root, '.claude/scripts/adr-status.sh'));
    await write('.claude/scripts/unlisted.sh');
    edit(text => text.replace(/(\| \[ai-code.md\][^\r\n]*\|)[^|\r\n]+\|\r?\n/, `$1 |${ending}`));
    await save(); const result = await inspectInventory(root);
    for (const code of ['MISSING_SOURCE', 'UNACCOUNTED_SOURCE', 'INVALID_INVENTORY_ROW']) assert.ok(result.issues.some(x => x.code === code), code);
  });
}

test('hook registration changes, unknown commands and newly registered helpers are visible', async t => {
  const { root, settings, save } = await fixture(t);
  settings.hooks.PreToolUse[0].matcher = 'Read';
  settings.hooks.Stop[0].hooks.push({ type: 'command', command: 'bash .claude/hooks/yaml-helper.sh' });
  settings.hooks.Stop[0].hooks.push({ type: 'command', command: 'bash .claude/hooks/unlisted.sh' });
  await save(); const result = await inspectInventory(root);
  for (const code of ['HOOK_REGISTRATION_MISMATCH', 'UNKNOWN_HOOK', 'HOOK_REGISTRATION_COUNT']) assert.ok(result.issues.some(x => x.code === code), code);
});

test('duplicate or dynamic Hook registration cannot hide behind a valid file count', async t => {
  const { root, settings, save } = await fixture(t);
  const stop = settings.hooks.Stop[0].hooks;
  stop.push({ ...stop[0] }); await save();
  let result = await inspectInventory(root);
  assert.equal(result.registeredHooks, 15);
  assert.ok(result.issues.some(x => x.code === 'HOOK_REGISTRATION_MISMATCH'));
  stop.pop(); stop[0].command = 'bash "$HOOK_FILE"'; await save();
  result = await inspectInventory(root);
  assert.ok(result.issues.some(x => x.code === 'INVALID_HOOK_SETTINGS'));
});

test('missing or malformed source manifests and nonregular trees fail closed', async t => {
  const { root, write } = await fixture(t);
  await write('.claude/settings.json', '{broken');
  assert.ok((await inspectInventory(root)).issues.some(x => x.code === 'INVALID_HOOK_SETTINGS'));
  await rm(join(root, '.claude/rules'), { recursive: true });
  assert.ok((await inspectInventory(root)).issues.some(x => x.code === 'MISSING_SOURCE_TREE'));
  await rm(join(root, '.claude/scripts/adr-status.sh')); await mkdir(join(root, '.claude/scripts/adr-status.sh'));
  assert.ok((await inspectInventory(root)).issues.some(x => x.code === 'INVALID_SOURCE_ENTRY'));
  await rm(join(root, 'tasks/migration-inventory.md'));
  const missing = await inspectInventory(root);
  assert.equal(missing.status, 'invalid'); assert.equal(missing.sourceCoverageComplete, false);
});
