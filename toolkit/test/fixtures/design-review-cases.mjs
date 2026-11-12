const config = (workflow = 'full', review = 'lean') => `project:\n  name: Lantern Rules\n  stage: Systems Design\nmodes:\n  rigor: minimal\n  workflow: ${workflow}\n  review_mode: ${review}\n  automation: guided\ndocs:\n  density: balanced\nengine:\n  name: Web\nteam:\n  size: individual\n`;
const target = 'design/gdd/resolve-hit.md';
const log = 'design/gdd/reviews/resolve-hit-review-log.md';
const concept = '# Lantern Rules\nA small deterministic training duel. A hit reduces the defender’s health; negative health and healing from damage are forbidden. The intended feeling is a predictable consequence from a stated rule. No economy, progression, multiplayer or random damage. Presentation is outside this review.\n';
const complete = `# Resolve Hit
## Overview
Resolve one supplied hit against a defender with integer health. This document owns the pure hit calculation only; callers own event timing, entities, display and persistence. It has no hidden state.
## Player Fantasy
A stated hit has a predictable consequence; the player can reason about exactly how much health remains.
## Detailed Design
Input health H and incoming damage D are integers in the inclusive range 0 through 9007199254740991 (the exact safe-integer range for this Web target). Invalid, non-finite, fractional, negative or out-of-range values are rejected with an invalid-input result and no state change. For valid inputs return remaining health R and actual loss L. This operation does not mutate either input or any external state. The caller supplies all values and applies the returned result once. No defense, resistance, healing, random factor or immunity exists in this scope.
## Formulas
R = max(0, H - D). L = H - R. H and D are nonnegative integers measured in health points; R and L use the same unit. Thus 0 <= R <= H and 0 <= L <= H. H=10,D=3 gives R=7,L=3; H=2,D=5 gives R=0,L=2. H=0 or D=0 is defined by the same formulas. Arithmetic must preserve exact integer results in the supported engine numeric range; values outside that range are invalid input.
## Edge Cases
Reject negative, fractional, non-finite and unsupported-range values without mutation. Zero health remains zero. Zero damage preserves health. Damage greater than health clamps the remaining value to zero. Repeated calls do not remember prior calls and are deterministic for identical supplied inputs.
## Dependencies
None. This is a self-contained pure rule and does not define caller timing, rendering, storage, enemy stats or other systems.
## Tuning Knobs
No internal tunable constants. Callers supply H and D within the specified validation contract; this system does not choose their gameplay values.
## Acceptance Criteria
- With H=10 and D=3, return R=7 and L=3 without mutating supplied data.
- With H=2 and D=5, return R=0 and L=2.
- With H=0,D=5 return R=0,L=0; with H=10,D=0 return R=10,L=0.
- Reject negative, fractional, non-finite or unsupported-range input without a result or side effect.
- For valid inputs, R and L are nonnegative integers, R+L=H, and identical input calls return identical results.
`;
const clarified = complete.replace('are rejected with an invalid-input result and no state change.', 'return an object with status "invalid-input", no R or L fields, and no state change.').replace('without a result or side effect.', 'with the invalid-input result, no R/L payload and no side effect.');
const partial = '# Resolve Hit\n## Overview\nA supplied hit reduces defender health.\n## Player Fantasy\nPredictable consequences.\n## Detailed Rules\nReturn remaining health after subtracting incoming damage, clamped to zero.\n## Dependencies\nNone.\n';
const numeric = '# Oxygen\nCategory: UI\n## Overview\nOxygen drains while a valve is held open.\n## Detailed Design\nDrain 2 oxygen per second. Refilling costs 50 credits.\n## Edge Cases\nAt zero oxygen close the valve.\n## Dependencies\nNone.\n## Acceptance Criteria\n- Feels good.\n- Works correctly.\n';
const brief = '# Lantern Rules brief\nA small predictable hit calculation, with no random factors. This is a voluntary design review and does not expand the game.\n';
const index = '# Systems Index\n## Systems Enumeration\n| # | System Name | Category | Priority | Status | Design Doc | Depends On |\n|---|---|---|---|---|---|---|\n| 1 | Resolve Hit | Gameplay | MVP | In Review | resolve-hit.md | — |\n| 2 | Combat Display | UI | MVP | Not Started | — | Resolve Hit |\n## Recommended Design Order\n| Order | System | Priority | Layer | Agent(s) | Est. Effort |\n|---|---|---|---|---|---|\n| 1 | Resolve Hit | MVP | Core | — | S |\n| 2 | Combat Display | MVP | Presentation | — | Unknown |\n## Owner Notes\nKEEP-INDEX-NOTE\n';
const registry = 'entities:\n  - name: goblin_scout\n    source: design/gdd/enemies.md\n    health: 12\n    referenced_by:\n      - design/gdd/resolve-hit.md\n';
const base = (workflow = 'full', review = 'lean', extra = {}) => ({ 'project.yaml': config(workflow, review), 'production/stage.txt': 'Systems Design\n', 'design/gdd/game-concept.md': concept, [target]: complete, ...extra });
const boundary = 'Use the installed toolkit. Work offline; do not install packages, change settings or stage, implement game code, save a checkpoint, commit or publish. Preserve unrelated files. Stop after this review and any explicitly authorized tracking records; do not begin another workflow.';
const readonly = `Review only, read-only: do not revise the GDD or update tracking. ${boundary}`;

export const designReviewScenarios = {
  'complete-records': { expectedFiles: [log], allowedChanges: ['design/gdd/systems-index.md'], inputs: base('full', 'lean', { 'design/gdd/systems-index.md': index }),
    request: `Review ${target} before implementation. After presenting the result, I authorize updating only its existing systems-index status to match that result and appending its review entry with evidence; do not edit the GDD or other rows. ${boundary}` },
  'complete-records-clear': { expectedFiles: [log], allowedChanges: ['design/gdd/systems-index.md'], inputs: base('full', 'lean', { 'design/gdd/systems-index.md': index, [target]: clarified }),
    request: `Review ${target} before implementation. After presenting the result, I authorize updating only its existing systems-index status to match that result and appending its review entry with evidence; do not edit the GDD or other rows. ${boundary}` },
  incomplete: { expectedFiles: [], inputs: base('full', 'solo', { [target]: partial }), request: `Review ${target}. ${readonly}` },
  'numeric-standard': { expectedFiles: [], inputs: base('standard', 'full', { [target]: numeric }), request: `Review ${target} --depth lean. ${readonly}` },
  missing: { expectedFiles: [], inputs: { 'project.yaml': config('full', 'lean'), 'production/stage.txt': 'Systems Design\n' }, request: `Review design/gdd/missing.md. ${readonly}` },
  minimal: { expectedFiles: [], inputs: { 'project.yaml': config('minimal', 'solo'), 'production/stage.txt': 'Systems Design\n', 'design/game-brief.md': brief, [target]: '# Resolve Hit\n## Overview\nA nonrandom hit calculation will be designed later.\n' }, request: `I voluntarily want a review of ${target} while keeping minimal workflow. ${readonly}` },
  'registry-conflict': { expectedFiles: [], inputs: base('standard', 'solo', { 'design/registry/entities.yaml': registry, [target]: complete + '\n## Enemy Catalogue\nThe goblin scout has health 20 in the tutorial room.\n' }), request: `Review ${target}. ${readonly}` },
  'full-missing-role': { expectedFiles: [], removeRoles: ['game-designer'], inputs: base('full', 'full', { [target]: clarified }), timeoutMs: 900000,
    request: `Review ${target} using the configured review mode. ${readonly}` },
  reuse: { expectedFiles: [], receipt: { mode: 'lean', workflow: 'full', verdict: 'APPROVED', scopeSignal: 'M' }, completeReceipt: true, inputs: base('full', 'lean', { [target]: clarified }), request: `Review ${target} before implementation. ${readonly}` },
  'receipt-gap': { expectedFiles: [], receipt: { mode: 'solo', workflow: 'standard', verdict: 'APPROVED' }, incompleteLatestReceipt: true, inputs: base('full', 'lean'), request: `Review ${target} before implementation. ${readonly}` },
  'deeper-review': { expectedFiles: [], receipt: { mode: 'solo', workflow: 'standard', verdict: 'APPROVED', scopeSignal: 'M' }, completeReceipt: true, inputs: base('full', 'lean', { [target]: clarified }), request: `Review ${target} before implementation. ${readonly}` },
  'context-changed': { expectedFiles: [], receipt: { mode: 'lean', workflow: 'full', verdict: 'APPROVED', scopeSignal: 'M' }, completeReceipt: true, inputs: base('full', 'lean', { 'design/registry/entities.yaml': registry.replace('health: 12', 'health: 20'), [target]: clarified + '\n## Worked Registry Example\nThe registry supplies goblin scout health 20 as H. With D=3, return R=17 and L=3. This example references the external value without assigning ownership to Resolve Hit.\n' }),
    afterReceipt: { 'design/registry/entities.yaml': registry }, request: `Review ${target} before implementation. ${readonly}` },
  'system-override': { expectedFiles: [], inputs: base('minimal', 'solo', { 'project.yaml': config('minimal', 'solo') + 'workflow_overrides:\n  system_overrides:\n    resolve-hit: full\n', [target]: partial }), request: `Review ${target}. ${readonly}` },
  negative: { expectedFiles: [], inputs: base('full', 'full', { 'src/score.js': 'export const addScore = (score, points) => score - points;\n' }), request: `Read src/score.js and explain why adding five points to ten yields five. Answer only, no design-document review. ${boundary}` },
};
