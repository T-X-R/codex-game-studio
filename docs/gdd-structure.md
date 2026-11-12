# GDD structure observations

Use the pinned CLI from an attached game workspace:

```sh
node .game-studio/run.cjs check --kind gdd --json
node .game-studio/run.cjs check design/gdd/combat.md --kind gdd --json
```

This portable implementation migrates `.claude/scripts/gdd-structure-check.sh`.
It reads files without modifying them or launching tools. Without a file argument,
it scans only top-level `design/gdd/*.md` system documents, excluding concept,
pillars, indexes, registries, sound bible and cross-review reports. An explicit
project-relative file may inspect an otherwise excluded document. Path traversal
and symlinks are refused under the toolkit's existing path policy.

Each file reports `present`, `absent` and `placeholder` arrays for Overview,
Player Fantasy, Detailed Rules, Formulas, Edge Cases, Dependencies, Tuning Knobs
and Acceptance Criteria. Detailed Design is an alias for Detailed Rules.
The upstream case-insensitive heading-prefix rules accept numbered headings and
tabs at level two or deeper. The first matching heading defines each section.
A section is a placeholder if its body, until the next same-or-higher heading,
contains only blank lines, subheadings and the exact `[To be designed]` marker.
These are text-pattern observations, not a full Markdown parser.

Exit zero means the requested observations were collected; it does **not** mean
the GDD or phase gate passed. Missing sections remain observations because the
workflow tier determines which sections are required. `qualityAssessed` is
always false. No matching system files, or a missing explicitly requested file,
returns exit three / `not_assessed`. An invalid input returns exit two; an unsafe
path returns exit four. Read failures are errors, never an empty successful scan.

The phase-gate and design-review workflows still need their own migrated
criteria, content assessment and native host acceptance.
