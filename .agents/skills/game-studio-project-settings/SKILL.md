---
name: game-studio-project-settings
description: Show effective game project settings and their sources, recommend an appropriate rigor level, or change shared settings and personal overrides.
---

# Inspect or change project settings

Use this for project configuration, including requests previously called
`project-settings` or `settings`. It does not change Codex account settings.
Work from the game root containing `.game-studio/run.cjs`; when starting in a
subdirectory, locate that root first. Read `project.yaml` and the installed
command help. If the project or pinned runtime is missing, report the missing
piece and the explicit attach/restore action; do not manufacture a base file or
silently download a different runtime.

Use `node .game-studio/run.cjs config get [KEY] --json` for effective values.
Use `config set KEY VALUE [--local] [--dry-run] --json` for edits; do not bypass
validation by manually changing YAML. Legacy `KEY=VALUE` requests split at the
first equals sign; an empty key/value or a bare `--local` is malformed, not an
instruction to clear a setting. Natural-language requests follow the same
operations. `null` explicitly unsets supported settings; it is not an empty
string. Quote arguments literally, including spaces or shell metacharacters.
For detailed type/transaction behavior, locate the installed reference with
`node .game-studio/run.cjs resource path studio/docs/configuration.md --json`.

## Show settings

With no key, group the returned settings by their top-level section. Show set
values, the rigor-derived family, and ignored stored values reported in
`annotations`. A focused query can show one setting without dumping the rest.
Explain the returned `source`: project, local override, legacy record,
`rigor:LEVEL`, default, or unset. A derived value can be explicitly overridden;
it is not missing. For local effective values, show the project value they
shadow using `annotations[KEY].projectValue`. When the project value is null,
report that no shared value is set rather than calling null a shadowed value.

Use `locallyOverridable` to distinguish personal settings from project-wide
ones. “Locked” means unavailable as a personal override, not immutable.
Display read warnings and any ignored local value; don't claim schema validation
passed while the reader reports invalid values. Mark reserved values on both
single-key and all-settings views: they store intent but implement no enforcement.
Read reserved status from `annotations`, not a second hardcoded key list. A
non-reserved setting is also not proof that a test, review or host guard ran.

## Change settings

Use the user's stated key, value and scope. Reuse an explicit request or earlier
approval for that change. For an ambiguous scope or a proposed recommendation,
settle the decision before applying it; ordinary authorized writes do not need
another permission question. Read-only requests and cancelled proposals leave
files untouched. Automation mode never grants new host permissions.

Run a dry run first to validate the request and inspect warnings and affected
paths. A reserved warning means the value may still be stored as requested;
explain that it enables no enforcement. Before applying a project write, query the key to identify its effective value
and source. If it is shadowed, name the local value and clarify that the
effective value will remain local. Continue an
explicitly requested shared change without modifying the personal override.
Unknown keys, invalid enums, forbidden local overrides and file conflicts stop
the write. Show the actual error and a relevant correction; do not silently fix
a typo, broaden a local request to the team, or fall back to direct edits.

Apply the same accepted change, then re-read it. Report the file written and the
actual effective value/source, including no-op results and warnings. When
changing `modes.rigor`, re-read all six affected settings: `modes.workflow`,
`docs.density`, `qa.level`, `modes.story_granularity`, `modes.review_mode`, and
`team.size`. Show explicit/local values that still win; do not write derived
values back to YAML. Changing the stage records intent and synchronizes its
mirror; it does not prove a stage gate passed. Do not commit or publish solely
because a configuration write succeeded.

## Recommend settings

When the user asks which settings fit the game, read
[references/choosing-settings.md](references/choosing-settings.md). Give a short
recommendation tied to the described scope, preserve deliberate overrides, and
apply it only within the user's authorization. Avoid recommending policy that
the installed workflow cannot enforce.
