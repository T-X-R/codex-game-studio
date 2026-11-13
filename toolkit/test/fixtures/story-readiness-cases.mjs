// Raw project inputs only. Assertions belong to the source-mapping spec and manual audit.
const storyPath = 'production/epics/core/story-001-light pickup.md';
const adrPath = 'docs/architecture/adr-0003-inventory.md';
const registryPath = 'docs/architecture/tr-registry.yaml';
const manifestPath = 'docs/architecture/control-manifest.md';
const config = (workflow = 'full', review = 'solo', qa = 'minimal', grain = 'coarse') => `engine:
  name: Web
modes:
  rigor: minimal
  workflow: ${workflow}
  review_mode: ${review}
  automation: guided
  story_granularity: ${grain}
qa:
  level: ${qa}
`;
const criteria = ['Given an empty inventory and one light pickup, collecting it sets the stored count to 1.', 'Given pickup ID p is already recorded once with stored count 1, collecting p again leaves the count at 1.', 'Given a stored count of 0, querying the inventory returns 0 without creating a pickup.'];
function story({ title = 'Light pickup', type = 'Logic', status = 'Ready', adr = 'ADR-0003', tr = 'TR-light-001', gdd = 'design/gdd/light.md', ac = criteria, version = '2026-03-10', evidence = 'Planned automated unit test: tests/light-pickup.test.ts, using a new inventory and an injected pickup ID per case.', dependency = 'None', estimate = '2 hours', requirement = 'Pickup rule: each unique light contributes one stored unit, and collecting it twice contributes nothing more.' } = {}) {
  return `# ${title}
Status: ${status}
Type: ${type}
Layer: Feature
Estimate: ${estimate}
GDD: ${gdd} — ${requirement}
TR: ${tr}
ADR: ${adr}
Manifest Version: ${version}

## Acceptance Criteria
${ac.map(c => `- [ ] ${c}`).join('\n')}

## Out of Scope
Saving inventory and multiplayer synchronization are excluded.

## Dependencies
Depends on: ${dependency}

## Engine Notes
N/A — pure data function; no engine API involved.

## Manifest Rules
N/A — this Feature layer has no additional manifest rules.

## Performance
N/A — no render, physics or update-loop change; a map entry is touched only on pickup.
${evidence === null ? '' : `\n## Test Evidence\nStatus: Planned\n${evidence}\n`}`;
}
const adr = (status = 'Accepted', layer = 'Feature') => `# ADR-0003: Inventory counting
## Status
${status}
## Date
2026-03-10
## Decision
Count unique pickup IDs once; no engine API is needed.
## Engine Compatibility
| Field | Value |
|---|---|
| **Layer** | ${layer} |
| Engine | Web |
## Dependencies
None
`;
const registry = (status = 'active') => `requirements:
  - id: TR-light-001
    system: light
    requirement: Each unique light contributes one stored unit.
    source: design/gdd/light.md
    status: ${status}
`;
const base = () => ({
  'project.yaml': config(),
  'design/gdd/light.md': '# Light system\n## Pickup rule\nTR-light-001: Each unique light contributes one stored unit. Repeated collection of the same pickup contributes nothing more. An empty inventory returns zero.\n',
  'design/systems-index.md': '# Systems\n| System | GDD | Status |\n|---|---|---|\n| Light | design/gdd/light.md | Designed |\n',
  'design/game-brief.md': '# Light game\n## Features\n- Track unique collected lights; a duplicate does not increment the count and an empty inventory returns zero.\n',
  [storyPath]: story(), [adrPath]: adr(), [registryPath]: registry(),
  [manifestPath]: '# Control Manifest\nManifest Version: 2026-03-10\n\n## Rules\nFeature: no additional rules.\n',
});
function scenario(scope = storyPath, changes = {}, options = {}) {
  return { inputs: { ...base(), ...changes }, request: `Use $game-studio-story-readiness ${scope}. Review the supplied material offline and stop after the report.`, ...options };
}
const without = (value, ...paths) => { for (const path of paths) delete value.inputs[path]; return value; };
const noStories = () => without(scenario('all', { 'production/epics/core/EPIC.md': '# Core epic\nStories have not been written.\n' }), storyPath);
const minimalStory = () => story({ adr: 'N/A — data-only brief feature; no architectural decision applies', tr: 'None', gdd: 'design/game-brief.md#features', version: '' });
const plan = rows => `# Sprint 4
Goal: Collect lights

| Story / Task | Priority | Estimate |
|---|---|---|
${rows.map(r => `| [${r.title}](${r.path}) | ${r.priority} | 2 hours |`).join('\n')}
`;
const sprint = rows => `sprint: 4
stories:
${rows.map(r => `  - file: ${JSON.stringify(r.path)}\n    status: ${r.status ?? 'ready-for-dev'}\n    priority: ${r.priority === 'Must Have' ? 'must-have' : 'should-have'}`).join('\n')}
`;
const full = (changes = {}) => scenario(`${storyPath} --review full`, changes, { timeoutMs: 1200000 });
const readyCandidates = scenario();
const candidates = [
  { path: 'production/epics/core/story-002-map.md', title: 'Map count', priority: 'Must Have', dependency: 'Story 007' },
  { path: 'production/epics/core/story-003-display.md', title: 'Display count', priority: 'Should Have', dependency: 'Story 008' },
  { path: 'production/epics/core/story-004-reset.md', title: 'Reset count', priority: 'Should Have', dependency: 'None' },
  { path: 'production/epics/core/story-005-draft.md', title: 'Draft count', priority: 'Must Have', status: 'Draft' },
];
readyCandidates.inputs['production/sprints/sprint-004.md'] = plan(candidates);
for (const c of candidates) readyCandidates.inputs[c.path] = story(c);
readyCandidates.inputs['production/epics/core/story-007-base.md'] = '# Storage base\nStatus: Complete\n';
readyCandidates.inputs['production/epics/core/story-008-loading.md'] = '# Loading base\nStatus: In Progress\n';
const aggregate = scenario('sprint');
const rows = [{ path: storyPath, title: 'Light pickup', priority: 'Should Have' }, { path: 'production/epics/core/story-002-other.md', title: 'Other pickup', priority: 'Must Have' }, { path: 'production/epics/core/story-003-missing.md', title: 'Missing card', priority: 'Must Have' }];
aggregate.inputs[rows[1].path] = story({ adr: 'ADR-0005' });
aggregate.inputs['docs/architecture/adr-0005-count.md'] = adr('Proposed').replace('ADR-0003', 'ADR-0005');
aggregate.inputs['production/sprints/sprint-004.md'] = plan(rows);
aggregate.inputs['production/sprint-status.yaml'] = sprint(rows);
const retired = scenario('all', { 'project.yaml': config('standard'), [adrPath]: adr('Superseded by ADR-0009') });
retired.inputs['production/epics/core/story-002-input.md'] = story({ adr: 'ADR-0008' });
retired.inputs['docs/architecture/adr-0008-input.md'] = adr('Deprecated').replace('ADR-0003', 'ADR-0008');
retired.inputs['docs/architecture/adr-0009-replacement.md'] = adr().replace('ADR-0003', 'ADR-0009');
const retiredTr = scenario('all');
retiredTr.inputs[registryPath] = ['active', 'deprecated', '"superseded-by: TR-light-009"', 'superseded-by: TR-light-010'].map((status, i) => registry(status).replace('requirements:\n', '').replace('TR-light-001', `TR-light-00${i + 1}`)).join('');
retiredTr.inputs[registryPath] = 'requirements:\n' + retiredTr.inputs[registryPath];
for (let i = 2; i <= 4; i++) retiredTr.inputs[`production/epics/core/story-00${i}-requirement.md`] = story({ tr: `TR-light-00${i}` });
const qaWaivers = without(scenario('all', { 'project.yaml': config('standard') }), registryPath, manifestPath, storyPath);
const qaRequirements = [
  ['Logic', criteria, 'Pickup rule: each unique light contributes one stored unit; duplicate collection contributes nothing more and an empty inventory returns zero.'],
  ['Integration', ['Calling the pickup adapter with a new ID returns the stored count 1.', 'Given ID p has already been collected once, calling the pickup adapter with p returns the count 1.', 'Reading an empty adapter returns count 0.'], 'Adapter rule: expose pickup and read operations, retaining the unique-count semantics.'],
  ['Config/Data', ['The initial inventory count setting is the integer 0.'], 'Initial count rule: start the inventory count at integer zero.'],
  ['UI', ['Given stored count 0, the inventory panel displays the label Lights: 0.', 'Given stored count 1, reopening the inventory panel displays Lights: 1.'], 'Count panel rule: display Lights: N for the current stored count when the panel opens.'],
  ['Visual/Feel', ['The light icon is a yellow circle on a dark background in the inventory panel.', 'The selected light icon has a visible white outline.'], 'Icon rule: show the light as a yellow circle on a dark background, with a white outline when selected.'],
];
qaWaivers.inputs['design/gdd/light.md'] += '\n' + qaRequirements.map(([, , requirement]) => requirement).join('\n');
for (const [i, [type, ac, requirement]] of qaRequirements.entries()) {
  let text = story({ type, ac, requirement, evidence: null, adr: 'N/A — presentation/data-only change within the existing layout', tr: 'None', version: '' });
  if (['UI', 'Visual/Feel'].includes(type)) text = text
    .replace('N/A — pure data function; no engine API involved.', 'Web DOM/CSS: inspect the panel on opening; no game-engine service is involved.')
    .replace('N/A — no render, physics or update-loop change; a map entry is touched only on pickup.', 'N/A — a static panel refresh on opening; no per-frame or physics workload.');
  qaWaivers.inputs[`production/epics/core/story-00${i + 1}-${type.replaceAll('/', '-')}.md`] = text;
}
const dependencies = scenario('all');
dependencies.inputs[storyPath] = story({ dependency: 'Story 002' });
dependencies.inputs['production/epics/core/story-002-base.md'] = story({ status: 'Draft' });
dependencies.inputs['production/epics/core/story-003-link.md'] = story({ dependency: 'production/epics/other/story-009-base.md' });
const markers = scenario('all');
markers.inputs[storyPath] = story({ ac: [...criteria, 'UNRESOLVED: which pickup wins when two clients collect together?'] });
markers.inputs['production/epics/core/story-002-notes.md'] = story() + '\n## Notes\nTODO assign a local icon.\n';
markers.inputs['production/epics/core/story-003-syntax.md'] = story() + '\n```md\nTBD ignored example\n```\n<!-- UNRESOLVED hidden comment -->\nQuestion marks in the description? This is not a pending criterion.\n';
const overrides = scenario('all', { 'project.yaml': config('minimal') + 'workflow_overrides:\n  system_overrides:\n    light: full\n' });
overrides.inputs[storyPath] = story({ version: '2026-01-15' });
overrides.inputs['production/epics/core/story-002-brief.md'] = minimalStory();
const multipleAdrs = without(scenario(storyPath, { [storyPath]: story({ adr: 'ADR-0003, ADR-0007, ADR-0008' }), 'docs/architecture/adr-0007-unknown.md': '# ADR-0007\n## Decision\nFormat not yet classified.\n' }), adrPath);
const assets = scenario('all');
assets.inputs[storyPath] = story() + '\n## Inputs\nReuse assets/light.svg.\n';
assets.inputs['assets/light.svg'] = '<svg xmlns="http://www.w3.org/2000/svg"/>\n';
assets.inputs['production/epics/core/story-002-missing-asset.md'] = story() + '\n## Inputs\nReuse assets/missing.ogg.\n';
assets.inputs['production/epics/core/story-003-new-scene.md'] = story() + '\n## Deliverable\nCreate a new scenes/light.tscn for this story; it does not exist yet.\n';
const fullMulti = full(); fullMulti.request = 'Use $game-studio-story-readiness all --review full. Review offline and stop after the report.';
fullMulti.inputs['production/epics/core/story-002-second.md'] = story({ title: 'Second light' });
const fine = scenario(storyPath, { 'project.yaml': config('full', 'solo', 'minimal', 'fine'), [storyPath]: story({ ac: criteria.slice(0, 1) }) });
export const storyReadinessScenarios = {
  'source-01-ready-candidates': readyCandidates,
  'source-02-proposed-full': scenario(storyPath, { [adrPath]: adr('Proposed') }),
  'proposed-standard-feature': scenario(storyPath, { 'project.yaml': config('standard'), [adrPath]: adr('Proposed') }),
  'standard-stale-advisory': scenario(storyPath, { 'project.yaml': config('standard'), [storyPath]: story({ version: '2026-01-15' }) }),
  'standard-foundation-engine-notes': scenario(storyPath, { 'project.yaml': config('standard'), [adrPath]: adr('Accepted', 'Foundation'), [storyPath]: story().replace(/## Engine Notes[\s\S]*?## Manifest Rules/, '## Manifest Rules') }),
  'source-03-minimal-missing-ac': scenario(storyPath, { 'project.yaml': config('minimal'), [storyPath]: minimalStory().replace(/## Acceptance Criteria[\s\S]*?## Out of Scope/, '## Out of Scope') }),
  'minimal-brief': scenario(storyPath, { 'project.yaml': config('minimal'), [storyPath]: minimalStory() }),
  'minimal-proposed': scenario(storyPath, { 'project.yaml': config('minimal'), [adrPath]: adr('Proposed') }),
  'source-04-stale-full': scenario(storyPath, { [storyPath]: story({ version: '2026-01-15' }) }),
  'source-05-full-native': full(),
  'full-native-multi': fullMulti,
  'full-native-visible-gap': full({ [storyPath]: story({ ac: [criteria[0], 'Picking up a light feels good.', criteria[2]] }) }),
  'full-native-subjective': full({ 'project.yaml': config('full', 'full', 'minimal', 'fine'), [storyPath]: story({ ac: ['Collecting a light feels wonderful.'] }) }),
  'full-native-missing-design': without(full(), 'design/gdd/light.md'),
  'full-native-blocker': full({ [adrPath]: adr('Proposed') }),
  'full-role-unavailable': { ...full(), removeRoles: ['game-studio-qa-lead'] },
  'lean-override': scenario(`${storyPath} --review lean`, { 'project.yaml': config('full', 'full') }),
  'source-06-qa-minimal-types': qaWaivers,
  'source-07-zero': noStories(),
  'blank-scope': { ...scenario(), request: 'Use $game-studio-story-readiness.' },
  'missing-target': scenario('production/epics/core/story-999-absent.md'),
  'source-07-status-unknown': scenario(storyPath, { [adrPath]: '# ADR-0003\n## Decision\nCount unique pickups.\n' }),
  'status-other': scenario(storyPath, { [adrPath]: adr('On Hold') }),
  'missing-adr': without(scenario(), adrPath),
  'source-08-retired-adrs': retired,
  'source-09-retired-trs': retiredTr,
  'sprint-partial-warning': aggregate,
  'sprint-malformed': scenario('sprint', { 'production/sprint-status.yaml': 'stories: [broken\n' }),
  'sprint-empty': scenario('sprint', { 'production/sprint-status.yaml': 'stories: []\n' }),
  'sprint-absent': scenario('sprint'),
  'epic-only': scenario('core', { 'production/epics/other/story-009-unrelated.md': '# Unrelated draft\nStatus: Draft\n' }),
  'per-system-tier': overrides,
  'multiple-adrs-precedence': multipleAdrs,
  'dependency-states': dependencies,
  'open-question-boundaries': markers,
  'asset-inputs-and-planned-output': assets,
  'fine-granularity': fine,
  'conversation-draft-readonly': { ...scenario(storyPath, { [storyPath]: story({ ac: ['Picking up a light feels good.'] }) }), sandbox: 'workspace-write', request: `Use $game-studio-story-readiness ${storyPath}. After reviewing, draft suggested acceptance-criteria improvements in the conversation; do not edit files.` },
  'negative-translation': { ...scenario(), request: 'Translate the sentence "The lantern shines at dusk" into Chinese. Only return the translation.' },
};
