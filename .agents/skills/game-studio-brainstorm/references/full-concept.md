# Full concept flow (`workflow: standard` or `full`)

**In this file:** start · Phase 1 Creative discovery · Phase 2 Concept generation · Phase 3 Core loop ·
Phase 4 Pillars and boundaries · Phase 5 Player types · Phase 6 Scope and feasibility · Phase 7
Write the concept · Phase 8 Next steps

The output is `design/gdd/game-concept.md`, written from the template resolved by `node .game-studio/run.cjs resource path studio/templates/game-concept.md --json`.
Reuse supplied decisions. Resolve missing consequential choices before dependent phases; the user chooses the direction. Guided mode continues authorized drafting without repeating answered questions.
Write the analysis in your reply first, then ask with short option labels.

**Market lines.** A claim about the market (a game's sales or players, a trend, an audience's
size, why now) is stale or invented when it comes from memory. Every one cites its source (a
link, or what the user gave), or says "not researched". Never a number from memory.

## Native review availability

In full review mode, use these named native roles and pass the matching resource
path for the child to read, not a substitute coordinator verdict:

| Gate | Role | Resource |
| --- | --- | --- |
| CD-PILLARS | game-studio-creative-director | `resource path studio/docs/director-gates/cd-pillars.md` |
| AD-CONCEPT-VISUAL | game-studio-art-director | `resource path studio/docs/director-gates/ad-concept-visual.md` |
| TD-FEASIBILITY | game-studio-technical-director | `resource path studio/docs/director-gates/td-feasibility.md` |
| PR-SCOPE | game-studio-producer | `resource path studio/docs/director-gates/pr-scope.md` |

The current package may not contain these roles. Check actual availability before
delegation. Missing roles, denied calls or missing inputs are NOT ASSESSED; do
not silently lower the review mode or treat self-review as an independent gate.
Keep dependent decisions open and explain how to resume. A user-authorized draft
may record unresolved reviews but cannot be marked review-complete. Schedule the
independent pillar/visual reviews within host capacity and wait for both results.
The subsequent feasibility and scope reviews stay at their source phase boundaries.

## Start

1. The text typed after the skill name may hold a genre or theme hint (`roguelike`, `cozy
   farming`). `open` or nothing: start from scratch.
2. If `design/gdd/game-concept.md` or `design/gdd/game-pillars.md` exists, read it by section (locate
   the headings and read the relevant sections with available file tools)
   and resume or build on it instead of restarting.

## Phase 1: Creative discovery

Start with the person, not the game. Ask conversationally:
- A moment in a game that moved or thrilled them, and what created it.
- A fantasy they have always wanted in a game and never found.
- The three games they spent the most time with, and why. Ask this as plain text, never with
  preset options: they must be able to type any game.
- Genres they love or avoid. Then ask: challenge, relax, story or self-expression?

Then ask these three questions together:
- "What kind of experience do you most want players to have?" Challenge & Mastery / Story &
  Discovery / Expression & Creativity / Relaxation & Flow
- "What's your realistic development timeline?" Weeks / Months / 1-2 years / Multi-year
- "Where are you in your dev journey?" First game / Shipped before / Professional background

Sum the answers up as a **Creative Brief** of 3 to 5 sentences (emotional goals, taste,
constraints), read it back and confirm it.

## Phase 2: Concept generation

Generate **three** distinct concepts from the brief, each in a different direction, using:
- **Verb-first:** start from the core verb (build, fight, explore, solve, survive, manage).
- **Mashup:** genre A + theme B; the tension is the hook ("farming sim + cosmic horror").
- **Experience-first (MDA backward):** start from the aesthetic (sensation, fantasy, narrative,
  challenge, fellowship, discovery, expression, submission) and work back to mechanics.

Each concept has: Working Title · Elevator Pitch (1-2 sentences, passes the 10-second test) · Core
Verb · Core Fantasy · Unique Hook ("like X, and also Y") · Primary MDA Aesthetic · Estimated Scope
(small / medium / large) · Why It Could Work (one sentence, from the design; a market reason
follows Market lines above) · Biggest Risk (one sentence).

Present all three, then ask one question with these five options: "Which concept resonates with
you? You can pick one, combine elements, or ask for fresh directions." `Concept 1 — [Title]` /
`Concept 2 — [Title]` / `Concept 3 — [Title]` / `Combine elements across concepts` / `Generate
fresh directions`. For a new direction, ask in every automation mode; an already confirmed choice is reused. No rule can pick the user's creative direction. Do not push toward a choice.

## Phase 3: Core loop

For the chosen concept, ask with options derived from the concept, each with an `I'll describe it`
option:
1. "What's the primary feel of the core action?" (3-4 options that fit the genre and tone)
2. The concept's most important design variable (world reactivity, pacing, agency), as a question.

Then work through, in the reply:
- **30-second loop:** is the action satisfying in itself, and why (feedback, timing, depth)?
- **5-minute loop:** what turns moments into cycles; where "one more run" starts; the choices made.
- **Session loop (30-120 minutes):** a full session, its stopping points, the hook between sessions.
- **Progression loop:** how the player grows, the long-term goal, when the game is done.
- **Motivation (self-determination theory):** autonomy, competence, relatedness.

## Phase 4: Pillars and boundaries

Draft **3 to 5 pillars**, each with a name, a one-sentence definition and a design test ("debating
X or Y, this pillar picks __"). Pillars should pull against each other a little. Add **3 or more
anti-pillars**: "We will NOT do [thing] because it would compromise [pillar]."

Ask: "Do these pillars feel right for your game?" `Lock these in` / `Rename or reframe one` /
`Swap a pillar out` / `Something else`. After a revision ask: "Pillars updated. Ready to lock these
in?" `Lock these in` / `Revise another pillar` / `Something else`.
- `collaborative`: repeat until the user picks `Lock these in`.
- `guided`: ask once, apply the revision, lock them in.
- `autonomous`: do not ask; lock the draft in and log the decision with the alternatives.

**Review mode** (from the settings block or `--review`):
- `solo` or `lean`: print these two lines, with the mode's name, and go on to Phase 5:
  `CD-PILLARS skipped — Solo mode.` and `AD-CONCEPT-VISUAL skipped — Solo mode.`
- `full`: hand the pillar review to the `game-studio-creative-director` agent (gate CD-PILLARS; brief: the
  pillars with design tests, anti-pillars, core fantasy and hook) and the visual review to the
  `game-studio-art-director` agent (gate AD-CONCEPT-VISUAL; brief: the pitch, pillars, target platform if
  known, reference games mentioned). Each reads its own gate file and returns its verdict; neither
  edits files. They are independent: hand them out together where you can, otherwise one after
  another.

With both reports, when CD-PILLARS returns APPROVE, ask these two questions together:
- **Pillars:** the creative-director's feedback. `Lock in as-is` / `Revise [pillar]` / `Discuss
  further`.
- **Visual anchor:** the art-director's 2-3 named directions, one option each, plus `Combine
  elements across directions` / `Describe my own direction`. On STRONG mark the dominant one
  `(Recommended)`. On CONCERNS show its reason and offer `Revise pillars` / `Describe my own
  direction`.

If CD-PILLARS returns CONCERNS or REJECT, settle the pillars first (the Pillars question alone),
then ask the Visual anchor question alone. NOT ASSESSED from either gate is not an approval: name
the missing input, supply it and run that gate again. If it remains unavailable, discuss the
pillar concern while retaining NOT ASSESSED; do not convert it to CONCERNS or approval.
With no art-director directions, offer only `Describe my own direction` and keep that review open.

The chosen direction is the **Visual Identity Anchor**: it goes into the concept and seeds the art
bible.

## Phase 5: Player types

Using Bartle's types and the Quantic Foundry model: the primary player who will love it
(Achievers, Explorers, Socializers, Competitors, Creators, Storytellers), the secondary appeal, who
it is not for, and games that serve the same player (their success is a market line, above).

## Phase 6: Scope and feasibility

- **Platform.** Ask: "What platforms are you targeting?" `PC (Steam / Epic)` / `Mobile (iOS /
  Android)` / `Console` / `Web / Browser` / `Multiple platforms`. Record it for `$game-studio-setup-engine`.
  Note what the platform implies, without recommending an engine: `$game-studio-setup-engine` makes that call
  against the pinned engine reference.
- **Engine.** Resolve this user choice in every automation mode, reusing an explicit engine preference already supplied: "Do you already have an engine
  you work in?" `Godot` / `Unity` / `Unreal Engine 5` / `No preference — help me decide`. Never
  pick an engine for the user. A named engine is recorded as their preference without second
  guessing. No preference: "Run `$game-studio-setup-engine` after this session; it walks through the choice
  with your concept and platform." Make no recommendation here.
- Art pipeline and how labour-heavy it is; content scope (levels, items, hours); the MVP (the
  smallest build that tests whether the core loop is fun); the biggest technical, design and market
  risks (market risks follow Market lines above); scope tiers (full vision, and what ships if time
  runs out).

**Review mode** before TD-FEASIBILITY: `solo` or `lean` prints `TD-FEASIBILITY skipped — Solo
mode.` (or `Lean mode`) and goes on to the scope tiers. `full`: after the technical risks, hand the
feasibility review to the `game-studio-technical-director` agent (gate TD-FEASIBILITY; brief: the core loop,
platform, engine or "undecided", the technical risks). Show its report. HIGH RISK: offer to revisit
scope. CONCERNS: note and go on. NOT ASSESSED: name the missing input and record feasibility as not
assessed in the concept's risks, never as VIABLE.

**Review mode** before PR-SCOPE: `solo` or `lean` prints `PR-SCOPE skipped — Solo mode.` (or `Lean
mode`) and goes on to Phase 7. `full`: hand the scope review to the `game-studio-producer` agent (gate PR-SCOPE;
brief: full vision, MVP, scope tiers, timeline, team size). It answers REALISTIC, OPTIMISTIC or
UNREALISTIC. UNREALISTIC: ask whether to adjust the MVP or scope tiers or keep them; the user
decides and the concept is never rejected for it. OPTIMISTIC: show the producer's adjustments and
ask whether to apply them. NOT ASSESSED: ask for the missing input (timeline, team size) and run it
again, or record scope as not assessed, never as REALISTIC.

## Phase 7: Write the concept

Fill every section of the template from the conversation, including the MDA analysis, motivation
profile and flow design, plus a **Visual Identity Anchor** section: the direction's name, its
one-line visual rule, 2-3 supporting principles with design tests, and the colour philosophy.

The Core Identity table's Estimated Scope matches the full-vision timeline in Scope Tiers: write
"Large (X–Y months, solo)" or "Large (X–Y months, team of N)", not "Large".

Show the concept and resolve outstanding consequential choices. In guided mode,
an already authorized request to write the concept covers the save; do not repeat
a per-file permission prompt. If writing is outside the current request, ask
whether to save or revise. Collaborative mode reviews the complete draft before
saving. For a revision, show the affected section before and after, then continue
within the agreed scope. Autonomous mode still respects scope and missing user
choices; it cannot turn a missing review or unanswered question into approval.

Write the file, creating folders as needed. Never write `design/game-brief.md` at this tier.

## Phase 8: Next steps

List the relevant domain sequence in order, distinguishing installed Skills from planned/unavailable destinations. Do not invoke unavailable workflows or present a role title as evidence that it ran.

**Design-first** (the concept is well defined):
1. `$game-studio-setup-engine`: configure the engine and its version-aware reference docs
2. `$game-studio-art-bible`: the visual identity, before any GDD. Required before the Technical Setup gate at
   `full`; at `standard` only when the game has visual-asset stories
3. `$game-studio-design-review design/gdd/game-concept.md`: check the concept is complete
4. The `game-studio-creative-director` agent: refine the pillars
5. `$game-studio-map-systems`: the systems, their dependencies and priorities, in the systems index
6. `$game-studio-design-system`: one GDD per system from step 5
7. `$game-studio-create-architecture`: the architecture blueprint and its Required ADR list
8. `$game-studio-architecture-decision`: one ADR per decision on that list
9. `$game-studio-architecture-review`: the TR registry and traceability matrix (needed before the
   Pre-Production gate)
10. `$game-studio-gate-check`: the stage gate before Production

**Prototype-first** (the core mechanic is unproven):
1. `$game-studio-setup-engine`
2. `$game-studio-prototype [core mechanic]`: is it fun, in a day at most, throwaway code
3. PROCEED: `$game-studio-art-bible`, then design-first steps 5-10 with what the prototype taught
4. PIVOT: `$game-studio-brainstorm` again with the learnings
5. After design and architecture, `$game-studio-vertical-slice` before committing to sprints

With no engine named in Phase 6, prototype-first is the recommended path, and its first step is
`$game-studio-prototype` instead: a playable browser game from the concept, before any engine.
Offer the installed prototype Skill as the next action. Ideation alone does not authorize a build; when a build was already requested, continue through that Skill without demanding the user retype it. With an engine named, add
one line explaining that the installed `$game-studio-prototype` can make an optional browser
sketch, but that sketch would need rebuilding in their chosen engine. Do not switch engines
or imply that this Skill already implements a native-engine prototype.

Then summarize pitch, pillars, primary player type, engine preference, biggest risk and file path. Use `Verdict: COMPLETE — game concept written.` only when required decisions and reviews are resolved; otherwise state NOT ASSESSED, the saved draft (if authorized), missing review/input and next action.

If the conversation is getting long before Phase 7, say that anything not yet written to
`design/gdd/game-concept.md` lives only in this conversation, and offer to save the authorized draft before a fresh session; do not claim an unwritten draft is durable.
