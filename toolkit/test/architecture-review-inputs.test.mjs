import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, copyFile, rm, symlink } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const skill = '.agents/skills/game-studio-architecture-review';
const sourceRoot = resolve(import.meta.dirname, '../..');
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'studio-architecture-inputs-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, bytes) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), bytes); };
  const script = `${skill}/scripts/review-inputs.mjs`;
  for (const path of [script, 'studio/scripts/review-receipts.mjs']) {
    await mkdir(dirname(join(root, path)), { recursive: true }); await copyFile(join(sourceRoot, path), join(root, path));
  }
  for (const path of ['design/gdd/combat.md', 'design/gdd/inventory 数据.md', 'docs/architecture/adr-0001.md',
    'docs/architecture/tr-registry.yaml', 'docs/architecture/architecture.md', 'docs/engine-reference/godot/VERSION.md',
    'docs/engine-reference/godot/current-best-practices.md', 'docs/engine-reference/godot/modules/core.md',
    `${skill}/SKILL.md`, `${skill}/references/used.md`, `${skill}/references/unread.md`]) await write(path, path + '\n');
  await write('project.yaml', "engine:\n  name: Godot\n  version: '4.6'\nmodes:\n  workflow: full\n");
  // Test routing fixture uses the real config reader and real receipt implementation.
  // Archive/pinned-runtime installation remains a separate test:pack/native check.
  await write('.game-studio/run.cjs', `const fs=require('node:fs');
(async()=>{const args=process.argv.slice(2); fs.appendFileSync('.host-calls.jsonl',JSON.stringify(args)+'\\n');
let data;if(args[0]==='config'){const {readSettings}=await import(${JSON.stringify(pathToFileURL(join(sourceRoot, 'toolkit/dist/config.js')).href)});data=await readSettings(process.cwd());}
else if(args.join(' ')==='resource path studio/scripts/review-receipts.mjs --json'){data={path:require('node:path').resolve('studio/scripts/review-receipts.mjs')};}
else throw Error('Unexpected fixture command');console.log(JSON.stringify({status:'ok',data}));})().catch(e=>{console.error(e.message);process.exitCode=2;});\n`);
  const run = (...args) => spawnSync(process.execPath, [join(root, script), ...args], { cwd: root, encoding: 'utf8' });
  return { root, write, run };
}

test('global receipt collection includes non-target documents, all references and real config provenance once', async t => {
  const { root, write, run } = await fixture(t);
  await write('project.local.yaml', 'modes:\n  automation: collaborative\n');
  await write('extra 实际.md', 'extra');
  await write('design/gdd/[input].md', 'literal bracket filename');
  const hidden = ['design/gdd/.hidden.md', 'docs/engine-reference/godot/.hidden.md', `${skill}/references/.hidden.md`];
  for (const path of hidden) await write(path, 'outside glob');
  const result = run('list', 'extra 实际.md', 'design/gdd/combat.md');
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(result.stdout);
  assert.equal(data.qualityAssessed, false); assert.equal(data.engine, 'Godot');
  assert.ok(data.inputs.includes('design/gdd/[input].md')); assert.deepEqual(data.unresolved, []);
  for (const path of hidden) assert.ok(!data.inputs.includes(path), path);
  for (const path of ['design/gdd/inventory 数据.md', 'docs/architecture/tr-registry.yaml', 'docs/architecture/architecture.md',
    'docs/engine-reference/godot/current-best-practices.md', `${skill}/references/unread.md`,
    `${skill}/scripts/review-inputs.mjs`, 'studio/scripts/review-receipts.mjs', 'project.local.yaml', 'extra 实际.md']) assert.ok(data.inputs.includes(path), path);
  assert.deepEqual(data.inputs, [...new Set(data.inputs)].sort());
  assert.ok(data.missing.includes('docs/consistency-failures.md'));
  const calls = (await readFile(join(root, '.host-calls.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(calls.filter(args => args[0] === 'config').length, 1);
  assert.deepEqual(calls[1], ['resource', 'path', 'studio/scripts/review-receipts.mjs', '--json']);
});

test('real shared receipts detect formerly omitted files, additions and historical deletions', async t => {
  const { root, write, run } = await fixture(t);
  const stamped = run('hash'); assert.equal(stamped.status, 0, stamped.stderr);
  await write('review.md', stamped.stdout);
  const unchanged = run('check', 'review.md'); assert.equal(unchanged.status, 0, unchanged.stderr);
  assert.match(unchanged.stdout, /UNCHANGED: docs\/architecture\/tr-registry.yaml/);
  const changed = ['docs/architecture/tr-registry.yaml', 'docs/architecture/architecture.md',
    'design/gdd/inventory 数据.md', 'docs/engine-reference/godot/current-best-practices.md', `${skill}/references/unread.md`];
  for (const path of changed) await write(path, 'changed');
  await write('docs/architecture/adr-0002.md', 'new');
  await rm(join(root, 'docs/architecture/adr-0001.md'));
  const checked = run('check', 'review.md'); assert.equal(checked.status, 0, checked.stderr);
  for (const path of changed) assert.ok(checked.stdout.includes(`CHANGED: ${path}`), path);
  assert.match(checked.stdout, /NEW: docs\/architecture\/adr-0002.md/);
  assert.match(checked.stdout, /GONE: docs\/architecture\/adr-0001.md/);
});

test('unmatched required classes remain UNRESOLVED and nonzero even without prior receipts', async t => {
  const { root, run } = await fixture(t);
  await rm(join(root, 'docs/architecture/adr-0001.md'));
  await rm(join(root, 'design/gdd'), { recursive: true });
  await rm(join(root, 'docs/engine-reference/godot/modules'), { recursive: true });
  const listed = run('list'); assert.equal(listed.status, 2);
  assert.deepEqual(JSON.parse(listed.stdout).unresolved, ['design/gdd/*.md', 'docs/architecture/adr-*.md', 'docs/engine-reference/godot/modules/*.md']);
  const checked = run('check', 'missing-review.md'); assert.equal(checked.status, 2);
  assert.match(checked.stdout, /RECEIPT: NONE/); assert.match(checked.stdout, /UNRESOLVED: design\/gdd\/\*.md/);
  const hashed = run('hash'); assert.equal(hashed.status, 2); assert.match(hashed.stderr, /UNRESOLVED:/);
});

test('unset engine omits guessed directories; changing engine selects its actual classes', async t => {
  const { write, run } = await fixture(t);
  await write('project.yaml', 'modes:\n  workflow: full\n');
  let data = JSON.parse(run('list').stdout);
  assert.equal(data.engine, null); assert.ok(!data.inputs.some(path => path.startsWith('docs/engine-reference/')));
  await write('project.yaml', 'engine:\n  name: Unity\n');
  const unity = run('list'); assert.equal(unity.status, 2); data = JSON.parse(unity.stdout);
  assert.deepEqual(data.unresolved, ['docs/engine-reference/unity/*.md', 'docs/engine-reference/unity/modules/*.md']);
  assert.ok(!data.inputs.some(path => path.includes('/godot/')));
});

test('unsafe extra input or report cannot produce successful freshness evidence', async t => {
  const { run } = await fixture(t);
  assert.equal(run('check', '../outside.md').status, 2);
  assert.equal(run('hash', '../outside.md').status, 2);
});

test('symlink file and directory escapes cannot produce freshness evidence',
  { skip: process.platform === 'win32' ? 'Requires Unix symlink privileges; not assessed on Windows' : false }, async t => {
  const { root, run } = await fixture(t);
  await symlink(tmpdir(), join(root, 'design/gdd/outside.md'));
  assert.equal(run('list').status, 2);
  const checked = run('check', 'missing.md'); assert.equal(checked.status, 2); assert.match(checked.stdout, /ERROR: design\/gdd\/outside.md/);
  await rm(join(root, 'design/gdd'), { recursive: true });
  await symlink(tmpdir(), join(root, 'design/gdd'));
  const unsafe = run('hash'); assert.equal(unsafe.status, 2); assert.match(unsafe.stderr, /Unsafe input directory/);
});

test('failed or invalid pinned configuration/resource cannot fabricate a receipt', async t => {
  const { write, run } = await fixture(t);
  await write('project.yaml', 'engine: [invalid\n');
  let result = run('hash'); assert.equal(result.status, 2); assert.doesNotMatch(result.stdout, /Reviewed-Content-Hash:/);
  await write('.game-studio/run.cjs', 'console.log(JSON.stringify({status:"ok",data:{}}));\n');
  result = run('check', 'missing.md'); assert.equal(result.status, 2); assert.match(result.stderr, /lacks engine.name/);
  await write('.game-studio/run.cjs', 'if(process.argv[2]==="config")console.log(JSON.stringify({status:"ok",data:{settings:{"engine.name":{value:null}}}}));else process.exitCode=9;\n');
  result = run('hash'); assert.equal(result.status, 2); assert.match(result.stderr, /Pinned resource failed/);
});
