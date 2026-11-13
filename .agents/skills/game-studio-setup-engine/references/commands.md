# Engine commands and what they prove

Commands must fit the actual host shell and project. The toolkit executes them
with `/bin/sh` on POSIX and a cmd batch context on Windows, not Git Bash by
assumption. Store actual absolute paths, quoted for that shell; JSON/YAML input
serialization must preserve the literal command. `engine.path` is observation
and lookup metadata, never automatically inserted into commands.

Do not copy source Bash `$(pwd -W ...)` into a Windows cmd command. Resolve the
actual absolute project path first and quote it. Do not retain the old Bash YAML
parser's no-escaped-quotes restriction: the installed real YAML parser handles
values; escaping must preserve meaning, not mutilate a command.

## Godot

Use bare `godot` only when its PATH probe worked; otherwise the probed/given
absolute executable replaces it in **all four** commands and engine.path.
When no executable is determined, bare godot is only an explicitly unavailable
placeholder command, with a visible TODO to set its path. Do not execute it as
if an installed editor were established.

| Operation | Source command form |
|---|---|
| build | `godot --headless --export-debug "<actual preset>"` |
| test | `godot --headless -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a res://tests --ignoreHeadlessMode` |
| run | `godot --path . --windowed --resolution 1280x720` |
| smoke | `godot --headless --quit-after 5` |

Ask which project-defined export preset to build; do not default Linux/X11,
Windows Desktop or any platform. Inspect `export_presets.cfg` if present. With
no presets yet, build is explicitly unconfigured, not a guessed executable
command. Match actual test-root overrides where the project already uses them.

A fresh project needs headless import before gdUnit4 to populate class caches.
Keep the port-zero remote-debug argument: removing it can leave script errors
waiting on an interactive debugger. Source gdUnit4 meanings are 0 pass,100 test
failure,101 passing tests with leaked-node warning,105 parse failure,103/104
runner unavailable/headless refused/unsupported engine. Retain raw code and
logs; the generic wrapper may classify a nonzero as failed, so explain the
runner-specific meaning instead of changing the code or claiming a test pass
from the wrapper. Missing runner is a test-setup handoff, not permission to
rewrite commands.test until the warning disappears.

Godot smoke is a boot check: exit0 may still contain SCRIPT ERROR. Without
run/main_scene it may wait indefinitely; do not run it as a test of a scene that
does not exist, and always bound execution. Headless import also needs log
inspection. Source `--check-only` is not a complete parse check for scripts
referencing autoloads. Resolve `studio/scripts/godot-parse-check.gd` through the
pinned runtime and use the returned absolute path with the selected editor:
`godot --headless --path . -s "<resolved-path>" -- res://<changed-script>.gd`.
This retains the source script-loading check after autoload registration: 0 all
supplied scripts load, 1 any fails, 2 no arguments. Run only under authorized
project execution, with a bounded process and owned log path; autoloads and script
initialization can execute code. Keep errors even when another script loads.
This is not a whole-project, gameplay or .NET build verdict. No migration-source
path is used by the installed workflow.

## Unity

Use the full expanded Hub **editor** path, never bare Unity or a quoted `~`.
Ask target and output; verify the platform-specific player-build flag against
official command-line documentation. `-buildTarget` only switches platform and
can exit0 without producing a game.

- Build: `"<editor>" -batchmode -quit -projectPath . -buildTarget <target> -build<platform>Player <output>`.
  Source verified Windows64 example: `-buildWindows64Player Builds/Win64/<Game>.exe`;
  it is not the default for every project.
- Test: `"<editor>" -batchmode -runTests -projectPath . -testPlatform EditMode -testResults test-results/editmode.xml`.
- Run: the actual built game, e.g. `"<game executable>" -screen-width 1280 -screen-height 720 -screen-fullscreen 0`, not the editor.
- Smoke: `"<editor>" -batchmode -quit -projectPath . -logFile -`.

Read test XML counts; testcasecount=0 is no tests, not PASS. EditMode does not
cover PlayMode: when tests exist there, run a separate PlayMode operation with
its own output file. Source codes0/2 distinguish passing/failing test runs but
cannot replace report inspection. Smoke compiles editor assemblies; player-only
errors require a real build. Missing scenes/build outputs/licenses remain
explicit unmet prerequisites. Writing these commands does not validate them.

## Unreal

Use actual engine root and an absolute `.uproject` path. Commands are best-effort
until validated against the chosen version/project; retain a visible TODO in
project-owned notes. All native testing/builds need actual editor/toolchain.

| Host | Build executable | Editor for test/smoke | Game window |
|---|---|---|---|
| Windows | `<UE root>/Engine/Binaries/DotNET/AutomationTool/AutomationTool.exe` | `<UE root>/Engine/Binaries/Win64/UnrealEditor-Cmd.exe` | `<UE root>/Engine/Binaries/Win64/UnrealEditor.exe` |
| Linux | `<UE root>/Engine/Build/BatchFiles/RunUAT.sh` | `<UE root>/Engine/Binaries/Linux/UnrealEditor` | same editor |
| macOS | `<UE root>/Engine/Build/BatchFiles/RunUAT.sh` | Unconfigured until actual documented/provided command | Unconfigured until actual documented/provided command |

Build arguments: `BuildCookRun -project="<absolute .uproject>" -platform=<Win64|Linux|Mac> -build -cook`, chosen by host/actual intended target, not an
unanswered cross-compilation assumption. Source Windows AutomationTool was
verified with .NET8 and avoids Git Bash RunUAT.bat path-space failure; on a
compatible actual host without that runtime, the bundled RunUAT launcher may
be appropriate. Verify and disclose the selected executable instead of promising
an untested fallback. Build may also build the editor target.

For Windows/Linux test, append to the quoted editor:
`"<absolute .uproject>" -ExecCmds="Automation RunTests <unique-root>.; Quit" -unattended -nullrhi -stdout -FullStdOutLogOutput`.
The filter matches substrings, not prefixes: common game names Audio/Core/Input/
Test/System/Engine/Editor/AI/Math can accidentally run engine tests. Choose the
project's actual distinct test root with the owner, consistently in tests and
command. Trailing `; Quit` is handled by automation and must remain. Source255
means failed tests **or** no matches; inspect logs. Do not substitute
`-TestExit="Automation Test Queue Empty"` and treat exit0 as pass without report
JSON; it can hide failed tests.

Run uses `"<absolute .uproject>" -game -windowed -ResX=1280 -ResY=720`.
Smoke uses `"<absolute .uproject>" -game -nullrhi -unattended -stdout -ExecCmds="Quit"`.
Keep -game so Quit exits the game rather than leaving an editor process resident;
keep -stdout so failures remain visible. A run-and-observe command must render
the game, never use headless/batch/null-RHI switches.

On macOS source only establishes the build script: leave test/run/smoke explicitly
unconfigured until actual supported commands are supplied or researched. Do not
fabricate a path inside an app bundle from memory. Preserve an existing verified
owner command rather than erasing it just because the source template lacks one.

## Retain execution evidence

Run each configured operation separately, with its own output directory:

- Build: `node .game-studio/run.cjs test --kind build --output NEW_BUILD_DIR --json`.
- Test: `node .game-studio/run.cjs test --kind test --output NEW_TEST_DIR --json`.
- Smoke: `node .game-studio/run.cjs test --kind smoke --output NEW_SMOKE_DIR --json`.

Use `--command LITERAL` for an authorized separate run without changing config.
Inspect its command/source, processExitCode and
logs. The wrapper is bounded command evidence, **not** the source runner parser
or a test-quality verdict. Explicitly inspect test counts, skipped tests, failures
and engine errors. No matching tests or unrun browser/editor is NOT ASSESSED.
