const project = (workflow = 'full', review = 'solo', stage = 'Concept') => `# Preserve this project note.\nproject:\n  name: Paper Coast\n  stage: ${stage}\nmodes:\n  rigor: minimal\n  workflow: ${workflow}\n  review_mode: ${review}\n  automation: guided\nengine:\n  name: Web\nqa:\n  level: minimal\nteam:\n  size: individual\nperformance:\n  enforce: off\n`;
const boundary = 'Use the installed toolkit. Do not install packages, edit game/design content, commit, publish or use the network. Preserve unrelated files. Existing user answers below are complete for this audit; record unresolved facts in the report instead of inventing answers.';
const concept = `# Paper Coast
## Core loop
Explore a small painted shore, rotate mirrors to connect a lighthouse beam to a bottle, read its letter, then choose another bottle or restart. The prototype has one bottle and two mirrors; the full project has three short shores and six letters. No combat, timer or procedural content.
## Target audience
People who enjoy short calm spatial puzzles and quiet stories; sessions take about ten minutes. No market research has been performed.
## Game pillars and core fantasy
- Gentle discovery: reveal a small human story through spatial observation, without time pressure.
- Readable light: every beam connection is visually legible and resets without punishment.
- Small authored world: hand-authored shores and letters keep scope controllable for one developer.
The player is a patient keeper reconnecting isolated stories.
## Visual Identity Anchor
One visual rule: warm light connects small paper silhouettes against a cool sea.
Supporting principles: use flat high-contrast beam paths; leave generous negative space around interactive mirrors; keep the camera static and the palette restrained.
## Scope and production assumptions
One developer has ten hours each week for six weeks. The MVP is one shore, one letter, two mirrors and reset; the full vision is three shores and six letters. A fourth shore, voice acting, multiplayer and a level editor are excluded. Use hand-painted static shapes and three original bell sounds. No external assets or engine switch is planned. Scope additions require a separate decision.
## Review record
The owner reviewed this concept on 2026-11-12. Core loop, audience, pillars and visual anchor are approved; no major revision is outstanding. See design/reviews/concept-review.md.
`;
const prototype = '# Concept Prototype Report: Paper Coast\nDate: 2026-11-12\nVerdict: PROCEED\nThe owner played the browser prototype through rotate → connect → read → reset and confirmed the calm discovery hypothesis. No fun blocker was observed. This is the owner\'s supplied play observation, not a claim that a later audit played it.\n';
const html = '<!doctype html><title>Paper Coast</title><button id="start">Start</button><button id="mirror">Rotate mirror</button><p id="letter"></p><script>let active=false,turns=0;start.onclick=()=>{active=true;turns=0;letter.textContent="Connect the light"};mirror.onclick=()=>{if(active&&++turns===2){letter.textContent="A letter has reached the shore";active=false}}</script>';
const reviewedConcept = {
  'design/gdd/game-concept.md': concept,
  'design/reviews/concept-review.md': '# Concept review\nDate: 2026-11-12\nReviewed by: owner\nVerdict: APPROVED\nThe core loop, audience, pillars and visual rule are clear and mutually consistent. No MAJOR REVISION NEEDED finding remains.\n',
  'prototypes/coast-concept/REPORT.md': prototype,
  'prototypes/coast-concept/index.html': html,
};
const brief = '# Game brief: Paper Coast\n## Pitch\nRotate mirrors to reveal a letter on a quiet shore.\n## Features\nStart a shore, connect the light, read the letter and reset. No combat or timer.\n## Build order\n1. Start/reset state.\n2. Mirror interaction and connection.\n3. Reveal the letter and end the cycle.\n## Look and references\nWarm light and flat paper silhouettes on a cool sea.\n';
const stories = Object.fromEntries(['start', 'mirror', 'letter'].map((name, index) => [`production/epics/core/story-0${index + 1}-${name}.md`, `# ${name}\nStatus: Complete\nType: Logic\nAcceptance: ${name} participates in the start, challenge, resolution cycle.\n` ]));
const inputs = (config, stage = 'Concept', extra = {}) => ({ 'project.yaml': config, 'production/stage.txt': `${stage}\n`, ...extra });
const report = name => `production/gate-checks/${name}.md`;
const gdds = Object.fromEntries(['sight', 'mirror', 'letters'].map(name => [`design/gdd/${name}.md`, `# ${name}\nPriority: MVP\nReview: Approved by owner on 2026-11-12, no major revisions.\n## Overview\n${name} defines its authored interaction for Paper Coast.\n## Detailed Design\nUse authored state changes; the player can start, interact, finish and reset without time pressure.\n## Formulas\nNo rates, costs, thresholds or numeric curves are defined by this system.\n## Edge Cases\nReset returns to the authored starting state; repeated actions do not duplicate completion.\n## Dependencies\nNo design dependencies. Used by: none.\n## Acceptance Criteria\nThe interaction communicates its state and resets without losing authored content.\n` ]));

export const gateScenarios = {
  'concept-advance': {
    sandbox: 'workspace-write', expectedFiles: [report('concept')], allowedChanges: ['project.yaml', 'production/stage.txt'],
    inputs: inputs(project(), 'Concept', reviewedConcept),
    request: `Check whether Paper Coast is ready for Systems Design. I confirm the concept review and prototype play report reflect my actual supplied observations; the concept needs no major revision. Save the gate report to ${report('concept')}. If the gate passes, I authorize advancing to Systems Design and synchronizing its stage records. ${boundary}`,
  },
  'missing-no-bypass': {
    sandbox: 'workspace-write', expectedFiles: [report('missing')],
    inputs: inputs(project()),
    request: `Run the Systems Design gate and save its report to ${report('missing')}. I have no concept document or pillars yet, but would like to advance anyway to save time. ${boundary}`,
  },
  placeholder: {
    sandbox: 'read-only', expectedFiles: [],
    inputs: inputs(project(), 'Concept', { ...reviewedConcept, 'design/gdd/game-concept.md': '# Paper Coast\n## Core loop\n[To be designed]\n## Target audience\n[To be designed]\n## Game pillars\n[To be designed]\n## Visual Identity Anchor\n[To be designed]\n' }),
    request: `Audit Systems Design readiness, read-only, and return your report here. The concept file is what is currently on disk; do not replace it or rely on an older review to assume it contains a complete design. No stage changes or follow-up questions during this audit. ${boundary}`,
  },
  'production-unplayed': {
    sandbox: 'workspace-write', expectedFiles: [report('production')],
    inputs: inputs(project('minimal', 'solo', 'Pre-Production'), 'Pre-Production', { 'design/game-brief.md': brief, ...stories, 'src/index.html': html }),
    request: `Run the Production gate for this minimal project and save ${report('production')}. The start-to-resolution cycle has been exercised by an automated check, but no human has played or judged whether this build is fun yet. Advance only if readiness is established. ${boundary}`,
  },
  'not-applicable': {
    sandbox: 'workspace-write', expectedFiles: [report('technical')], allowedChanges: ['project.yaml', 'production/stage.txt'],
    inputs: inputs(project('minimal', 'lean', 'Systems Design'), 'Systems Design', { 'design/game-brief.md': brief }),
    request: `Run the Technical Setup gate for this project. Save ${report('technical')} and, if it passes, advance the stage to Technical Setup. ${boundary}`,
  },
  'standard-panel': {
    sandbox: 'workspace-write', expectedFiles: [report('standard-panel')], timeoutMs: 900000,
    inputs: inputs(project('standard', 'lean', 'Systems Design'), 'Systems Design', {
      ...reviewedConcept, ...gdds,
      'design/gdd/systems-index.md': '# Systems index\n| System | Priority | Status | Depends on | Used by | Design order |\n|---|---|---|---|---|---|\n| sight | MVP | Approved | none | none | 1 |\n| mirror | MVP | Approved | none | none | 2 |\n| letters | MVP | Approved | none | none | 3 |\n',
      'design/gdd/gdd-cross-review-2026-11-12.md': '# Cross-GDD review\nDate: 2026-11-12\nFocus: full (consistency and design-theory)\nVerdict: PASS\nReviewed sight, mirror and letters. Each is approved. No unresolved consistency issue or stale reference remains. The independent interaction definitions require no bidirectional dependency edges.\n',
    }),
    request: `Assess readiness to enter Technical Setup and save ${report('standard-panel')}. I confirm the individual and cross-GDD reviews in the supplied records. Do not change the stage yet. Use the available native director roles for independent read-only reviews required by this project's settings. ${boundary}`,
  },
  'full-panel': {
    sandbox: 'workspace-write', expectedFiles: [report('full-panel')], timeoutMs: 900000,
    inputs: inputs(project('full', 'full'), 'Concept', reviewedConcept),
    request: `Run the Systems Design gate, including the independent native director reviews required by this project, and save ${report('full-panel')}. I confirm the concept and prototype reviews in the records. Keep the stage unchanged while I review the findings. Delegate read-only reviewer tasks only. ${boundary}`,
  },
  'missing-panel': {
    sandbox: 'workspace-write', expectedFiles: [report('missing-panel')], removeRoles: ['creative-director', 'art-director', 'technical-director', 'producer'],
    inputs: inputs(project('full', 'full'), 'Concept', reviewedConcept),
    request: `Run the Systems Design gate and save ${report('missing-panel')}. I confirm the concept and prototype reviews in the records. Advance only if the required gate assessment establishes readiness. ${boundary}`,
  },
  'concerns-unknown': {
    sandbox: 'workspace-write', expectedFiles: [report('concerns-unknown')],
    inputs: inputs(project(), 'Concept', { 'design/gdd/game-concept.md': '# Paper Coast\n## Core loop\n[To be designed]\n## Target audience\n[To be designed]\n## Game pillars\n[To be designed]\n## Visual Identity Anchor\n[To be designed]\n' }),
    request: `Check Systems Design readiness and save ${report('concerns-unknown')}. I accept the risk of skipping the recommended prototype and would like to advance. Nobody has completed or reviewed the concept yet. ${boundary}`,
  },
  'choose-target': {
    sandbox: 'read-only', expectedFiles: [], inputs: inputs(project()),
    request: `Please run a phase gate for this project; I haven't chosen the target transition. Read-only for now. ${boundary}`,
  },
  negative: {
    sandbox: 'read-only', expectedFiles: [], inputs: inputs(project(), 'Concept', { 'src/score.js': 'export const addScore = (score, points) => score - points;\n' }),
    request: `Read src/score.js and explain why adding five points to ten yields five. Answer only; do not modify files or perform a project readiness assessment. ${boundary}`,
  },
};
