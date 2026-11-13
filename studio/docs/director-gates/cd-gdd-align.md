> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# CD-GDD-ALIGN — GDD Pillar Alignment Check

Agent: `game-studio-creative-director` | Model/permissions: inherited | Domain: Vision, pillars, player experience

**Trigger**: After a system GDD is authored (design-system, or any workflow that
produces a GDD)

**Context to pass**:
- GDD file path
- Game pillars (from `design/gdd/game-concept.md` or `design/gdd/game-pillars.md`; if there is neither, `design/game-brief.md` has no pillars — pass its pitch and "what they feel" line)
- MDA aesthetics target for this game
- System's stated Player Fantasy section

**Prompt**:
> "Review this system GDD for pillar alignment. Does every section serve the stated
> pillars? Are there mechanics or rules that contradict or weaken a pillar? Does
> the Player Fantasy section match the game's core fantasy? Return APPROVE, CONCERNS
> [specific sections with issues], or REJECT [pillar violations that must be
> redesigned before this system is implementable]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
