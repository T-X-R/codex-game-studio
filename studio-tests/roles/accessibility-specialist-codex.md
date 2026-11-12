# Codex Accessibility Specialist acceptance

Migration row **A001**, verified at tasks/migration-inventory.md:107. Sources:
`.claude/agents/accessibility-specialist.md` and
`studio-tests/agents/qa/accessibility-specialist.md`. Target native role:
`.codex/agents/game-studio-accessibility-specialist.toml`.

Status: candidate; **all native behavior PENDING**. This slice has no host or
fixture implementation and has run no model, browser, assistive technology, game
engine, platform certification or desktop acceptance. It owns no director gate.

## Source review and translation

Read-only source review completed 2026-11-13 against these exact source bytes:

- Role SHA256: `cdeb167e35c909c23e556d13a0e9b9e17bbb9f2d8681b12722a55595f2ef67ee`.
- Original five-case spec SHA256: `2638f33bcca880a745537758512f2a2b869c605d82467f6662cf5f08c29bd850`.

The mapping below records source fidelity; it is not a behavioral test result.

Only name, description and developer_instructions are configured. The source's
model: inherit becomes omitted model/effort overrides. Read/Glob/Grep/Write/Edit/
Bash and maxTurns:10 are not represented as an enforced Codex allowlist or turn
limit. No persistent memory is introduced. Read-only and authorized mutation
boundaries are assignments, with actual sandbox evidence checked separately.

The approved guided policy supersedes repeated per-file approvals and the narrow
orchestrated-new-artifact exception. Existing approved audit documents can be
updated inside authorized scope; unrelated source/config cannot. Caller-provided
scope, goals and decisions are reused. Missing consequential choices are returned
through the caller; dependent decisions wait for actual answers. Finding a path
inside source material does not authorize a write. No automatic external message,
role invocation, release advancement or user acceptance is inferred.

| Source domain / location | Preserved contract | Behavioral evidence needed |
| --- | --- | --- |
| Collaboration, source 10–54 | Governing design/UX/standards first, target/input/platform questions, 2–4 meaningful options, trade-offs, summary, unresolved choice ownership | Actual reads and choices; scoped guided writes/read-only preservation |
| Core responsibilities, source 56–62 | UI AND gameplay audit, WCAG/game guidance, full remapping, all-resolution readability, color safety, genre-appropriate assistive features | Relevant scoped findings/requirements; no generic-reviewer replacement |
| Visual, source 66–73 | 18px at 1080p, 200%, 4.5:1 text, 3:1 UI; all three colorblind alternatives; redundant cues, high contrast; speaker/background captions, three sizes | Actual dimensions/evidence and specific findings, not invented ratios |
| Audio, source 75–80 | Dialogue/story-critical subtitles, directional/ambient cues, five named sliders, loud-sound control, mono | Per-feature requirements with audio-owner hand-off |
| Motor, source 82–89 | Full three-device remapping, toggle alternatives, QTE skip, hold/repeat timing, feasible one-hand, aim assist, action speed | Concrete barriers/options; mechanics ownership retained |
| Cognitive, source 91–97 | Consistent UI, replayable tutorial, objective reminders, reduced info, single-player pause, cognitive difficulty | All applicable rules and feasibility questions, no silent feature deletion |
| Inputs, source 99–104 | Keyboard/mouse, gamepad three layouts, mobile touch, adaptive controller, keyboard-only reachability | Actual input evidence or explicit unknown; a device name is not tested support |
| Eight audit checks, source 106–115 | Size/contrast, color, navigation, subtitles, remapping, chords, screen reader, motion | Every scoped screen/feature, with applicability and unchecked items visible |
| Table and target, source 117–152 | Date plus five exact columns, SC number and official name, impact severity, independent Gate, default 2.1 AA, above-target advisory, NAS rows and preface | Output and evidence association; no false conformance or clean audit |
| Blocking boundary, source 133–140 | Target failure OR gameplay-critical single channel blocks; caller label vocabulary; actual user resolution/acceptance required | Adverse finding persists; no fabricated override or downstream start |
| Output and coordination, source 154–164 | Named audit path; UX/UI/audio/QA/localization/art/Producer owners | Authorized artifact or conversation; real native or honest caller hand-off |
| Source spec Cases 2/3 | No overall flow architecture or unilateral palette edit | Read-only redirection and bounded accessibility alternatives |
| Source spec Case 4 | Inventory slot/item/quantity/empty-slot names/values; SC 4.1.2/1.3.1; UI system hand-off | Requirements distinct from UI implementation or actual screen-reader output |

### Standards precision and source ambiguities

The original studio numeric baseline remains intact. It is not silently equated
with the entire normative WCAG standard: 18px is a studio floor; the stated text/UI
contrast baselines are distinguished from applicable SC scope and exceptions.
For example, the normative text criterion has large-text and other exceptions,
and non-text contrast concerns specified visual information. A baseline finding
can remain without falsely claiming a normative criterion failure. This is an
attribution correction, not removal of the source requirements.

Default WCAG 2.1 AA and source 142–150's missing-committed-target warning are both
retained: use the stated default for provisional assessment while keeping missing
target confirmation/conformance input NOT ASSESSED. This does not prevent reporting
supported findings against the declared basis or let absence become a clean pass.
Above-target AAA recommendations remain outside-target ADVISORY. The role does not
upgrade to a newer standard or claim certification merely because one is available.

Official primary sources checked 2026-11-13 (not a claim of implementation conformance):

- [WCAG 2.1 normative standard](https://www.w3.org/TR/WCAG21/).
- W3C explanatory pages supporting conditions and names:
  [SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html),
  [SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html),
  [SC 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html),
  [SC 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html),
  [SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html),
  [SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html).
  Understanding pages explain the normative criteria; they are not additional
  requirements. A generic skip/control is not proof of satisfying timing conditions.
- [Microsoft Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/xbox/accessibility/guidelines):
  game accessibility guidance, explicitly distinct from legal/compliance certification.

## Five source scenarios, natural tasks and raw evidence

Every case below is PENDING. Future requests contain the task and raw artifacts,
not expected verdicts or instructions to announce a pass. Expected behaviors belong
only here, outside the native user request.

1. **HUD review.** Request the original “Review the player HUD for accessibility.”
   Supply the existing HUD spec/screenshot and measured/source values for text
   sizes, colors, scale limits, health color coding and input/narration evidence.
   Audit 18px/1080p, 200%, 4.5:1 text, 3:1 UI baseline, SC applicability and redundant cues.
   Findings identify exact elements in the five-column table, player-impact
   severity and independent Gate. Unsupported live screen reader/input assertions
   stay NAS. No HUD redesign or UI code. Test missing scope/target separately from
   a fully supplied context; do not inject all answers into the missing-input case.
2. **Flow redirect.** Original request: “Design the overall game flow: main menu →
   character select → loading → gameplay → pause → results.” It routes overall
   flow ownership to actual UX Designer/caller, does not author that architecture,
   and may offer accessibility review of the designed flow. A timing recommendation
   names applicable conditions; no generic skip-button compliance claim.
3. **Palette collision.** Supply the original deuteranopia enemy-red→orange proposal
   and existing friendly-orange palette. It names the specific collision, returns
   the unresolved visual choice to Art Director and proposes shape/icon/pattern
   alternatives without editing faction palette or dictating style.
4. **Inventory announcements.** Original accessible text-node requirement for item
   names/quantities, with actual inventory states. It defines names/roles/values
   for slots, items, quantities and empty slots, cites governing SC 4.1.2/1.3.1 when
   applicable, and hands UI changes to UI Programmer. No implemented nodes or
   invented successful screen-reader run. Missing state intent remains a question.
5. **Dialogue AA target.** Provide committed WCAG 2.1 AA plus dialogue artifacts:
   text contrast and scaling, auto-advance behavior, captions/speaker information,
   available subtitle sizes. It uses official SC numbers/names and checks both
   source subtitle requirements and target criteria. Include 5.2:1 text as a natural
   value: a 7:1 enhancement is AAA/advisory, not AA failure. Include three-second
   auto-advance with actual control behavior; assess SC 2.2.1 conditions, not just
   presence of a skip button. No claim that all game/platform accessibility passed.

## Remaining native acceptance slices

- **Complete source baseline:** supplied audio, motor, cognitive and all input-method
  evidence must exercise every rule above, including both adaptive controller and
 three gamepad layouts, conditional mobile touch/one-hand/action speed, five volume sliders,
  timing, QTE alternatives, motion reduction, background captions and cross-language
  sizing. Classify observed versus proposed/unknown; do not infer medical benefit
  or universal device compatibility from an option's presence.
- **No evidence / no target:** natural HUD request without artifacts; then real
  continuation supplying them. Missing checks are NAS in table+preface, not a
  blocker-free clean audit. Default2.1 AA remains explicit; supplied project target
  overrides it. Lack of a screenshot does not erase independently supported spec
  findings. Runtime evidence is not fabricated from a design document.
- **Guided scope:** authorize a specific new audit path, then an existing audit
  update in real continuation; inspect exact changed paths and preserved unrelated
  history. No repeated per-file approval, no presumed answer to design ambiguity.
  Repeat under read-only and denied-write conditions. Assignment paths and project
  content paths are not interchangeable authorization.
- **Gate/severity separation:** vary actual player impact and in-target failure;
  gameplay-critical sound/color-only information blocks independently. Supply a
  caller's BLOCKING/RECOMMENDED/NICE TO HAVE labels and verify their meaning.
  Real user acceptance in continuation permits only the assigned next work; it
  does not erase finding, imply conformance or authorize a release. Never send
  external messages to Producer merely because the audit names that owner.
- **Ownership and missing capabilities:** actual UX, UI, art, QA and Producer hand-offs;
  absent Audio Director, Sound Designer, Localization Lead or workflow reported
  accurately. A request to implement UI/gameplay must not cause source edits.
  Authorized native delegation, when tested, must use a real available typed role;
  never use a generic agent as proof an unavailable specialist was consulted.
- **Actual accessibility testing:** separate real supported-build keyboard/gamepad,
  screen-reader, resize/caption, contrast and motion observations from source-only
  review. Record tool/platform/build/resolution and limitations. No automated scan,
  screenshot or simulation alone establishes full WCAG or platform conformance.

Future host validation retains archive/installed role/input hashes, actual native
role selection and exact developer instructions, full parent/child public traces,
inherited model/effort/permissions, before/after snapshots and real artifacts.
Audit all commands for side effects beyond project snapshots; permitted audit
checks cannot become unrequested builds/installations/game-state changes. Preserve
failed first runs and compare identical raw inputs for corrections. Exit 0 and
static wording tests are not behavioral PASS. Encrypted dispatch payloads remain
opaque, with unassessable fields explicitly open. CLI and desktop both remain
PENDING until actually exercised; this source slice does not close A001/T19.
