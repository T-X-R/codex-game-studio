# Report and hand-off decision

Keep the evidence verdict separate from policy. Apply these in order:

1. **FAIL**: an observed test/build/parse/compile failure, a launched suite that
   timed out or did not complete, missing expected fresh results, or a failed
   manual/critical-path/platform check. A real failure outranks missing evidence.
2. **NOT ASSESSED**: no failure above, but required observations are unknown:
   runner unavailable, zero/all-skipped tests, unconfirmed NOT RUN, missing
   PlayMode results because it could not run, build not launched, required manual
   or requested platform checks unobserved, UNKNOWN coverage, or an offered full
   data/performance batch skipped. Waived tests at minimal QA do not trigger this
   by themselves; unobserved launch/critical paths still do.
3. **PASS WITH WARNINGS**: all required critical/manual/platform observations
   passed or are validly N/A, and automated evidence passes (or is waived at
   minimal QA), with advisory MISSING coverage or a supported runner warning.
   A suite not run here but explicitly confirmed for this build from the user's
   IDE/CI may support this verdict; retain its reported source and warning.
4. **PASS**: required observations passed or are validly N/A, automated tests
   passed (or were waived at minimal QA with the build/launch path checked),
   and there are no missing evidence rows or warnings.

A quick verdict always says “quick — coverage and data/performance not checked”.
It does not certify the full sprint scope or waive requested platform checks.
No tests at standard/full QA remains NOT ASSESSED even with good manual feedback.

## Enforcement

At minimal QA, an observed FAIL is advisory regardless of strictness. At
standard/full QA, use `config get gate_level`'s `config.smokeCheck` result:
explicit config strictness (including valid personal or legacy scalar fallback)
controls blocking/advisory; unset smoke strictness defaults to blocking.
Surface invalid-setting warnings. Never change the policy to improve the result.
Standard QA expects smoke before phase transitions; full QA before commits.
These are workflow expectations, not proof a native Hook enforces them.

A blocking FAIL says do not hand off until the named failures are resolved.
An advisory FAIL remains FAIL: policy allows hand-off with known failures;
list them and advise resolution before release. NOT ASSESSED never becomes a
pass because policy is advisory; name what must be observed to finish. PASS or
PASS WITH WARNINGS can support manual-QA hand-off within the stated scope.
Suggest re-running this Skill after fixes or missing evidence arrive. Do not
invoke an uninstalled QA role or mark stories complete as part of this utility.

## Durable report

Record, without filling unknowns with invented values:

- Date/build or commit identity, engine, selected mode/platforms, QA level and
  strictness sources; environment discrepancies and plan/checklist paths.
- Each actual command, timeout, original exit, evidence paths and suite verdict;
  real counts/failing names, warnings and current result files. Separate each
  required runner half/mode. A waiver must name minimal QA and absent game tests.
- Coverage rows and missing evidence, or an explicit quick/waived skip. No
  “all covered” statement when nothing was scanned.
- Current-build manual observations, attribution, N/A reasons and unanswered
  checks; requested per-platform results and failure descriptions.
- Overall verdict, its reason, blocking/advisory decision and concrete next step.

Keep prior reports/evidence intact. If the user authorized running and reporting,
write the new report without another per-file approval. If the request is
read-only, do not run commands that create evidence or create a report file;
explain that a fresh execution needs a writable evidence destination. Report
creation alone grants no permission for source fixes, commits or publication.
