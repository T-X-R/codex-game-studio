// Explicit installed-engine acceptance; not part of the offline unit suite.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess } from '../dist/process.js';
import { npmPath } from '../dist/runtime.js';

const executable = process.env.GAME_STUDIO_GODOT;
const pinned = process.env.GAME_STUDIO_GODOT_VERSION;
if (!executable || !pinned) {
  console.error('NOT ASSESSED: set GAME_STUDIO_GODOT to an installed editor executable and GAME_STUDIO_GODOT_VERSION to its explicit version.');
  process.exit(3);
}
const directory = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-godot-live-')));
const project = join(directory, 'Godot game 验证');
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const launcher = join(project, '.game-studio/run.cjs');
const invocations = [];
async function command(entry, args, expected = 0) {
  const result = await runProcess(process.execPath, [entry, ...args, '--json'], { cwd: directory, timeoutMs: 240000 });
  invocations.push({ args, expected, exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr });
  await writeFile(join(directory, 'cli-results.json'), JSON.stringify(invocations, null, 2), { mode: 0o600 });
  assert.equal(result.exitCode, expected, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}
try {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(executable)) hash.update(chunk);
  const executableSha256 = hash.digest('hex');
  const packed = await runProcess(process.execPath, [await npmPath(), 'pack', packageRoot, '--pack-destination', directory, '--ignore-scripts', '--json'], { cwd: directory });
  assert.equal(packed.exitCode, 0, packed.stderr);
  const archive = join(directory, JSON.parse(packed.stdout)[0].filename);
  await command(cli, ['init', project, '--engine', 'godot']);
  await command(cli, ['restore', '--project', project, '--archive', archive, '--offline']);
  const input = { engine: { name: 'Godot', version: pinned, language: 'GDScript', rendering: 'Compatibility',
    physics: 'Godot Physics 2D', code_root: 'src', test_root: 'tests' } };
  await writeFile(join(project, 'engine.json'), JSON.stringify(input));
  await command(launcher, ['engine', 'setup', '--input', 'engine.json', '--project', project]);
  await command(launcher, ['config', 'set', 'project.name', '验证 "Godot" \\ fixture', '--project', project]);
  await command(launcher, ['engine', 'scaffold', '--dry-run', '--project', project]);
  await assert.rejects(readFile(join(project, 'project.godot')), { code: 'ENOENT' });
  await command(launcher, ['engine', 'scaffold', '--project', project]);
  const projectBefore = await readFile(join(project, 'project.godot'), 'utf8');
  const verifyArgs = ['engine', 'verify', '--executable', executable, '--project', project];
  const imported = await command(launcher, [...verifyArgs, '--output', 'production/evidence/import']);
  assert.equal(imported.status, 'ok');
  assert.equal(imported.data.actualVersion.startsWith(pinned + '.'), true);
  assert.equal(await readFile(join(project, 'project.godot'), 'utf8'), projectBefore);
  await mkdir(join(project, 'tests'));
  await writeFile(join(project, 'tests/smoke.gd'), 'extends SceneTree\n\nfunc _init():\n\tvar position := Vector2(10, 20)\n\tposition += Vector2(5, -2)\n\tif position != Vector2(15, 18):\n\t\tquit(7)\n\t\treturn\n\tprint("STUDIO_GODOT_SMOKE_OK")\n\tquit(0)\n');
  const quote = value => process.platform === 'win32' ? `"${value.replaceAll('"', '""')}"` : `'${value.replaceAll("'", "'\\''")}'`;
  const smokeCommand = `${quote(executable)} --headless --path ${quote(project)} --script tests/smoke.gd`;
  await command(launcher, ['config', 'set', 'commands.smoke', smokeCommand, '--project', project]);
  const smoke = await command(launcher, ['test', '--kind', 'smoke', '--output', 'production/evidence/smoke', '--project', project]);
  assert.equal(smoke.data.processExitCode, 0);
  assert.match(await readFile(join(project, 'production/evidence/smoke/stdout.log'), 'utf8'), /STUDIO_GODOT_SMOKE_OK/);
  await writeFile(join(project, 'tests/failing.gd'), 'extends SceneTree\n\nfunc _init():\n\tquit(7)\n');
  await command(launcher, ['config', 'set', 'commands.test', `${quote(executable)} --headless --path ${quote(project)} --script tests/failing.gd`, '--project', project]);
  const failed = await command(launcher, ['test', '--output', 'production/evidence/failed-test', '--project', project], 5);
  assert.equal(failed.data.processExitCode, 7);
  await command(launcher, ['config', 'set', 'engine.version', '4.0.0', '--project', project]);
  const mismatch = await command(launcher, [...verifyArgs, '--output', 'production/evidence/mismatch'], 3);
  assert.equal(mismatch.data.checks.length, 1);
  await command(launcher, ['engine', 'setup', '--input', 'engine.json', '--project', project]);
  await mkdir(join(project, 'assets'));
  await writeFile(join(project, 'assets/broken.png'), 'This intentionally is not a PNG.');
  const broken = await command(launcher, [...verifyArgs, '--output', 'production/evidence/broken-import'], 5);
  assert.ok(broken.data.checks.some(check => check.phase.startsWith('import-') && check.errorDetected));
  const existing = await command(launcher, ['engine', 'scaffold', '--project', project]);
  assert.equal(existing.data.outcome.state, 'already_present');
  assert.equal(await readFile(join(project, 'project.godot'), 'utf8'), projectBefore);
  const summary = { status: 'passed_for_stated_scope', directory, project, node: process.version, platform: `${process.platform}/${process.arch}`,
    pinned, actualVersion: imported.data.actualVersion, executableSha256,
    checks: ['packed runtime restoration', 'configuration and mirror', 'scaffold preview and preservation', 'real editor import',
      'real GDScript smoke', 'real nonzero test exit', 'version mismatch without import', 'corrupt asset import rejection'],
    importAttempts: imported.data.checks.filter(check => check.phase.startsWith('import-')),
    brokenImportAttempts: broken.data.checks.filter(check => check.phase.startsWith('import-')),
    excluded: ['export/build', 'C#/.NET', 'Forward+/Mobile GPU rendering', 'gameplay or human play acceptance', 'other operating systems'] };
  await writeFile(join(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary));
} catch (error) {
  console.error(`Live Godot acceptance failed; retained evidence: ${directory}`);
  throw error;
}
