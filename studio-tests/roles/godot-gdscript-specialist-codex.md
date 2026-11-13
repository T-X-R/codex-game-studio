# Codex GDScript Specialist acceptance

Migration **A015**, confirmed in tasks/migration-inventory.md and catalog target
`.codex/agents/game-studio-godot-gdscript-specialist.toml`.
Source: `.claude/agents/godot-gdscript-specialist.md`.
Original: `studio-tests/agents/engine/godot/godot-gdscript-specialist.md`.
Source SHA256: `9c151d5a77d483e85dae2ea37a1c847e63e49741bcd6efb3c16731ac205c88c1`.
Original-spec SHA256: `3b5241333d283085eaf8a79344b2c4f7c0bdf9c14ec25db7e1f9322f32e51dd1`.

Status: **partial; all native cases NOT RUN / NOT ASSESSED**. Source coverage
and TOML checks do not prove runtime decisions or successful engine compilation.
This source role has no gate. It may author actual GDScript features within the
assignment, unlike the parent Godot architecture specialist. The role is included
in the package and catalog as partial. Integration evidence is tracked separately
in docs/implementation-status.md; no native or engine result is implied here.

## Host translation and ownership

Native file contains only name, description and developer_instructions. Source
sonnet pin, Claude tools and maxTurns20 are not native overrides or a claimed
host restriction. Model/effort/permissions inherit; real traces must verify them.
No Agent tool was declared by the source; this translation uses caller-mediated
owner handoffs rather than adding a mandatory delegation tree.

Approved guided authorization replaces repeated per-file permission once goals,
key choices and allowed edits are settled. Collaborative draft review and actual
read-only scope remain distinct. Consequential ambiguity pauses dependent work;
ordinary implementation continues within approval. The source named-new-document
exception does not grant unassigned source/config writes. No auto-trust hooks,
policy lowering, commits or shared checkpoint race is introduced.

Scene-file rules are fully embedded from the source role and matching
`.claude/rules/scene-files.md`; the retained tree is not a runtime dependency.
Reference API facts are read from the game's actual versioned documents. Their
historical cutoff and version examples are fixture context, not the executing
model's actual cutoff or current engine recommendations. Official verification
must be version-matched and actually performed before being reported.

## Complete source mapping

| Source contract | Preserved native behavior / required observation |
| --- | --- |
| Identity/Core1–6 | Actual GDScript authoring/review, mandatory typing, signal/node design, state/command/observer implementation, critical-loop optimization and GDScript2 idioms |
| Collaboration1–3 | Design-first read, ambiguities/challenges, utility/node and data-owner/edge-case/cross-system questions; structure/files/data-flow proposal and trade-offs before consequential change |
| Collaboration4–6/Mindset | Explicit deviations and actual rule/test repair; scoped guided writes; source review-only file:line/issue/fix instead of rewrite; offer tests/review/refactor without inventing execution |
| Static typing | Every variable, parameter/return, arrays and typed @onready reference; no implicit type used as substitute for explicit source standard; unsafe_* warning observation and scoped config change |
| Naming | PascalCase class/enum, snake_case function/variable/past-tense signal, SCREAMING_SNAKE_CASE constants/enum values, underscore private, purpose/type node naming |
| File order | One class_name/file matching snake_case filename; all12 ordered sections class→extends→constant/enum→signal→export→public→private→onready→virtual→public methods→private methods→callbacks |
| Signal architecture | Typed up-signals/down-calls, ready code connections preferred over hidden editor wiring, one-shot flag, listener lifetime cleanup, methods for synchronous request/response |
| Coroutine rules | await not yield, Signal/completion notification, lifetime/cancellation check after await, threaded request/status/frame-yield/retrieve, explicit failed/invalid branch, no more than3 chained awaits |
| Exports | Typed tunables, ranges, groups/subgroups/categories, ready/range validation; values from design rather than inventing behavior |
| State machines | Simple enum+match versus complex child-node states, enter/exit/process/physics_process, machine-owned transitions |
| Resource pattern | Typed Resource definitions rather than structured Dictionary, shared-by-default and per-instance duplicate with intended nested sharing |
| Autoload | Global event/game/save/audio only; no scene-node references, typed actual singleton naming, no god-class dumping |
| Composition | Child components and typed onready; maximum3 inheritance levels after Node; checked has_method/groups duck interfaces |
| Performance/process | Disable/re-enable idle callbacks, physics movement versus visuals/UI, cache calculations and node lookups; StringName/enums, Dictionary hot lookup, pooling, typed arrays |
| Performance/evidence | Built-in profiler/monitors and source>16ms investigation threshold without overriding project budget; >1000calls/frame prompts profile, never a migration verdict |
| GDScript/native boundary | Keep gameplay/state/UI/transitions; measured heavy math/pathfinding/procedural generation/physics query boundary with GDExtension owner; no unsourced move |
| Anti-patterns | Missing types, frame node paths, deep hierarchy, synchronous signals, avoidable strings, structured dictionaries, autoload god class, editor-only wiring, Godot3 yield/string-connect |
| Scene/.tres/.uid | Prefer editor; retain format, all IDs unique, drop copied unique_id, no invented UID, no encoded cells hand edits, companion preserve/move, actual import plus scene open/run after hand edit |
| Version1–4 | Actual pin/installed gap, deprecations/transitions/current practices before API/code, missing API unverified, relevant subsystem docs; variadic/@abstract/Release backtrace warnings |
| Search | Actual *.gd glob, no nonexistent gdscript type |
| Coordination | Godot architecture, gameplay authoring, systems/data, measured profiler; shader/native bindings redirect while script-side shader integration remains owned |

Source examples illustrate standards, not compulsory invented mechanics or class
names in every game. Exact numeric structural thresholds above remain preserved;
performance thresholds are reasons to investigate rather than measured diagnoses.
The role's optional installed parse-check interface adds no universal engine-run
requirement to advice/review. It explicitly checks can_instantiate as well as load:
a deliberate abstract class must not be rewritten to make that predicate pass.
This boundary needs actual abstract/concrete engine evidence in later acceptance;
no claim of a newly tested helper bug or helper change is made by this slice.

## Explicit upstream correction: threaded request ownership

The retained source role lines148–151 forbids load_threaded_get on both FAILED
and INVALID. The earlier Codex role and Case3 expectation preserved that rule;
this is an upstream correction, not a newly introduced migration bug. Keep the
original source and historical failure evidence unchanged.

For actual Godot4.7.2, a no-product ResourceLoader baseline reached LOADED or
FAILED and retained one RefCounted instance without collection; terminal get
removed that residue, with the failed result still null and its load errors
retained. The [fixed-version implementation](https://github.com/godotengine/godot/blob/4.7.2-stable/core/io/resource_loader.cpp#L700-L721)
retains accepted-request ownership; [terminal collection](https://github.com/godotengine/godot/blob/4.7.2-stable/core/io/resource_loader.cpp#L932-L1001)
consumes it. Therefore FAILED collection/discard is distinct from successful
PackedScene instantiation. INVALID/rejected requests do not authorize blind get.
This exception is version-backed; other pins require their actual API evidence.
Cancellation needs cleanup that survives the requester, not a continuation
assumed to run on a freed node. A short-lived internal cleanup object within the
approved component/interface is an ordinary implementation choice, not a missing
owner decision; no existing named owner or renewed permission is required. New
public interfaces, cross-scene persistent services or autoloads need the caller's
design decision unless already authorized. No concrete cleanup algorithm is
mandated. This clarifies authorization, not proven runtime correctness; functional
no-spawn assertions alone do not prove request cleanup.
The revised role still requires fresh native/output and actual-engine acceptance;
this source correction does not turn any earlier artifact or failure into PASS.

## Original five scenarios — exact requests retained

Expectations are maintainer-only. Native prompts contain original requests and
necessary raw project context, not desired verdicts or answer snippets. All five
cases below are pending, including actual user continuation and file permission.

### Case 1 — explicit type coverage, review-only

> Review this GDScript file for type annotation coverage.

Provide an actual raw GDScript file with identifiable missing variable, parameter
and return annotations alongside already typed code. Observe the real file read,
complete line-level findings and concrete corrections (e.g. source example
var speed =5.0→var speed:float=5.0). Include tooling/compiler-path benefits without
invented timing. Original source stays byte-identical: no unrequested rewrite.
Count missed annotations against raw input rather than expected prose matching.

### Case 2 — shader boundary

> Write a vertex shader to distort the mesh in world space.

No Godot shader or GDScript imitation shader output. Explain shader specialist
ownership and hand off honestly if unavailable. Any offered integration stays at
verified script-side material assignment/set_shader_parameter; no shader body.
No new fake native execution or authority to implement GDExtension bindings.

### Case 3 — threaded scene loading

> Load a scene asynchronously and wait for it to finish before spawning it.

Provide actual project language/version, intended scene/parent and allowed write
scope or leave a genuine missing choice for the caller. Expect fully typed
GDScript with ResourceLoader.load_threaded_request and get_status, frame-yield
between polls, is_instance_valid(self) after await before spawn, PackedScene
handling and explicit failure/invalid branches. Apply the version-backed ownership
correction above: accepted owned terminal FAILED is collected/discarded once,
not instantiated; INVALID/rejected submissions never trigger blind retrieval.
On cancellation, observe no late spawn and exact-once terminal cleanup within
the approved component scope when the requester is actually freed, without relying
on that freed node, an in-progress getter or blocking _exit_tree. Preserve load
errors separately from leaked-request residue. No yield
or busy/blocking loop. Source calls for testable code suitable for tests/unit;
actual testing requires the project runner, fixture scenes and authorization.
Missing runner never converts planned code into executed tests.

### Case 4 — immediate typed-array refactor, measured escalation

> The entity update loop is slow; it iterates an untyped Array of 1,000 nodes every frame.

Give the actual loop/type contract where available. Produce the scoped typed
Array[Node] or real specific-element refactor and explain compiler paths; do not
invent a workload result. Proposed refactor may be returned as code without an
unassigned file write. Explain the conditional next handoff: if profiling still
identifies a bottleneck, route the measured hot path through the caller to
game-studio-godot-gdextension-specialist for native-boundary and integration-cost
evaluation, reporting an unavailable owner honestly. This future option can be
explained before measurement; recommending actual native adoption needs profiler
evidence and the project's technology decision approval. 1000nodes alone does not
justify migrating that loop or the codebase, or claiming the specialist ran.

### Case 5 — version-qualified abstract authoring

Source input context: **Engine version context provided: Godot 4.6.** Request:

> Create an abstract base class for all enemy types using @abstract.

Read supplied actual project VERSION, breaking-changes4.4→4.5 and current practices.
Reference material must include its historical feature record and unknown
Installed at pin time. Explain documented4.5+ availability and local version gap;
produce the actual typed abstract class and abstract method form from those docs
when the required domain contract is settled. Do not write bodies for methods
whose documented abstract syntax forbids them, invent an attack mechanic or
report local parsing without compatible installed-editor evidence. A draft can
be explicitly version-qualified while local acceptance remains NOT ASSESSED.
The load+instantiable helper alone cannot certify a deliberately abstract base;
retain actual helper result and use applicable concrete-subclass/compiler evidence
rather than treating abstractness as syntax failure or lowering the requested design.

## Additional complete-contract coverage pending

| Area | Required scenarios/evidence beyond source five |
| --- | --- |
| Authorization | Already settled guided write and verification without per-file reapproval; consequential unresolved design blocks dependent edits; collaborative review; read-only originals retained |
| Review/structure | All variable scopes, inferred versus explicit types, enum/constant/callback names, all12 sections and existing behavior preserved; unsafe_* settings proposed versus authorized change |
| Async | Request-start error, in-progress yielding, success, owned terminal failure collection, INVALID/already-consumed handling, exact-once ownership, destination/requester deletion with surviving cleanup and no late spawn; repeated/shared requests only where supported by the approved interface; no more than3 chained awaits. Actual running project and separate leak/error observations required |
| Patterns | Simple/complex state transitions, command/observer when specified, shared/per-instance resources, typed singleton name collision, component/hierarchy boundaries |
| Performance | Actual profile before native recommendation, idle/process routing, hot lookup/cache/pooling, source threshold versus agreed frame budget; no synthetic measurement pass |
| Scene integrity | Real editor route; permitted hand edit preserves format/IDs, copied unique_id removal, UID absence/new import, companion move, encoded cells refused; actual import+scene load evidence |
| Context | Missing/contradictory/older installed version, exact absent API marked unverified, other configured engine, reference history preserved, real official-source lookup when used |
| Handoffs | GDExtension and shader ownership, parent Godot/LP architecture and design/system decisions, unavailable owner reported; no fabricated independent review |
| Native/host | Actual typed role identity, model/effort/permission inheritance, inputs/public calls/output paths; do not decrypt opaque dispatch; unseen fields stay NOT ASSESSED |
| Runtime | Actual pinned helper/import/logs and source .gd results, deliberate abstract/concrete distinction, zero/missing tests and engine/permission absence; no C#/export/game quality inference |

## Dependencies and integration limits

Project-owned Godot VERSION/deprecated/transitions/current practices must exist
and match the intended project. Canonical engine reference seeding is historical,
not new installed-version proof. The existing installed parse resource and
bounded test command may validate authorized work, but actual Godot/editor/test
runner and relevant engine assets remain environment prerequisites.

A017 Godot parent role is separately integrated; its availability in the caller's
installed runtime must still be observed. Gameplay programmer/systems designer/lead programmer are
separately migrated; availability in this caller's installation must be observed.
Shader/GDExtension/performance specialists remain honest caller handoffs where
missing. No additional helper, gate, public command or source rule migration is
needed to express this two-file language-role slice. A later native fixture/host
slice must prove its behavior; definitions and static checks are not that proof.
