---
name: game-studio-smoke-check
description: Assess a game's critical paths before QA hand-off or after a fix, using actual test results, coverage evidence and confirmed manual checks.
---

# Check readiness for QA

Produce an evidence-backed smoke verdict, not a claim that a successful command
proves a healthy game. This is assessment work: preserve source, tests and project
configuration. Report failures and the next action; fix them only when the user
has also authorized fixes. No director delegation or stage promotion is required.

Accept `sprint` (default) or `quick`, optionally `--platform pc|console|mobile|all`.
Quick skips the coverage scan and data/performance batch, not automated tests,
core stability, changed mechanics or requested platform checks. Label every
quick verdict with its reduced scope. Reject unknown modes before running tests.

## Establish the scope

Work from the game root containing `.game-studio/run.cjs`. Use its installed
help, `config get --json`, `config get gate_level --json`, and `engine inspect
--json`. Resolve QA level, workflow, strictness and provenance from these results;
keep their warnings. Inspect the actual engine marker, configured commands,
runner dependencies and game test files in the returned test root and
`tests/smoke/`. Framework tests, empty directories, placeholders and Markdown
checklists do not constitute game tests. Respect excluded framework directories
when the code root is `.`. Note CI configuration, without claiming it ran.

Locate the current QA plan under `production/qa/qa-plan-*.md` and the current
sprint where relevant. Prefer the user-selected scope; otherwise inspect recency
and contents before choosing a plan. Missing QA plans are optional in a minimal
workflow, not permission to invent stories. Report engine/version discrepancies
and unresolved roots; an installed editor and a declared version are different
observations. Do not install editors, packages or browsers implicitly.

When no game test files exist:
- At standard/full QA, deliver **NOT ASSESSED — no game tests found**, naming the
  inspected roots and how to supply actual tests. Stop before running the suite
  or manual batches. If explicitly asked for a report, record this finding.
- At minimal QA, mark automated tests **WAIVED — minimal QA, no game tests**.
  Announce that suite execution and coverage are skipped. Run the configured
  smoke command, otherwise the configured build, then assess launch and critical
  paths. Waiver never supplies a successful launch or a human observation.

## Execute and inspect evidence

Read [references/runners.md](references/runners.md) for the applicable engine
before executing. Use a new project-relative evidence directory per invocation:

```bash
node .game-studio/run.cjs test --kind test --timeout 900000 --output production/qa/evidence/smoke-RUN/tests --json
```

Use `--kind smoke` or `build` where appropriate; builds may use 1800000 ms.
Choose a unique RUN identifier and preserve existing reports. Inspect the saved
`report.json`, `stdout.log`, `stderr.log` and current runner result files, even
when the CLI exits nonzero. Keep command execution status, original process exit,
suite interpretation and the final smoke verdict distinct. Missing capability
is NOT ASSESSED; failed assertions, build errors or timeouts are FAIL. A zero
exit with zero tests or unknown result completeness is not a passing suite.

Then read [references/checks.md](references/checks.md) for coverage, actual
manual observations and requested platforms. Reuse observations already supplied
for this build; don't repeat answered questions. With missing human evidence,
ask concise grouped questions if interaction is wanted, and mark unanswered
checks NOT ASSESSED. Silence or a default choice is not confirmation. An
unattended run can finish with an honest incomplete report.

## Report and gate

Read [references/verdict.md](references/verdict.md) before deciding the result.
Write `production/qa/smoke-DATE.md`, using a unique suffix if it already exists,
when reporting is part of the authorized request. Reuse that authorization rather
than asking permission for the report file again. A read-only request gets the
report in the response without writes. Include the exact scope, observations,
remaining checks and hand-off decision. Do not commit, publish, change QA policy
or delegate to another agent merely because the report was produced.
