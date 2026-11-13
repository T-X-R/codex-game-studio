# Record settled configuration and rich preferences

Read the existing primary configuration, technical preferences and actual engine
layout. Reuse approved engine/version/language choices. Do not overwrite other
settings, add a duplicate block, or write derived review/rigor settings merely
because this workflow read them.

## Resolve dimension-dependent values

Godot alone needs dimension and web targets for these defaults:

| Shape | Rendering | Physics |
|---|---|---|
| 2D, includes Web | Compatibility | Godot Physics 2D |
| 2D, no Web | Forward+ | Godot Physics 2D |
| 3D, includes Web | Compatibility | Jolt |
| 3D, no Web | Forward+ | Jolt |

Resolve each input from already answered selection questions, then the actual
brief/concept, then ask. Engine/version-only and prior-experience shortcuts did
not necessarily collect shape. Offer the four shapes and explicit leave
unconfigured; use null rather than unjustified defaults. These are source
Godot4-era defaults, not proof of support in every release: check the selected
version's references before recording a default that may differ. A mixed2D/3D
project needs its actual 3D backend and explanation, not a false claim all its
physics is Jolt. Web export must govern the renderer if any target is Web.

Unity uses URP/PhysX and Unreal Lumen + Nanite (deferred)/Chaos as proposed
engine defaults; do not ask a Godot shape question whose answer does not affect
these rows. Preserve an existing deliberate engine setup and explain defaults
can be changed. Existing Web records its own toolchain and clears stale
rendering/physics; new Web follows its selected starter.

## Structured input and paired write

Use `node .game-studio/run.cjs engine setup --input PATH --dry-run --json`.
PATH is a project-relative YAML/JSON file containing the agreed settings, kept
in an exclusively created owned directory. Include this evidence/input artifact
in the write scope; no shared fixed temporary filename. JSON avoids shell/YAML
quoting accidents; never interpolate shell text through an unsafe command string.

Supported blocks/fields:

- `engine`: name, path, version, language, rendering, physics, code_root, test_root.
- `specialists`: primary, code, shader, ui, additional (array).
- `naming`: classes, variables, constants, signals, files, scenes.
- `commands`: run, build, test, smoke; each string or a map of windows/macos/linux/default.
- `platform`: targets (array), primary_input, gamepad_support, touch_support.
- `performance`: target_framerate, frame_budget_ms, draw_call_limit, memory_ceiling_mb.
- `testing.framework`; `qa.coverage_minimum` only when actually requested.

Engine name/language and exact version are required. Unknown exact **existing
Web** bundler version is explicit null, clearing a stale version; no range,
`latest`, wildcard or library version masquerades as the engine version. Other
engines need an explicit version. Omission preserves an existing override;
explicit null unsets permitted values. Numeric settings use numbers/null within
the installed schema bounds, not placeholder strings. Do not add unknown fields.
Do not set `qa.coverage_minimum` just because the API supports it.

Keep the original four blocks complete for the selected engine: language naming
and routing tables are in preferences/Godot/routing references; commands follow
the commands reference. For Godot Both, shared language/default naming is
GDScript, with C# recorded in rich per-file rules. For Blueprint-primary Unreal,
shared language is Blueprint; a secondary Blueprint tool does not change C++.

Use actual code/test roots from `engine inspect`/effective `engine_row`, including
valid explicit overrides. Default code roots are Godot/Web src, Unity Assets and Unreal Source.
Unreal test_root, separately, depends on the actual module; never guess that
module or write a fabricated test path.
An unresolved root is reported, not scanned as src. Web root selection follows
its detector. Do not persist defaults as overrides unless a choice requires it.

Review the dry-run paths, proposed values and warnings with the owner. Reuse
existing authorization for that concrete scope. Apply the **same** input without
`--dry-run`, then read back. The command synchronizes `project.yaml` and
`docs/technical-preferences.md` as a guarded pair, including unchanged partner
before-images; it preserves unrelated configuration and fills missing fields.
Errors or conflicts stop the write, never trigger a manual YAML fallback.

## Rich project-owned material

The pair stores machine-readable choices; it does not author all domain prose.
Resolve `studio/scripts/md-section.mjs`. List/extract the target section before
using a scoped `replace`, `insert-before`, or `set-field`; preview with
`--dry-run`. Feed replacement body through stdin, preserving unrelated/nested
content and comments. The helper cannot infer authorization or quality.

Retain/add the settled Technology Stack (Build System, Asset Pipeline and any
selected library), rich Language line, full naming distinctions, Engine
Specialists and File Extension Routing, Platform Notes, budget/test caveats and
explicit unverified/TODO notes in `docs/technical-preferences.md`. A new section
can be added with a narrowly scoped document edit when no anchor exists; do not
replace the whole file just to add it. Do not invent YAML `build_system`,
`platform.notes`, or rich-routing fields. Source YAML comments about unverified
constants and unconfigured commands are retained when present; new qualifications
must be visible beside the project-owned convention/command record and in the
summary, never silently advertised as verified machine facts.

If changing engine/primary conflicts with approved Both or populated routing,
show the actual old/new choices and affected rich sections. Obtain the owner's
reconciliation decision; preserve their content/history where applicable. Edit
only the settled rich conflict, then retry the same intended structured change.
Never strip a whole routing section merely to bypass FILE_CONFLICT. Re-read
between operations: this sequence is **not** a single atomic transaction.

Finally compare shared values with rich records: exact engine/version/primary,
Both .gd/.cs/.csproj rules, naming, platform/support and actual commands. Report
and resolve contradictions rather than declaring setup complete. AGENTS and
version references follow their own installation/verification path; do not edit
an installer-owned file to insert project values.
