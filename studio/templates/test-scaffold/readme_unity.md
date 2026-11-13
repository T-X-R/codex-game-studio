# Test Infrastructure

**Engine**: @ENGINE@
**Test Framework**: Unity Test Framework
**CI**: `.github/workflows/tests.yml`
**Setup date**: @DATE@

## Directory Layout

Unity compiles only `Assets/` and `Packages/`, so unit and integration tests
live under the engine's test root, not in `tests/`: a test under `tests/` is never
compiled, and the run reports 0 tests and `Passed`, a false pass.

```
@TESTROOT@/
  EditMode/       # Isolated unit tests (formulas, state machines, logic)
  PlayMode/       # Integration tests in a running scene
```

`tests/` keeps this README and `smoke/`. Every `tests/unit/` path below means
that test root.

```
tests/
  smoke/          # Critical path test list for $game-studio-smoke-check
```

```
production/qa/
  evidence/       # Screenshot logs and manual test sign-off records
```

> **Manual evidence lives under `production/qa/evidence/`, not `tests/`** — that
> is where every consumer reads it.

## Running Tests

Use the editor executable: `Unity` on `PATH` may be Unity's separate CLI, not
the editor.

```
"<Unity editor>" -batchmode -runTests -projectPath . -testPlatform EditMode -testResults test-results/editmode.xml
"<Unity editor>" -batchmode -runTests -projectPath . -testPlatform PlayMode -testResults test-results/playmode.xml
```

Exit 0: every test passed. Exit 2: a test failed. Exit 1, 3 and 4 (a compile
error, a failed run, an unknown `-testPlatform`) and any other non-zero exit
are failures too; a compile error writes no results file. Delete each results
file before its run so an old file is never read as a new result. Read the
`<test-run>` element of the results file: `testcasecount="0"` means nothing was
compiled or found, which is not a pass. Do not add `-quit`; `-runTests` exits by
itself. An Edit Mode run never runs the tests in `@TESTROOT@/PlayMode/`, so
run both.

## Test Naming

Use these engine-specific test names:
- **Unity**: class `[System]Tests` in `[System]Tests.cs`, method `[Scenario]_[Expected]`
  — `CombatTests.cs` → `BaseAttack_ReturnsExpectedDamage()`

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|---|---|---|
| Logic | Automated unit test — must pass | `@TESTROOT@/EditMode/[system]/` |
| Integration | Integration test OR playtest doc | `@TESTROOT@/PlayMode/[system]/` |
| Visual/Feel | Screenshot + lead sign-off | `production/qa/evidence/` |
| UI | Retained screenshot of each screen touched | `production/qa/evidence/` |
| Config/Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

The generated workflow targets pushes and pull requests to `main`. It has not
been executed by scaffolding. Blocking merges also requires the repository
owner to configure a required successful job in branch protection or rulesets. Unity CI needs the `UNITY_LICENSE`
repository secret.
