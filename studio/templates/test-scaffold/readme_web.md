# Test Infrastructure

**Engine**: @ENGINE@
**Test Framework**: @WEB_FRAMEWORK@
**CI**: `.github/workflows/tests.yml`
**Setup date**: @DATE@

## Directory Layout

```
@TESTROOT@/
  unit/           # Unit tests for the project
  integration/    # Integration/browser tests for the project

# Manual smoke checks remain at tests/smoke/critical-paths.md
```

```
production/qa/
  evidence/       # Screenshot logs and manual test sign-off records
```

> **Manual evidence lives under `production/qa/evidence/`, not `tests/`** — that
> is where every consumer reads it.

## Running Tests

```bash
@WEB_COMMANDS@
```

@WEB_RUNTIME@

Use the runner's actual reports and executed test counts. Exit zero with no
executed tests is not a pass. Vitest's `No test files found` and Playwright's
`No tests found` are not assessed, not passing test results.

## Test Naming

Preserve the existing runner's language, filename patterns and test discovery
configuration. For the studio TypeScript starter using Vitest/Playwright, examples are:
- **Web**: file `[module].test.ts` (Vitest) or `[system].spec.ts` (Playwright),
  test `'[scenario] [expected]'` — `rules.test.ts` → `it('keeps the square inside the field')`

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
CI requires the discovered frozen install and test commands; a discovered build
command adds an optional build step. Missing install/test commands remain
explicit failing steps until the owner supplies them. No dependency or browser
was installed while generating these files.
