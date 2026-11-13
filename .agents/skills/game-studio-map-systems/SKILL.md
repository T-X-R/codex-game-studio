---
name: game-studio-map-systems
description: Decompose an agreed game concept into a systems index with dependencies, priorities and design order, update an existing index, or select its next system for design. Use for systems planning; individual system GDD authoring belongs to its own workflow.
---

# Map the game's systems

Use the game root and its pinned CLI. Read
`node .game-studio/run.cjs config get --json` for effective workflow, review mode,
automation, documentation density, stage and team, including provenance and
warnings. A supplied `--review full|lean|solo` changes only this run. Read failures
are unresolved inputs, not permission to assume settings.

Own `design/gdd/systems-index.md`, not individual GDDs, game code or project stage.
At standard/full this index precedes per-system design; at minimal it is optional
because the brief is sufficient. Honor a voluntary minimal-workflow mapping request
without changing its settings or making an index mandatory for future minimal work.

## Choose the operation and read its context

- No argument / create or update: perform the decomposition below.
- `next`: select the highest-priority undesigned system using the existing index's
  recommended design order. Read [index and handoff](references/index-and-handoff.md);
  do not rebuild the index merely to select a system.
- A system name: find that system in the index and use the same handoff reference.
  A missing or ambiguous match needs clarification; do not create a new system.

Prefer `design/gdd/game-concept.md` at standard/full and `design/game-brief.md` at
minimal. Read relevant sections, any separate `design/gdd/game-pillars.md`, the
existing index and existing system GDDs. If neither concept nor brief exists,
stop with the missing prerequisite and recommend the installed brainstorm Skill;
no enumeration, director review, index or checkpoint is produced. If only the
other tier's document exists, expose the mismatch and use explicit user direction
rather than silently changing the tier or inventing a concept.

For an existing index, summarize observed totals and design progress. If the
requested operation is unclear, offer update systems, design next, or revise
priorities before editing. Reuse an already explicit choice. Preserve existing
identifiers, approved decisions, links, status and user notes; resume rather than
recreate. A file existing does not establish design approval or implementation.

## Establish the decomposition

1. **Enumerate.** Extract explicit systems from the core loop, mechanics, MVP and
   technical constraints. Identify plausible implicit responsibilities such as
   gameplay data, UI feedback and persistence; explain why each is needed and
   label inferred systems. For example, inventory may need item definitions and
   storage UI; combat may need damage, health, hit detection and feedback. These
   are candidates grounded in this game's scope, not a universal feature list.
   Present name, category, brief purpose and explicit/inferred origin; resolve
   missing, unnecessary, combined or split systems with the user.
2. **Map dependencies.** Describe each system's input/output, structural and
   presentation dependencies. Identify Foundation, Core, Feature, Presentation
   and Polish layers; show bottlenecks, leaves and any cycles. Propose actual
   ways to resolve cycles (a shared contract/interface, simultaneous design, or
   changed ownership), without presenting an unresolved cyclic graph as a valid
   sequential order. Present the map for the appropriate review cadence.
3. **Review boundaries.** Read [director reviews](references/reviews.md). In full
   review mode run TD-SYSTEM-BOUNDARY now, after the dependency decision and before
   priority assignment. Lean/solo skip it with the named mode. Resolve REJECT
   before proceeding; concerns or missing evidence retain their distinct status.
4. **Prioritize.** Propose MVP, Vertical Slice, Alpha and Full Vision using the
   concept's milestones. MVP includes the core loop and its necessary foundations;
   complete-area experience follows, then remaining gameplay, then polish/meta.
   Explain technical necessity and the actual player experience/pillar served.
   Keep rationale in discussion/Overview, never add a table column. Surface a
   priority that depends on a later-tier system and agree its resolution.
5. **Review scope.** Apply the same review reference for PR-SCOPE after priorities
   are agreed and before writing. Preserve scope/date decisions with their owner;
   don't convert system counts or design-session estimates into measured capacity.
6. **Order and write.** Respect dependencies first, then milestone priority among
   ready systems. Read [index and handoff](references/index-and-handoff.md) to use
   the fixed template, preserve progress, write within authorization and run the
   post-write CD-SYSTEMS review before claiming the mapping is ready for design.

Keep the enumeration, dependency map and priorities visible for validation.
Collaborative mode pauses for each still-unanswered phase decision and its chosen
write-review cadence. Guided mode reuses agreed choices and asks only for missing
consequential decisions; an authorized new index needs no repeated per-file ask.
Autonomous mode may draft and record assumptions within the agreed goal, but cannot
invent human agreement, accept director risks, or change locked scope. Record
actual decisions and their sources in the index/checkpoint, not a fictional
`log_decision` tool. A dismissed question or no answer supplies no decision.

A requested read-only assessment stays in the response: no index, checkpoint or
post-write review is fabricated. If writing is declined, report BLOCKED for the
write; preserve useful approved decisions for the user's later continuation.
