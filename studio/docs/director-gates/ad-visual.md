> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# AD-VISUAL — Art Director Visual Consistency Review

Agent: `game-studio-art-director` | Model/permissions: inherited

**Trigger**: After art direction decisions are made, when new asset types are
introduced, or when a tech art decision affects visual style

**Context to pass**:
- Art bible path (if exists at `design/art/art-bible.md`)
- The specific asset type, style decision, or visual direction being reviewed
- Reference images or style descriptions
- Platform and performance constraints

**Prompt**:
> "Review this visual direction decision for consistency with the established art
> style and production constraints. Does it match the art bible? Is it achievable
> within the platform's performance budget? Are there asset pipeline implications
> that create technical risk? Return APPROVE, CONCERNS [specific adjustments], or
> REJECT [style violation or production risk that must be resolved first]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
