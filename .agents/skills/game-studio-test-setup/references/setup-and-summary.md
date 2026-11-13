# Detection, shared artifacts and finish

## Configured engine and existing state

Read engine.name from effective settings with provenance. Primary project.yaml
wins when nonempty; an absent, empty or null engine name may fall back to the
project-owned `docs/technical-preferences.md` Engine record through the settings
reader. Its optional legacy import is compatibility input, not a required runtime
tree. The migrated reader's explicit case-insensitive UE5 alias maps to Unreal,
retaining the raw value, source and warning. Disclose this normalization; do not
rewrite project configuration merely to run the utility. A nonempty unsupported
primary engine is invalid, not permission to hide it behind a preference fallback.
The helper compares its canonical engine argument with that effective selection;
a genuine different-engine conflict remains an error. If this installed runtime
lacks the alias/fallback compatibility, report the prerequisite instead of claiming
it already supports the value or editing owner config as a workaround.
A placeholder, absent or ambiguous engine is not configured. Stop with:
“Engine not configured. Run game-studio-setup-engine first, then re-run
 game-studio-test-setup.” Do not infer it from a directory or choose Web.

Inspect actual selected-engine roots, tests/ and its unit/integration folders,
`.github/workflows/` and tests.yml, plus the engine artifacts:

| Engine | Core roots/artifacts |
| --- | --- |
| Godot | tests/unit, tests/integration; addons/gdUnit4/bin/GdUnitCmdTool.gd (capital U) |
| Unity | Assets/Tests/EditMode and PlayMode; their test assemblies; package manifest |
| Unreal | actual Source/<Module>/Private/Tests, resolved game module and test filter |
| Web | package.json, actual test roots and playwright.config.ts for the studio starter |

Use actual valid engine.test_root overrides; Unity/Unreal roots must still be
compiled by the engine, not arbitrary top-level tests. Missing roots can be planned creates when the scaffold validates their safe
project path and actual engine-compiled scope. A missing explicit directory is
not an excuse to discard its owner-selected location. An unsafe/invalid override
or unresolved module is a choice to resolve, not permission to fall back silently. No engine execution follows from
engine inspect. Inspect what an existing workflow actually covers; do not claim
a deployment-only workflow runs tests.

Report “Engine: … Test directory: found/not found. CI workflow: found/not found”,
with partial or unresolved details. For the core infrastructure already present
and no force, exit with “Test infrastructure appears to be in place. Re-run with
 game-studio-test-setup force to create missing files; existing files will not
 be overwritten.” This structural early exit does not require first creating
README/smoke/evidence files: force can fill them later. Do not call it verified.

## Installed missing-only scaffold interface

Resolve `studio/scripts/test-scaffold.mjs` through the pinned runtime. If absent,
report this prerequisite; no source-script fallback. The internal invocation is:

```text
node <resolved-path> --project ROOT ENGINE --dry-run
node <resolved-path> --project ROOT ENGINE
node <resolved-path> --project ROOT ENGINE --list
```

ENGINE is the configured Godot/Unity/Unreal/Web selection. `force` controls this
Skill's early exit; it is not a helper overwrite flag. For Unreal, pass settled
`--module NAME`, `--project-name NAME` and `--test-prefix NAME` independently when
needed. Do not guess one from another. `--date YYYY-MM-DD` records the actual
setup date, never a test execution date. The helper resolves configured test
roots; do not invent a test-root override flag. --list and --dry-run are separate
read-only modes.

Inspect the concrete per-path create/existing/skipped/failed observations and
all NEEDS before applying the same settled plan. JSON is the default. Exit0 can
still include unresolved NEEDS;3 reports skipped paths;4 reports failed writes.
These are scaffold observations, not tests or a readiness verdict. No install,
editor/browser process or remote CI is launched by this helper. Never interpret
its output as permission to overwrite a preserved owner file.

## Plan and shared README

Show “Test Setup Plan — <engine>”, only missing paths and each existing path
being skipped, engine-specific runner/configuration, CI and needs. Include
`tests/README.md`, `tests/smoke/critical-paths.md` and
`production/qa/evidence/.gitkeep`. The small scaffold is normally a short task;
do not promise a fixed duration for editor installation, CI or missing decisions.

A new `tests/README.md` includes:

- actual engine/version (unknown explicitly), framework, CI path and setup date;
- actual engine test-root layout, tests/smoke and production/qa/evidence;
- exact selected-engine local commands and their import/build prerequisites,
  independent modes/results and failure/no-tests interpretation;
- engine naming from its reference, and the evidence table below;
- configured CI triggers and prerequisites, with remote execution not yet claimed.

| Story Type | Required evidence when applicable | Location |
| --- | --- | --- |
| Logic | Automated unit test, actual passing result | resolved unit root / system |
| Integration | Integration test or playtest document | resolved integration root / system |
| Visual/Feel | Screenshot plus lead sign-off | production/qa/evidence/ |
| UI | Retained screenshot of every touched screen | production/qa/evidence/ |
| Config/Data | Actual smoke-check result | production/qa/smoke-*.md |

Write the engine's actual roots in the table: for Unity EditMode/PlayMode,
for Unreal the actual module test root, for Godot/Web the selected tests roots.
Do not leave Unity/Unreal examples pointing at uncompiled tests/unit.
Explain effective qa.level: minimal waives automated Logic/Integration/Config
requirements in downstream story workflows, not UI/Visual evidence or execution
of this explicitly requested scaffold. Do not change QA/workflow settings here.

Document the retained test standards: arrange/act/assert; unit tests isolated from
filesystem/network/database; deterministic local fixtures rather than shared
mutable state; integration cleanup; performance tests with explicit failing
thresholds. A regression test must be observed failing against the unfixed bug
before its green result is trusted. These are standards for actual tests, not
permission to fabricate a test or claim one ran during scaffolding.

Manual evidence lives under production/qa/evidence/, not tests/evidence/.
Create its empty `.gitkeep` so the directory is retained by Git. No screenshot
or sign-off is fabricated by making this directory.

## Smoke seed

Create the following only if absent; retain the conditional checks and all eight
initial entries. The goal is eventually 10–15 checks in under 15 minutes, not a
claim that the eight-entry seed or a nonexistent core loop was tested.

```markdown
# Smoke Test: Critical Paths

**Purpose**: Run these 10–15 checks in under 15 minutes before any QA hand-off.
**Run via**: game-studio-smoke-check (which reads this file)
**Update**: Add entries when new core systems are implemented.

## Core Stability (always run)
1. Game launches to main menu without crash
2. New game / session can be started from the main menu
3. Main menu responds to all inputs without freezing

## Core Mechanic (update as systems are implemented)
<!-- Add the primary mechanic when it is implemented. -->
<!-- Example: Player can move, jump, and the camera follows correctly. -->
4. [Primary mechanic — update when first core system is implemented]

## Data Integrity
5. Save game completes without error (once save system is implemented)
6. Load game restores correct state (once load system is implemented)

## Performance
7. No visible frame rate drops on target hardware (60fps seed target)
8. No memory growth over 5 minutes of play (once core loop is implemented)
```

The source seed's 60fps is not a measurement or an override of a settled project
budget. If the actual agreed target differs, label the project-specific target
in the new checklist; preserve an existing checklist without rewriting it.

## Readback and summary

Verify each reported path actually exists with the expected file type and new
content, and every pre-existing file remains unchanged. Re-read runner/CI/docs
for consistent roots, engine/version/path and test filter. Existing mismatched
infrastructure remains a reported conflict, not a reason to overwrite it.

Report “Test infrastructure created for <engine>” only for actual writes;
otherwise say preserved or partial. List each created file/directory with its
retention file, skipped existing paths and unsatisfied needs. In particular,
separate a package/runner existing from a discovered/running/passing test suite.

Next steps, in order:
1. Engine-specific remaining install: gdUnit4, actual Unity package/license,
   Unreal self-hosted environment, or Web frozen dependencies/browser when needed.
   These are separate authorized actions, not performed by this scaffold.
2. Write the first meaningful example in the actual engine root, using its naming.
   Existing Web starter examples can be reported if actually present. Do not
   invent a game behavior test or claim an empty placeholder is an example.
3. At standard/full workflow, use qa-plan for the first sprint's story/evidence
   planning if installed; at minimal there are no sprints, so omit this handoff.
   At qa.level minimal explain the automated-test waiver and project-settings
   option to raise it; do not silently change the setting. An unavailable qa-plan,
   dev-story or test-helpers is named pending, never a fictitious invocation.
4. Use the installed game-studio-smoke-check before QA hand-off.

Explain the Technical Setup → Pre-Production gate separately: standard/full
requires the engine's test roots, tests.yml and at least one real example test;
minimal requires only the engine. This utility invokes no director or stage gate
and does not advance the stage. COMPLETE means the agreed scaffold is present,
not installed framework, verified CI, merge protection or passing game tests.
