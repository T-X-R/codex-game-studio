# S060 story-readiness: Codex source contract mapping

Status: initial migration, pending native behavior acceptance. Canonical
paths: `.agents/skills/game-studio-story-readiness/SKILL.md` and its three
references; this spec belongs at
`studio-tests/skills/readiness/story-readiness-codex.md`. The isolated host and 39 raw-input scenarios are defined in
`toolkit/test/story-readiness-host.mjs` and its fixture module; two have initial
[native observations](../../../docs/evidence/story-readiness-skill-2026-11-13.json),
including an unassessed encrypted-dispatch field requirement. A schema-valid Skill or zero-exit observer is not behavior acceptance.

## Retained source and runtime translation

Source inputs: `.claude/skills/story-readiness/SKILL.md`, CONTRACT.md,
references/qa-lead-gate.md; shared automation-modes/director-gates contracts;
`.claude/scripts/story-facts.sh`, adr-status.sh; original
`studio-tests/skills/readiness/story-readiness.md`. These are migration evidence,
not installed runtime dependencies. Preserve upstream attribution/history.

| Original contract | Codex location/behavior |
| --- | --- |
| Phase 1 scope, quoted/spaced path, all/sprint/epic/blank | Entrypoint + facts reference; remove --review before scope; no guessing/empty all-zero success; missing target distinct from missing dependency. |
| Effective config and per-run review | Pinned config get/derived review_gate/gate_level actual schema; --review only this run; per-system workflow via --system, GDD stem then TR system fallback. No root mode edits. |
| Phase 2 one collection | Pinned story-facts with explicit resolved granularity; partial missing entries retained; one ADR-status index; manifest version line only; actual TR states; newest sprint priorities. |
| Phase 3 six groups | checklist reference retains every source item, tier applicability/advisory distinction and type-dependent QA plan. |
| Phase 4 precedence | BLOCKED > NEEDS WORK > NOT ASSESSED > READY, retaining gaps and unknowns. A known external obstacle outranks unavailable evidence. |
| Phase 5 QL-STORY-READY | Real native game-studio-qa-lead per story after parent checklist; inherited model/effort/permissions; parent resolves but never reads gate definition; reviewer reads it. No generic stand-in, no nested delegation or writes. |
| Phase 6 report | Six exact group names, passing count, failed-only Gaps + Fix, named blockers; multiple-story summary then non-READY details; Must Have warning first. |
| Next candidates | Up to 3 other Ready/Not Started Must/Should stories from newest plan, no unfinished dependencies, description/estimate; no-sprint versus none-ready distinction. Recorded candidates are not newly audited READY stories. |
| Read-only/draft boundary | No writes anywhere, status/checkpoint/log/setting mutation or test execution; accepted help drafts conversation only. No automatic downstream work or hidden gate override. |

## Item-level invariants

- Design: actual rule/criterion trace; minimal brief Features substitution;
  self-contained, observable criteria; hypothetical unit inputs remain testable;
  subjective criteria allowed only for Visual/Feel with named evidence location.
  Missing named design input is NOT ASSESSED; absent design reference is fixable.
- Architecture: every referenced missing/Proposed/Deprecated/Superseded ADR blocks
  at every tier; malformed/UNFILLED/unknown Status is unassessed, not failed.
  Dead ADR fix edits existing story field, uses actual successor and never claims
  create-stories rewrites existing stories. ADR reasoned N/A, active TR statuses,
  manifest currency/three-part fix, engine notes and layer rules retain tier policy.
- Standard: critical means Foundation or unavailable Layer; noncritical metadata
  advisory does not waive referenced ADR Status. Stale manifest is explicitly
  advisory at standard, blocking at full even if new rules appear irrelevant.
- Minimal: Architecture N/A except cited ADR Status; estimate advisory. Other
  checklist groups still apply. Missing registry/no cited ID and absent manifest/
  version fields have their source waivers; malformed present inputs do not.
- Scope: actual estimate, unambiguous Out of Scope and listed dependencies/None.
  Markers are whole uppercase TBD/TODO/UNRESOLVED with helper's fence/comment
  semantics; '?' alone is not a marker. Unowned UNRESOLVED criterion blocks.
- Dependency story missing/Draft blocks; same-epic numeric references stay scoped.
  This differs from candidate selection, which waits for finished dependencies.
- Assets: existing input paths/extensions only; future-created scene/data/evidence
  files excluded. Found count or No asset references, existence not approval.
- DoD: coarse minima 3/2/1, balanced 2/2/1, fine 1; five valid types; absent/unfilled
  fields and empty AC section not clean. Loop/render/physics budget or reasoned
  no-impact note. Evidence plan uses logic/integration test paths, UI screenshots,
  Visual/Feel screenshots plus evidence record. qa.level minimal waives
  Logic/Integration/Config/Data tests without gaps or footer notes about missing
  files/folders/runners; UI/Visual plan remains checked, with actual gate_level.

## Explicit adaptation and source ambiguities

- Latest Skill/helper behavior wins over stale original spec references to Grep,
  phase numbers and “Validating” wording. The new observers retain source TSV
  semantics, safePath protection, and honest partial/malformed errors documented
  in `studio-tests/helpers/story-facts-codex.md`. They never decide READY.
- The old CONTRACT overstates unconditional downstream requirements (e.g. always
  present test evidence/ADR/manifest/TR). The actual Skill's explicit per-tier,
  QA and missing-registry waivers remain authoritative, not silently strengthened.
- “ADEQUATE: story cleared” is scoped to the QA gate's testability decision; it
  cannot erase checklist BLOCKED/NEEDS WORK/NOT ASSESSED. INADEQUATE never becomes
  READY through a user override; NOT ASSESSED never becomes ADEQUATE.
- Strict read-only overrides the old shared autonomous decision-log write. Record
  decisions in the conversation. User report-only/stop instructions suppress
  optional help/questions. Existing authorization for conversation drafts persists;
  unanswered required choices remain unanswered. Guided is the approved project
  default, read through current configuration, not the upstream collaborative default.
- “Newest” sprint is concretized as most recently modified, consistent with the
  migrated sprint-status source contract; tied/explicit conflicting scopes remain
  visible. Scope comes from sprint-status.yaml, priorities from the selected plan.
- Source handoffs (/create-epics, /create-stories, /quick-design, /sprint-plan,
  /dev-story, architecture-decision) remain intended outcomes. Invoke only installed
  frontmatter names; missing capabilities are named as unavailable. No substituted
  workflow is portrayed as the missing one, and this Skill launches none of them.

## Required behavior matrix (remaining coverage tracked in evidence)

Retain the original 9 cases and their variants; do not replace them with a single
happy path or inject expected verdicts into user requests:

1. Complete story, solo: READY, six groups, actual ADR/TR/version, candidate list.
2. Proposed ADR across full/standard noncritical/minimal: BLOCKED; Accepted
   noncritical with stale manifest: advisory gap, READY if all else passes.
3. Missing AC at minimal: NEEDS WORK; valid brief Features trace; referenced
   Proposed still BLOCKED despite architecture N/A.
4. Stale manifest full: NEEDS WORK even for unrelated added rules, three-part Fix.
5. Full native QA: actual role/definition read, parent verdict before spawn,
   verbatim all criteria, ADEQUATE/GAPS/INADEQUATE/NOT ASSESSED and actual user
   follow-up/override without writes. Lean/solo no spawn or gate-reference load.
6. UI missing screenshot plan at QA minimal: NEEDS WORK, no waived architecture
   noise; Logic/Integration/Config/Data missing test plan waived with no extra note.
7. Empty all/epic/sprint and absent sprint differentiated; unreadable target/design
   or malformed ADR unassessed; missing referenced ADR blocks.
8. Superseded/Deprecated ADR every tier: actual successor/story-field correction.
9. Active/deprecated/quoted and unquoted superseded TR statuses: correct tiered
   fixable gap, not BLOCKED or accidental valid-active approval.

Additional full-source coverage: multi-story/all/sprint summary and Must Have
warning; partial missing sprint entries; malformed/unsupported sprint structure;
blank/ambiguous scope with actual question/empty answer; spaced/Unicode paths;
per-system workflow and one-run review overrides; multiple cited ADRs and duplicate
identity; standard critical metadata versus explicit manifest advisory; every
story type/granularity; marker/fence/formula and unowned questions; existing input
assets versus planned output; candidate dependency completion; conversation-only
help; unavailable/failed native role; known blocker plus unknown input; negative
routing; inherited permissions and original file hashes across CLI/desktop hosts.

Host acceptance must inspect actual traces, child identity and order, complete
input reads, every report item, all file hashes, and permission inheritance.
Native exit zero, static frontmatter validation, observer qualityAssessed:false,
and role configuration presence are not semantic passes. Preserve failed runs,
missing native capabilities and all unrun rows. Source itself leaves aggregate,
blank-scope and multiple-ADR cases untested; this migration does not assume them
passed. The defined fixtures supply no native behavior evidence until actually run and reviewed.
