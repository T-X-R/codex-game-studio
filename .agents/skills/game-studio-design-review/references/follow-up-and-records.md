# Follow-up and tracking records

Respect an explicit read-only or stop-after-review request. Solo never starts
this phase. Otherwise use the host's question UI when available for unresolved
choices; plain concise choices are a fallback when the host lacks that facility.
Do not force a particular unavailable widget or fabricate a log_decision tool.
Reuse concrete prior authorization; a review request alone authorizes assessment,
not mutation of the GDD/index/history.

## Next action by verdict

- APPROVED: offer the two optional tracking actions together: update this system's
  existing index row to `Approved`, append its review-log entry. Execute only those
  selected or already authorized, then offer the state-derived next action.
- NOT ASSESSED: offer neither approval tracking nor a review-log quality verdict.
  Lead with obtaining/authoring the missing input, naming the actual producer
  (usually game-studio-design-system for a missing GDD) and its availability.
- Revision verdicts: offer revise now or stop for later. `Accept as-is` is available
  only with no blocking findings and actual user choice; it does not silently
  convert missing required evidence into approval. Never offer bypass of blockers.

For an authorized revision, group unresolved design decisions before editing;
resolve mechanical fixes from established documents without repetitive questions.
Preserve unrelated content. Show blocker-to-fix results afterward. The next review
must independently judge the revised document: an author's claim of fixed blockers
is not APPROVED. Offer a fresh review, mark `In Review` if tracking was authorized,
a real next-system handoff, or stop. Do not invent context percentages or promise
that every full review uses a fixed number of agents.

Outstanding revision findings map to `Needs Revision`; applied revisions awaiting
review map to `In Review`. Never use `Approved` for either state. Confirm the exact
row and existing status before a scoped edit, preserving all other rows, IDs,
columns, links, notes and design progress. Do not create a missing index implicitly.
Re-read immediately before writes and reconcile concurrent edits; no overwrite of
an unseen newer version. Appending a log is separately authorized and preserves
all earlier entries. No automatic stage/configuration/checkpoint changes.

## Review entry

Append a result for the version actually reviewed, not an edited-but-unreviewed
replacement. If revisions happened afterward, retain that distinction in the
entry and do not stamp the newer bytes as reviewed.

```text
## Review — <YYYY-MM-DD> — Verdict: <APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED>
Review mode: <full / lean / solo> · Workflow: <full / standard / minimal>
Scope signal: <S/M/L/XL>
Specialists: <actual roles; missing required coverage separately>
Blocking items: <count> | Recommended: <count>
Summary: <actual synthesis, or main reviewer for lean>
Prior verdict resolved: <Yes / No / First review>
Findings:
- [BLOCKING] <section>: <one-line finding>
- [RECOMMENDED] <section>: <one-line finding>
<Reviewed-Content-Hash lines from the helper for the inputs actually reviewed>
```

Write `- none` when there were no findings. Include target, registry when present,
all Skill logic files, relevant policy sources, related GDDs, concept/brief,
narrative files and specialist definitions actually used. Hash using:

```sh
node .agents/skills/game-studio-design-review/scripts/review-receipts.mjs hash <reviewed-path> ...
```

The helper prints stamps; it writes no file and grants no permission to append.
A missing/unreadable required input or input changed since the review prevents a
complete receipt. Never label a hash match as fresh independent review evidence.

## State-derived closing choices

After authorized writes, inspect the index for other `In Review` / `Needs Revision`
rows and the next `Not Started` row in actual design order. Count individual GDDs,
excluding the concept, index, reviews and other supporting documents. Offer only
real next actions: review a pending GDD; consistency-check when another GDD exists;
review-all-gdds when at least two exist; design the actual next system; or stop.
Check the destination is installed before invoking it. Naming a future workflow
is not a claim it ran or is available. A wider review, authoring the next system,
implementation and publication each need their own actual task authorization.
