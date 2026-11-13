# Configured test execution

Current source builds implement the `test` command. This is an unreleased addition
and is not available in the existing `v0.1.0-alpha.0` archive.

```bash
node .game-studio/run.cjs test --dry-run --json
node .game-studio/run.cjs test --output production/evidence/tests-001 --json
node .game-studio/run.cjs test --kind smoke --timeout 60000 --json
node .game-studio/run.cjs test --kind build --json
```

The operation reads `commands.test`, `commands.smoke` or `commands.build` from
`project.yaml`. A string is executed as configured. An OS-aware map selects
`windows`, `macos` or `linux`, then `default`. An explicit map without a matching
entry does not silently fall back to an engine command. Personal command
overrides are ignored because commands are shared project configuration.

`--command 'COMMAND'` explicitly selects a shell command for one invocation,
without changing shared or personal configuration. It uses the same timeout,
process cleanup and evidence capture. The report records `source:
invocation:--command` and the exact command; an empty override is rejected.
Use this for an inspected runner's second test mode or fresh result destination,
within the authorized test scope. Quote the whole argument for the calling shell
and its executable/paths for the command's own OS shell. It is not a permission
bypass and does not silently replace configured commands on ordinary runs.

When a command is absent, the bundled engine table supplies a default if it has
one. Web defaults require the corresponding `package.json` script. Godot defaults
require `project.godot`, and its default test additionally requires the gdUnit4
entry script. Unity and Unreal have no generic test command: configure the
actual editor, project and runner invocation. The toolkit does not download
editors, install test frameworks or manufacture a passing result when capability
is missing. Editor execution, licensing and test discovery still need real engine
evidence before that path can be advertised as verified.

Commands run from the game root using the operating system's shell: `/bin/sh`
on macOS/Linux and a temporary UTF-8 `.cmd` script on Windows. Windows batch
syntax applies (for example, `%%i` in a `for` loop); use `call` when invoking
another batch file if subsequent lines must run. The wrapper retains the final
ERRORLEVEL, including command-not-found 9009, and is removed after execution.
Use the OS-aware map for shell-specific syntax. A dry run
resolves the command and output path without starting a process or writing files.

Each real invocation creates a new directory with `report.json`, `stdout.log`
and `stderr.log`. Existing evidence directories are never overwritten. The report
records the selected command/source, OS, duration and original process exit code.
A zero exit alone does not prove test coverage. For a Godot project, engine error
diagnostics in either log make the result fail even when the process exits zero;
`engineErrorDetected` records that observation. Other engines retain their runner's
exit semantics and require their own result/coverage review. Keep human play
acceptance separate.

For a Godot `test` command explicitly invoking
`res://addons/gdUnit4/bin/GdUnitCmdTool.gd` with
`--remote-debug tcp://127.0.0.1:0`, the two known port-zero connection diagnostics
are expected: the invalid-port message and the debugger connection failure for
`127.0.0.1:0`. `portZeroDebuggerExpected` records that command context. These exact
lines remain in the original logs but do not alone set `engineErrorDetected`.
Script/parse errors, directory/certificate errors and every other engine error
still fail; other commands and editor verification retain strict interpretation.
Nonzero runner exits and missing/zero tests still need their own interpretation.

Toolkit exit codes are 0 for successful execution, 3 for unavailable capability,
5 for a failing command, 124 for timeout and 130 for cancellation. The original
nonzero code is retained in `processExitCode`. Logs are saved for failures and
timeouts too. Timeouts are bounded to 100–1800000 ms, with a 120000 ms default.
Smoke workflows can explicitly allow 900000 ms for suites and 1800000 ms for
editor builds; the ordinary default is unchanged. A larger limit does not wait
out the whole interval when a process finishes sooner.

Use `config get engine_row` to inspect engine-specific roots, their filesystem
state and default commands. This does not execute an editor. Invalid explicit
roots never fall back to another directory. Case mismatches, traversal,
framework roots and symbolic links are reported as invalid. Missing directories,
unresolved Unreal module placeholders and ambiguous auto-detection are visible.
An unset engine never implies a `tests/` root. For a code root of `.`, consumers
must honor the returned `excluded_code_directories` list when scanning.

`engine inspect --json` combines this directory inspection with engine
name/version/language provenance. Its `execution.state` remains `not_assessed`:
a declared engine version is not a measurement of an installed executable.
