// Prepare raw workspaces and requests, without invoking or coaching an evaluator.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, readdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { npmPath } from '../dist/runtime.js';

const root = await realpath(await mkdtemp(join(tmpdir(), 'game-studio-settings-skill-')));
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
const base = '# Retain this game record\nschema_version: 1\nproject:\n  name: Settings trial\nengine:\n  name: Web\nmodes:\n  rigor: full\n  automation: guided\n  review_mode: lean\ndocs:\n  density: thorough\naccessibility:\n  target: none\n';
const local = '# Personal preferences\nmodes:\n  review_mode: solo\n';
const requests = {
  inspect: 'Show all effective project settings, including their sources and any overrides. Explain my QA level and what you would recommend for a weekend game jam. Do not change any files.',
  shared: 'Set the shared rigor to standard and shared review mode to full. Leave my explicit documentation and personal preferences alone. These two changes are approved; apply them and tell me the resulting settings.',
  personal: 'settings --local modes.automation=autonomous. Apply this personal preference and tell me what changed.',
  refused: 'Handle these as five independent project-settings requests, reporting each result: --local engine.name=Unity; qa.levl=full; modes.review_mode=chaotic; =full; --local modes.automation=. Do not substitute other changes for these requests.',
  reserved: 'Store accessibility.target=standard in shared configuration and features.token_budget_warn_at=0.7 in my personal configuration. Both writes are approved. Then show those two settings individually and show all effective settings, explaining what these changes do.',
};
const cases = {};
for (const [name, request] of Object.entries(requests)) {
  const project = join(root, `${name} game 测试`);
  run(cli, ['init', project, '--engine', 'web', '--json']);
  run(cli, ['restore', '--project', project, '--archive', archive, '--offline', '--json']);
  await writeFile(join(project, 'project.yaml'), base);
  await writeFile(join(project, 'project.local.yaml'), local + (name === 'inspect' ? 'engine:\n  name: Unity\n' : ''));
  await mkdir(join(project, 'src/nested'), { recursive: true });
  const before = {};
  for (const entry of await readdir(project, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    const relative = path.slice(project.length + 1).replaceAll('\\', '/');
    before[relative] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  cases[name] = { project, cwd: join(project, 'src/nested'), request, before,
    skill: join(project, '.agents/skills/game-studio-project-settings/SKILL.md') };
}
await writeFile(join(root, 'cases.json'), JSON.stringify(cases, null, 2));
console.log(JSON.stringify({ evidence: root, cases: join(root, 'cases.json'), archive }));
