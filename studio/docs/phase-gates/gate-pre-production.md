> Gate definition, loaded by `$game-studio-gate-check` for the target stage only.
> Never load the other five — one gate applies per invocation.


# Gate: Technical Setup → Pre-Production


**Required Artifacts:**
- [ ] Engine chosen (`engine inspect` reports an actual configured engine, not an unset or placeholder value)
- [ ] Project config populated (`project.yaml` has engine/naming/performance set, or legacy `docs/technical-preferences.md` populated)
- [ ] Art bible exists at `design/art/art-bible.md` with at least Sections 1–4 (Visual Identity Foundation)
- [ ] At least 3 Architecture Decision Records in `docs/architecture/` covering
      Foundation-layer systems (scene management, event architecture, save/load)
- [ ] Engine reference docs exist in `docs/engine-reference/[engine]/`
- [ ] Test framework initialized: the engine's test root exists — `tests/unit/` and `tests/integration/` (Godot, Web), `Assets/Tests/EditMode/` and `Assets/Tests/PlayMode/` (Unity), or `Source/<Module>/Private/Tests/` (Unreal); use `node .game-studio/run.cjs engine inspect --json` to resolve this project's actual engine and test roots; an unresolved root is NOT ASSESSED
- [ ] CI/CD test workflow exists at `.github/workflows/tests.yml` (or equivalent)
- [ ] At least one example test file exists to confirm the framework is functional
- [ ] Master architecture document exists at `docs/architecture/architecture.md`
- [ ] Architecture traceability index exists at `docs/architecture/requirements-traceability.md`
- [ ] `$game-studio-architecture-review` has been run (a review report file exists in `docs/architecture/`)
- [ ] `design/accessibility-requirements.md` exists with accessibility tier committed
- [ ] `design/ux/interaction-patterns.md` exists (pattern library initialized, even if minimal)

**Which `$game-studio-architecture-review` report counts.** Read the `Mode:` line of each
`docs/architecture/architecture-review-*.md`, and for each item below use the
newest report whose mode checked it:

| Item | Modes that check it |
|---|---|
| `$game-studio-architecture-review` has been run | `full` |
| Traceability matrix has zero Foundation layer gaps | `full`, `coverage`, `rtm` |
| Engine audit shows no deprecated API usage | `full`, `engine` |

A `single-gdd` report saw one system and a `consistency` report only compared
ADRs, so neither counts here. When no report's mode checked an item,
that item is NOT ASSESSED, never passed on a narrower report: name the newest report's
mode and the run that closes it (run `$game-studio-architecture-review full`, or the mode
the table names). A report with no `Mode:` line was written before 1.2.0 and
does not say what it checked, so it counts for none of the three, as
`$game-studio-architecture-review` itself rules.

**Quality Checks:**
- [ ] Architecture decisions cover core systems (rendering, input, state management)
- [ ] Technical preferences have naming conventions and performance budgets set
- [ ] Accessibility tier is defined and documented (even "Basic" is acceptable — undefined is not)
- [ ] At least one screen's UX spec started (often the main menu or core HUD is designed during Technical Setup)
- [ ] All ADRs have an **Engine Compatibility section** with engine version stamped
- [ ] All ADRs have a **GDD Requirements Addressed section** with explicit GDD linkage
- [ ] No ADR references APIs listed in `docs/engine-reference/[engine]/deprecated-apis.md`
- [ ] All HIGH RISK engine domains (per VERSION.md) have been explicitly addressed
      in the architecture document or flagged as open questions
- [ ] Architecture traceability matrix has **zero Foundation layer gaps**
      (all Foundation requirements must have ADR coverage before Pre-Production)

**ADR Circular Dependency Check**: when this check applies at the effective
workflow tier, use the pinned deterministic operation:

```sh
node .game-studio/run.cjs check --kind adr-deps --json
```

Read `data.files`, `edges`, `cycles`, `blockedByCycle` and `order` together with
`noDepsSection`, `unfilledDeps`, `missingDependencies`, `duplicateIds`,
`invalidFiles` and `ignoredSelfReferences`. These are observations, not an
architecture verdict. A missing input or failed operation cannot count as an
acyclic graph; retain NOT ASSESSED and identify the input needed. Separately
missing required ADR artifacts remain findings under the artifact checklist.

- **Nonempty `cycles` → FAIL**: name the cycle members and the reported edges
  within each cycle. A governing ADR cannot reach Accepted while that cycle
  exists; present an edge to reconsider without silently editing the decision.
  `blockedByCycle` lists ADRs waiting on a cycle, not members of it. Their own
  edges are not the edges to cut to break that cycle.
- An observed graph with no cycles passes the cycle test only. If dependency
  sections are missing or unfilled, surface CONCERNS with every affected ID;
  unknown dependencies are not explicit “None”. Missing targets, duplicate or
  invalid IDs, and ignored self mentions also require review before trusting
  the proposed order. Do not report a clean architecture or accepted ADRs from
  `order` alone. The helper preserves the upstream self-mention convention,
  so inspect any reported self mention before deciding it is harmless.

**Engine Validation** (read `docs/engine-reference/[engine]/VERSION.md` first):
- [ ] ADRs that touch post-cutoff engine APIs are flagged with Knowledge Risk: HIGH/MEDIUM
- [ ] `$game-studio-architecture-review` engine audit shows no deprecated API usage
- [ ] All ADRs agree on the same engine version (no stale version references)

## Workflow tier reductions

The checklist above is the **`full` baseline**. At lower tiers apply the
reduction for the resolved tier; items not named keep their status above.
Reductions only ever *relax* a requirement — `workflow_overrides` is the
only thing that adds one.

- **`full`** — engine + art bible §1–4+ + 3+ ADRs + architecture + UX specs started + accessibility doc + traceability index all required
- **`standard`** — art bible required **only if visual-asset stories exist**; ADRs reduced to **critical (Foundation-layer) only**; UX-specs-started, accessibility doc, interaction-patterns, traceability index → recommended
- **`minimal`** — only **engine configured** required (the minimal floor); everything else **drops**
