# Godot script loading check

Source: `.claude/scripts/godot-parse-check.gd`. The executable GDScript body is
retained unchanged in `studio/scripts/godot-parse-check.gd`; only usage comments
describe installed resource lookup. No public CLI command or runtime dependency
on the retained migration tree is added.

Resolve `studio/scripts/godot-parse-check.gd` through the project's pinned
`resource path` command. With the selected Godot executable, run the returned
absolute script path using `--headless --path <game-root> -s <resolved-path> --`
followed by the actual changed `res://` script paths. Pass paths as literal argv,
or quote them for the actual host shell. Use bounded execution and an explicitly
owned log path. First import a fresh project to populate its class-name cache.
An import result alone is not a script-loading result.

The script loads each argument after project startup has registered autoloads,
checks it is an instantiable Script, emits `ok: PATH` or `PARSE FAIL: PATH`, and
continues through the supplied paths. Exit 0 means all supplied scripts load;
1 means at least one failed; 2 means no script was supplied. Preserve Godot's
error output and the process exit code, including crashes and timeouts. Missing
engine or incomplete import remains NOT ASSESSED, never a substituted static
pass. This script does not discover changed files or choose an engine version.

Starting the project runs its autoloads and loading scripts may initialize code.
This is not a pure parser, security sandbox, test suite or whole-project quality
gate. A successful selected-script load does not prove every autoload succeeded,
gameplay ran, tests exist, exports work or C# builds. Inspect engine logs too.
For C# projects, actual .NET editor/SDK and compilation remain separate.

`toolkit/test/godot-parse-smoke.mjs` exercises the actual supplied editor against
temporary source and installed-resource fixtures: valid autoload/class-name
references, syntax failure, missing script, mixed valid/invalid paths and no
arguments. It records engine identity, argv, outputs, exit status and protected
source hashes. It does not run as a fake default unit test when Godot is absent.
Run it explicitly with `--executable PATH --output NEW_DIRECTORY`, optionally
`--runtime PATH` for an extracted/installed toolkit package. The output directory
must be new; its project, cache and engine logs are owned test artifacts.
