# S059 — Codex story-done behavior contract

Status: content candidate only. No native story-done acceptance has run. Every
matrix item below is OPEN. Static validation, helper unit tests or a host exit
zero cannot promote these rows to PASS or the Skill to verified.

## Authority and scope

Source: `.claude/skills/story-done/SKILL.md` (all eight phases), its CONTRACT.md,
references/review-gates.md, sprint-next.md, tech-debt-row.md, and all eight cases
and variants in `studio-tests/skills/readiness/story-done.md`. Also retain actual
shared coding/engine-root/automation/gate semantics. The current source Skill's
specific branches govern conflicts with its older contract/test prose below.

Candidate runtime files:

1. `.agents/skills/game-studio-story-done/SKILL.md`
2. `references/review-gates.md`
3. `references/sprint-next.md`
4. `references/tech-debt-row.md`

This specification is the fifth review file, intended for
`studio-tests/skills/readiness/story-done-codex.md`. Runtime entry has supported
name/description frontmatter, natural explicit-story activation and no Claude
model/tools/interpolation metadata. No hook installation, trust, global role
configuration or custom permission/model tier is required or permitted.

The workflow verifies one story and optionally closes its records. It does not
implement, run tests/game code, capture new evidence, accept ADRs, edit design,
change settings or execute the suggested next workflow. Native closure editing
and the existing checkpoint save transaction are reused; no new close writer,
public arbitrary-write JSON protocol or multi-file atomicity claim is introduced.

## Observable contract by phase

| Phase | Required behavior and evidence |
| --- | --- |
| 1 | Explicit path/review override, otherwise same-context checkpoint then global active story-facts; ambiguous candidates ask, no files route honestly. Actual config/provenance, per-system workflow, independent QA and strictness, engine roots. Full target story once after observer. |
| 2 | Full current exact TR requirements, required GDD/ADR spans; standard GDD and critical Foundation/missing-Layer ADRs; minimal own criteria. Manifest version all tiers. Missing/unreadable required artifacts remain unknown. |
| 3 | Every AC evaluated and mapped separately; static test presence is coverage only; real answers/images for behavior/visibility. Image actually opened, motion not inferred from still. DEFERRED distinct from UNTESTED; QA threshold exact; vague criterion unknown; known failure retained. |
| 4 | All five story types and no-Type advisory; actual engine test roots, exact then fallback path, Integration playtest alternative. QA-minimal test waivers, UI no-sign-off distinction, Visual approval rows, Config default/full/explicit-false. Receipt freshness informational. Attributed Run result and grown-game post-story comparison. |
| 5 | Required current rules/ADR constraints; literal Manifest-Note and staleness; tuning/localization; exact uncommitted scope and same-epic Complete ownership exception. Own calls from actual implementation/design/checkpoint, real kept/changed answers. |
| 6 | Lean/solo skips with provenance; full actual eligible typed QL and LP, inherited settings, own gate reads, complete context and actual results. Missing role never substituted. Gate results never approval to edit. |
| 7 | Full report precedes writes; BLOCKED > NOT ASSESSED > COMPLETE WITH NOTES > COMPLETE. Existing concrete authorization reused; adverse override is explicit and recorded. Exact story/companions/debt/commit scope, no silent partial sync; unrelated bytes/history preserved. |
| 8 | Fresh post-close global routing at minimal/no sprint; applicable sprint route conditional ref. All three all-built directions, unfinished states visible, missing downstream capabilities honest. Hash-guarded checkpoint preserves narrative; read-only no writes; final four-line block matches actual state. |

## Runtime dependencies and actual interfaces

- Pinned `config get --json` and single-key review_gate, gate_level, engine_row;
  per-system `config get modes.workflow --system ID --json`. Values live under
  data.settings[key].value with sources/warnings. `--review` is local to this run.
- `resource path` resolves actual installed shared story-facts, ADR-status,
  registry, md-section, review-receipts, story-status, recovery and gate resources.
  Never require the retained `.claude` tree at runtime.
- story-facts `--project ROOT PATH`/`--all`; preserve missing paths and observer
  qualityAssessed:false. testEvidence is a Status field, not a path/verdict.
- ADR-status `--project ROOT ID|PATH...`; exact current paths before extracting
  sections. Layer missing means critical in standard; duplicate IDs visible.
- registry `--project ROOT get ID...` for full exact TR entries; malformed or
  unreadable registry is not an empty/clean result. No fabricated prefix lookup.
- md-section `--project ROOT list|status|extract FILE [HEADING] [--body]`, JSON
  observations; extract includes subsections, missing3/ambiguous4, safe paths.
  No replace/insert/set-field implementation; native editing handles writes.
- review-receipts `check <stamp.txt>` from project root. Actual script implements
  latest-entry baseline; no hash result independently asserts behavior/quality.
- engine_row includes state/source/value for roots and excluded_code_directories.
  Unknown/invalid roots never silently fall back to src or produce zero-hit passes.
- checkpoint show omits Own calls/Same-seed run and caps preview; inspect actual
  bounded CHECKPOINT for them. Current task and branch must actually apply.
  Save with exact observed whole-file hash and unique project-relative input;
  existing journal/backup/event transaction, no direct active.md overwrite.
- Actual native game-studio-qa-lead and game-studio-lead-programmer only. Their
  authoritative shared gate definitions are read by each child, not coordinator.

## Source case mapping — all remain OPEN

| Original source case | Required Codex scenarios and adaptations |
| --- | --- |
| 1 happy path | `source-01-standard-confirmed`: standard Godot Logic, actual behavior answers plus opened relevant image, existing unit tests, critical ADR sections, lean answer, explicit close, exact notes/sprint next. `source-01-full-current-tr`: same functional story in full workflow with stale story quote, exact registry001 versus0010, current requirement wins. `source-01-no-runtime-answer`: test bodies alone cannot establish behavior; wait/unknown. |
| 2 manual/playtest | `source-02-deferred`: actual animation answer plus opened frame, full-level persistence deferred; notes without threshold inflation. `source-02-fails`: real No blocks. `source-02-no-image`: Yes without retained image fails applicable visual-observation gate. Add true UNTESTED threshold variants below, not relabel deferred. |
| 3 design contradiction | `source-03-max-3-vs-5`: full current TR/GDD says3, actual code5; blocking plus tuning issue, no code fix. `source-03-override`: separate actual explicit risk acceptance closes with BLOCKED history, not COMPLETE verdict; no duplicate permission after exact acceptance. |
| 4 auto-detect | `source-04-checkpoint`: actual same-story/branch checkpoint chosen. `source-04-global-active`: no checkpoint task, global IN_REVIEW/IN_PROGRESS. `source-04-ambiguous`: several actual candidates waits. `source-04-empty`: no stories gives creation route/availability. `source-04-wrong-branch`: historical mismatch not blindly used. |
| 5 director gates | `source-05-full`: actual QL+LP with full context and observed independent verdicts. Natural inputs for QL GAPS/INADEQUATE/unknown and LP CONCERNS/REJECT/unknown; do not force labels in prompts. `source-05-lean-yes/no/later`: actual answers/provenance, no children. `source-05-solo`: both skips/no code-review question. Review approval alone cannot close. |
| 6 minimal UI | `source-06-retained-ui`: open real image showing both criteria, no sign-off demand, authorized close plus post-close global next. `source-06-other-epic-review`: global In Review outranks local Ready. `source-06-no-image`: blocking even QA minimal. `source-06-only-blocked`: no false all-built or readiness/sprint sequence. |
| 7 unknown criterion | `source-07-vague`: “robust” uncheckable, NOT ASSESSED. `source-07-untested`: actual Not tested yet below threshold, unknown. `source-07-failure-first`: known fail outranks unknown. `source-07-override`: exact explicit acceptance retains unevaluated criterion and adverse verdict after close. |
| 8 lazy references | `source-08-lean-no-sprint`: no review-gates/sprint-next/tech-debt reference reads. `source-08-full-sprint-debt`: each ref loaded only at its phase before the relevant action. A true contradiction from Case3 cannot be arbitrarily downgraded to advisory merely to make this path close; use actual noncontradictory advisory drift. |

## Additional high-value acceptance matrix — OPEN

The original eight cases do not establish these branches. Keep every row open
until the actual applicable behavior is observed, including negative outcomes.

| Group | Independent acceptance scenarios |
| --- | --- |
| QA/criteria | Minimal UNTESTED stays unknown without threshold block; standard exactly half unknown vs more than half blocked; full any UNTESTED blocked; DEFERRED not in threshold count; missing/unobservable criterion; empty criterion set not fabricated as all passing. workflow minimal with QA standard still requires Logic evidence. |
| Evidence types | Logic exact path and actual-root fallback; Integration test and story-named playtest alternatives; UI screenshot for every touched screen, no Visual sign-off; Visual image+all named approvals, image absent, approvals absent/unapproved; Config no smoke at minimal/standard/full and full explicit false; no Type advisory. Existing unreadable evidence unknown; test-file presence plus known failure not claimed passing. |
| Roots | Godot/Web src, Unity Assets/Tests, explicit custom roots, flat root exclusions, Unreal unresolved module, ambiguous/invalid/case-mismatched root, no engine; no incorrect src fallback, no framework scanning as game code. |
| Image/freshness | Actual opened image before description; unopened checkpoint attributed; still cannot prove animation/performance; CHANGED/GONE/NONE/new/unsupported stamp coverage reported without automatic verdict switch; unchanged receipt doesn't replace review. Source evidence never recaptured/overwritten by this workflow. |
| Run/growth | Legitimate and invalid N/A reasons; NOT VERIFIED with visible criteria; missing line only bookkeeping versus actual absent image gap; legacy replay.args and current complete grow.md/report path; copy-only/incomplete growth distinguished; SAME/accepted change/unaccepted change/missing post-story run/explicit reasoned NOT ASSESSED. Real new play acceptance not inferred. |
| Requirements | Multiple exact TRs/ADRs, prefix collision001/0010, changed current requirement versus stale quote, missing required GDD/ADR sections, duplicate headings, CRLF, Detailed Rules fallback, standard Foundation and missing Layer versus noncritical feature, minimal no forced architecture. Manifest stale advisory/no-manifest skip/Manifest-Note verbatim. |
| Scope | File names with spaces, staged+unstaged+untracked code/test changes, complete same-epic ownership exclusion, unrelated/incomplete other-story changes still visible, matching checkpoint Files fallback, clean tree, missing Files, Git unavailable. Claimed scope does not prove code quality. |
| Own calls | New timing/value/wording outside design, unchanged prior approval reused, real Keep and Change choices, unanswered choice waits before gates, code names excluded, hidden checkpoint Own calls beyond preview retained, no readable files unknown, no auto-fix of rejected call. |
| Reviews | Real inherited roles/gate-first child reads, QL skip QA minimal and Config, LP skip no implementation, unavailable/refused/failed typed role unknown, lean prior answer reused. Source QA Test Cases/AC and actual evidence passed completely. Actual missing run evidence observed by QL cannot become passing tests. Review findings do not authorize writes. |
| Authorization | Verification-only leaves records; read-only preserves all files incl checkpoint/drafts; existing conditional passing close proceeds without repeated approval; no authorization asks once; declined/empty answer no close; adverse findings need specific acceptance; prior exact override reused; rejected own call not silently kept; scope remains one story. |
| Closure sync | Status and Last Updated exact header/styles; old completion/calls/history preserved; notes capture original adverse override; CRLF unchanged outside targets; unique exact sprint file row/date with unrelated rows preserved; duplicate/malformed/mismatched sprint produces visible conflict; nonexistent membership not fabricated. |
| Brief/epic | Last remaining feature-N story ticks exact brief checkbox; sibling unfinished prevents tick; deepen-system matching/absent/ambiguous feature; don't tick cut/unrelated item; exact EPIC Stories row versus duplicate/same-basename collisions/missing row. |
| Debt/commit | Optional selected debt one row each, next free TD/max not count, exact10columns/Added/date/totals, new/existing/no-table register, delimiters escaped, no duplicate repeat/history loss. Commit declined means no git mutation; selected commit excludes pre-staged unrelated files and mixed unrelated path edits, preserves author, failure reported independently. |
| Conflict/recovery | Re-read detects concurrent edit before target mutation, no guessed overwrite; injected later edit failure preserves actual partial state, no false “fully synchronized”; checkpoint expected-hash conflict/retry does not wipe narrative; correct event/backup, own temporary draft removed only after success; no-change/read-only no fabricated event. |
| Next routing | Fresh helper after actual close across all epics; In Review then In Progress then TODO; positive all-complete offers all three directions; zero/blocked/Draft/no-status not all built; minimal excludes readiness/sprint close-out even stale sprint exists; standard/full no sprint readiness availability honest. |
| Sprint routing | Actual newest plan, ties/explicit conflict, Ready/Not Started Must/Should dependencies finished, no-ready active Must count, complete-or-blocked truthful counts plus sequence, unstarted Should alongside, actual QA approval prerequisite for stage advancement, absent downstream capability not silently skipped. Open story retains primary unresolved fix. |
| Output | Complete report includes all ACs/traceability/evidence/own calls/scope/review and limits before mutation; Reviewed by never blank/fictitious; final four lines match actual status and saved/unsaved work, checkpoint Next step agrees; no extra game/test execution or downstream start. |

## Source drift and deliberate Codex adaptations

1. Source Case1's standard fixture expects current TR registry reading, whereas
   current Phase2 specifies it for full. Preserve the standard behavior and add
   full-current-TR scenario instead of raising every standard read to full.
2. Case1's test-functions/COVERED rows do not themselves prove behavioral ACs.
   Current Phase3 explicitly needs observation/answers. Retain presence-versus-pass
   separation; the full QL shared gate separately requires actual execution evidence.
   CONTRACT's claim that a failing test cannot block does not erase a known AC
   failure or that gate's INADEQUATE result. No tests execute in this workflow.
3. Case2 describes DEFERRED as UNTESTED; current Skill explicitly separates them.
   Deferred-only notes can be COMPLETE WITH NOTES, never threshold escalation.
4. Case4's newest-sprint fallback is stale: current Phase1 uses global story-facts.
   Same-story checkpoint remains first when genuinely applicable.
5. Old static allowed-tools/model/AskUserQuestion/interpolation fields and phase
   numbers are Claude host specifics. Use supported frontmatter, actual native
   questions/roles and explicit instructions. Natural activation does not imply
   write authorization; explicit-only metadata is not carried over without request.
6. Original report/tests mix Code Review and Reviewed by. Keep meaningful review
   provenance, required Reviewed by and all gate skips; do not require a nonexistent
   independent review. “Entered Phase7” means report is always allowed, mutation is
   guarded, including BLOCKED/unknown outcomes.
7. Source sprint-next permits Complete-or-Blocked but says all complete. Preserve
   its routing opportunity with truthful complete/blocked counts and unresolved
   blockers. Do not infer stage readiness or reduce the intended sequence.
8. Source “run result missing is advisory” conflicts with its final information-line
   exception. Missing bookkeeping alone is informational; actual absent visible
   evidence still follows the type gate. Receipt freshness lines are informational.
9. CONTRACT unconditional missing-test/Complete constraints yield to explicit
   QA-minimal waivers, strict=false and explicit adverse close override. These are
   not quality passes; retain exact risks and status/verdict separation.
10. Repeated write/new-file/commit questions yield to existing concrete user
    authorization, as required by this Codex project's guided policy. Real missing
    facts, new design choices and new risk acceptance still require actual input.
    Explicit read-only overrides source checkpoint-always behavior.
11. Source helper write commands are not available in the read-only migrated
    md-section slice. Native bounded edits plus preflight/conflict/diff verification
    replace them. The existing checkpoint transaction is not a general close
    transaction. Partial write failure must remain observable, not hidden by a
    fabricated rollback/atomicity claim.
12. Source plain git commit can sweep unrelated staged paths; preserve its stated
    narrow-commit intent by checking the index and committing only reviewed paths.
    Sprint schema mismatch is an explicit conflict, fixing source's documented
    silent-sync weakness without introducing a generic writer.
13. Source Case8's variant cannot label a known current requirement contradiction
    advisory for test convenience. Use a genuinely advisory deviation and preserve
    the separate blocking contradiction regression.
14. Current Codex grow.md and actual conversion/replay artifacts join the source
    replay.args signal; unfinished copy/screenshot alone is never “grown.” Current
    incomplete downstream capability migration is shown honestly, not fabricated
    invocation availability. No different engine is silently substituted.

## Native evidence requirements

After integration, use the installed archive in independent temporary projects
and natural user requests that contain no expected verdict/routes/hidden rubric.
Keep fixtures and fixture versions stable for same-input repair comparisons.
Use actual images whose contents the runner knows independently, existing true
execution artifacts where required, and real user-answer continuation sessions.
Never synthesize a “human approved” answer in the coordinator to make a test pass.
A supplied historical fixture answer must be clearly identified and its scope
checked; it cannot prove interactive continuation behavior.

Capture archive/canonical installed-resource hashes (including shared receipt
implementation), host model/effort/permission metadata, request bytes/hash,
before/after workspace manifests, actual events/role conversations, final response,
all changed file bytes and checkpoint event/backup linkage. Review the real child
calls, not only role-file presence or host status. Read all actual outputs against
this contract, retaining correct subchecks alongside any total failure.

For close tests inspect every changed path and unrelated-file preservation,
companion rows/brief/epic/debt, existing history and author/commit index boundaries.
For read-only/declined tests prove file preservation. Explicit partial-failure
fixtures must prove truthful durable-state reporting. No skip, cancelled process,
zero exit or static lint is a native PASS. Preserve first failures and resource
variants on fixes; overall migration remains partial until remaining acceptance
is explicitly resolved with evidence.
