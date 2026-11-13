// Synthetic raw project materials; acceptance judgments remain in PLAN.md only.
import references from './godot-specialist-reference-inputs.json' with { type: 'json' };
const role = 'game-studio-godot-gdextension-specialist';
const version = `# Godot Engine — Project Version Reference

| Field | Value |
| --- | --- |
| **Engine Version** | Godot 4.6 |
| **Installed at pin time** | NOT DETERMINED |
| **Project pin source** | Owner-selected Godot4.6 target |
| **Reference provenance** | Adjacent historical snapshot; not a local editor capture |

## Verified-source index retained from the reference snapshot
The historical references cite these official sources. Their inclusion is not a
fresh verification or evidence that a compiler/editor is installed here.
- 4.5 to 4.6 migration: https://docs.godotengine.org/en/stable/tutorials/migrating/upgrading_to_godot_4.6.html
- 4.6 release: https://godotengine.org/releases/4.6/
- Full transition table and source dates: breaking-changes.md

No actual editor path/version, compiler, SDK, checked-out bindings revision or
native binary inspection result has been supplied. The project pin is distinct
from the extension's declared API target and any installed runtime.
`;
const build = `#!/usr/bin/env python
# Existing owner build definition; bindings checkout is not included here.
from SCons.Script import Glob, SConscript

env = SConscript("godot-cpp/SConstruct")
env.Append(CPPPATH=["src", "vendor/include"])
library = env.SharedLibrary(
    target="bin/harbor_physics" + env["suffix"],
    source=Glob("src/*.cpp"),
    SHLIBPREFIX="",
)
Default(library)
`;
const descriptor = minimum => `[configuration]
entry_symbol = "harbor_physics_library_init"
compatibility_minimum = "${minimum}"

[libraries]
windows.debug.x86_64 = "res://gdextension/bin/harbor_physics.windows.template_debug.x86_64.dll"
windows.release.x86_64 = "res://gdextension/bin/harbor_physics.windows.template_release.x86_64.dll"
linux.debug.x86_64 = "res://gdextension/bin/harbor_physics.linux.template_debug.x86_64.so"
linux.release.x86_64 = "res://gdextension/bin/harbor_physics.linux.template_release.x86_64.so"
macos.debug.arm64 = "res://gdextension/bin/harbor_physics.macos.template_debug.arm64.dylib"
macos.release.arm64 = "res://gdextension/bin/harbor_physics.macos.template_release.arm64.dylib"
`;
const modules = branch => `[submodule "gdextension/godot-cpp"]
    path = gdextension/godot-cpp
    url = https://github.com/godotengine/godot-cpp.git
    branch = ${branch}
`;
const library = `#pragma once
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <vector>

namespace harbor_sim {
struct Vec2 {
    double x = 0.0;
    double y = 0.0;
};
struct Body {
    double mass = 1.0;
    Vec2 position;
    Vec2 velocity;
    double angle = 0.0;
    double angular_velocity = 0.0;
};
class World {
public:
    std::int64_t add_body(double mass, Vec2 position, Vec2 velocity,
                         double angle, double angular_velocity) {
        if (!std::isfinite(mass) || mass <= 0.0 || !finite(position)
            || !finite(velocity) || !std::isfinite(angle)
            || !std::isfinite(angular_velocity)) return -1;
        bodies_.push_back(Body{mass, position, velocity, angle, angular_velocity});
        return static_cast<std::int64_t>(bodies_.size() - 1);
    }
    bool apply_impulse(std::int64_t id, Vec2 impulse) {
        if (!valid(id) || !finite(impulse)) return false;
        Body &body = bodies_[static_cast<std::size_t>(id)];
        body.velocity.x += impulse.x / body.mass;
        body.velocity.y += impulse.y / body.mass;
        return true;
    }
    bool step(double seconds) {
        if (!std::isfinite(seconds) || seconds <= 0.0) return false;
        for (Body &body : bodies_) {
            body.velocity.x += gravity_.x * seconds;
            body.velocity.y += gravity_.y * seconds;
            body.position.x += body.velocity.x * seconds;
            body.position.y += body.velocity.y * seconds;
            body.angle += body.angular_velocity * seconds;
        }
        return true;
    }
    bool read_body(std::int64_t id, Body &result) const {
        if (!valid(id)) return false;
        result = bodies_[static_cast<std::size_t>(id)];
        return true;
    }
    std::int64_t body_count() const {
        return static_cast<std::int64_t>(bodies_.size());
    }
    void clear() { bodies_.clear(); }
private:
    static bool finite(Vec2 value) {
        return std::isfinite(value.x) && std::isfinite(value.y);
    }
    bool valid(std::int64_t id) const {
        return id >= 0 && static_cast<std::size_t>(id) < bodies_.size();
    }
    Vec2 gravity_{0.0, 9.8};
    std::vector<Body> bodies_;
};
} // namespace harbor_sim
`;
const api = `# Harbor native boundary contract
The approved wrapper is HarborPhysics, a reference-counted non-scene object.
Each wrapper owns one independent harbor_sim::World. Dropping the last wrapper
reference releases its library state; it must not register an autoload or change
Godot's selected physics engine. Calls are serialized by the main-thread owner.

Public surface agreed for the consumer:
- create_body(mass: float, position: Vector2, velocity: Vector2, angle: float,
  angular_velocity: float) -> int. Delegates to add_body; invalid inputs return -1.
- apply_impulse(body_id: int, impulse: Vector2) -> bool. False for invalid input.
- step(seconds: float) -> bool. False for a nonpositive/nonfinite duration.
- get_body_position(body_id: int) -> Vector2.
- get_body_angle(body_id: int) -> float.
- get_body_count() -> int.
- clear() -> void. Invalidates every previously returned body ID.
The two getters report an invalid ID to the caller as an error and return their
zero value; callers must retain only live IDs. No raw pointer or library Body is
exposed to GDScript. Angles are radians; position/velocity use the supplied
library's two-dimensional simulation coordinates, positive Y downward.

No signals, configurable gravity, collision detection, render synchronization,
continuous spawning, background tasks or Godot body replacement is requested.
The existing library is the authority for numerical behavior. Its vector, count,
error and ownership contracts must survive the binding. This is a declaration
of the owner-approved boundary, not evidence of a loaded or registered class.
`;
const basic = {
  ...references,
  'docs/engine-reference/godot/VERSION.md': version,
  'project.yaml': `schema_version: 1
project:
  name: Harbor Native Lab
engine:
  name: Godot
  version: "4.6"
  language: GDScript
  code_root: src
  test_root: tests
modes:
  automation: guided
  rigor: standard
`,
  'project.godot': `config_version=5

[application]
config/name="Harbor Native Lab"

[rendering]
renderer/rendering_method="gl_compatibility"
`,
  'docs/technical-preferences.md': `# Technical Preferences

**Engine**: Godot 4.6
**Language**: GDScript for scene/game coordination, C++ for the assigned extension
**Targets**: Windows x86_64, Linux x86_64, macOS arm64
**Native build**: Existing SCons project, C++17 library interface, single precision Godot bindings

## Allowed Libraries / Addons
The supplied header-only harbor_sim library and declared godot-cpp binding are
approved. Other libraries, SDK changes and Rust adoption are not assigned.
`,
  'design/game-brief.md': `# Harbor Native Lab
A desktop cargo workshop with an isolated two-dimensional motion simulation.
The owner selected a native wrapper for an existing C++ library. This assignment
does not replace Godot physics, move scene logic native or claim a performance
benefit. No current build log, binary, SDK, target-machine capture or local editor
verification is included. Tools and target availability must be established
separately; target declarations are not proof they are installed.
`,
  'gdextension/SConstruct': build,
  'gdextension/harbor_physics.gdextension': descriptor('4.6'),
  '.gitmodules': modules('4.6'),
  'gdextension/vendor/include/harbor_sim.hpp': library,
  'gdextension/vendor/README.md': `# Supplied harbor_sim source
Original synthetic fixture library, not downloaded or attributed to a third party.
The header is self-contained standard C++17 source with actual method bodies.
It models independent planar rigid bodies under constant gravity: linear motion,
angle/angular velocity, center-of-mass impulse and explicit stepping. It provides
no contact/collision solver. Binding work must expose this supplied scope rather
than inventing more physics or replacing its implementation.

This preparation has not invoked a compiler. The header's standalone syntax and
numerics still require actual compiler/tests in a separately authorized stage.
`,
  'docs/native-api.md': api,
  'docs/native-build-state.md': `# Native build state
The SConstruct and descriptor are existing build declarations. godot-cpp is not
vendored in this fixture; .gitmodules records the desired branch, not an observed
checkout or immutable commit. No submodule fetch, compiler/SDK probe, binary
hash, exported-symbol capture, extension load or method-call result is supplied.
The six descriptor paths are planned build outputs, not files already present.
`,
  'assets/harbor-labels.json': '{"revision":1,"labels":["dock","workshop"]}\n',
  'scenes/workshop.tscn': '[gd_scene format=3]\n\n[node name="Workshop" type="Node3D"]\n',
};
const boundary = ' No additional agents, compiler/linker/build/test/engine/game execution, dependency installation or fetching, commits, publication, gate acceptance or checkpoint writes. Do not change host settings or unassigned project files. Return actual source or findings and unresolved decisions; build, loading and platform verification are separate later work.';
function scenario(originalRequest, inputs, assignment, files = [], editable = []) {
  const readOnly = files.length === 0 && editable.length === 0;
  return {
    role, roleIntroduction: 'You are the GDExtension Specialist for a Godot 4 project.',
    behaviorSpec: 'studio-tests/roles/godot-gdextension-specialist-codex.md',
    engine: 'godot', inheritHostSettings: true, readOnly,
    expectedFiles: files, allowedNewFile: path => files.includes(path),
    expectedChangedFiles: [], allowedChangedFile: path => editable.includes(path),
    originalRequest, inputs: { ...basic, ...inputs },
    request: `${originalRequest} ${assignment} ${readOnly ? 'This is read-only: do not add or change files.' : `The architecture, API and named source scope are approved. Create ${files.join(', ')}. You may edit only ${editable.join(', ')} if required for that binding. Preserve the supplied library, other inputs and project configuration. Missing parent directories for the named new files are authorized.`}${boundary}`,
  };
}
const upgrade = {
  '.gitmodules': modules('4.5'),
  'gdextension/harbor_physics.gdextension': descriptor('4.5'),
  'docs/native-build-state.md': `# Upgrade inventory
Owner reports an existing HarborPhysics extension used with Godot4.5. The target
game is moving to4.6. The retained source declarations are a4.5 godot-cpp branch
and compatibility_minimum4.5. No checked-out binding commit, original binary,
build provenance, compiler/SDK identity or4.6 load result is available here.
Target platforms remain Windows x86_64, Linux x86_64 and macOS arm64, each with
debug and release outputs. The supplied SConstruct is the existing build entry.
Retaining support for4.5 versus adopting new4.6 APIs has not yet been decided;
no dependency or descriptor edits are authorized during this review.
`,
};
export const godotGDExtensionScenarios = {
  'gdextension-physics-binding': scenario('Expose a C++ rigid-body physics simulation library to GDScript via GDExtension.', {},
    'Use the actual supplied library in gdextension/vendor/include/harbor_sim.hpp, docs/native-api.md, existing SConstruct and descriptor. Implement the agreed native boundary and registration.',
    ['gdextension/src/harbor_physics.h', 'gdextension/src/harbor_physics.cpp', 'gdextension/src/register_types.h', 'gdextension/src/register_types.cpp'],
    ['gdextension/SConstruct', 'gdextension/harbor_physics.gdextension']),
  'gdextension-gdscript-redirect': scenario('Write the GDScript that calls the physics simulation from Case 1.', {},
    'The supplied docs/native-api.md is the agreed Case1 boundary and the header supplies its library semantics. This isolated consultation does not claim a previous native run produced or loaded that class.'),
  'gdextension-upgrade-abi': scenario("We're upgrading from Godot 4.5 to 4.6. Will our existing GDExtension still work?", upgrade,
    'Review docs/native-build-state.md, the existing build/descriptor declarations and project-owned engine references.'),
  'gdextension-object-lifecycle': scenario('How should we manage the lifecycle of Godot objects created inside C++ GDExtension code?', {
    'design/native-lifetime-question.md': `# Native debug geometry lifetime
A native debug utility needs a collision-shape node under an existing scene-owned
body and shape data that may also be shared by another debug node. The utility
also constructs a separate temporary preview node; the user may reject the
preview before it is ever attached. Later, the containing scene can be removed.
We need an ownership explanation and concrete C++ examples for these situations.
This is design consultation; no utility implementation file has been approved.
`,
  }, 'Use design/native-lifetime-question.md for the actual attached, shared-resource and rejected-preview situations.'),
  'gdextension-api-transition-46': scenario('Check if any GDExtension APIs changed from 4.5 to 4.6.', upgrade,
    'Engine version context: Godot 4.6 (upgrading from 4.5). Use the existing project references and build inventory for this review.'),
};
