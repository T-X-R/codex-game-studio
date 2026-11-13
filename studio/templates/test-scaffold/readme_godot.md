# Test Infrastructure

**Engine**: @ENGINE@
**Test Framework**: GdUnit4
**CI**: `.github/workflows/tests.yml`
**Setup date**: @DATE@

## Directory Layout

```
@TESTROOT@/
  unit/           # Isolated unit tests (formulas, state machines, logic)
  integration/    # Cross-system and save/load tests
```

```
production/qa/
  evidence/       # Screenshot logs and manual test sign-off records
```

> **Manual evidence lives under `production/qa/evidence/`, not `tests/`** — that
> is where every consumer reads it.

## Running Tests

```bash
godot --headless --path . --import
godot --headless -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a "res://@TESTROOT@" --ignoreHeadlessMode
```

Run the import first: a fresh clone has no `.godot/` class cache, and a run
without one exits 1 (`GdUnitCmdTool.gd` did not load, so no test ran). Exit 0:
every test passed. Exit 100: a test failed. Exit 101: every test passed but a
test leaked nodes (a warning). Exit 103 or 104: gdUnit4 could not run. Exit 105:
a test script does not parse. A run that finds no tests prints `No test cases
found` and exits 0, which is not a pass. The folder is `addons/gdUnit4/` with a
capital U.

CI runs `@TESTROOT@/unit` and `@TESTROOT@/integration`; the command above runs every suite
under `@TESTROOT@/`. Manual smoke checks remain at `tests/smoke/`.

## Installing GdUnit4

```
1. Open Godot → Asset Store (AssetLib before Godot 4.7) → search "GdUnit4" → install it
2. Enable the plugin: Project → Project Settings → Plugins → GdUnit4 ✓
3. Restart the editor
4. Verify: res://addons/gdUnit4/bin/GdUnitCmdTool.gd exists (capital U)
```

## Test Naming

Use these engine-specific test names:
- **Godot**: file `[system]_[feature]_test.gd`, function `test_[scenario]_[expected]`
  — `combat_damage_test.gd` → `test_base_attack_returns_expected_damage()`

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|---|---|---|
| Logic | Automated unit test — must pass | `@TESTROOT@/unit/[system]/` |
| Integration | Integration test OR playtest doc | `@TESTROOT@/integration/[system]/` |
| Visual/Feel | Screenshot + lead sign-off | `production/qa/evidence/` |
| UI | Retained screenshot of each screen touched | `production/qa/evidence/` |
| Config/Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

The generated workflow targets pushes and pull requests to `main`. It has not
been executed by scaffolding. Blocking merges also requires the repository
owner to configure a required successful job in branch protection or rulesets.
