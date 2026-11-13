# Optional registry work and the next decision

## Register only specifically authorized stances

After writing an ADR, identify cross-system state ownership, interface contracts,
performance budgets, explicit API choices and forbidden patterns. Distinguish new
candidates, existing facts needing only referenced_by updates, and intentional
supersession. Internal details with no cross-system effect need no registry row.
Show the candidates and source ADR status; Proposed is not accepted architecture.
Registry approval is separate from ordinary ADR writing. Reuse a concrete prior
approval, otherwise offer update, review candidates first or skip. Declining
leaves `docs/registry/architecture.yaml` unchanged.

For an approved update, read the current file immediately before each change.
Keep its schema/header rules, comments and unrelated entries. In an empty section
replace `[]` with a proper block list; do not append entries underneath `[]`.
Append new entries after existing ones. An explicitly approved replacement marks
the old entry `status: "superseded_by: ADR-NNNN"` and appends the new stance,
retaining history rather than deleting/redefining the old entry. Quote scalars
containing `: `. Preserve real source paths and existing referenced_by members.
A registry mutation never accepts or supersedes the ADR itself.

Resolve the portable reader/validator through:

```sh
node .game-studio/run.cjs resource path studio/scripts/registry.mjs --json
```

Run the returned path, with the actual game root supplied explicitly:

```sh
node <resolved-registry.mjs> --project <game-root> list architecture
node <resolved-registry.mjs> --project <game-root> validate
node <resolved-registry.mjs> --project <game-root> compare architecture <before-snapshot>
```

The script returns direct JSON, not the CLI envelope. Entries contain section,
key/name, complete fields, source-line positions and path refs; comments are not
entries. Inspect `registries[].state` and `diagnostics`, including DUPLICATE,
STATUS, LAYOUT, UNQUOTED, PATH_MISSING, REMOVED and PATH_UNSAFE. A missing/layout
registry is not an empty verified file. `validate` and `compare` exit zero when
observations were collected **even with findings**; `qualityAssessed` is always
false. `compare.removed: null` means preservation could not be assessed.
Snapshots belong to the authorized temporary scope; OLD/NEW paths resolve from
the caller's directory, not the game root. The helper never writes the registry
or reserves an ID. Do not execute retained migration-source scripts.

Use a pre-write snapshot when comparing an authorized registry change. Afterward,
fix findings introduced by that write and preserve unaffected entries/refs;
report unrelated pre-existing findings without quietly repairing them. If the
helper is unavailable or returns no result, state that validation did not run and
reread changed entries against the header. Never label this fallback equivalent
to passed validation. Structural observations do not establish architectural
agreement, accepted status or absence of semantic conflicts.

## Close with actual remaining work

Read the Required ADRs section of `docs/architecture/architecture.md` and list
actual ADR files. With no architecture document, use explicit prerequisites in
`docs/technical-preferences.md` or the systems index. List every remaining
priority ADR by name, not just the next two. Written, Accepted and implemented
are different states: an absent required ADR remains unwritten, and a Proposed
prerequisite remains unresolved for implementation. Offer a separate authoring
choice or stop; do not begin the next ADR automatically.

When all prerequisite ADRs are written, offer the first undesigned system as a
possible GDD handoff, explicitly retaining Proposed/dependency limitations. An
installed `$game-studio-design-system` owns that work; do not impersonate a missing
workflow. With no remaining priority ADR or undesigned system, offer stop and an
independent architecture review. Check actual installed capabilities before any
handoff and stop at the user's requested boundary.

Always state: **For independent ADR coverage validation against GDDs, open a fresh
Codex chat and use `$game-studio-architecture-review` when installed. Do not run
that coverage review in this authoring chat or pass this author's conclusions as
its baseline.** The draft's engine/TD checks do not replace that independent
coverage review. If unavailable, say which capability is missing.

After authoring, list Blocked stories under `production/epics/` still waiting on
this Proposed ADR, with their real paths and count. Do not unblock them. Explain
that `$game-studio-architecture-decision accept ADR-NNNN` is the later explicit
acceptance route. Report registry updates only if actually applied; "ADR written"
is not "registry updated". Retrofit reports its additions, and acceptance reports
only the actual status/story effects.

## Recovery when requested

For an authorized checkpoint, the coordinator resolves and reads
`studio/docs/recovery.md` with `resource path`, reads `checkpoint show --json`,
and saves a unique project-relative draft through `checkpoint save --input ...
--expect-hash ...` using the observed hash (missing only for an absent record).
Keep exact Branch/Stage values, relevant existing work and surrounding narrative.
Remove only that temporary draft afterward. A conflict is reported, never bypassed
by direct checkpoint replacement. Children do not save shared state. No checkpoint
is created for a read-only task or a write the user declined.
