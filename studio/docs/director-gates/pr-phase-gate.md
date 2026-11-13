> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# PR-PHASE-GATE — Production Readiness at Phase Transition

Agent: `game-studio-producer` | Model/permissions: inherited | Domain: Scope, timeline, dependencies, production risk

**Trigger**: At every `$game-studio-gate-check` director panel — producer is on the panel at every `modes.workflow`; spawn in parallel with the rest of it (alone at `minimal`, with TD-PHASE-GATE at `standard`, with TD-PHASE-GATE, CD-PHASE-GATE and AD-PHASE-GATE at `full`)

**Context to pass**:
- Target phase name and the resolved `workflow` tier
- The target gate's required and recommended artifacts at the resolved tier (from `$game-studio-gate-check`'s loaded gate file)
- Sprint and milestone artifacts present — at `minimal`, the Build order in `design/game-brief.md` is the plan (that tier has no sprint plan)
- Team size (`team.size`) and sprint capacity (from the current sprint plan, if one exists)
- Current blocked story count

**Prompt**:
> "Review the current project state for [target phase] gate readiness from a
> production perspective, judged against what this gate requires at this tier
> (the required-artifacts list you were given). Is the scope realistic for the
> stated timeline and team size? Is the work of [target phase] planned to the
> depth this gate requires — from the Production gate on, a sprint plan at
> `standard`/`full` and the brief's Build order at `minimal`; before it, no
> sprint plan is expected — and are its dependencies ordered so the team can
> execute it in sequence? What milestone or schedule risks could derail the start
> of [target phase] (its first two sprints, where the tier plans in sprints)?
> A required artifact passed as "none" is a finding; one passed as "not expected
> before [phase]" or "not required at `workflow: [tier]`" is not a finding.
> Return READY, CONCERNS [list], or NOT READY [blockers]."

**Verdicts**: READY / CONCERNS / NOT READY

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
