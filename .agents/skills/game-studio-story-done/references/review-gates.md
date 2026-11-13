# Phase 6: actual reviews in full mode

Read only after the coordinator's checks and own-call choices, when effective
review mode is full. Resolve/read `studio/docs/integration.md` for the installed
native role contract; verify actual host role availability. A TOML file alone
is not proof a role is callable. Each role inherits the session model, reasoning
effort and permissions. Do not set model tiers, change policy, trust Hooks or
replace an unavailable typed role with a generic agent or coordinator opinion.

The coordinator resolves each gate path with the pinned `resource path` command
without reading the definition. The assigned reviewer reads its own actual gate
first. Supply facts and prior findings, never a desired verdict. Both reviews
are read-only: no edits/scratch files, tests/game execution, installation, policy
changes, checkpoint, commits or nested delegation. Wait for actual results before
the completion report. Keep each gate's coverage, inputs and result distinct.

## QL-TEST-COVERAGE

Skip at qa.level minimal (name that reason) and for Config/Data (no code-test
gate). Otherwise invoke actual `game-studio-qa-lead` with resolved
`studio/docs/director-gates/ql-test-coverage.md`.

Give it:

- Objective: assess coverage of the specified story, not test-file presence alone.
- Actual story path/type, every Acceptance Criterion and QA Test Case verbatim.
- Test/evidence files found in Phase 4, exact paths or “none found,” and any
  actual existing execution reports with their provenance/limitations.
- Applicable GDD Acceptance Criteria and edge cases with section paths; at
  minimal workflow explicitly state the story criteria are the spec. Missing
  required GDD is an input gap, not permission to invent its requirements.
- Resolved QA level, type-gate levels and sources, prior observed failures,
  untested/deferred distinctions and relevant user answers without embellishment.

The gate assesses actual coverage and existing execution evidence. At applicable
standard/full QA the gate's passing-evidence requirement is stronger than Phase 4's
file-presence observation; neither role may execute tests here or claim unrun tests
passed. A known failure cannot become a pass through a waiver or wrapper exit.

Reconcile its actual result:

- **ADEQUATE:** this gate clears its scope; no earlier failure/unknown is erased.
- **GAPS:** advisory—name gaps and a follow-up story action. Closure can proceed
  if other requirements and authorization permit it.
- **INADEQUATE:** blocking—name critical untested logic or failing required evidence.
- **NOT ASSESSED:** name missing input; supply it and rerun if authorized/available,
  preserving both results, otherwise overall at best NOT ASSESSED.

## LP-CODE-REVIEW

No implementation file exists: skip with that reason and Reviewed by: self, no
independent review. Otherwise invoke actual `game-studio-lead-programmer` with
resolved `studio/docs/director-gates/lp-code-review.md`.

Give it:

- Objective: review this implementation against its actual criteria/design and
  governing ADR constraints, independently of the coordinator's verdict.
- Actual implementation paths and story path; relevant GDD path/sections and
  governing ADR path/Decision/Consequences. Read GDD/ADR by section, not whole.
- Applicable tier, standards, prior checks, accepted/rejected own calls and
  existing test/evidence paths with actual limitations. At minimal, explain that
  story/brief is the design contract; do not fabricate a missing GDD/ADR.

Reconcile its actual result:

- **APPROVE:** record actual lead-programmer review; no write authorization implied.
- **CONCERNS:** present concrete concerns; reuse actual acceptance of the same
  unchanged concerns, otherwise ask Revise the flagged issues / Accept and go on /
  Discuss further. Until answered, no cleared handoff/closure. Accepted concerns
  remain advisory in the notes; revision requests remain outstanding and no
  implementation fix is performed here.
- **REJECT:** blocking; no COMPLETE verdict until resolved. A separately authorized
  close-anyway preserves REJECT and the adverse overall verdict/risk in history.
- **NOT ASSESSED:** supply actual missing input and rerun, or carry the unknown
  into overall NOT ASSESSED unless a known blocker already outranks it.

Unavailable/refused/failed role or unreadable gate is NOT ASSESSED with the actual
reason, never a successful review. A launched process or exit zero is not a review
verdict; inspect its result. Reviewed by identifies only actual participation:
lead-programmer when it reviewed, self/no independent review when it did not, with
failed attempts visible. No review result implies human visual/play approval.
