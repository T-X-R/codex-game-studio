# Report, verdict and handoff

## Master architecture (full)

Check `docs/architecture/architecture.md` against actual systems-index/GDDs: every
system belongs to a layer; data flows cover cross-system communication; API
boundaries support integration requirements; architectural systems without GDDs
are identified, distinguishing justified infrastructure from unexplained orphans.
If absent, include `Architecture document coverage: NOT ASSESSED — no
docs/architecture/architecture.md`. Do not represent omitted findings as a clean
master architecture. Standard tier covers its critical scope explicitly.

## Report

Present the complete in-scope matrix and findings before requesting writes.
Use this structure, retaining named NOT ASSESSED and out-of-scope distinctions:

```markdown
# Architecture Review Report
Date: <date>
Mode: <full|coverage|consistency|engine|single-gdd path|rtm>
Workflow: <effective project tier>
Scope: <actual systems/ADRs and any explicit broader request>
Engine: <name/version or none configured>
GDDs Reviewed: <actual count / denominator>
ADRs Reviewed: <actual count / denominator>

## Traceability Matrix
<all in-scope rows; not applicable for consistency/engine>
## Traceability Summary
<Total, Covered Accepted, Covered Proposed, Partial, Gap, Not assessed>
## Coverage Gaps
<TR-ID, GDD, system, rule, layer/source, suggested ADR, domain, engine risk or unknown>
## Cross-ADR Conflicts
<each evidence/impact/choices; out of scope when excluded>
## ADR Dependency Order
<helper order plus structural gaps, unresolved dependencies and cycles>
## GDD Revision Flags
<assumption, verified reality/source, action; or bounded no-findings/unknown>
## Engine Compatibility Issues
<audit and local Engine Specialist Findings with evidence limits>
## Architecture Document Coverage
<systems/dataflow/API/orphans or explicit unavailable/out-of-scope>
## Verdict: <PASS|NOT ASSESSED|CONCERNS|FAIL>
<rationale and actual scope>
## Blocking Issues
<required defects preventing PASS, when FAIL>
## Required ADRs
<prioritized gaps, Foundation before lower-impact systems>
```

RTM adds the extended chain, path-link coverage totals and separately observed test
execution. Saved reports add receipt lines under the header only at write time,
after approved registry/log changes; draft stamps are never evidence.

Verdict precedence is **FAIL > CONCERNS > NOT ASSESSED > PASS**:

- FAIL: uncovered critical Foundation/Core requirements within this required scope,
  or blocking cross-ADR conflicts. Standard makes noncritical findings advisory;
  do not apply full-tier coverage requirements to out-of-scope systems.
- CONCERNS: nonblocking gaps, Partial or Proposed-only coverage, or other known
  concerns. Name explicit `$game-studio-architecture-decision accept ADR-NNNN`
  where acceptance is the route; never perform it as part of review.
- NOT ASSESSED: required scope cannot be judged: absent/unreadable ADR set, no
  usable requirement source for coverage, unreadable/missing Status, no master
  architecture in full, no engine/reference evidence in full/engine, or unavailable
  deterministic checks. Named unknown line items remain even under a higher verdict.
- PASS: all required in-scope requirements have Accepted coverage, no unresolved
  blocking/nonblocking concerns, and all required checks actually assessed clean.
  Scoped PASS is not whole-architecture approval. Zero inspected items, unknown
  declarations and test-file presence cannot establish PASS.

A missing document/class can make coverage unknown rather than demonstrate a
critical gap; do not turn malformed ADRs into an invented design failure. Conversely,
a known real conflict remains FAIL even if another area is unassessed. The user may
choose to continue despite an advisory verdict; that does not change the verdict,
accept a risk or satisfy a later gate's evidence requirements.

## Handoff

List up to three highest-impact missing ADRs, Foundation first; distinguish missing,
written Proposed and Accepted prerequisites. Recommend rerunning this review after
new ADRs. Check actual paths before describing pre-gate readiness:

- Godot/Web `tests/unit/` and `tests/integration/`; Unity
  `Assets/Tests/EditMode/` and `Assets/Tests/PlayMode/`; Unreal actual
  `Source/<Module>/Private/Tests/`. No configured engine means not assessed.
- `.github/workflows/tests.yml`.
- `design/accessibility-requirements.md`.
- `design/ux/interaction-patterns.md`.

Missing roots/workflow route to test setup; missing design files to UX work. These
are prerequisite existence checks, not tests passing or UX acceptance. Do not offer
`$game-studio-gate-check pre-production` while any required item is missing or a
blocking ADR gap remains. Name missing follow-up capabilities as unavailable,
not executable installed commands; use actual installed Skills when present.
When prerequisites exist and no blockers remain, gate-check is an available next
choice, not an automatic operation. Missing ADR authoring starts a fresh chat.

If further interaction is wanted, offer relevant ADR/test/UX/gate/stop choices
using the host's available input mechanism. A read-only stop request needs no
extra next-workflow question. Do not hold an already authorized review hostage to
an unavailable structured-input tool.
