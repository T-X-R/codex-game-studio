# Review the boundaries, scope and written system set

These three gates are sequential, with different inputs. They are not a phase
panel and must not run together before their inputs exist. Lean and solo skip
all three explicitly by gate ID and effective mode; a one-run override never
changes project configuration. In full mode use the named native role with
inherited model/permissions. An unavailable role is NOT ASSESSED, not a generic
subagent or coordinator approval. Do not install roles to manufacture a review.

Ask each reviewer to read the gate definition at the exact `studio/docs/director-gates/`
path listed below through `resource path`. Native role instructions are loaded
from `.codex/agents/<role-name>.toml`; they are not a second shared resource.
The coordinator supplies actual context and aggregates the returned result.
Delegated reviews are read-only: no shared-index writes, checkpoint saves, scope
changes, ADR acceptance or publication. Read the selected role's actual result
before moving to the next dependent phase.

## After dependency mapping: Technical Director

Use `game-studio-technical-director`, TD-SYSTEM-BOUNDARY, with
`studio/docs/director-gates/td-system-boundary.md`.
Pass the complete graph (each system and its dependencies), layer assignments,
bottlenecks, cycles and proposed resolutions, plus the existing index path or
current decomposition if the file has not been written. A summary that omits
edges is insufficient.

- APPROVE: proceed to priorities.
- CONCERNS: preserve the boundary findings inline in the index draft for design.
- REJECT: show the affected boundaries and revise them with the user. Do not
  assign priorities, run PR-SCOPE or write a supposedly resolved index while this
  rejection remains unresolved. Present the revised map before proceeding.
- NOT ASSESSED: name missing context; obtain it and rerun, or continue an explicitly
  unassessed draft with `TD-SYSTEM-BOUNDARY: NOT ASSESSED — [reason]` recorded.
  Never claim approval or bypass a known REJECT through a missing-input label.

## After priorities, before writing: Producer

Use `game-studio-producer`, PR-SCOPE, with
`studio/docs/director-gates/pr-scope.md`.
Pass the complete vision (every system, not just MVP), MVP definition, all four
scope tiers and their counts, estimated implementation volume/complexity if
available, the stated timeline, team size and known actual capacity. Distinguish
provided estimates from observed throughput; unknown inputs stay unknown.

- REALISTIC: record the actual result.
- OPTIMISTIC: present suggested changes and obtain the user's choice to apply
  them or retain the priorities with those suggestions noted. Reuse an explicit
  prior choice covering this situation; do not silently cut scope.
- UNREALISTIC: present the blockers and offer a tier/timeline revision before
  writing. Do not claim the plan is feasible or revise commitments unilaterally.
- NOT ASSESSED: supply missing context and rerun, or retain the reason in the
  index draft. An unassessed draft is not a REALISTIC scope verdict.

## After the index is written: Creative Director

Use `game-studio-creative-director`, CD-SYSTEMS, with
`studio/docs/director-gates/cd-systems.md`.
Pass the actual index path; pillars and core fantasy from the concept, or pitch
and intended feeling from the minimal brief without inventing formal pillars;
assignments across MVP / Vertical Slice / Alpha / Full Vision; high-risk and
bottleneck systems. Empty tiers are explicit, not omitted inputs.

- APPROVE: record the actual result; GDD handoff remains a separate user choice.
- REJECT: present the missing or misaligned experiences and revise the set with
  the user before GDD authoring. A written file does not establish readiness.
- CONCERNS: offer revise the set, accept and record, or discuss. Only actual
  acceptance records a `> **Creative Director Note** (<tier>): ...` directly
  beneath the Priority Tiers definition table. A pending decision is not an
  accepted risk. Revision follows the selected review cadence before rewriting.
- NOT ASSESSED: supply input and rerun, or obtain authorization to record
  `> **Creative Director Note**: CD-SYSTEMS NOT ASSESSED — [reason]` in that same
  location. Reuse authorization to save unresolved review findings if supplied.

Do not invent a per-tier section for these notes. Keep unresolved recommendations
and unaccepted concerns distinct from owner-approved changes. Report exactly which
reviews ran, were deliberately skipped, or remain unavailable/unresolved.
