# Apply the gate's effective requirements

The loaded phase definition is the checklist. The artifact catalog's `required`
flag does not add requirements that the chosen gate never asks for. In particular,
Concept → Systems Design does not acquire an art-bible or systems-index blocker
just because those catalog steps are absent.

Apply the phase definition's full baseline and its resolved workflow reduction:
`drop` means not checked at that tier; `recommended` means a known gap is CONCERNS,
not a blocker. Unmentioned items retain their baseline status. Keep the applicable
required/recommended/dropped sets visible when judging evidence.

## QA and performance are separate settings

`qa.level` relaxes automated test evidence independently of workflow:

- minimal: no per-story automated test requirement, even at workflow full.
  Missing game tests or a game-test runner alone is not a readiness gap.
- standard: Logic and Integration tests must pass at their effective strictness.
- full: also require the coverage check and regression suite, using the configured
  `qa.coverage_minimum` when present. Do not invent a coverage threshold.

Where the phase gate asks for story evidence, UI screenshots and Visual/Feel
screenshots plus lead sign-off remain required at every QA level. QA minimal
waives tests, not visual evidence.

A required smoke check remains required at every QA level: it is build health,
not per-story evidence. At QA minimal its game-test row may be WAIVED, but build
health (configured smoke/build when available), actual launch and critical paths
remain. Nobody launching the build is NOT ASSESSED, not a waiver or PASS.

After reductions, show how many required artifacts remain. Zero required
artifacts is NOT ASSESSED, naming the gate and reducers, except for the explicitly
not-applicable Systems Design → Technical Setup gate at workflow minimal. That
exception returns PASS with its definition's note and skips the director panel;
stage authorization still follows [the stage update reference](stage.md).

Performance policy is never removed by a workflow reduction. Use effective
`performance.enforce`: warn means CONCERNS for observed breaches; block makes
breaches blockers from the Polish target gate onward; off makes budgets
informational and removes them from the verdict. Earlier gates do not invent a
performance requirement their definition does not ask for. Surface invalid-value
warnings from the configuration reader and use its resolved fallback, not a
second raw-file interpretation. This follows the upstream check procedure's
explicit phase boundary; its broader tier note does not move that boundary.

## Per-system and additive overrides

On applicable MVP GDD checks (Technical Setup and Production targets), resolve
each system with `node .game-studio/run.cjs config get modes.workflow --system <system> --json`.
The system is the GDD filename stem. A valid explicit system override wins;
otherwise use the project workflow. A higher tier raises that system's bar;
a lower one relaxes only that system, not all GDDs.

Check override keys against the observed GDD stems in both directions. An orphan
key is CONCERNS: name it, list actual stems, and explain that it has no effect.
Do not silently rename the override or guess which GDD was intended.

- full requires Overview, Player Fantasy, Detailed Rules/Design, Formulas, Edge
  Cases, Dependencies, Tuning Knobs and Acceptance Criteria.
- standard requires Overview, Detailed Rules/Design, Edge Cases, Dependencies
  and Acceptance Criteria. Formulas is additionally required when the system
  defines numeric rules (rates, curves, thresholds or costs); category alone
  cannot decide this. Player Fantasy and Tuning Knobs are advisory.
- minimal imposes no GDD section floor. Do not invent acceptance-criteria-only
  requirements for a system deliberately set to minimal.

`workflow_overrides.art_bible_strict: true` requires the complete nine-section
art bible at the Pre-Production and Production targets regardless of workflow
or visual-asset stories. On applicable GDD checks, `edge_cases: true` and
`tuning_knobs: true` add those sections to the effective requirements. False is
a no-op, never permission to remove something the tier already requires.
