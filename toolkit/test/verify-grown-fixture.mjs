// Independent acceptance of the specific resumed-growth fixture. Not a general
// game validator or proof of native Skill discovery / human play acceptance.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, realpath } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';
import { runProcess } from '../dist/process.js';
import { npmPath } from '../dist/runtime.js';
import { findBrowser } from '../dist/capture.js';

if (process.argv.length !== 3) throw new Error('Usage: node verify-grown-fixture.mjs <isolated game workspace>');
const project = await realpath(process.argv[2]);
const before = JSON.parse(await readFile(join(dirname(project), 'before-skill.json'), 'utf8'));
const evidence = join(dirname(project), 'independent-verification');
await mkdir(evidence); // Each verification keeps its own evidence; never replace a prior run.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const browser = await findBrowser();
process.env.GAME_STUDIO_BROWSER = browser;
const npm = await npmPath();
const runs = [];
async function run(entry, args, expected = 0) {
  const result = await runProcess(process.execPath, [entry, ...args], { cwd: project, timeoutMs: 240000 });
  runs.push({ args, expected, ...result });
  await writeFile(join(evidence, 'commands.json'), JSON.stringify(runs, null, 2));
  if (expected === 'nonzero') assert.notEqual(result.exitCode, 0, result.stdout + result.stderr);
  else assert.equal(result.exitCode, expected, result.stdout + result.stderr);
  return result;
}
const json = async path => JSON.parse(await readFile(join(project, path), 'utf8'));
const tsconfig = await json('tsconfig.json');
assert.equal(tsconfig.compilerOptions.strict, true);
assert.notEqual(tsconfig.compilerOptions.allowJs, true);
const sources = (await readdir(join(project, 'src'), { recursive: true })).filter(path => path.endsWith('.ts'));
assert.ok(sources.includes('main.ts'));
for (const path of sources) {
  const content = await readFile(join(project, 'src', path), 'utf8');
  assert.doesNotMatch(content, /@ts-nocheck|@ts-ignore/, path);
}
const data = await json('data/config.json');
assert.equal(data.seed, 1); assert.equal(data.volume.value, 0.5);
const config = parse(await readFile(join(project, 'project.yaml'), 'utf8'));
assert.equal(config.engine.name, 'Web'); assert.equal(config.engine.language, 'TypeScript');
assert.equal(config.engine.version, (await json('package.json')).devDependencies.vite);
for (const [path, expected] of Object.entries(before)) {
  if (path.startsWith('prototypes/')) assert.equal(hash(await readFile(join(project, path))), expected, path);
}
const originalBrief = await readFile(join(project, 'prototypes/demo/brief.md'), 'utf8');
const brief = await readFile(join(project, 'design/game-brief.md'), 'utf8');
const section = (text, heading) => text.split(`## ${heading}\n`)[1]?.split('\n## ')[0].trim();
for (const heading of ['Keep', 'Avoid', 'Out of scope']) assert.equal(section(brief, heading), section(originalBrief, heading));

// Prove the build actually checks the game source instead of merely bundling it.
const main = join(project, 'src/main.ts');
const mainBefore = await readFile(main);
try {
  await writeFile(main, Buffer.concat([mainBefore, Buffer.from('\nconst __growthTypeProbe: number = "intentional type error";\nvoid __growthTypeProbe;\n')]));
  const result = await run(npm, ['run', 'build'], 'nonzero');
  assert.match(result.stdout + result.stderr, /TS2322/);
} finally { await writeFile(main, mainBefore); }
await run(npm, ['run', 'build']);
await run(npm, ['test']);
await run(npm, ['run', 'smoke']);

const output = 'production/evidence/independent-typescript';
const captured = await run(join(project, '.game-studio/run.cjs'), ['capture', 'dist-single', '--project', project,
  '--browser', browser, '--seed', '7', '--log', 'Enter Space wait:1 Space wait:1', '--output', output, '--json']);
const result = JSON.parse(captured.stdout);
assert.equal(result.status, 'ok');
const reference = await json('production/evidence/reference/report.json');
const stateRows = report => report.rows.filter(row => ['scene', 'state'].includes(row[0]));
assert.deepEqual(stateRows(result.data), stateRows(reference));
assert.equal(JSON.parse(result.data.rows.filter(row => row[0] === 'state').at(-1)[3]).score, 4);
const screenshot = await readFile(join(project, output, 'screenshot.png'));
assert.deepEqual(screenshot, await readFile(join(project, 'production/evidence/reference/screenshot.png')));
for (const [path, expected] of Object.entries(before)) {
  if (path.startsWith('prototypes/')) assert.equal(hash(await readFile(join(project, path))), expected, path);
}
const report = { status: 'passed', node: process.version, browser: result.data.rows.find(row => row[0] === 'ua')?.[1],
  screenshotSha256: hash(screenshot), sourceMainSha256: hash(mainBefore),
  checks: ['prototype byte preservation', 'brief constraints preserved', 'strict compilation rejects injected type error',
    'build', 'game unit and browser tests', 'smoke', 'unchanged same-seed states and screenshot', 'expected score four'],
  notAssessed: ['human play', 'native Codex host discovery', 'other games and richer import layouts'] };
await writeFile(join(evidence, 'summary.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, evidence }));
