> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# TD-ADR — Architecture Decision Review

Agent: `game-studio-technical-director` | Model/permissions: inherited | Domain: Architecture, engine risk, performance

**Trigger**: After an individual ADR is authored (`$game-studio-architecture-decision`), before
it is marked Accepted

**Context to pass**:
- ADR file path
- Engine version and knowledge gap risk level for the domain
- Related ADRs (if any)

**Prompt**:
> "Review this Architecture Decision Record. Does it have a clear problem statement
> and rationale? Are the rejected alternatives genuinely considered? Does the
> Consequences section acknowledge the trade-offs honestly? Is the engine version
> stamped? Are post-cutoff API risks flagged? Does it link to the GDD requirements
> it covers? Return APPROVE, CONCERNS [specific gaps], or REJECT [the decision is
> underspecified or makes unsound technical assumptions]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
