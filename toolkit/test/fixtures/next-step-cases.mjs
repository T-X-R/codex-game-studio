// Synthetic project observations only; routing expectations live in the Codex spec.
const boundary = 'Use $game-studio-next-step to orient me. This is read-only: do not change any files or settings, run the recommended work, launch a server, execute tests, install packages, delegate, commit or publish. Work offline using the installed toolkit.';
const policy = ({ rigor = 'minimal', stage, engine = 'Godot' } = {}) =>
  `schema_version: 1\nmodes:\n  rigor: ${rigor}\n  automation: guided\n${stage ? `project:\n  stage: ${stage}\n` : ''}${engine ? `engine:\n  name: ${engine}\n` : ''}`;
const brief = '# Parcel Counter\nOne small authored parcel game.\n## Features\n- [x] Read a parcel\n- [ ] Accept or return it\n- [ ] Show the summary\n## Build order\nRead, choose, summarize.\n## Skeleton\nContent, Round State, Presentation.\n';
const concept = '# Parcel Counter\nRead one parcel, accept or return it, then see the summary.\n## Pillars\nLegible choices and small authored scope.\n';
const index = '# Systems Index\n| # | System Name | Category | Priority | Status | Design Doc |\n|---|---|---|---|---|---|\n| 1 | Round State | Core | MVP | Approved | round-state.md |\n| 2 | Content | Core | MVP | Approved | content.md |\n';
const story = (number, status, extra = '') => `# Story ${number}: Parcel feature ${number}\n${status === null ? '' : `Status: ${status}\n`}${extra}\n## Acceptance\nThe assigned parcel interaction is visible to the player.\n`;
const storyPath = number => `production/epics/core/story-${String(number).padStart(3, '0')}.md`;
const checkpoint = (next, extra = '') => `# Active session\n<!-- STATUS -->\nEpic: Core\nFeature: Parcel choice\nTask: Story 002\n<!-- /STATUS -->\n<!-- CHECKPOINT -->\n**Branch:** fixture-next-step\n**Current task:** Story 002 parcel choice\n${extra}**Next step:** ${next}\n<!-- /CHECKPOINT -->\n## Notes\nKEEP-NARRATIVE: earlier work remains here.\n`;
const sources = (count, root = 'src', extension = 'gd') => Object.fromEntries(Array.from({ length: count }, (_, i) => [`${root}/part-${i + 1}.${extension}`, extension === 'gd' ? `extends RefCounted\n# Parcel component ${i + 1}\n` : `// Parcel component ${i + 1}\n`]));
const made = { 'prototypes/parcel/index.html': '<!doctype html><title>Parcel Counter</title><button id="accept">Accept parcel</button><output id="count">0</output><script>let n=0;document.querySelector("#accept").onclick=()=>document.querySelector("#count").textContent=String(++n);</script>\n' };
const inputs = (settings, extra = {}) => ({ 'project.yaml': policy(settings), ...extra });
const scenario = (settings, extra, question = 'What should I do next?') => ({ inputs: inputs(settings, extra), request: `${question} ${boundary}` });
const storyInputs = {
  'design/game-brief.md': brief,
  [storyPath(1)]: story('001', 'Complete'),
  [storyPath(2)]: story('002', 'In Progress'),
  [storyPath(3)]: story('003', 'Ready'),
  'production/session-state/active.md': checkpoint(`$game-studio-dev-story ${storyPath(2)}`),
};
const designInputs = { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index,
  'design/gdd/round-state.md': '# Round State\nStatus: Approved\n## Detailed Design\nAn Accept or Return advances one parcel.\n',
  'design/gdd/content.md': '# Content\nStatus: Approved\n## Detailed Design\nFive immutable parcels in authored order.\n' };
const sprint = `sprint: 004\nstories:\n${['in-progress', 'ready-for-dev', 'ready-for-dev', 'done', 'done', 'done', 'blocked'].map((status, i) => `  - id: story-${String(i + 1).padStart(3, '0')}\n    path: ${storyPath(i + 1)}\n    status: ${status}\n${status === 'blocked' ? '    blocker: Waiting for the owner-provided player sprite\n' : ''}`).join('')}`;
const grown = {
  'design/game-brief.md': brief,
  'package.json': '{"name":"parcel-counter","private":true,"type":"module","scripts":{"build":"vite build","test":"vitest run"}}\n',
  'src/main.ts': 'import { nextParcel } from "./game/round"; document.body.textContent=String(nextParcel(0));\n',
  'src/game/round.ts': 'export function nextParcel(index: number): number { return Math.min(5, index + 1); }\n',
  'production/qa/evidence/grow-parcel/grow.md': '# Parcel growth record\nSupplied historical record for this synthetic project.\nSource: prototypes/parcel. Copy and TypeScript conversion complete; core logic uses src/game/round.ts. Recorded build/test and final replay completed. Reference and final records below retain seed 7 and the same click sequence. Human acceptance is still pending. No remaining Loose aliases. Next feature: Accept or return a parcel.\n',
  'production/qa/evidence/grow-parcel/reference/report.json': '{"source":"prototypes/parcel","seed":7,"log":"click:accept","exitCode":0,"replayComplete":true,"notAssessed":[]}\n',
  'production/qa/evidence/grow-parcel/final/report.json': '{"source":"dist","seed":7,"log":"click:accept","exitCode":0,"replayComplete":true,"notAssessed":[]}\n',
};

export const nextStepScenarios = {
  'source-01-sprint': scenario({ rigor: 'standard', stage: 'Production' }, {
    'production/sprints/sprint-004.md': '# Sprint 004\nParcel interactions.\n', 'production/sprint-status.yaml': sprint,
    'production/session-state/active.md': checkpoint('Continue story-001').replaceAll('Story 002', 'Story 001'),
    ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [storyPath(i + 1), story(String(i + 1), 'Ready')])),
  }),
  'source-02-concept': scenario({ rigor: 'full', stage: 'Concept' }, {}),
  'source-03-unset': scenario({ rigor: 'standard', engine: null }, { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index }),
  'source-03-native-engine': scenario({ rigor: 'standard' }, { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index }),
  'source-04-finished': scenario({ rigor: 'standard', stage: 'Systems Design', engine: null }, designInputs, 'I just finished design-review and am not sure what comes next.'),
  'source-04-native-engine': scenario({ rigor: 'standard', stage: 'Systems Design' }, designInputs, 'I just finished design-review and am not sure what comes next.'),
  'source-05-progress': scenario({}, storyInputs),
  'source-06-written': scenario({}, { ...storyInputs, 'production/session-state/active.md': checkpoint(`$game-studio-story-done ${storyPath(2)}`) }),
  'source-07-blocked': scenario({}, { ...storyInputs, [storyPath(2)]: story('002', 'Blocked', 'Blocker: waiting for the player sprite artwork.'), [storyPath(3)]: story('003', 'Draft') }, "I'm stuck. What next?"),
  'source-08-built': scenario({}, sources(12)),
  'source-08-small': scenario({}, sources(3)),
  'source-09-empty': scenario({ engine: null }, {}),
  'source-09-made': scenario({ engine: null }, made),
  'source-09-existing-code': scenario({ engine: null }, sources(12)),
  'source-10-no-prototype': scenario({}, sources(2)),
  'source-10-engine-prototype': scenario({}, { ...sources(2), 'prototypes/parcel-concept/REPORT.md': '# Concept Prototype Report: Parcel\nA local engine prototype was built earlier. Human play is pending.\n' }),
  'source-10-built': scenario({}, sources(12)),
  'story-priority': scenario({}, { ...storyInputs, [storyPath(4)]: story('004', 'In Review') }),
  'story-user-written': scenario({}, storyInputs, 'The implementation for story-002 is written. What should I do next?'),
  'story-deepen': scenario({}, { ...storyInputs, [storyPath(2)]: story('002', 'Ready', '> **Build step**: deepen — a shop'), [storyPath(3)]: story('003', 'Ready') }),
  'story-deepen-designed': scenario({}, { ...storyInputs, [storyPath(2)]: story('002', 'Ready', '> **Build step**: deepen — a shop'), 'design/gdd/shop.md': '# Shop\nOwner-approved catalog and purchase limits are defined here.\n' }),
  'story-all-complete': scenario({}, { ...storyInputs, [storyPath(2)]: story('002', 'Done'), [storyPath(3)]: story('003', 'Complete'), 'production/session-state/active.md': checkpoint('Play the finished parcel loop') }),
  'story-no-status': scenario({}, { 'design/game-brief.md': brief, [storyPath(1)]: story('001', null), [storyPath(2)]: story('002', 'Draft') }),
  'checkpoint-long': scenario({}, { ...storyInputs, 'production/session-state/active.md': checkpoint(`$game-studio-story-done ${storyPath(2)}`, `${Array.from({ length: 35 }, (_, i) => `Context ${i + 1}: earlier detail.\n`).join('')}`) }),
  'checkpoint-legacy': scenario({}, { ...storyInputs, 'production/session-state/active.md': `# Old session\n## Session Extract\nEarlier: continue story-002.\n## Session Extract\nStory-002 implementation is written. Next step: $game-studio-story-done ${storyPath(2)}\n` }),
  'checkpoint-other-branch': scenario({}, { ...storyInputs, 'production/session-state/active.md': checkpoint(`$game-studio-story-done ${storyPath(2)}`).replace('fixture-next-step', 'other-unrelated-branch') }),
  'play-confirmed': scenario({ engine: null }, { ...made, 'prototypes/parcel/feel-log.md': '# Human play\nI played the loop today. Reading and clicking feels clear; I want to keep that pacing.\n' }),
  'play-unassessed-report': scenario({ engine: null }, { ...made, 'prototypes/parcel/REPORT.md': '# Prototype report\nNOT ASSESSED: no human has played this yet. Only static HTML inspection was recorded.\n' }),
  'play-change': scenario({ engine: null }, made, 'I played this; make the Accept button easier to see. What should I do next?'),
  'play-love': scenario({ engine: null }, made, 'I love how the parcel choice feels after playing. What next?'),
  'play-hate': scenario({ engine: null }, made, 'I played it and hate the pacing. What next?'),
  'grown-feature': scenario({ engine: 'Web' }, { ...made, ...grown }),
  'grown-stories-requested': scenario({ engine: 'Web' }, { ...made, ...grown }, 'I want to use stories for my next feature. What is the next step?'),
  'growth-incomplete': scenario({ engine: 'Web' }, { ...made, ...grown, 'production/qa/evidence/grow-parcel/grow.md': '# Growth record\nCopy complete. TypeScript conversion failed; tests have not run. Original prototype is untouched. Continue converting the current root; no growth acceptance exists.\n', 'production/qa/evidence/grow-parcel/final/report.json': '{"exitCode":3,"replayComplete":false,"notAssessed":["conversion incomplete"]}\n' }),
  'size-zero-complete': scenario({}, { 'design/game-brief.md': brief, ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [storyPath(i + 1), story(String(i + 1), 'Ready')])) }),
  'size-some-complete': scenario({}, { 'design/game-brief.md': brief, ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [storyPath(i + 1), story(String(i + 1), i === 0 ? 'Complete' : 'Ready')])) }),
  'overwhelmed-studio': scenario({ rigor: 'full', stage: 'Concept' }, {}, 'There are too many steps and so much documentation. I feel overwhelmed. What should I do next?'),
  'artifact-short': scenario({ rigor: 'full', stage: 'Technical Setup' }, { 'docs/architecture/architecture.md': '# Architecture\nExisting project decisions.\n', 'docs/architecture/adr-0001.md': '# ADR 1\nStatus: Accepted\n', 'docs/architecture/adr-0002.md': '# ADR 2\nStatus: Accepted\n' }),
  'sprint-malformed': scenario({ rigor: 'standard', stage: 'Production' }, { 'production/sprints/sprint-004.md': '# Sprint 004\n', 'production/sprint-status.yaml': 'stories: [\n', ...storyInputs }),
  'helper-unavailable': { ...scenario({}, storyInputs), removeResources: ['studio/scripts/story-status.mjs'] },
};
