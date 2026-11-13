# Codex behavior contract: smoke-check (S054)

The source cases in `smoke-check.md` remain the inventory of upstream behavior.
The Codex entrypoint and three focused references replace six mechanically
ordered phase files. Read the applicable reference before its work; repeat only
the needed read after context loss. Host-specific YAML injection, Bash helper
allowlists and question APIs are replaced by installed CLI operations and the
host's available interaction tools.

## Adaptations

- Reuse authorized execution/reporting scope; no repeated report-write approval.
  A read-only request creates neither execution evidence nor a report file.
- Keep source/tests/configuration unchanged during assessment. `test --command`
  allows a declared one-run runner adjustment without changing shared commands.
- Explicit suite/build limits preserve the upstream 900/1800 second budgets;
  default CLI operations retain their shorter 120 second limit.
- Runner process success is not suite success. Unknown completion/count evidence,
  zero/all-skipped tests and unobserved manual checks cannot yield a full pass.
- No implicit director or QA role invocation, host permission changes or stage
  promotion. Stored QA policy is not evidence that a native Hook enforces it.

## Behavior matrix

| Scenario | Required observation |
| --- | --- |
| Passing actual tests, current manual checks supplied, known coverage | PASS with accurate provenance/counts. |
| Failing assertion plus unavailable manual observations | FAIL outranks missing evidence; strict standard QA blocks hand-off. |
| Minimal QA failure or explicit advisory config strictness | Verdict stays FAIL; report policy as advisory. |
| Actual zero/all-skipped test run | NOT ASSESSED, never pass from exit zero. |
| No game tests at standard/full QA | NOT ASSESSED with inspected roots and remediation; no suite/manual batches. |
| No game tests at minimal QA | WAIVED tests; configured smoke/build and actual launch/critical paths carry assessment. |
| Automated pass but no current launch/manual observation | NOT ASSESSED; do not invent a user confirmation. |
| Quick run | Tests and core/changed mechanics run; coverage/data-performance explicitly excluded from verdict and report. |
| Full run with UNKNOWN story or skipped required performance | NOT ASSESSED even if tests pass. |
| MISSING test evidence with otherwise complete passing observations | PASS WITH WARNINGS and concrete story/evidence gap. |
| Console clipping or another requested platform failure | Platform and overall FAIL, with original description. |
| Requested platform unavailable | NOT ASSESSED, not another platform's pass. |
| Timeout/compile/build failure or missing fresh expected results | FAIL with retained invocation evidence; stale results cannot rescue it. |
| Runner/editor/framework unavailable | NOT RUN / NOT ASSESSED with actual diagnostic, no implicit install. |
| gdUnit4 101 vs 103/104 vs zero cases | Runner warning vs unavailable vs unassessed, preserving raw exit and wrapper judgment. |
| Unity EditMode passes, PlayMode fails/unavailable | Separate invocations/results; final FAIL/NOT ASSESSED respectively. |
| Unreal build failure/no matching automation | FAIL/NOT ASSESSED respectively; use actual OS/editor configuration. |
| Re-run after prior evidence exists | New output/report paths; old artifacts preserved. |

Use `toolkit/test/prepare-smoke-skill.mjs` for isolated packed Web/Node fixtures.
The supplied manual feedback in these fixtures is a role-play input for verdict
testing, not evidence a person played a game. The evaluator receives requests,
installed Skill paths and raw project files; snapshots are separate in
`before.json`. Record each command/exit, generated report and source preservation.
Review the report's reasoning, not just a keyword matched in the file.

Content checks and pack tests prove resource installation only. Supplied-Skill
evaluation does not close native CLI/desktop discovery, live Godot/Unity/Unreal
runner interpretation or human acceptance. Record unexecuted rows as pending;
keep S054 and its parent gate open until the relevant full matrix is evidenced.
