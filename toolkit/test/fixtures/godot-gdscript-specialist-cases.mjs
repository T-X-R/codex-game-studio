// Synthetic raw game materials; acceptance expectations are only in PLAN.md.
// Reuses the already retained source-faithful engine-reference snapshot.
import references from './godot-specialist-reference-inputs.json' with { type: 'json' };
const role = 'game-studio-godot-gdscript-specialist';
const config = version => `schema_version: 1
project:
  name: Harbor Relay
engine:
  name: Godot
  version: "${version}"
  language: GDScript
  code_root: src
  test_root: tests
modes:
  automation: guided
  rigor: standard
`;
const basic = {
  ...references,
  'project.yaml': config('4.7'),
  'project.godot': `config_version=5

[application]
config/name="Harbor Relay"

[rendering]
renderer/rendering_method="gl_compatibility"
`,
  'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.7\n**Language**: GDScript\n',
  'design/game-brief.md': `# Harbor Relay
Synthetic project material for a single-player 3D cargo workshop prototype.
Cargo markers and rooms are existing prototype concepts. The team uses GDScript;
no C#/.NET runtime or native extension has been adopted. This task does not change
mechanics, targets, engine version, architecture or tooling policy. No editor
version capture, runtime test result or performance measurement is supplied.
`,
  'docs/owner-notes.md': '# Owner notes\nPreserve the existing harbor labels, room scene and project configuration.\n',
  'assets/harbor-labels.json': '{"revision":1,"labels":["workshop","storage"]}\n',
  'src/cargo_marker.gd': `class_name CargoMarker
extends Node3D

var elapsed_time: float = 0.0

func advance_tick(delta: float) -> void:
    elapsed_time += delta
`,
  'scenes/rooms/workshop.tscn': '[gd_scene format=3]\n\n[node name="Workshop" type="Node3D"]\n',
};
const boundary = ' No further agents, engine/editor/game/test execution, dependency installation, commits, publication, gate acceptance or checkpoint writes. Return the actual artifact or findings and unresolved decisions to the caller.';
function scenario(originalRequest, inputs, output = null, assignment = '') {
  return {
    role,
    roleIntroduction: 'You are the GDScript Specialist for a Godot 4 project.',
    behaviorSpec: 'studio-tests/roles/godot-gdscript-specialist-codex.md',
    engine: 'godot',
    inheritHostSettings: true,
    readOnly: output === null,
    expectedFiles: output ? [output] : [],
    allowedNewFile: path => output !== null && path === output,
    originalRequest,
    inputs: { ...basic, ...inputs },
    request: `${originalRequest} ${assignment} ${output ? `The goal and the design interfaces are settled. Write the new implementation only to ${output}; this authorizes that file and its missing parent directories. Preserve every existing file, including the source material and configuration. The artifact is for review before later engine validation and project integration.` : 'This is read-only; do not change or add project files.'}${boundary}`,
  };
}
export const godotGDScriptScenarios = {
  'gdscript-type-review': scenario('Review this GDScript file for type annotation coverage.', {
    'src/harbor_counter.gd': `class_name HarborCounter
extends Node

signal count_changed(value: int)

@export var label_text: String = "harbor"
var speed = 5.0
var count: int = 0
var labels = ["dock", "shed"]

func set_speed(value):
    speed = value

func increment(amount: int):
    var next_count = count + amount
    count = next_count
    count_changed.emit(count)

func label_at(index):
    return labels[index]

func current_speed() -> float:
    return speed
`,
    'design/systems/harbor-counter.md': `# Harbor counter interface
This existing script stores a floating-point speed, an integer count and a list
of display label strings. set_speed accepts a floating-point value and changes
state only. increment takes an integer delta and changes state only. label_at
takes a valid integer index and returns its display string. current_speed returns
the current floating-point speed. Behavior and labels remain as currently written.
The request is a source review, not approval to revise behavior or save a rewrite.
`,
  }, null, 'The file to review is src/harbor_counter.gd; design/systems/harbor-counter.md describes its existing interface.'),
  'gdscript-shader-redirect': scenario('Write a vertex shader to distort the mesh in world space.', {
    'design/systems/cargo-visual.md': `# Cargo visual request
A cargo mesh is intended to ripple while the workshop alarm is active. The visual
spec is not yet approved: displacement amplitude, motion timing and material
ownership are still undecided. The existing game has no shader source or tested
shader integration for this effect. No implementation or material changes are
authorized by this read-only consultation.
`,
  }, null, 'Read design/systems/cargo-visual.md for the current request context.'),
  'gdscript-async-room-load': scenario('Load a scene asynchronously and wait for it to finish before spawning it.', {
    'design/systems/room-loading.md': `# Approved room-loader interface
The new RoomLoader is a child Node owned by the workshop session. Its public
operation is load_room(scene_path, destination). scene_path is a Godot resource
path string; destination is a live Node whose responsibility is owning the loaded
room instance. A successful operation adds one room instance as a child of that
destination and emits room_ready with that instance. Failure emits room_failed
with the requested path and a human-readable reason, without creating a child.

The session calls at most one operation at a time; request queuing, retries,
progress UI and scene replacement are outside this component. The session may
end and free the loader or destination while waiting. In that situation do not
insert a room into an unrelated scene or persist unfinished session state. The
component has no autoload, file-write or package-install responsibility.

The existing room asset is res://scenes/rooms/workshop.tscn. This is an interface
and lifecycle contract, not a supplied implementation or runtime result. The
source artifact is approved for review; engine execution is a later assignment.
`,
  }, 'src/room_loader.gd', 'Implement the agreed interface in design/systems/room-loading.md using the supplied workshop scene and project references.'),
  'gdscript-typed-entity-loop': scenario('The entity update loop is slow; it iterates an untyped Array of 1,000 nodes every frame.', {
    'src/entity_update_original.gd': `extends Node

var markers = []

func add_marker(marker):
    markers.append(marker)

func _physics_process(delta):
    for marker in markers:
        marker.advance_tick(delta)
`,
    'design/systems/entity-update.md': `# Entity-update source replacement proposal
The existing loop is src/entity_update_original.gd. All registered objects are
CargoMarker nodes, defined in src/cargo_marker.gd. Session ownership keeps each
registered marker alive until the loop itself is removed. add_marker appends one
marker; each physics callback invokes advance_tick once on every registered
marker in insertion order with the same delta. Retain these semantics.

The owner reports sluggishness with 1,000 active markers but has not supplied a
profiler trace, frame-time capture or allocation measurement. No language or
native-extension adoption is approved. The authorized deliverable is a separately
named replacement proposal, class EntityUpdateTyped, in src/entity_update_typed.gd.
The original source remains for comparison; this task does not change scene
attachments, register both loops, tune gameplay or integrate the replacement.
`,
  }, 'src/entity_update_typed.gd', 'Use src/entity_update_original.gd, src/cargo_marker.gd and the agreed behavioral interface in design/systems/entity-update.md.'),
  'gdscript-abstract-enemy-46': scenario('Create an abstract base class for all enemy types using @abstract.', {
    'project.yaml': config('4.6'),
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.6\n**Language**: GDScript\n',
    'docs/engine-reference/godot/VERSION.md': `# Godot Engine — Project Version Reference

| Field | Value |
| --- | --- |
| **Engine Version** | Godot 4.6 |
| **Installed at pin time** | NOT DETERMINED |
| **Project pin source** | Owner-selected 4.6 project context |
| **Reference coverage warning** | Supplied snapshot records May 2025 as its historical model-coverage floor; later language features require version-specific verification |
| **Documentation observation** | Supplied historical reference snapshot; no fresh verification in this task |

This artifact describes the selected project version. No executable path/version
capture or local compilation result has been provided. The adjacent transition
and current-practice notes contain separately labelled4.5,4.6 and4.7 material.
No claim is made that a4.7 editor validates this project's selected4.6 target.
`,
    'design/systems/enemy-base.md': `# Approved enemy-base interface
Engine version context provided: Godot 4.6. The owner has selected an abstract
base named BaseEnemy extending Node3D for the existing workshop patrol concept.
Derived enemy types own their behavior; the base supplies no movement, damage,
attack timings, target selection algorithm or default executable implementation.

Every derived type must supply choose_destination(current_position), taking a
Vector3 and returning a Vector3, and begin_turn(turn_index), taking an integer
and returning no value. These two operations are the agreed caller interface.
Do not introduce additional abilities, resources, registration or scene setup.
The deliverable is the base script for review against this selected version;
concrete enemy implementations and actual editor testing are separate work.
`,
  }, 'src/enemies/base_enemy.gd', 'Read design/systems/enemy-base.md and the project-owned version references. Produce the selected-version source artifact; local editor verification is outside this assignment.'),
};
