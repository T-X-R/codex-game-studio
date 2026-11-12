# Controlled outputs and records

Read the completed report before choosing effects. Reuse explicit authorization
for the same concrete files; routine guided writes need no repeated approval.
Otherwise preview the changes and offer one grouped choice:

- All named outputs: review report, traceability index, TR registry; also name an
  existing conflict log if appending actual conflicts, and any requested index
  revision/checkpoint as separate effects.
- Review report only.
- No files yet (or show the complete proposed diff before deciding).

Default report path is `docs/architecture/architecture-review-<date>.md`. Inspect
an existing same-date report before writing; never overwrite history implicitly.
Use an authorized distinct suffix or confirmed replacement. Output choices do not
implicitly authorize ADR/GDD/story edits, settings, stage, code, commits or publication.

## Stable TR registration

Reread current `docs/architecture/tr-registry.yaml` immediately before mutation and
reconcile with the reviewed baseline. Preserve every existing entry, ID and unknown
field. Conflicting concurrent edits require rereading/reassessment, not clobbering.

The schema is metadata `version`, `last_updated`, then `requirements: []` or a block
list whose entries start `id`, with `system`, `gdd`, `requirement`, `created`,
`revised`, `status`. GDD filename stem is the system identity; the TR system slug
can be its established alias. Keep a consistent zero/two-space list indentation.
Write valid YAML, quote values containing colon-space, and preserve history:

- Append new permanent IDs only after the stable/provisional matching rules.
- Same intent with new wording retains ID and gets a revised date.
- Mark removed requirements deprecated only on concrete confirmation and only when
  the actual GDD was reviewed; missing/unreadable evidence is not removal.
- A split/replacement retains the old entry with quoted
  `status: "superseded-by: TR-system-NNN"` (or named replacement IDs), adds new
  entries, and reports citation changes. Never renumber/delete old entries.
- Update version/last_updated consistently with the actual change; avoid no-op churn.

Resolve `studio/scripts/registry.mjs` through `resource path`, then run its `validate`
and `compare tr <owned-before-snapshot>` observation commands after writing.
`validate`/`compare` exit zero is not quality approval: inspect registry states,
DUPLICATE/STATUS/LAYOUT/UNQUOTED/PATH_MISSING/PATH_UNSAFE/TR_UNKNOWN/REMOVED findings.
Fix findings introduced by this authorized change; report unrelated existing ones
without unapproved repairs. `removed:null` or malformed/missing current data cannot
prove preservation. Missing/failed validation is explicitly unassessed; rereading
headers alone does not establish helper parity or a clean registry pass.

Use a uniquely owned temporary directory/exclusive file for snapshots, never a
shared fixed tmp filename. Prefer direct content for drafts; clean only files whose
ownership this run established, after consumers finish. Do not delete others' paths.

## Index and RTM

Full review writes `docs/architecture/requirements-traceability.md` with Last
Updated, Engine, Coverage Summary (all five statuses), Full Matrix, Known Gaps and
Superseded Requirements. RTM extends the same path with GDD/TR → ADR → Story → Test,
structural Test Status, execution-evidence limits, disjoint counts/percentages,
priority fixes by Foundation/Core/Feature/Presentation and History. Preserve
existing history when updating; file presence is never a passing-test summary.

**single-gdd** updates only that system's matrix rows and registry entries; preserve
other-system rows/IDs/fields exactly and recompute combined summary from retained
plus changed rows without claiming the others were reviewed. Only that system may
be considered for deprecation. With no existing index, write report+authorized
registry only and say a full review creates the index; never create a one-system
file labeled complete. If its existing format cannot be updated safely, surface the
ambiguity and show the proposed change rather than rewriting everything.

For registry-only/RTM-only authority, write only those authorized files; do not
turn the standard all-files option into a compulsory bundle.

## Conflict log, receipts and recovery

Append only actual CONFLICT findings to existing `docs/consistency-failures.md`
when it was named in the authorized changeset: date/workflow, Domain, involved
ADRs, competing claims, impact/resolution options, recurring pattern. No GAP entries,
no creation of an absent log, no implicit append under report-only authorization.

Write the report last. First apply/validate authorized registry and conflict-log
changes; verify every other reviewed input hash remains current. Reassess any
unexpected change. Then obtain receipt stamps for the same effective input set
used in the freshness check and paste those actual lines under the report header.
A failed/unresolved stamp stays explicit; do not fabricate hashes or a complete
receipt. Include correct Mode/Workflow, actual scope and verdict. Verify saved
artifacts and semantic field/row preservation, not just successful tool exit.

The source's silent `production/session-state/active.md` append is adapted to the
installed recovery contract. Only save a checkpoint when authorized; resolve
`studio/docs/recovery.md`, read current state and use the actual expected-hash save
transaction. Record verdict/counts, registered IDs, GDD flags, prioritized gaps and
real report path. Coordinator owns the save. Report-only means exactly that; no
implicit log, index or checkpoint write. Report partial writes/failures honestly;
a receipt or checkpoint does not make multiple file mutations atomic.
