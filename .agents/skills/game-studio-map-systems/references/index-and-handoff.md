# Write or resume the index, then offer the next design task

Resolve and read the canonical template using:

```sh
node .game-studio/run.cjs resource path studio/templates/systems-index.md --json
```

## Preserve the document contract

The Systems Enumeration table has exactly these columns, in this order:
`# / System Name / Category / Priority / Status / Design Doc / Depends On`.
Keep `Category` by name; consumers use it to route system design. Do not add
Description, Why, Owner or other convenience columns. Recommended Design Order
remains `Order / System / Priority / Layer / Agent(s) / Est. Effort`.

Use actual project systems, not the template's example rows. Mark inferred names
with `(inferred)`. Keep the Priority Tiers definition table, dependency layers,
cycle/risk findings, design order and progress tracker consistent with the same
system set. Empty categories/tiers/layers are not invented work. Existing unknown
status or unreviewed GDDs do not become Approved/Implemented merely because a file
exists. New systems start Not Started unless actual existing design work supports
a different status; preserve established states/links when updating.

Documentation density changes depth, not these schema columns or the information
needed to recover the map: terse uses a concise Overview and short table/list
entries; balanced puts a brief paragraph per system in Overview with dependency
notes; thorough adds rationale and relationship analysis there and in layer notes.
Never widen the table to carry prose. Explain prioritization against this game's
pillars/experience, not copied example vocabulary. Design effort S/M/L denotes
rough design-session counts (1 / 2–3 / 4+), not implementation hours or delivery
promises; identify unknown estimates instead of manufacturing confidence.

Before writing, show category totals, MVP count, first three design candidates
and high-risk items. Name `design/gdd/systems-index.md`. Reuse explicit scope and
write authorization in guided mode; respect collaborative review and read-only
requests. Reread an existing index before updating and reconcile concurrent edits
rather than replacing newer user work. Retain unrelated notes and authored GDDs.

After the write, run the Creative Director step in the review reference when full
review applies. Record actual findings and pending decisions. Verify row identity,
counts, links, dependency order and preservation against the prior file and source
concept; a successful write alone does not prove a consistent decomposition.

## Save the authorized milestone checkpoint

After an authorized mapping milestone, save its recovery record through the
pinned checkpoint CLI, not a direct replacement of `production/session-state/active.md`.
Read the contract through:

```sh
node .game-studio/run.cjs resource path studio/docs/recovery.md --json
node .game-studio/run.cjs checkpoint show --json
```

Use its actual `data.sha256` (or `missing` only for an absent record) with
`checkpoint save --input <new-project-relative-draft> --expect-hash <observed-hash>`.
Create a nonconflicting temporary draft within the authorized project scope and
remove only that draft after saving. Preserve narrative outside the managed
region and existing relevant constraints/open work when composing the new region.
The coordinator owns this save; child reviewers never write shared state.

Record Current task (systems decomposition or priority update), Run result (what
was actually saved/reviewed), Files in progress (index and any in-progress GDD),
Next step, unresolved review/owner decisions and actual evidence. Keep the recovery
preview bounded as the CLI contract describes. A hash conflict or permission
failure is reported, not bypassed by direct editing; the saved index and failed
checkpoint are separate outcomes. No checkpoint is written for a read-only review,
a missing prerequisite or a declined write. No stale process claim is carried
forward as proof of a live reviewer/server. Do not invent a context-usage percentage.

## Select and hand off without implementing another workflow

For `next`, use the recorded recommended order among unfinished designs, respecting
its priorities and unresolved prerequisites. Preserve In Design work for resumption;
do not skip it as though complete. For a named system, find its exact row and
surface prerequisite/cycle conflicts before choosing a different system. If all
systems are designed, say so and offer review/next gate instead of inventing one.

An explicit request to design that system is authorization for the handoff. After
mapping alone, offer the first candidate, another system or stop; do not begin a
GDD automatically. Check whether `$game-studio-design-system` is installed before
invoking it. If unavailable, return the actual system name, index row, dependency
GDD paths and unresolved decisions as a handoff; do not implement the missing
Skill, create a skeleton GDD or claim it ran. The system-design workflow owns its
own section authoring, review and index progress updates.

After a completed handoff, offer next system, another system or stop. Recommend
`$game-studio-design-review` for a completed GDD only if available (otherwise name
the missing capability). Offer `$game-studio-gate-check systems-design` only while
recorded stage is Concept; Technical Setup readiness follows completed/reviewed MVP
GDDs. A mapping or review never automatically changes the project stage.

End with COMPLETE only for the authorized index-writing milestone, with its path,
actual review outcomes and any unresolved draft/readiness limits. A declined or
blocked write is BLOCKED, not COMPLETE. A selection-only request reports the
selection; it does not claim a newly written index or completed GDD. Stop where the
user requested, even when later workflows are installed.
