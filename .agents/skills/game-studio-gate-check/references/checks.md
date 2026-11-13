# Collect observations and examine the evidence

Read `docs/consistency-failures.md` if present. Carry recurring conflicts in the
target domain into the relevant checks; do not turn unrelated historical notes
into new requirements.

## Deterministic observations

Run `node .game-studio/run.cjs check --kind artifacts --phase <source-phase> --json`
for the phase being left, not the target. At workflow minimal also run
`node .game-studio/run.cjs check --kind artifacts --path minimal --json` for its
brief/story floor. The not-applicable design transition needs no invented GDD
inspection; record its exemption explicitly.

The result identifies its actual packaged catalog and group/step denominators.
PRESENT, ABSENT, SHORT and PATTERN_MISS describe files. NO_CHECK is not PRESENT:
carry relevant unobservable items into manual assessment. UNKNOWN, an unavailable
runtime or a failed operation cannot become a passing check. Apply the loaded
gate and effective tiers to these observations; catalog flags alone are not a
phase verdict. Do not create missing artifacts to manufacture a PASS.

Existence is not adequacy. Spot-read every artifact on which the verdict turns,
checking real content rather than blank headings, template markers or asserted
verdict lines. Find headings and read the relevant sections; avoid opening every
unrelated document. A required absent artifact is a finding; a present but empty,
placeholder-only or unreadable artifact is NOT ASSESSED.

A smoke report is always material when required. Check its actual date/build,
runner/test files, claimed critical-path code and retained logs. Use
`node .game-studio/run.cjs engine inspect --json` for actual roots; unresolved
roots are NOT ASSESSED. A claimed passing suite with no test files/runner, or a
claimed path with no implementation, is a contradiction, not evidence. Compare
the report date with the newest commit affecting the code root when history is
available; missing dates or stale results must be reported. Grade contradictions
as blockers where smoke is required, concerns where recommended. Do not mistake
a screenshot or deterministic replay for human play acceptance.

For MVP GDD checks, run `node .game-studio/run.cjs check --kind gdd --json`.
Read each file's present/absent/placeholder arrays, then apply its effective tier
and additive overrides from [tiers](tiers.md). Detailed Design satisfies
Detailed Rules. Missing required sections are blockers; placeholders are not
written design. Spot-read required substantive content, including conditional
numeric rules. No system files is not a successful design inspection.

For the Technical Setup target, inspect the cross-GDD review when applicable:
full requires it, standard recommends it, minimal drops it. A missing required
report is a blocker; a NOT ASSESSED or focus-only report cannot establish both
consistency and design-theory coverage. A FAIL needs resolution; unresolved
issues stay visible rather than disappearing behind the report's existence.

For the Pre-Production target use its definition's ADR graph and report-mode
rules. Do not use a narrow architecture review as proof of full coverage.

## Tests, performance and cross-references

Where automated tests apply, run `node .game-studio/run.cjs test --json` using
configured commands and inspect preserved logs and actual counts. Missing runner,
failed startup, timeout, interruption or zero executed tests is NOT ASSESSED.
Nonzero assertion results are failed checks, not unavailable checks. A process
exit zero alone cannot establish test, engine or coverage success.

Read `node .game-studio/run.cjs config get gate_level --json` for effective
per-type strictness and provenance; it preserves allowed local overrides and
legacy boolean fallback. Logic and Integration default to blocking. A failure
at blocking strictness is FAIL; at advisory strictness it is CONCERNS, listed
under recommendations rather than blockers. Classify Unreal failures by story
Type because its root can mix both kinds; if type is unknown, use the stricter
applicable level. Surface config warnings instead of silently coercing values.
At QA minimal these per-story test checks do not run; smoke remains separate.

Compare configured framerate/frame-budget/draw-call/memory budgets with actual
profiling data in `tests/performance/` or a relevant performance report. Use
`node .game-studio/run.cjs config get perf_budgets --json` and effective
`performance.enforce`; apply [the policy](tiers.md). Template numbers are not
measurements. If applicable data is unavailable, record NOT ASSESSED and offer
the missing profiling task; declining that task does not create a measurement.

Where the loaded gate requires them, cross-check GDD mechanics against actual
code, architectural systems against implementations, sprint references against
real stories and GDD/ADR IDs, and localization against the actual code root.
An unresolved root is NOT ASSESSED, never zero hardcoded-string hits. Use the
phase definition's security/localization report scope rules and preserve prior
findings that a narrower rerun did not reassess.
