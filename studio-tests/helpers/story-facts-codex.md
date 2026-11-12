# Story facts observation migration

Source: `.claude/scripts/story-facts.sh` (retained, read-only migration input).
Consumers: upstream story-readiness, story-done and dev-story. This slice supplies
observations only; it does not migrate those Skills or establish story readiness.

## Interface

Resolve `studio/scripts/story-facts.mjs` through the project's pinned
`node .game-studio/run.cjs resource path ... --json` before invocation:

```
node <resolved-path> --project ROOT [--all | --sprint | PATH ...] [--lint]
  [--granularity coarse|balanced|fine] [--text]
```

`--project ROOT` explicitly replaces upstream `--root DIR`/implicit repository
root. JSON is the new resource default. `--text` emits the original TSV observations
for source comparison. Neither is a public game-studio CLI command. Scope defaults
to all; granularity defaults to **coarse**, lint defaults off. `--granularity=VALUE`
is also supported. Help is processed in argument order: an earlier unknown flag
fails, while a reached `-h`/`--help` exits before later validation. Last scope
selector wins, including a positional path; earlier
positional paths are retained when paths is the final scope, as in the source.

`readStoryFacts(root, options)` returns `qualityAssessed:false`, scope, stories,
counts, lint/lintEnabled, missingPaths, sprintMissing and exitCode. Missing scalars
are JSON null, missing IDs are empty arrays; template placeholders remain UNFILLED.
TSV renders these with the original `-`, comma-separated IDs and count ordering.

| Source observation | Preserved meaning |
| --- | --- |
| all | Recursively enumerate every `story-*.md` beneath production/epics, including nested/hidden directories, byte-order paths. This differs intentionally from the shallower story-status route inventory. |
| sprint | Read only `stories:` entries' `file:` and `status:` in production/sprint-status.yaml, preserve listed order, quotes/comments, missing entries and partial results. Missing plan is distinct from existing empty plan. |
| explicit paths | Read supplied paths, including repeated requests; absent or non-file entries produce missing observations. |
| status | First case-sensitive Status header anywhere, Markdown header normalization, ASCII case folding and word boundaries; preserve raw status and all seven groups. |
| fields | First Type/Layer/Estimate headers outside fences/comments, TR IDs, governing ADR line only, AC and QA checkbox counts, Test Evidence Status and Dependencies Depends on. |
| lint | no_status, type_missing, type_unknown, unfilled header, no_tr_id, no_ac_section, ac_below_min and whole-capital-word marker with source line. Fence/comment/inline-code handling follows the actual source. |
| AC minimum | coarse Logic/Integration 3, Visual/Feel/UI 2, Config/Data 1; balanced 2/2/1; fine all 1. No readiness verdict is inferred from lint. |
| exits | 0 requested files read (including empty scope); 1 root/read failure; 2 usage; 3 absent sprint or requested story, retaining all successfully read observations; 4 managed-path safety rejection. |

## Explicit source corrections and boundaries

A zero-byte file is retained as a NO_STATUS row with missing-field lint. Upstream
awk waits for FNR=1 and silently drops such files. Preserving unknown input follows
the consumer's no-clean-empty-result contract; the regression is separate from TSV
parity fixtures. The helper never declares READY or converts exit 3 into success.

Sprint YAML is parsed using the toolkit's existing yaml dependency. Malformed
syntax or conversion failure (including the dependency's alias-expansion limit),
a non-mapping root, a non-array stories value, or an entry without a
nonempty string file (or with a non-string status) returns INVALID_SPRINT/exit 1.
The source line scanner silently presents these as empty scopes. Valid flow-style
arrays and quoted YAML values now work rather than disappearing. An existing
mapping with no stories key or `stories: []` is still an empty plan, distinct from
a missing plan. Supported block-style source fixtures retain complete TSV parity.

Paths use the existing safePath boundary: project-relative paths only, no `..`,
absolute/drive paths or symlink traversal. This intentionally narrows upstream's
ability to read outside the project. A leading `./` is normalized as upstream.
Unreadable/non-directory containers fail explicitly rather than becoming empty.
No global setting, story, registry, sprint, draft, or checkpoint is written.

The latest Skill's actual per-tier/QA checklist overrides over-strong legacy
CONTRACT prose: absent registry can waive TR checks, minimal architecture items
can be N/A, and QA minimal can waive nonvisual test-evidence requirements. This
observer reports raw facts; future consumers apply those rules without inventing
requirements. No ADR-status functionality is claimed here.

## Validation and remaining acceptance

`toolkit/test/story-facts.test.mjs` checks actual JSON observations and the thin
resource as a Node subprocess. Unix source differential subtests execute the real
retained Bash script, comparing full TSV and partial-missing exit status. These
subtests are explicitly skipped on Windows, while portable JSON/CLI and junction
safety tests still run there. Empty-file correction is tested separately.

Coverage includes every type/state and granularity, CRLF, spaces/Unicode, recursive
scope, comments/fences/inline spans, placeholders, duplicated paths, sprint empty/
missing/partial entries and invalid syntax/structure versus flow-style entries,
ordered help/invalid usage, unsafe paths, and source immutability.
An isolated compiled-module test is not installed-package or native Skill proof.
Root owns full build/typecheck, package-resource routing, cross-platform CI and
native consumer validation. Those remain open until independently completed.
