> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator passes the context and aggregates the result.

# TD-FEASIBILITY — Technical Feasibility Assessment

Agent: `game-studio-technical-director` | Model/permissions: inherited | Domain: Architecture, engine risk, performance

**Trigger**: After biggest technical risks are identified during scope/feasibility
(brainstorm Phase 6, or any early-stage concept with technical unknowns)

**Context to pass**:
- Concept's core loop description
- Platform target
- Engine choice (or "undecided")
- List of identified technical risks

**Prompt**:
> "Review these technical risks for a [genre] game targeting [platform] using
> [engine or 'undecided engine']. Flag any HIGH risk items that could invalidate
> the concept as described, any risks that are engine-specific and should influence
> the engine choice, and any risks that are commonly underestimated by solo
> developers. Return VIABLE (risks are manageable), CONCERNS [list with mitigation
> suggestions], or HIGH RISK [blockers that require concept or scope revision]."

**Verdicts**: VIABLE / CONCERNS / HIGH RISK

Missing required input or unavailable native role: report NOT ASSESSED with the missing dependency. This is never a passing director review. No file changes, stage advancement or publication are authorized by a gate verdict.
