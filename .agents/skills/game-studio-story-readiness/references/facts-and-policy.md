# Scope, policy and observations

From the game root, read applicable AGENTS.md and use the restored pinned runtime:

```sh
node .game-studio/run.cjs config get --json
node .game-studio/run.cjs config get review_gate --json
node .game-studio/run.cjs config get gate_level --json
```

Use actual `data.settings[KEY].value`, its source and returned warnings. Relevant
keys are modes.workflow, modes.review_mode, modes.automation,
modes.automation_always_ask, modes.story_granularity, qa.level and testing.strict.*.
Derived `review_gate.value` has skillGates/reviewMode; `gate_level.value` maps logic,
integration, visual, ui and config to level (blocking/advisory). Config also exposes
smokeCheck, which is not an instruction to run smoke tests during readiness.
Explicit `--review full|lean|solo` overrides only this run's review mode and skill
Gate decision; never rewrite shared settings. A failed config read is not an
invitation to invent defaults or claim a policy-complete READY assessment.

Workflow is resolved per story. Its system is the filename stem of the GDD: path;
only when there is no GDD path may the system portion of a TR-[system]-NNN supply
it. For each distinct known system resolve:

```sh
node .game-studio/run.cjs config get modes.workflow --system <system-id> --json
```

This applies actual workflow_overrides.system_overrides before project workflow.
Without a system use project workflow; surface ambiguous system identity rather
than choosing a convenient tier. Do not confuse rigor defaults, QA evidence policy,
review mode and workflow. Stories in one run can have different workflow tiers.

## Scope and single collection

Resolve these installed resources with `node .game-studio/run.cjs resource path
<resource> --json`, then invoke the actual returned `data.path` (quoted as needed):

- `studio/scripts/story-facts.mjs`
- `studio/scripts/adr-status.mjs`
- `studio/scripts/registry.mjs`

```sh
node <story-facts-path> --project . --lint --granularity <resolved-grain> --all
node <story-facts-path> --project . --lint --granularity <resolved-grain> --sprint
node <story-facts-path> --project . --lint --granularity <resolved-grain> <story-path>...
node <adr-status-path> --project .
node <registry-path> --project . list tr
```

Use exactly the relevant story-facts scope form, not all three. `all` selects
recursive production/epics/**/story-*.md. `sprint` reads production/sprint-status.yaml
file entries. A specific path remains one argument even with spaces. For an epic
slug resolve production/epics/<slug>; for its folder use that folder's story-*.md
files as explicit paths. An empty/absent epic must not fall back to all stories.

Story-facts testEvidence is the section's Status observation, not its path or
proof of testing. Read the actual section to assess its evidence plan.
Story-facts JSON contains stories, counts, lint, missingPaths, sprintMissing and
exitCode; qualityAssessed is false. Preserve raw fields and lint details. Exit 3
with missingPaths identifies absent/non-file requested entries: report each and
continue checking existing stories. Missing target entries are NOT ASSESSED, not
an absence of all work when other stories exist. sprintMissing means no sprint
plan; an existing valid empty plan means it lists no stories. INVALID_SPRINT/read
errors mean unassessed input, not an empty sprint. Unsafe paths must not be read
through a weaker fallback. Zero files never means READY.

Read each actual story once in full for its acceptance criteria, design reference,
dependencies, assets and scope; do not use header/lint observations as substitutes
for its words. Read the named GDD rule or, at minimal, the brief's Features item.
Keep observations for later checks and the QA brief. No test or game is executed.

One ADR-status call indexes all current ADRs for the run. Rows include Status,
Layer, dates, dependencies, successor and template omissions. Missing cited ID is
a blocker; absent/UNFILLED/OTHER unreadable Status is unassessed, not a failed
Proposed decision. Use actual successor when supplied, never invent one. Keep
ambiguous duplicate IDs visible instead of picking a status that yields READY.
The helper's missing-section list is not a new checklist of ADR requirements.

Read only the `Manifest Version` line of docs/architecture/control-manifest.md;
record a missing file once. Do not load the whole manifest just to get its version.
Look up every cited TR ID and status in the registry result. Inspect registries'
state and diagnostics: a successfully read entry is not semantic validation;
missing registry waives the TR item, while unreadable/layout failure does not.
Read active/deprecated/superseded-by values, including supported quoted/unquoted
legacy forms. Report a missing registry once, without inventing missing-ID gaps.

For sprint priorities and one-story next candidates, use the newest actual plan
under production/sprints/ (most recently modified, as the sprint-status workflow
selects); identify the chosen file. If current selection ties or conflicts with
an explicit user-selected sprint, surface that ambiguity. Read actual Must Have/
Should Have priorities and story paths, not inferred ordering. Dependencies named
`Story NNN` resolve in the same epic; explicit paths name that exact story. Read
needed dependency/candidate facts once and reuse the ADR table; do not rerun every
ADR scan for each candidate. Missing inputs remain unknown, not inferred Done.
