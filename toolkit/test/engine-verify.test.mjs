import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
const { verifyEngine } = await import('../dist/engine-verify.js');

async function fixture(t, behavior = '', { version = '4.6.1', engine = 'Godot', language = 'GDScript' } = {}) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'studio verify 引擎 ')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'project.yaml'), `engine:\n  name: ${engine}\n  version: "${version}"\n  language: ${language}\n`);
  await writeFile(join(root, 'project.godot'), 'config_version=5\n');
  // This executable stands in for an editor only to exercise the subprocess
  // contract; the separate live Godot probe supplies actual engine evidence.
  const script = join(root, 'fake editor.cjs');
  await writeFile(script, `const fs = require('node:fs');\nconst args = process.argv.slice(2);\nfs.appendFileSync('calls.jsonl', JSON.stringify(args)+'\\n');\n${behavior || `if (args[0] === '--version') console.log('${version}.stable.official.fixture');\nelse if (args[0] === '--help') console.log('--import Starts editor import');\nelse console.log('Import complete');`}\n`);
  return { root, options: { executable: process.execPath, executableArgs: [script] } };
}
async function report(root, output = 'evidence') { return JSON.parse(await readFile(join(root, output, 'report.json'), 'utf8')); }

test('verification checks the pinned version and editor capability before importing and keeps evidence', async t => {
  const { root, options } = await fixture(t);
  const result = await verifyEngine(root, 'evidence', options);
  assert.equal(result.status, 'ok'); assert.equal(result.exitCode, 0);
  assert.equal(result.actualVersion, '4.6.1.stable.official.fixture');
  const calls = (await readFile(join(root, 'calls.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.deepEqual(calls, [['--version'], ['--help'], ['--headless', '--path', root, '--import']]);
  assert.match(await readFile(join(root, 'evidence/import-1.stdout.log'), 'utf8'), /Import complete/);
  assert.equal((await report(root)).judgment, 'Editor import only; builds, test coverage, main-scene execution and human play acceptance are not assessed.');
});

test('dry run and unavailable engines do not execute arbitrary commands or invent successful imports', async t => {
  const { root, options } = await fixture(t);
  const before = await readdir(root);
  assert.equal((await verifyEngine(root, 'evidence', { ...options, dryRun: true })).status, 'planned');
  assert.deepEqual(await readdir(root), before);
  const missing = await verifyEngine(root, 'missing', { executable: join(root, 'no-such-editor') });
  assert.equal(missing.status, 'not_assessed'); assert.equal(missing.exitCode, 3);
  assert.match((await report(root, 'missing')).reason, /Cannot launch/);
  for (const engine of ['Unity', 'Unreal', 'Web']) {
    const fixture2 = await fixture(t, '', { engine });
    const result = await verifyEngine(fixture2.root, 'evidence', fixture2.options);
    assert.equal(result.status, 'not_assessed'); assert.equal(result.checks.length, 0);
    await assert.rejects(readFile(join(fixture2.root, 'calls.jsonl')), { code: 'ENOENT' });
  }
});

test('version mismatch, a non-editor build and the wrong C# edition cannot pass import verification', async t => {
  for (const [behavior, language, expectedCalls] of [
    ['console.log("4.6.2.stable.official.fixture");', 'GDScript', 1],
    ['console.log(args[0] === "--version" ? "4.6.1.stable.official.fixture" : "Export runtime help");', 'GDScript', 2],
    ['console.log("4.6.1.stable.official.fixture");', 'C#', 1],
  ]) {
    const { root, options } = await fixture(t, behavior, { language });
    const result = await verifyEngine(root, 'evidence', options);
    assert.equal(result.status, 'not_assessed'); assert.equal(result.exitCode, 3);
    assert.equal((await readFile(join(root, 'calls.jsonl'), 'utf8')).trim().split('\n').length, expectedCalls);
  }
});

test('zero exit with Godot errors is a failure, not a passing smoke check', async t => {
  for (const message of ['ERROR: Resource failed to load', 'SCRIPT ERROR: Parse Error: unexpected token', '\x1b[31mERROR:\x1b[0m import failed']) {
    const { root, options } = await fixture(t, `if (args[0] === '--version') console.log('4.6.1.stable.official.fixture');
else if (args[0] === '--help') console.log('--import Starts editor import');
else console.error(${JSON.stringify(message)});`);
    const result = await verifyEngine(root, 'evidence', options);
    assert.equal(result.status, 'failed'); assert.equal(result.exitCode, 5);
    assert.equal(result.checks.at(-1).processExitCode, 0);
    assert.match(result.reason, /error/i);
  }
});

test('the known Godot 4.7 import crash gets one recorded retry; ordinary errors do not', async t => {
  const { root, options } = await fixture(t, `if (args[0] === '--version') console.log('4.7.stable.official.fixture');
else if (args[0] === '--help') console.log('--import Starts editor import');
else if (!fs.existsSync('attempt')) { fs.writeFileSync('attempt','1'); process.exit(139); }
else console.log('Second import completed');`, { version: '4.7' });
  const result = await verifyEngine(root, 'evidence', options);
  assert.equal(result.status, 'ok'); assert.equal(result.checks.length, 4);
  assert.equal(result.checks[2].processExitCode, 139);
  assert.equal(result.checks[3].processExitCode, 0);
  assert.ok(result.warnings.some(w => w.includes('139')));
  assert.match(await readFile(join(root, 'evidence/import-2.stdout.log'), 'utf8'), /Second import/);
});

test('import timeout is preserved and evidence destinations cannot overwrite user files', async t => {
  const { root, options } = await fixture(t, `if (args[0] === '--version') console.log('4.6.1.stable.official.fixture');
else if (args[0] === '--help') console.log('--import Starts editor import');
else setInterval(() => {}, 1000);`);
  const result = await verifyEngine(root, 'evidence', { ...options, timeoutMs: 200 });
  assert.equal(result.exitCode, 124); assert.equal(result.status, 'failed');
  await assert.rejects(verifyEngine(root, 'evidence', options), { code: 'FILE_CONFLICT' });
  await assert.rejects(verifyEngine(root, '../outside', options), { code: 'UNSAFE_PATH' });
  await mkdir(join(root, 'occupied'));
  await assert.rejects(verifyEngine(root, 'occupied', options), { code: 'FILE_CONFLICT' });
});

test('missing project files and invalid pins are reported without launching the editor', async t => {
  const { root, options } = await fixture(t);
  await rm(join(root, 'project.godot'));
  assert.equal((await verifyEngine(root, 'missing-project', options)).status, 'not_assessed');
  await assert.rejects(readFile(join(root, 'calls.jsonl')), { code: 'ENOENT' });
  await writeFile(join(root, 'project.yaml'), 'engine:\n  name: Godot\n  version: latest\n');
  await assert.rejects(verifyEngine(root, 'invalid', options), { code: 'INVALID_CONFIG' });
});
