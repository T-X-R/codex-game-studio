# Record engine responsibilities without inventing native roles

Keep source specialist capabilities in the project-owned preferences and file
routing table. Before any actual delegation, check the host's registered native
roles and full role responsibility. The source name maps to
`game-studio-<source-name>` only when that exact native role exists. A prose
routing record neither installs the role nor proves it can be spawned.
Unavailable engine specialists are reported as a capability gap; no generic
agent, lead programmer or director is relabeled as one.

Godot's complete language variants are in [godot-language.md](godot-language.md).

## Unity

Primary/code: unity-specialist. Shader: unity-shader-specialist. UI:
unity-ui-specialist. Additional: unity-dots-specialist and
unity-addressables-specialist.

| Actual work/file | Source owner capability |
|---|---|
| General C# .cs and architecture | unity-specialist |
| .shader/.shadergraph/.mat; Shader Graph/HLSL/URP/HDRP | unity-shader-specialist |
| .uxml/.uss, UI Toolkit, UGUI Canvas prefabs/runtime UI | unity-ui-specialist |
| .unity/.prefab scenes and levels | unity-specialist |
| .dll/native plugins | unity-specialist |
| ECS/Jobs/Burst | unity-dots-specialist |
| Asset loading/memory/content catalogs | unity-addressables-specialist |

## Unreal

Primary/code and general materials: unreal-specialist. Blueprint language:
ue-blueprint-specialist. UI: ue-umg-specialist. Additional: ue-gas-specialist,
ue-blueprint-specialist and ue-replication-specialist.

| Actual work/file | Source owner capability |
|---|---|
| C++ .cpp/.h and general architecture | unreal-specialist |
| .usf/.ush/Material assets | unreal-specialist (no separate shader owner) |
| .umg/Widget Blueprint, UMG/CommonUI/input/style | ue-umg-specialist |
| .umap/.uasset scenes/levels | unreal-specialist |
| .uplugin/native modules | unreal-specialist |
| Blueprint graphs/BP class .uasset and BP/C++ boundary | ue-blueprint-specialist |
| Abilities/attributes/gameplay effects | ue-gas-specialist |
| Replication/RPC/client prediction/netcode | ue-replication-specialist |

A .uasset extension alone does not distinguish a Blueprint from other assets;
use its actual purpose. Preserve the per-file distinction instead of blindly
routing every .uasset identically.

## Web and version awareness

Web has no engine specialist. Source directs code/shader/UI work to the lead
programmer; actual native role is game-studio-lead-programmer if available,
working from the project's own versions and Web reference caveats. Say the
engine-specialist update step is not applicable, not that a specialist gate ran.

For available editor-engine native roles, verify they read the project's
`docs/engine-reference/<engine>/VERSION.md`, check relevant deprecated APIs and
version-transition notes, and verify uncertain APIs against official sources.
Do not insert a dynamic pin into installed role TOMLs or global configuration.
A missing role/version-awareness contract is reported for maintainer migration;
never silently change installer-owned files. This replaces the source's direct
agent-file edits while preserving version-aware implementation responsibility.
No role review or director gate is a setup completion prerequisite invented here.
