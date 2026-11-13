// Creates raw artifacts for independent evaluation of the installed growth Skill.
// No evaluator, expected implementation or answer is injected into the game.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runProcess } from '../dist/process.js';

const setup = await runProcess(process.execPath, [fileURLToPath(new URL('./growth-smoke.mjs', import.meta.url))], { timeoutMs: 600000 });
assert.equal(setup.exitCode, 0, setup.stdout + setup.stderr);
const baseline = JSON.parse(setup.stdout);
const evidence = baseline.evidence;
const project = join(evidence, 'Web game 验证');
const brief = `# Score practice prototype

## Core loop
Press Enter to start. Each Space press earns two points. P pauses; P resumes.

## Features
- [x] Title and play screens
- [x] Two points per Space press
- [x] Pause and resume

## Keep
Keep the controls, score rule, scene names and visible result unchanged.

## Avoid
Avoid new mechanics or visual redesign during growth.

## Out of scope
Networking, new art, mobile input and publication.
`;
await mkdir(join(project, 'design'), { recursive: true });
await writeFile(join(project, 'design/game-brief.md'), brief);
await writeFile(join(project, 'prototypes/demo/brief.md'), brief);
const before = {};
for (const entry of await readdir(join(project, 'prototypes/demo'), { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const absolute = join(entry.parentPath, entry.name);
  const path = absolute.slice(project.length + 1).replaceAll('\\', '/');
  before[path] = createHash('sha256').update(await readFile(absolute)).digest('hex');
}
before['design/game-brief.md'] = createHash('sha256').update(brief).digest('hex');
await writeFile(join(evidence, 'before-skill.json'), JSON.stringify(before, null, 2));
const prompt = 'Use $game-studio-prototype. I have selected growing demo into the main TypeScript Web game. The copy step was completed already. Continue and finish the conversion, configuration extraction and meaningful tests, keeping the game and brief intact. Run the relevant build and browser checks and leave a clear growth record. No new gameplay features or publication. No human play feedback has been provided. Do not commit or create tags.';
await writeFile(join(evidence, 'request.txt'), prompt);
console.log(JSON.stringify({ project, evidence, skill: join(project, '.agents/skills/game-studio-prototype/SKILL.md'), request: join(evidence, 'request.txt') }));
