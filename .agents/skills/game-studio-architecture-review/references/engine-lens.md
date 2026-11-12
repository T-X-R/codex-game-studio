# Local engine lens

Apply after the engine audit, with the actual pinned references and ADR decisions.
This is a source-preserved in-conversation lens, not a delegated specialist review.
API/version facts must come from VERSION.md, breaking/deprecated/current-practice
references and only the module documents selected from actual ADR fields by
[the engine-input rule](inputs-and-freshness.md). This lens does not expand that
read set; no named module means read none. Mark uncovered facts unverified; practice
prompts below are review questions, not evidence that every listed pattern is
universally forbidden or that a suggested replacement fits this project.

## Godot

Check node suitability: per-frame position changes on RigidBody versus CharacterBody
or AnimatableBody; physics/RayCast for pure overlap versus Area; many identical mesh
nodes versus MultiMeshInstance; Timer per entity; Node where RefCounted/Resource
fits. Check event-driven work versus needless every-frame work and physics logic
placement between _process/_physics_process. Inspect distant get_node coupling,
signals/groups/exported references and call-down/signal-up boundaries. Check
Autoloads with scene dependencies or competing game-state owners; data hard-coded
instead of Resource/.tres; path references vulnerable to renames versus supported
UIDs; short-lived projectile/enemy churn and pooling rationale.

## Unity

Check Find/FindObjectOfType/SendMessage wiring, GetComponent in Update, runtime
Resources.Load versus justified Addressables, hard prefab references and build
loading. Inspect hot-path allocations/frequent spawns without pooling rationale,
legacy input or built-in pipeline choices for a new project, UI owning state,
DontDestroyOnLoad scene patterns and unsupported initialization-order assumptions.
For thousands of MonoBehaviours assess the case for the choice versus DOTS; do not
mandate a framework change without project evidence.

## Unreal

Check unnecessary actor ticks, repeated spawn/destroy without pooling rationale,
string work versus FName, direct stats changes where the project uses GAS,
Gameplay Effects/Attribute Sets, and boolean state versus Gameplay Tags. Inspect
hard-loading references versus soft references/Asset Manager; oversized Blueprint
logic versus appropriate C++; raw UObject pointers without UPROPERTY; unsupported
network authority and excessive replication.

## Web (lead-programmer perspective)

Check feasibility in the stated language/framework and whether interfaces require
inventing unstated contracts. Inspect global mutable state/singletons, hard-coded
tuning, needless per-frame work and frame-loop allocation. For numeric cost claims
cite actual entity counts and frame budget, quantify the gap when evidence permits,
and name an alternative that fits; missing measurements remain unverified.

## Output

Use `Engine Specialist Findings` for source report compatibility, followed by
`Local engine lens; no independent specialist invoked`. For each finding name
ADR, evidence/practice rationale, uncertainty and impact. Preserve disagreement
with the first audit instead of silently replacing it with a confident conclusion.
