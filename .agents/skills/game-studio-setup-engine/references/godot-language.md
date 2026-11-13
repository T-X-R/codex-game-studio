# Godot language, naming and routing

Load only for Godot, once when settling the stack. Ask if the owner has not
chosen: GDScript (native, rapid gameplay iteration), C# (.NET tooling and familiar
C# ecosystem), or Both (GDScript gameplay/UI and selected C# systems). Reuse an
explicit answer. C#/Both requires a compatible .NET-enabled editor and SDK;
verify actual requirements for the chosen Godot release, not a timeless SDK claim.

## Stack by choice

| Choice | Rich Language record | Build System | Primary YAML language |
|---|---|---|---|
| GDScript | Exactly `GDScript` | SCons for engine, Godot Export Templates | GDScript |
| C# | C# (.NET 8+, primary), C++ via GDExtension (native plugins only) | .NET SDK + Godot Export Templates | C# |
| Both | GDScript (gameplay/UI scripting), C# (performance-critical systems), C++ via GDExtension (native only) | .NET SDK + Godot Export Templates | GDScript |

Write the rich Language record in this parenthesized source format so later
structured synchronization preserves the approved choice. The C# SDK number is
the source baseline: confirm or replace it with the selected release's actual
requirement, keeping the `C# (...)` primary qualifier; if unverified, say so
inside that qualifier rather than asserting a checked requirement.

All use Godot Import System plus the project's custom resource pipeline when
present. Native-extension routing does not make C++ a primary language and does
not authorize adding native plugins. GDScript's Language field must not acquire
`C++ via GDExtension`.

## Conventions

| Element | GDScript | C# |
|---|---|---|
| Classes | PascalCase | PascalCase, Godot classes `partial` |
| Variables/functions | snake_case | Public properties/fields PascalCase; private fields `_camelCase`; methods PascalCase |
| Signals/events | snake_case past tense, e.g. health_changed | PascalCase delegate with EventHandler suffix, e.g. HealthChangedEventHandler; [Signal] patterns |
| Files | snake_case matching class | PascalCase matching class |
| Scenes | snake_case matching file | PascalCase matching root node |
| Constants | UPPER_SNAKE_CASE | PascalCase |

Machine naming rows: GDScript classes PascalCase, variables/files/scenes
snake_case, constants SCREAMING_SNAKE, signals past_tense. C# classes/files/scenes
PascalCase, variables camelCase, constants PascalCase, signals on_event_name;
the richer public/private/delegate distinctions remain in this document's
project-owned counterpart. Both uses GDScript machine defaults but **.gd follows
GDScript and .cs follows C# per file**. They are not mixed-language files. Ask
before assigning an undecided new system to a language and record the decision.

## Routing by actual file or responsibility

Source specialist names describe needed capabilities. Use a native
`game-studio-<source-name>` role only when it is actually registered and available.
If it is not migrated, record that gap; do not dispatch a generic role under that
name or claim the specialist review occurred. These tables are project guidance,
not permission to edit installed role TOMLs or fabricate a runtime agent.

| Work | GDScript project | C# project | Both project |
|---|---|---|---|
| Primary architecture/ADR/cross-cutting review | godot-specialist | godot-specialist | godot-specialist |
| .gd scripts | godot-gdscript-specialist | Only if explicitly introduced: godot-gdscript-specialist | godot-gdscript-specialist |
| .cs scripts | Only if explicitly introduced: godot-csharp-specialist | godot-csharp-specialist | godot-csharp-specialist |
| .csproj/NuGet | Not applicable without C# work | godot-csharp-specialist | godot-csharp-specialist |
| Cross-language boundary and system allocation | godot-specialist when relevant | godot-specialist when relevant | godot-specialist |
| .gdshader/VisualShader/materials | godot-shader-specialist | godot-shader-specialist | godot-shader-specialist |
| UI Control/CanvasLayer | godot-specialist | godot-specialist | godot-specialist |
| .tscn/.tres/scene/level | godot-specialist | godot-specialist | godot-specialist |
| .gdextension/native C++ bindings | godot-gdextension-specialist only when involved | same | same |

GDScript review includes code quality, signal architecture, static typing and
idioms. C# review includes delegates/attributes, .csproj and Godot C# idioms.
Both routing must include both language specialists and .csproj, not just the
primary GDScript row. Prefer signals at the cross-language boundary; settled
ownership still belongs to the project's architecture decisions.

Machine routing: primary godot-specialist; code GDScript specialist for GDScript
or Both, C# specialist for C#; shader godot-shader-specialist; UI godot-specialist;
additional GDExtension for single language, C# plus GDExtension for Both.
Capability availability is reported separately from the declared routing intent.
