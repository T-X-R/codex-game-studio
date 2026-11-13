# Codex Godot C# Specialist acceptance

Migration **A013**, confirmed in tasks/migration-inventory.md and the
studio-tests/catalog.yaml target `.codex/agents/game-studio-godot-csharp-specialist.toml`.
Source: `.claude/agents/godot-csharp-specialist.md` from
Donchitos/Claude-Code-Game-Studios. Original behavior specification:
`studio-tests/agents/engine/godot/godot-csharp-specialist.md`.
Source SHA256: `5c12cf49ecdfeefe8cc1316108eb5f58ceb2ec9c2e6df5088f93776867c3c920`.
Original-spec SHA256: `0018533052d4ad5e8d9f52782068dd1e0680893b5776bb6325db000c410959bf`.
Read-input hashes, mapping and independent review are recorded in the
[content evidence](../../docs/evidence/godot-csharp-specialist-content-2026-11-13.json).

Status: **partial; all native cases NOT RUN, .NET build/engine/runtime NOT ASSESSED**.
Content is integrated; archive checks are recorded separately in the evidence.
The C# role authors actual features within its assignment, unlike the engine
architecture parent. No gate or independent technology-adoption power is added.
GDScript ports and GDExtension implementation remain other owners' work.

## Native adaptation and scoped authoring

Only name, description and developer_instructions fields. Source sonnet/tools/
maxTurns20 are not model/effort, sandbox or tool-policy overrides. Verify actual
role identity, full instruction injection and inherited settings in later native
traces; definitions alone do not prove any host behavior. No source Agent tool
was declared; caller-mediated owner handoffs do not require a new agent tree.

Guided mode reuses agreed goals, consequential decisions and edit scope instead
of per-file approval. Collaborative review and read-only requests remain distinct.
Do not invent gameplay decisions or expand dependency/output/network scope to
make a test pass. Ordinary scoped implementation and verification continue;
consequential ambiguity blocks its dependent edits. A proposed C# draft is not an
applied file or an executed test.

Project-owned engine/version references, actual .csproj and inherited properties,
global.json, SDK, .NET-enabled editor and target platform determine compatibility.
The source net8.0/latest example is not a universal rewrite instruction. Missing
editor/SDK/runner remains untested; a stock Godot executable, GDScript parse check,
static analysis or successful empty test run cannot establish C# acceptance.
Source cutoff notes remain historical context, not the current model's cutoff.

## Five original cases — exact requests preserved

Expectations here are maintainer-only. Native prompts receive original requests,
raw project material and genuine authorization, not expected code or verdicts.
Do not fabricate user answers for unresolved health ownership, animation outcome
or thread-target decisions. All original input text below remains unchanged.

### Case 1 — exported setter invariant

> Create an export property for enemy health with validation that clamps it between 1 and 1000.

Expect actual C# with Export, PascalCase property, private underscore backing
field, getter/setter and clamp performed on every setter assignment. An inspector
range alone or one-time _Ready clamp does not satisfy this request. Include the
source-required XML doc comment. The value1–1000 is explicitly supplied; do not
invent unrelated death/recovery/signal behavior. Test below/at/within/above the
limits using the actual available C# runner when authorized, retaining actual
counts. A test definition or missing runner is not a passing test. Proposed code
can be returned without unassigned writes; granted implementation scope should
not collapse into general advice or repeated file-approval prompts.

### Case 2 — GDScript port boundary

> Rewrite this enemy health system in GDScript.

Read the actual C# system and hand its signals/public methods, contracts and file
ownership to game-studio-godot-gdscript-specialist. Explicitly identify that owner;
produce no GDScript body. Missing owner or caller delegation capability is an
honest handoff gap, not permission to impersonate the other specialist. Existing
source is preserved unless a separate C# change is actually assigned.

### Case 3 — await animation with lifecycle and interruption

> Wait for an animation to finish before transitioning game state using C# async.

Produce a testable async Task pattern using
`await ToSignal(animationPlayer, AnimationPlayer.SignalName.AnimationFinished)`.
Caller must be async; async void is only for genuine fire-and-forget event handlers.
No Thread.Sleep or Task.Delay polling substitute. Check IsInstanceValid(this)
after await and before state change, with relevant target validity/cancellation.
Do not assume a Godot SignalAwaiter is automatically a .NET Task.

If interruption/replacement means the signal may never arrive, raise the missing
behavior decision instead of guessing a state transition or timeout duration.
An approved timeout must use GetTree().CreateTimer; no invented success on timeout.
The lifetime check alone does not solve a non-completing wait. Later actual engine
tests must distinguish normal finish, interruption, replacement and freed owner;
code inspection does not establish those runtime results.

### Case 4 — background live-node mutation

> This C# code accesses a Godot Node from a background Task thread to update its position.

Provide the actual live-scene node update and Task code. Flag the race immediately
and provide a concrete CallDeferred, Callable.From(...).CallDeferred or main-thread
queue correction without waiting for permission to identify the problem. Actual
file mutation still follows existing write scope. Explain .NET thread-pool
execution and why C# compilation alone does not enforce Godot's active-scene-tree
rules. Do not approve the race or suppress thread-safety checks.

The source wording overgeneralizes all Node access. Corrected acceptance targets
the active scene tree; documented off-tree construction or specific thread-safe
APIs require their own conditions, not a universal worker ban. Preserve the user's
computation and marshal results/validate target lifetime; do not silently remove
the feature or claim threading correctness from successful compilation.

### Case 5 — Godot4.7 typed signals

Original context: **Engine version context: Godot 4.7.** Request:

> Connect a signal using the new typed signal delegate pattern.

Read actual VERSION/deprecation/transition/current-practice context and verify
the applicable4.4–4.7 signal interface before code. Produce the requested typed
C# += subscription, with Signal delegate EventHandler suffix, generated names
and owned lifecycle cleanup where relevant. Preserve version uncertainty;
compatible-as-documented is not a local4.7 compile or runtime result.

The original expected behavior incorrectly labels all string-based Connect calls
deprecated. For this typed-delegate request, += remains the required idiomatic
form; do not substitute an unnecessary string connection. Separately, advanced
Connect/Disconnect with flags or GDScript signals is officially supported. Do
not ban that legitimate path elsewhere or misread the Godot3 connect signature
as proof every Godot4 C# Connect overload was removed. The official correction
is recorded in the content evidence linked above; the original request itself
is unchanged.

## Remaining complete-source coverage — all pending

| Area | Required behavior/evidence beyond the five requests |
| --- | --- |
| Collaboration | Design read, ambiguity/challenges/deviations; utility versus node, Resource/autoload/config and cross-system questions; architecture/files/data flow; settled guided authoring, collaborative review, read-only preservation |
| Typing/source generation | partial for GodotObject-derived types and real diagnostics; explicit-style versus valid var, nullable configuration/? checks and legitimate lifecycle null!; no warning suppression as repair |
| Naming/order | All public/private/constant/signal/callback/override/file naming; all11 sections including Godot/System/project usings as the first section, then namespace/class/constants/signals/exports/private/lifecycle/public/private/callbacks |
| Exports | Attribute grouping/subgroup/category and PropertyHint.Range; no invented ExportRange; runtime setter invariant, backing default and XML docs; inspector and repeated assignments distinguished |
| Signals | Typed delegates/Variant-compatible arguments, EmitSignal/SignalName; += preferred; valid advanced Callable/MethodName/OneShot/deferred/cross-language Connect; persistent owned cleanup and captured-lambda delegate identity |
| Node access | Typed cached GetNode<T> in _Ready with private references; actual path/ownership, not repeated untyped process lookups or manually invoked lifecycle methods |
| Async/threading | Task versus async void, engine timer/ToSignal, lifetime after awaits, interruption decision, legitimate timeout; live-tree worker race/deferred or queue apply, off-tree/API scope and shared-resource constraints |
| Collections/resources | .NET internal versus Godot exported/interop collections and compatible elements; GlobalClass partial Resource exports, GD.Load<T>, shared-by-default/per-instance Duplicate and nested-resource reality |
| Project/packages | Actual .csproj/SDK/target/editor/global.json; nullable handling; no universal net8/latest rewrite; problem-specific approved NuGet, thread model/UI-loop incompatibility and Allowed Libraries / Addons record |
| Patterns | Simple enum transition exit→assign→enter with same-state guard; complex child states, command/observer when designed; typed autoload access/true-global Instance and documented scope; composition |
| Depth rule | Three project-authored inheritance layers; engine ancestry excluded by explicit migration interpretation, preserving required CharacterBody3D/base behavior |
| Performance | Idle process toggles, double delta/correct float conversion, node cache/StringName/hot LINQ/collections/pooling; actual Godot profiler plus dotnet counters and GC pressure, no invented measurements |
| Languages | C# complex/testable/data/AI, GDScript iteration/level/cutscene/simple behavior as guidance; signals/typed APIs at boundary; >1000 calls/frame AND measured bottleneck before GDExtension consideration |
| Anti-patterns | Source generation, unsafe nulls, timers, untyped lookup, subscription lifetime/captured this, marshalling, static scene nodes, lifecycle calls and actual live-tree worker mutations |
| Version/reference | All four source documents, missing API marked unverified then actual official lookup, installed mismatch, real .NET platform requirements, no historical-date/pin rewrite |
| Scene/resource | Appropriate editor use, format/IDs/unique_id/UID/encoded-cell preservation, existing companions and actual import+scene-open; no assumption all .cs files need .uid |
| Coordination | Godot parent, gameplay, GDScript, native extension, systems design and performance owner; correct API handoff without foreign-language implementation or fake independent review |
| Native effects | Real named role/full injection/settings; public calls and observed temp/output paths, original file effects; opaque dispatch untouched; unavailable fields explicitly unassessed |
| Execution | Actual compatible C# build and selected .NET Godot loading; nonzero test discovery, normal/error paths and failure preservation; build alone not lifecycle/thread/export acceptance |

Source numerical thresholds: three project-authored inheritance layers and
>1000 calls/frame plus measured bottleneck for native escalation. The source
requires GC-pressure profiling but sets no numeric GC ceiling; none is invented.

## Dependencies and evidence limits

At preparation, canonical Godot parent/GDScript/gameplay/systems-designer roles
exist. Native-extension and performance-analyst roles are absent; installed
availability must still be checked and missing owners returned to the caller.
No gate or new mandatory delegation is added. The source specifies four general
Godot references; this checkout has no modules/csharp.md, so no fake dependency
on that path is introduced.

Use actual .NET SDK, compatible Godot.NET.Sdk project, .NET-enabled editor, game
assets and authorized runner for live verification. `dotnet build` is a real
command but may restore packages and write outputs; a named command is not proof
of its execution or blanket authorization to alter dependencies. The GDScript
parse helper does not replace managed compilation/runtime acceptance. No new
helper/public command is required to express this role; native fixtures and
real .NET execution remain later slices.
