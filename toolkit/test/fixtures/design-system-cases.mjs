const config = (workflow = 'standard', review = 'solo', extra = '') => `project:
  name: Parcel Counter
  stage: Systems Design
modes:
  rigor: minimal
  workflow: ${workflow}
  review_mode: ${review}
  automation: guided
docs:
  density: terse
engine:
  name: Web
  version: "2026"
team:
  size: individual
${extra}`;
const decisions = `Round State is the sole mutable owner of current index, accepted/returned decisions and final summary. Content provides exactly five immutable uniquely identified parcels. Begin at index 0 with no decisions. A decision is accepted only in Reviewing state for the currently displayed parcel ID; stale IDs and duplicate submissions do nothing and return a rejected-command result. Accept or Return adds that decision once, then increments index by 1. For indexes 0 through 4 show that parcel; after the fifth decision enter Complete, expose accepted and returned counts and no current parcel. Reset in either state clears only Round State and returns to index 0, without mutating Content. Content definitions are immutable; Presentation consumes snapshots and submits commands, with no callback from Round State. No random content, scoring, timers, persistence, currencies, networking, effects or other mechanics. Invalid external content (not five unique parcels) produces an unavailable-round result before start and never silently edits content. Command order is the order received; no simultaneous/parallel processing is introduced. All counts are integers. Five parcels is an approved authored-scope constant, not a designer-adjustable runtime knob. Core behavior is pure and engine-independent; engine integration remains unverified.`;
const concept = `# Parcel Counter
## Core loop
Read a parcel, choose Accept or Return, see the result, continue through five parcels, then see a summary and reset.
## Pillars
- Legible choices: every choice has a clear visible result.
- Gentle correction: the untimed round offers a fresh reset without punishment.
- Small authored scope: exactly five deterministic parcels and a single screen.
## MDA aesthetics
Sensation of calm order and completion, expressed through legible progress and a complete short round. No pressure, reflex challenge or competition.
## Round State decisions
${decisions}
## Later work
Content owns parcel definitions. Presentation owns all visual/audio/UI feedback; this task defines Round State behavior, not those implementations. No performance budget or measured playtest result exists.
`;
const brief = `# Parcel Counter brief
## Pitch
Accept or return five parcels and see a clear summary, then reset.
## What they feel
Calm satisfaction from finishing one short, legible round without time pressure.
## Build order
1. Content supplies immutable parcels.
2. Round State owns progression and summary.
3. Presentation displays snapshots and sends commands.
## Approved Round State behavior
${decisions}
`;
const index = `# Systems Index: Parcel Counter
> **Status**: Under Review
> **Created**: 2026-11-10
## Overview
Three approved owners. KEEP-INDEX-NOTE: presentation polish is separate work.
## Systems Enumeration
| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Content | Core | MVP | Approved | design/gdd/content.md | — |
| 2 | Round State | Core | MVP | Not Started | — | Content |
| 3 | Presentation | UI | MVP | Not Started | — | Round State |
## Recommended Design Order
| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Content | MVP | Foundation | — | Unknown |
| 2 | Round State | MVP | Feature | — | Unknown |
| 3 | Presentation | MVP | Presentation | — | Unknown |
## Progress Tracker
| Metric | Count |
|--------|-------|
| Total systems identified | 3 |
| Design docs started | 1 |
| Design docs reviewed | 1 |
| Design docs approved | 1 |
| MVP systems designed | 1/3 |
`;
const contentGdd = `# Content
> **Status**: Approved
## 1. Overview
KEEP-CONTENT: owns the five immutable parcel definitions.
## 4. Formulas
No calculations. Exact dataset is five unique IDs: p1, p2, p3, p4, p5.
## 5. Edge Cases
If a consumer tries to mutate a definition, refuse it; authoring content is not runtime state.
## 6. Dependencies
Round State consumes a read-only ordered parcel array and must preserve each ID. Content never reads Round State or Presentation.
## 7. Tuning Knobs
None. The five-item dataset is authored scope, not a runtime knob.
`;
const partial = `# Round State
> **Status**: In Design
> **Author**: Owner
> **Last Updated**: 2026-11-10
## Summary
[To be designed]
## Overview
KEEP-OVERVIEW: Round State owns a five-parcel round and exposes progression and summary to Presentation.
## Detailed Design
### Core Rules
${decisions}
### States and Transitions
Reviewing accepts one decision for current ID; after five decisions it becomes Complete. Reset from either state returns to Reviewing. Invalid content is Unavailable until corrected outside this system.
### Interactions with Other Systems
Content provides the read-only parcel array. Presentation sends commands and consumes snapshots; it never owns round state.
## Formulas
The next_index formula is defined as:
\`next_index = min(5, current_index + 1)\` for one valid current-parcel decision only.
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| current_index | int | 0–4 | calculated | Current parcel before a valid decision |
| round_length | int | 5 | constant | Approved authored scope |
Output Range: 1 to 5. Example: index 4 becomes 5 and Complete.
Accepted and returned counts are the sizes of their respective subsets of the recorded decisions; their sum equals the index. Invalid/stale/duplicate commands leave every value unchanged.
## Edge Cases
[To be designed]
## Dependencies

## Acceptance Criteria
[To be designed]
## Owner Notes
KEEP-OWNER-NOTES: no change to the already agreed behavior or formulas.
`;
const checkpoint = `# Recovery narrative
KEEP-RECOVERY-BEFORE
<!-- CHECKPOINT -->
**Current task:** Round State GDD
**Completed sections:** Overview, Detailed Design, Formulas
**Open questions:** KEEP-OPEN: no engine API feasibility has been verified.
**Constraints:** Preserve Content IDs and the owner's completed sections.
<!-- /CHECKPOINT -->
KEEP-RECOVERY-AFTER
`;
const registry = `# Registry owner note: KEEP-REGISTRY-NOTE.
# Example only: name: gold_carry_limit, value: 9999; not a live entry.
version: 1
last_updated: "2026-11-10"
entities: []
items: []
formulas: []
constants:
  - name: round_length
    status: active
    source: design/gdd/content.md
    referenced_by: []
    value: 5
    unit: parcels
    added: "2026-11-10"
    revised: ""
`;
const base = (workflow, review, files = {}, extra = '') => ({ 'project.yaml': config(workflow, review, extra), 'production/stage.txt': 'Systems Design\n', ...files });
const standardFiles = { 'design/gdd/game-concept.md': concept, 'design/gdd/systems-index.md': index, 'design/gdd/content.md': contentGdd };
const boundary = 'Work offline using the installed toolkit. Preserve unrelated files and all game code, Content GDD, settings and stage. Do not install packages, commit, publish or begin independent review. Stop after the requested document work; do not implement it.';
const writeScope = 'The supplied behavior, dependencies and creative direction are approved. Use these decisions without adding mechanics. I authorize this GDD and incremental recovery checkpoints, and updating only its existing systems-index row/link plus accurate progress counts after completion. Leave the entity registry unchanged; report any candidates for later. For the optional template extras, write Cross-References and Open Questions; leave unrelated optional additions for later.';
const newFiles = ['design/gdd/round-state.md', 'production/session-state/active.md'];
export const designSystemScenarios = {
  'standard-guided': { sandbox: 'workspace-write', expectedFiles: newFiles, allowedChanges: ['design/gdd/systems-index.md'], saveCheckpoint: true, minimumCheckpoints: 8,
    inputs: base('standard', 'solo', standardFiles), request: `Write the Round State system GDD section by section from the supplied concept and dependency contract. ${writeScope} ${boundary}` },
  'minimal': { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true, minimumCheckpoints: 7,
    inputs: base('minimal', 'solo', { 'design/game-brief.md': brief }),
    request: `Voluntarily write a small Round State GDD from this approved brief while keeping minimal workflow. The stated rules and interfaces are settled. I authorize its required content and incremental recovery checkpoints. Do not add optional template sections or create a systems index or registry; the brief is sufficient. ${boundary}` },
  'minimal-override': { sandbox: 'workspace-write', expectedFiles: newFiles, saveCheckpoint: true, minimumCheckpoints: 8,
    inputs: base('minimal', 'solo', { 'design/game-brief.md': brief }, 'workflow_overrides:\n  system_overrides:\n    round-state: standard\n'),
    request: `Author Round State from the approved brief using its effective per-system workflow setting. The stated rules and interfaces are settled. I authorize its required content and incremental recovery checkpoints. Leave optional extras for later and do not create an index or registry. ${boundary}` },
  retrofit: { sandbox: 'workspace-write', expectedFiles: [], allowedChanges: ['design/gdd/round-state.md', 'production/session-state/active.md', 'design/gdd/systems-index.md'], saveCheckpoint: true, minimumCheckpoints: 4,
    inputs: base('standard', 'lean', { ...standardFiles, 'design/gdd/round-state.md': partial, 'production/session-state/active.md': checkpoint }),
    request: `Retrofit design/gdd/round-state.md: fill the missing required sections and Summary using the existing agreed behavior. Preserve every complete section and owner note exactly. I authorize those writes, incremental recovery checkpoints preserving surrounding notes, and the target index row/link and counts. Keep existing incomplete-engine findings visible. Do not add optional sections or change the registry. ${boundary}` },
  'registry-retrofit': { sandbox: 'workspace-write', expectedFiles: [], allowedChanges: ['design/gdd/round-state.md', 'production/session-state/active.md', 'design/gdd/systems-index.md', 'design/registry/entities.yaml'], saveCheckpoint: true, minimumCheckpoints: 4,
    inputs: base('standard', 'lean', { ...standardFiles, 'design/gdd/round-state.md': partial, 'production/session-state/active.md': checkpoint, 'design/registry/entities.yaml': registry }),
    request: `Retrofit Round State's missing required sections and Summary from the existing agreed design. Preserve complete sections and notes. I authorize those writes, incremental recovery checkpoints and its index row/link/counts. Also register this GDD's reference to the existing shared round_length fact; preserve the authoritative source, value and other registry content. Do not add other registry facts or optional GDD sections. ${boundary}` },
  'registry-conflict': { sandbox: 'read-only', expectedFiles: [],
    inputs: base('standard', 'full', { ...standardFiles, 'design/registry/entities.yaml': registry }),
    request: `Help me design Round State, but I am considering a seven-parcel round instead of the previous count. Inspect its dependencies and existing shared facts first, explain any decision that needs to be resolved, and do not write or treat this proposal as approved. ${boundary}` },
  'full-lenses': { sandbox: 'workspace-write', expectedFiles: newFiles, allowedChanges: ['design/gdd/systems-index.md'], saveCheckpoint: true, minimumCheckpoints: 10, timeoutMs: 1200000,
    inputs: base('full', 'full', standardFiles),
    request: `Author the full Round State GDD from the approved concept and dependency contract, including the creative-director perspective on alignment. ${writeScope} Preserve unknowns honestly and leave any new consequential design choice for my decision. ${boundary}` },
  missing: { sandbox: 'read-only', expectedFiles: [], inputs: base('standard', 'solo'),
    request: `Help me design the Round State game system. No concept or systems index has been supplied yet; read-only until the required context is available. ${boundary}` },
  'declined-skeleton': { sandbox: 'read-only', expectedFiles: [], inputs: base('standard', 'solo', standardFiles),
    request: `Prepare to author Round State from the concept, but I decline creating its skeleton or any document now. Explain what is needed to resume; do not proceed into drafting the GDD. ${boundary}` },
  negative: { sandbox: 'read-only', expectedFiles: [], inputs: base('standard', 'solo', { 'src/count.js': 'export const increment = count => count - 1;\n' }),
    request: `Read src/count.js and explain why increment(3) returns 2. Answer only; no game planning or document authoring. ${boundary}` },
};
