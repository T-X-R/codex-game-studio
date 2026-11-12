# Execute the project's actual runner

Read the configured command and its OS variant, package scripts/runner and
installed version. A wrapper script is not an editor executable. Resolve an
editor from the explicit executable in the configured command, an existing
project `engine.path` record, or PATH. Paths with spaces need quoting. Missing
PATH entries alone do not prove no editor is installed. Unknown/unconfigured
engines or missing dependencies are NOT ASSESSED with a specific next action.

The toolkit's `test` command runs configured commands, applies its timeout and
preserves logs. `--command 'COMMAND'` makes an explicit one-run adjustment while
keeping project YAML unchanged. Use it for a second suite mode, an absolute
project path or a fresh result filename, and report that adjustment. Do not
silently substitute a different suite. The installed testing reference is at
`resource path studio/docs/testing.md --json`.

Prefer new result filenames to deleting old evidence. A result must belong to
this invocation, not an old XML/JSON report. Record total/passed/failed/skipped
counts when actually available and up to ten failing test names. Expected result
files missing after a completed launch mean FAIL; an unavailable runner means
NOT ASSESSED. Never fabricate counts from a successful shell exit.

## Web

Run the configured test script. Inspect its actual composition: when it includes
unit tests and browser integration/build steps, report each half independently.
For the toolkit's grown starter these are Vitest and Playwright against the
single-file build. A configured custom runner remains the authority; don't
replace it with the starter's scripts or run a half twice unnecessarily.

Interpret current Vitest/Jest/Playwright or Node test output and result artifacts:
failed assertions are FAIL; TypeScript/bundle errors before browser tests are
FAIL with the browser half NOT RUN; zero discovered/executed tests are NOT
ASSESSED even with exit zero. An unavailable browser or absent npm test script
is NOT ASSESSED. A default npm placeholder is not a test suite. With an unknown
runner and no reliable completion/count evidence, report command exit separately
and suite completeness as NOT ASSESSED. Inspect skipped tests against the actual
critical paths; don't treat an all-skipped suite as passing.

## Godot

Import before running tests or a minimal boot check. Use the installed
`engine verify --executable PATH --output NEW_DIRECTORY --json` when its pinned
version requirements are satisfied. Otherwise run the resolved editor's actual
headless import through `test --kind build --command ...` and preserve the
reason for that choice. An import failure is FAIL, not a healthy test run.

For gdUnit4 verify `addons/gdUnit4/bin/GdUnitCmdTool.gd` exists (capital U).
Keep the configured project/test roots. For the upstream gdUnit4 6.1/6.2
contract, `--ignoreHeadlessMode` permits headless tests and
`-d --remote-debug tcp://127.0.0.1:0` prevents an interactive error prompt.
If adjusting missing flags for this run, explain the exact change. A custom
runner needs its own result semantics; don't impose gdUnit4 on it.

For that gdUnit4 contract: 0 with completed nonzero tests is PASS; 101 with
completed passing tests is PASS WITH WARNINGS (record leaked orphans); 100
(test failure), 105 (parse error) and load/compile failure are FAIL. Codes 103
(headless refused) and 104 (unsupported editor) are NOT ASSESSED. `No test cases
found` or zero tests is NOT ASSESSED regardless of exit zero. Verify a different
installed runner version's contract before interpreting unusual codes.

The generic command wrapper may classify 101 as a nonzero failure. Preserve
that process evidence and explain the supported runner-specific interpretation;
never silently rewrite the log or CLI report. Expected remote-debug port
connection diagnostics alone are not assertion failures. Actual script/parse
errors or `Can't run project: no main scene defined` are failures even on exit
zero, including minimal boot checks.

## Unity

Confirm the project includes the Unity Test Framework before launch. Resolve
the actual editor, not an unrelated Unity command. Run the configured suite with
a fresh `-testResults` path and inspect its NUnit XML. For the upstream contract,
exit 0 still requires completed nonzero tests; exit 2 indicates failed tests,
and compile/run failures (including exits 1/3) are FAIL. Missing current XML is
FAIL; `testcasecount=0` or no executed cases is NOT ASSESSED.

If PlayMode test files exist and the first run only selected EditMode, run
PlayMode separately with its own result file using the same editor/project and
`-testPlatform PlayMode`. Record both modes. An EditMode pass cannot cover an
unrun or failed PlayMode suite. Missing editor/framework/license capability is
NOT ASSESSED; preserve the actual diagnostic instead of guessing a result.

## Unreal

Build the project's editor target before automation, using the configured
OS-appropriate build command. A failed editor build is FAIL. Then run the
configured automation command with the absolute `.uproject` path and an actual
test-name root from the game's tests. Preserve `-stdout -FullStdOutLogOutput`
when applicable; explain any one-run additions. Don't guess an editor executable
inside a macOS bundle or replace a missing command with a Windows default.

Inspect automation output/results, not just exit 255: `Result={Fail}` is FAIL;
`No automation tests matched` is NOT ASSESSED; completed nonzero success records
with a successful exit support PASS. Missing modules, build/compile failures or
an incomplete suite are FAIL. An editor that never started is NOT ASSESSED.

## Minimal QA without game tests

Run the explicitly configured smoke command, else the explicitly configured
build. If neither exists, say the build check did not run; actual launch and
critical-path observations are still required. Read errors as well as exit status.
This is a build/boot check, not test coverage or human play. A failure contributes
FAIL. Missing capability remains unobserved; never convert it to PASS merely
because tests were waived.
