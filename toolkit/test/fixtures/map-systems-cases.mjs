const config = (workflow = 'standard', review = 'solo') => `# Preserve project configuration.\nproject:\n  name: Harbor Letters\n  stage: Systems Design\nmodes:\n  rigor: minimal\n  workflow: ${workflow}\n  review_mode: ${review}\n  automation: guided\ndocs:\n  density: balanced\nengine:\n  name: Web\nteam:\n  size: individual\nqa:\n  level: minimal\nperformance:\n  enforce: off\n`;
const concept = `# Harbor Letters
## Core loop
Read an arriving letter, inspect its destination and seal, accept or return it, see the reason, then process the next letter. After five letters, show the round summary and offer reset. A single-screen browser game uses buttons; no reflex input, timer, money, inventory, accounts, networking or persistence.
## Audience and fantasy
Players seeking a short, calm sorting puzzle. The fantasy is being an attentive harbor clerk helping messages reach their homes.
## Pillars
- Legible decisions: the letter and rule explanation make each choice understandable.
- Gentle correction: mistakes explain themselves and never impose a time penalty.
- Small authored scope: deterministic content and a short round make the experience manageable.
## Agreed boundaries
Content owns immutable letter definitions and destination/seal reference data. Validation is a pure operation accepting letter data and returning validity plus reason; it reads definitions but never round state. Round State owns the current index, decisions and round summary; it selects Content and invokes Validation. Presentation renders only Round State snapshots and sends commands to Round State. No service calls back into Presentation. Reset clears only Round State. These four responsibilities and dependency direction are approved; describe their interfaces without implementing code or detailed mechanics.
## Milestones and scope
MVP: the four approved responsibilities, five fixed letters, one destination rule and seal rule, reason feedback, summary and reset. Vertical Slice: authored presentation polish within the same loop. Alpha: one additional authored letter set using the same rules. Full Vision: optional sound cues driven by Round State; no additional mechanic or persistence. No cloud sync, achievements, procedural letters, economy, multiplayer or level editor.
## Planning inputs supplied by the owner
One developer has 20 hours/week for eight weeks (160 gross hours), with 40 hours reserved for uncertainty. Planning estimates, not measured implementation: MVP content 4 hours, validation 8 hours, round state 8 hours, presentation 8 hours; visual polish 8 hours; second letter set 4 hours; sound cues 4 hours. The full planned implementation volume is 44 hours, before the separately reserved uncertainty buffer. No code or playtest has been completed. Changes to the scope, timeline or approved dependency direction require the owner's decision.
## Visual direction
Warm paper cards on a muted blue harbor backdrop. Keep destination/seal text legible; show validation reasons close to the selected choice. No external assets are required.
`;
const brief = '# Harbor Letters brief\n## Pitch\nRead a letter, accept or return it, see why, then process the next one.\n## What they feel\nCalm satisfaction from making a legible decision; mistakes explain themselves.\n## Features and scope\nFive fixed letters, destination and seal checks, feedback, summary and reset. No timer, economy, persistence, networking or account.\n## Build order\n1. Immutable letter data.\n2. Pure validation rules.\n3. Round state and reset.\n4. Button input and feedback.\n## Look and references\nWarm paper cards on a blue background with clear text.\n';
const index = `# Systems Index: Harbor Letters
> **Status**: Under Review
> **Created**: 2026-11-10
> **Last Updated**: 2026-11-11
> **Source Concept**: design/gdd/game-concept.md
## Overview
Four agreed responsibilities serve Legible decisions, Gentle correction and Small authored scope. Preserve the existing review history.
## Systems Enumeration
| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Content | Core | MVP | Approved | design/gdd/content.md | — |
| 2 | Validation | Gameplay | MVP | In Design | design/gdd/validation.md | Content |
| 3 | Round State | Core | MVP | Not Started | — | Content, Validation |
| 4 | Presentation | UI | MVP | Not Started | — | Round State |
## Categories
| Category | Description | Typical Systems |
|---|---|---|
| Core | Foundational state/data | Content, Round State |
| Gameplay | Decisions | Validation |
| UI | Feedback and commands | Presentation |
## Priority Tiers
| Tier | Definition | Target Milestone | Design Urgency |
|---|---|---|---|
| MVP | Required loop | First playable | First |
| Vertical Slice | Authored presentation polish | Demo | Second |
| Alpha | Second authored set | Alpha | Third |
| Full Vision | Optional sound cues | Release | Later |
## Dependency Map
Foundation: Content. Core: Validation depends on Content; Round State depends on Content and Validation. Presentation: Presentation depends on Round State.
## Recommended Design Order
| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|---|---|---|---|---|---|
| 1 | Content | MVP | Foundation | game-studio-game-designer | S |
| 2 | Validation | MVP | Core | game-studio-game-designer | M |
| 3 | Round State | MVP | Core | game-studio-game-designer | M |
| 4 | Presentation | MVP | Presentation | game-studio-game-designer | S |
## Circular Dependencies
None in the approved graph.
## High-Risk Systems
Validation clarity needs testing after implementation; no play acceptance is claimed.
## Progress Tracker
| Metric | Count |
|---|---|
| Total systems identified | 4 |
| Design docs started | 2 |
| Design docs reviewed | 1 |
| Design docs approved | 1 |
| MVP systems designed | 1/4 |
| Vertical Slice systems designed | 0/0 |
## Owner Notes
KEEP-INDEX-NOTE: Do not rename the existing four systems; external notes use their identifiers.
## Next Steps
Resume Validation before authoring Round State.
`;
const checkpoint = '# Active Session State\n\nKEEP-RECOVERY-PREFACE: Retain the keyboard-only accessibility constraint.\n\n<!-- CHECKPOINT -->\n**Current task:** Validation design\n**Next step:** Finish invalid-seal cases\n**Files in progress:** design/gdd/validation.md\n**Constraints:** Keep keyboard-only operation; do not change approved Content IDs\n**Open questions:** Which wording best explains an invalid seal?\n<!-- /CHECKPOINT -->\n\n## Notes\nKEEP-RECOVERY-NOTE: Owner has not played any implementation yet.\n';
const oldDesigns = {
  'design/gdd/content.md': '# Content\nStatus: Approved\nOwner review: approved 2026-11-10.\nImmutable IDs letter-01 through letter-05; destination and seal definitions are read-only. No runtime round state or UI ownership.\n',
  'design/gdd/validation.md': '# Validation\nStatus: In Design\nThe pure function accepts a letter definition and returns validity plus a reason. Invalid-seal wording remains unresolved. Do not treat this draft as approved.\n',
};
const base = (workflow = 'standard', review = 'solo', extra = {}) => ({ 'project.yaml': config(workflow, review), 'production/stage.txt': 'Systems Design\n', ...extra });
const newFiles = ['design/gdd/systems-index.md', 'production/session-state/active.md'];
const boundary = 'Use the installed toolkit. Work offline, preserve unrelated files, and do not install packages, edit game code or existing GDDs, change project settings/stage, commit or publish. Stop after the requested mapping or selection; do not start individual system design.';
const create = 'The concept, boundaries, dependencies, milestones and planning inputs are agreed. Create the systems index from them; you may choose concise internal descriptions and labels within that scope. I authorize the index write and one final milestone checkpoint through the installed toolkit. Preserve unresolved findings honestly without accepting risks or changing scope on my behalf.';

export const mapScenarios = {
  'new-solo': { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true,
    inputs: base('standard', 'solo', { 'design/gdd/game-concept.md': concept }),
    request: `${create} ${boundary}` },
  resume: { sandbox: 'workspace-write', expectedFiles: [], saveCheckpoint: true,
    allowedChanges: ['design/gdd/systems-index.md', 'production/session-state/active.md'],
    inputs: base('standard', 'lean', { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index, 'production/session-state/active.md': checkpoint, ...oldDesigns }),
    request: `Update the existing systems index only to add the already-agreed optional Sound Cues system: Audio category, Full Vision priority, depends on Round State, not started. Leave the existing four IDs, priorities, design states and GDD files intact. Update dependent counts/order/notes and save one milestone checkpoint, preserving the ongoing Validation work and recovery notes. This update and its file writes are authorized. ${boundary}` },
  next: { sandbox: 'read-only', expectedFiles: [],
    inputs: base('standard', 'full', { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index, ...oldDesigns }),
    request: `Use the systems index to select the next unfinished system to design and give its handoff context. Selection only, read-only; do not update the index or start authoring. ${boundary}` },
  missing: { sandbox: 'read-only', expectedFiles: [], inputs: base(),
    request: `Map this game's systems and dependencies. I have not provided a concept or brief yet. Read-only until the needed source exists. ${boundary}` },
  minimal: { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true,
    inputs: base('minimal', 'lean', { 'design/game-brief.md': brief }),
    request: `I voluntarily want a small systems map from this approved brief while keeping minimal workflow. Its Build order and exclusions are agreed; use the direct four responsibilities it describes. I authorize writing the index and one final checkpoint. Do not expand this into a full concept or require formal pillars. ${boundary}` },
  'full-review': { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true, timeoutMs: 900000,
    inputs: base('standard', 'full', { 'design/gdd/game-concept.md': concept }),
    request: `${create} Use the available native reviewers required by the settings. For advisory scope suggestions, retain the agreed tiers and record the suggestions as unaccepted. If review input is unavailable, retain a clearly unassessed draft. For post-write creative concerns, record them as unresolved findings for my later decision; do not mark them accepted. Stop on a fundamental boundary rejection. ${boundary}` },
  'solo-override': { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true,
    inputs: base('standard', 'full', { 'design/gdd/game-concept.md': concept }),
    request: `${create} Use --review solo for this mapping run only. ${boundary}` },
  negative: { sandbox: 'read-only', expectedFiles: [],
    inputs: base('standard', 'solo', { 'src/score.js': 'export const addScore = (score, points) => score - points;\n' }),
    request: `Read src/score.js and explain why adding five points to ten yields five. Answer only; no architecture or systems planning. ${boundary}` },
};
