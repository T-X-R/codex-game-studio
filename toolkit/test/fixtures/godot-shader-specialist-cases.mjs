// Synthetic raw project materials. Acceptance judgments stay outside native inputs.
import references from './godot-specialist-reference-inputs.json' with { type: 'json' };
import rendering from './godot-shader-rendering-input.json' with { type: 'json' };
const role = 'game-studio-godot-shader-specialist';
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
const project = renderer => `config_version=5

[application]
config/name="Harbor Relay"

[rendering]
renderer/rendering_method="${renderer}"
`;
const versionContext = version => `# Godot Engine — Project Version Reference

| Field | Value |
| --- | --- |
| **Engine Version** | Godot ${version} |
| **Installed at pin time** | NOT DETERMINED |
| **Project pin source** | Owner's selected ${version} project context |
| **Documentation observation** | Supplied historical reference snapshot; no fresh verification |

The pin is a project choice, not a captured installed-editor result. No editor
executable or version observation has been provided. Other reference files retain
separately labelled earlier and later transitions; their dates are historical.
`;
const noise = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><rect width="8" height="8" fill="#777"/><path d="M0 0h2v2H0zM4 1h3v2H4zM1 5h2v3H1z" fill="#222"/><path d="M2 2h2v2H2zM6 5h2v3H6zM0 3h1v2H0z" fill="#ddd"/><path d="M3 5h2v2H3zM5 3h2v1H5z" fill="#aaa"/></svg>\n`;
const basic = {
  ...references, ...rendering,
  'project.yaml': config('4.7'),
  'project.godot': project('forward_plus'),
  'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.7\n**Language**: GDScript\n**Renderer**: Forward+\n',
  'design/game-brief.md': '# Harbor Relay\nA desktop 3D cargo workshop prototype. Visual work does not alter delivery, collision, combat or water gameplay. The team has not adopted a native extension.\n',
  'docs/owner-notes.md': '# Owner notes\nPreserve cargo rules, scene ownership, existing material consumers and project settings. No editor-version observation, GPU trace or rendered screenshot is supplied.\n',
  'assets/textures/harbor-noise.svg': noise,
  'assets/harbor-labels.json': '{"revision":1,"labels":["dock","workshop"]}\n',
  'src/cargo_marker.gd': 'extends Node3D\n\n@export var station_id: StringName = &"harbor"\n',
};
const deathContext = `# Approved enemy visual brief
The target is an opaque 3D enemy mesh. Its existing steel-blue surface color is
RGBA(0.12, 0.24, 0.32, 1.0), with roughness 0.7. The death animation already owns
progress from 0 (fully visible) to 1 (gone); this assignment must not implement
that animation or change enemy behavior. The grayscale harbor-noise.svg is the
artist-provided material input. Warm orange edge light is optional, not a reason
to enable scene-wide bloom. No transparent fade or geometry deformation is wanted.

The artifact will be reviewed before material binding and engine validation.
The current material and all its consumers must remain unchanged in this step.
`;
const deathInputs = {
  'design/visuals/enemy-death.md': deathContext,
  'materials/enemy_surface.tres': '[gd_resource type="StandardMaterial3D" format=3]\n\n[resource]\nalbedo_color = Color(0.12, 0.24, 0.32, 1)\nroughness = 0.7\n',
  'scenes/enemy_preview.tscn': '[gd_scene load_steps=3 format=3]\n\n[ext_resource type="Material" path="res://materials/enemy_surface.tres" id="1_material"]\n\n[sub_resource type="SphereMesh" id="Sphere_enemy"]\nradius = 0.5\nheight = 1.0\n\n[node name="EnemyPreview" type="MeshInstance3D"]\nmesh = SubResource("Sphere_enemy")\nmaterial_override = ExtResource("1_material")\n',
};
const boundary = ' No further agents, engine/editor/game/test execution, dependency installation, commits, publication, gate acceptance or checkpoint writes. Return actual artifacts or findings and unresolved decisions to the caller.';
function scenario(originalRequest, inputs, assignment, files = [], changes = []) {
  return {
    role, roleIntroduction: 'You are the Godot Shader Specialist for a Godot 4 project.',
    behaviorSpec: 'studio-tests/roles/godot-shader-specialist-codex.md',
    originalRequest, engine: 'godot', inheritHostSettings: true,
    readOnly: files.length === 0 && changes.length === 0,
    expectedFiles: files, expectedChangedFiles: changes,
    allowedNewFile: path => files.includes(path),
    allowedChangedFile: path => changes.includes(path),
    inputs: { ...basic, ...inputs },
    request: `${originalRequest} ${assignment}${boundary}`,
  };
}
const dissolve = 'Write a dissolve effect shader for enemy death in Godot.';
const hlsl = 'Write an HLSL compute shader for this dissolve effect.';
const waterPath = 'shaders/spatial_env_water.gdshader';
const waterSource = `shader_type spatial;
render_mode cull_back;

uniform vec4 water_color : source_color = vec4(0.06, 0.18, 0.24, 1.0);
uniform float roughness : hint_range(0.0, 1.0) = 0.35;
uniform sampler2D wave_noise : filter_linear, repeat_enable;
uniform vec2 scroll_speed = vec2(0.04, 0.015);
uniform float uv_scale : hint_range(0.1, 20.0) = 3.0;

void fragment() {
    vec2 base = UV * uv_scale + TIME * scroll_speed;
    float a = texture(wave_noise, base).r;
    float b = texture(wave_noise, base * 1.3 + vec2(0.13, 0.31)).r;
    float c = texture(wave_noise, base * 1.7 + vec2(0.37, 0.07)).r;
    float d = texture(wave_noise, base * 2.1 + vec2(0.53, 0.23)).r;
    float e = texture(wave_noise, base * 2.7 + vec2(0.11, 0.67)).r;
    float f = texture(wave_noise, base * 3.1 + vec2(0.29, 0.83)).r;
    float g = texture(wave_noise, base * 3.7 + vec2(0.71, 0.43)).r;
    float h = texture(wave_noise, base * 4.3 + vec2(0.89, 0.59)).r;
    float waves = (a + b + c + d + e + f + g + h) * 0.125;
    ALBEDO = water_color.rgb * (0.75 + 0.25 * waves);
    ROUGHNESS = roughness;
}
`;
export const godotShaderScenarios = {
  'shader-dissolve': scenario(dissolve, deathInputs,
    'Read design/visuals/enemy-death.md and the existing preview material. The visual goal is approved. Write the new shader only to shaders/spatial_enemy_dissolve.gdshader, creating its parent directory if needed. Preserve every existing file. This is a source delivery for later binding and rendering validation.',
    ['shaders/spatial_enemy_dissolve.gdshader']),
  'shader-hlsl-material': scenario(hlsl, {
    ...deathInputs,
    'design/visuals/request-context.md': '# Artist request context\nThe artist used the phrase HLSL compute for the visible enemy disappearance in enemy-death.md. The requested output is a mesh material effect; there is no GPU buffer result, data-processing dispatch or reusable output-texture requirement.\n',
  }, 'Read design/visuals/request-context.md and enemy-death.md for the intended deliverable. Its visible effect is approved. Write a new material shader only to shaders/spatial_enemy_dissolve.gdshader; preserve all existing files and return any incompatible tooling request to the caller.',
    ['shaders/spatial_enemy_dissolve.gdshader']),
  'shader-compute-intent': scenario(hlsl, {
    ...deathInputs,
    'project.godot': project('gl_compatibility'),
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.7\n**Language**: GDScript\n**Renderer**: Compatibility\n',
    'design/visuals/request-context.md': '# Compute output requirement\nThis request is for GPU computation that creates a reusable mask texture consumed by several later passes, rather than solely affecting the pixels drawn by the enemy material. The owner has not chosen output format, dimensions, dispatch ownership or a different renderer. Preserve the current desktop Compatibility project. No low-level extension or compute implementation has been approved.\n',
  }, 'Read design/visuals/request-context.md for the actual output requirement. This consultation is read-only; preserve all project files and return missing decisions before implementation.'),
  'shader-texture-api-44': scenario('Use `texture()` with a sampler2D to sample the noise texture in the shader.', {
    'project.yaml': config('4.4'),
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.4\n**Language**: GDScript\n**Renderer**: Forward+\n',
    'docs/engine-reference/godot/VERSION.md': versionContext('4.4'),
    'design/visuals/noise-preview.md': '# Noise preview material\nThe approved diagnostic is an opaque 3D material displaying the existing grayscale harbor-noise.svg across the mesh UVs. It is for artist inspection of that input texture, with no animation, gameplay integration or scene change. No engine-side material parameter script is requested.\n',
  }, 'Read design/visuals/noise-preview.md. Write the new shader only to shaders/spatial_debug_noise.gdshader. The visual purpose is approved; preserve every existing file. Return any local compatibility gap with the source artifact.',
    ['shaders/spatial_debug_noise.gdshader']),
  'shader-water-lod': scenario('The fragment shader for the water surface has 8 texture samples and is causing GPU bottlenecks on mid-range hardware.', {
    [waterPath]: waterSource,
    'materials/water_surface.tres': '[gd_resource type="ShaderMaterial" load_steps=3 format=3]\n\n[ext_resource type="Shader" path="res://shaders/spatial_env_water.gdshader" id="1_water"]\n[ext_resource type="Texture2D" path="res://assets/textures/harbor-noise.svg" id="2_noise"]\n\n[resource]\nshader = ExtResource("1_water")\nshader_parameter/wave_noise = ExtResource("2_noise")\nshader_parameter/roughness = 0.35\n',
    'scenes/water_patch.tscn': '[gd_scene load_steps=3 format=3]\n\n[ext_resource type="Material" path="res://materials/water_surface.tres" id="1_water"]\n\n[sub_resource type="PlaneMesh" id="Plane_water"]\nsize = Vector2(20, 20)\n\n[node name="WaterPatch" type="MeshInstance3D"]\nmesh = SubResource("Plane_water")\nmaterial_override = ExtResource("1_water")\n',
    'design/visuals/water.md': `# Water appearance and current consumer
The current opaque harbor water color, roughness and near-view motion are approved.
materials/water_surface.tres references the existing shader; other scene consumers
share that material. Keep its exported parameter names and meanings compatible.
The art owner accepts less fine surface detail at distant views, while preserving
its color family, flow direction and gameplay. Material selection is owned by
scene integration; no transition distance, selector or target GPU has been chosen.
The user reports a GPU bottleneck on mid-range hardware, but no timing capture,
frame breakdown, before/after image or exact hardware identification is supplied.
No measured speedup or visual equivalence result has been established.
`,
  }, 'Read shaders/spatial_env_water.gdshader, its existing material/scene and design/visuals/water.md. The owner authorizes modifying that existing shader and creating shaders/spatial_env_water_far.gdshader and materials/water_far.tres for review. These are the only allowed source changes; preserve every other existing file, all scene bindings and project settings. Implement the source changes within the approved appearance constraints and return unresolved integration choices. Do not deploy a scene selector or choose transition distances in this step.',
    ['shaders/spatial_env_water_far.gdshader', 'materials/water_far.tres'], [waterPath]),
  'shader-glow-46-unknown': scenario('Add a bloom/glow post-processing effect to the scene.', {
    'project.yaml': config('4.6'),
    'docs/technical-preferences.md': '# Technical Preferences\n\n**Engine**: Godot 4.6\n**Language**: GDScript\n**Renderer**: Forward+\n',
    'docs/engine-reference/godot/VERSION.md': versionContext('4.6'),
    'materials/harbor_environment.tres': '[gd_resource type="Environment" format=3]\n\n[resource]\nbackground_mode = 1\nbackground_color = Color(0.02, 0.03, 0.04, 1)\nglow_enabled = false\n',
    'scenes/harbor_environment.tscn': '[gd_scene load_steps=2 format=3]\n\n[ext_resource type="Environment" path="res://materials/harbor_environment.tres" id="1_environment"]\n\n[node name="HarborLighting" type="WorldEnvironment"]\nenvironment = ExtResource("1_environment")\n',
    'design/visuals/glow-request.md': '# Glow request\nEngine version context: Godot 4.6. The artist wants bright harbor signage to have a subtle glow. The current Environment resource is shared; installed editor version, final intensity and acceptance images have not been provided. No owner answer establishing these choices is available.\n',
  }, 'Read design/visuals/glow-request.md and the current environment resources. This initial consultation is read-only; do not change files. Return configuration guidance and the questions needed before tuning the existing scene.'),
};
