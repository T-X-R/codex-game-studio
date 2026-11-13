# Phase 8: next work with an applicable sprint plan

Read only when production/sprints/ contains a sprint plan and workflow is not
minimal. Select the newest actual plan (modified time), name it, and resolve ties
or conflict with an explicitly selected sprint instead of guessing. Read current
story statuses after this close; do not use pre-close counts or a stale plan's
cached status over the actual story. Missing/unreadable paths are unknown, not done.

Find Ready/Not Started Must Have or Should Have stories whose prerequisites are
finished. Resolve explicit dependency paths exactly and Story NNN within its epic;
a missing/unreadable dependency is not finished. List each available candidate's
actual title/path, one-line purpose and estimate. Exclude the just-closed story.

```text
Next Up
The following stories are ready to pick up:
1. [story title/path] — [one line] — Est: [actual estimate]
[other eligible stories]
Next: confirm the selected story's readiness before starting implementation.
```

Use an installed story-readiness invocation only after verifying its availability;
otherwise name the missing capability and intended readiness action. These are
recorded candidate states, not fresh readiness verdicts, and nothing starts here.

## Every Must Have is Complete or Blocked

Retain the source close-out opportunity while stating the truth: show how many
Must Haves are complete, how many blocked and each blocker. Do not say “all complete”
when any are blocked; a blocker does not grant stage advancement or QA approval.
Zero/missing Must Have scope alone is not proof a sprint finished.

Show this ordered Sprint Close-Out Sequence as intended actions, checking actual
installed capabilities before printing any invocation:

1. Smoke-check sprint: critical path still works end to end.
2. Team QA sprint: execute test cases, triage bugs and obtain sign-off.
3. Retrospective: results, failures and concrete follow-up actions.
4. Gate-check only when advancing a stage and only after actual team-QA APPROVED
   or APPROVED WITH CONDITIONS; preserve conditions and unresolved blockers.
5. Plan the next sprint.

List unstarted Should Haves beside the sequence so the user can choose finishing
this sprint or pulling more work in. Do not perform QA, write a retrospective,
advance a stage or create the next sprint merely because this sequence is shown.
Unavailable team-QA/retrospective/sprint-plan remains a capability gap, not a
reason to skip its requirement and claim close-out cleared.

If none is ready and Must Haves are still In Progress, say how many remain and
recommend finishing them before close-out. For other nonready states, name the
actual dependency/blocker; do not invent active work. If this story was left open,
its unresolved fix remains primary rather than a false handoff from a closed story.
The checkpoint's Next step matches the actual action shown to the user.
