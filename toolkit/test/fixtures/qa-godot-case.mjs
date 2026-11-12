// Maintainer-only live fixture: requires an installed editor and local GdUnit4.
import assert from 'node:assert/strict';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { runProcess } from '../../dist/process.js';

export async function godotScenario() {
  const executable = process.env.GAME_STUDIO_GODOT;
  const addon = process.env.GAME_STUDIO_GDUNIT4;
  if (!executable || !addon) {
    console.error('NOT ASSESSED: set GAME_STUDIO_GODOT and GAME_STUDIO_GDUNIT4 (local addons/gdUnit4 directory).');
    process.exit(3);
  }
  const version = await runProcess(executable, ['--version']);
  assert.equal(version.exitCode, 0);
  assert.match(version.stdout.trim(), /^4\.7\.2\.stable\./);
  assert.match(await readFile(join(addon, 'plugin.cfg'), 'utf8'), /version="6\.2\.2"/);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(executable)) hash.update(chunk);
  const executableSha256 = hash.digest('hex');
  const quote = value => process.platform === 'win32' ? `"${value.replaceAll('"', '""')}"` : `'${value.replaceAll("'", "'\\''")}'`;
  const testCommand = `${quote(executable)} --headless --path . --log-file .godot/qa-run.log -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a res://tests --ignoreHeadlessMode -rd res://production/qa/evidence/gdunit`;
  return {
    engine: 'godot', sandbox: 'workspace-write', timeoutMs: 720000,
    inputs: {
      'project.yaml': stringify({ schema_version: 1, project: { name: 'QA damage fixture' },
        engine: { name: 'Godot', version: '4.7.2', language: 'GDScript', code_root: 'src', test_root: 'tests' },
        modes: { automation: 'guided', rigor: 'standard' }, commands: { test: testCommand } }),
      'project.godot': 'config_version=5\n\n[application]\nconfig/name="QA damage fixture"\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n',
      'src/damage_meter.gd': 'class_name DamageMeter\nextends Node\n\nfunc damage(base: float, armor: float, modifier: float) -> float:\n\treturn maxf(0.0, base * (1.0 + modifier) - armor)\n',
      'docs/damage.md': '# Damage formula\nType: Logic\nDamageMeter is a Node. damage(base, armor, modifier) returns max(0, base * (1 + modifier) - armor).\nSupported input: base and armor 0..10000, modifier -1..3, finite floats. Test ordinary values, zero base, armor flooring, a negative modifier, the maximum supported values and the GDD edge case where armor exactly equals modified damage. Floating results may use a 0.0001 absolute tolerance. No behavior outside this domain is specified.\n',
    },
    request: 'Implement runnable GdUnit4 tests for docs/damage.md and src/damage_meter.gd in tests/combat_damage_test.gd, then execute the configured suite through the installed toolkit and inspect original results. Report evidence at production/qa/godot-audit.md. Preserve all existing source, settings, addon and toolkit files. Allowed new authored files: the named test and report, plus fresh execution evidence under production/qa/evidence/. Godot may update .godot cache and create the test .uid. No fixes to game code, installs, commits, publication or human-play claims. If capability is missing, report it. This is unattended; return unresolved decisions to the caller.',
    expectedFiles: ['tests/combat_damage_test.gd', 'production/qa/godot-audit.md'],
    allowedNewFile: path => ['tests/combat_damage_test.gd', 'tests/combat_damage_test.gd.uid', 'production/qa/godot-audit.md'].includes(path) || path.startsWith('production/qa/evidence/'),
    ignoredFile: path => path.startsWith('.godot/'),
    async prepare(workspace, directory) {
      await cp(addon, join(workspace, 'addons/gdUnit4'), { recursive: true });
      await mkdir(join(workspace, 'tests'), { recursive: true });
      await mkdir(join(workspace, '.godot'), { recursive: true });
      const args = ['--headless', '--path', workspace, '--log-file', join(workspace, '.godot/import.log'), '--editor', '--import'];
      const result = await runProcess(executable, args, { cwd: workspace, timeoutMs: 120000 });
      await writeFile(join(directory, 'engine-preparation.json'), JSON.stringify({ executable, executableSha256,
        version: version.stdout.trim(), addon, addonVersion: '6.2.2', args, ...result }, null, 2));
      assert.equal(result.exitCode, 0, result.stderr);
      assert.doesNotMatch(result.stdout + result.stderr, /(?:SCRIPT ERROR|Parse Error|ERROR):/);
    },
  };
}
