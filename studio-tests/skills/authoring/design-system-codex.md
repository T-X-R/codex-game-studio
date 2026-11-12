# Codex system GDD authoring acceptance

Target: `.agents/skills/game-studio-design-system/SKILL.md`. Retain the eight source
cases and coverage notes in `design-system.md`; the table below makes adaptations
explicit. S022 remains partial until the complete source and Codex matrix has
observed evidence. Metadata, installed bytes and a successful agent exit do not
prove design behavior.

## Source contracts and deliberate adaptations

| Source | Codex behavior and acceptance |
| --- | --- |
| Injected config and Claude tool names | Read the restored game's pinned CLI with provenance; no model pin, fake tool or source-only runtime path. Use available native question UI or conversational fallback. |
| Project workflow vs system override | Project tier selects brief vs concept/index; effective named-system tier selects sections. Minimal project + full system still reads its brief and labels inferred metadata. |
| No-agent authoring | Local creative/systems/QA/specialist lenses; never spawn, including CD-GDD-ALIGN. Do not label a lens an independent role invocation. |
| Guided and autonomous | Reuse goal/key-decision/write authorization; guided has no per-section write asks. Autonomous logs actual assumptions, not `log_decision` or fictitious approval. Collaborative retains draft plus approval before each write. |
| Section incremental writes | Heading-anchored edits, preserved complete sections, real save after each section. Checkpoint show/save with observed hashes instead of direct active.md overwrites. |
| Required structures | Summary always; full 8 core sections; standard 5 + numeric Formulas (category is not the test); minimal voluntary 5 without formula escalation. Extras retain independent category/dependency rules. |
| Source phase-1 final “retrofit regardless of tier” sentence | Conflicts with the same phase's explicit tier-aware retrofit rule and Case 2. Follow the explicit rule: missing required sections are gaps; optional omissions are available additions. Preserve existing extra sections. |
| Source Case 8 grep assertions vs current source registry helper | Preserve the outcome using parsed complete live YAML entries and shared slice/validate, not fragile fixed-context grep. Comments are not facts; long block references cannot hide owners. |
| Source Case 8 ownership mismatch | Its stamina-owned entry references combat; selecting only stamina refs cannot yield combat's separately owned threshold. Read explicit dependency slices as well as target slice, then actual contract sections. |
| CD-GDD-ALIGN | Author self-check using saved GDD and declared gate, with exact verdict decisions; no native role despite the shared gate's generic instructions. Self-check APPROVED is never independent review or index Approved. |
| Review handoff | Fresh Codex chat/CLI session without authoring history; never inline design-review, no forged review receipt. |
| Engine feasibility | Existing CLI independent-field provenance + inspected references; configured-but-missing references are not “no engine.” Missing module names stay visible in final findings. |
| Context warning | Saved progress/current reference and next action; no invented 70% measurement. |

## Preserved source scenarios

1. New full GDD, collaborative flow: context/feasibility first; approved skeleton;
   individual A–H writes; full lenses; required feedback/feel; Summary and disk
   self-check; one CD-GDD-ALIGN author assessment; fresh-session review handoff.
   Verify no child agents and no independent approval from author self-check.
2. Standard retrofit: preserve complete Overview/Rules/Formulas byte-for-byte;
   fill only required missing Edge Cases/Dependencies/Acceptance/Summary; no
   Player Fantasy/Tuning Knobs gaps. Named missing Scripting reference remains
   unassessed. No replacement skeleton, overwritten owner notes or optional upgrade.
3. Gate adverse outcomes: actual contradictory pillar/behavior yields CONCERNS or
   REJECT, missing required MDA input yields NOT ASSESSED; no canned verdict in
   prompts. User-controlled revisions/acceptance; REJECT blocks registry/index
   finalization. Each revision reuses the section cycle and records REVISED, not
   an invented new approval. A partial draft is not a completed GDD.
4. Review modes: lean applies Formulas/QA, interacting-knob and central feedback
   lenses as specified while skipping others; solo skips every lens. Every skip
   is named with its mode; CD skip occurs once, not per section. A one-run override
   changes no configuration. Automation and review policy stay independent.
5. Missing target/context and declined skeleton: correct index candidate before
   writes; no-index minimal asks for a target, standard/full names prerequisites;
   a declined skeleton stops creation; read-only planning writes no files.
6. Minimal project with system override: brief-only context and inferred metadata,
   effective standard/full sections, required formulas for numeric standard,
   no fabricated index or forced full concept. Plain minimal instead retains five
   core sections + Summary, numeric values inline and extras optional.
7. Phase references and resumption: read each phase before its work; re-read the
   current phase after compaction/resume. Actual GDD contents beat stale checkpoint
   claims; completed sections and outside-region recovery notes survive.
8. Populated registry and numbered dependencies: owned/referenced facts, long block
   references, ignored comment examples; exact values/source ownership; read full
   matching Dependencies/Formulas/Edge Cases/Tuning Knobs sections by heading,
   including `N.` prefixes. No unrelated sibling-document scan.

## Additional native matrix

- Standard numeric Core/UI/Persistence also requires Formulas; a late numeric rule
  discovered in Acceptance triggers it at standard only. Preserve exact Variable /
  Type / Range / Source / Description and Given-When-Then structures at all densities.
- Resolve off-index or ambiguous target before mutation; no unsolicited index row.
- Registry absent/empty/populated, no candidates, new candidates, existing refs,
  conflict, declined update and malformed input. Preserve append-only ownership and
  comments; actual validator findings, no copied examples or unverified clean pass.
- Source constraints and Accepted ADRs, missing configured reference module,
  unconfigured engine, independent name/version provenance; no guessed API support.
- Full local lens mapping across all nine categories and union types; no implicit
  child/native roles even when a user asks for “the creative director's view.”
- Mandatory versus optional Visual/Audio, Game Feel and Cross-References; bounded
  optional selection, meaningful UX/asset flags only when relevant, actual dates
  versus unknown deadlines, no new mechanics to fill template tables.
- Index updates preserve rows/schema/notes, accurately count actual design status,
  keep Designed pending independent review; declined/missing index unchanged.
- Checkpoint multi-event chain, hashes/backups, conflict/interruption, stale saved
  progress, fresh native CLI and desktop discovery; no auto-trusted Hooks.
- Negative trigger: source explanation, UI component-library design, implementation
  and independent review do not silently start this authoring workflow.

## Fixture methodology

`toolkit/test/design-system-host.mjs <scenario>` installs a fresh package in an
isolated Unicode path, verifies installed Skill/template/helper bytes, captures
before/after hashes and runs the actual Codex CLI. Reviewer prompts contain raw
project facts and real write constraints, never expected verdicts. Wrapper exit 3
means semantic review pending after native exit 0. Inspect actual document rules,
source preservation, read order, local lens use/no child agents and each checkpoint
transaction before recording a result. Supplied owner decisions and engine snippets
are synthetic; they cannot establish delivered game quality, real engine execution
or human play acceptance. Do not call unrun cases PASS.
