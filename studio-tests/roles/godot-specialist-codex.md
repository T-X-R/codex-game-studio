# Codex Godot Specialist acceptance

Migration row **A017**, confirmed in tasks/migration-inventory.md. Source role:
`.claude/agents/godot-specialist.md`; original five scenarios:
`studio-tests/agents/engine/godot/godot-specialist.md`. Catalog target:
`.codex/agents/game-studio-godot-specialist.toml`.

Status: **partial; native behavior NOT ASSESSED**. This slice contains
independently reviewed role instructions and source/acceptance mapping. The role
is included in the package and catalog as partial. No gate belongs to this role. Static TOML validation is
not evidence of correct specialist behavior, real delegation or engine execution.

## Source snapshot and native translation

Source SHA256: `05a4bc411c9d9f52fbdb904fdb2905c644c435ecc1f50b8f19a8a934f10e7ae7`.
Original spec SHA256: `6927a15231190b1ec26bc417f14f732fc7c2a60f7f2218257e52e73cd99c00ae`.

Only name, description and developer_instructions are configured. Source model:
inherit becomes omitted model/effort; tools and permissions inherit from the
actual native parent. The source tools list/maxTurns:20 do not become a claimed
host denylist or turn limit. No memory facility, global config or approval override
is added. Native identity/settings still require real parent-child trace evidence.

The approved plan's guided authorization replaces source repeated file approval:
reuse settled goals, consequential decisions and authorized paths. Collaborative
mode can retain draft approval; a direct read-only question never authorizes a
write. Source bounded orchestrated documentation writes become scoped caller
assignments, not blanket permission for source/config edits. Missing consequential
choices pause only dependent work. Source "do the work yourself" fallback is
limited by its explicit no-feature-authoring boundary: analyze within engine role
or hand off; do not implement the language specialist's feature under another name.

Source CLAUDE.md autoload documentation becomes project-owned architecture content
discoverable through active AGENTS.md; installer-owned instructions are preserved.
The original outdated host/tool assumptions and fixed template pin are not runtime
requirements. A missing engine may use an actual project-owned Godot pin as the
source intended; this multi-engine toolkit's bundled historical seed alone cannot
establish that a consumer uses Godot. Recorded cutoff/version examples remain
fixture context, never assertions about the executing model's real cutoff or the
latest/recommended editor. No source engine-reference dates are silently refreshed.

## Complete responsibility mapping

| Original section | Native responsibility / evidence required |
| --- | --- |
| Identity, Collaboration steps1–2 | Read design, specified/ambiguous behavior and challenges; resolve utility-vs-node, data owner, edge case and other-system choices before dependent work |
| Collaboration steps3–4 | Class/scene/file/data-flow proposal, rationale and simplicity/flexibility trade-offs; disclose deviations, actual rule/test failures, caller-mediated questions |
| Collaboration steps5–6/mindset | Effective collaboration and authorized write paths, guided reuse; offer tests/review without fake execution; preserve unrelated work |
| Core responsibilities | Per-feature GDScript/C#/native trade-offs; node/scene review; rendering/physics/memory; settings/autoload/export; templates/platform/store advice |
| Scene/node architecture | Composition, reusable self-contained scene, @onready and no distant hardcoded node paths, single root/responsibility, PackedScene instantiation, shallow trees |
| GDScript standards | Static variable/function/array/signal typing, class_name, ranged/typed exports and grouping, call-down/signal-up, return-value direct calls, await not yield, naming |
| Resource management | Resource subclasses, shared .tres, immediate load versus threaded large-asset load, default _init parameters, stable UIDs; verify exact pinned API |
| Signals | Typed declarations near top, ready/editor connections rather than process, global bus versus local signals, duplicate/one-shot handling; concrete architecture examples without dual raw implementations |
| Performance | Idle process disabling, Tweens, frequently spawned pooling, screen notifier, appropriate MultiMesh, profiler/monitors/Performance; no estimated work presented as actual measurements |
| Autoloads | Truly global audio/save/events, no scene state or convenience dumping, every purpose documented in owned architecture and discoverable active guidance |
| Pitfalls | Distant get_node paths, excess frame loops, queue_free/orphan lifetime leaks, process-time signal connections, @tool editor safety, tree_exited cleanup, typed arrays |
| Reports/Delegation | TD through lead programmer; exact four native Godot language/shader/extension roles only for direct delegation; real availability, full context, independent parallel ownership, wait actual results |
| Escalations/coordination | TD upgrades/addons/new runtime/major choices, LP subsystem conflict; gameplay state/ability patterns, technical art shaders/VFX, profiling analyst, devops exports/CI |
| Prohibitions | No mechanics choice, architecture override, direct feature implementation, unapproved tech adoption or producer scheduling/resources |
| Version Awareness1–4 | Config and real project pin; unknown installed gap; deprecations, relevant transitions, current practices and subsystem docs read before API recommendation; absent API explicitly unverified |
| Foreign-engine concepts | Godot pin maps foreign terms to verified Godot equivalents and delegates authoring; explicit other engine returns wrong-specialist response without translation |
| Search tooling | Actual glob for *.gd, no imaginary gdscript type |
| When Consulted | Autoload/singleton, new scene/node system, language choice, input/Control UI, platform export preset, rendering/physics/memory optimization all remain in scope |

The role adds the already ported parse helper as a validation option, not an
extra requirement to execute engines for every advice request. It retains caller
execution authorization, class-cache import, installed absolute helper path,
0/1/2 semantics and continued reporting after failure. Autoload execution and
other side effects remain possible. No whole-game/C# quality claim follows.

## Original scenarios, unchanged inputs

Raw scenario requests below are copied verbatim. Maintainer expectations must
not enter native task prompts. Use natural project materials carrying the actual
facts; do not fabricate a successful editor run or supply the expected answer.
All five source cases and variants below are **NOT RUN** for this migration.

### Case 1 — pattern guidance

> When should I use signals vs. direct method calls in Godot?

With an actual Godot project pin, expect reasoned choice guidance: decoupled,
one-to-many, event-driven signals; direct calls for owned/tightly-coupled objects,
return values and appropriate hot paths. A child health-component typed event
and a parent-to-owned-child call are examples, not required names. Preserve
call-down/signal-up and self-contained scenes. No raw code implementation for
both paths. Actual authoring goes to the exposed language specialist or an honest
caller handoff. Source coverage asks for a reusable docs/architecture guide:
read-only case must not save it; a distinct named-document authorized continuation
may test actual persistence without reopening settled guided authorization.

### Case 2 — foreign-engine terminology and explicit mismatch

> Write a MonoBehaviour that runs on Start() and subscribes to a UnityEvent.

Use source's project-owned Godot4.7 reference as fixture context, not a forced
current product version. Check config first. Godot or unset engine with that real
pin gets verified _ready/typed signal/ready-time connection mapping and authoring
handoff, not Unity or self-authored Godot code. Separate variant engine.name:
Unity returns wrong-specialist rather than performing the translation. Also test
no config and no Godot pin: missing context must not invent a default engine.

### Case 3 — reference and installed-version gap

> Use the new Godot 4.5 @abstract annotation to define an abstract base class.

Provide actual source VERSION with its recorded knowledge warning and Installed
at pin time NOT DETERMINED, plus source breaking-changes4.4→4.5 record. Observe
real reads before version-qualified advice. Explain the recorded uncertainty,
check the annotation against that reference, and require installed4.5-or-later
evidence before asserting local parsing. Hand off class authoring to GDScript
specialist; missing role cannot be claimed executed. Historical supplied evidence
is not fresh official-source verification; if external checking is unavailable,
retain that limitation. No new model cutoff assertion or silent editor upgrade.

### Case 4 — consequential language choice

> The physics query loop runs every frame for 500 objects. Should we use GDScript or C# for this?

Compare GDScript integration/team familiarity/no build with C# CPU-loop trade-offs,
.NET editor/templates and knowledge cost; consider native GDExtension for extreme
cases with per-platform library cost. Counts alone do not prove bottleneck or
speedups. The user chooses; absent C#/.NET or extension adoption requires actual
TD sign-off. No language switch, package install, implementation or fabricated
profiling. An already approved language choice is reused rather than reopened.

### Case 5 — explicit physics version context

Source input context: **Engine version context provided: Godot 4.6, Jolt as default
physics.** Request:

> Set up a RigidBody3D for the player character.

Read the supplied4.6 context and actual physics module reference. Distinguish its
new-project default from existing project settings; inspect the actual3D physics
engine before assuming Jolt. Carry over applicable documented collision-margin
and unsupported-property warning differences (source example HingeJoint3D damp).
Do not invent RigidBody3D property changes when the supplied reference documents
none, and do not turn a HingeJoint issue into a RigidBody property claim. Provide
architecture/setup guidance and scoped configuration only if authorized; language
feature authoring remains a handoff. Version4.7 transition facts do not silently
apply to this4.6 fixture or prove a particular project's physics behavior.

## Additional source-coverage acceptance still open

- Full criteria above require real scenario review beyond the five originals:
  Resources/default constructors/UIDs; scene ownership; signal leak and @tool
  review; idle/process/performance evidence; autoload and export configuration;
  input/Control UI; platform templates and unavailable store/deployment context.
- Native invocation must prove actual typed role identity, parent permissions and
  model/effort inheritance, context reads and output scope. No decryption of opaque
  dispatch content; unobservable dispatch fields remain NOT ASSESSED.
- Test all four real sub-specialist routes once installed, full input context and
  disjoint writes, actual wait/results; unavailable-role branches can only prove
  honest handoffs. Single-agent analysis is not independent specialist review.
- Test TD/LP escalation, unresolved architecture choice and settled guided document
  write, existing-file preservation and read-only prohibition. Assertions must use
  actual public calls and filesystem evidence, not only final-response promises.
- Authorized existing-script validation may exercise the installed parse helper
  with real engine/import evidence. Preserve failures/no-args/missing helper or
  editor and distinguish static advice from actual script loading. C#/.NET/native
  builds, profiling and platform exports require their actual tools/evidence.
- Desktop and CLI usability, complete native workflow, human interaction/play and
  target-platform behavior remain open. Static checklist coverage is not conformance.

## Dependencies and integration boundary

Available repository capabilities at candidate review: effective config reader,
project-owned engine-reference seeding/preservation, selected Godot execution
metadata and installed studio/scripts/godot-parse-check.gd. Read project-owned
references, not bundled snapshots as proof of current project state. Verify that
the caller's particular installation exposes a capability before using it.

The four native Godot sub-specialists are pending; do not assume their TOML files
or execution exists. TD/LP/gameplay are separately migrated owners; actual native
availability and authorization still matter. Technical artist, performance analyst
and devops remain explicit owner handoffs when missing. No additional helper,
gate resource or public command is required for this two-file role slice.

The isolated candidate review performed no engine-reference refresh, dependency
installation, global host configuration or native run. Integration and package
evidence is tracked separately in docs/implementation-status.md.
