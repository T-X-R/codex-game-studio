// Raw project facts and scoped owner requests. No expected gate verdicts in prompts.
const settings = (workflow = 'full', review = 'solo', extra = '') => `project:
  name: Parcel Counter
  stage: Technical Setup
modes:
  rigor: minimal
  workflow: ${workflow}
  review_mode: ${review}
  automation: guided
docs:
  density: terse
engine:
  name: Web
  version: "2026-fixture"
  language: JavaScript
naming:
  classes: PascalCase
  functions: camelCase
${extra}`;
const designDecisions = `Content provides five immutable uniquely identified parcels in authored order. Round State alone owns current index, recorded Accept/Return decisions and final accepted/returned counts. Reviewing begins at index 0; one valid decision for the displayed current ID advances by exactly one. Stale/duplicate/non-current IDs return rejected-command without mutation. The fifth valid decision enters Complete with index 5, no current parcel and counts totaling five. Reset clears only round state and restores the first parcel. Commands are processed in receive order. Invalid content (not five unique IDs) yields unavailable-round before play; never repair Content. Presentation reads snapshots and sends commands; Round State never calls Presentation. No timers, score, storage, networking, threads, randomness or extra mechanics. No measured performance or human play evidence exists.`;
const architectureDecisions = `The owner has chosen one synchronous single-threaded command pipeline. Content is a Foundation-owned immutable dataset; Round State is Core with pure JavaScript transition functions; Presentation is a downstream Presentation-layer consumer. The Web browser/OS is external Platform, not a project-owned system. No game system depends on Presentation. Presentation submits {action, parcelId} or Reset, receives a result and reads a snapshot; the public contracts use ordinary JavaScript data, not engine-specific types. A private Round State owner produces independent read-only snapshot values. No event bus, background work, save/load, storage or framework dependencies are selected. Initialization validates Content, creates Round State, then binds Presentation; invalid Content leaves play unavailable. A frame displays the latest snapshot after commands; no elapsed-time simulation. All concrete browser binding details are later work and remain unverified. Preserve these choices and surface any actual conflict rather than inventing a replacement architecture.`;
const concept = `# Parcel Counter
## Pillars
Legible choices, gentle correction and small authored scope.
## Core Loop
Read one parcel, accept or return it, continue through five and reset after the summary.
## Approved behavior
${designDecisions}
## Owner's technical choices
${architectureDecisions}
`;
const brief = `# Parcel Counter brief
## Pitch
A calm five-parcel Accept/Return round with a clear summary and reset.
## Approved behavior and ownership
${designDecisions}
## Agreed technical direction
${architectureDecisions}
`;
const index = `# Systems Index: Parcel Counter
## Systems Enumeration
| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Content | Core | MVP | Approved | design/gdd/content.md | — |
| 2 | Round State | Core | MVP | Approved | design/gdd/round-state.md | Content |
| 3 | Presentation | UI | MVP | Approved | design/gdd/presentation.md | Round State |
## Recommended Design Order
Content, Round State, Presentation. KEEP-INDEX: authoring does not modify the index.
`;
const contentGdd = `# Content
> **Status**: Approved
## 1. Overview
Owns the authored dataset.
## 4. Formulas
Exactly five immutable unique IDs p1, p2, p3, p4, p5; preserve supplied order.
## 6. Dependencies
Content never reads Round State or Presentation. Consumers receive read-only definitions.
## 8. Acceptance Criteria
Given the dataset, attempts to mutate it do not change definitions or IDs.
`;
const stateGdd = `# Round State
> **Status**: Approved
## Detailed Design
${designDecisions}
## Formulas
For an eligible decision at index 0–4: next_index = current_index + 1. Rejections leave index unchanged. At Complete, accepted_count + returned_count = 5; all counts are integers 0–5. Reset clears only Round State.
## Dependencies
Consumes Content in supplied order; provides snapshots/results to Presentation, no callback. Round State is the sole mutable owner.
## Tuning Knobs
None. Five is an authored scope constant.
## Acceptance Criteria
Given five unique parcels, process each ID once; the fifth completes with counts matching choices. Given a stale ID or Complete state, reject without mutation. Given invalid count or duplicate IDs, return unavailable before play. Reset preserves Content.
`;
const presentationGdd = `# Presentation
> **Status**: Approved
## Detailed Rules
Render the current parcel, Accept and Return controls, progress and final counts. Send the displayed ID with decisions. Render rejected/unavailable results honestly. UI actions never directly modify game state.
## Dependencies
Read Round State snapshots, send commands, display results. No Round State callback. Bindings are future technical work; no interaction latency budget has been supplied.
## Acceptance Criteria
Given an unchanged snapshot, display does not alter Content or Round State. After Complete, no current parcel is displayed and summary counts are shown. Reset submits a command.
`;
const preferences = `# Technical Preferences
## Forbidden Patterns
- Mutable global game-state singletons.
- Round State callbacks into Presentation.
## Allowed Libraries / Addons
No third-party libraries approved.
## Naming Conventions
- **Files**: kebab-case
## Performance Budgets
No measured or accepted numeric budget has been supplied. Do not invent one.
`;
const engine = {
  'docs/engine-reference/web/VERSION.md': `# Web reference fixture
Engine: Web
Version: 2026-fixture
This is synthetic local evidence for an isolated workflow test, not official browser documentation or proof of runtime capabilities.
No model training cutoff is asserted. Core plain-data assumptions are documented below; browser binding remains unverified.
`,
  'docs/engine-reference/web/breaking-changes.md': '# Changes\nSynthetic fixture: no selected plain-data API change is asserted. Browser engine/version changes remain unknown; no HIGH/MEDIUM list has been independently verified.\n',
  'docs/engine-reference/web/deprecated-apis.md': '# Deprecated APIs\nNo browser APIs are selected by this fixture. Their current deprecation status is not assessed.\n',
  'docs/engine-reference/web/current-best-practices.md': '# Practices\nFixture owner requires pure state transitions, immutable Content and single ownership. These are project choices, not verified platform best practices.\n',
  'docs/engine-reference/web/modules/core.md': '# Core\nChosen contracts use ordinary data and pure transition functions. No specific engine API or benchmark is claimed. Validate Content before creating a round.\n',
  'docs/engine-reference/web/modules/ui.md': '# UI\nPresentation is downstream and owns rendering and controls. Concrete browser event/render bindings remain future work; no API signature is supplied here.\n',
  'docs/engine-reference/web/modules/input.md': '# Input\nPresentation sends Accept/Return with current parcel ID or Reset, in received order. No browser event API has been selected.\n',
  'docs/engine-reference/web/modules/networking.md': '# Networking\nUnused reference domain. No networking system exists in this game.\n',
};
const adr = `# ADR-0001: Pure round ownership
## Status
Accepted
## Summary
Round State alone owns progression and emits snapshots/results. Presentation submits commands so game rules remain independent of display.
## Context
The approved game has one synchronous five-parcel round and no persistence.
## Decision
${architectureDecisions}
## Engine Compatibility
| Field | Value |
|-------|-------|
| Engine | Web |
| Version | 2026-fixture |
| Layer | Core |
| **Domain** | Core |
| Risk | Browser integration unverified; plain-data contract only |
## GDD Requirements Addressed
| GDD | Requirement | Covered By |
|-----|-------------|------------|
| design/gdd/round-state.md | Sole owner of ordered decisions, index and final counts | Pure transitions and private Round State ownership |
| design/gdd/round-state.md | Non-current decisions rejected, fifth completes, Reset isolates Content | Eligibility and transition rules |
| design/gdd/content.md | Immutable five-parcel dataset, invalid input stops play | Validation before initialization; no Content mutation |
| design/gdd/presentation.md | Snapshot reads and commands, no UI game-state writes | One-way ownership and explicit results |
## Consequences
No implementation or integration is verified. Follow-up browser binding decisions remain Proposed until separately confirmed.
`;
const proposedAdr = `# ADR-0002: Browser presentation bindings
## Status
Proposed
## Summary
Presentation will adapt controls and rendering to the round contract. Concrete browser binding and verification are unresolved.
## Decision
Keep Presentation downstream; exact APIs and implementation are not chosen.
## Engine Compatibility
| Field | Value |
|-------|-------|
| Engine | Web |
| Version | 2026-fixture |
| Layer | Presentation |
| **Domain** | UI, Input |
| Risk | Unverified |
## GDD Requirements Addressed
Presentation control/result display and non-mutating snapshot reads.
`;
const registry = `# KEEP-TR: retired IDs and owners survive authoring.
requirements:
  - id: TR-round-state-001
    system: round-state
    requirement: Round State alone owns current index, decisions and summary
    status: active
    gdd: design/gdd/round-state.md
  - id: TR-round-state-002
    system: round-state
    requirement: Previous timer-based progression
    status: deprecated
    gdd: design/gdd/round-state.md
  - id: TR-round-state-003
    system: round-state
    requirement: Old completion payload
    status: "superseded-by: TR-round-state-001"
    gdd: design/gdd/round-state.md
`;
const existing = `# Parcel Counter — Master Architecture
## Document Status
- Version: 2
- Last Updated: 2026-11-10
- Engine: Web 2026-fixture
- TD-ARCHITECTURE: 2026-11-10 — skipped — Solo mode
- LP-FEASIBILITY: 2026-11-10 — skipped — Solo mode
## Engine Knowledge Gap Summary
KEEP-ENGINE: concrete browser binding remains unverified.
## Technical Requirements Baseline
Extracted from 5 GDDs | 2 total requirements | 1 registered, 1 provisional
(TR registry: read, 3 entries)
| Req ID | GDD | System | Requirement | Domain |
|--------|-----|--------|-------------|--------|
| TR-round-state-001 | design/gdd/round-state.md | Round State | Round State alone owns current index, decisions and summary | Core |
| TR-round-state-004 (provisional) | design/gdd/round-state.md | Round State | Reject stale/non-current decisions without mutation | Core |
## System Layer Map
KEEP-LAYERS: Content Foundation; Round State Core; Presentation Presentation; browser/OS external Platform.
## Module Ownership
KEEP-OWNERSHIP: Content immutable definitions; Round State mutable round data; Presentation display only.
## Data Flow
Old draft: initialization and command/result flow have not yet been documented.
## API Boundaries
KEEP-API: pure command result and snapshot values; no browser bindings selected.
## ADR Audit
KEEP-AUDIT: ADR-0001 Accepted; ADR-0002 Proposed. Full current coverage has not been rechecked.
## Required ADRs
KEEP-REQUIRED: finish browser bindings before implementing Presentation.
## Architecture Principles
KEEP-PRINCIPLES: single owner, immutable inputs, no hidden callbacks.
## Open Questions
KEEP-QUESTIONS: browser integration is unverified.
## Owner Notes
KEEP-NOTES: update only explicitly chosen sections.
`;
const recovery = `# Existing recovery
KEEP-RECOVERY-BEFORE
<!-- CHECKPOINT -->
**Current task:** Architecture blueprint
**Constraints:** Preserve agreed ownership and Content IDs.
**Open questions:** Concrete browser integration remains unverified.
<!-- /CHECKPOINT -->
KEEP-RECOVERY-AFTER
`;
const architecture = 'docs/architecture/architecture.md';
const checkpoint = 'production/session-state/active.md';
const project = (workflow = 'full', review = 'solo', extra = {}) => ({
  'project.yaml': settings(workflow, review), 'production/stage.txt': 'Technical Setup\n',
  ...engine, 'docs/technical-preferences.md': preferences,
  'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index,
  'design/gdd/content.md': contentGdd, 'design/gdd/round-state.md': stateGdd,
  'design/gdd/presentation.md': presentationGdd,
  'docs/architecture/adr-0001-pure-round.md': adr, 'docs/architecture/adr-0002-browser-bindings.md': proposedAdr,
  ...extra,
});
const boundary = 'Work offline using the installed toolkit. Preserve game code, source design documents, ADRs, registry files, settings, stage and unrelated files. Do not install packages, commit, publish, implement the game or run downstream workflows. Synthetic reference material only supports a draft with browser integration explicitly unverified. Do not change settled decisions or silently accept new review concerns; return unresolved choices to me.';
const authority = 'The concept contains my settled technical choices. I authorize the requested architecture content, incremental recovery checkpoints, and honest recording of actual review or skipped/unavailable status. Preserve unknowns and stop after this document task.';
const create = (workflow, review, request, inputs = {}) => ({sandbox:'workspace-write',expectedFiles:[architecture,checkpoint],saveCheckpoint:true,minimumCheckpoints:workflow === 'full' ? 6 : 3,inputs:project(workflow,review,inputs),request:`${request} ${authority} ${boundary}`});
const readonly = (inputs, request) => ({sandbox:'read-only',expectedFiles:[],inputs,request:`${request} ${boundary}`});
export const createArchitectureScenarios = {
  'standard-guided': create('standard','solo','Create the required standard-workflow master architecture for Parcel Counter from the approved design.'),
  'full-solo': create('full','solo','Create the complete master architecture, including ownership, all relevant flows, public contracts and ADR coverage.'),
  'full-native': create('full','full','Create the complete master architecture and obtain its configured post-write reviews.'),
  'roles-unavailable': {...create('full','full','Create the complete master architecture and attempt the configured post-write reviews using available native roles.'),removeRoles:['technical-director','lead-programmer']},
  'lean-override': create('full','full','Create the complete architecture with --review lean for this run only.'),
  'registry-rerun': {sandbox:'workspace-write',expectedFiles:[],allowedChanges:[architecture,checkpoint],saveCheckpoint:true,minimumCheckpoints:6,
    inputs:project('full','solo',{[architecture]:existing,[checkpoint]:recovery,'docs/architecture/tr-registry.yaml':registry}),
    request:`Explicitly rewrite the existing master architecture from the current source designs while preserving valid established requirement identities and prior owner decisions. ${authority} ${boundary}`},
  'focus-data-flow': {sandbox:'workspace-write',expectedFiles:[],allowedChanges:[architecture,checkpoint],saveCheckpoint:true,minimumCheckpoints:2,
    inputs:project('full','solo',{[architecture]:existing,[checkpoint]:recovery,'docs/architecture/tr-registry.yaml':registry}),
    request:`Update only Data Flow in the existing architecture, with the necessary version/date and current sign-off metadata. Preserve every other section and recovery narrative exactly; record any newly observed baseline differences without rewriting that section. ${authority} ${boundary}`},
  'legacy-gdd': create('full','solo','Create the complete architecture from every design document, including the older unstructured document.',{
    'design/gdd/round-history.md':'# Historical rule note\nThis is an old-format design record. Round State does not retain decisions after Reset; there is no cross-session history and no serialized save. Presentation must never treat a prior-round snapshot as authority to alter the current round.\n',
  }),
  minimal: {sandbox:'workspace-write',expectedFiles:[architecture,checkpoint],saveCheckpoint:true,minimumCheckpoints:3,
    inputs:{'project.yaml':settings('minimal','solo'),'production/stage.txt':'Technical Setup\n',...engine,'docs/technical-preferences.md':preferences,'design/game-brief.md':brief},
    request:`Voluntarily create a small architecture from the approved brief: requirements baseline, layer map and critical decisions are sufficient. Do not add a concept or systems index. ${authority} ${boundary}`},
  'missing-index': readonly(Object.fromEntries(Object.entries(project('standard')).filter(([p])=>p!=='design/gdd/systems-index.md')),'Help create the architecture; inspect prerequisites first, and remain read-only until its source design is ready.'),
  'placeholder-index': readonly(project('standard','solo',{'design/gdd/systems-index.md':'# Systems Index\n[To be populated]\n'}),'Help create the architecture; inspect whether the design inputs are ready before drafting. Remain read-only.'),
  'missing-engine': readonly(project('full','solo',{'project.yaml':'project:\n  name: Parcel Counter\n  stage: Technical Setup\nmodes:\n  workflow: full\n  review_mode: solo\n  automation: guided\n'}),'Prepare to create the architecture, but remain read-only until its target engine is established.'),
  'focus-no-target': readonly(project('full'),'Run create-architecture layers. I have not yet agreed to a whole new architecture; explain the applicable next step without writes.'),
  'declined-write': readonly(project('full'),'Review the prerequisites for creating the architecture, but I decline authoring, checkpoints and document creation for now. Explain how to resume.'),
  negative: readonly({'project.yaml':settings(),'production/stage.txt':'Technical Setup\n','src/count.js':'export const increment = count => count - 1;\n'},'Read src/count.js and explain why increment(3) is 2. Answer only; no architecture planning or document authoring.'),
};
