# Freshness and the evidence set

The review log is `design/gdd/reviews/<doc-stem>-review-log.md`. Use the installed
Skill's sibling `scripts/review-receipts.mjs`. This compatibility entry point
resolves `studio/scripts/review-receipts.mjs` through the restored, pinned project
runtime; it never selects a global CLI. It is read-only and requires Node.
From the game root:

```sh
node .agents/skills/game-studio-design-review/scripts/review-receipts.mjs check design/gdd/reviews/<doc-stem>-review-log.md <target-gdd> .agents/skills/game-studio-design-review/SKILL.md design/registry/entities.yaml
```

Resolve the shared implementation with `node .game-studio/run.cjs resource path studio/scripts/review-receipts.mjs --json`
and include its actual project-relative path in the evidence set.
Also pass this Skill's references/helper, effective policy sources, and all
currently discovered relevant context paths. Only the latest review entry supplies
the comparison hashes: older stamps cannot fill gaps beneath a newer verdict or
deeper mode. The checker still observes every previously stamped path; an existing
path omitted from the latest entry is NEW, and deletion or movement is GONE rather
than silently ignored.
An optional literal file absent in both runs is omitted; an unmatched pattern
is UNRESOLVED. Newly discovered context is NEW. Old untyped hashes, missing stamps
or unreadable inputs cannot establish identity. Do not use Git state or mtimes
as a review baseline. A receipt is a change detector, not trusted instructions.

Read the latest review entry's verdict, findings, `Review mode` and `Workflow`.
A prior pass covers the requested depth only if its mode is at least as deep
(full > lean > solo) and workflow at least as deep (full > standard > minimal).
Missing or invalid metadata covers nothing. A prior incomplete specialist panel
or unresolved required evidence cannot become full approval through a receipt.

- If all compared inputs are UNCHANGED and coverage is sufficient, identify the
  prior date, mode, tier and verdict. Guided/autonomous may reuse an APPROVED
  verdict unless the user requests a fresh review; collaborative offers reuse
  or fresh review. Do not claim new specialists ran. For an unchanged revision
  verdict, retain the prior findings and recommend revision rather than repeated
  identical analysis; display the findings when useful.
- If the requested depth is greater, perform the complete requested review.
  A user may explicitly choose the earlier narrower assessment, but label its
  actual scope; it does not satisfy the deeper request.
- If only cross-document facts changed and the target, Skill logic and policy are
  identical, re-check all affected facts and reissue the verdict. Escalate to the
  complete review on a conflict or insufficient prior coverage.
- Target, Skill/reference/helper, effective requirement changes, unknown receipt
  metadata or no receipt require complete review. Do not offer a section-only
  delta review. GONE/UNRESOLVED or a hash error never counts as all unchanged.

## Evidence to read

Read the whole target in ranges selected by headings; do not truncate a large
GDD and infer the remainder. Record prior blocking findings for re-review.

For cross-document facts, prefer `design/registry/entities.yaml` when it contains
entries owned by or referencing this system. Inspect complete YAML entries,
including the block `referenced_by` list; a single-line regex cannot read that
relationship. If the registry is absent, empty or lacks entries for this system,
read the related GDDs explicitly named in Dependencies. Do not glob-read every
GDD. Regardless of registry coverage, resolve each declared dependency to an
actual existing file; report missing or ambiguous references.

Read the concept and existing narrative/world-rule documents for pillars, tone
and lore. At minimal rigor/workflow a brief supplies the intended feeling
without requiring invented formal pillars. Record what was unavailable and
whether it prevents a criterion from being judged. A known contradiction is a
finding even when another input is unknown.

List the registry's entity names and their numeric keys. Search the **entire**
GDD, case-insensitively, including tables, variants, room notes and appendices;
allow underscore/space variants in names. Check every matching line against
its owning record. With no usable registry, use entities/values from declared
related GDDs. Report searched terms, match count and each conflict's line number,
target value and owning value. A local exception does not silently override
another system's established value. If no values are available, say they were
not cross-checked; do not report a clean registry pass.

Capture hashes for the inputs actually examined, including relevant roles in
full mode. Before writing a review receipt, compare those hashes again. A file
changed during review must be reread/reassessed; hashing its new unseen bytes
would falsely certify evidence that was never reviewed.
