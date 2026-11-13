# Author each section from decisions and contracts

Walk required sections in their template order. Read the relevant section of
`studio/templates/guidance/game-design-document-guide.md` through `resource path`
as needed, not the whole guide for every section. Preserve its tables. Use this
cycle for each section, including later revisions:

1. State the section's purpose and already-known dependency constraints.
2. Ask for missing consequential design choices; show 2–4 meaningful alternatives
   with trade-offs when needed. Reuse settled decisions instead of asking again.
3. Apply the local lenses below when review mode calls for them. Label each view
   as an author-applied lens, not a consulted agent. Surface conflicts for the
   owner's decision before treating a contested choice as settled.
4. Draft within the chosen direction and mark provisional interfaces/assumptions.
   Collaborative mode shows the draft and Approve/write, make changes or start
   over choices together. Guided mode writes after agreed key decisions with a
   brief explanation; autonomous mode records the actual assumption/provenance.
5. Write that section with a heading-anchored edit and verify the saved content.
   For Detailed Design and Formulas, immediately compare named entities/items,
   formulas and numeric constants with live registry facts. A changed owned value
   is a conflict, not a new entry; surface it before starting the next section.
6. Save recovery progress using [persistence](3-persistence.md), listing actual
   completed sections. Never fabricate approval or silently rewrite dependencies.

Every skipped lens is named with its effective review mode. “Not applied — solo”
means no specialist view was taken, not that an independent agent approved it.

| Section | Full | Lean | Solo |
| --- | --- | --- | --- |
| Player Fantasy | Creative lens | Skip | Skip |
| Detailed Design | Routing-table lenses | Skip | Skip |
| Formulas | Systems lens, plus costs where relevant | Same | Skip |
| Edge Cases | Systems lens; narrative lens for narrative systems | Skip | Skip |
| Tuning Knobs | Systems lens for complex formulas | Apply if knobs interact | Skip |
| Acceptance Criteria | QA lens | QA lens | Skip |
| Visual/Audio | Art lens | Apply when feedback is central to Gameplay/UI interaction | Skip |

There is **no agent spawn** in any cell, including full review.

## A — Overview

Explain what the system does, player interaction and why the game needs it. Category
wins over layer for framing: Gameplay/UI/Audio/Narrative use player-facing plus data
framing; Core/Persistence/Meta emphasize infrastructure; Economy/Progression combine
both. Cite a relevant existing ADR when its GDD Requirements cover this system;
otherwise keep design-level framing. Foundation infrastructure may express its
indirect player benefit instead of inventing a direct fantasy.

In collaborative mode present framing (technical/player/both), ADR citation
(yes/no) and direct fantasy (yes/no) before drafting, with these recommendations.
In guided/autonomous modes these are minor framing choices: state the grounded
recommendation and proceed unless the user has supplied a different preference.
Check the overview against the index's responsibility. Implementation-pattern
questions belong in future architecture-decision work; they do not select a
singleton/event bus/save backend here.

## B — Player Fantasy

When required, establish the emotion, specific player moment and relevant reference
mechanic. Gameplay/UI/Audio/Narrative lean direct, Core/Persistence/Meta indirect,
Economy/Progression both; category still wins over layer. Collaborative mode asks
which framing; other modes may reuse the grounded framing choice. Quote the actual
pillar, or brief pitch/intended feeling, without manufacturing a formal pillar.

In full mode read [creative lens](lens-creative-director.md) before drafting and
show 2–3 candidate framings, each tied to one player moment, quoted direction and
what it demands of the design. A new emotional/creative direction remains an owner
decision. A framing against a pillar is a conflict, not an invisible style edit.

## C — Detailed Design

Specify Core Rules, every state/valid transition, and Interactions with Other
Systems. Walk the normal use, player choices and prohibited actions. State inputs,
outputs and ownership for upstream and downstream contracts. The guide's state
table retains State / Entry Condition / Exit Condition / Behavior. Rules must be
implementable without silently filling design gaps; open gaps remain questions.

In full mode read [specialist lenses and routing](lens-specialists.md). Resolve the
category then actual system type, and show one short named block per primary and
supporting lens before drafting. Union roles when two types genuinely fit. Present
both sides of a disagreement about feel, feasibility, pillar or dependency; do not
settle it implicitly in the draft. Registry values and dependency interfaces are
constraints, not numbers to reinvent.

## D — Formulas

Use this structure for every formula, including terse documentation:

```text
The [formula_name] formula is defined as:
`[formula_name] = [expression]`

Variables:
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| [name] | float/int | [min–max] | data file / calculated / constant | [meaning] |

Output Range: [min] to [max] under normal play; [behavior at extremes]
Example: [worked example with real numbers]
```

Keep these exact columns; Source distinguishes an external tuning value from a
calculated value or deliberate constant. Explain why proposed values/curves serve
the agreed goal. Connect dependency outputs by name instead of duplicating their
formula or owner. Do not replace math with “TBD” or prose-only assertions.

Outside solo, read [systems lens](lens-systems-designer.md) before proposing values.
Work every variable at minimum, maximum and zero; show undefined/division-by-zero,
negative/unbounded or inert-knob cases and agree their bounds. For costs/rewards,
check progression affordability, faucets/sinks and dominant equal-price choices.
Proposals remain estimates/design decisions, not measured balance or playtest proof.

## E — Edge Cases

Use **If [condition]: [exact outcome]**, with rationale when non-obvious. Cover zero,
maximum, out-of-range inputs, simultaneous events/tiebreaks, dependency floors/caps
and degenerate/unbounded strategies. “Handle appropriately” is not a resolution.
In full mode re-read saved C/D and apply the systems lens; narrative systems also
use the narrative lens. Resolve additions with the appropriate decision cadence.
An unresolved case is an owned open question, not a completed rule.

## F — Dependencies

Use the guide's System / Direction / Nature of Dependency table. State interfaces,
hard versus soft requirements, inputs/outputs and ownership. Compare both sides:
if this GDD depends on Combat, a missing reciprocal declaration is a finding for
that owner. Do not modify another GDD just to make the table look consistent.
Undesigned interfaces remain explicitly provisional.

## G — Tuning Knobs

Derive adjustable values from Formulas: `data file` values are knobs; deliberate
constants are not. Keep Parameter / Current Value / Safe Range / Effect of Increase /
Effect of Decrease, name interactions in both affected rows, and reference a
knob's existing owner rather than duplicate it. Apply the systems lens under the
mode table above; solo still derives the values without claiming specialist input.

## H — Acceptance Criteria

Use **GIVEN [setup], WHEN [action], THEN [measurable outcome]**: at least one per
core rule and formula, plus significant edge and cross-system cases. Include
normal and boundary values. A tester must understand the setup without reading
all prose; distinguish automated logic tests from visual/playtest observations.
Performance targets need supplied or explicitly agreed budgets, not invented ones.

Outside solo, read [QA lens](lens-qa-lead.md), re-read saved C/D/E, and expose missing
coverage or untestable claims. Do not alter a rule merely to make it easier to test.
If Formulas was legitimately omitted, state that criteria cover rules alone. At
**standard**, a numeric rule discovered here requires Formulas before finishing;
at **minimal**, keep that value explicit in Core Rules without adding Formulas.
Full already requires it. This rule must not silently raise minimal workflow.

## Template extras

These are separate from the core tier count. At standard/full:

- Visual/Audio is required for Gameplay, UI, Narrative and Audio; optional for
  Core, Progression, Economy, Persistence and Meta. Apply the art lens according
  to the mode table, reading art-bible sections 1–4 if present. Map actual events
  to visual/audio feedback, style/animation constraints and applicable principles.
  Missing art bible is an explicit gap, not invented visual policy.
- Game Feel is required for Gameplay/UI and optional elsewhere. Use the guide's
  six parts: specific reference moment, input-to-response latency targets,
  animation startup/active/recovery targets, impact moments, weight/responsiveness
  profile and feel acceptance questions. Mark inapplicable physical/animation
  effects as such; do not add mechanics just to populate a table. Targets and
  future subjective observations are not measured timing or human acceptance.
- Cross-References is required when another GDD's rule/value/mechanic is referenced.
  Keep This Document References / Target GDD / Specific Element Referenced / Nature,
  Classify Nature by the actual relationship: Data dependency consumes another
  owner's output; State trigger reacts to its state change; Rule dependency relies
  on its rule remaining true; Ownership handoff transfers authority over a value.
  Reading immutable data or restating existing owners is not an ownership transfer.
  With no references, write an explicit none statement rather than a placeholder.

At minimal all extras are optional, including feedback/feel/cross-reference sections.
Offer only still-optional outstanding sections: all; Cross-References/open questions;
or leave for later. Do not offer skipping a required section. Recommend all when
there are dependencies, UI or player feedback; otherwise Cross-References/questions.
Reuse prior scope selection; don't expand a request to only the core five sections.
Optional sections left for later remain visibly unassessed, not completed.

UI Requirements uses Information / Display Location / Update Frequency / Condition;
complex UI may use the local UX lens without delegation. After writing real UI
requirements, flag later UX specs in Pre-Production before epics, with future stories
citing `design/ux/<screen>.md`. No UI flag for an absent-UI note. After real
Visual/Audio requirements, flag later asset-spec work after art-bible approval.
Check availability before naming either as an installed Skill. If an authorized
index update follows, retain the UX note without changing its schema.

Open Questions records actual unresolved issues, owners and resolution dates where
known; unknown dates remain TBD rather than fabricated commitments.
