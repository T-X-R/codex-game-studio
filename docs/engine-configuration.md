# Engine configuration

`game-studio engine setup` applies an agreed engine configuration to an attached
workspace. The input is project-relative YAML or JSON. It updates `project.yaml`
and `docs/technical-preferences.md` in one guarded transaction.

```sh
game-studio engine setup --input production/engine-setup.yaml --dry-run --json
game-studio engine setup --input production/engine-setup.yaml --json
game-studio engine inspect --json
```

Use `--project <directory>` when running outside the game workspace. Restore the
workspace's pinned runtime before invoking these commands.

The following is an example configuration, not a recommendation of a current
engine release. Record the version and choices established for your game:

```yaml
engine:
  name: Godot
  version: "4.6.1"
  language: GDScript
  code_root: src
  test_root: tests
  rendering: Compatibility
  physics: Godot Physics 2D
specialists:
  code: game-studio-godot-gdscript-specialist
  additional: []
naming:
  variables: snake_case
# Add only commands you have established for this project's engine and OS.
```

The `engine` block must provide `name`, `version`, `language`, `code_root`, and
`test_root`. Supported names are `Godot`, `Unity`, `Unreal`, and `Web`. Quote
versions in YAML: a numeric `4.6` is not a version string. Version ranges, `latest`
and placeholders are rejected. For Web, record the selected game framework or
build-tool version and language; the CLI does not choose a toolchain.

Optional fields are `engine.rendering` and `engine.physics`; specialists
`primary`, `code`, `shader`, `ui`, and `additional` (a list); and naming
`classes`, `variables`, `constants`, `signals`, `files`, and `scenes`.
`commands` accepts `run`, `build`, `test`, and `smoke`. Each command is either a
string, null, or a mapping of `windows`, `macos`, `linux`, and `default` to command
strings or null. Multiline commands are allowed. Other string fields must be
nonempty and single-line. The literal string `"null"` is rejected; use YAML/JSON
null to clear an optional scalar field.

Unspecified values, OS commands, YAML comments and preference notes are
preserved. Changing a scalar command into an OS mapping (or the reverse) is a
conflict: reconcile that structure explicitly before running setup. The command
does not silently replace it. Engine rendering, physics, role names and naming
conventions are recorded as choices, not inferred or certified by this command.

Paths must stay within the workspace, use their exact spelling and avoid
symbolic links and framework directories. New directories may be recorded but
are reported as `missing`; setup does not create them. `engine inspect` continues
to flag a missing explicit root as invalid for execution until it exists.

The preference document mirrors engine identity, language, rendering, physics,
specialists and naming. If only the legacy `.claude/docs/technical-preferences.md`
exists, setup copies its content into the canonical document and updates the
known labels. It preserves the legacy source and custom notes; review retained
notes for obsolete instructions. Duplicate known labels produce a conflict.
The configuration and mirror remain user-owned. If either changes after planning,
the transaction refuses to overwrite it, even when that document's planned bytes
are unchanged. Repeating the same setup is a no-op.

This command only records configuration. Its result explicitly marks execution
`not_assessed`: it does not install or launch an editor, generate a game scaffold,
run configured commands, validate role availability, or prove a build or test.
Use `game-studio test --kind test|smoke|build` for a configured operation and inspect
its report. Full engine acceptance remains separate work in the migration plan.

## Project scaffolding

`game-studio engine scaffold --dry-run --json` previews project creation from
the existing `project.yaml`; omit `--dry-run` to apply it. This separate command
keeps configuration updates from implicitly creating or launching an engine.

For Godot 4.x, it creates `project.godot` only when absent, using the recorded
version's major/minor, project name and explicit renderer. Compatibility maps to
`GL Compatibility` / `gl_compatibility`, Forward+ to `Forward Plus` /
`forward_plus`, and Mobile to `Mobile` / `mobile`. It leaves the main scene unset
until a real scene exists. A concurrent configuration change or newly created
project file blocks the transaction. An existing project file is left unchanged,
including custom settings and line endings.

Unity and Unreal projects must be generated with their editors; the command
detects existing project markers or returns `not_assessed` with the required next
action. Web growth remains a separate migration task. Scaffolding never claims
that an editor, import, build, test or game has run.

Godot settings and command-line behavior are grounded in the official
[ProjectSettings reference](https://docs.godotengine.org/en/stable/classes/class_projectsettings.html)
and [command-line tutorial](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html).

## Installed Godot verification

```sh
game-studio engine verify --executable /path/to/Godot --dry-run --json
game-studio engine verify --executable /path/to/Godot --output production/evidence/godot-import --json
```

The default executable name is `godot`. Use the actual executable inside the
application bundle on macOS. The command checks `--version` against the configured
Godot 4.x version and confirms that `--help` advertises the editor's `--import`
operation before running `--headless --path <project> --import`. A C# project
requires the .NET/mono edition. No editor is downloaded or installed by this
command. Import can create Godot cache/import metadata and execute project editor
code; this is a process operation, not a read-only inspection.

The result distinguishes a missing executable/project, version mismatch or
missing editor capability (`not_assessed`, exit 3) from a failed invocation
(exit 5), timeout (124) or interruption (130). `--timeout` sets each subprocess's
limit in milliseconds. A zero exit with `ERROR`, `SCRIPT ERROR` or parse-error
diagnostics is still a failure. For the upstream-observed Godot 4.7 import crash
(exit 139 or SIGSEGV), one retry is allowed and both attempts remain in the report;
other failures are not automatically retried.

The new evidence directory contains the report plus separate stdout/stderr logs
for version, help and each import attempt. Existing evidence is never overwritten.
`--dry-run` starts no process and writes nothing. Passing verifies editor import
only; it does not establish test coverage, a build, main-scene execution or human
play acceptance. Unity, Unreal and Web import adapters remain unimplemented and
return `not_assessed`; their configured test/build commands remain separate.
