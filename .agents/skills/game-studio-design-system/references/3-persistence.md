# Create and preserve incremental work

Resolve `studio/templates/game-design-document.md` through
`node .game-studio/run.cjs resource path studio/templates/game-design-document.md --json`.
Use its Status/Author/Last Updated/Last Verified/Implements Pillar header, Summary
and Quick reference, core headings and other template sections. Omit only core
sections excluded by the effective tier; keep the other template sections for
the relevant later choice. Don't fill an optional section merely to erase every
placeholder, or call an unrequested placeholder completed work. Use accurate author
and verification claims, not fictitious specialist participation or gameplay tests.

For a new document, show the intended path and section set. Collaborative mode
requires skeleton approval. Guided/autonomous mode reuses authorized document
creation after consequential choices; it does not ask again just because the file
is new. A declined skeleton produces BLOCKED for creation and stops before Section
A; a read-only planning request stays in the response.

For an existing document, skip skeleton creation. Confirm the retrofit/resume scope
and preserve complete sections byte-for-byte, including notes outside them. Re-read
before each change to catch concurrent edits. Anchor each edit on its unique heading
and actual old body, never on `[To be designed]` alone. If the actual file changed,
reconcile the new state rather than overwriting it. Save each authorized section
as it is finished; do not hold a whole GDD only in conversation until the end.

## Checkpoint after each durable milestone

Read `studio/docs/recovery.md` through `resource path` before the first checkpoint.
After the new skeleton and every completed section, use the pinned CLI checkpoint
transaction. Read `checkpoint show --json`, preserve existing narrative/constraints
and still-relevant open work, write a unique project-relative draft, and save with
its observed whole-record hash (`missing` only for an absent checkpoint). Remove
only that temporary draft after a successful save. Do not directly rewrite
`production/session-state/active.md` or bypass a conflict through a new blank state.

Record the exact system/GDD, actual completed section names, next incomplete section,
source decisions, unresolved conflicts and any failed save. Keep Branch/Stage exact
observed names; annotations go in Evidence. A saved GDD and saved recovery record
are separate outcomes. On interruption, inspect both and resume from the next real
incomplete section; a checkpoint claim does not override the file. A no-change
read-only continuation needs no fabricated checkpoint event.
