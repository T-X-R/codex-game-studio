# Load the architectural context

## Engine evidence first

Read `config get engine_values --json` through the pinned launcher; establish name,
version and language independently with their actual sources. If engine or target
version is absent, stop and name that prerequisite. Recommend engine setup only
if that workflow is installed; do not choose an engine or infer a version.

Read the configured engine's `docs/engine-reference/<engine>/VERSION.md`,
`breaking-changes.md`, `deprecated-apis.md` and `current-best-practices.md` in full.
Extract reference-declared cutoff/version gaps, HIGH/MEDIUM changes, deprecated
APIs and current practices. Those records are evidence about the references, not
permission to invent this model's training cutoff. Enumerate module filenames
without reading their contents. After identifying the actual systems from the
concept/index below, select their relevant domains: Physics, Rendering, UI, Audio,
Navigation, Animation, Networking, Core and Input; include ambiguous matches.
Only then read the selected modules. Do not bulk-read all modules to decide which
are relevant: excluded domains remain unread. Missing/mismatched references stay
named unknowns. Resolve missing
API evidence before binding an API-specific choice; an explicitly authorized
engine-independent draft can retain feasibility NOT ASSESSED. Do not call a
configured engine with absent references an unconfigured engine.

## Design prerequisites and preferences

Check both `design/gdd/game-concept.md` and `design/gdd/systems-index.md` exist and
contain actual content before reading either. Empty/template-only is absent.
At standard/full, absent index stops with the map-systems handoff; absent concept
stops with brainstorm. Neither can be replaced by guessed systems. Minimal may
use `design/game-brief.md` in place of missing concept/index; explicitly say the
index is not required there. If no actual design record exists, stop without a
baseline or writes. Check destinations are installed before suggesting invocation.

Read concept pillars/genre/core loop and index systems/dependencies/priorities by
heading. Read naming and performance settings per key with provenance; for absent
or empty values read project-owned `docs/technical-preferences.md`. Its allowed
libraries and forbidden patterns are also needed, not just numeric settings.
If the project-owned preferences are absent, those preferences remain unknown;
do not install dependencies or substitute framework defaults.

## Complete Technical Requirements Baseline

Enumerate every `design/gdd/*.md` and count N before extraction. Account for each,
including concept/index files and any file contributing zero requirements; avoid
double-counting the same requirement from repeated descriptions. Inspect heading
boundaries and read entire Detailed Rules **or** Detailed Design, Formulas,
Dependencies, Tuning Knobs and Acceptance Criteria sections. Recognize numbered
headings as well as plain ones. Fixed line windows are not complete sections.
Follow material referenced outside them. Full-read zero-match legacy documents,
explicitly identifying that fallback; absent sections never imply no requirements.
At minimal without GDDs, extract from the actual brief and label that source
instead of inventing a nonzero GDD denominator. Distinguish unapproved source
choices from approved requirements; do not silently drop either.

Extract implied data structures, performance constraints, required engine
capabilities, cross-system communication, persisted state and threading/timing.
Keep each requirement's source path/section and system. Never derive this baseline
from the proposed architecture and then claim complete coverage against it.

Before numbering, resolve the portable reader:

```sh
node .game-studio/run.cjs resource path studio/scripts/registry.mjs --json
node <returned-path> --project <game-root> list tr
node <returned-path> --project <game-root> next-id tr <system-slug>
```

JSON `registries[].state` and `diagnostics` distinguish read, missing and invalid
layout. `qualityAssessed: false` and exit zero are observations, not valid coverage.
Malformed/ambiguous entries cannot be silently treated as an empty registry.

- Read every live registry entry and the existing architecture's Technical
  Requirements Baseline before assigning IDs. Ignore commented examples.
- Same system and same intent as an **active** entry retains its ID, even when
  wording differs. Never recycle deprecated or superseded IDs.
- Reuse a same-intent provisional baseline ID only if no registry entry, active
  or retired, occupies it. Active same-intent matches were handled above; retired
  same-intent entries are not reusable provisional IDs. Surface collisions; do
  not silently rename IDs that existing ADRs/stories may cite.
- Reserve, in this draft only, every ID observed in registry (all statuses), the
  existing baseline and this run's assigned rows. For genuinely new requirements,
  start at the helper's next-ID observation and advance past this union. Repeated
  helper calls do not reserve anything and may return the same number.
- All unregistered rows are marked `(provisional)`. Missing registry or empty
  `requirements: []` makes all unregistered rows provisional, not permanent.
  This Skill never writes the TR registry. Architecture-review reconciles and
  permanently registers IDs; report any collision/rename decision needed there.

Present and, on an authorized full/new write, persist:

```markdown
## Technical Requirements Baseline
Extracted from [N] GDDs [or the named minimal brief] | [X] total requirements |
[R] registered, [P] provisional
(TR registry: [read, E entries | absent | empty | unresolved layout])

| Req ID | GDD | System | Requirement | Domain |
|--------|-----|--------|-------------|--------|
| [observed stable ID or provisional ID] | [source path and section] | [system] | [actual requirement] | [domain] |
```

Include the enumerated source coverage/zero-contribution findings. A focus update
does not authorize rewriting this baseline: use current observations for review,
record source/baseline discrepancies in the checkpoint, and retain the stored
baseline bytes until its update is authorized. Reviewers receive both and their
provenance, never a claim that stale stored rows represent the current GDDs.

## ADR inventory, risk and existing architecture

Inventory ADR filenames and read Status, Summary and Engine Compatibility Domain
headers first. Full reasoning is needed only for a colliding decision; read its
relevant sections. Later ADR audit reads the evidence required for its checks.
Report actual status, not approval inferred from the filename or implementation.

Show Engine Knowledge Gap Inventory: engine/version, reference-declared cutoff
and post-cutoff versions, HIGH/MEDIUM/LOW domains and implicated systems. Unknown
risk is not LOW. For unresolved consequential risk offer proceeding with flags,
pausing for reference inspection, or details. Reuse an explicit existing decision;
never hide a risk behind a routine guided write authorization.

If architecture.md exists, read its Document Status and headings before drafting.
An explicit focus is already a selected-section update; otherwise resolve update
chosen sections / replace entire document / stop. Show current version/date.
Selected updates author only chosen sections and name skipped phases; version
increments once for the content update. Last Updated and the current review
records are the disclosed metadata exceptions. Every other section stays unchanged.
No focus target: explain absence and offer the complete walkthrough without writes.
