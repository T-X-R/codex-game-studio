// Raw synthetic project material. Maintainer expectations live only in PLAN.md.
import references from './godot-specialist-reference-inputs.json' with { type: 'json' };
const role = 'game-studio-godot-csharp-specialist';
const basic = {
  ...references,
  'project.yaml': `schema_version: 1
project:
  name: Harbor Relay Managed
engine:
  name: Godot
  version: "4.7"
  language: C#
  code_root: src
  test_root: tests
modes:
  automation: guided
  rigor: standard
`,
  'project.godot': `config_version=5

[application]
config/name="Harbor Relay Managed"
config/features=PackedStringArray("4.7", "C#", "GL Compatibility")

[dotnet]
project/assembly_name="HarborRelay"

[rendering]
renderer/rendering_method="gl_compatibility"
`,
  'HarborRelay.csproj': `<Project Sdk="Godot.NET.Sdk/4.7.0">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <EnableDynamicLoading>true</EnableDynamicLoading>
  </PropertyGroup>
</Project>
`,
  'Directory.Build.props': `<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <LangVersion>12.0</LangVersion>
  </PropertyGroup>
</Project>
`,
  'docs/technical-preferences.md': `# Technical Preferences

**Engine**: Godot 4.7
**Language**: C#
**Target**: Desktop

## Allowed Libraries / Addons
Godot.NET.Sdk is declared in HarborRelay.csproj. No additional NuGet libraries
have been adopted. There is no global.json or supplied package-restore result.
`,
  'design/game-brief.md': `# Harbor Relay Managed
A desktop 3D cargo workshop prototype with C# gameplay components. The team has
selected Godot 4.7. The csproj and Directory.Build.props are existing owner
configuration, not evidence of a successful restore, compatible local SDK or
.NET-enabled editor execution. No installed managed-editor capture, test runner,
build log, runtime observation or performance measurement is supplied.
`,
  'docs/owner-notes.md': '# Owner notes\nPreserve existing labels, room scene, project settings and unassigned source.\n',
  'assets/harbor-labels.json': '{"revision":1,"labels":["dock","workshop"]}\n',
  'scenes/workshop.tscn': '[gd_scene format=3]\n\n[node name="Workshop" type="Node3D"]\n',
};
const boundary = ' No additional agents, engine/editor/game execution, .NET build/restore/test execution, dependency installation, commits, publication, gate acceptance or checkpoint writes. Do not alter project or host settings. Return actual changes or findings and unresolved decisions; managed build and runtime verification are a later assignment.';
function scenario(originalRequest, inputs, assignment, files = [], changes = []) {
  const readOnly = files.length === 0 && changes.length === 0;
  return {
    role,
    roleIntroduction: 'You are the Godot C# Specialist for a Godot 4 project.',
    behaviorSpec: 'studio-tests/roles/godot-csharp-specialist-codex.md',
    engine: 'godot', inheritHostSettings: true, readOnly,
    expectedFiles: files,
    allowedNewFile: path => files.includes(path),
    expectedChangedFiles: changes,
    allowedChangedFile: path => changes.includes(path),
    originalRequest,
    inputs: { ...basic, ...inputs },
    request: `${originalRequest} ${assignment} ${readOnly ? 'This is a read-only consultation; do not add or change any project files.' : `The assigned implementation and named file scope are approved. ${files.length ? `Create only ${files.join(', ')} and its missing parent directories. ` : ''}${changes.length ? `Edit only the existing ${changes.join(', ')}. ` : ''}Preserve every other existing file. This is source authoring for review before later project integration and managed validation.`}${boundary}`,
  };
}
const healthSystem = `using Godot;

public partial class EnemyHealth : Node
{
    [Signal] public delegate void HealthChangedEventHandler(int health);
    [Signal] public delegate void DepletedEventHandler();

    private int _health = 100;

    public int Health => _health;

    public void ApplyDamage(int amount)
    {
        if (amount <= 0 || _health == 0) return;
        _health = Mathf.Max(0, _health - amount);
        EmitSignal(SignalName.HealthChanged, _health);
        if (_health == 0) EmitSignal(SignalName.Depleted);
    }

    public void RestoreFull()
    {
        _health = 100;
        EmitSignal(SignalName.HealthChanged, _health);
    }
}
`;
export const godotCSharpScenarios = {
  'csharp-export-health': scenario('Create an export property for enemy health with validation that clamps it between 1 and 1000.', {
    'src/EnemyHealth.cs': `using Godot;

public partial class EnemyHealth : Node
{
    public int Health { get; set; } = 100;
}
`,
    'design/systems/enemy-health.md': `# Enemy-health tuning field
EnemyHealth is an existing child Node of an enemy. Health is an integer property,
initially 100. Designers need to edit it in the inspector, and gameplay systems
can assign it repeatedly through the same public property. The allowed value
interval is 1 through 1000, inclusive. This field is a tuning value; current-hit
points, damage, death, regeneration and signals are not assigned in this change.
Keep the node class and public property identity. The existing source file is the
approved implementation destination. Tests/build are not configured in this
prototype; propose appropriate verification separately rather than installing a
runner or treating inspector appearance as runtime proof.
`,
  }, 'Read design/systems/enemy-health.md and implement the requested property in the existing src/EnemyHealth.cs.', [], ['src/EnemyHealth.cs']),
  'csharp-gdscript-redirect': scenario('Rewrite this enemy health system in GDScript.', {
    'src/EnemyHealth.cs': healthSystem,
    'design/systems/enemy-health.md': `# Current enemy health system
src/EnemyHealth.cs is the existing system. Other components call ApplyDamage and
RestoreFull, read Health and listen to its events. The owner is evaluating a
language port and has not assigned a destination GDScript file or approved scene
rewiring. Preserve current health/damage/restoration behavior in any handoff.
No C# change is requested during this consultation.
`,
  }, 'The system is src/EnemyHealth.cs; design/systems/enemy-health.md describes its consumers.'),
  'csharp-animation-await': scenario('Wait for an animation to finish before transitioning game state using C# async.', {
    'src/WorkshopState.cs': `using Godot;

public partial class WorkshopState : Node
{
    public enum Phase { Preparing, Active }
    public Phase CurrentPhase { get; private set; } = Phase.Preparing;

    public void BeginActivePhase()
    {
        CurrentPhase = Phase.Active;
    }
}
`,
    'design/systems/workshop-intro.md': `# Workshop introduction
The workshop has a non-looping intro animation, played by its local
AnimationPlayer. Only normal completion of that intro permits the existing
WorkshopState.BeginActivePhase operation. A new coordinator, owned by the same
scene, would connect this timing to the state system. Callers need to know when
that operation has finished; no fire-and-forget public interface is agreed.

The player can leave the workshop, skip, or replace the animation while it is
playing. The product owner has not decided whether skip/replacement cancels,
waits for another event or enters a different state, nor set a timeout policy.
No one has approved guessing those outcomes. The owner wants a C# proposal and
the outstanding behavior questions before assigning an implementation file.
`,
  }, 'Use design/systems/workshop-intro.md and src/WorkshopState.cs for the actual normal-completion contract and unresolved scope.'),
  'csharp-background-node': scenario('This C# code accesses a Godot Node from a background Task thread to update its position.', {
    'src/WorkerMovement.cs': `using Godot;
using System.Threading.Tasks;

public partial class WorkerMovement : Node
{
    private Node3D _cargo = null!;

    public override void _Ready()
    {
        _cargo = GetNode<Node3D>("../Cargo");
    }

    public void RequestMove(Vector3 requestedPosition)
    {
        Vector3 origin = _cargo.Position;
        _ = Task.Run(() =>
        {
            Vector3 result = ComputeMove(origin, requestedPosition);
            _cargo.Position = result;
        });
    }

    private static Vector3 ComputeMove(Vector3 origin, Vector3 requestedPosition)
    {
        Vector3 movement = requestedPosition - origin;
        return origin + movement.LimitLength(3.0f);
    }
}
`,
    'scenes/movement.tscn': `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://src/WorkerMovement.cs" id="1_movement"]

[node name="Movement" type="Node3D"]

[node name="Cargo" type="Node3D" parent="."]

[node name="WorkerMovement" type="Node" parent="."]
script = ExtResource("1_movement")
`,
    'design/systems/cargo-movement.md': `# Cargo movement correction
The current source is src/WorkerMovement.cs, attached in scenes/movement.tscn.
Cargo is an actual child in the live scene, not an off-tree data object.
RequestMove is called from the scene's main-thread input flow; at most one
request is outstanding. It snapshots the current position, computes a target
with displacement limited to 3 local-space units, then applies that target. The public
method returns without waiting. Preserve this computation and public API.

The scene may be closed while the work is pending. Once the scene or target is
removed, a pending result must not mutate a replacement or freed object. The
owner authorizes a correction within WorkerMovement.cs; no new autoload, worker
service, thread-model configuration, package or movement mechanic is approved.
`,
  }, 'Review the supplied live-scene Task code and apply the necessary correction in src/WorkerMovement.cs while preserving design/systems/cargo-movement.md.', [], ['src/WorkerMovement.cs']),
  'csharp-typed-signal-47': scenario('Connect a signal using the new typed signal delegate pattern.', {
    'src/EnemyHealth.cs': healthSystem,
    'scenes/health_panel.tscn': `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://src/EnemyHealth.cs" id="1_health"]

[node name="HealthPanel" type="Node"]

[node name="EnemyHealth" type="Node" parent="."]
unique_name_in_owner = true
script = ExtResource("1_health")

[node name="HealthReadout" type="Label" parent="."]
text = "Health: 100"
`,
    'design/ui/health-readout.md': `# Health readout source proposal
Engine version context: Godot 4.7. The existing EnemyHealth publishes its current
integer health when it changes. The selected consumer is a new Label script
named HealthReadout in src/HealthReadout.cs. It uses the scene's existing uniquely
named EnemyHealth. Display the current value initially and each subsequent value
as Health: followed by one space and the integer. This is display-only; do not
modify the producer, health rules or scene.

The producer can outlive the readout. Once the readout leaves the tree, it must
not keep acting on the producer or retain a subscription to that old scene.
The artifact will be reviewed before attachment to the existing Label in
scenes/health_panel.tscn. No managed-engine run or local editor version observation
has been supplied. Existing reference dates and pin-time notes remain historical.
`,
  }, 'Engine version context: Godot 4.7. Use src/EnemyHealth.cs, scenes/health_panel.tscn and design/ui/health-readout.md to write the agreed C# consumer.', ['src/HealthReadout.cs']),
};
