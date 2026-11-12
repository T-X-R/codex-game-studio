---
name: game-studio-brainstorm
description: Explore and choose game concepts, game-jam ideas or a new direction, then develop the chosen idea into a brief or full concept. Use for ideation and concept refinement, not an agreed implementation task or an existing-game bug fix.
---

# Find and shape a game concept

Work from the game root. Read effective settings with
`node .game-studio/run.cjs config get --json`: `modes.workflow`,
`modes.review_mode`, `modes.automation`, `docs.density` and `engine.name`.
Use returned values and provenance; if settings cannot be read, report that
limitation instead of inventing a tier. A user-supplied `--review full|lean|solo`
is a one-run review override, not a configuration edit. `open` means no hint.

Branch on workflow before discovery or loading templates:

- **minimal:** follow [the lean brief flow](references/lean-brief.md). Offer
  2–3 one-line ideas; no full concept cards, pillars or director gates. With no
  engine or Web selected, a chosen concept normally hands off to the prototype
  workflow without writing a brief here, unless the user asks to formalize it.
- **standard/full:** follow [the full concept flow](references/full-concept.md).
  It retains discovery, three concept cards, core loops, pillars, player types,
  scope and the full concept document, with reviews at their proper points.

Reuse an existing concept choice and supplied answers. A new creative direction
requires the user's choice in every automation mode; do not choose it for them.
Offer selection, combination or fresh directions without steering to your own
favorite. Ask only for missing consequential decisions in guided mode, then
continue authorized drafting and verification. Explicit collaborative mode keeps
its closer review cadence. Autonomous mode never invents a creative pick, engine
choice, permission to publish or consent from a dismissed question.

Use an available question tool for concise choices, or ask in ordinary text and
wait. No answer is not an answer. Keep game titles and custom ideas free-form.
Do not require a particular host's question tool or make users retype an already
authorized request merely to change model or Skill.

Read existing design files before revising. Preserve the user's words, exclusions,
accepted choices and unrelated sections; surface conflicting choices. Mark
inferred/provisional content rather than presenting it as user input. A claim
about market size, sales, players or trends needs a source or "not researched".
No research or human acceptance is implied by drafting a document.

Templates resolve through `resource path`: `studio/templates/game-brief.md`
or `studio/templates/game-concept.md`, selected by the flow. Director gate
resources live under `studio/docs/director-gates/`; the full-flow reference
specifies their order and context. Native roles must actually be available and
selected; a professional title or coordinator self-review is not director evidence.
Report unavailable required reviews as NOT ASSESSED and keep the dependency open.

End with the actual artifact or chosen concept, unresolved decisions/reviews and
one concrete next action. COMPLETE means the stated concept/brief task is done,
not that a game was built or a release gate passed. If a required decision or
review is unresolved, use NOT ASSESSED with the next action instead. Check that
recommended Skills are installed; label unavailable destinations honestly.
