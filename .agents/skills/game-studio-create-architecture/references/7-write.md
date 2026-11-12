# Write the blueprint, then collect actual reviews

## One content write

When all applicable sections/decisions are settled, show what will be written and
apply [persistence](persistence.md). A new/full document is written once to
`docs/architecture/architecture.md`; a focus/update replaces only authorized
sections plus version/date metadata. Do not create a skeleton at Phase 0. Revisions
likewise redraft first and write their approved changes once.

Prefer an inline draft. If temporary draft files are needed, create an exclusively
owned directory with `mkdtemp` or a file with exclusive creation, and confirm this
run owns it. Never overwrite a fixed shared temporary path. Clean up only this
run's owned temporary artifacts.

Use this structure for full scope. Standard retains status, knowledge gaps,
complete baseline, layer map, critical ADR audit/list, applicable principles and
questions; omitted full chapters are not secretly completed. For a voluntary
minimal run use the agreed scope and actual brief-based baseline. An explicit
request for extra chapters controls without changing workflow settings.

```markdown
# [Game Name] — Master Architecture

## Document Status
- Version: [observed next integer; 1 for a new document]
- Last Updated: [actual date]
- Engine: [configured name and version]
- GDDs Covered: [actual enumerated sources, or minimal brief]
- ADRs Referenced: [actual IDs and statuses]

## Engine Knowledge Gap Summary
[Recorded HIGH/MEDIUM risk, unknown evidence and architectural implications]

## Technical Requirements Baseline
[Complete source-derived rows and registered/provisional counts from Phase 0]

## System Layer Map
[All mapped game systems; Platform is external]

## Module Ownership
[Full/requested scope: per-layer Owns/Exposes/Consumes/Engine APIs and dependencies]

## Data Flow
[Full/requested scope: frame, event, persistence or explicit N/A, initialization]

## API Boundaries
[Full/requested scope: entry points, caller invariants and guarantees]

## ADR Audit
[Actual compatibility/linkage/conflicts/coverage, scoped by workflow]

## Required ADRs
[Actual missing decisions and uncovered requirements, layer/priority ordered]

## Architecture Principles
[3–5 principles grounded in concept, GDDs and preferences]

## Open Questions
[Actual deferred decisions, owner/resolution path and affected layer]
```

No untouched placeholders or fictional measurements. A statement of architecture
is not implementation, permanent TR registration or independent approval.

## Post-write native TD-ARCHITECTURE and LP-FEASIBILITY

Apply effective review mode **before** any dispatch. Lean/solo skip both; name
`TD-ARCHITECTURE` and `LP-FEASIBILITY` with `skipped — Lean mode` or `skipped — Solo
mode`, and record those statuses within the authorized Document Status update.
Do not invoke reviewers just to add authority to a skipped mode.

Full: inspect installed role files and actual host-native role availability. Use
`game-studio-technical-director` and `game-studio-lead-programmer`, with inherited
session model/permissions and no generic stand-in. Read `studio/docs/integration.md`
through `resource path` for the role contract. Resolve both gate resource paths
without reading their definitions in the coordinator; each reviewer reads its own.
Issue both independent native role calls before waiting for either, then collect
both results. Never claim parallelism from two sequential completed calls.

| Native role | Gate resource | Actual context to pass |
|-------------|---------------|------------------------|
| game-studio-technical-director | studio/docs/director-gates/td-architecture.md | Written architecture path; complete TR baseline and count with source provenance; ADR list/statuses; engine knowledge-gap inventory |
| game-studio-lead-programmer | studio/docs/director-gates/lp-feasibility.md | Written architecture path; TR baseline summary with source access; ADR list/statuses; applicable engine/language and supplied budgets/estimates with provenance |

Give each reviewer read-only scope: no architecture/ADR/registry/checkpoint writes,
installation, implementation or nested delegation. A proposed architecture cannot
supply its own independently reconstructed baseline. For focus updates, explain
which stored chapters/baseline are unchanged and any new GDD discrepancy observed.

Unavailable role/tool, failed invocation or unreadable required input is NOT
ASSESSED with its actual reason, not a self-review APPROVE. One available reviewer
can assess its own scope; that does not fill the unavailable one's verdict. No
host configuration changes or installs are authorized merely to obtain a gate.

Present TD `APPROVE / CONCERNS / REJECT` and LP `FEASIBLE / CONCERNS / INFEASIBLE`
side by side, with findings. A known blocker outranks missing context; an unknown
assessment never becomes approval. With CONCERNS offer accept and record / revise
flagged items / discuss; actual risk acceptance is required, not inferred from
routine file-write authorization. If either is REJECT or INFEASIBLE, do not offer
Accept or claim readiness: discuss/revise blockers first. Keep the already written
draft and unresolved state visible rather than deleting it or claiming completion.

Revisions show affected sections, preserve unchosen scope and use one content
write through the same authorization cadence. Record `REVISED after [original
verdict]`; this is not a new approval. If a fresh gate is run, retain original and
new outcomes with their reviewed content/version. When input was missing, either
supply it and rerun or record NOT ASSESSED; do not clear visible blockers.

Show the exact proposed Document Status block before applying it, reusing scoped
write authority in guided mode and collaborative approval where still required:

```markdown
- TD-ARCHITECTURE: [date] — APPROVE / CONCERNS (accepted) / REVISED after CONCERNS / REVISED after REJECT / NOT ASSESSED — [reason] / skipped — [mode] mode
- LP-FEASIBILITY: [date] — FEASIBLE / CONCERNS (accepted) / REVISED after CONCERNS / REVISED after INFEASIBLE / NOT ASSESSED — [reason] / skipped — [mode] mode
```

These are alternatives, not text to copy wholesale. If concern acceptance or
revision is pending, retain the actual adverse result and unresolved finding;
never label it accepted. Preserve other status metadata. Recording results
changes no stage, requirement identity, ADR acceptance or publication authority.
