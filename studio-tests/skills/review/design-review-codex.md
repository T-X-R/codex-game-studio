# Codex single-GDD review acceptance

Target: `.agents/skills/game-studio-design-review/SKILL.md`. Preserve all six
source cases (including 5a/5b/5c and Case 6 override variant) and coverage notes
in `design-review.md`. This record specifies required acceptance; it does not
claim that any native scenario has passed. S021 remains partial until the source
contract and full Codex matrix have independently reviewed host evidence.

## Source-to-Codex mapping

| Original requirement | Codex contract / proof required |
| --- | --- |
| Injected YAML, model/tools frontmatter | Pinned `config get --system` with actual provenance; native model/permissions inherited; no Claude injection or model pin. |
| `--review` and legacy `--depth` | One-run preference; rename notice; `--review` wins when both given; shared/local configuration unchanged. |
| Workflow requirements and numeric test | Effective system tier, eight/full, five/standard plus numeric Formulas/explicit overrides, no required GDD/minimal; placeholder content is not complete. |
| Original Case 1, complete full-workflow GDD | Detailed Design alias accepted, 8/8 substantive required sections; dependency checks and complete review; separately authorized tracking only. |
| Original Case 2, four missing full sections | 4/8 and named required gaps; revision verdict, no approval/bypass, correct revision tracking. |
| Original Case 3, standard numeric rules | Formulas required because of content, not Category; 5/6, quoted vague criteria and proposed measurable rewrites. |
| Original Case 4, absent target | NOT ASSESSED with exact missing producer; no approval/index/log writes. |
| Original Case 5a, full specialists | All actual domain roles independently review in parallel within host capacity, then actual Creative Director synthesis. No gate ID/word substitution; disagreements retained. |
| Original Cases 5b/5c/6 | Legacy lean, solo isolation, stored mode and one-run precedence; solo performs no tracking/closing flow. |
| Review receipts | Bundled read-only Node SHA256 checker compares only the latest review entry's stamps, retains visibility of older context paths, optional absent inputs and NEW/CHANGED/GONE/UNRESOLVED; untyped source receipts conservatively require review. |
| Prior receipt depth | Exact bytes plus adequate mode/workflow coverage; no approval upgrade from shallower, failed or incomplete review. Changed target/Skill/policy invokes whole-GDD review; context-only changes permit bounded fact reassessment until a conflict. |
| Registry and dependencies | Real YAML owner/reference blocks; fallback only to named dependency GDDs; whole-document search including tables and variants with line/value evidence. |
| Hard-coded AskUserQuestion/new-file asks | Native question UI where available, concise fallback otherwise; honor read-only scope and reuse concrete prior write authorization. Guided continuous work after consequential decisions. |
| Context percentages and log_decision | Actual saved evidence/remaining action; no invented context percentage, fixed agent count, fake decision tool or host session-clearing requirement. |
| Revision and tracking | Preserve GDD/index/history; never mark edited-but-unreviewed bytes Approved; a receipt represents the version actually examined. No stage/config/checkpoint mutation. |
| Final dynamic choices | Inspect actual index and GDD set, honor installed destination availability, offer real next action without automatic handoff. |

The minimal-tier row in the original phase-2 checklist called Overview REQUIRED,
while Phase 0 and the output contract explicitly specify no GDD and N=0. The
Codex workflow follows that explicit tier/output contract: all default minimal
section checks are advisory; actual requirement overrides remain explicit.
A second deliberate correction isolates each review entry's evidence: older hash
stamps cannot complete a newer review's missing proof while borrowing its deeper
mode/workflow metadata. Previously observed paths still produce NEW/GONE when
the latest entry does not cover them. The source shell used latest-per-path hashes
across the entire log, which allowed this mixed-entry coverage claim.
A missing specialist/senior in full review is missing required coverage, not a
silently reduced lean review. Known defects remain actionable beneath this gap.

## Native behavioral matrix

Use freshly packed and restored Unicode/space-path projects. Give realistic raw
GDDs, policy and user authorization; never feed desired verdicts or evaluator
findings to the reviewer. Validate actual Skill discovery, source reads, native
role types/ordering, returned findings, artifacts and before/after file hashes.

1. Complete eight-section GDD, Detailed Design alias, lean from stored settings:
   substantive review and exact required denominator; retain read-only scope.
   A separate authorized-record case changes only the intended index status and
   appends an accurate, reproducible log receipt without touching the GDD.
2. Incomplete full GDD and placeholder/empty variations: known required gaps
   yield revision findings; never accept-as-is around blockers or an approval
   tracking transition. Distinguish partial readable input from no target.
3. Standard numeric and nonnumeric systems, per-system tier overrides, explicit
   tuning requirement and deceptive categories: denominator and required/advisory
   classification follow content plus resolved policy. Quote every vague AC.
4. Missing/unreadable/empty target or required dependency: explicit evidence gap;
   no fabricated review, quality approval or tracking mutation. Known unrelated
   blocking defects outrank unknowns without hiding them.
5. Registry variants/tables and block referenced_by links: every conflicting
   number with line/values, not only Detailed Rules. Empty registry uses declared
   sibling GDDs; unrelated GDDs are not bulk-read. Concept/brief/lore contradictions
   remain source-linked and are included in specialist context.
6. Full native specialist set including formulas boundary analysis, fantasy and
   QA criteria; actual concurrent specialist starts where capacity permits;
   senior starts only after all return. Source-tagged disagreement, true senior
   verdict, inherited settings. Separately test unavailable role/senior and tool
   denial; no simulated specialist or full approval with missing coverage.
7. Full/lean/solo and --depth/--review conflicts, guided/collaborative/autonomous:
   no config writes, no solo follow-up, no redundant guided write question, no
   invented strategic consent, and actual UI or available fallback.
8. Byte-identical approved and failed reviews, missing/old receipt metadata,
   insufficient mode/workflow depth, a newer deeper entry missing target/all stamps,
   changed Skill/ref/helper/policy, newly added
   registry/context and deleted related files. Verify every stamped path and the
   currently relevant context set. Known changes cannot inherit an approval.
9. Context-only change may recheck facts; a new conflict triggers full review.
   Target change invokes whole-GDD reading rather than a delta-only shortcut.
   Hash/permission failure and unexpanded glob cannot produce unchanged evidence.
10. Authorized revisions: grouped unresolved decisions, blocker-to-fix record,
    fresh review request, Needs Revision vs In Review status, no premature
    Approved. Prior log entries/other index rows and unread input bytes survive.
11. Refused/limited writes, concurrent index/log/GDD changes, absent index and
    interrupted append: no silent overwrite or unrelated artifact. No automatic
    checkpoint or stage change; output accurately states what was written.
12. State-derived closing choices, named pending/next systems, unavailable
    destinations, root/subdirectory and native desktop discovery. A source-code
    question does not trigger GDD review or solicit tracking writes.

## Executable fixtures

After a successful toolkit build, the maintainer may run:

```sh
node toolkit/test/design-review-host.mjs complete-records
node toolkit/test/design-review-host.mjs complete-records-clear
node toolkit/test/design-review-host.mjs incomplete
node toolkit/test/design-review-host.mjs numeric-standard
node toolkit/test/design-review-host.mjs missing
node toolkit/test/design-review-host.mjs minimal
node toolkit/test/design-review-host.mjs registry-conflict
node toolkit/test/design-review-host.mjs full-missing-role
node toolkit/test/design-review-host.mjs reuse
node toolkit/test/design-review-host.mjs receipt-gap
node toolkit/test/design-review-host.mjs deeper-review
node toolkit/test/design-review-host.mjs context-changed
node toolkit/test/design-review-host.mjs system-override
node toolkit/test/design-review-host.mjs negative
```

The host wrapper deliberately exits 3 after native success to require manual
semantic assessment; 0 is not an automatic behavior pass. All fixture review
history/planning/context is synthetic. No native desktop or entire S021 claim
follows from isolated CLI cases. The receipt unit tests exercise deterministic
identity and preservation only; they do not judge review depth or design quality.
