# Preserve approved decisions and the master document

Before checkpointing, resolve/read `studio/docs/recovery.md` via the pinned
launcher. After each settled section (and each settled data-flow scenario), record
its actual decisions and their source in a transactional checkpoint. Read
`checkpoint show --json`, preserve existing narrative and applicable constraints,
write a unique project-relative draft and save with the observed expected hash.
Use `missing` only when the record is absent. Remove only that draft after success;
do not directly rewrite active.md or bypass a conflict. Branch and Stage use exact
observed values; explanations go in Evidence. A read-only task needs no write.

Record current phase, approved/drafted sections, actual decisions versus AI
assumptions, next step, unresolved requirements, provisional IDs, engine gaps and
write scope. Before Phase 7, state explicitly that the architecture document has
not yet been written/updated; checkpoints preserve decisions, not imaginary files.

Collaborative: show each complete section before its decision approval, then show
the concrete whole-document/selected-section changeset for the Phase 7 write.
Offer write now / full draft first / not yet. Guided: reuse already approved key
decisions and document/checkpoint authorization, without repeated permission asks
per section. Autonomous: record scoped assumptions with provenance, never fictitious
human approvals or accepted review concerns. A still-required choice with no answer
stays pending; use a real available question UI or conversational fallback.

Re-read the target immediately before its one content write. Preserve complete
unchosen sections byte-for-byte, including owner notes and unchanged baseline.
If concurrent edits occurred, reconcile rather than overwrite. In an update,
replace chosen sections by unique heading/old content and increment the observed
version; missing/ambiguous headings or malformed version need resolution first.
A whole rewrite requires an explicit choice. Status-only sign-off does not bump
the content version a second time. Revisions use this same single-write model.

After interruption or compaction, reread the current phase, checkpoint and actual
architecture. Recover settled decisions, inspect whether the content write really
occurred, and continue from the first unfinished operation. Source edits after a
review invalidate its applicability to changed content; record prior findings as
history, not approval of unreviewed bytes. Keep saved document and saved checkpoint
outcomes separate. Checkpoint conflicts/failures remain visible, not a false save.
