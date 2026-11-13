// Result verification for prepare-settings-skill.mjs; not a generic Skill evaluator.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';

const root = process.argv[2];
assert.ok(root, 'Pass the evidence directory from prepare-settings-skill.mjs');
const cases = JSON.parse(await readFile(join(root, 'cases.json'), 'utf8'));
const selected = process.argv.slice(3);
for (const name of selected) assert.ok(Object.hasOwn(cases, name), `Unknown requested scenario ${name}`);
const allowed = { inspect: [], refused: [], shared: ['project.yaml'], personal: ['project.local.yaml'],
  reserved: ['project.yaml', 'project.local.yaml'] };
const results = {};
for (const [name, scenario] of Object.entries(cases)) {
  if (selected.length && !selected.includes(name)) continue;
  assert.ok(Object.hasOwn(allowed, name), `Unknown scenario ${name}`);
  const after = {};
  for (const entry of await readdir(scenario.project, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    after[path.slice(scenario.project.length + 1).replaceAll('\\', '/')] =
      createHash('sha256').update(await readFile(path)).digest('hex');
  }
  const changed = Object.keys(scenario.before).filter(path => after[path] !== scenario.before[path]);
  assert.deepEqual(changed.sort(), [...allowed[name]].sort(), `${name}: unexpected original file changes`);
  const added = Object.keys(after).filter(path => !Object.hasOwn(scenario.before, path));
  for (const path of added) {
    assert.ok(allowed[name].length && path.startsWith('.game-studio/backups/'),
      `${name}: unexpected new file ${path}`);
  }
  const project = parse(await readFile(join(scenario.project, 'project.yaml'), 'utf8'));
  const personal = parse(await readFile(join(scenario.project, 'project.local.yaml'), 'utf8'));
  const expectedProject = { schema_version: 1, project: { name: 'Settings trial' }, engine: { name: 'Web' },
    modes: { rigor: 'full', automation: 'guided', review_mode: 'lean' }, docs: { density: 'thorough' },
    accessibility: { target: 'none' } };
  const expectedPersonal = { modes: { review_mode: 'solo' } };
  if (name === 'inspect') expectedPersonal.engine = { name: 'Unity' };
  if (name === 'shared') { expectedProject.modes.rigor = 'standard'; expectedProject.modes.review_mode = 'full'; }
  if (name === 'personal') expectedPersonal.modes.automation = 'autonomous';
  if (name === 'reserved') {
    expectedProject.accessibility.target = 'standard';
    expectedPersonal.features = { token_budget_warn_at: 0.7 };
  }
  assert.deepEqual(project, expectedProject, `${name}: project configuration`);
  assert.deepEqual(personal, expectedPersonal, `${name}: personal configuration`);
  const output = JSON.parse(execFileSync(process.execPath,
    [join(scenario.project, '.game-studio/run.cjs'), 'config', 'get', '--json'],
    { cwd: scenario.cwd, encoding: 'utf8', timeout: 30000 }));
  assert.equal(output.status, 'ok');
  assert.equal(output.data.settings['modes.review_mode'].value, 'solo');
  assert.equal(output.data.settings['modes.review_mode'].source, 'project.local.yaml');
  assert.equal(output.data.settings['docs.density'].value, 'thorough');
  assert.equal(output.data.settings['docs.density'].source, 'project.yaml');
  for (const [key, value] of Object.entries(name === 'shared'
    ? { 'modes.workflow': 'standard', 'qa.level': 'standard', 'modes.story_granularity': 'balanced', 'team.size': 'individual' }
    : { 'modes.workflow': 'full', 'qa.level': 'full', 'modes.story_granularity': 'fine', 'team.size': 'studio' })) {
    assert.equal(output.data.settings[key].value, value);
    assert.equal(output.data.settings[key].source, `rigor:${expectedProject.modes.rigor}`);
  }
  if (name === 'reserved') for (const key of ['accessibility.target', 'features.token_budget_warn_at']) {
    assert.equal(output.data.annotations[key].reserved, true);
    assert.ok(output.warnings.some(warning => warning.includes(key) && warning.includes('reserved')));
  }
  results[name] = { changed, added, settings: output.data.settings, warnings: output.warnings };
}
const report = selected.length ? `verified-results-${selected.join('-')}.json` : 'verified-results.json';
await writeFile(join(root, report), JSON.stringify(results, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ evidence: root, cases: Object.keys(results), status: 'passed',
  scope: 'Result files and installed runtime queries only; assess responses separately. No native host discovery claim.' }));
