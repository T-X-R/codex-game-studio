# Portable registry observations

The internal `studio/scripts/registry.mjs` resource replaces shell-dependent
registry reads for Codex authoring workflows. Resolve it with
`node .game-studio/run.cjs resource path studio/scripts/registry.mjs --json`, then
execute the returned path with Node and `--project <game-root>`. The script uses
the pinned package's compiled implementation and YAML dependency. Run the bundled
resource, not the canonical source wrapper before a maintainer build.

It reads the entity, technical-requirement and architecture registries without
writing them, reserving an ID, accepting an ADR or producing a design verdict.

| Command | Observation |
| --- | --- |
| `list [entities\|tr\|architecture] [--system SLUG]` | Entries across the selected registries; system filtering matches an exact TR slug. |
| `get NAME ...` | Complete matching entries and names that were not found. |
| `refs NAME\|PATH` | Declared source/reference paths; for a TR name, exact citations in epic/story Markdown with line numbers. |
| `slice PATH` | Entries naming the path in their source, GDD, ADR or `referenced_by` fields. |
| `validate` | Duplicate section/name identities, unknown TR citations, missing/unsafe paths, invalid statuses and layout diagnostics. |
| `compare REGISTRY OLD [NEW]` | Removed identities and newly introduced invalid statuses; unchanged old status findings are not presented as new. |
| `next-id KIND [SCOPE]` | Highest observed number plus one for TR, ADR, bug, asset, technical debt, story, sprint or season. No reservation or write. |

TR and story numbering require a lowercase system/epic slug. Deprecated and
superseded IDs still participate. Sprint retrospective names do not count as
sprint plans. Snapshot paths supplied to `compare` are relative to the caller's
working directory or absolute; an omitted NEW means the project's live registry.

Output is JSON with `qualityAssessed: false`. Registry records distinguish
`read`, `missing` and `layout`. Entries retain their section, identity key/name,
line, parsed `fields`, `fieldLines`, normalized-line-ending `raw` text and explicit
`refs`. Parsed values preserve nested maps, arrays, quoted commas and block text;
comments and illustrative text do not become registry facts. Use the original
file bytes, not `raw`, when preparing a preservation-sensitive edit.

The reader keeps the block-entry structure and first-identity-key requirements
of the source registries. Valid nested YAML is parsed rather than searched with
regular expressions. YAML errors, duplicate keys, aliases, wrong entry keys or
unsupported section structures withhold that registry's entries. This is not
byte-for-byte emulation of the old AWK layout lexer. The old unquoted architecture
`superseded_by` status and TR `superseded-by` status are recovered only in their
respective registries at a parser-reported error line, with an `UNQUOTED`
diagnostic. Block text and other malformed YAML are not repaired; original
input bytes stay unchanged.

Exit 0 means observations were collected. In particular, `validate` and
`compare` retain exit 0 when they report findings. Consumers must examine
`registries`, `diagnostics` and `missing`, including absent registries with no
other diagnostic. `compare.removed: null` means removal could not be determined.
Exit 1 indicates an unreadable input, 2 usage, 3 an unknown name/incomplete read,
and 4 an unsafe path or an unsupported layout for a lookup. Registry references
cannot escape the project or follow symbolic links. No shell command is built
from registry values.

The calling workflow still owns semantic consistency, cross-document ownership,
approval and write authorization. A zero-finding observation cannot approve a
GDD, accept an ADR or prove that registry coverage is adequate. A proposed ID can
become stale; reread actual files before an authorized write.

## Validation and remaining scope

Ten local reader/command tests cover complete nested data, CRLF/Unicode, malformed
and duplicate YAML, legacy quoting, unsafe paths, custom sections, exact refs,
validation findings, comparison history, all eight number kinds and selected
upstream Bash parity. A real packed installation resolves and executes the
resource using its installed dependencies. The integrated suite has 198 passing
tests, including four design-review receipt tests; this is not workflow behavior
acceptance. Native authoring scenarios exercise this helper separately.

`node toolkit/test/registry-parity.mjs` runs 24 selected comparisons against the
retained Bash implementation in a temporary project and prints its evidence path.
Queries, reference locations, status/layout diagnostics, comparison counts and
all number kinds match in these fixtures. [Recorded evidence](evidence/registry-helper-2026-11-12.json)
includes source/output hashes and successful cross-platform CI; the Bash parity
run itself is macOS evidence. Neither result establishes semantic design approval.

Broader source-helper parity, adversarial race/permission cases and all consuming
workflows remain under T22. The retained source helper remains migration input;
the production package contains no `.claude` runtime dependency.
