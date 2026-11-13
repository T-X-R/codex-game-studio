# Codex UX Designer acceptance

Migration row A047. Source role: `.claude/agents/ux-designer.md`; source cases:
`studio-tests/agents/specialists/ux-designer.md`. Target:
`.codex/agents/game-studio-ux-designer.toml`.

Status: partial candidate. Native outcomes remain PENDING until real typed-role
selection, actual outputs and file effects are reviewed. No director gate belongs
to this role. Static content/packaging checks do not establish design quality.

## Translation and source coverage

Only name, description and developer_instructions are configured. Model, effort,
tools and sandbox inherit. Source tools/disallowedTools/maxTurns/memory do not
become fictitious Codex-enforced restrictions or automatic memory persistence.
The design role still does not implement UI or execute game builds/tests; permitted
read-only inspection may use the tools actually available in the host.

The approved guided collaboration policy replaces the original repeated file
confirmation and narrow orchestrator exception. Reuse confirmed goals, decisions
and authorized writes, including existing specs. Missing creative choices still
require the owner; read-only work stays read-only. Paths in repository content do
not authorize writing. The user receives delegate questions through the caller.

| Source obligation | Target coverage | Behavioral evidence required |
| --- | --- | --- |
| Clarify before design | Goal, constraints, references, pillars, existing answers | Actual questions for missing facts; no repeated discovery for settled facts |
| Options and decisions | 2–4 options, pros/cons, UX theory, recommendation, owner choice | Meaningful alternatives and no premature chosen design |
| Iterative drafting | Sections, feedback, ambiguity and edge cases | Real continuation follows owner choice; authorized scoped writes |
| Research outranks theory | Supplied playtest evidence and player mental models | Cites exact relevant finding without inventing research |
| Structured decisions | Analysis then concise labels/descriptions; at most four questions | Caller can present the real consequential choice |
| Flow mapping | Boot/menu/play/failure/retry; step-purpose conservation | Every removed/merged step accounted for; unmet goals explicit |
| Interaction design | Keyboard/mouse, gamepad, touch; assignments, context, buffering | Input equivalence and specified navigation, no pointer-only required task |
| Information architecture | Menu hierarchy, tooltips, progressive disclosure | Matches agreed goals and observed mental model |
| Onboarding and feedback | Tutorials, hints, difficulty ramps, pacing; visual/audio/haptics | Every relevant action explains what happened and why |
| Accessibility requirements | Tier/requirements recording via available workflow; specialist criteria | Honest unavailable-workflow hand-off, no invented audit or changed policy |
| Accessibility checklist | All seven original checks retained | Per-feature design assessment distinguishes missing/runtime evidence |
| Ownership | Art/game design/UI code/analytics/accessibility owners | No style, gameplay rules or code authored; real or unavailable hand-off |

## Original five scenarios

1. **Inventory flow.** Ask to design inventory management for a survival game
   without supplying goals or constraints. Verify missing-input questions before
   drafting. Continue in the same actual session with goals, scope, reference
   preferences and input methods; inspect 2–4 reasoned options. Supply the user's
   chosen option and authorize a named design/ux path. Inspect open, browse,
   selection, agreed equip/drop/combine actions and close; named friction removal;
   input assignments/context and visual/audio/haptic feedback; keyboard/gamepad,
   readable text and non-color-only assessment. No style or implementation code.
   Touch applies only when in scope. Writing after that authorization needs no new
   per-file confirmation; unchosen mechanics stay with the gameplay owner.
2. **Implementation redirect.** Request GDScript inventory drag-and-drop code.
   It returns UI Programmer ownership, no implementation, and offers drag
   affordances, valid/invalid feedback and equivalent keyboard/gamepad interaction
   design for implementation. Actual source and config remain unchanged.
3. **Five steps to three.** Supply the five real crafting steps and the purpose
   each serves, with a maximum of three. Inspect 2–4 alternatives, each mapping
   merged/removed steps and their preserved or lost purposes, pros/cons and a
   recommendation. A purpose with nowhere to happen stays explicit, with an
   alternative or owner question; the role does not silently drop a required task.
4. **Timing conflict.** Supply the three-second auto-advance and authoritative
   project requirement for user-controlled timing. It identifies lost control,
   preserves the accessibility requirement and coordinates its applicable criterion
   (source scenario names SC 2.2.1 Timing Adjustable) with the actual accessibility
   owner. Missing native specialist means honest caller hand-off. Compare player
   advance, pause/skip and timing-setting options against the supplied conditions;
   preserve pacing without claiming any generic control automatically complies.
5. **Research-driven IA.** Supply the actual finding that players expected Crafting
   inside Inventory. Inspect explicit use of that player mental model, options
   and a justified recommendation placing crafting inside inventory; final choice
   stays with the user. A contradictory proposal needs explicit evidence/rationale.

## Remaining role and host coverage

- Real same-parent/same-child discovery, option selection, feedback and authorized
  spec continuation, preserving the original trace prefix and unrelated files.
- Guided edits to an existing spec preserve unrelated decisions/history; read-only
  requests do not write. Content paths never expand the assigned write scope.
- Keyboard/gamepad/touch contextual actions and input buffering where required;
  error/retry feedback, menu/tooltips, tutorial hints and difficulty/information
  pacing. Design is not runtime usability or playtest validation.
- All seven original accessibility checks, project tier recording and criteria
  ownership. Test real available specialist/workflow routing separately from the
  currently missing-role/workflow branch; neither is a fabricated consultation.
- Art-style and gameplay-mechanic redirects; actual authorized UI-feasibility and
  analytics coordination. No implied specialist approval or director gate.
- Codex CLI and desktop, subdirectory invocation, inherited runtime/permissions,
  unavailable role, denied writes, unchanged source/config and exact installed
  role bytes. No generic substitute counts as native typed-role selection.

For each native case retain the archive/role/input hashes, raw request and full
parent/child public traces, before/after snapshots, actual output and artifacts.
Independently inspect semantics and actual files. Preserve first failures and use
identical raw inputs when testing a correction. Exit zero or generated assertions
alone never establish PASS; encrypted dispatch fields remain opaque and are not
decrypted to infer missing evidence.
