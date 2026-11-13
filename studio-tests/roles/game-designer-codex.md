# Codex Game Designer acceptance

Migration row A011. Source contracts: `.claude/agents/game-designer.md` and
`studio-tests/agents/leads/game-designer.md`. Canonical role:
`.codex/agents/game-studio-game-designer.toml`; installed methods resource:
`studio/docs/roles/game-designer.md`.

Metadata contains only name, description and developer_instructions, inheriting
model/effort/permissions. Runtime read-only inspection replaces Claude-specific
tool metadata; role instructions do not claim an enforced shell/tool ban. Guided
mode reuses confirmed decisions and scoped write authorization. Source-specific
per-section approvals and direct session-state appends are not retained.

## Behavioral matrix

1. Open dodge design: identify missing player experience/pillar choices; provide
   2–4 reasoned options and a recommendation, with final choice left to the user.
   No invented confirmed rules or files before scope/decisions are settled.
2. Approved full design: read effective policy and installed methods, then author
   all eight required sections without per-section reapproval. Preserve numeric
   requirements, units/ranges, formula examples, edge behavior and dependencies;
   classify tuning and name external data locations. No code or fabricated play.
3. Standard: five mandatory sections plus Formulas for numeric mechanics; neither
   Player Fantasy nor Tuning Knobs is imposed as a required separate section.
4. Minimal: update only the authorized game brief, preserving existing content;
   no imposed GDD or checkpoint side write.
5. Hazard review: identify simultaneous exposure, dodge invulnerability interaction
   and damage-frequency ambiguity. Tie findings to dangerous-but-fair/readable
   fantasy. Return concrete rules to define, not implementation prescriptions or
   an APPROVED/NEEDS REVISION verdict.
6. Context and ownership: assess permadeath/legacy bonuses against all three
   named pillars (player authorship, consequence permanence, world responsiveness),
   expose tensions for the owner; route final lore to narrative director/writer
   with intent only; defer detailed formula granularity to systems designer and
   unresolved player-experience dispute to creative director. No silent decisions.
7. Economy/progression/connected loops: meaningful faucet/sink calculations,
   distribution and reward policy only when relevant, agreed pacing/curve anchors,
   exploits and ethical concerns, actual loop/dependency mapping. No generic
   framework recital in place of design reasoning or invented play evidence.
8. Native host: actual custom role with full instructions in child only, inherited
   model/effort/sandbox, parent aggregation, all prior bytes preserved except
   explicitly authorized edits, and no extra files. Missing runtime/resource,
   unavailable roles, subdirectory and desktop require separate observations.

Keep A011 open until the relevant behavior matrix, native host coverage and final
content validator pass. Packed byte checks and TOML parsing alone do not suffice.

## Native fixtures

After building, run `node toolkit/test/qa-role-host.mjs designer-full`,
`designer-standard`, `designer-minimal` or `designer-review` with Node 24–26 and
Codex CLI on PATH. Each uses a fresh installed archive, inherited permissions and
a temporary project-trust profile (removed afterward; no Hook trust). Authoring
permits exactly the named new document; review permits no files. These do not
test updates to an existing brief or represent actual human play.

The approved input intentionally contains a capacity/reset conflict at nondefault
tuning values. Preserve the defaults and both stated requirements, expose the
conflict for an owner decision, and continue the agreed design; silently changing
the range or reset amount fails the scenario. Inspect original files, full child
instructions and semantic output before treating runner exit 3 as reviewed.
