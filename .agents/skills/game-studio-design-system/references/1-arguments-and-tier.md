# Resolve target and document depth

Read effective configuration with `node .game-studio/run.cjs config get --json`.
Keep the project workflow separately from
`node .game-studio/run.cjs config get modes.workflow --system <system-slug> --json`:
project depth selects context documents; a named system override selects authoring
depth. Retain provenance, warnings, automation/always-ask settings, review mode,
density and `workflow_overrides.tuning_knobs`. A requested review override is local
to this invocation; it does not change settings.

## Target, existing work and retrofit

A system name or existing GDD path identifies the target. Normalize a new name to
a kebab-case filename without changing an existing path or system identifier.
A supplied `retrofit` or existing `design/gdd/*.md` path means fill missing work.
An existing GDD reached by system name also resumes; never replace it with a new
skeleton. Read headings first, then relevant section ranges, including completed
sections that constrain the missing ones.

Without a target, inspect the systems index if present. Propose the next Not Started
system in its actual design order, with priority/layer, and offer design it, choose
another or stop. If a checkpoint names unfinished work, expose that continuation
rather than silently discarding it. Do not start before the choice. Without an
index, ask for the target: a minimal project legitimately has only a game brief;
at standard/full explain the missing index and the map-systems prerequisite.
A missing or ambiguous name in an existing index needs a choice: use the correct
entry, request a map update, or explicitly design off-index. Do not add a row here.

For retrofit, show complete sections that will stay unchanged, required sections
that are missing/placeholder/incomplete, and optional sections available to add.
A short but substantive section is not incomplete solely because it is one line.
`[To be designed]`, empty bodies and unresolved required design decisions are not
completed specifications. Reuse explicit authorization to fill these gaps; otherwise
obtain the scope choice before editing. Never overwrite complete sections. A
requested revision of complete material is a separate, explicit change, not a
retrofit side effect. Missing Summary is also unfinished work.

## Required structure

`## Summary` and its Quick reference are required at **every** tier, in addition
to the section set below. Keep headings compatible with existing numbered forms.

| Effective system workflow | Required core sections |
| --- | --- |
| full | Overview; Player Fantasy; Detailed Design; Formulas; Edge Cases; Dependencies; Tuning Knobs; Acceptance Criteria |
| standard | Overview; Detailed Design; Edge Cases; Dependencies; Acceptance Criteria; Formulas when the system defines numeric rules |
| minimal | Voluntary GDD only: Overview; Detailed Design; Edge Cases; Dependencies; Acceptance Criteria |

At standard, rates, curves, thresholds, costs, damage, drop weights and other
balanceable quantities require Formulas, whatever the category. Category is a
hint, not the test: Core/UI/Persistence can define numeric rules too. A value
intrinsic to the engine alone does not create a new game formula. Player Fantasy
and Tuning Knobs are omitted at standard unless explicitly requested/overridden;
`workflow_overrides.tuning_knobs: true` forces Tuning Knobs at standard.

At minimal, numeric rules stay explicit in Detailed Design without automatically
adding Formulas. The GDD is optional; do not require full concept, formal pillars,
index or standard workflow to honor the request. An explicit per-system override
to standard/full changes these sections, while the project still reads its brief.
Retrofit uses this same required set; source content may include extra completed
sections, which remain untouched. Do not call optional omissions defects.

Template extras are handled separately in the section reference: category-required
Visual/Audio and Game Feel, dependency-required Cross-References, and selected
optional UI/Open Questions. At minimal these extras remain optional. They do not
change the named core-section count. Report actual section names, never a fixed
“All 8 complete” below full.

Density controls depth, not correctness: terse uses short bullets, balanced adds
light rationale, thorough adds examples/alternatives. Preserve variable tables,
Given-When-Then criteria, ownership and unresolved choices at every density.
