# Conflicts, dependency order and engine audit

## Cross-ADR conflicts (full / consistency)

Compare the in-scope decisions for exclusive data/state ownership, mismatched
integration interfaces, combined allocations exceeding a stated frame budget,
initialization/dependency cycles and incompatible communication/architecture
patterns. A difference on independent subsystems is not automatically a conflict.
Use actual decision text and, where needed, reasoning; distinguish historical
superseded decisions from simultaneously applicable claims. Surface known recurring
areas from the conflict log before new findings.

For each conflict report both ADRs, type, what each claims, impact if implemented
together, and at least two resolution options. Findings do not authorize resolving
the architecture, rewriting an ADR, accepting a Proposed decision or suppressing
one side's requirement.

Run the installed graph observation:

```sh
node .game-studio/run.cjs check --kind adr-deps --json
```

Read the envelope's `data` and actual success/error. `qualityAssessed:false` means
observations only. Preserve `order` exactly; label missing/unknown declarations
that appear as apparent leaves. Inspect `files`, `edges`, `noDepsSection`,
`unfilledDeps`, `missingDependencies`, `duplicateIds`, `invalidFiles`,
`ignoredSelfReferences`, `cycles` and `blockedByCycle`.

- Missing section, placeholder, empty or UNKNOWN declaration is unknown, not None.
  The helper recognizes bracket placeholders; read actual declarations for other
  unknowns. No cycles in an incomplete graph is not proof of a clean architecture.
- Cross each edge with actual unique target Status; missing/non-Accepted upstream
  decisions block safe implementation. Do not accept them automatically.
- `cycles` names true members and their cycle edges. `blockedByCycle` is downstream
  waiting, not cycle membership; do not recommend cutting its edges as cycle fixes.
  A self-reference exposed separately remains a defect to assess.
- Output recommended implementation order from the returned `order`; do not
  hand-sort it by nominal Layer or imply unreadable/missing nodes are implementable.
  Foundation/dependent/feature labels explain the actual order, not replace it.

## Engine audit (full / engine)

Resolve engine name/version from effective settings and project-owned preferences;
no configured engine yields `Engine validation: NOT ASSESSED — no engine configured`.
Do not silently select Web. Audit applicable ADRs against pinned local references:

1. Version agreement and stale older-version claims.
2. Named post-cutoff/new API assumptions versus actual module references, including
   conflicting assumptions about the same API. Do not invent a model training cutoff.
3. Every API named deprecated in the supplied reference versus applicable ADR text.
4. Count Engine Compatibility sections against the ADR denominator; missing sections
   are blind spots, not evidence of compatibility.

Then read [engine lens](engine-lens.md) and apply its configured-engine section to
actual decisions with the audit evidence. This is the main reviewer's second look;
**spawn no agents and claim no native specialist or director gate**. Confirm or
challenge audit findings, flag anti-patterns and unsupported behavior. Name the
ADR, pinned reference or `unverified` for every finding. Lens concerns carry the
same weight as audit concerns. Unknown engine/API evidence cannot yield clean
compatibility merely because no contradiction was found.

## Design feedback

For each HIGH RISK engine finding, inspect the related GDD assumptions: verified
API differences, known engine limitations and deprecated behavior may invalidate
mechanics. In engine focus, this is a targeted read, not full GDD coverage.
Report GDD, exact assumption, verified reality/source and proposed action. If
nothing contradicts the evidence, state the scope actually checked; do not claim
all GDDs consistent when references or GDDs were missing.

If index updates are wanted, show current and proposed rows before authorization.
On concrete authorization change only affected Status cells to exactly
`Needs Revision`; explanations belong outside the cell. Preserve other rows/cells.
Show a complete diff when requested. Decline leaves the index unchanged. No GDD
rewrite, engine upgrade or risk acceptance is implied by this feedback.
