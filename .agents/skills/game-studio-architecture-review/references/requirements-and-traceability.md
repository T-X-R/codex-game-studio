# Requirements, stable IDs and traceability

## Requirements baseline

Before extracting requirements, resolve the shared registry resource:

```sh
node .game-studio/run.cjs resource path studio/scripts/registry.mjs --json
node <resolved-registry-script> --project <game-root> list tr
```

Read its complete entries and `registries[].state`/diagnostics, plus the actual
`docs/architecture/tr-registry.yaml` and Technical Requirements Baseline in
`docs/architecture/architecture.md`. A missing registry is distinct from malformed
layout; neither is a verified empty set of permanent IDs. Repairing malformed input
is a separate decision; do not allocate over unreadable occupied IDs.

Extract technical requirements, not every design preference: data/schema,
performance, engine capability, cross-system communication, persistence,
threading/timing and platform input. Each implies architecture needed for the
system to work. Name GDD path, system, requirement and domain. Ask when technical
requirement versus preference or identity is consequentially ambiguous.

Match IDs in order:

1. Same system, same intent as an existing active registry entry: reuse ID. A clearer
   wording keeps the ID, proposing a `revised` date only if registration is authorized.
2. Same system/intent as a provisional baseline row: keep that ID if no registry
   entry, active **or retired**, already occupies it. Otherwise allocate a new ID
   and report the explicit provisional → permanent rename and affected citations;
   do not silently rewrite ADRs/stories outside scope.
3. New requirement: next sequence after the highest allocated registry ID, skipping
   every ID held by any baseline row and every ID allocated during this run.
   `next-id tr <system-slug>` observes the registry only; it does not reserve an ID
   or know the provisional baseline. Maintain the union of these occupied sets.
4. Partial/unclear match: ask same requirement versus new requirement. Never assume
   that a similar sentence grants authority to reuse or retire an ID.

Deprecated/superseded entries retain identity/history and are not active requirements
or reusable IDs. If a removed intent appears again, surface that conflict rather
than silently resurrecting it. A registry-only requirement whose GDD is missing or
unreadable is not proven current; show the missing source. Do not deprecate it merely
because its source could not be inspected.

## Coverage matrix

Use the already loaded ADR sections; read Status before grading each relation.
Explicit GDD/TR references support coverage, but compare Decision content as well:
a citation without satisfying the rule is not coverage. An implicit/ambiguous
claim is Partial until its intent is clear. Retired ADRs do not establish current
Accepted coverage; keep their replacement/status uncertainty visible.

| Status | Evidence |
| --- | --- |
| Covered | Accepted ADR explicitly addresses the requirement and its decision supports it. |
| Covered (Proposed) | Decision addresses it but is Proposed; caps verdict at CONCERNS and routes `accept ADR-NNNN`. |
| Partial | Only part addressed or relation/decision ambiguous. |
| Gap | No applicable ADR addresses the requirement. |
| Not assessed | Required ADR unreadable, malformed or missing Status, or requirement evidence unavailable. |

Show every in-scope row: Requirement ID, GDD, System, Requirement, ADR Coverage,
Status. Count all five categories separately; denominators do not discard unknown
or Proposed rows. Name layer and source for gap criticality; unknown layer is not
permission to lower its importance. New IDs stay provisional until registered.

## Story and test linkage

Run for `rtm`, or full when stories exist. Enumerate `production/epics/**/*.md`
excluding EPIC.md indexes, distinguishing actual story files and reporting their
count. Extract TR references, actual status header and complete Test Evidence
section. Support existing status syntax; full-read a story whose section is missing
or ambiguous. Multiple stories/test paths can reference one requirement. Never
infer a story from its filename alone or from an unrelated successor mention.

Index test paths under the configured engine roots: Godot `tests/unit/**/*_test.*`
and `tests/integration/**/*_test.*`; Unity `Assets/Tests/**/*Tests.cs`; Unreal
`Source/*/Private/Tests/**/*.cpp`; Web `tests/unit/` and `tests/integration/` with
its actual project's naming/configuration. Check every declared story test path
for actual existence, even outside the conventional root. No engine or unknown
layout is an unassessed index, not proof of no tests. Do not install or run tests
unless that separate action is authorized.

Extend each requirement with ADR, Story path(s), Test File path(s), Test Status:

- **COVERED:** the cited test file exists; structural linkage only.
- **MISSING:** a path is stated but absent.
- **NONE:** story supplies no test path (may be Visual/Feel/UI; retain that context).
- **NO STORY:** no implementing story is linked yet.

Also summarize NO ADR and incomplete architectural coverage from the first matrix;
Proposed/Partial/unknown ADRs do not form an Accepted full chain. Keep multiple
links visible rather than letting one existing file hide a missing required one.
Report path-linked full-chain count/percentage over the actual active requirement
set, with disjoint row-level totals and zero denominator as not assessed, not 100%.

**A test file's existence does not prove a passing test.** The source's COVERED
label is retained for structural linkage; report actual execution evidence
separately (command/environment/result/date, or not supplied). Never call the
chain verified, behavior passed or tests passing based only on file presence.
