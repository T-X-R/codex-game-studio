# Review the draft, compare GDD names, then write

## Engine specialist, in every review mode

Resolve the primary native role from the effective engine: Godot →
`game-studio-godot-specialist`, Unity → `game-studio-unity-specialist`, Unreal →
`game-studio-unreal-specialist`, Web → `game-studio-lead-programmer`. With an
absent engine, inspect the effective `specialists.primary`/technical-preference
Primary record for an explicit configured primary; do not invent a role. Record
no configured engine as Engine validation: NOT ASSESSED with its exact cause.

Check the actual host's available role types and installed `.codex/agents/`
definitions. A missing role remains NOT ASSESSED; neither the coordinator nor TD
substitutes for that review. Team size adds no other reviewers. Use inherited
model/permissions and a read-only assignment. Pass the actual draft (including
Engine Compatibility, Decision and Key Interfaces), pinned references and known
uncertainties. Ask about idiomatic version-specific design, deprecated/changed
APIs, and unrecorded engine risks. A source review is not execution proof.

Prefer passing the draft content directly. If a reviewer needs a draft file,
create it in a unique temporary directory (`mkdtemp`) or with exclusive creation
within the authorized scope; never reuse a fixed shared temporary filename. Keep
its path and ownership for this run, and remove only this run's temporary files
after the dependent reviews finish. Never delete a pre-existing or other run's file.

For a blocking incompatibility, revise the affected Decision/Compatibility fields
within the user's choices, and confirm consequential changes before proceeding.
Minor notes belong in Risks without invented risk acceptance. An unavailable
review may remain in an explicitly authorized unassessed Proposed draft; it cannot
be represented as completed validation or acceptance.

## TD-ADR, after the engine review

- Full: invoke native `game-studio-technical-director`. Give it the actual draft
  or file, engine/version/domain/risk evidence, relevant ADRs and registry stances,
  GDD requirements and the returned engine review. Have the role read the exact
  gate through `resource path studio/docs/director-gates/td-adr.md`. Its native
  instructions live in `.codex/agents/game-studio-technical-director.toml`, not a
  guessed second shared resource. Do not request a review before its inputs exist.
- Lean/solo: report **TD-ADR skipped — Lean/Solo mode** with the actual mode.
  This deliberately skipped strategic gate does not skip engine validation.

Preserve the native result and findings. APPROVE permits the authoring flow, not
Accepted status. On CONCERNS show the concerns verbatim and offer revise flagged
items, accept concerns and proceed, or discuss; reuse a prior concrete choice.
Revise Decision/Alternatives only when selected. Accepting a review concern does
not accept the ADR itself. On REJECT show the blockers and resolve/revise the
unsound decision before treating it as ready to write. NOT ASSESSED names missing
input and does not masquerade as approval. Unresolved consequential decisions
need separate targeted choices, not one blanket answer. Reviewer children never
write the ADR, shared registry, story statuses or checkpoint during this phase.

## Always report GDD sync

Compare all files actually named in GDD Requirements Addressed against Decision
and Key Interfaces for renamed methods, events/signals and data types.

- Found: show a prominent **GDD SYNC REQUIRED** warning listing each file and
  old → new name immediately before the write decision. Offer ADR + matching GDD
  updates, ADR only with the user's explicit deferral, or wait. Do not silently
  edit the GDD or leave the inconsistency undisclosed.
- None found: state how many actual referenced GDDs were checked and that no
  naming inconsistency was found.
- Could not check: report **GDD sync: NOT ASSESSED** and the absent section,
  unnamed GDDs or missing files. A foundational decision with no GDD is not a
  clean comparison of zero files.

## Save only the authorized draft

Show the target `docs/architecture/adr-NNNN-<slug>.md` and material unresolved
findings. In guided mode reuse explicit draft/write authority; a new substantive
choice or unapproved GDD change still needs its owner's decision. Respect a
collaborative preview/approval request or a declined/read-only write. Reread the
path and any authorized GDD just before mutation to avoid replacing concurrent
work; allocate a new ID only after explaining an actual collision.

Save the ADR as **Proposed**, even after both reviewers approve. Preserve unrelated
files, settings, project stage and story statuses. Verify required sections and
fixed tables, real links, correct number/layer/engine, resolved dependency
statement and traceability against the written bytes. A generic GDD validator
cannot certify an ADR. Report the actual engine/TD/GDD-sync results separately
from successful writing. Registry work and closing follow the final reference.
