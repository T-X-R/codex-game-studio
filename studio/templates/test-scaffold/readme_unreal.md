# Test Infrastructure

**Engine**: @ENGINE@
**Test Framework**: UE Automation
**CI**: `.github/workflows/tests.yml`
**Setup date**: @DATE@

## Directory Layout

UnrealBuildTool compiles only module folders, so unit and integration tests
live inside the game module, not in `tests/`: a test directly under `Source/`
is silently never built.

```
@TESTROOT@/   # Unit and integration tests, compiled with the module
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

The commands are in `@TESTROOT@/README.md`. Read the output,
not the exit code: a failing test and a run that matched nothing both exit 255.
`Result={Fail}` is a failure; `No automation tests matched` means no test was
built or named `@TEST_PREFIX@.…`.

## Test Naming

Use these engine-specific test names:
- **Unreal**: class `F[System][Scenario]Test`, test name `@TEST_PREFIX@.[System].[Scenario]`
  — `FCombatBaseAttackTest` → `@TEST_PREFIX@.Combat.BaseAttack`

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|---|---|---|
| Logic | Automated unit test — must pass | `@TESTROOT@/[system]/` |
| Integration | Integration test OR playtest doc | `@TESTROOT@/[system]/` |
| Visual/Feel | Screenshot + lead sign-off | `production/qa/evidence/` |
| UI | Retained screenshot of each screen touched | `production/qa/evidence/` |
| Config/Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

The generated workflow targets pushes and pull requests to `main`. It has not
been executed by scaffolding. Blocking merges also requires the repository
owner to configure a required successful job in branch protection or rulesets. Unreal CI needs a self-hosted Windows
runner with Unreal Editor installed and `UE_ROOT` set.
