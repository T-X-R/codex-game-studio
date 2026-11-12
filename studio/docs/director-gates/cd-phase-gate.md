> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# CD-PHASE-GATE — Creative Readiness at Phase Transition

Agent: `game-studio-creative-director` | Model/permissions: inherited | Domain: Vision, pillars, player experience

**Trigger**: At `$game-studio-gate-check` when `modes.workflow` is `full` — the panel narrows by workflow, and only the full panel includes creative-director; spawn in parallel with TD-PHASE-GATE, PR-PHASE-GATE and AD-PHASE-GATE

**Context to pass**:
- Target phase name and the resolved `workflow` tier
- The target gate's required and recommended artifacts at the resolved tier (from `$game-studio-gate-check`'s loaded gate file)
- List of all artifacts present (file paths)
- Game pillars and core fantasy

**Prompt**:
> "Review the current project state for [target phase] gate readiness from a
> creative direction perspective, judged against what this gate requires at this
> tier (the required-artifacts list you were given). Are the game pillars
> faithfully represented in the design artifacts this phase requires? Does the
> current state preserve the core fantasy? Do any design decisions in the GDDs,
> architecture or build that exist so far compromise the intended player
> experience?
> A required artifact passed as "none" is a finding; one passed as "not expected
> before [phase]" or "not required at `workflow: [tier]`" is not a finding.
> Return READY, CONCERNS [list], or NOT READY [blockers]."

**Verdicts**: READY / CONCERNS / NOT READY

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
