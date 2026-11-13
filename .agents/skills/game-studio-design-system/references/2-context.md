# Read the design constraints

Gather applicable evidence before asking design questions. Use headings and
section ranges rather than loading every GDD. Read the target GDD in enough detail
to preserve completed work and its decisions.

## Project evidence

- On a **minimal project**, read `design/game-brief.md`, even when this system's
  effective tier is standard/full. Do not require a concept or index that the
  project never needed. Infer Category from the system's responsibilities using
  Core, Gameplay, Progression, Economy, Persistence, UI, Audio, Narrative or Meta;
  Layer is Foundation when other systems depend on it, otherwise Feature; Priority
  is MVP when listed in the brief's build order, otherwise Post-MVP. Mark these
  values inferred in the Summary Quick reference. Do not create an index to hold
  them. If an existing index supplies the same system, distinguish its explicit
  facts from brief-derived assumptions rather than silently replacing them.
- On **standard/full projects**, require `design/gdd/game-concept.md` and
  `design/gdd/systems-index.md`. Name missing prerequisites and recommend the
  relevant installed brainstorm/map-systems workflow; write nothing by guessing
  their contents. Read the target row, category, layer, priority and design order.
- Read separate `design/gdd/game-pillars.md` if present. Preserve quoted pillars
  and actual MDA aesthetics; a brief supplies pitch/intended feeling, not invented
  formal pillars. Read `docs/consistency-failures.md` for this domain's recorded
  failure patterns and surface relevant patterns in the context summary.
- If `design/registry/entities.yaml` exists, use the shared registry reader to
  obtain whole live entries owned by or referencing the target, plus entries
  relevant to its explicit dependencies. Registry values and source ownership
  are known facts, not suggestions to quietly change. Read the
  [registry contract](registry.md) for commands, comment handling and conflicts.

## Dependency contracts

Identify upstream systems this one depends on and downstream consumers that depend
on it. For each existing dependency GDD, read Dependencies, Formulas, Edge Cases
and Tuning Knobs by section, matching numbered headings as well as plain ones:
`^## ([0-9]+\. )?(Dependencies|Formulas|Edge Cases|Tuning Knobs)`.
Read the entire matched section, not an arbitrary 20-line truncation. Extract
interfaces/data direction, consumed outputs, floors/caps, simultaneous-event rules
and shared knobs. Use the registry first and sections to fill its gaps. Do not
read every sibling GDD merely because it may be thematically related; a known
overlap becomes an explicit dependency.

Warn about undesigned dependencies and offer designing them first or continuing
with an explicitly provisional interface. Neither a filename nor an index status
alone proves its contents. Preserve approved contracts; an incompatible proposal
is a decision for its owner. Bidirectional documentation gaps are findings, not
authorization to edit the dependency.

## Engine feasibility

Resolve engine name/version independently through
`node .game-studio/run.cjs config get engine_values --json`; the CLI reports actual
project/technical-preference provenance. `node .game-studio/run.cjs engine inspect --json`
can identify the reference root, modules and missing/ambiguous paths. These commands
observe configuration/files, not tested engine behavior.

Choose the domain from responsibility, using this complete category map:

| Category | Reference domain |
| --- | --- |
| Gameplay | Physics for collision/combat/movement; Navigation for AI/pathfinding; Scripting for pure rules |
| Core | Core for scenes/state/resources; Input for controls/keybinding |
| UI | UI |
| Audio | Audio |
| Narrative | Scripting |
| Progression | Scripting |
| Economy | Scripting |
| Persistence | Core |
| Meta | Core |

Animation, Rendering or Networking may also be needed by Gameplay/Core: name the
actual chosen domain. In the configured reference root, read VERSION.md, the
relevant `modules/<domain>.md` and relevant breaking-changes entries. A configured
engine with absent references is **not** “no engine configured.” Name each absent
module/path and retain “feasibility not checked against the pinned engine.” Do not
infer API availability from memory or change engine configuration to make it fit.
If no engine is configured, state the skipped feasibility check and later setup
need; do not block engine-independent behavior design merely for that absence.

Find domain-matching ADRs by their Domain fields first; then read matching Decision
and Engine Compatibility sections. Overview may cite an ADR whose GDD Requirements
mention this system. Preserve Accepted decisions; current API claims need actual
reference evidence. Put implementation-pattern questions in future ADR work.

## Context and feasibility summary

Present the target, priority/layer and their source; upstream/downstream systems
with designed/undesigned evidence; locked registry values and owner GDDs; relevant
pillars/feeling and past conflict patterns. Include engine/version, actual domains
read, documented capabilities/constraints, unknown API risks and constraining ADRs.
Unknown feasibility stays in the final Summary/open findings. Reuse agreed choices;
ask only for missing consequential constraints or the decision to proceed with
provisional dependencies. Collaborative mode also retains ready/start and
more-context choices. Never present unread references as a completed check.
