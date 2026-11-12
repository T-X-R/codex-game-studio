# Story readiness checklist

Evaluate every item for each story using its resolved workflow. A failed advisory
item is listed with its Fix and advisory label; it never lowers READY by itself.
Known blocking findings and unassessed inputs follow the entrypoint's precedence.

| Group | full | standard | minimal |
| --- | --- | --- | --- |
| Design Completeness | blocking | blocking | blocking; brief Features substitutes for GDD |
| Architecture Completeness | blocking | ADR Status blocks; other items advisory unless about a critical ADR | N/A except referenced ADR Status |
| Scope Clarity | blocking | blocking | blocking except Estimate advisory |
| Open Questions | blocking | blocking | blocking |
| Asset References | blocking | blocking | blocking |
| Definition of Done | blocking | blocking | blocking; test evidence separately follows qa.level |

Critical ADR means Foundation or unavailable Layer. An explicitly noncritical
layer does not waive the referenced-ADR Status rule: it applies at every tier.
The explicit standard-tier Manifest Version advisory rule below still applies.

## Design Completeness

- **Requirement traced:** the story names its design/gdd/ file and quotes or links
  a specific rule/criterion, not just the filename. At minimal it names
  design/game-brief.md and the Features item it implements. A named design document
  that cannot be found makes this item NOT ASSESSED; a missing design reference is
  a fixable gap. Do not invent a requirement from the story alone.
- **Self-contained:** acceptance criteria explain what done means without opening
  the GDD.
- **Testable:** each criterion describes a specific observable condition, such as
  “Jump reaches 5 units within 0.3 seconds when held,” rather than “Implement jump.”
  These are examples, not thresholds to impose. A unit-test setup using any input
  values is testable even when shipped game data never reaches that case.
- **No judgement calls:** “feels responsive”/“looks good” fails for Logic,
  Integration, UI and Config/Data. Such criteria are expected for Visual/Feel:
  pass when the criterion names an evidence file such as
  production/qa/evidence/<slug>-evidence.md; otherwise NEEDS WORK. This is a
  planned evidence location, not a demand for completed visual evidence now.

## Architecture Completeness

- **ADR status, every tier:** inspect each ADR actually cited using the cached
  ADR table. Accepted passes. Proposed is BLOCKED: name its ID and recommend
  explicit acceptance once decided (installed architecture-decision accept if
  available). Missing referenced ADR is BLOCKED. Deprecated/Superseded is BLOCKED:
  state the status and actual successor, if known, and direct correction of the
  existing story's ADR field. Creating stories never rewrites existing stories.
  No readable Status, including an unfilled/malformed one, is NOT ASSESSED:
  name the file and recommend ADR retrofit. Do not treat unknown as Proposed.
- **ADR cited or N/A stated:** an ADR or explicit reasoned N/A, e.g.
  `ADR: N/A — [reason]` or `N/A (minimal — no ADRs)`. Blank fails when this item
  applies. At minimal the group remains N/A except the ADR-status check.
- **TR-ID valid:** each TR-[system]-NNN must have status active in the actual
  registry. Deprecated or superseded-by (quoted or unquoted) is a fixable gap:
  point the story at the current ID or remove a no-longer-applicable reference.
  An unknown ID is a gap; the story may predate registration or need architecture
  review. Passes with no cited TR ID or no registry. Apply tier/advisory policy;
  these are not external-action BLOCKED findings. A malformed/unreadable registry
  leaves this check unassessed instead of invoking the missing-file waiver.
- **Manifest Version current:** compare the story's version with the manifest's
  actual version line. Older is a gap even if added rules appear unrelated.
  Full: NEEDS WORK regardless of those rules. Standard: advisory. State the old
  and current versions, and this complete Fix: “Review the manifest rules added
  since [story date]; update the story's rules if any apply; then set its Manifest
  Version to [current date].” Do not infer that the version can simply be bumped.
  Passes when the story has no version field or no manifest exists. Unknown or
  unparseable values are not evidence that it is current.
- **Engine notes:** post-cutoff engine APIs the story touches have notes or a
  verification step, or it states `N/A — no engine API involved`. Do not invent a
  model cutoff, API guarantee or completed verification.
- **Manifest rules noted:** relevant layer rules are listed, or
  `N/A — manifest not yet created`. Passes when no manifest exists.

## Scope Clarity

- **Estimate:** hours, points or a t-shirt size. A template-bracket/unfilled
  Estimate fails. Advisory at minimal, where there is no sprint to size for.
- **Out of scope stated:** an Out of Scope section or wording that makes the
  boundary unambiguous.
- **Dependencies listed:** every prerequisite story, or an explicit None.

## Open Questions

- **No open markers:** no helper marker observations for whole capital words
  TBD, TODO or UNRESOLVED. Preserve its code-fence/comment semantics. A question
  mark alone, such as `crit ? 2 : 1`, is not a marker; a criterion posed as an
  unresolved question still fails Testable. An UNRESOLVED design question in a
  criterion with no owner is BLOCKED; other failed open-marker checks are fixable.
- **Dependencies exist and are not Draft:** missing or Draft dependencies make
  this story BLOCKED. `Story NNN` names that number in the same epic folder;
  a path names exactly that file. Do not confuse this readiness rule with the
  stricter next-candidate rule that waits for dependencies to be finished.

## Asset References

- **Assets the story uses exist:** check referenced inputs under assets/ or with
  .png, .jpg, .svg, .wav, .ogg, .mp3, .glb, .gltf, .tres, .tscn or .res extensions
  that the story reads/builds on. Do not check a file it explicitly plans to
  create (new scene/data/output evidence). Missing input assets are NEEDS WORK;
  name each path. Report `Referenced assets verified: [N] found` or
  `No asset references`. Existence only: do not claim quality or visual approval.

## Definition of Done

- **Enough acceptance criteria:** the section exists with observable checkbox
  criteria meeting the resolved story_granularity minimum. Respect missing-section
  and ac_below_min facts; do not confuse no lint row with a complete empty section.

  | Granularity | Logic / Integration | Visual/Feel / UI | Config/Data |
  | --- | --- | --- | --- |
  | coarse | 3 | 2 | 1 |
  | balanced | 2 | 2 | 1 |
  | fine | 1 | 1 | 1 |

- **Performance noted:** a story touching gameplay loop, rendering or physics
  states a budget, or `no performance impact expected — [reason]`.
- **Type declared:** Logic, Integration, Visual/Feel, UI or Config/Data. Missing,
  unknown or unfilled Type fails. Fix the header with the applicable actual type.
- **Test evidence clear:** a Test Evidence section says where evidence will go:
  test file for Logic/Integration; retained screenshot of each touched screen
  under production/qa/evidence/ for UI; those screenshots plus
  production/qa/evidence/<story-slug>-evidence.md for Visual/Feel.
  At qa.level minimal, Logic/Integration/Config/Data pass this item: tests are
  waived. Add no gap or note about missing test files, tests directory or runner.
  UI/Visual evidence planning is still checked at every QA level. Otherwise use
  gate_level for the actual story type (Visual/Feel→visual, Config/Data→config):
  blocking missing evidence section is NEEDS WORK; advisory is a listed gap only.
  Fix by adding the section and type-appropriate evidence location. Readiness does
  not require running those future tests or taking the screenshots now.
