# Codex architecture-decision acceptance

S002 retains all source cases and coverage notes in `architecture-decision.md`.
Target: `.agents/skills/game-studio-architecture-decision/SKILL.md`. Its author,
retrofit and accept operations remain distinct. Static metadata, available role
files and a zero CLI exit do not establish behavioral completion.

## Source contract and adapted mechanics

| Source requirement | Codex adaptation and required evidence |
| --- | --- |
| Title / retrofit path / accept ID; one-run review override | Native Skill routing, ambiguity guard and unchanged project settings. |
| Injected settings, pinned model and Claude tools | Pinned CLI effective settings/provenance, actual native role types with inherited model/permissions. No model pin or tool impersonation. |
| Engine context first and knowledge-gap warning | Read pinned version/domain references before ADR reasoning; disclose supplied risk and missing evidence. Never invent model cutoff or runtime verification. |
| Next ADR number, registry-before-ADR context | Highest unused file ID; relevant binding stances first, then bounded relevant ADR/GDD reads. Missing registry input is unassessed, not clean. |
| Confirm assumptions separately from schema decisions | Reuse actual settled choices in guided mode; unresolved dependencies are UNKNOWN pending decision, never implicit None or silently completed input. |
| Complete fixed ADR template and prose density | All sections and three structural tables at every density; exact four-value ADR Layer cell with provenance in prose, version/risk, real requirement links or explicit foundational case, honest performance/validation/rollback. |
| Primary engine validation, then TD-ADR | Godot/Unity/Unreal primary or Web lead programmer in every mode; TD only full. Missing role is NOT ASSESSED, never a substituted coordinator/TD review. No team-size sub-specialists. |
| CONCERNS, REJECT, NOT ASSESSED | Returned findings and choices preserved; resolve known rejection before readiness; approving draft or concerns never sets Accepted. |
| GDD sync found / clean / could not check | Actual named files and changed names; explicit warning and ADR+GDD / ADR-only deferral / wait choice; zero files or missing input never claims clean. |
| New-file approval | Guided reuses goal/decision/write authority; collaborative preview and consequential unresolved choices retained. No redundant ordinary-write prompt. |
| Separate registry approval and append validator | Concrete candidates and explicit authority; reread current YAML, valid empty-list transition, preserve history/refs and quote superseded status. Portable validator required for parity; manual header reread fallback is expressly unverified. |
| Author always Proposed; blocked stories remain blocked | Actual saved Status and all existing stories checked; no authoring-driven unblock. |
| Acceptance authority and concrete effect confirmation | User or native TD on explicit user confirmation. Coordinator previews exact story effects first; prior confirmation counts only when it covers those same effects. TD writes only ADR status/date, coordinator verifies and updates eligible stories. |
| Acceptance dependency guards | Exact ID, actual Status, explicit examined dependencies and Accepted upstream ADRs. Missing/UNKNOWN/duplicate/cyclic/self references are not a vacuous pass. |
| Blocked story matching and successor exclusion | Only production/epics/**/story-*.md, all three status syntaxes. ADR must be current blocker, not just replacement suggestion; unrelated/co-existing blockers stay Blocked. |
| Retrofit appends missing fields | Existing sections byte-preserved except absent Layer insertion. Accepted answer first writes Proposed and enters acceptance; Date-only repair and decline remain observable. |
| Fresh-session coverage review and all priority handoffs | Fresh Codex chat, installed capability check, no same-author coverage self-approval. Written versus Accepted prerequisites separated; no automatic next operation. |
| Optional recovery record | Actual expected-hash checkpoint transaction, coordinator only; not required or written in read-only fixtures. |

The source entrypoint's acceptance edit conflicts with the source template's
named-agent authority. This migration follows the explicit authority contract:
the native Technical Director edits Accepted after user confirmation. A second
narrow correction prevents unblocking a story that still has another unresolved
blocker; mentioning the accepted ADR alone is not evidence of readiness. Both
retain, rather than weaken, the source's pending-decision guard.

## Native behavioral matrix

Use fresh installed archives in disposable Unicode projects, realistic raw inputs,
independent native parent/child traces, before/after hashes and actual artifact
review. Don't put expected verdicts, suspected bugs or evaluator conclusions in
the request. Owner-supplied engine references and approvals are synthetic fixtures,
not external API verification, real player feedback or product sign-off.

1. New Web authoring under solo and full: correct next ID, all fields and layer,
   registry ordering, confirmed dependency, honest scalar-snapshot constraints,
   engine role in both modes, TD only full and after engine review; Proposed file,
   explicit clean GDD sync and no story/registry/stage side effects.
2. One-run solo override from stored full; project configuration unchanged and
   primary engine review still runs. Lean, all team sizes and density variants
   separately preserve the same structural/review contract.
3. Missing title: ask before drafting/research/review. Missing engine/references,
   missing primary role and missing TD are individually NOT ASSESSED, without
   pretending another role supplies the missing independent result.
4. Registry conflict before assumptions: align / supersede / exception choices;
   no unapproved draft, replacement or registry edit. Malformed/missing registry
   input and inconclusive dependency discovery remain explicit unknowns.
5. Native adverse engine/TD reviews: actual incompatibility, CONCERNS, REJECT and
   NOT ASSESSED; retain their distinctions, user's choice and any rerun. No new
   decision accepted because a reviewer approved it.
6. GDD sync clean, renamed interface, empty linkage and missing file. Explicit
   ADR-only versus authorized paired edits; preserved unrelated GDD content.
7. Registry write approval, decline and reused concrete approval; empty/existing
   lists, referenced_by retention and supersession history; portable validator
   negative controls including duplicate/status/layout/quoted-scalar/missing-path.
8. Acceptance preview in autonomous mode: dependency inspection and concrete
   eligible story count/path list before confirmation. No implied consent or
   mutation from an initial accept request alone.
9. Confirmed acceptance: actual native TD, exact ADR Status change, Date retained
   or added only if absent; only truly unblocked stories become Ready. Preserve
   successor-only, unrelated, co-blocked and outside-epics files verbatim.
10. Refusals/no-ops: upstream Proposed/missing/ambiguous, target duplicate/missing,
    absent Status, absent/empty/UNKNOWN dependencies, self/cycle, already Accepted,
    Deprecated and Superseded. No edit or invented replacement.
11. Retrofit Proposed/Deprecated/Superseded answers; missing status/dependencies,
    compatibility/Layer/linkage/date-only; existing Last Verified avoids Date
    addition. Existing bytes preserved; decline writes nothing. Accepted answer
    passes through Proposed and concrete acceptance authority, including refusal.
12. Concurrent ADR/registry/story edits, partial failure, allowed-write limits,
    cancellation, named absent handoff, whole priority list, actual checkpoint
    conflict and fresh-session coverage boundary. Desktop and subdirectory host
    discovery require separate evidence.
13. Negative ordinary code question: no ADR workflow, reviewer, decision prompt,
    registry/story/status/checkpoint write or architecture approval request.

## Maintainer fixtures

After building the toolkit, run one isolated scenario with:

```sh
node toolkit/test/architecture-decision-host.mjs author-solo
```

Available scenarios are defined in `toolkit/test/fixtures/architecture-decision-cases.mjs`:
`author-solo`, `author-full`, `solo-override`, `missing-title`, `registry-conflict`,
`accept-preview`, `accept-confirmed`, `accept-blocked`, `accept-unknown`,
`accept-duplicate`, `retrofit-proposed`, `negative`.
The runner checks packed bytes, actual Skill discovery and allowed file effects;
its exit 3 after a successful native run means semantic review is pending. Authoring
requests permit stopping on a fundamental incompatibility: a missing planned ADR
is recorded for semantic assessment instead of being declared a workflow failure
solely because no artifact was written. Accepted-status fixture mutations have
exact content checks for the allowed Status-only changes; the retrofit fixture
checks preservation of the original document prefix. Review
actual ADR/story diffs, native role identities, ordering, tool results and unchanged
files before recording a scenario pass. Also inspect trace-visible temporary draft
paths, exclusive creation and cleanup: the project hash snapshot alone cannot
prove isolation of files outside the project. These initial fixtures do not cover the
whole matrix above. S002 remains partial until source and Codex matrices, registry
parity and required host acceptance have actual evidence.
