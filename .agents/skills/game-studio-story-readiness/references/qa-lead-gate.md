# Phase 5: actual QL-STORY-READY review

Read only in effective full review mode, after each story has a checklist verdict.
Resolve/read `studio/docs/integration.md` through the pinned runtime for the native
role contract. Inspect the installed game-studio-qa-lead role and actual host
native role availability. File presence alone is not proof it can be invoked.

For each story invoke the actual `game-studio-qa-lead` role once, with inherited
session model, effort and permissions. Do not set custom model tiers, escalate
permissions, enable roles globally or trust Hooks to obtain a review. Resolve
`studio/docs/director-gates/ql-story-ready.md` through the pinned resource command
without reading its contents in the coordinator. Instruct the reviewer to read
that actual definition first in its own context. Do not copy a predicted verdict
into the assignment or replace a missing custom role with a generic agent.

Pass:

- Objective: assess whether this story's acceptance criteria are testable enough
  to implement against under QL-STORY-READY, not whether implementation/tests passed.
- Actual story path and type (Logic/Integration/Visual/Feel/UI/Config/Data).
- Every acceptance criterion verbatim, without omitting awkward or unowned criteria.
- Covered requirement TR ID and actual design text, with its source path; identify
  missing input honestly rather than supplying invented requirements.
- Each dependency and observed state (exists, Draft, missing); this run's checklist
  verdict, gaps and unassessed inputs; effective policy with provenance.
- Read-only boundary: read the story, named evidence and own gate; no edits,
  scratch files, tests/game execution, installs, checkpoints, nested delegation,
  commits or downstream work. Return one gate verdict and specific findings.

Wait for that actual role result before the final report. Retain the distinct
checklist verdict and gate result per story; no batch-only verdict. Unavailable
role/tool, refused spawn, failed invocation or unreadable definition/input is
NOT ASSESSED with the actual reason, never ADEQUATE. Continue independent stories
where possible without claiming an unavailable review occurred.

Apply results:

- **ADEQUATE:** this gate clears its testability scope. It does not erase a
  BLOCKED/NEEDS WORK/NOT ASSESSED checklist result or claim tests passed.
- **GAPS:** show the specific gaps and offer Draft the fixes / Accept and go on /
  Discuss further. Drafting is conversation-only. Acceptance must be an actual
  user choice, not inferred from silence or the request to review. Preserve
  known checklist defects and the GAPS gate result even if concerns are accepted.
  Until a required choice is answered, report the checklist result and pending
  gate separately; do not claim the implementation handoff is cleared.
- **INADEQUATE:** READY becomes at least NEEDS WORK; BLOCKED remains BLOCKED.
  List the gate gaps and restate the final verdict, then offer draft revisions or
  proceeding despite the result. An actual user override leaves the verdict
  adverse and says `proceeding despite QL-STORY-READY: INADEQUATE (user override)`.
  This records the choice in the conversation; it does not start implementation.
- **NOT ASSESSED:** name the missing input and offer to supply it and rerun that
  gate. Otherwise a READY checklist becomes NOT ASSESSED; NEEDS WORK/BLOCKED stand.
  A repeat after supplied input preserves both original and later outcomes.

If the user requested stop-after-report, present gaps/unknowns without soliciting
another workflow or manufacturing an answer. Where a choice is still required,
use the host's available question mechanism, or numbered options and wait. A
skipped/dismissed/empty response is not approval. Guided mode continues already
settled read-only work; unresolved consequential choices remain with the user.
An autonomous recommendation is not a fabricated user override.
