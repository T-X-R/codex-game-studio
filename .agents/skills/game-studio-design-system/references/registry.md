# Entity registry facts and controlled updates

The shared registry helper is read-only. Resolve its actual installed path through
`node .game-studio/run.cjs resource path studio/scripts/registry.mjs --json`.
Invoke that returned path with Node, quoting real paths that contain spaces:

```sh
node <resolved-registry-script> --project <game-root> slice design/gdd/<system>.md
node <resolved-registry-script> --project <game-root> validate
```

`slice` includes complete entries whose owner or reference names the supplied
project-relative path. Call it for the target and explicit dependency paths.
JSON `entries` carries registry/section/key/name, complete `fields`, raw source,
line/fieldLines and `refs` with how/path/line. Read `registries[].state` (read,
missing or layout), `diagnostics`, and `missing`; do not treat no entries as proof
of an empty usable registry. `validate` takes no positional argument and observes
all registries, so distinguish this entity update's findings from unrelated ones.
Its exit 0 and `qualityAssessed: false` mean observation succeeded, not a clean
registry or semantic PASS. No helper result accepts conflicts or grants writes.
Do not execute the retained Claude shell helper or invent a nonexistent CLI command.

Read live YAML entries, not commented examples. Preserve whole entries even when
`referenced_by` spans many lines. An owned value has its authoritative `source` GDD;
an entry referring to the target is relevant even if its source is another system.
Include explicit dependencies when collecting known facts. Registry absence is a
distinct state, not an empty verified registry. Malformed/unsupported input remains
unassessed; never replace it with guessed empty lists.

The entity registry has `version`, `last_updated` and four lists: `entities`,
`items`, `formulas`, `constants`. Entries retain name, `status: active|deprecated`,
source GDD, `referenced_by` paths and `added` date; `revised` tracks later approved
changes. Entity/item attributes remain their existing game-specific fields.
Formulas include variables and output_range; constants include value and unit.
An absent registry starts those actual lists, not copied commented example values.

Only register facts crossing system boundaries. Before writing, compare names,
values and owners with the live snapshot and present new versus existing entries.
Append new entries or missing references without duplicates. Never remove old
entries; authorized retirement uses deprecated. An owned value change needs an
explicit conflict decision, preserving its old value/provenance in history and
updating revised. Ordinary section authoring does not authorize that change.

Re-read before a patch; a concurrent change requires reconciliation. Preserve
unrelated content and quoted values containing `: `. Validate after writing for
duplicate identities, invalid status/layout and missing named paths; resolve issues
caused by this update only. Structural validity does not prove agreement between
GDDs or ownership approval. If the helper cannot run, say so, inspect the changed
entries explicitly and retain the missing validation as an open finding.
