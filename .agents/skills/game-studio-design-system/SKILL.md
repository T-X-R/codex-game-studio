---
name: game-studio-design-system
description: Author or resume one game system's design document section by section, or retrofit missing sections while preserving existing design. Use for a system GDD, not UI component libraries, implementation, or independent design review.
---

# Design one game system

Author `design/gdd/<system-name>.md` using the restored game's pinned CLI and
actual project evidence. Preserve the agreed game, dependency contracts and scope.
This workflow applies specialist **lenses itself**: it never spawns agents, even
for a requested specialist perspective or CD-GDD-ALIGN. These are author checks,
not independent reviews or evidence that a named native role ran.

Read each phase reference before that phase. After compaction or resumption,
re-read the current phase reference and saved work before continuing; do not restart
completed sections or load unrelated phase files merely because context changed.

1. Read [arguments and tier](references/1-arguments-and-tier.md): identify the
   target/retrofit operation, resolve project and per-system policy separately,
   and determine required sections. Missing consequential choices remain open.
2. Read [context](references/2-context.md): gather the concept or brief, indexed
   ownership, dependency contracts, live registry facts, engine evidence and ADRs.
   Present the constraints and actual missing inputs before designing.
3. Read [skeleton and persistence](references/3-persistence.md): preserve existing
   content; create only the appropriate new skeleton within authorized scope.
4. Read [section design](references/4-sections.md): apply the section cycle and
   relevant local lens; save each completed section and its recovery checkpoint.
   Formulas, resolved edge cases and testable criteria retain their structures
   at every documentation density.
5. Read [validation and handoff](references/5-validation.md): write the Summary,
   re-read the GDD, perform the appropriate self-review, reconcile authorized
   registry/index updates, and provide an independent-review handoff.

## Collaboration and ownership

Use `node .game-studio/run.cjs config get --json` and explicit task choices, not
assumed defaults. A `--review full|lean|solo` argument changes only this run.
Collaborative mode retains question → options → decision → draft → approval;
show the draft together with its approval choice before writing. Use the host's
available question interface, or a clear conversational question if unavailable.
Guided mode resolves consequential choices and reuses authorization for the agreed
multi-section document; no repeated per-section or per-file permission. Autonomous
mode records bounded assumptions and provenance, never fictitious user approval,
accepted risks, or a `log_decision` call. Respect effective always-ask categories.
No answer, dismissal or time elapsed is a decision.

Keep game behavior in the GDD. Record implementation questions as future ADR work,
not chosen patterns or code. Flag conflicts with approved GDDs or registry owners
before progressing; do not rewrite those owners to make this document consistent.
A declined write ends that write path; read-only requests do not create skeletons,
checkpoints, registry entries or index updates.

Independent `$game-studio-design-review` belongs in a **fresh Codex chat or CLI
session without this authoring history**. Never run or offer it inline, nor label
this workflow's CD-GDD-ALIGN self-check an independent approval. Check that a
recommended destination is installed before claiming it can be invoked. End with
actual saved sections, unresolved decisions, remaining checks and a concrete next
action; report observed context limits without inventing a percentage.
