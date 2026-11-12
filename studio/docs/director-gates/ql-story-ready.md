# QL-STORY-READY — QA Lead Story Readiness Check

Role: `game-studio-qa-lead`; inherit the session model and permissions.
Derived from the upstream QA gate; see the repository's upstream attribution.

Use before accepting a story into a sprint. The calling workflow passes this
definition's resolved path to the assigned role rather than claiming the check
has already run. Skill-based callers may use the same contract once migrated.

Required inputs:
- Story file path or complete inline story.
- Story type: Logic / Integration / Visual/Feel / UI / Config/Data.
- Acceptance criteria, verbatim.
- GDD requirement: TR-ID and text covered by the story.

Assess every criterion's testability as written. Can a developer unambiguously
tell when it is done? Logic criteria must admit automated tests; Integration
criteria must be observable in a controlled environment. For each criterion,
describe its verification approach. Flag vague criteria and propose measurable
rewrites for the author to confirm. Mark criteria needing a full game build
DEFERRED rather than automatically BLOCKED.

**Verdicts**: ADEQUATE / GAPS / INADEQUATE.

- ADEQUATE: criteria are implementable as written.
- GAPS: specific criteria need refinement.
- INADEQUATE: criteria are too vague; revise before sprint inclusion. A story
  with only a wholly subjective criterion has no testable basis and is INADEQUATE.

Return one explicit verdict per story followed by criterion-level rationale.
Use NOT ASSESSED, naming the input, when required input is unavailable and no
problem was found. A visible problem still receives the appropriate adverse
verdict; separately identify missing context. Distinguish missing review input
from a deficient item under review: an unavailable GDD requirement (even when
explicitly declared absent) leaves traceability NOT ASSESSED if the available
criteria are otherwise sound. Do not label that absence GAPS/INADEQUATE unless
an explicit project criterion requires the story itself to contain that artifact.
An explicitly absent required deliverable, such as a coverage test, is a finding
when that deliverable is what the gate evaluates. Readiness says nothing about
completed test execution or release approval.
