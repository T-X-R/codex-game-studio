> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# CD-PLAYTEST — Player Experience Validation

Agent: `game-studio-creative-director` | Model/permissions: inherited | Domain: Vision, pillars, player experience

**Trigger**: After playtest reports are generated (`$game-studio-playtest-report`), or after
any session that produces player feedback

**Context to pass**:
- Playtest report — its file path, or its content inline when the calling skill
  reviews before saving (`$game-studio-playtest-report` does)
- Game pillars and core fantasy statement
- The specific hypothesis being tested

**Prompt**:
> "Review this playtest report against the game's design pillars and core fantasy.
> Is the player experience matching the intended fantasy? Are there systematic issues
> that represent pillar drift — mechanics that feel fine in isolation but undermine
> the intended experience? Return APPROVE (core fantasy is landing), CONCERNS [gaps
> between intended and actual experience], or REJECT [core fantasy is not present —
> redesign needed before further playtesting]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
