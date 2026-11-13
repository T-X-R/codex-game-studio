# $game-studio-create-architecture — Phase 1: System Layer Mapping

> Part of `$game-studio-create-architecture`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 1: System Layer Mapping

Map every system from `systems-index.md` into an architecture layer. The standard
game architecture layers are:

```
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER                         │  ← UI, HUD, menus, VFX, audio
├─────────────────────────────────────────────┤
│  FEATURE LAYER                              │  ← gameplay systems, AI, quests
├─────────────────────────────────────────────┤
│  CORE LAYER                                 │  ← physics, input, combat, movement
├─────────────────────────────────────────────┤
│  FOUNDATION LAYER                           │  ← engine integration, save/load,
│                                             │    scene management, event bus
├─────────────────────────────────────────────┤
│  PLATFORM LAYER                             │  ← OS, hardware, engine API surface
└─────────────────────────────────────────────┘
```

The Platform layer is the engine and OS the game runs on, not code the project
writes. No GDD system goes in it, so it has no epic, stories or control-manifest
rules: a system that wraps a platform or engine API belongs in Foundation.

For each GDD system, ask:
- Which layer does it belong to?
- What are its module boundaries?
- What does it own exclusively? (data, state, behaviour)

Present and settle the layer assignment using the selected decision cadence.
Record the agreed layer map through [persistence](persistence.md), not a direct
active.md write; it goes into the architecture document at Phase 7. At minimal
without an index, identify systems from the approved brief and label inferences.
Do not change agreed system boundaries merely to fit this layer vocabulary.

**Engine awareness check**: For each system assigned to the Core and Foundation
layers, flag if it touches a HIGH or MEDIUM risk engine domain. Show the relevant
engine reference excerpt inline.

---
