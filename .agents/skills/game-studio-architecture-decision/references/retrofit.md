# Add missing ADR structure without rewriting the decision

Read the specified project ADR completely, using heading ranges for large files.
Identify existing sections and these gaps:

| Gap | Impact |
| --- | --- |
| Status absent | BLOCKING: downstream work cannot establish acceptance |
| ADR Dependencies absent | HIGH: dependency ordering is unexamined |
| Engine Compatibility absent, or its Layer row absent | HIGH: version risk or criticality is unknown |
| GDD Requirements Addressed absent | MEDIUM: requirement traceability is missing |
| Date absent and Last Verified absent | MEDIUM: consumers have no change stamp |

Show existing sections that will be preserved and exactly what would be added.
Reuse authorization covering those additions; otherwise ask whether to add them.
Declining writes nothing, including a Date-only repair. No missing sections is a
no-op. An existing but unresolved dependency declaration needs a separately
agreed correction; retrofit does not quietly replace existing values.

For missing fields, reuse supplied facts or ask the relevant questions:

- Status: Proposed, Accepted, Deprecated or Superseded by a named ADR. An answer
  Accepted first appends **Proposed**, then routes to [acceptance](acceptance.md)
  after the other missing fields exist. It never bypasses dependency checks,
  concrete confirmation or the native TD's acceptance authority.
- ADR Dependencies: establish Depends On, Enables, Blocks and Ordering Note.
  Explicit None is permitted; an inconclusive scan remains unresolved and is
  not written as a completed declaration.
- Engine Compatibility: use the evidence-loading and layer rules in
  [authoring](authoring.md). Confirm domain and actual engine/version/risk;
  missing evidence stays unknown rather than invented. For an existing table
  missing only Layer, add just that row under Domain without changing any row.
- GDD Requirements Addressed: identify the actual GDD requirement each decision
  serves, or explain the foundational no-direct-GDD case and what it enables.
- Date: append today's date only when neither Date nor Last Verified exists,
  and report that it is the retrofit stamp, not the original decision date.

Append missing sections using the canonical ADR template fields; add only the
absent Layer row inside an existing Engine Compatibility table. Keep every
pre-existing section, value and narrative intact, including existing Status,
Date and Last Verified. Reread before mutation and compare afterward against the
original bytes except for those authorized insertion points. Preserve concurrent
edits or stop with the conflict; do not reformat the whole file.

If Accepted was requested for a missing Status, hand the repaired Proposed ADR to
acceptance mode, with its real dependency and story effects. Otherwise report the
added sections and propose independent architecture review in a fresh Codex chat.
Retrofit alone neither accepts the decision nor unblocks stories.
