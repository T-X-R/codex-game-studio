# Unreal test setup

Resolve the actual primary C++ module from project/module/target metadata and
settled engine.test_root. Tests belong inside the compiled module, normally
`Source/<Module>/Private/Tests`; a folder immediately under Source is not a
module and its tests can be silently unbuilt. The .uproject basename is only a
source-era default, not proof the module or editor target has that name. Multiple
modules or a Blueprint-only project need an explicit target/module decision;
do not manufacture a C++ module or change game sources to satisfy this scaffold.

Keep four identities distinct: actual .uproject basename, Editor target, compiled
module, and automation test-name root. A uniquely observed real Editor target in
Source/*.Target.cs is evidence for that target; do not derive it from the project
basename. Missing or ambiguous target metadata remains an explicit need. Reuse the root in commands.test; it may be an
owner-chosen distinct name because the project is called Audio/Core/Input/etc.
Unreal's filter matches substrings, not a prefix, so a common root can select
engine tests accidentally. An ambiguous filter needs a choice, not a guessed
project name substituted everywhere.

Create only the missing module test README, with these complete instructions:

- UE Automation Testing Framework tests compile with this module.
- Wrap each test file in `#if WITH_DEV_AUTOMATION_TESTS` … `#endif`.
- Flags: `EAutomationTestFlags::EditorContext | EAutomationTestFlags::ProductFilter`;
  there is no GameFilter flag.
- Class `F[System][Scenario]Test`, one distinct class per test; a reused class name
  from IMPLEMENT_SIMPLE_AUTOMATION_TEST fails to link.
- Test name `<actual-filter-root>.[System].[Scenario]`, and Session Frontend →
  Automation selects that actual root, not an unresolved template token.
- Build the real editor target on a fresh checkout before testing; a missing
  compiled game module prevents any test from running.

Document actual absolute paths, quoted for the execution shell. The toolkit's
Windows configured-command execution uses cmd, not Bash; do not insert
`$(pwd -W …)` into it. Source headless Windows forms are:

```text
"<UE root>/Engine/Binaries/DotNET/UnrealBuildTool/UnrealBuildTool.exe" <actual-editor-target> Win64 Development -Project="<absolute-project.uproject>"
"<UE root>/Engine/Binaries/Win64/UnrealEditor-Cmd.exe" "<absolute-project.uproject>" -ExecCmds="Automation RunTests <actual-filter-root>.; Quit" -unattended -nullrhi -stdout -FullStdOutLogOutput
```

The source uses UnrealBuildTool.exe rather than Build.bat for Bash paths with
spaces. Verify actual installation/tool requirements before an execution claim.
On Linux the source editor-build script is Engine/Build/BatchFiles/Linux/Build.sh
with `<actual-editor-target> Linux Development -Project="<absolute-project>"`;
tests use Engine/Binaries/Linux/UnrealEditor and the same test arguments.
On macOS the build script is Engine/Build/BatchFiles/Mac/Build.sh with Mac;
the source does not establish a macOS command-line test executable. Retain a
known owner-provided verified command or research it, otherwise leave testing
NOT ASSESSED rather than inventing an app-bundle path.

Keep trailing `; Quit`, `-stdout` and `-FullStdOutLogOutput`. Test execution is
headless; it does not show or validate the game visually. Read logs, not just
exit code: source255 occurs both for failures and no matches; Result={Fail}
is a failure, while No automation tests matched means no matching compiled test
and NOT ASSESSED. Inspect the actual discovered names/count and preserve errors.
Do not replace this with an exit0-only TestExit queue-empty interpretation.

CI uses a self-hosted Windows runner, actual UE_ROOT, an editor-target build
before tests, quoted absolute project path and the settled distinct test filter.
Missing runner/editor/module/target/filter stays explicit. Creating the README
and YAML neither installs Unreal nor proves a licensed/buildable project or
passing automation suite. No engine specialist is fabricated or required as a
new review gate for this utility.
