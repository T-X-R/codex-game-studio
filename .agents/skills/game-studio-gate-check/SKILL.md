---
name: game-studio-gate-check
description: Assess whether a game is ready to advance to a named development stage, with evidence-based PASS, CONCERNS, NOT ASSESSED or FAIL and an authorized stage update. Use for phase-readiness decisions, not a general status query or an ordinary implementation task.
---

# Check readiness for the next development stage

Work from the game root with its pinned CLI. Read
`node .game-studio/run.cjs config get --json` and use effective values, provenance
and warnings: project stage, workflow/rigor, review mode, automation, QA level,
coverage minimum, testing strictness, performance policy/budgets, team size and
workflow overrides. Read failures are NOT ASSESSED, not permission to invent
settings. A supplied `--review full|lean|solo` is a one-run override only.

This is a readiness decision; stage detection/status is a different task.
Confirm the target and consequential decisions, then complete authorized checks
and reporting without per-file approval loops. Never automatically run a phase
gate merely because implementation has finished. Preserve read-only requests.
Do not fix missing artifacts, change project scope, accept ADRs or publish during
this assessment. A gate verdict governs this Skill's stage write, not whether
the user is allowed to continue working.

## Choose exactly one transition

An explicit target in the user's request is sufficient; do not ask them to repeat
it. Accept these six target IDs or their stage titles. With no target, inspect
the recorded stage (including CLI provenance for a legacy mirror), propose its
next transition and ask the user to confirm before running checks. If the stage
is absent or conflicting, use available project evidence to explain a candidate,
not to silently set it. Stop at Release rather than inventing an eighth stage.
No answer, dismissal or expired question is consent to a target or stage write.

Load only the selected phase definition using the corresponding pinned resource
command; the returned path is in the package, not an assumed game-local folder:

| Target ID / new stage | Source phase for artifact checks | Definition command |
| --- | --- | --- |
| systems-design / Systems Design | concept | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-systems-design.md --json` |
| technical-setup / Technical Setup | systems-design | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-technical-setup.md --json` |
| pre-production / Pre-Production | technical-setup | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-pre-production.md --json` |
| production / Production | pre-production | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-production.md --json` |
| polish / Polish | production | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-polish.md --json` |
| release / Release | polish | `node .game-studio/run.cjs resource path studio/docs/phase-gates/gate-release.md --json` |

The seven stage titles are Concept, Systems Design, Technical Setup,
Pre-Production, Production, Polish and Release. Retain the initially recorded
stage for the later concurrency check. Do not load the other five definitions.

## Assess, report and hand off

Read the relevant reference as the workflow reaches it:

1. [Apply tiers and independent policies](references/tiers.md): distinguish
   project workflow, per-system overrides, QA, smoke, performance and the named
   not-applicable transition. Solo skips directors, not quality checks.
2. [Collect and assess evidence](references/checks.md): use artifact, GDD and ADR
   observations where applicable, spot-read substantive content, run required
   tests and examine actual smoke/performance/cross-reference evidence.
3. [Resolve unknowns and run the director panel](references/assessment.md): reuse
   supplied answers, ask for missing manual facts and explicitly delegate to the
   available native roles the selected panel requires. Preserve unknowns.
4. [Report and challenge the verdict](references/verdict.md): apply
   FAIL → CONCERNS → NOT ASSESSED → PASS precedence, retain all required unknowns,
   complete the five-question verification and save only within authorized scope.
5. [Update the stage](references/stage.md) only when a stage change is requested
   or eligible to offer: PASS needs specific authorization; CONCERNS additionally
   needs explicit acceptance of the actual risks and no required unknowns.
   FAIL/NOT ASSESSED never advance. Use transactional config writes and verify
   both `project.yaml` and `production/stage.txt`; reuse prior exact authorization.
6. [Offer the next useful work](references/next-steps.md): respect minimal routing,
   dependency order and installed capability availability. Do not auto-remediate.

Reuse agreed goal, target, human answers and write scope in guided execution.
Collaborative mode keeps its chosen review cadence; autonomous mode still cannot
invent human play observations, accept risks or authorize a stage change.
Record actual role execution and its limits; an unavailable role is not an
independent review. End with the verdict, material blockers/unknowns, report path
when saved, the actual stage-update outcome and one concrete next action.
