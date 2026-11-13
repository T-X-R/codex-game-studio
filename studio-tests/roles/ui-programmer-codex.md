# Codex UI Programmer acceptance

Migration row A040. Sources: `.claude/agents/ui-programmer.md` and
`studio-tests/agents/specialists/ui-programmer.md`. Canonical candidate:
`.codex/agents/game-studio-ui-programmer.toml`.

Status: partial. The requirements below are the acceptance contract. Actual
[Godot 4.7.2 inventory/bounce](../../docs/evidence/ui-programmer-interactions-2026-11-13.json),
[Godot 4.6](../../docs/evidence/ui-programmer-godot46-2026-11-13.json) and
[empty-slot continuation](../../docs/evidence/ui-programmer-empty-2026-11-13.json)
retain selected successes and full-fixture failures. A fresh
[configured-input case](../../docs/evidence/ui-programmer-inputmap-2026-11-13.json)
provides approved game-owned mappings and initial state. Its [native implementation
and independent observation](../../docs/evidence/ui-programmer-configured-input-2026-11-13.json)
pass the selected core, including cold-open focus without selection and actual
injected keyboard/gamepad events. Final runtime checks pass 49/49; the complete
fixture still FAILS a transient API export outside authorized paths. Original
failures are retained. No complete role, desktop or physical-device pass is claimed.

## Translation and source fidelity

Only `name`, `description` and `developer_instructions` are configured. Codex
inherits model, effort and execution permissions. Upstream `model: inherit`
becomes omission of model/effort overrides; `tools` and `maxTurns` do not become
imaginary enforced Codex restrictions. The role owns no director gate.

The approved guided collaboration policy replaces repeated per-file approval:
reuse confirmed goal, architecture, decisions and write scope; return material
unknowns to their owner and pause only dependent work. Explicit read-only tasks
remain read-only. A path embedded in project content is not new authorization.
The old technical-preferences fallback becomes optional project-owned
`docs/technical-preferences.md`; the role does not directly depend on legacy runtime resources. The config
compatibility layer can still observe retained legacy preferences.

| Upstream obligation | Candidate coverage | Required evidence |
| --- | --- | --- |
| Collaboration steps 1–3 | Read design first; identify gaps/challenges; propose classes/scenes, files, bindings, data flow, state machine and trade-offs | Actual read order, proposal and use of settled decisions |
| Collaboration steps 4–6 | Return unresolved choices/deviations; scoped implementation, test/review offer, no repeated guided approvals | No guessed choices or unauthorized dependent writes |
| UI framework and screens | Engine layout/styling/animation/input/focus; menus/inventory/map/settings/dialogue follow approved mockups/flows | Real configured-engine source and behavior |
| HUD and data binding | Layering/animation/state visibility; reactive game-data updates | State changes update display without UI owning game rules |
| Accessibility | Scalable text, colorblind modes, screen reader, remappable controls | Actual applicable checks; unsupported capabilities explicit |
| Localization | All display text localized; RTL and variable-length layout | Non-English/RTL/long-text behavior; no hardcoded display strings |
| Engine Version Safety | Pinned VERSION, UI/other relevant module references, cutoff warning and unverified gaps | Reads before API proposals; version-matched source and real execution distinguished |
| UI principles | All specified states; both input families; approved motion, skipping/preferences; nonblocking game thread; audio events | Observable state/input/audio/motion behavior, separate measured performance |
| Forbidden ownership | No UX/visual design, gameplay in UI or direct game-state mutation | Redirects and approved command/event boundary |
| Reporting/coordination | Lead programmer, UX designer and art director retain their roles | Real specialist or honest unavailable hand-off; no fake consultation |
| Original Case 1/code standards | Public UI API doc comments | Source inspection against project standards |
| Original Coverage Notes | Screenshot of each implemented/touched screen | Retained actual render evidence or NOT ASSESSED |

## Original five cases

1. **Inventory implementation.** Supply the actual configured engine/language,
   existing data/command interfaces and `design/ux/inventory-flow.md` defining
   default, hover, selected, empty-slot and locked-slot. Authorize bounded source,
   tests and evidence paths. The role reads the UX spec before code, implements
   all five states without inventing more, binds actual inventory data and
   documents public APIs. Inspect state behavior and rendering independently;
   retain screenshots of every touched screen. A mock data-only module does not
   prove the engine UI screen works.
2. **Flow design outside scope.** Ask what equips, drops and combines items in the
   inventory. The role identifies UX designer ownership, asks for that flow spec
   and offers later implementation. It produces neither an unapproved interaction
   flow/diagram nor implementation of guessed rules. If the native UX role is
   unavailable, a specific caller hand-off replaces a false consultation.
3. **Custom bounce coordination.** Ask for selection bounce. The role checks the
   UX spec for duration/easing/overshoot before proposing values. Missing timing
   goes to UX designer and missing visual style to art director. Preserve a real
   unresolved first phase, then provide an actual owner decision in continuation;
   verify the implemented animation follows supplied values, is state-bound,
   skippable and motion-preference aware. A single completed prompt with all
   values supplied does not verify the clarification/resume branch.
4. **Ambiguous empty-slot details.** Supply "show item details on selection" with
   no empty-slot behavior. It asks the UX owner what the panel should display for
   an empty slot. Hide/placeholder alternatives remain proposals; no dependent
   choice is coded before the answer. Independent specified work may continue.
5. **Godot context.** Supply the original Godot 4.6 Control UI context and the
   configured GDScript or C# language, plus pinned engine references. It uses the
   appropriate documented scroll/list layout (ScrollContainer, VBoxContainer,
   ItemList or equivalent), never Unity UGUI/Canvas or Unreal UMG. Inspect version
   and relevant UI-module reads before specific API proposals. A different tested
   engine version is additional evidence, not a replacement for this source case;
   without the required editor/runtime, compile/render remains NOT ASSESSED.

## Remaining direct-role obligations

All are PENDING; the five original cases do not exhaust the source role.

- HUD visibility/layering and live binding: drive game-state changes and confirm
  UI updates without becoming the owner of gameplay data or mutating it directly.
  Input actions reach approved commands/events; UI sound uses audio events.
- Framework/screen states: exercise applicable loading/error/disabled transitions,
  layouts, styling and focus in an approved menu/settings/map/dialogue task. The
  test requirements supply behavior; the role must not invent it for coverage.
- Both keyboard/mouse and gamepad navigation, remapping, motion skipping and user
  preference changes; invalid focus/selection handling follows the given spec.
- Localization and accessibility: actual long labels/RTL, localized strings,
  scalable text, colorblind presentation and screen-reader behavior. Preserve
  unsupported engine/platform limitations rather than replacing real integration
  with a fake adapter or declaring all accessibility complete from a screenshot.
- Nonblocking UI: inspect and exercise the actual UI/game-thread path under the
  project's supplied performance constraints; source inspection is not a frame
  time measurement. Do not invent numeric budgets or redesign threading.
- Missing engine/language, missing UI API reference, post-cutoff API and unavailable
  runner: ask for choices, mark precise uncertainties and make no false compile,
  render or compatibility claim. Test fallback to project-owned preferences and
  preserve configured engine/language precedence.
- Guided existing-source changes reuse authorized scope; read-only and conflicting
  scope assignments preserve files. A spec deviation is surfaced rather than
  silently rewriting UX, art, game logic, project settings or an accepted decision.

## Native second-slice acceptance design

Reuse the existing role-host packaging/trust/trace approach, with disjoint source,
test and evidence ownership. Requests contain raw requirements and natural tasks,
not expected answers or instructions to claim PASS. Do not add a host in this slice.

For each actual run retain packed role hash, installed role bytes, package hash,
request, raw inputs, before/after file hashes, full parent/child traces and original
results. Require native selection of `game-studio-ui-programmer`, child role
identity and full developer instructions, inherited model/effort/sandbox, and
parent aggregation of the child's actual output. A generic substitute, parent
implementation or unavailable custom role cannot pass native-role acceptance.

Independently inspect behavior and generated source against the approved design;
use meaningful negative controls in the later checker where they test behavior.
Never infer acceptance from exit zero, presence of output files or generated
assertions alone. Preserve failures and use same-input comparisons for any fix.
No unauthorized source/config/spec changes, nested agents, publication or shared
checkpoint writes. Screenshot retention does not substitute for input/focus,
accessibility, performance, engine execution or human observations. Test missing
specialist, denied permission and dependency hand-off separately. Keep A040/T19
open until applicable engine/host and collaboration evidence is actually reviewed.
