# Create only the missing engine project

The filesystem establishes whether an engine project exists; do not invent an
engine.project_scaffolded setting. Use `engine scaffold --dry-run --json` to
inspect actual paths before the authorized application. Existing markers and
game files remain the owner's. A conflicting target is not an overwrite request.

## Godot

`node .game-studio/run.cjs engine scaffold --dry-run --json` describes a missing
project.godot using settled engine version and rendering. The title comes from
the agreed project name/brief or folder; if the CLI's actual title differs,
resolve the naming choice before writing rather than claiming it used the brief.
When the agreed brief title should be used and project.name is unset, record that
settled title with the existing config set project.name operation (preview, apply,
read back under the same authorized scope), then preview scaffold again. An
existing different project.name is a choice to reconcile, not an automatic rename.
Do not invent a Godot --title flag: that option belongs to Web.

The project has config_version5, config/name, major.minor feature plus renderer
feature and rendering method. Compatibility→GL Compatibility/gl_compatibility;
Forward+→Forward Plus/forward_plus; Mobile→Mobile/mobile. Leave run/main_scene
unset because no scene exists yet; later implementation or the owner sets it.
Apply without --dry-run under the agreed scope. Existing project.godot is
preserved and reported, not regenerated to match preferred defaults.

Use `node .game-studio/run.cjs engine verify --dry-run --json` to disclose the
exact executable/import/evidence effects, then actual verification with a new
`--output` directory and the selected `--executable` when needed. This probes
version/help and imports only an exact accepted Godot4 pin; major.minor coherence
elsewhere is not exact patch acceptance. It retains process codes/logs and
checks engine errors even when a process exits0. Godot4.7 crash139/SIGSEGV may
receive its single bounded retry; preserve both attempts and warnings, never
report only the successful retry. Do not add unlimited retries.

Absent, mismatched or failed probes yield `project.godot NOT VERIFIED — reason`.
Successful import does not run a main scene, export/build, test gameplay or prove
C# compilation. C# needs the actual .NET editor; **Both stores GDScript as primary,
so additionally verify its editor edition and SDK rather than relying on the
verifier's primary-language check**. Report untested .NET functionality precisely.

## Unity and Unreal

Use the existing scaffold observation to determine whether a marker exists.
No fabricated Unity project or .uproject is written. In a short instruction,
ask the owner to create the Unity project in the chosen Hub editor at the game
root using the agreed2D/3D template, or create Unreal through the launcher/editor,
then resume setup. If shape was not settled, do not pretend a template was chosen.
Existing project markers remain untouched. Report `not created — editor required`
separately from configuration status; no claim a runnable game exists.

## Web

Follow [web-new.md](web-new.md) or [web-existing.md](web-existing.md).
Only explicit new-starter selection permits copying. Installation and actual
build/unit/browser/image observations are separate from successful scaffolding.
