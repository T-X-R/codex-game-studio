> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# AD-ART-BIBLE — Art Bible Sign-Off

Agent: `game-studio-art-director` | Model/permissions: inherited | Domain: Visual identity, art bible, visual production readiness

**Trigger**: After the art bible is drafted (`$game-studio-art-bible`), before asset production begins

**Context to pass**:
- Art bible path (`design/art/art-bible.md`)
- Game pillars and core fantasy
- Platform and performance constraints (`platform.*` and `performance.*` from `project.yaml`, falling back to `docs/technical-preferences.md`)
- Visual identity anchor chosen during brainstorm (from `design/gdd/game-concept.md`; if there is no `design/gdd/game-concept.md`, pass Look and references in `design/game-brief.md` instead, or its retained legacy art-direction field)

**Prompt**:
> "Review this art bible for completeness and internal consistency. Does the color
> system match the mood targets? Does the shape language follow from the visual
> identity statement? Are the asset standards achievable within the platform
> constraints? Does the character design direction give artists enough to work from
> without over-specifying? Are there contradictions between sections? Would an
> outsourcing team be able to produce assets from this document without additional
> briefing? Return APPROVE (art bible is production-ready), CONCERNS [specific
> sections needing clarification], or REJECT [fundamental inconsistencies that must
> be resolved before asset production begins]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
