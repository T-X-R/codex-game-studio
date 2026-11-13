# Game Designer methods and document contract

Adapted from the upstream Game Designer role; upstream attribution and MIT
license are retained in the repository. These are working design methods, not
claims that a theory or formula proves player enjoyment. Use the project's
approved constraints; do not force every method into every mechanic.

## Experience, loops and systems

Start with the intended experience. MDA (Hunicke, LeBlanc and Zubek) works
backward from aesthetics to dynamics to mechanics. Useful aesthetics include
sensation, fantasy, narrative, challenge, fellowship, discovery, expression and
submission. Explain which player behavior the proposed rule encourages and how
that behavior serves the actual named pillar. Do not replace a pillar with a
framework label.

Use Self-Determination Theory as a lens for autonomy (viable meaningful choices),
competence (readable feedback and skill growth) and relatedness (connection to
characters, people or the world). Identify false choices and opaque outcomes.
Use flow to examine challenge relative to skill rather than assuming one curve
suits every player.

The upstream nested-loop starting points are a roughly 30-second satisfying
micro-loop, a 5–15-minute goal/reward meso-loop, and a session progression loop
with a natural stopping point and reason to return. Adapt them to the approved
game/session length; they are not mandatory new duration requirements. Connect
each mechanic to at least one actual loop. Map inputs, outputs and feedback:
reinforcing loops grow a quantity; balancing loops counter runaway behavior.

For onboarding, examine the first ten minutes where applicable: introduce a
mechanic in isolation before combining challenges. A sawtooth difficulty curve
can build tension, release at milestones and resume at a higher baseline; inspect
flat boredom and abrupt spikes rather than imposing a curve without context.
The upstream micro-feedback target is readable consequences within 0.5 seconds,
with strategic feedback within the meso-loop. Treat timing changes against the
approved spec as proposed decisions. Frequent failure generally needs cheap,
fast recovery; rare encounters can support greater cost if that suits the pillars.

Consider different motivations without inventing features for every category:
Bartle's achievement, exploration, social and competitive lenses; and Quantic
Foundry's action, social, mastery, achievement, immersion and creativity groups.
Use these as hypotheses about the target audience and validate with observations.
Never claim a player survey or research consultation that did not occur.

## Balance and numeric rules

Select an appropriate comparison: transitive cost/power ordering, intransitive
counters, asymmetric capabilities with viable outcomes, or apparent imbalance
with discoverable counters (the upstream frustra-balance concept). Explain what
prevents a dominant option. Sirlin's Playing to Win perspective helps distinguish
legitimate mastery from a strategy that undermines the intended experience.

Choose a curve for its intended shape: linear growth, quadratic acceleration,
logarithmic diminishing returns or an S-curve with an eventual plateau. Normalize
different damage/healing/utility profiles through DPS or a suitable equivalent.
Use agreed time-to-kill/time-to-complete targets as anchors, then derive values.
If targets are missing, return alternatives for a decision rather than pretending
calculated outputs are validated goals.

Every numeric rule specifies variables, units, valid input domains, boundary
behavior and worked calculations. Include a graph for a nonlinear curve when
authoring the full formula specification. Check division by zero, integer/float
semantics, extremes, caps and overflow where applicable. Respect specialist
ownership of detailed formula granularity; a conceptual recommendation does not
authorize changing their agreed math.

Expose tuning through external game data, conventionally `assets/data/`, using
the actual project path if different. Classify each knob:

| Category | Purpose | Typical validation |
| --- | --- | --- |
| Feel | Moment-to-moment motion, attack rate, animation or feedback timing | Human play observations and actual responsiveness |
| Curve | Progression requirements, stat scaling, price multipliers | Mathematical models and progression comparisons |
| Gate | Unlock requirements, resource thresholds, cooldown/pacing | Agreed session-length and pacing targets |

Record each intended range, units, current/default value and rationale. A value
can influence several outcomes; explain its primary tuning category. No category
needs an invented knob when the mechanic has none of that kind. Proposed defaults
and ranges are not approved until the owner chooses them.

## Economy and ethical constraints

List all faucets introducing currency/resources and all sinks removing them.
Compare totals over the target session and explain intended accumulation or
depletion. Model reinforcing wealth loops and counterbalances. Use distribution
measures such as a Gini coefficient when population-level wealth distribution is
actually relevant; the target must be supplied/agreed, not invented.

For probabilistic rewards, examine transparent odds and guarantees within a
specified attempt count (pity systems), plus their economy effects. Do not add a
random reward system to a deterministic game. Competitive monetization must not
sell winning advantage; reject exploitative psychological dark patterns and
opaque odds. Ethical design recommendations remain distinct from claims about
law, which need appropriate current sources if a legal assessment is requested.

## Document shape

Resolve `modes.workflow`, including applicable named-system overrides, rather
than inferring it from team size or document length. At `minimal`, maintain the
agreed record in `design/game-brief.md`; no standalone GDD is required. Preserve
existing sections and unrelated decisions. At `standard`, author Overview,
Detailed Design, Edge Cases, Dependencies and Acceptance Criteria, plus Formulas
when the system contains numeric rules. Do not require separate Player Fantasy
or Tuning Knobs sections at standard, although needed intent/ranges still belong
in the relevant rules. At `full`, use all eight sections below.

| Section | Required content at full |
| --- | --- |
| Overview | Concise purpose and the loop/system served |
| Player Fantasy | Intended feeling, named pillars and target MDA aesthetics |
| Detailed Design | Precise player-facing rules and transitions; this heading means Detailed Rules |
| Formulas | Variables, units, input ranges, examples and graphs for nonlinear curves |
| Edge Cases | Extremes, invalid/degenerate situations and agreed handling; unresolved choices explicit |
| Dependencies | Other systems, direction of data flow, required/provided contracts |
| Tuning Knobs | Feel/curve/gate category, external data path, ranges, defaults and rationale |
| Acceptance Criteria | Functional checks plus what actual human play must evaluate |

Do not fill unknown rules with implementation guesses. A proposed measurable
rewrite stays a proposal until accepted. A review returns concrete gaps and
their player-experience consequences; it does not issue the design-review
workflow's verdict. No document proves gameplay, balance or human acceptance.
