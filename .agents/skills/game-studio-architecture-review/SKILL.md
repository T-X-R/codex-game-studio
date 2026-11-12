---
name: game-studio-architecture-review
description: Review whether game architecture decisions cover GDD requirements, agree with each other and the pinned engine, or trace requirements through ADRs, stories and test files. Use for full architecture review, coverage, consistency, engine audit, one GDD or an RTM; not ADR authoring or source-code review.
---

# Review the game's architecture

Assess the actual architecture and its evidence. Arriving from architecture or
ADR authoring calls for a fresh review chat; do not adopt the author's conclusions
as your independent baseline. This is an advisory review, not architecture
acceptance, implementation, stage advancement or permission to ship.

**This workflow spawns no agents.** Its engine second look applies the local
[engine lens](references/engine-lens.md) after the engine audit. Name it as this
reviewer's lens assessment, never as a native specialist consultation. It has no
Technical Director or Lead Programmer gate; those belong to architecture authoring.
Review mode and team size do not add a panel here.

## Resolve the requested scope

From the game root, read applicable AGENTS.md and run:

```sh
node .game-studio/run.cjs config get --json
```

Use effective project `workflow`, `automation`, engine and project-standard
values with their provenance. Do not substitute rigor for workflow or apply
per-system workflow overrides: this source workflow is project-level. Focus:

| Argument | Assessment |
| --- | --- |
| omitted / `full` | Requirements, coverage, conflicts/dependencies, engine, master architecture; story/test linkage when stories exist. |
| `coverage` | Requirements and ADR coverage only. |
| `consistency` | Cross-ADR conflicts and deterministic dependency ordering only. |
| `engine` | Engine audit and local engine lens only; read a GDD only to assess a discovered design contradiction. |
| `single-gdd <path>` | One actual GDD's requirements and relevant ADR coverage; no unrelated-system conclusions or edits. |
| `rtm` | Fresh requirements → ADR → story → test-file matrix; do not reuse a prior receipt. |

Ask for a missing/ambiguous single-GDD path or unknown focus; do not choose one.
Project workflow **full** covers the in-scope set. **Standard** requires the master
architecture and critical ADRs: Foundation-layer decisions; uncertain Layer stays
critical. Noncritical findings are advisory, not an excuse to claim whole-project
coverage. **Minimal** makes this formal review not applicable: explain the tier,
return no PASS and do not create formal artifacts or change policy automatically.
An explicit user request for a broader review can be honored with its actual
scope labeled; it does not silently change project settings.

## Assess, then record

1. Read [inputs and freshness](references/inputs-and-freshness.md) before using a
   prior report. Establish actual denominators and missing evidence; load complete
   needed sections, not arbitrarily truncated windows.
2. For coverage/full/single-gdd/rtm, read [requirements and traceability](references/requirements-and-traceability.md).
   Preserve stable IDs and separate Accepted coverage from Proposed, unknown and gaps.
3. For full/consistency, read [conflicts and engine](references/conflicts-and-engine.md)
   for actual conflicts and deterministic dependency observations. For full/engine,
   also perform its pinned-engine audit, local lens and applicable GDD feedback.
4. In full mode assess master architecture coverage using
   [report and handoff](references/report-and-handoff.md). Present the complete
   in-scope matrix/findings and one verdict: **PASS**, **NOT ASSESSED**, **CONCERNS**
   or **FAIL**. Known defects outrank unknowns; unknown required evidence outranks PASS.
5. Read [writes and records](references/writes-and-records.md) only when outputs
   are wanted. Reuse concrete authorization for the named files. Guided mode
   continues routine approved work, but ambiguous requirements, deprecations,
   scope changes and unapproved design revisions still require a decision.
   Collaborative mode previews concrete changes and asks once for the named set.
   Autonomous mode does not invent acceptance of risks or authority for new scope.
6. Finish with actual prerequisites and prioritized next actions. A read-only or
   stop-after-review request ends with findings; do not launch another workflow.

A blocked phase yields a partial report naming missing evidence and the narrower
retry scope, never a fluent claim of completion. Verify every approved artifact
exists and contains the reviewed result before claiming it was written. Shared
checkpoints are coordinator-owned expected-hash transactions; never auto-trust
Hooks, change host permissions, commit or publish as part of this review.
