# Validate the saved design and hand it off

## Summary and self-check

After the actual design sections exist, author the Summary in 2–3 plain sentences:
what the system is, its player effect and why the game needs it. Populate the Quick
reference with Layer, Priority and Key deps from the written Dependencies section.
When brief-derived, include Category too and label Category/Layer/Priority inferred;
never present them as indexed facts. Summary is required at every tier. A complete
existing Summary in a retrofit remains unchanged unless its revision is authorized.
Use the same section write/checkpoint cycle for a newly completed Summary.

Re-read the complete GDD from disk, using heading ranges for long documents. Verify:

- Summary and Quick reference are real content.
- The effective tier's required sections, category-required extras and explicitly
  chosen additions are populated; unselected optional sections are not false gaps.
- Formulas define every variable, range/source, output and worked example.
- Edge cases resolve conditions; dependency interfaces and cross-references agree,
  including each reference's Nature versus the actual data flow and ownership.
- Criteria are independently testable and cover rules, formulas and interactions.
- Previously approved content and unrelated files remain intact; unknown engine
  evidence, provisional contracts and unresolved decisions remain visible.

`node .game-studio/run.cjs check design/gdd/<system>.md --kind gdd --json` supplies
structural observations, not a semantic verdict or tier-aware waiver. Interpret
observations against this system's actual tier; don't treat omitted optional sections
as failures or a zero exit as proof of design quality. Do not silently lower the
required set. A GDD with unresolved required design choices is not complete.

## CD-GDD-ALIGN author check

Lean and solo skip this once, by exact gate ID and mode. Full reads
`studio/docs/director-gates/cd-gdd-align.md` through `resource path` and applies it
**in the authoring conversation** with [creative lens](lens-creative-director.md).
The shared gate's generic native-role instruction is overridden by this workflow's
explicit no-spawn contract. Do not claim a separate Creative Director was consulted.

Use the actual saved GDD, pillars or brief pitch/intended feeling, MDA aesthetics
target and Player Fantasy if authored. Name a tier omission rather than inventing
Player Fantasy. Missing required alignment input is NOT ASSESSED, not approval.
Findings cite the relevant GDD section and actual rule/value/player moment.

- APPROVE: record `Creative Director Review (CD-GDD-ALIGN): APPROVED <date>` with
  an adjacent statement that this is an author-applied lens, not independent review.
- CONCERNS: present revise, accept and proceed, or discuss. Only actual acceptance
  permits `CONCERNS (accepted) <date>`; unresolved concerns remain unresolved.
- REJECT: stop registry/index finalization, show the pillar violations and return
  each flagged section through its section cycle. No self-issued risk acceptance.
- Revisions reapply that section's lenses under its review mode and use the same
  decision/write cadence; record `REVISED <date>`, not an invented fresh APPROVE.
- NOT ASSESSED: supply the missing input and rerun, or record
  `NOT ASSESSED <date> — <missing input>` within the authorized draft scope.

Authoring self-check results do not set independent review status to Approved.
Retain the distinction between completed drafting, unresolved review, tested game
behavior and independently reviewed design.

## Entity registry

Read [registry contract](registry.md). Extract only facts that cross system
boundaries: named entities/stats/drops, items/attributes, formulas/variables/output
ranges and shared numeric constants. Internal-only facts need no registry entry.
Show new candidates and already-registered matches with their owner and values.
Existing entries gain this GDD in `referenced_by` without duplicated names or value
changes; mismatching owned values require a decision before writing.

Distinguish absent registry, present-but-empty live lists, and populated registry.
A commented sample is never a real entry. Reuse explicit registry-write scope;
otherwise present the concrete candidate set and ask whether to create/update it.
If declined, report skipped registry registration, not a clean check. With no
cross-system candidates, say none; do not create an empty registry merely because
the phase exists. Preserve unrelated entries, history and comments.

After an authorized update, run the shared validator. Resolve diagnostics caused
by entries/paths this write added or changed before proceeding; name pre-existing
unrelated findings without fixing them unasked. Missing/unavailable validation is
NOT ASSESSED and requires re-reading the changed entries against the schema; never
claim the helper ran or that structural success proves cross-document consistency.

## Independent review and systems-index update

Summarize actual saved sections, provisional interfaces, unresolved questions and
cross-system conflicts. Give this **handoff**, never an inline execution offer:
open a fresh Codex chat/CLI session and use `$game-studio-design-review` on the
saved GDD if installed. That reviewer must not inherit this authoring history.
No review receipt is written by the authoring workflow.

If `design/gdd/systems-index.md` is absent, say there is nothing to update. Do not
create a one-system index; map-systems owns creation. If present, update only the
target's status/link and dependent progress counts within authorized index scope,
preserving IDs, fixed columns, other rows and owner notes. Without independent
review, write the Status cell exactly `Designed`, never Approved; record pending
independent review outside that cell. A recorded
independent verdict applies only to the exact reviewed content: APPROVED → Approved;
NEEDS REVISION or MAJOR REVISION NEEDED → Needs Revision. Do not reuse a stale
review after authorship changes, or convert the CD-GDD-ALIGN author check into it.
Unfinished required sections stay In Design. Document existence alone does not
increase approved/reviewed counts. Preserve relevant UX notes without new columns.

Save the final checkpoint transaction with the target file, actual section names,
findings, validation limits and next responsible action. Keep stage and settings
unchanged. If a minimal-workflow `deepen — <system>` story sent the user here, direct
back to that story's installed dev-story workflow without extra gate/consistency
requirements. Otherwise offer, as appropriate, cross-system consistency checking,
the next indexed system, fixing independent findings, stopping, or a later gate
when enough MVP design evidence exists. Offer only available destinations as
invocable Skills; missing destinations are pending work, not simulated execution.
