# Workflow artifact observations

From an attached project, use its pinned runtime:

```sh
node .game-studio/run.cjs check --kind artifacts --json
node .game-studio/run.cjs check --kind artifacts --phase technical-setup --json
node .game-studio/run.cjs check --kind artifacts --path minimal --json
```

The default examines all seven phase groups (49 steps). `--phase` selects one
phase ID; `--path minimal` selects the five-step minimal route instead. These
selectors are mutually exclusive, require a known nonempty ID, and are accepted
only with `--kind artifacts`. Use `--project` to select a workspace; artifact
checks do not take a positional file argument.

The catalog is `studio/docs/workflow-catalog.yaml` in the running package, never
a same-named file in the game workspace. It preserves all upstream groups,
steps, required/repeatable flags, artifact alternatives, patterns, thresholds
and fallback notes. Skill references use Codex names; engine preferences use
`docs/technical-preferences.md`. A reference in this catalog describes the
intended workflow and does not assert that the Skill is already installed.

Each step reports its ID, command reference, required/repeatable flags, check
kind, status and observation details. The statuses are:

| Status | Observation |
| --- | --- |
| `PRESENT` | Enough matching files satisfy the declared pattern, or an alternative matches. |
| `ABSENT` | No file matches, or none of the alternative specs matches. |
| `SHORT` | Matching file count is below `min_count`. |
| `PATTERN_MISS` | Files match a glob but none contains its pattern. |
| `NO_CHECK` | No automated artifact condition is declared; retain the fallback note. |
| `UNKNOWN` | A filesystem observation could not be collected. |

The result includes group/step denominators and `NO_CHECK`/`UNKNOWN` counts.
`qualityAssessed` is always false. Exit zero means observations were collected,
even when files are absent or every step needs human assessment. It does not
advance a stage or assign a gate verdict. The workflow must apply tier-specific
requirements, content quality, review evidence and user decisions separately.
`UNKNOWN` rows return exit three / `not_assessed`. A missing or invalid catalog
also returns not assessed; it cannot silently become a zero-step successful
scan. Invalid selectors return exit two. Unsafe paths or matched symlinks are
blocked with exit four before following them. Files are never written.

The implementation needs only the packaged Node runtime and YAML dependency;
it does not invoke Bash, Python or grep. Its catalog dialect supports literal
path components and `*` within a component, covering every shipped glob.
Unsupported glob constructs are rejected when loading the catalog. The shipped
POSIX ERE patterns are implemented as line-local regular expressions, including
`[[:space:]]`; unsupported POSIX classes or invalid expressions are rejected.
Hidden names match only when the corresponding pattern component starts with
a dot. Pattern filtering happens before file-count thresholds, and alternatives
are tested in catalog order. These are presence observations rather than a
semantic parser for engine configuration or report content.

The full gate-check, next-step and stage-detection workflow migration remains
separate from this deterministic helper.
