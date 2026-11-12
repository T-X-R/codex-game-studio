> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator supplies context and aggregates the result.

# TD-MANIFEST — Control Manifest Review

Agent: `game-studio-technical-director` | Model/permissions: inherited | Domain: Architecture, engine risk, performance

**Trigger**: After control-manifest rules are extracted and previewed
(`$game-studio-create-control-manifest` Phase 4), before the manifest file is written

**Context to pass**:
- The Control Manifest Preview from Phase 4 (rule counts per layer, full extracted rule list)
- The list of ADRs covered
- Engine version
- Any rules sourced from `technical-preferences.md` or engine reference docs

**Prompt**:
> "Review this control manifest before it is written. Are all mandatory ADR
> patterns captured and accurately stated? Are the forbidden approaches complete
> and correctly attributed to their source ADR? Were any rules added that lack a
> source ADR or preference document — that is, invented rather than extracted?
> Are the performance guardrails consistent with the constraints the ADRs
> actually set? Return APPROVE, CONCERNS [list the specific rules to revise], or
> REJECT [rules that are wrong or unsourced and must be fixed before the manifest
> is written]."

**Verdicts**: APPROVE / CONCERNS / REJECT

Use the selected native role and this gate's own verdict vocabulary. Missing unreadable review input is NOT ASSESSED; a phase-required artifact explicitly reported absent is a readiness finding, while an artifact not required at this phase/tier is not. A verdict authorizes no file writes, stage change or publication. Named workflow triggers describe handoffs; check that the destination is installed before invoking it.
