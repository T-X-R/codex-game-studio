# Establish the decision before drafting

## Load engine evidence first

After identifying the title and effective settings, read the configured engine's
`docs/engine-reference/<engine>/VERSION.md`, the relevant `modules/<domain>.md`,
`breaking-changes.md` and `deprecated-apis.md` where present. Establish the pinned
version and domain (for example Core, Physics, Rendering, UI or Networking).
Read actual version/risk evidence before opening existing ADR reasoning. Missing
reference files or an unknown risk stay unknown. Do not manufacture the current
model's training cutoff or claim a remembered API is verified. Use available
version-matched authoritative documentation for concrete API claims; record which
sources were actually read and whether the task permits retrieving missing ones.

For a documented MEDIUM/HIGH domain risk, prominently identify engine/version,
domain, the recorded knowledge gap and relevant verified changes before deciding.
If no engine is configured, ask for it or the engine setup workflow; an explicit
choice to draft engine-independent work may continue with engine validation
NOT ASSESSED. Never silently run setup or choose a new engine.

## Numbering and binding context

List `docs/architecture/adr-*.md` to choose the next unused zero-padded number,
using the highest existing numeric ID rather than file count. Do not overwrite a
collision or resolve duplicate IDs by choosing one. Listing names is not reading
all prior decisions. Use a safe title slug; author only the agreed project path.

Read `docs/registry/architecture.yaml` **before existing ADR contents**; use the
portable `list architecture` observations in [registry and handoff](registry-and-handoff.md)
for live entries rather than commented examples. Present
relevant state ownership, interfaces, API choices, budgets and forbidden patterns
as existing constraints, with their actual source ADRs and status. Missing or
malformed registry input means this check is NOT ASSESSED, not "no constraints".
Use available architecture/user context to resolve what is binding before relying
on a clean conflict result. Do not turn a Proposed source into an Accepted stance.

If the proposal contradicts a registered stance, show the specific conflict
before confirming new assumptions. Offer alignment, explicit supersession, or
an intentional exception with its rationale. Wait for the relevant decision;
neither a new draft nor a review silently supersedes an existing ADR/registry.

Read only relevant ADR reasoning when needed, using registry links and the
required-ADR list. Map headings and read relevant ranges for large files rather
than loading all ADRs. Read directly related GDD Dependencies, Formulas and Edge
Cases plus sections necessary for the stated requirement. Skip extra reads when
the registry already supplies the needed facts; don't infer a missing requirement
baseline from the design being proposed and declare it covered.

## Confirm the decision inputs

Derive a concise confirm/adjust proposal from evidence: problem, two or three
concrete alternatives, upstream ADR dependencies, GDD linkage, constraints and
Status Proposed. Reuse the user's already-settled choices instead of asking
again. Inconclusive dependency discovery is **UNKNOWN**, not None; resolve it
before writing the ADR. Explicit None means the dependency question was examined.
The optional `check --kind adr-deps --json` reports the existing graph; its exit
zero and tentative order do not certify dependency completeness or acceptance.

Separate schema/data design choices from this assumptions discussion. Resolve
those consequential choices in their own questions before drafting: a user
confirming problem framing has not selected storage layout or event semantics.
State budget assumptions and unknown evidence honestly. For each dependency field
establish Depends On, Enables, Blocks and any ordering note; don't invent ADR/epic
IDs for future work. A Proposed upstream ADR may be documented as a dependency,
but its dependent cannot later be accepted or implemented as an accepted decision
until the upstream requirement is satisfied.

Resolve and read the complete canonical skeleton:

```sh
node .game-studio/run.cjs resource path studio/templates/architecture-decision-record.md --json
```

Write every section with actual decision content or an explicit applicable
absence/unknown; no untouched template placeholders. Summary names the problem
and chosen approach in two sentences. Compare alternatives honestly, record
consequences and risks, performance expectations versus measurements, interfaces,
implementation mandates, migration/rollback and concrete validation criteria.
Trace to actual GDD requirements, or explicitly explain a foundational decision
with no direct GDD dependency and name what it enables. Neither implies GDD sync
was checked.

Engine Compatibility always includes **Layer**. Its cell is exactly one of
`Foundation`, `Core`, `Feature` or `Presentation`, from the architecture layer map
for the system governed by this ADR. Put the source link and explanation in the
Context or prose outside that cell; downstream readers consume the whole value.
If absent or
ambiguous, ask the user. Do not copy the referencing epic's layer or an engine
Domain into it. Missing Layer is treated as critical by downstream workflows.
Date records authorship; Last Verified names an actual verification scope/date,
not implied engine execution. No implementation or measured performance is
claimed from document review. Continue with validation before saving.
