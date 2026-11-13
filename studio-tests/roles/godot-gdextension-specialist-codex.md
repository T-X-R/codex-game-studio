# Codex Godot GDExtension Specialist acceptance

Migration **A014**, verified in tasks/migration-inventory.md. Source role:
`.claude/agents/godot-gdextension-specialist.md`, upstream
[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios).
Original spec: `studio-tests/agents/engine/godot/godot-gdextension-specialist.md`.
Candidate: `.codex/agents/game-studio-godot-gdextension-specialist.toml`.
Hashes, source coverage and independent reviews are recorded in the
[content evidence](../../docs/evidence/godot-gdextension-specialist-content-2026-11-13.json). Upstream attribution/history are retained; no runtime Claude
path, tool metadata, model pin or private host mechanism is introduced.

Status: **partial; all five native cases NOT RUN; compiler, linker,
engine loading, platform builds and runtime/performance NOT ASSESSED**.

## Native and authorization contract

Only `name`, `description`, `developer_instructions` are emitted. Source sonnet,
maxTurns20 and tools list are not translated to model/effort, sandbox or tool
restrictions. Later native tests must observe real named role selection, complete
instruction injection and actual inherited settings. A static TOML check is not
role-execution evidence. The role has no gate; it implements actual C++/Rust
features within assigned scope, rather than adopting the architecture parent's
no-feature-code boundary.

Guided mode reuses agreed architecture and paths without per-file approval.
Consequential unanswered data/lifetime/API/target choices still block dependent
implementation. Review-only, draft and applied source are distinct. Do not add
libraries, install SDKs, change pins or authorize broader builds to make a fixture
pass. Source examples are not invented project requirements.

## Original five cases — exact user inputs

These are maintainer expectations, never injected into model requests as desired
answers. Fixtures must provide natural raw interfaces/materials and actual write
scope; unresolved choices require actual caller decisions rather than scripted
pretend-user feedback. Preserve each original input verbatim.

### Case 1 — native binding

**Input:** "Expose a C++ rigid-body physics simulation library to GDScript via GDExtension."

Observe a godot-cpp binding using the actual supplied library API and an appropriate
Godot base, GDCLASS, typed `_bind_methods`, and complete registration wiring:
`register_types.cpp`, scene-level initializer, ClassDB class registration, exported
init and matching descriptor entry_symbol. Explain ConfigFile sections/comments,
actual library selection and compatibility target. Missing library signatures,
architecture or lifetime decisions are reported, not fabricated. Author C++ when
scope is settled; do not write GDScript usage. Return a bound-API handoff and a
smoke-test plan for real extension loading plus a GDScript call authored by its
owner/existing harness. Planned tests do not prove the extension loads.

### Case 2 — ownership redirect

**Input:** "Write the GDScript that calls the physics simulation from Case 1."

Do not produce GDScript code. Name game-studio-godot-gdscript-specialist as the
owner and return the bound class/method/signal/property surface, parameter/return
types and ownership. If not installed, report that and hand off through the caller;
do not pretend a generic agent is that specialist. No source edits in a redirect.

### Case 3 — ABI and rebuild

**Input:** "We're upgrading from Godot 4.5 to 4.6. Will our existing GDExtension still work?"

State older API target→newer runtime expectation and not the reverse; this is not
observed loading. Consult the actual4.5→4.6 guide/changelog and bindings. Recommend
rebuilding against the4.6 target API/headers to use its APIs; don't conflate a
newer independently versioned binding release with API target. Give debug/release
commands appropriate to the actual project for every target platform, manifest
minimum reconciliation, then actual4.6 editor/load/method testing before shipping.
A new runtime alone need not raise compatibility_minimum if an older supported
API target is intentionally retained. Do not approve an untested binary or claim
one OS validates the others. Missing tools remain explicitly unassessed.

### Case 4 — lifecycle

**Input:** "How should we manage the lifecycle of Godot objects created inside C++ GDExtension code?"

Demonstrate Godot-specific C++ lifetime management: Ref<T> for reference-counted
resources, memnew()/memdelete() for manually managed objects, no ordinary
new/delete for Godot objects. Explain references held elsewhere and scene-parent
ownership. A concrete example combines a memnew node (e.g. CollisionShape3D)
attached with add_child, its Ref-held shape, and a distinct never-attached node
that must be freed. Do not double-free a tree-owned node or recommend Ref<Node>.
remove_child is not deallocation. A standalone explanatory snippet is not file
write or runtime evidence; ordinary third-party C++ resources keep their own RAII.

### Case 5 — upgrade facts

**Input:** Engine version context: Godot 4.6 (upgrading from 4.5). Request: "Check if any GDExtension APIs changed from 4.5 to 4.6."

Read VERSION.md's verified-source list and the actual4.5→4.6 transition table;
state whether it has GDExtension-specific rows, and consult the official migration
guide/changelog rather than infer no changes from silence. Explain relevant
value-type, renderer and physics changes at the actual native boundary. Keep the
source's Quaternion-default investigation, with the necessary factual correction
in the content evidence: the retained snapshot/spec asserts zero→identity, but official
version-tagged godot-cpp4.5 already initializes identity. Disclose that conflict;
verify the actual binding and constructor rather than require an incorrect answer.
Do not conflate C# default struct initialization with C++/Rust constructors.
Provide the upgrade verification checklist and preserve unknown installed editor.

## Full source coverage beyond the five inputs

All following behavior remains unexecuted, not waived by the selected cases:

- Rust entry point/cdylib, GodotClass/Base/interface, methods/exports/signals;
  Gd reference-counted versus manual lifetime, dynamic borrow and thread limits.
- Approved native library integration, custom nodes/resources/servers, typed data
  boundary and no gratuitous migration of scene/UI/prototype logic.
- SCons/CMake/Cargo integration, actual target ABI/precision/bindings, debug/release
  profiles and all agreed Windows/Linux/macOS/console SDK targets.
- Real `.gdextension` symbol/feature-key/path selection, exportable library
  dependencies, invalid comment/manifest negative, hot reload and cleanup.
- Worker computation/result handoff, active scene-tree access restriction, shared
  resource/binding rules, contiguous/SoA/SIMD/batching and preallocated hot paths.
- Actual native-versus-GDScript profiling at equivalent workloads; >1000 iterations
  per frame is an investigation trigger, never a speedup or migration proof.
- Guided continuation/read-only boundaries, unavailable owner/tool handling,
  context/version conflicts, no unauthorized dependency or temporary-output writes.

## Evidence needed before acceptance

Use the existing real qa-role-host pattern with disjoint temporary projects and
natural raw fixtures, not a simulated reviewer. Record original request/input
hashes, actual installed archive/role, parent/child public calls and final output,
full instruction injection and actual inherited settings. Keep failed attempts,
before/after whole-file evidence and authorized output boundaries. Inspect all
public execution/output paths, not just final cleanup. No new Hook trust.

A native exit0/wrapper3 is only terminal execution awaiting manual review. Judge
semantic behavior, correct owner/task handoff, actual code and source evidence,
not keyword presence. Opaque dispatch fields are not decrypted; missing dispatch
plaintext evidence stays unassessed. Do not infer desktop coverage from CLI runs.

When execution is separately authorized and available, preserve compiler/linker
commands, actual target/editor versions, artifact hashes, engine load/registration,
method-call results, lifecycle/reimport checks and platform coverage separately.
The installed Godot Script parse helper does not validate C++/Rust/native binaries.
No engine execution, build, dependency installation or native fixture was performed
while preparing this candidate. No overall role PASS is claimed.
