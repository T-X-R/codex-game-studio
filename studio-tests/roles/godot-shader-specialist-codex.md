# Codex Godot Shader Specialist acceptance

Migration **A016**, confirmed against tasks/migration-inventory.md. Target:
`.codex/agents/game-studio-godot-shader-specialist.toml`.
Upstream source: `.claude/agents/godot-shader-specialist.md` from
Donchitos/Claude-Code-Game-Studios; original behavior specification:
`studio-tests/agents/engine/godot/godot-shader-specialist.md`.
Source SHA256: `a1dfbad09f249122833d5357b070dbeddc101d8b468cc970b4cf112ffae55917`.
Original-spec SHA256: `94ef53fb3daafc973ac10930401e60abb186198253413db4c262a9b2a9688df4`.
Source mapping, read-input hashes and independent review are recorded in the
[content evidence](../../docs/evidence/godot-shader-specialist-content-2026-11-13.json).

Status: **partial; native cases NOT RUN, engine/rendering checks NOT ASSESSED**.
Content is integrated; archive validation is recorded separately in the evidence.
No role-dispatch, shader compilation or rendered result is implied.
This role authors actual shader/material/VFX/rendering work. It is not the
architecture-only Godot parent role and does not own gameplay or art direction.
No source gate is assigned.

## Host adaptation

Only native name, description and developer_instructions fields are present.
Claude sonnet/maxTurns20/tools metadata does not become a model/effort override,
sandbox policy or simulated tool denylist. The actual child inherits its caller;
identity and settings require real public native evidence. Original source has
no Agent tool/delegation tree: owners are coordinated through the caller, with
honest unavailable-role handoffs and no claimed execution from a named route.

Reuse settled goals, consequential choices and scoped guided authorization.
Collaborative draft review and read-only requests remain distinct. Do not reopen
per-file permission for already authorized source work; do not infer unassigned
writes, renderer switches or visual/gameplay decisions from that authorization.
All generated verification/scratch outputs stay in scope. Code returned as a
qualified draft is not an applied source change or successful engine run.

Project-owned engine/version/renderer and actual installed-editor evidence are
separate. Historical source cutoff/version dates do not describe the current
model's training or prove the user's installation. Apply the project's recorded
transitions and verify missing claims against actual official versioned sources.
A known reference conflict must be exposed rather than silently asserting it.

## Original five cases — exact requests

These are maintainer acceptance expectations, not material to append to native
user requests. Supply natural raw project inputs and genuine allowed edit paths;
leave missing consequential choices unresolved. Never script a fixture reply as
if the user made that choice. Source requests below remain byte-for-byte intact.

### Case 1 — dissolve implementation

> Write a dissolve effect shader for enemy death in Godot.

Supply the real 2D/3D target, material/mesh or sprite, noise input, intended visual
direction and allowed files, or observe the role asking for a material choice
that actually matters. Expect valid Godot shading-language code, using spatial
or canvas_item as appropriate; float dissolve_amount with range0–1, noise sample
and discard below the threshold. Edge emission is optional and must suit the
shader type. Do not accept HLSL or generic GLSL as a material shader. Authoring
must remain available within settled scope; a general review alone is incomplete.

An actual selected-engine shader compile/render is required to claim syntactic
and rendered success. Pair the visual test with a real screenshot in authorized
production/qa/evidence/, including version/renderer/context. If execution or
assets are absent, record pending verification, not a generated-image stand-in.
Do not infer enemy gameplay/death acceptance or GPU timing from a screenshot.

### Case 2 — HLSL intent and genuine compute boundary

> Write an HLSL compute shader for this dissolve effect.

Explain that Godot materials use .gdshader, not HLSL, and supply the equivalent
material approach for the given dissolve intent: noise threshold, discard and
edge emission where appropriate. If actual compute is intended, preserve that
requirement as a separate RenderingDevice path; Compatibility cannot provide
it. Return game-studio-godot-gdextension-specialist and its compute-offloading
assessment task through the caller, marking missing or unknown availability
honestly. This conditional handoff does not authorize dispatch, renderer changes
or implementation. Do not silently turn a confirmed
compute requirement into an unrelated fragment-only implementation or assume
HLSL is Godot's compute format. An unresolved material-versus-compute choice can
block dependent edits without preventing a clearly qualified explanation.

### Case 3 — engine texture API versus shader sampling

> Use `texture()` with a sampler2D to sample the noise texture in the shader.

Observe actual reference reads in order: VERSION.md, breaking-changes.md and
modules/rendering.md before code. Explain the source4.4 distinction and its impact
on the current implementation: Shader set_default_texture_parameter/
get_default_texture_parameter changed engine-side Texture2D argument/return types
to Texture, leaving the requested shading-language sampling unchanged. Use
uniform sampler2D noise_texture and texture(noise_texture, UV); do not invent a
replacement sampling syntax for4.4–4.6. Report unknown installed-editor evidence
without treating verified documentation as a local compile. Actual material
context and write scope determine whether returned code is applied or a draft.

### Case 4 — sample-heavy water LOD modification

> The fragment shader for the water surface has 8 texture samples and is causing GPU bottlenecks on mid-range hardware.

Provide the actual source and intended water appearance/integration. The user
reports a bottleneck; distinguish that report from an independently measured
profile. Treat the eight per-fragment samples as the first cost driver to address.
Produce a scoped code modification for a separate simpler distant-water LOD
material, reducing samples rather than selecting the expensive path with a
per-pixel distance branch. Move suitable UV/scroll work into vertex with varying;
retain mipmaps/filter_linear_mipmap for distant sampling. Explain visual tradeoffs
and preserve gameplay behavior. Unknown LOD distance/owner integration remains a
real decision, not a fabricated setting. Measure improvement only with actual
before/after GPU evidence on the named target; code changes are not measurements.

### Case 5 — Godot4.6 glow context

Original context: **Engine version context: Godot 4.6.** Request:

> Add a bloom/glow post-processing effect to the scene.

Supply the actual4.6 project context and the historical VERSION.md installed-gap
record. Expect the role to identify the documented glow rework, establish which
editor is installed before tuning for4.6, and give WorldEnvironment.Environment
guidance for the actual renderer. State before-tonemapping versus previous after-
tonemapping processing and screen blending; earlier intensity/blend may need
retuning. Do not invent renamed/removed properties absent from the references.
Flag thinly covered version-sensitive claims for verification. A context-qualified
draft can proceed where appropriate; unknown runtime/visual results remain
NOT ASSESSED. Running a different installed version does not prove4.6 behavior.

## Full source contract beyond the five cases — pending

| Contract area | Additional required behavior/evidence |
| --- | --- |
| Collaboration/ownership | Design read, explicit ambiguity, architecture/data-flow tradeoffs; settled guided writes; collaborative draft review; read-only originals; real deviation/failure reports; art direction/gameplay decisions returned to owners |
| Shader coverage | Actual spatial/canvas_item/particles/fog/sky work as relevant; purpose/type/category filenames; one shader/file; includes/macros; uniforms, source_color/range/normal/filter hints, groups, comments and stage-correct varyings |
| Patterns | Dissolve endpoint/edge behavior, inverted-hull culling/extrusion, verified2D outline method, scrolling UV/TIME; shared-resource consumers preserved |
| VisualShader | Artist-friendly graph, VS_Category_Name, Comment/Reroute and reusable subexpressions/custom nodes; conversion has an actual reason and preserves assigned workflow |
| Renderer | Actual configured renderer and target hardware; Forward+/Mobile/Compatibility tradeoffs, light limits, volumetric/GI/post-process support; no implicit renderer conversion or no-compute→no-GPU-particles inference |
| Particles | GPU100+ and CPU<50 source guidelines, custom spawn/velocity/color/size, TRANSFORM/VELOCITY/COLOR/CUSTOM; appropriate amount, lifetime, visibility bounds, distance LOD and actual combined<2ms target measurement |
| Post-process | Environment scene/area configuration; Compositor resources and CompositorEffect authoring, supported renderer, stage data and threading; screen/depth/normal availability, actual2D overlay/3D path |
| Performance | Draw batching/overlay/static geometry and real profiler monitors; samples/precision/divergence/mips/texture loops; transparent overdraw/prepass/order, blur cost, actual target budget versus source reference allocations |
| Budget preservation | Source16.6ms@60fps and8.3ms@120fps; geometry4–6, lighting2–3, shadows2–3, particles/VFX1–2, post1–2, UI<1ms; targets are not measurements and all maxima do not automatically fit |
| Scene/UID | Editor preferred; hand edits retain format and unique resource IDs, drop copied unique_id; never fabricate UID or edit encoded cells; preserve/move companions; actual import plus scene opening |
| Version/API | Missing/contradictory installed editor, historical pin, absent API, rendering transitions4.4–4.7, shader sampling versus engine texture API; actual official verification without fake execution |
| Coordination | Godot parent, art-director, technical-artist, performance-analyst, GDScript parameter control, GDExtension compute and gameplay redirect; exact missing owner/task, no fabricated independent gate |
| Native/host | Real role selected and complete installed instruction injection; inherited model/effort/permissions; inspect public commands, all observed output destinations and file effects; opaque fields remain unassessed |
| Engine/visual | Actual material compile and draw under selected renderer, screenshot provenance, scene loading, visual/target/performance limits; absent GPU or zero tests never PASS |

## Dependencies and acceptance limits

Reuse installed config/resource resolution and project-owned Godot VERSION,
breaking changes and rendering module. Existing reference seeding supplies a
historical snapshot, not current API verification or installation proof. The
role embeds applicable scene rules and does not require runtime access to .claude.

The installed Godot GDScript parse helper loads Script resources and checks
can_instantiate. It is not a .gdshader validator and must not be fed shader files
as a substitute for real shader compilation/rendering. No public shader-check
command or new helper is invented by this slice. Optional compositor GDScript
validation can use the actual script interface when relevant and authorized,
but still does not establish GPU-pass correctness.

At preparation, Godot parent, GDScript specialist, art director and gameplay
programmer canonical roles exist. Technical artist, performance analyst and
GDExtension specialist are absent from the inspected canonical directory. Actual
caller installation must be checked; missing owners remain explicit handoffs.
A real compatible editor, selected rendering backend/GPU, game assets, native
host and output/execution authority remain prerequisites for later acceptance.

Official-source corrections and original-contract mapping are recorded in the
content evidence linked above. They preserve authoring capabilities and measured
performance obligations, while removing unsupported engine generalizations.
No native scenario, renderer/platform combination or human visual acceptance is
claimed by static content validation.
