> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# TD-PHASE-GATE — Technical Readiness at Phase Transition

Agent: `game-studio-technical-director` | Model/permissions: inherited | Domain: Architecture, engine risk, performance

**Trigger**: At `$game-studio-gate-check` when `modes.workflow` is `standard` or `full` — the panel narrows by workflow; spawn in parallel with the rest of it (PR-PHASE-GATE, plus CD-PHASE-GATE and AD-PHASE-GATE at `full`)

**Context to pass**:
- Target phase name and the resolved `workflow` tier
- The target gate's required and recommended artifacts at the resolved tier (from `$game-studio-gate-check`'s loaded gate file)
- Architecture document path (if exists)
- Engine reference path
- ADR list

**Prompt**:
> "Review the current project state for [target phase] gate readiness from a
> technical direction perspective, judged against what this gate requires at this
> tier (the required-artifacts list you were given), not what a later phase will
> need. Is the technical groundwork this phase requires in place and sound —
> entering Systems Design, is the concept feasible on the chosen engine; entering
> Technical Setup, do the systems index and GDDs give enough to architect from;
> entering Pre-Production, is the architecture sound and are the Foundation-layer
> decisions complete enough to begin implementation; entering Production or
> later, is the architecture holding up in the build? Are the high-risk engine
> domains addressed to the depth this phase requires? Are performance budgets
> realistic and documented where this phase requires them?
> A required artifact passed as "none" is a finding; one passed as "not expected
> before [phase]" or "not required at `workflow: [tier]`" is not a finding.
> Return READY, CONCERNS [list], or NOT READY [blockers]."

**Verdicts**: READY / CONCERNS / NOT READY

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
