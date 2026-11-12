# $game-studio-create-architecture — Phase 3: Data Flow

> Part of `$game-studio-create-architecture`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 3: Data Flow

Define how data moves between modules during key game scenarios. Cover at minimum:

1. **Frame update path**: Input → Core systems → State → Rendering
2. **Event/signal path**: How systems communicate without tight coupling
3. **Save/load path**: What state is serialised, which module owns serialisation
4. **Initialisation order**: Which modules must boot before others

Use ASCII sequence diagrams where helpful. For each data flow:
- Name the data being transferred
- Identify the producer and consumer
- State whether this is synchronous call, signal/event, or shared state
- Flag any data flows that cross thread boundaries

Settle each scenario using the selected decision cadence, then checkpoint it
through [persistence](persistence.md); the architecture is written at Phase 7.
If save/load is excluded by the approved game scope, explicitly record that
non-applicability and its source instead of inventing persistence. Unknown
threading/timing remains a decision or evidence gap, not an implicit guarantee.

---
