# QL-TEST-COVERAGE — QA Lead Test Coverage Review

Role: `game-studio-qa-lead`; inherit the session model and permissions.
Derived from the upstream QA gate; see the repository's upstream attribution.

Use after implementation and before marking stories Complete. The calling
workflow passes the resolved definition to the assigned role. This review does
not itself change story status.

Required inputs:
- Implemented stories and their types: Logic / Integration / Visual/Feel / UI /
  Config/Data (legacy Visual and Config labels retain the same meaning).
- Test file paths in the engine's actual test roots, or an explicit statement
  that files are absent, with available execution/evidence paths.
- GDD acceptance criteria and applicable edge cases for the system.
- Effective QA policy, resolved from project settings or supplied with provenance.

Map each criterion and GDD edge case to its test/evidence, identifying uncovered
paths. At standard/full QA, Logic needs passing unit tests; Integration needs
passing integration tests or a documented playtest. Minimal QA waives that test
evidence but does not turn unexecuted tests into passes. Visual/Feel always needs
retained screenshots plus named lead sign-off; UI needs screenshots of touched
screens, without importing the Visual/Feel sign-off gate. Config/Data needs smoke
evidence. Apply resolved per-type gate levels and smoke policy, recording advisory
findings separately from blockers.

Read actual evidence and counts, not only file names or summary claims. An
explicitly absent required test/report or an empty/all-skipped suite is a coverage
finding; no executed tests means execution is NOT ASSESSED. A reported failure
cannot become a pass through a waiver or successful wrapper exit.

**Verdicts**: ADEQUATE / GAPS / INADEQUATE.

- ADEQUATE: coverage meets the applicable standards.
- GAPS: specific missing tests/evidence or edge cases need work.
- INADEQUATE: critical required logic is untested or required evidence fails;
  do not advance affected stories.

Return an explicit verdict and criterion-to-evidence mapping per story, plus an
overall assessment if requested. Use NOT ASSESSED, naming the missing input,
only when input was not supplied/could not be read and no problem was found.
Visible deficiencies take the appropriate adverse verdict even if another input
is unavailable. Report the remaining unassessed portion separately. Never invent
executions, human observations, sign-off or completed bug verification.
