# Update the stage only when the gate and authorization allow it

The gate decides whether this Skill writes a stage; it never prevents the user
from continuing work on the project.

- PASS is eligible to advance with specific user authorization for this target.
  Reuse an explicit instruction such as “check Production readiness and advance
  if it passes”; do not ask again after that condition is actually established.
  If stage advancement was not authorized, show the report and ask whether to
  advance. Permission to inspect or save a report alone does not authorize it.
- CONCERNS does not advance by default. Only when the user requests advancement,
  and no required item is NOT ASSESSED, present the actual concern list and obtain
  explicit acceptance of those risks and the named target. Record each accepted
  concern and date in the report. Previously explicit acceptance of that same
  current list may be reused; a dismissal or elapsed time is not consent.
- FAIL and NOT ASSESSED never advance through this Skill, even if asked to
  bypass the result. Neither can a CONCERNS verdict with required unknowns.
  Name the work or missing evidence that allows a later authorized gate run.

## Transactional update

After eligibility and authorization are established, re-read the recorded stage.
If another change has moved it since this review began, report the conflict
instead of overwriting it with stale review context. Use the pinned operation,
with the title-cased target from SKILL.md, for example:

```sh
node .game-studio/run.cjs config set project.stage "Systems Design" --json
```

This changes shared `project.yaml` and synchronizes `production/stage.txt` through
the toolkit's ownership/transaction checks while preserving other settings,
comments and line endings. Do not use `--local`, a shell dual-write, or a direct
edit fallback when the CLI refuses a layout or detects a conflict. Report the
actual error and recovery action; do not claim advancement from a proposed plan.

After success, run `node .game-studio/run.cjs config get project.stage --json`
and read `production/stage.txt`. Verify both equal the intended target. Report
any mismatch and stop follow-on work; never claim a synchronized stage from one
file alone. Add the actual update outcome to the gate report. This operation
neither accepts ADRs nor updates any assumed Claude status line or Hook.

When the confirmed target is Production or later and effective workflow remains
minimal, offer one advisory line recommending that the user consider standard
rigor via `$game-studio-project-settings`. Name an explicit workflow override
if one would keep rigor from changing this axis. Never change rigor automatically
or make the suggestion affect the verdict.
