# Unreal Automation Tests
Tests use the UE Automation Testing Framework and compile with this module.
Wrap each test file in `#if WITH_DEV_AUTOMATION_TESTS` … `#endif`.
Flags: `EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter`
(there is no `GameFilter` flag).

Run via: Session Frontend → Automation → select "@TEST_PREFIX@." tests
Or headlessly from the project root, after building the editor target — on a
fresh checkout the editor exits before any test runs. The next two commands
use Git Bash on Windows (not cmd.exe or PowerShell); the pwd expression supplies
an absolute project path. In another shell, use that shell's quoting and an
explicit absolute .uproject path instead:
"<UE root>/Engine/Binaries/DotNET/UnrealBuildTool/UnrealBuildTool.exe" @EDITOR_TARGET@ Win64 Development -Project="$(pwd -W 2>/dev/null || pwd)/@DOCPROJECT@.uproject"
"<UE root>/Engine/Binaries/Win64/UnrealEditor-Cmd.exe" "$(pwd -W 2>/dev/null || pwd)/@DOCPROJECT@.uproject" -ExecCmds="Automation RunTests @TEST_PREFIX@.; Quit" -unattended -nullrhi -stdout -FullStdOutLogOutput
The project path must be absolute: UE does not find a relative one (exit 1,
"Project file not found"). Those two lines are Windows'. On Linux build with
`Engine/Build/BatchFiles/Linux/Build.sh @EDITOR_TARGET@ Linux Development -Project="$(pwd -W 2>/dev/null || pwd)/@DOCPROJECT@.uproject"` and run
the tests with `Engine/Binaries/Linux/UnrealEditor` and the same arguments; on
macOS build with `Engine/Build/BatchFiles/Mac/Build.sh @EDITOR_TARGET@ Mac Development -Project="$(pwd -W 2>/dev/null || pwd)/@DOCPROJECT@.uproject"`
— Epic documents no command-line editor inside `UnrealEditor.app` for the test
run (see `docs/engine-reference/unreal/current-best-practices.md`, "Command Line").

Read the output, not the exit code: a failing test and a run that matched nothing both exit 255.
`Result={Fail}` is a failure; `No automation tests matched` means no test was
built or named `@TEST_PREFIX@.…`.

Test class naming: F[System][Scenario]Test — one class per test; a second
test reusing a class name fails to link
Test name: "@TEST_PREFIX@.[System].[Scenario]"
