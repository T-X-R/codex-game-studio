# Godot test setup

Use the resolved test root (default tests), with unit and integration subfolders.
Create `.gdignore_placeholder` in each, containing respectively
“Unit tests go here — one subdirectory per system” and
“Integration tests go here — one subdirectory per system”. This is not `.gdignore`:
never hide the test directory from Godot. The old shared helper used `.gitkeep`
instead; the migrated helper follows the source Skill/spec's placeholder names.
Preserve any existing .gitkeep rather than renaming/deleting it. Neither file
is an example test or evidence of discovered tests.

**Do not create a custom runner.** The real gdUnit4 entry is
`res://addons/gdUnit4/bin/GdUnitCmdTool.gd`, with a capital U. Record missing plugin
as an install prerequisite. README install steps: open Asset Store (AssetLib
before4.7), find GdUnit4, install; enable the plugin in Project Settings → Plugins;
restart the editor; check the exact runner path. No download/install is implicit.

Document the exact selected executable (engine.path/confirmed command provenance;
not a fabricated bare godot when it does not resolve) and actual test root:

```text
<godot> --headless --path . --import
<godot> --headless -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a res://tests --ignoreHeadlessMode
```

The second line's default root must track an actual approved override. Import
first on a fresh checkout: absent .godot class cache can make the runner fail
to load (exit1, no tests); a stale cache after class_name changes can produce105.
The action handles its own import. A configured test command is preserved;
report inconsistencies instead of replacing it under force.

Retain the port-zero remote debugger and headless override. Without the former,
a script error can wait at an interactive debugger. The two known port-zero
connection diagnostics are expected only in that exact runner/argument context;
other ERROR/SCRIPT ERROR lines still matter. Use the toolkit's actual
portZeroDebuggerExpected/engineErrorDetected observations and retain raw logs,
not a blanket “ignore errors”.

Source runner exit meanings, qualified by the actual installed runner:

| Process code / output | Meaning |
| --- | --- |
| 0 with discovered passing tests | passed tests |
| 0 + No test cases found | NOT ASSESSED, no discovered tests |
| 100 | failing test |
| 101 | tests passed with leaked-node warning, retain warning |
| 103 / 104 | runner unavailable/refused headless/unsupported Godot; no test pass |
| 105 | test script parse failure |
| 1 / runner failed to load | no test execution; investigate import/runner |

The generic toolkit test command may classify any nonzero as failed; report the
original processExitCode and runner meaning separately, never rewrite evidence.
An actual verification run requires authorized editor execution and a new output
directory; this setup's generated commands alone prove none of these results.
The source observations were established on Godot4.6.1/gdUnit4 6.1.3 and
Godot4.7.2/gdUnit4 6.2.2, not every future release.

Naming: `[system]_[feature]_test.gd`, function `test_[scenario]_[expected]`, e.g.
`combat_damage_test.gd` / `test_base_attack_returns_expected_damage()`. Use clear
arrange/act/assert, isolated unit data and cleaned-up integration state. A new
regression test should fail against the actual unfixed bug before its green
result is trusted; a placeholder or assert-true file is not a meaningful example.

CI uses the complete release chosen for this project, not major.minor text from
a reference, the committed gdUnit4 via `version: installed`, and both unit and
integration paths. Local `-a res://tests` also sees other suites under that root;
document this scope difference. C#/Both requires the actual compatible .NET
editor/runner arrangement; do not claim GDScript setup alone verifies C# tests.
