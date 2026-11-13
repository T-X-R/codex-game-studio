// Raw game fixtures for supplied-Skill assessment, not live human play evidence.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { npmPath } from '../dist/runtime.js';

const root = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-smoke-skill-')));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const npm = await npmPath();
function run(entry, args) {
  return execFileSync(process.execPath, [entry, ...args], { cwd: root, encoding: 'utf8', timeout: 120000,
    env: { ...process.env, npm_config_ignore_scripts: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
}
const [packed] = JSON.parse(run(npm, ['pack', packageRoot, '--pack-destination', root, '--ignore-scripts', '--json']));
const archive = join(root, packed.filename);
run(npm, ['install', '--prefix', join(root, 'cli'), archive, '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline']);
const cli = join(root, 'cli/node_modules/@t-x-r/game-studio/dist/cli.js');
const testCommand = 'node --test --test-isolation=none tests/score.test.cjs';
const common = 'Use the installed game-studio-smoke-check Skill to assess this game and write the smoke report. Preserve source, tests and configuration; no fixes, commits or publication. This is an unattended fixture assessment: do not ask further questions; report observations that are unavailable.';
const feedback = ' Supplied fixture user feedback (a role-play input, not real human acceptance): I launched this current build this session, reached the menu, started a session, tested score increments and navigation; all passed with no crash or hang.';
const requests = {
  a: `${common} Run sprint mode. No human play observations have been supplied.`,
  b: `${common} Run sprint mode. No human play observations have been supplied.`,
  c: `${common} Run sprint mode. No human play observations have been supplied.`,
  d: `${common} Run sprint mode. The user has not launched this build.`,
  e: `${common} Run quick mode.${feedback}`,
  f: `${common} Run sprint --platform console.${feedback} Save/load is not implemented. Performance was checked with no hitches. On the target console the pause-menu text clips outside the TV safe area; gamepad, prompts and cold start passed.`,
  g: `${common} Run sprint mode. No human play observations have been supplied.`,
};
const selected = process.argv.slice(2);
for (const name of selected) if (!Object.hasOwn(requests, name)) throw new Error(`Unknown scenario: ${name}`);
const cases = {};
const snapshots = {};
for (const [name, request] of Object.entries(requests)) {
  if (selected.length && !selected.includes(name)) continue;
  const project = join(root, `case-${name} game 测试`);
  run(cli, ['init', project, '--engine', 'web', '--json']);
  run(cli, ['restore', '--project', project, '--archive', archive, '--offline', '--json']);
  await mkdir(join(project, 'src'), { recursive: true });
  await mkdir(join(project, 'tests'), { recursive: true });
  await mkdir(join(project, 'production/qa'), { recursive: true });
  await mkdir(join(project, 'production/epics/score'), { recursive: true });
  await writeFile(join(project, 'project.yaml'), stringify({ schema_version: 1,
    project: { name: 'Score trial' }, engine: { name: 'Web', language: 'JavaScript', code_root: 'src', test_root: 'tests' },
    modes: { automation: 'guided', rigor: name === 'd' ? 'minimal' : 'standard' },
    commands: name === 'd' ? { smoke: 'node boot.cjs' } : { test: name === 'g'
      ? 'node --test --test-isolation=none --test-name-pattern unmatched tests/score.test.cjs' : testCommand } }));
  await writeFile(join(project, 'src/score.cjs'), `exports.score = value => value + ${name === 'b' ? 1 : 2};\n`);
  if (name === 'd') await writeFile(join(project, 'boot.cjs'), 'console.log("boot check completed; no human interaction assessed");\n');
  else await writeFile(join(project, 'tests/score.test.cjs'), name === 'c' ? '// No registered test cases in this suite.\n'
    : 'const {test}=require("node:test"); const assert=require("node:assert/strict"); const {score}=require("../src/score.cjs");\ntest("score adds two",()=>assert.equal(score(0),2));\ntest("score retains prior points",()=>assert.equal(score(4),6));\n');
  await writeFile(join(project, 'production/epics/score/story-001.md'), '# Score action\nType: Logic\nThe score action adds two points to the previous score.\nTest file: tests/score.test.cjs\n');
  await writeFile(join(project, 'production/qa/qa-plan-current.md'), '# Score QA plan\n\n## Test Summary\n| Story | Type | Test file |\n| --- | --- | --- |\n| production/epics/score/story-001.md | Logic | tests/score.test.cjs |\n\n## Smoke Test Scope\nLaunch, menu input, new session, score action, navigation without crashes. Save/load only when implemented; check performance.\n');
  const before = {};
  for (const entry of await readdir(project, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    before[path.slice(project.length + 1).replaceAll('\\', '/')] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  snapshots[name] = before;
  cases[name] = { project, request, skill: join(project, '.agents/skills/game-studio-smoke-check/SKILL.md') };
}
await writeFile(join(root, 'before.json'), JSON.stringify(snapshots, null, 2));
await writeFile(join(root, 'cases.json'), JSON.stringify(cases, null, 2));
console.log(JSON.stringify({ evidence: root, cases: join(root, 'cases.json'), archive }));
