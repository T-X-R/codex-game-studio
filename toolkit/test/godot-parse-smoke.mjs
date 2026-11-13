import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { runProcess } from '../dist/process.js';

const { values } = parseArgs({ options: {
  executable: { type: 'string' }, output: { type: 'string' }, runtime: { type: 'string' },
}, allowPositionals: false });
assert.ok(values.executable && values.output, 'Supply --executable PATH --output NEW_DIRECTORY');
const output = resolve(values.output);
await mkdir(output); // Refuse overwriting earlier evidence.
const root = await mkdtemp(join(output, 'game with spaces '));
const runtime = values.runtime ? resolve(values.runtime) : fileURLToPath(new URL('..', import.meta.url));
const helper = join(runtime, 'resources/studio/scripts/godot-parse-check.gd');
const original = fileURLToPath(new URL('../../.claude/scripts/godot-parse-check.gd', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const files = {
  'project.godot': 'config_version=5\n[application]\nconfig/name="Script load fixture"\n[autoload]\nGlobalState="*res://state.gd"\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n',
  'state.gd': 'extends Node\nvar health: int = 5\n',
  'value.gd': 'class_name FixtureValue\nextends RefCounted\nvar score: int = 1\n',
  'valid.gd': 'extends Node\nfunc observe() -> bool:\n\tvar item := FixtureValue.new()\n\treturn GlobalState.health > item.score\n',
};
for (const [path, content] of Object.entries(files)) await writeFile(join(root, path), content);
const records = [];
async function run(name, args) {
  const result = await runProcess(values.executable, args, { cwd: root, timeoutMs: 30000 });
  records.push({ name, executable: values.executable, args, ...result });
  await writeFile(join(output, 'processes.json'), JSON.stringify(records, null, 2) + '\n');
  return result;
}
try {
  const version = await run('version', ['--version']);
  assert.equal(version.exitCode, 0, version.stderr);
  const imported = await run('import', ['--headless', '--path', root, '--log-file', join(output, 'import.log'), '--import']);
  assert.equal(imported.exitCode, 0, imported.stderr);
  assert.doesNotMatch(imported.stdout + imported.stderr, /SCRIPT ERROR|Parse Error/);
  files['broken.gd'] = 'extends Node\nfunc broken( -> void:\n\tpass\n';
  await writeFile(join(root, 'broken.gd'), files['broken.gd']);
  const before = Object.fromEntries(await Promise.all(Object.keys(files).map(async name => [name, sha(await readFile(join(root, name)))])));
  const cases = [
    { name: 'valid-autoload-and-class', paths: ['res://valid.gd'], code: 0, ok: ['res://valid.gd'], failed: [] },
    { name: 'syntax-error', paths: ['res://broken.gd'], code: 1, ok: [], failed: ['res://broken.gd'] },
    { name: 'missing-script', paths: ['res://missing.gd'], code: 1, ok: [], failed: ['res://missing.gd'] },
    { name: 'mixed-continues-after-error', paths: ['res://broken.gd', 'res://valid.gd'], code: 1, ok: ['res://valid.gd'], failed: ['res://broken.gd'] },
    { name: 'no-arguments', paths: [], code: 2, ok: [], failed: [] },
  ];
  for (const [label, script] of [['source', original], ['installed', helper]]) {
    for (const item of cases) {
      const name = `${label}-${item.name}`;
      const result = await run(name, ['--headless', '--path', root, '--log-file', join(output, `${name}.log`), '-s', script, '--', ...item.paths]);
      assert.equal(result.exitCode, item.code, `${name}: ${result.stdout}\n${result.stderr}`);
      for (const path of item.ok) assert.ok(result.stdout.split(/\r?\n/).includes(`ok: ${path}`), name);
      for (const path of item.failed) assert.ok(result.stderr.includes(`PARSE FAIL: ${path}`), name);
    }
  }
  for (const [name, hash] of Object.entries(before)) assert.equal(sha(await readFile(join(root, name))), hash, name);
  const report = { status: 'PASS_SCOPED', version: version.stdout.trim(), runtime, helperSha256: sha(await readFile(helper)),
    sourceSha256: sha(await readFile(original)), casesPerImplementation: cases.length, sourcePreserved: before,
    gameQualityAssessed: false, csharpAssessed: false, records };
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, version: report.version, cases: cases.length * 2, output }));
} catch (error) {
  await writeFile(join(output, 'failure.txt'), error.stack + '\n');
  throw error;
}
