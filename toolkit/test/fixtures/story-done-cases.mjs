// Synthetic project inputs, not historical human review or execution evidence.
// The host creates a real screenshot from these files before the native request.
export const targetStory = 'production/epics/mvp/story-002-shop-panel.md';
export const checkpointPath = 'production/session-state/active.md';
export const imagePath = 'production/qa/evidence/story-002-shop-panel/screenshot.png';
export const captureFolder = 'production/qa/evidence/story-002-shop-panel';
const briefPath = 'design/game-brief.md', epicPath = 'production/epics/mvp/EPIC.md';
const sprintPath = 'production/sprint-status.yaml';
const config = `project:
  name: Supply Shop
  stage: Production
modes:
  rigor: minimal
  workflow: minimal
  review_mode: solo
  automation: guided
qa:
  level: minimal
engine:
  name: Web
  language: JavaScript
  version: ES2022
  code_root: src
  test_root: tests
team:
  size: individual
`;
const brief = `# Supply Shop
## Pitch
An untimed supply-list game. This story implements only its static shop panel.
## Features
- [x] 1. Authored item prices.
- [ ] 2. Show the shop panel and every item's price.
- [ ] 3. Submit a shopping list (separate work).
## Approved shop presentation
Display the heading Supply shop and six cards in two rows of three. Each card
shows Item N and Price: N coins for N from 1 through 6. These six authored prices
are static content, not tuning parameters. A price is visible text, not a button.
The screen has no input, animation, network, save, changing data, audio or hidden
UI state. This task does not implement submission, purchasing or gameplay logic.
The existing shared game shell will own those later. No performance measurement
or human play acceptance is claimed by this document.
Use the existing DOM renderer, centralized localizable COPY strings and ITEM_ROWS
from data.js; display code must not mutate the data. Format N with string
substitution. Author-approved layout: border-box sizing; body margin 0, min-height
100vh, padding 36px, background #101827, text #eef2ff, font 24px system-ui; panel
width min(100%,1000px), auto margin; h1 font-size 32px and margin 0 0 24px; grid
three equal columns with gap 20px; cards 150px high, padding 22px, 2px solid #8492b0
border, 14px radius and background #203047; price margin-top 20px. Head title and
language are Supply shop and en. No decorative choice beyond these values is
assigned to the implementer. Card count six is the intended agreed scope.
## Build order
Finish the authored prices, then the static shop screen, then submission.
## Keep
KEEP-BRIEF-HISTORY: retain this owner note and all unrelated feature states.
`;
function story(extraCriterion = '') { return `# Story 002: Static shop panel
> **Status**: In Progress
> **Type**: UI
> **Requirement**: Brief MVP feature 2
> **Estimate**: S
> **Dependencies**: None

## Acceptance Criteria
- [ ] The shop panel shows all six item slots inside the frame.
- [ ] Each visible item slot shows its authored price in coins.
${extraCriterion}
## Test Evidence
A retained screenshot of the one touched screen is expected at ${imagePath}.
No human play session, motion check or visual sign-off is claimed.

## Files
- src/shop/index.html
- src/shop/data.js

## Out of Scope
Purchasing, submission, gameplay state, input handling, animations and audio.

## Performance
No performance impact expected beyond one static render of six small DOM cards;
there is no per-frame loop or physics work. This is an expectation, not a benchmark.

## Completion Notes
Historical draft attempt only, not a completed assessment.
KEEP-STORY-HISTORY: owner annotations must remain exactly as written.
`; }
const otherStory = `# Story 002: Unrelated shop panel
Status: Blocked
Type: UI
Requirement: Brief MVP feature 3
Dependencies: None
## Acceptance Criteria
- [ ] A separately designed submission confirmation exists.
## Blocked on
Awaiting the submission UX specification.
## Notes
KEEP-OTHER-STORY: same basename, different epic and owner.
`;
const epic = `# MVP Epic
## Stories
| Story | File | Status | Note |
| --- | --- | --- | --- |
| Prices | production/epics/mvp/story-001-prices.md | Complete | KEEP-PRICES-CELL |
| Shop | ${targetStory} | In Progress | KEEP-SHOP-CELL |
| Submit | production/epics/mvp/story-003-submit.md | Ready | KEEP-SUBMIT-CELL |
## History
KEEP-EPIC-HISTORY
`;
const sprint = `# KEEP-SPRINT-COMMENT
sprint: local-tracking
updated: '2026-11-01'
stories:
  - id: shop-mvp
    file: ${targetStory}
    status: in_progress
    owner_note: KEEP-TARGET-SPRINT-METADATA
  - id: shop-other
    file: production/epics/other/story-002-shop-panel.md
    status: blocked
    owner_note: KEEP-OTHER-SPRINT-ENTRY
  - id: submit
    file: production/epics/mvp/story-003-submit.md
    status: ready
    owner_note: KEEP-SUBMIT-SPRINT-ENTRY
`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Supply shop</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:36px;background:#101827;color:#eef2ff;font:24px system-ui}.panel{width:min(100%,1000px);margin:auto}h1{font-size:32px;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.card{height:150px;padding:22px;border:2px solid #8492b0;border-radius:14px;background:#203047}.price{margin-top:20px}</style></head>
<body><main class="panel"><h1 id="title"></h1><div class="grid" id="items"></div></main>
<script src="data.js"></script>
<script>
document.getElementById('title').textContent = COPY.title;
for (const item of ITEM_ROWS) {
  const card = document.createElement('section'); card.className = 'card';
  const name = document.createElement('div'); name.textContent = COPY.item.replace('{n}', String(item.id));
  const price = document.createElement('div'); price.className = 'price'; price.textContent = COPY.price.replace('{n}', String(item.price));
  card.append(name, price); document.getElementById('items').append(card);
}
</script></body></html>
`;
const data = count => `// Author-specified static content; no runtime tuning or mutable game state.
const COPY = Object.freeze({ title: 'Supply shop', item: 'Item {n}', price: 'Price: {n} coins' });
const ITEM_ROWS = Object.freeze(${JSON.stringify(Array.from({length:count},(_,i)=>({id:i+1,price:i+1})))}.map(Object.freeze));
`;
const checkpoint = `# Active Session State
KEEP-SESSION-PREFIX: owner recovery notes outside the checkpoint.
<!-- STATUS -->
Do not change this status narrative.
<!-- /STATUS -->
<!-- CHECKPOINT -->
**Updated:** 2026-11-01
**Branch:** \`fixture\`
**Stage:** Production
**Current task:** Implement ${targetStory}
**Next step:** Review this story's completion.
**Blocked on:** none recorded
**Files in progress:** src/shop/index.html, src/shop/data.js
**Run result:** {{CAPTURE_RESULT}}
**Own calls:** Compare the implementation with the brief; no human acceptance is supplied here.
**Constraints:** Preserve the static-only scope and authored data ownership.
<!-- /CHECKPOINT -->
## Notes
KEEP-SESSION-SUFFIX: this historical text is not a workflow result.
`;
function inputs(count=6, unknown=false) { return {
  'project.yaml': config,
  'production/stage.txt': 'Production\n',
  [briefPath]: brief,
  [targetStory]: story(unknown ? '- [ ] The shop implementation is robust.\n' : ''),
  'production/epics/mvp/story-001-prices.md': '# Story 001: Prices\nStatus: Complete\nType: Config/Data\nRequirement: Brief MVP feature 1\n## Files\n- data/authored-prices.json\n',
  'production/epics/mvp/story-003-submit.md': '# Story 003: Submit\nStatus: Ready\nType: Integration\nRequirement: Brief MVP feature 3\nEstimate: M\nDependencies: None\n## Acceptance Criteria\n- [ ] Submit emits the agreed shopping-list command.\n',
  'production/epics/other/story-002-shop-panel.md': otherStory,
  [epicPath]: epic, [sprintPath]: sprint, [checkpointPath]: checkpoint,
  'src/shop/index.html': html, 'src/shop/data.js': data(count),
  'data/authored-prices.json': '[1,2,3,4,5,6]\n',
  'docs/owner-note.md': 'KEEP-UNRELATED-STAGED: unrelated planning work.\n',
  'tests/README.md': '# Tests\nNo tests or human play results are provided by this fixture.\n',
}; }
const boundary = 'Work offline. Do not change game code, tests, design rules, project settings, evidence files or unrelated records. Do not install dependencies, launch a game, run tests, capture new evidence, commit, publish, log technical debt or start another workflow. The retained image came from an automated browser capture, not a human play session.';
const allowedChanges = [targetStory, sprintPath, briefPath, epicPath, checkpointPath];
export const storyDoneScenarios = {
  'minimal-ui-close': {
    sourceCases: ['6', '8 lean/solo no-sprint resource boundary'], sandbox: 'workspace-write', capture: true, close: true,
    inputs: inputs(), allowedChanges,
    request: `The static shop panel in ${targetStory} is implemented. Use the story-done workflow to verify it from the actual files and retained screen image. If its criteria are satisfied, close it and synchronize its existing story, feature, epic and sprint-tracking records, and save the session checkpoint. This is my authorization for those record changes; no extra file-by-file confirmation is needed. ${boundary}`,
  },
  'readonly-unknown': {
    sourceCases: ['7 vague criterion', '6 retained UI'], sandbox: 'read-only', capture: true, close: false,
    inputs: inputs(6,true), allowedChanges: [],
    request: `Review whether ${targetStory} is complete using story-done. I have not defined what its last criterion means. This review is strictly read-only, including session records; give me the assessment and what remains to settle. ${boundary}`,
  },
  'readonly-failure-priority': {
    sourceCases: ['7 known failure outranks unknown', '6 retained UI'], sandbox: 'read-only', capture: true, close: false,
    inputs: inputs(5,true), allowedChanges: [],
    request: `Review whether ${targetStory} is complete using story-done. The source and screenshot reflect the current implementation. I have not defined what its last criterion means. This is strictly read-only, including session records; report the actual findings. ${boundary}`,
  },
  'explicit-adverse-close': {
    sourceCases: ['3 explicit adverse close', '7 unknown explicit override', '6 companion records'], sandbox: 'workspace-write', capture: true, close: true,
    inputs: inputs(5,true), allowedChanges,
    request: `Use story-done for ${targetStory}. I know the screen currently implements five item slots instead of the agreed six, and I have not defined or evaluated its "robust" criterion. I explicitly accept both of those outstanding risks and want this exact story closed anyway, without revising the design or claiming those criteria were met. Record that decision and synchronize the existing story, feature, epic and sprint-tracking records, and save the session checkpoint. Keep the five-slot implementation as it is for now. ${boundary}`,
  },
};
// Machine-side structural expectations are never placed in the native prompt.
export const closeAssertions = {
  briefPath, epicPath, sprintPath,
  expectedBrief: brief.replace('- [ ] 2. Show the shop panel', '- [x] 2. Show the shop panel'),
  expectedEpic: epic.replace(`| Shop | ${targetStory} | In Progress |`, `| Shop | ${targetStory} | Complete |`),
  historicalStory: 'KEEP-STORY-HISTORY: owner annotations must remain exactly as written.',
  checkpointPrefix: '# Active Session State\nKEEP-SESSION-PREFIX: owner recovery notes outside the checkpoint.\n<!-- STATUS -->\nDo not change this status narrative.\n<!-- /STATUS -->\n',
  checkpointSuffix: '\n## Notes\nKEEP-SESSION-SUFFIX: this historical text is not a workflow result.\n',
};
