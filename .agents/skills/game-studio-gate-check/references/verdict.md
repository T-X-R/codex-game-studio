# Report the verdict and challenge the evidence

Produce a report for the actual source → target transition with date, effective
workflow/QA/review/strictness/performance settings and their sources. Include the
applicable artifact checklist (present/required counts), quality checklist
(passing/assessed/required counts), manual unknowns, actual director outcomes and
named omissions, blockers, concerns and concrete remediation. State what was
waived or not applicable and why. A denominator is not a completeness score for
sections the effective tier does not require.

Use one `### Verdict: PASS | CONCERNS | NOT ASSESSED | FAIL` line with the selected
value, supported by item-level findings. Apply precedence in this order:

1. FAIL: an applicable hard blocker, strict test failure, specified negative
   play result or required director NOT READY.
2. CONCERNS: known advisory gaps or director concerns, with no harder failure.
3. NOT ASSESSED: required evidence/check/reviewer unavailable or unresolved,
   with no known higher-precedence finding.
4. PASS: all applicable required checks established and no remaining concerns,
   subject to the named not-applicable design-gate exception.

A CONCERNS or FAIL headline does not erase unknowns. List each required unknown
under blockers as NOT ASSESSED with its reason; any such item prevents stage
advancement even if the headline is CONCERNS. A recommended skipped slice is a
concern, a built-but-unplayed slice is unassessed, and a confirmed broken built
slice fails as the phase definition specifies. At minimal Production, use the
two current-build checks instead of resurrecting dropped slice requirements.

Required unknowns include present-but-empty/unreadable/template-only artifacts,
unmeasured profiling data or unset budgets, applicable tests that could not run,
unresolved manual questions, a required reviewer returning no usable verdict,
and an upstream required review that itself says NOT ASSESSED. Missing required
artifacts remain known findings, rather than being hidden behind an unknown.

Do not require waived tests at QA minimal or deliberately omitted directors at
solo/narrower workflow. Those are named policy choices; an expected reviewer
failing to respond is a different condition. Do not infer a passing measurement
from a budget placeholder, passing tests from exit zero, human play from replay,
or independent review from a coordinator's own opinion.

## Chain of verification

Before finalizing, generate five questions that could disprove the draft verdict.
Answer at least two through actual targeted file reads or check invocations and
record those tool actions. Work from the source evidence, not just the draft's
claims. For PASS challenge unresolved manual items and empty artifacts; for
CONCERNS challenge severity and combined impact; for FAIL challenge overstated
requirements and missing blockers; for NOT ASSESSED identify exactly which input
is absent and whether any known failure was obscured.

Revise only on evidence. A newly found unknown can turn PASS into NOT ASSESSED;
a known blocker or concern takes its proper precedence. Never reason an unknown
away without obtaining the input. Report `Chain-of-Verification: N questions
checked — verdict unchanged` or identify the revision and its evidence.

## Save within the authorized scope

A requested gate report may be saved to `production/gate-checks/` under the user's
existing authorization. Use the user's specified path or a new descriptive,
dated report path; preserve unrelated reports. In a read-only request return it
in the conversation instead. Do not repeat per-file permission questions in
guided mode. Collaborative mode keeps the requested draft-review cadence.

Record scope, incomplete items and actual review outcomes so an interrupted or
partial report cannot look like a completed PASS. Report permission is not
stage permission. Do not create missing design/code/test artifacts or perform
remediation to manufacture a pass. On an authorized CONCERNS advancement, append
Accepted Risks only for the actual concerns the user explicitly accepted, with
the date; do not invent acceptance or use a generic “advance anyway” as an
acceptance of undisclosed risks.
