# Settle technical preferences

Reuse the chosen engine/version. Godot language comes from the separate language
reference. Unity uses C#. Unreal asks C++ primary with Blueprint prototyping, or
Blueprint primary with C++ where needed; use C++ only if the owner actually says
no preference, never because a question was skipped. Web follows its own branch.

Read existing `docs/technical-preferences.md` before proposing changes. Preserve
existing project decisions, notes and unrelated sections. Configuration has two
layers: structured shared values and rich project-owned explanation. Use the
configuration reference to apply them, rather than hand-editing project.yaml.

## Stack and naming

Unity: Unity Build Pipeline; Unity Asset Import Pipeline + Addressables describes
the engine's asset ecosystem, not permission to install a package. Classes,
methods, public fields/properties and filenames are PascalCase, private fields
`_camelCase`. Source machine convention uses camelCase variables, SCREAMING_SNAKE
constants, PascalCase `On<Event>` event handlers and PascalCase scenes/files.
The source allowed PascalCase or UPPER_SNAKE constants in prose while its machine
row used SCREAMING_SNAKE: retain this as explicitly UNVERIFIED until confirmed
against the project's coding standard/current official source. Do not conceal
the uncertainty in either the configuration report or Naming Conventions notes.

Unreal: Unreal Build Tool; Unreal Content Pipeline. Classes require UE type
prefixes (`U/A/F/E/I/T`) plus PascalCase; variables/functions PascalCase, booleans
`b` prefix, files class name without the type prefix. Machine names use PascalCase
variables/files/scenes and `On<Event>` handlers, not Godot signals. `scenes` is the
shared schema category for Levels/Maps; it does not change Unreal terminology.
Source SCREAMING_SNAKE constants remain explicitly UNVERIFIED pending sourcing.

Godot's full naming variants and per-file Both boundary are in
[godot-language.md](godot-language.md). Web uses its established style or its
starter defaults. Do not mistake short machine enums for all rich conventions.

## Input and platform

Use existing confirmed answers, otherwise actual design sections. Derive support
from platform, present it and let the owner confirm/adjust:

| Platform | Gamepad | Touch |
|---|---|---|
| PC only | Partial (recommended) | None |
| Console | Full | None |
| Mobile | None | Full |
| PC + Console | Full | None |
| PC + Mobile | Partial | Full |
| Web | Partial | Partial |

Primary input depends on established genre: console action/RPG/platformer→gamepad;
strategy/point-and-click/RTS→keyboard/mouse; mobile→touch; mixed platforms→ask.
Without a genre, ask plausible inputs and offer explicit leave-unconfigured.
Do not infer genre from engine/platform, silently leave the field blank or invent
it from the project folder. A missing minimal brief is normal. Confirm targets,
primary input and support; `Input Methods` comes from effective derived values.
Preserve actual **Platform Notes**, e.g. required d-pad navigation/no hover-only
interaction. Such notes belong to the project, not a fabricated YAML field.

## Budgets, tests and libraries

Ask whether to set performance defaults now (60fps,16.6ms frame budget plus a
justified engine/hardware draw-call budget) or explicitly defer until hardware
is known. Source provides no universal draw-call value: propose with reasoning
or leave it unconfigured, never invent a sourced number. Structured numeric
fields use numbers or null, with units explained in prose.

Propose the actual framework, reusing an existing choice: gdUnit4 for Godot,
NUnit for Unity, Automation Spec for Unreal. It must agree with commands.test;
Godot's source runner is gdUnit4, not GUT. Framework selection does not install
it or prove any tests ran. Web's existing framework remains its own.

Leave Forbidden Patterns and Allowed Libraries unconfigured on a new project,
and preserve existing entries. Do not add speculative packages or integrations
such as Steam merely because they may be useful later. Add dependencies only
when their integration is actually authorized.

Present the settled stack, conventions, routing, platform/input, budgets and
framework. In guided mode reuse authorization for this proposal; unresolved
customization choices wait. Readback must cover the rich sections as well as
machine fields, especially Both and Platform Notes.
