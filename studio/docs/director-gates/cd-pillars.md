> Gate definition. The spawning skill passes this file's path to the director agent; the selected native role reads it; the coordinator passes the context and aggregates the result.

# CD-PILLARS — Pillar Stress Test

Agent: `game-studio-creative-director` | Model/permissions: inherited | Domain: Vision, pillars, player experience

**Trigger**: After game pillars and anti-pillars are defined (brainstorm Phase 4,
or any time pillars are revised)

**Context to pass**:
- Full pillar set with names, definitions, and design tests
- Anti-pillars list
- Core fantasy statement
- Unique hook ("Like X, AND ALSO Y")

**Prompt**:
> "Review these game pillars. Are they falsifiable — could a real design decision
> actually fail this pillar? Do they create meaningful tension with each other? Do
> they differentiate this game from its closest comparables? Would they help resolve
> a design disagreement in practice, or are they too vague to be useful? Return
> specific feedback for each pillar and an overall verdict: APPROVE (strong), CONCERNS
> [list] (needs sharpening), or REJECT (weak — pillars do not carry weight)."

**Verdicts**: APPROVE / CONCERNS / REJECT

Missing required input or unavailable native role: report NOT ASSESSED with the missing dependency. This is never a passing director review. No file changes, stage advancement or publication are authorized by a gate verdict.
