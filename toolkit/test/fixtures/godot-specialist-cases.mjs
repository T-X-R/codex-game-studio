// Raw project material only. Maintainer expectations are in PLAN.md, never in inputs.
import references from './godot-specialist-reference-inputs.json' with { type: 'json' };
const role = 'game-studio-godot-specialist';
const config = (engine = 'Godot', version = '4.7', language = 'GDScript') => `schema_version: 1
project:
  name: Harbor Relay
engine:
  name: ${engine}
  version: "${version}"
  language: ${language}
  code_root: ${engine === 'Unity' ? 'Assets' : 'src'}
  test_root: ${engine === 'Unity' ? 'Assets/Tests' : 'tests'}
modes:
  automation: guided
  rigor: standard
`;
const projectGodot = `config_version=5

[application]
config/name="Harbor Relay"

[rendering]
renderer/rendering_method="gl_compatibility"
`;
const basic = {
  ...references,
  'project.yaml': config(),
  'project.godot': projectGodot,
  'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.7\n**Language**: GDScript\n',
  'design/game-brief.md': `# Harbor Relay
A single-player 3D workshop game about moving cargo through a small harbor.
The current release is desktop. The team uses GDScript and has not adopted C#,
.NET or a native extension. The design and project configuration are existing
owner work; an engine-pattern consultation is not a new platform or gameplay choice.
`,
  'docs/owner-notes.md': '# Owner notes\nKEEP: harbor layout and existing delivery rules.\n',
  'src/workshop_marker.gd': 'extends Node3D\n\n@export var station_id: StringName = &"harbor"\n',
  'assets/cargo-labels.json': '{"labels":["fragile","priority"],"revision":1}\n',
};
const boundary = ' Return the result and unresolved decisions to the caller. No further delegation, editor or game execution, dependency installation, commits, publication, gate acceptance or checkpoint writes.';
function scenario(request, inputs = {}, options = {}) {
  return {
    role,
    roleIntroduction: 'You are the Godot Engine Specialist for a Godot 4 game project.',
    behaviorSpec: 'studio-tests/roles/godot-specialist-codex.md',
    engine: 'godot',
    inheritHostSettings: true,
    readOnly: true,
    expectedFiles: [],
    allowedNewFile: () => false,
    inputs: { ...basic, ...inputs },
    request: `${request} This consultation is read-only; do not change project files.${boundary}`,
    ...options,
  };
}
const signalQuestion = 'When should I use signals vs. direct method calls in Godot?';
const foreignQuestion = 'Write a MonoBehaviour that runs on Start() and subscribes to a UnityEvent.';
export const godotSpecialistScenarios = {
  'godot-specialist-signals-guide': scenario(signalQuestion, {
    'design/systems/workshop-status.md': `# Workshop status context
A Workshop scene owns a Health component and a CargoSlot component as children.
The HUD exists outside this Workshop scene and displays workshop condition.
A delivery interaction needs to know whether its target CargoSlot accepted cargo.
Several optional listeners may react when workshop condition changes; the scene
is also reused in a preview screen without the gameplay HUD.
No communication implementation or project-wide event bus has been chosen.
The requested artifact is a reusable decision guide, not adoption of one option
for every interaction or a new mechanic.
`,
  }, {
    readOnly: false,
    request: `${signalQuestion} Read design/systems/workshop-status.md for the project's context. Please save the reusable pattern guide as docs/architecture/signals-and-calls.md. This authorizes that new document only; preserve all existing source, configuration and other files.${boundary}`,
    expectedFiles: ['docs/architecture/signals-and-calls.md'],
    allowedNewFile: path => path === 'docs/architecture/signals-and-calls.md',
  }),
  'godot-specialist-foreign-concepts': scenario(foreignQuestion),
  'godot-specialist-abstract-version-gap': scenario('Use the new Godot 4.5 @abstract annotation to define an abstract base class.', {
    'design/systems/cargo-actions.md': `# Cargo action model
Load, unload and inspect are the currently planned cargo actions. They share a
lifecycle entry point, but the action base class and inheritance structure have
not yet been authored. The owner is asking for an engine-level consultation.
No installed-editor observation or local parsing result has been supplied.
`,
  }),
  'godot-specialist-language-hot-path': scenario('The physics query loop runs every frame for 500 objects. Should we use GDScript or C# for this?', {
    'docs/performance/query-workload.md': `# Query workload proposal
The design currently requests one nearby-object physics query for each of 500
active cargo markers per physics tick. The target simulation cadence is 60 Hz.
No captured profiler trace, frame-time distribution, query result counts or
allocation measurements have been supplied. The target is a planning requirement,
not measured performance. The team has shipped its prototype in GDScript; nobody
has yet committed to owning a C# build or native extension per target platform.
`,
  }),
  'godot-specialist-physics-46': scenario('Set up a RigidBody3D for the player character.', {
    'project.yaml': config('Godot', '4.6'),
    'project.godot': `${projectGodot}\n[physics]\n3d/physics_engine="GodotPhysics3D"\n`,
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.6\n**Language**: GDScript\n',
    'docs/engine-reference/godot/VERSION.md': `# Godot Engine — Project Version Reference

| Field | Value |
| --- | --- |
| **Engine Version** | Godot 4.6 |
| **Installed at pin time** | NOT DETERMINED |
| **Project pin source** | Owner's selected 4.6 project context |
| **Documentation observation** | Supplied historical reference snapshot; no fresh verification in this consultation |

This project remains on 4.6. The supplied migration and module notes include
separately labelled earlier and later releases. No editor executable/version
capture has been supplied. This record is a project choice, not proof of an
installed editor or successful import.
`,
    'docs/physics-context.md': `# Physics setup context
Engine version context provided by the owner: Godot 4.6, Jolt as default physics
for newly created 3D projects. This is an existing workshop prototype.
The project.godot file is the current project configuration. The player placeholder
has no movement script or collision setup yet. The requested work is a read-only
setup discussion before anyone authors the node script or changes settings.
`,
    'scenes/player.tscn': '[gd_scene format=3]\n\n[node name="Player" type="Node3D"]\n',
  }),
  'godot-specialist-unity-mismatch': scenario(foreignQuestion, {
    'project.yaml': config('Unity', '6000.3.1f1', 'C#'),
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Unity 6000.3.1f1\n**Language**: C#\n',
    'design/game-brief.md': '# Harbor Relay\nThe active project uses Unity and C#. The Godot notes and old prototype marker are retained migration history.\n',
    'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.3.1f1\n',
    'Assets/OwnerMarker.cs': 'public sealed class OwnerMarker { public const int Revision = 1; }\n',
  }, { engine: 'unity' }),
};
