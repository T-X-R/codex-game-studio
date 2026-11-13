# Engine-specific CI and its prerequisites

Create only a missing .github/workflows/tests.yml. Do not merge over an existing
workflow under force, even if it is incomplete or uses another runner. Show that
conflict and the separately scoped change needed. The shared scaffold owns its
concrete templates; preserve these source requirements when reviewing its plan.
Unknown substituted values remain visible needs, never a working-CI claim.

## Shared shape

Name Automated Tests; trigger on push to main and pull_request targeting main.
Use the source action majors: actions/checkout@v7 and actions/upload-artifact@v7;
Web additionally actions/setup-node@v7; Node24 is the compatible studio starter
default, subject to the actual project runtime constraints below. These refs exist in the
[checkout](https://github.com/actions/checkout/blob/v7/action.yml),
[upload-artifact](https://github.com/actions/upload-artifact/blob/v7/action.yml)
and [setup-node](https://github.com/actions/setup-node/blob/v7/action.yml)
primary metadata inspected during migration. They are not “latest” promises;
validate actual compatibility when writing a new workflow rather than silently
upgrading actions. v7 checkout/artifact use Node24. Source self-hosted minimum
is Actions Runner2.327.1; verify the selected runner/action requirements before
claiming it will work. Hosted-image contents also need actual observation.

Checkout uses lfs:true for Godot/Unity/Unreal. Upload results/logs under
`if: always()` so failed test attempts retain artifacts. Do not use
continue-on-error to make tests green or add publishing/deployment steps.
A failed suite should fail its job; merging is blocked only when the repository
actually requires the relevant status checks, as described in
[GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
Generating this file does not set that remote policy. Do not change repository
settings, upload secrets, commit/push or dispatch a remote workflow merely to
complete a local test scaffold.

## Godot

- ubuntu-latest; job name Run GdUnit4 Tests.
- Job permissions contents:read and checks:write. The action publishes a check
  run; read-only token permissions otherwise cause a failure independent of tests.
- `godot-gdunit-labs/gdUnit4-action@v1`, actual full Godot release (three numeric
  components, e.g.4.7.2, not an invented patch for a configured4.7 series).
- `version: installed` uses the committed addons/gdUnit4 plugin. Do not let setup
  silently replace it with latest. The
  [action implementation](https://github.com/godot-gdunit-labs/gdUnit4-action/blob/v1/action.yml)
  distinguishes installed plugin and selected Godot version, and handles import.
- paths includes the actual unit and integration roots (source tests/unit and
  tests/integration); report-name test-results; upload name test-results, path reports/.
- Require the Run GdUnit4 Tests job check for protection, not merely its
  test-results publication check, which the source warns can succeed even with
  failed tests. Confirm actual current check behavior before claiming enforcement.

Unknown complete release or missing committed plugin remains a named need. A
config/reference major.minor match is not a substitute for the release input.
C#/.NET projects need the actual corresponding action/editor arrangement;
source GDScript defaults are not automatic .NET coverage.

## Unity

- ubuntu-latest; job name Run Unity Tests.
- Two `game-ci/unity-test-runner@v4` steps: testMode editmode and playmode,
  artifactsPath test-results/editmode and test-results/playmode respectively.
  The [action metadata](https://github.com/game-ci/unity-test-runner/blob/v4/action.yml)
  exposes testMode; preserve separate modes and result paths.
- Both use env UNITY_LICENSE from secrets.UNITY_LICENSE.
- Upload name test-results, path test-results/, always after attempted tests.

UNITY_LICENSE must be configured manually by the owner before the first real
CI run. Do not manage activation, licenses or secrets. Runtime package/editor
requirements and actual game/test assemblies still apply; two written steps do
not establish that both ran. If the first fails and the second never starts,
report the latter unexecuted, not covered by the first.

## Unreal

- Self-hosted **Windows** runner labels, job name Run UE Automation Tests;
  record actual editor installation and UE_ROOT environment requirement.
- Build Editor Target first, using the actual UnrealBuildTool.exe and editor
  target, Win64 Development, absolute github.workspace/.uproject path.
  Fresh checkouts lack ignored binaries; skipping this can prevent all tests.
- Run actual UnrealEditor-Cmd.exe with absolute project path, -nullrhi -nosound,
  `-ExecCmds="Automation RunTests <actual-filter-root>.; Quit"`, -unattended,
  -stdout and -FullStdOutLogOutput. Module, project/editor-target and filter root
  are independent settled values, never one guessed replacement.
- Both source CI shell steps use
  `bash --noprofile --norc -eo pipefail "{0}"`: the quoted script placeholder
  handles a runner directory with spaces. This is a CI runner shell choice,
  not an instruction to put Bash substitution into Windows cmd commands.
- Upload name test-logs, path Saved/Logs/, always. Read actual failures/no matches;
  failure255 or zero matches cannot become a test pass from artifact upload.

Never provision a self-hosted runner/editor or invent its executable paths.
Linux/macOS local commands belong in the Unreal README, not a claim that the
source's Windows CI template has run on them.

## Web

- ubuntu-latest; job name Run Web Tests, including projects using another runner.
- Checkout, setup Node24, then the existing package's frozen npm ci and npm test
  for the compatible studio starter. Preserve its test script chaining; do not
  replace an unrelated game's runner or lock. For other projects use the actual
  package manager, lock/frozen install and test script. An actual build command
  may run before tests; no build script is not itself a missing prerequisite.
  Read engines.node and packageManager constraints. A conflicting or unresolved
  runtime/manager requirement is an explicit NEEDS item to settle before claiming
  CI runnable. The helper retains source Node24; a declared engines.node produces
  a CI comment and ci_runtime NEEDS to check/adjust it. A declared packageManager,
  including an npm pin, produces a comment and ci_package_manager NEEDS; it does
  not install or select a version. Do not silently guess a pin, ignore a known
  conflict or treat these observations as a semver compatibility check.
- For a project actually using the canonical Playwright config, explicitly select
  an available runner Chrome/Chromium executable for
  GAME_STUDIO_BROWSER used by the canonical Playwright config. A missing browser
  must fail/report unavailable, not trigger an undeclared download or success.
  No retained-source path or implicit toolkit restore may be needed to find it.
- Upload name test-results, path test-results/, if-no-files-found:ignore.
  This directory holds Playwright failure traces/screenshots and can be empty
  after successful tests; an empty artifact directory itself proves nothing.

CI YAML creation is local infrastructure work. Actual remote CI, selected runner
software, dependencies, browser execution and branch protection remain untested
until their real evidence is recorded.
