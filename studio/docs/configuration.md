# Project settings

These commands describe the current source build. They are not available in the
previously published `v0.1.0-alpha.0` archive. Inspect the installed command set
with `game-studio --help` before using them.

From a restored game directory:

```bash
node .game-studio/run.cjs config get modes.automation --json
node .game-studio/run.cjs config get modes.workflow --system combat --json
node .game-studio/run.cjs config set modes.automation guided --dry-run
node .game-studio/run.cjs config set modes.automation guided
node .game-studio/run.cjs config set modes.review_mode solo --local
node .game-studio/run.cjs config set project.stage Production
node .game-studio/run.cjs config set platform.targets '["PC","Web"]'
```

`config get` returns effective values and their source. Allowed local settings
override project settings; explicit settings precede legacy records, rigor
expansion and defaults. A named system override applies only to workflow depth.
Legacy engine preferences are read from `docs/technical-preferences.md`, falling
back to the retained `.claude/docs/technical-preferences.md` only during migration.
The installed archive never requires that legacy directory. An explicit
`specialists` block, including null entries, suppresses legacy specialist fallback.
The legacy scalar `testing.strict: true|false` fills per-type strictness after
valid personal and project per-type values. Absent strictness remains unset;
workflow-specific defaults are not invented by the configuration reader.

Four explicit summary queries preserve the upstream workflow calculations:

| Query | Result |
| --- | --- |
| `config get gate_level` | Per-type blocking/advisory levels with provenance; the config story default is advisory, while an unset smoke-check policy is blocking. Explicit strictness overrides both. |
| `config get review_gate` | Skill and phase gate run/skip decisions from the effective review mode: full runs both, lean runs phase gates, solo skips both. |
| `config get engine_values` | Name, version and language, each with its own source; missing fields remain unset. |
| `config get perf_budgets` | The four committed performance budgets with provenance; local budget overrides are ignored. |

Summary results describe configured policy, not a completed review or test.
An explicit workflow review option can still require a review. Stored strictness
remains unset when absent; only `gate_level` applies the named workflow defaults.

`config set KEY VALUE` writes one setting. Enum values are validated; booleans
use `true` or `false`, numeric settings use numbers, and list settings use JSON
arrays of strings. Other values are literal text, so engine version `4.7` remains
a string. `null` unsets a setting except the synchronized project stage. Unknown
keys and personal overrides outside the local whitelist are rejected. Reserved
settings emit a warning: saving a setting is not evidence that its enforcement
or the corresponding host integration is implemented.

The local whitelist is: `modes.review_mode`, `modes.automation`,
`modes.automation_always_ask`, `team.size`, `testing.strict.logic`,
`testing.strict.integration`, `testing.strict.visual`, `testing.strict.ui`,
`testing.strict.config`, `performance.enforce`, `features.session_state`,
`features.token_budget_warn_at`, `features.read_guard`, `features.read_guard_kb`,
and `updates.check`. A project write warns when a local value shadows it.

Writes require an existing `project.yaml`. Dry runs create no files and report
affected paths and hashes. Existing comments, quotes, BOM and line-ending style
are retained; unchanged values produce no mutation. Inserting keys or replacing
multiline/sequence values may normalize YAML layout. Mapping replacements,
scalar parents and edits through aliases/anchors are refused. Malformed YAML,
duplicate keys and unsafe object keys are errors, rather than silent fallbacks.

Changing `project.stage` also updates `production/stage.txt`. Existing disagreement
between the two records must be reconciled first; the command does not guess
which stage is correct. This records a stage and does not claim a gate review
has passed. Both writes use the installation transaction lock, before-image
checks and rollback. Interrupted transactions use `game-studio recover`; later
user edits are never silently overwritten. Backups retain original user content
under `.game-studio/backups` with owner-only POSIX file permissions. Windows uses
the workspace's inherited ACLs.
