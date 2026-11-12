# Codex acceptance: create-architecture (S015)

Status: native acceptance in progress; selected attempts and retained failures are
recorded in [the evidence](../../../docs/evidence/create-architecture-skill-2026-11-12.json).
The complete original/extended matrix and desktop acceptance remain pending. This
does not replace [the original specification](create-architecture.md) or narrow its source cases.
Source: `.claude/skills/create-architecture/SKILL.md`, all nine phase references,
shared gate/automation/workflow contracts and architecture-review requirement IDs.

## Source-to-Codex mapping

| Source contract | Codex behavior and evidence |
|---|---|
| Injected config/Claude tools/model tier | Pinned CLI configuration with field provenance; actual available question/delegation tools; inherited model/permissions, no second model client. |
| Full / standard / voluntary minimal | Full retains all layers, ownership, flows, APIs and ADR audit; standard authors layer map and critical ADR list with complete baseline and visible deferred gaps; minimal uses agreed scope/brief without inventing mandatory index. |
| Workflow versus density | Depth changes prose, never required coverage, IDs or evidence. Focus requests select one existing chapter without silently upgrading all chapters. |
| Engine context first | Read all four project-wide references and only pertinent/ambiguous modules. Verify actual pinned version/types/signatures. Missing/version-mismatched references and recorded cutoff uncertainty remain visible; no remembered API pass. |
| Complete GDD denominator | Enumerate every GDD and account for each. Read requirement-bearing sections fully, follow references, full-read zero-match legacy GDDs, retain zero-contribution findings. No self-derived architecture baseline. |
| Stable requirement IDs | Match active same-system/same-intent entries first; preserve nonconflicting existing provisional IDs; skip every registry status plus baseline/in-session ID. Reader next-id is an observation, not reservation. No TR registry writes by author. |
| Existing document | Chosen sections in place or explicit rewrite/stop. One content write; preserve unselected bytes. Version increments, current date/sign-off changes explicitly scoped. No-target focus asks before creation. |
| Layers / module contracts | Every system mapped; Platform external, wrappers Foundation. Owns/Exposes/Consumes/APIs, single owners and dependency diagrams remain complete. |
| Data flow / API | Frame/event/persistence-or-N/A/initialization, data/producer/consumer/mode/thread boundaries; caller invariants and guarantees with version-aware engine types. No invented mechanics to fill tables. |
| ADR audit / priorities | Actual compatibility/linkage/coverage and conflicts, every baseline row accounted; Proposed distinct from Accepted. Foundation/Core gaps before code; genuine required title/TR links, no invented reserved ADR ID. |
| Collaborative single-write model | Decisions saved through transactional checkpoints; master architecture is not incrementally written before Phase 7. Guided reuses scoped authority, autonomous records assumptions without consent fabrication; unanswered required choice waits. |
| Phase 7b native pair | Full dispatches actual technical-director and lead-programmer before waiting; children read their own gate, parent supplies all true context. Read-only, inherited model/permissions. Lean/solo named skip, missing roles NOT ASSESSED. |
| Verdicts / revisions | Exact TD/LP vocabularies, concerns accepted only by real owner choice, blocker excludes Accept, unknown stays unknown. Revision single write and `REVISED after ...`; no old review promoted to approval of changed bytes. |
| Handoff | Actual version/verdicts, top three outstanding ADRs, explicit pre-production readiness, installed destination check. No code/stage/registry/acceptance side effects. |

## Explicit source discrepancies repaired

1. Source Phase 0b creates a **Technical Requirements Baseline**, but the Phase 7
   skeleton omits it. Source architecture-review `2-extract-requirements.md`
   explicitly consumes that baseline from architecture.md. Persist the original
   responsibility as its own chapter. A focus update does not silently rewrite it;
   report new source/baseline discrepancies separately and preserve its bytes.
2. Source fixed `-A 40` windows and exact unnumbered heading regex can truncate
   requirements. Use complete heading-bounded sections, including numbered
   headings and zero-match full reads, preserving the original completeness rule.
3. Source unconditional phase prose conflicts with its explicit standard tier.
   Route authored sections by tier/request, never erase baseline requirements or
   pretend deferred full chapters were assessed.
4. Source update-preservation rule coexists with version and post-write sign-off.
   Make those metadata exceptions explicit and leave all other unselected bytes.
5. Source next-id only observes registry max+1; existing baseline provisional IDs
   and in-session assignments also occupy IDs. Match intent then use the union;
   the architecture-review workflow owns permanent registration/collision repair.
6. Source template sketches future ADR numbers. Do not present a guessed number
   as reserved. Use title + covered TRs; actual existing IDs remain exact.
7. Source technical preferences lived under `.claude/docs/technical-preferences.md`.
   The Codex runtime reads only project-owned `docs/technical-preferences.md`;
   missing preferences remain unknown, with no legacy runtime path fallback.

## Complete original acceptance scenarios

- **Case 1:** Full new blueprint, complete source-derived baseline/denominator,
  domain-scoped reference reads, header-only initial ADR inventory, risk choice,
  each proposal before collaborative approval, decision checkpoints before single
  Phase 7 master write, genuine parallel native TD/LP, actual status authorization,
  fixed handoff and explicit pre-production prerequisites. No prefilled verdicts.
- **Case 2(a/b):** Real uncovered serialization ownership, concerns versus a missing
  reviewer input. Accept records CONCERNS (accepted); revise uses one new content
  write and REVISED after CONCERNS; unreadable input stays NOT ASSESSED with reason.
  Risk acceptance must be a real continuation, not generated from elapsed time.
- **Case 3(a/b):** Lean and run-only solo skip both gates explicitly, preserve
  settings, record skip and proceed without fictitious child review.
- **Case 3b:** Core-to-Presentation dependency blocker, actual native verdict,
  no Accept while rejected, controlled revision and preserved adverse history.
- **Case 4(a/b/c):** Missing/placeholder standard index, missing concept and
  voluntary minimal brief substitution. Also exercise missing engine/version and
  missing minimal brief; each stop creates no fabricated baseline/artifact.
- **Case 5:** Legacy unstructured GDD enters baseline through full-read fallback;
  Accepted and Proposed ADRs remain distinct, missing requirement coverage becomes
  required ADRs by layer, readiness distinguishes accept versus write, max three
  next ADRs only when three exist.
- **Case 6(a/b):** Existing v2 Data Flow update becomes v3 with all other content
  preserved except disclosed status metadata. No-target focus offers full scope
  without writing. Every focus argument also needs its own positive coverage.
- **Case 7:** Registered intent retains ID; retired IDs never reused; other IDs
  provisional; real registry absent/empty/read states and counts. Paraphrased intent,
  existing provisional reservations and collisions also need coverage.

## Additional required matrix

Successful standard and voluntary minimal; all density/automation combinations
where behavior differs; genuine interactive collaborative approvals and revisions;
all focus sections, explicit rewrite and stop; unknown engine/module/version risk;
per-field config provenance; numbered/long sections and zero-contribution files;
complete layer/domain routing; budget/ownership/signature/thread contradictions;
malformed registry and existing baseline identity conflicts; gate CONCERNS/REJECT/
INFEASIBLE/NOT ASSESSED and changed-after-review content; unavailable native roles;
actual parallel start-before-wait and read-only permissions; checkpoint conflict,
interruption, stale recovery and fresh-session resume; negative ADR-only, generic
UI/library diagram, implementation and independent-review triggers; CLI and desktop.
These remain pending until their own real evidence is reviewed.

## Fixture and evidence method

`toolkit/test/create-architecture-host.mjs <scenario>` uses a frozen packed install,
Unicode project path and actual Codex CLI. Verify installed bytes, raw before/after
files, checkpoints/events/backups, exact unchanged source chapters/config/registries,
parent and child traces, actual native role identity, start/wait sequence, child
read scope and model/permission inheritance. The fixture supplies raw project
facts, synthetic reference documents and approved owner decisions, never canned
gate answers. Synthetic engine references establish fixture behavior only.

Runner exit 3 after native zero means semantic review pending, not a pass. Review
full output artifacts and tool actions before assigning PASS/FAIL/NOT ASSESSED;
retain original failures and resource hashes after fixes. One successful batch
never substitutes for the complete matrix, desktop, engine execution or human play.
