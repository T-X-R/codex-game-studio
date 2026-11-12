---
name: game-studio-architecture-decision
description: Author a game Architecture Decision Record, retrofit missing ADR sections, or explicitly accept a settled ADR and reconcile its blocked stories. Use for durable technical decisions, not ordinary code explanation or whole-architecture coverage review.
---

# Record a game architecture decision

Work from the game root and read `node .game-studio/run.cjs config get --json`
for effective engine, workflow, review mode, automation, density and team settings,
including provenance and warnings. A supplied `--review full|lean|solo` affects
only this run; do not edit settings to implement it. Missing configuration or
runtime is an unresolved input, not permission to invent either.

## Select the operation

- A title or a natural-language request to document a specific decision: author
  one ADR using [authoring](references/authoring.md), then
  [validation and writing](references/validation-and-writing.md).
- `retrofit <path>`: read [retrofit](references/retrofit.md). Add only missing
  structure; do not rewrite an existing decision.
- `accept <ADR-id>`: read [acceptance](references/acceptance.md). This alone may
  lead to Accepted after dependency checks and concrete user confirmation.
- No title or identifiable decision: ask what technical decision to document
  before engine research, drafting or reviewer calls. An ambiguous mode/path/id
  needs clarification; do not select a different ADR.

New ADRs are always **Proposed**. A favorable review, approved draft, existing
implementation or autonomous mode does not mean Accepted. Acceptance authority
belongs to the user, or native `game-studio-technical-director` acting on the
user's explicit confirmation. The coordinator does not impersonate that role.

Workflow changes which decisions are required: full covers the required ADR list;
standard requires critical Foundation decisions; minimal makes ADRs optional.
Honor a voluntary minimal ADR without changing workflow or adding a new project
prerequisite. Team size never adds sub-specialists or adversarial reviewers here.
Engine-specialist validation applies in every review mode; TD-ADR applies only
in full mode. The two have different responsibilities and run sequentially.

Documentation density changes prose depth, never structural sections or table
fields: terse uses bullets and short rationale, balanced uses concise paragraphs,
thorough develops trade-offs and worked rationale. Keep Engine Compatibility,
ADR Dependencies and GDD Requirements Addressed tables intact at every density.

## Preserve decision and write authority

Reuse settled problem framing, alternatives, dependencies, linkage and specific
write authorization. Guided mode asks only for unresolved consequential choices;
collaborative mode retains the agreed draft-review cadence. Autonomous mode may
record reversible assumptions within scope but cannot invent user agreement,
accept risks, contradict locked architectural stances or accept an ADR.
Acceptance and registry mutations need explicit authority for their concrete
consequences; a prior approval covering those exact consequences can be reused.
A dismissed question or elapsed time is not an answer.

A read-only request produces findings or a draft in the response. It does not
write ADRs, registry entries, stories, checkpoints or project stage. Authoring
owns only the agreed ADR and explicitly authorized related document changes;
implementation, release and whole-project architecture review remain separate.
After the selected operation, read [registry and handoff](references/registry-and-handoff.md)
for optional registry work, actual remaining priorities and recovery handling.
