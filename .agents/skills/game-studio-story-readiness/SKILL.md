---
name: game-studio-story-readiness
description: Check whether a game story, epic or current sprint is ready to implement by assessing its requirements, acceptance criteria, architecture, dependencies and evidence plan. Use for readiness before implementation, not story completion, sprint status or executing tests.
---

# Check story readiness

This workflow is read-only. Report findings and, when wanted, draft missing parts
in the conversation. Never edit a story or another file, save a report/checkpoint,
change policy/status, install tooling, execute tests/game code or launch downstream
work. Readiness assesses the story's plan; it does not claim implementation,
passing tests, visual sign-off or release acceptance.

## Phase 1: Scope and policy

Accept `[story path | all | sprint | epic slug/folder] [--review full|lean|solo]`.
Remove the review flag/value before interpreting the remaining scope as one value;
a path can contain spaces. With no explicit argument use the story/epic/sprint
named in the request. Do not guess among ambiguous targets. If scope is blank,
ask “What would you like to check?” with specific story / current sprint / all
production stories / one epic choices, then wait for an actual answer.

Read [facts and policy](references/facts-and-policy.md) to resolve actual settings,
select the files and collect observations. Distinguish an absent sprint plan from
an existing plan listing no stories, malformed input, and individually missing
story entries. Zero stories: stop with `NOT ASSESSED — no stories in scope`, name
the scope and searched path, and recommend story creation (epics first at
standard/full). Never emit an all-zero clean summary. For nonempty scope announce
`Checking [N] story files.` after selecting the files and before Phase 2
fact collection or checklist evaluation; a count added only to the final report
is too late. Individually
missing requested stories remain visible.

## Phase 2: Facts, read once for the run

Use the pinned story-facts and ADR-status observers, the actual TR registry and
only the control manifest's version line as prescribed in the facts reference.
Read every scoped story's actual text and its named design requirement. Structural
rows and exit zero are observations, not readiness. Cache each document's facts
rather than rereading all ADR statuses per story. Read-only failures remain unknown;
absence of a malformed/unreadable registry is not the missing-registry waiver.

## Phase 3: Complete the checklist

Read [checklist](references/checklist.md) and evaluate every item for every story.
Use each story's resolved workflow tier, separately from QA level and review mode.
A failed advisory item is still a gap with a Fix, but does not lower READY alone.
Do not turn helper lint that is waived/N/A for this story into a new requirement.

## Phase 4: Assign each story's verdict

The first matching verdict wins; retain subordinate gaps and unknowns:

1. **BLOCKED:** a referenced ADR is missing, Proposed, Deprecated or Superseded;
   a dependency story is missing or Draft; or an acceptance criterion contains
   an UNRESOLVED design question with no owner. Name the specific blocker.
2. **NEEDS WORK:** an applicable blocking checklist item fails and the story can
   be fixed now.
3. **NOT ASSESSED:** required input cannot be evaluated, such as an unreadable
   target story, unreadable/malformed ADR Status, or missing named design document.
   Name the unreadable input. A missing target story differs from a missing
   dependency, which blocks the story depending on it.
4. **READY:** every item passes, is N/A with a reason, or is only advisory.

A known blocker outranks an unknown input; an unassessed required item cannot
support READY. A BLOCKED story may also have NEEDS WORK items: list both.

## Phase 5: QA Lead review

Apply the effective review mode before dispatch. Lean/solo skip QL-STORY-READY,
name `skipped — Lean mode` or `skipped — Solo mode`, and do not load the gate
reference or definition. Full: only after the checklist verdict exists, read
[QA Lead gate](references/qa-lead-gate.md) and invoke the actual native QA Lead
once per story. The reviewer reads its own gate definition. Do not impersonate a
missing role or call a generic reviewer equivalent. Reconcile actual results
without clearing earlier checklist blockers.

## Phase 6: Report and close

For one story use this shape, substituting actual results:

```text
## Story Readiness: [title]
File: [path]
Verdict: [READY / NEEDS WORK / BLOCKED / NOT ASSESSED]

### Passing Checks (N/[total])
Design Completeness: [passing items]
Architecture Completeness: [passing items, or N/A at minimal (ADR status checked)]
Scope Clarity: [passing items]
Open Questions: [passing items]
Asset References: [passing items or no asset references]
Definition of Done: [passing items]

### Gaps
- [failed checklist item]: [specific gap, with advisory label when applicable]
  Fix: [concrete correction]

### Blockers (if BLOCKED)
- [specific ADR, dependency or unowned question]
```

Use the six exact group names; a group with no passing items says
`none — see Gaps`. Count actual checked items, not an invented template total.
Gaps contains only failed checklist items, never passing/N/A items or unrelated
sprint/document observations. Keep unknown-input limitations explicit without
claiming that unreadable evidence failed a quality check.

For multiple stories give the summary first, then the one-story block for each
non-READY story. Include all scoped stories and individually missing entries:

```text
## Story Readiness Summary — [scope] — [date]
Ready: [N] · Needs Work: [N] · Blocked: [N] · Not Assessed: [N]
Ready: [title (path)], ...
Needs Work: [title]: [main gap]
Blocked: [title]: blocked by [named obstacle]
Not Assessed: [title/path]: [unreadable input]
```

For sprint scope put this before the summary when any Must Have is not READY:
`WARNING: [N] Must Have stories are not ready to implement: [each and main gap].
Fix them before the sprint starts, or replan the sprint.` Do not invent priorities
when the latest plan is unavailable.

For one story inspect the newest plan under `production/sprints/` for up to three
other Ready/Not Started Must Have or Should Have stories with no unfinished
prerequisites. Name each with a one-line description and estimate. Exclude this
story; do not infer readiness of a missing dependency. If none, say exactly
`Next ready stories: no sprint file found` or `Next ready stories: none ready in
[sprint]`. These are recorded candidate states, not fresh readiness verdicts.

Offer to draft missing parts in the conversation (Yes, draft them / No, that's
all), unless the user requested report-only/stop or already chose. Reuse authorized
conversation drafting; it never authorizes writes. A skipped/empty answer is not
acceptance. Collaborative decisions wait for the user; guided continues settled
read-only work and asks unresolved major choices; autonomous can state bounded
recommendations without inventing user overrides. Honor configured always-ask
categories and explicit user scope. No decision log is written in this workflow. If a QA result still requires an
unanswered choice, retain the checklist verdict and unresolved gate separately;
keep the implementation handoff pending rather than presenting it as cleared.

Route missing stories to story creation (epics first at standard/full); a small
change lacking design, under about a week, to a quick design specification; excess
scope to splitting the story or discussing it with the producer. A READY story's
next intended action is implementation; otherwise fix/make inputs readable and
rerun readiness. Before printing any `$game-studio-*` invocation verify its actual
installed frontmatter name or exposed capability. If absent, describe the action
and name the unavailable capability; never silently substitute another workflow.
Creating stories does not rewrite existing ones: corrections belong to their
existing fields, drafted here for a separately authorized editing task.

End with:

```text
Review: [QL-STORY-READY verdict per story, or skipped — Solo/Lean mode]
Next ready stories: [up to 3 | no sprint file found | none ready in sprint] (one story)
Next step: [implement the READY story | fix listed gaps/inputs and rerun readiness]
Files changed: none
```
