> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# TD-ARCHITECTURE — Architecture Sign-Off

Agent: `game-studio-technical-director` | Model/permissions: inherited | Domain: Architecture, engine risk, performance

**Trigger**: After the master architecture document is drafted (`$game-studio-create-architecture`
Phase 7), and after any major architecture revision

**Context to pass**:
- Architecture document path (`docs/architecture/architecture.md`)
- Technical requirements baseline (TR-IDs and count)
- ADR list with statuses
- Engine knowledge gap inventory

**Prompt**:
> "Review this master architecture document for technical soundness. Check: (1) Is
> every technical requirement from the baseline covered by an architectural decision?
> (2) Are all HIGH risk engine domains explicitly addressed or flagged as open
> questions? (3) Are the API boundaries clean, minimal, and implementable? (4) Are
> Foundation layer ADR gaps resolved before implementation begins? Return APPROVE,
> CONCERNS [list], or REJECT [blockers that must be resolved before coding starts]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
