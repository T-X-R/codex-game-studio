> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# CD-SYSTEMS — Systems Decomposition Vision Check

Agent: `game-studio-creative-director` | Model/permissions: inherited | Domain: Vision, pillars, player experience

**Trigger**: After the systems index is written by `$game-studio-map-systems` — validates the
complete system set before GDD authoring begins

**Context to pass**:
- Systems index path (`design/gdd/systems-index.md`)
- Game pillars and core fantasy (from `design/gdd/game-concept.md`; if there is no `design/gdd/game-concept.md`, the pitch and "what they feel" line of `design/game-brief.md`, which has no pillars)
- Priority tier assignments (MVP / Vertical Slice / Alpha / Full Vision)
- Any high-risk or bottleneck systems identified in the dependency map

**Prompt**:
> "Review this systems decomposition against the game's design pillars. Does the
> full set of MVP-tier systems collectively deliver the core fantasy? Are there
> systems whose mechanics don't serve any stated pillar — indicating they may be
> scope creep? Are there pillar-critical player experiences that have no system
> assigned to deliver them? Are any systems missing that the core loop requires?
> Return APPROVE (systems serve the vision), CONCERNS [specific gaps or
> misalignments with their pillar implications], or REJECT [fundamental gaps —
> the decomposition misses critical design intent and must be revised before GDD
> authoring begins]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
