# Full-mode independent specialists

Full review requires real independent reviewers. Before delegation, tell the user
that relevant specialists will run in parallel followed by senior synthesis;
lean is the single-session alternative. Do not invent a fixed duration or reduce
the selected mode merely to fit a tool limit. Read the host's actual available
native role types; installed TOML files alone do not prove availability.

Choose every domain present in the already-read GDD, deduplicate roles, and use
these native names with the `game-studio-` prefix:

| Domain | Role suffixes |
| --- | --- |
| Costs, prices, drops, rewards, economy | economy-designer |
| Combat stats, damage, health, DPS | game-designer, systems-designer |
| AI behavior, pathfinding, targeting | ai-programmer |
| Level layout, spawning, waves | level-designer |
| Progression, XP, unlocks | economy-designer, game-designer |
| UI, HUD, menus, player-facing displays | ux-designer, ui-programmer |
| Dialogue, quests, story, lore | narrative-director |
| Animation, feel, timing, juice | gameplay-programmer |
| Multiplayer, synchronization, replication | network-programmer |
| Audio cues or music triggers | audio-director |
| Performance, draw calls, memory | performance-analyst |
| Engine-specific patterns/APIs | configured primary engine specialist |
| Acceptance criteria, test coverage | qa-lead |
| Data schemas/resource structures, formulas, system interactions | systems-designer |
| Any gameplay mechanic or player-facing rule | game-designer |

Godot/Unity/Unreal normally use their respective `*-specialist`; Web uses
`lead-programmer`. Use effective engine/specialist settings and the Primary line
in `docs/technical-preferences.md` as the legacy fallback. Do not invent an engine
choice. Pure UI, audio or lore specs do not automatically require gameplay or
systems designers; domain content controls selection.

Dispatch available relevant specialists concurrently, bounded by actual host
capacity. If capacity requires batches, report that limit; retain independent
contexts and all required roles. Inherit model, reasoning and permissions from
the parent. All reviewers are read-only and return findings, not shared-file
edits, checkpoint writes or scope decisions. Unavailable roles are explicit
missing coverage; no generic substitutes or coordinator impersonation. Preserve
known findings from available reviewers while full coverage remains unassessed.

Each task receives the actual GDD path/content, effective requirements, declared
dependency/context paths and the main structural findings. Ask for adversarial,
specific domain criticism, not validation of a desired verdict. Reviewers read
the full GDD in heading ranges and identify the actual role-method resources they
used. Include those resources with the role definitions in the final receipt
evidence set; an unchanged TOML cannot certify a changed referenced method.
Encourage disagreement and source-linked findings.

- Game Designer: test rules against the actual Player Fantasy and supplied concept/
  brief; identify mechanics undermining the intended feeling without inventing it.
- Systems Designer: substitute declared minimum/maximum inputs into every formula;
  flag negative, infinite, undefined or otherwise degenerate boundary outputs.
- QA Lead: inspect every acceptance criterion; quote untestable wording and propose
  concrete, measurable rewrites without changing approved design intent.

After every available specialist responds, use native
`game-studio-creative-director` for senior synthesis. Provide the GDD, all findings,
disagreements and missing coverage. Ask for the most important issues and exactly
APPROVED, NEEDS REVISION, MAJOR REVISION NEEDED or NOT ASSESSED. This is a direct
senior review, **not a director gate**: no CD-* gate, READY, APPROVE or REJECT
substitution. A missing senior role leaves synthesis unassessed; keep known
blocking findings and do not claim a full approval.

Tag findings by actual source, retain both sides of disagreement for the user's
decision, and distinguish the senior's synthesis from consensus. A senior approval
cannot erase known defects or missing required specialist coverage.
