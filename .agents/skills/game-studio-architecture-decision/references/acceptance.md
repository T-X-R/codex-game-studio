# Accept an explicitly settled decision

This is a status transition with downstream effects, not another authoring pass.
Do not rerun unrelated engine setup or invent a fresh gate merely to accept an
otherwise settled ADR. Do preserve all actual dependency and authority checks.

1. Normalize the supplied ADR number and resolve exactly one matching
   `docs/architecture/adr-NNNN-*.md`. Missing, duplicate or ambiguous matches stop;
   do not pick a file. Read it and require a real `## Status`. Missing Status
   routes to retrofit. Already Accepted is an idempotent no-op; Deprecated or
   Superseded is refused because a replacement requires a new ADR. An unknown
   status is unresolved, not implicitly Proposed.
2. Read `## ADR Dependencies`, especially Depends On. Absent, empty, UNKNOWN or
   unfilled declarations are not None: stop and name the gap, offering retrofit
   or a separately authorized correction. A literal examined None is valid.
   Resolve each dependency to exactly one readable ADR and verify Accepted.
   Refuse missing/ambiguous/non-Accepted dependencies by ID/status. Use
   `node .game-studio/run.cjs check --kind adr-deps --json` for graph observations
   where useful; duplicate IDs, actual cycles and self-dependencies need resolution.
   Unknown declarations and ignored self references are not a graph pass. Read
   actual dependency content/status; a topological order cannot establish it.
3. Before requesting confirmation, inspect Blocked `story-*.md` files only under
   `production/epics/`, recognizing `> **Status**: Blocked`, `**Status:** Blocked`
   and `Status: Blocked`. A match must name this ADR as its current unresolved
   decision, not only as a suggested successor to a Deprecated/Superseded ADR.
   Preserve unrelated blockers and stories that have not actually adopted this
   ADR. If another unsatisfied blocker remains, removing this one does not make
   the story Ready; report that separately. Do not create or rewrite epics.
4. Show the exact ADR/title, affected story paths and count becoming Ready
   (including zero), plus any Date addition and stories remaining Blocked. Ask
   whether to accept this concrete effect or leave Proposed. This requirement
   applies in autonomous mode too. Reuse an earlier explicit confirmation only
   if it covers these same observed consequences; an initial `accept ADR-NNNN`
   request without disclosed downstream effects is not such a confirmation.
5. After confirmation, delegate the ADR mutation to the actually available native
   `game-studio-technical-director`, with the user's exact confirmed decision,
   dependency observations, source file version/hash and permission to edit only
   that ADR's Status and an absent Date. Require a fresh dependency/file check
   before writing, preserving all other bytes. The coordinator is not this role.
   If unavailable, report that the user can apply the displayed change; leave
   files unchanged rather than imitating the role or silently changing its type.
6. The TD changes Proposed to Accepted. Keep an existing Date unchanged: it is
   the authorship stamp used by stories. If Date is absent, add today's date and
   explain that this is the newly recorded date, not a recovered historical date.
   A review APPROVE alone does not authorize this edit. The TD returns actual
   changed paths and verification; it writes no checkpoint or stories.
7. The coordinator rereads the resulting ADR/dependencies and affected stories,
   then changes only the confirmed Blocked statuses to Ready where this removes
   their final blocker. Preserve their ADR references, dates and other content.
   If input changed or one write fails, stop dependent writes and report exactly
   what changed and what remains; do not claim atomicity or overwrite newer work.

Report the accepted ADR, Date if added, every story actually moved and any
remaining blocker. Do not accept dependent ADRs automatically, re-point successor
stories, change project stage, or claim implementation/release readiness. A
read-only preview can inspect and list these effects but performs no mutation.
