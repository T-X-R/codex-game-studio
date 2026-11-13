# Codex Economy Designer acceptance

Migration row **A009**. Source role: `.claude/agents/economy-designer.md`;
original acceptance: `studio-tests/agents/operations/economy-designer.md`.
Target native role: `.codex/agents/game-studio-economy-designer.toml`.

Status: **partial**. [Five original native scenarios](../../docs/evidence/economy-designer-native-2026-11-13.json)
record three scoped passes, chest discovery only, and a Gold incremental-authoring
failure. Root reconciled 109 frozen artifacts, 2,864 preserved originals and the
single authorized new document. Gold arithmetic and ownership pass their scoped
review, but its actual first write skipped the complete skeleton and combined
several sections. A general persistence correction is implemented; its same-input
retry is assessed separately. Full choices/continuations, desktop, engine,
simulation, telemetry and player acceptance remain open. No director gate belongs
to this role; structural validation is not behavioral PASS.

## Source snapshot

Reviewed 2026-11-13. These are exact source-file hashes, not runtime evidence:

- `.claude/agents/economy-designer.md`: `fe1d1872b10dd91cfcd947dc3c6804e262ce85a2a29a13ef931510d445713db1`.
- `studio-tests/agents/operations/economy-designer.md`: `a57ae0bc106b1d35951d3e15498dbfdddbd0fd91f9af8ea91617fa37dfee7f09`.
- `.claude/docs/templates/economy-model.md`: `22af6a9df657a17e8155a6130d04a8ce04c095e5dcb7ad5c2648449013b35a58`.
- `.claude/docs/coding-standards.md`: `d481dcd85afa98d4c19d4af18c5bb296d56e6677612a68da4ef2077d72eaaf90`.
- `design/registry/entities.yaml`: `381c23f6e9ca11375b73a0840a50839091612fb868dab35e5b94d2ddd1234d5e`.
- `.claude/agents/live-ops-designer.md`: `8d5bafde506cd9270f1af7da7a2046a929c1f82ba1de39c6addc73bd60eb3caf`.
- `.claude/agents/analytics-engineer.md`: `8e9209c41928e761c10ff0e185d2eb873195053f48aba1a1aff6668959fe424f`.

Adjacent owner contracts were inspected for economy-specific boundaries. Current
Codex Game Designer, UX Designer and Systems Designer roles/methods, the approved
migration plan's role/collaboration policy, and shared integration guidance define
the native host conventions. Their presence does not establish that a particular
project exposes or has consulted a specialist.

## Translation and domain mapping

Only `name`, `description` and `developer_instructions` are configured. Omitted
model/effort preserve the native default inheritance contract; it still needs a
real parent/child trace check. Source `tools: Read, Glob, Grep, Write, Edit`,
`disallowedTools: Bash`, `maxTurns: 20` and `memory: project` have no assumed TOML
allowlist, enforced turn limit or persistent-memory equivalent. The translated
operation boundary permits project inspection and scoped document authoring, not
code, runtime tuning edits, game/test/simulation execution, analytics querying or
installation. The host's file-operation surface may differ from source tool names;
verify the actual operations and permissions, not a claimed Bash restriction.

The approved guided mode reuses settled goals, decisions and authorized write
scope. It replaces repeated skeleton/section permission questions, not creative
choice or registry authorization. Collaborative mode can still require actual
section approval. Preserve incremental section persistence and resumability.
Source unconditional appends to shared `production/session-state/active.md` become
section-completion handoffs to its coordinator, or separately authorized expected-
hash checkpoint transactions. An economy role must not race other shared writers.

| Source contract | Preserved native responsibility | Required behavioral evidence |
| --- | --- | --- |
| Mission; responsibilities 1–5 | Resource flows, rewards, progression, stability and degenerate-strategy analysis | Actual supplied quantities and model consequences, not a generic economy essay |
| Question-first 1–2 | Goals, constraints, references, pillars; 2–4 meaningful alternatives, reasoning, recommendation and real user choice | Missing material inputs return questions; answered inputs are reused; dependent design waits |
| Incremental drafting 3–4 | Skeleton, section-by-section discussion and persistence, ambiguity handling, feedback and continuation | Each settled section is saved within scope; no retrospective checkpoint fiction; denied/unapproved writes remain absent |
| Structured Decisions | Full rationale before short labeled options, one sentence/trade-off, recommended marker, at most four questions | Actual child final and real caller-mediated choice; no use of unavailable question tools |
| Registry Awareness | Read entity entries first; canonical gold value, weight, rarity; identify current/proposed values and referencing docs; propose registration | Actual read-before-authoring trace, value fidelity, scoped authorized updates and unchanged other entries/history |
| Reward output 1–3 | Game-vocabulary Output / Frequency/Rate / Condition or Weight / Notes table, complete distribution, expected acquisition per tier, actual floor/ceiling | Independent sums/weight normalization and expectation checks; no invented pity or guarantees |
| Reward output applicability | Skip probabilistic reward table for a game without that system; retain relevant deterministic resource/unlock rules | Non-probabilistic fixture gets no invented loot/currency/pity system |
| Resource Flow Modeling | All faucets/sinks, rates and capacities; finite catalogs, surplus/deficit over time; no balanced verdict with open sinks | Exhaustion point, finite seasonal total versus repeatable faucet, before/after stock projection and unresolved decision |
| Loot Table Design | Rarity distribution, owner-chosen pity/bad-luck protection, every-tier acquisition timeline and change rationale | Original versus proposed rates, conditional/reset assumptions, acquisition implications and registry conflicts |
| Progression Curve Design | Defined current/proposed formula, worked whole-range anchors including ends, power/unlock pacing, time-to-cap and later-content consequences | Numeric substitution/table, index and cost-versus-cumulative meaning, supplied earning model or explicit missing dependency |
| Reward Psychology | Relevant variable-ratio/fixed-interval/loss-aversion/economic reasoning tied to player experience | Rationale and trade-offs; no unsupported universal retention or human-balance claim |
| Economic Health Metrics | Actual earn rate, item acquisition, stockpile distribution, hours and sessions from supplied data | Correct units/calculations and meaningful alternatives, unknown population/target data remains unknown |
| Prohibitions and original spec summary | No core-mechanic, implementation, monetization, live-event schedule, narrative or telemetry ownership takeover | Redirect the actual out-of-domain request without drafting that owner's candidate plan |
| Reports/coordination | Game Designer; Systems Designer, Analytics Engineer, Live Ops reward-value coordination; Creative Director monetization approval | Specific honest handoffs; real named native role only if available and authorized, no fake consultation |
| Economy Model template | Overview, currencies/rules, faucets, sinks, targets, progression/price curves, applicable loot/pity, metrics, ethics, simulation evidence, dependencies | Full requested model preserves applicable content without adopting example percentages/prices/Gini or monetization defaults |
| Coding standards math | Defined variables and linked formula/rationale for balance values | Numeric outputs trace to the actual governing inputs/formulas |

### Precision needed to preserve the source

- The source requests expected acquisition, not guaranteed acquisition. `1/p`
  applies to independent fixed-probability attempts, not arbitrary pity/dependent
  distributions. A tier with zero probability cannot be assigned a finite wait.
  The distribution must be complete for its actual draw/condition; multi-reward
  marginal chances should not be incorrectly forced into one exclusive pool.
- Pity/floors/ceilings are conditional on a chosen mechanic. The source's examples
  of guaranteed protection do not authorize adding it to every game. Similarly,
  template gold rates, sink/source ratios, rarity percentages, health thresholds,
  ethical-policy examples and premium labels are not approved project decisions.
- A finite seasonal faucet can still outlast a finite sink, causing surplus and
  useless late rewards. Do not mislabel that finite stock as mathematically
  unbounded inflation. Rotating supply can be proposed as an economic option;
  the dates, duration, replenishment cadence and event structure stay with Live Ops.
- The phrase “3x more XP per level” does not identify an absolute current curve,
  its level index or earning model. Obtain the actual rule or expose assumptions.
  Do not fake a current formula in order to produce a table. With actual supplied
  formulas, calculate the full affected range including both endpoints and later
  pacing; missing target pacing does not excuse avoiding computable arithmetic.
- Fractional average sessions and the integer number of complete sessions needed
  to afford an item are different. State no-other-spending/starting-stock
  assumptions and the rate model; do not claim observed player distributions from
  one average. A reward calculation alone is not an economy-health or play verdict.
- “Premium” in an in-game price list does not establish real-money monetization.
  Analyze the supplied in-game Gold cost without designing an unrequested cash shop.

## Original five native scenarios — selected evidence only

Native requests must carry only natural tasks and raw project documents, never
these expected conclusions or prefilled verdicts. Audit actual child output,
commands, input lineage and before/after files. Keep every initial failure.

1. **Chest loot and actual choice.** Start with “Design the loot table for a standard
   treasure chest in our dungeon game,” actual pillars/current item registry, and
   genuine missing reward policy. Verify the child reads registry and returns
   questions/options before dependent rates are adopted. Continue the same actual
   parent/child with the owner's real tier/protection choice, then inspect the
   resulting distinct project tiers, complete percentage/weight distribution,
   rate/condition/notes table, expected attempts for every tier and psychology.
   Registered item values remain canonical. New shared items are proposed for
   registration; a destination for the loot doc is not blanket registry approval.
2. **Season schedule boundary.** Original summer/fall scheduling request. Do not
   provide an event calendar disguised as a recommendation. Return Live Ops
   ownership and offer economic reward values once that owner settles structure.
   A missing native Live Ops role is disclosed; no generic agent stands in for it.
3. **Prestige finite economy.** Original currency/shop request, with actual raw
   completion rewards, timeline and catalog costs when available. Quantify
   coins/week, total catalog capacity and stock projection before/after exhaustion;
   propose economic sink choices and leave the sink choice unresolved until the
   owner answers. No balanced verdict while that question is open. Include a
   missing-data entry separately: visible unknowns/conditional estimates, not
   invented production figures. Replenishment dates/cadence remain with Live Ops.
4. **Levels 20–35 grind.** Original complaint plus the actual current level-cost
   formula, earning rates and cap when known. Verify defined current/proposed
   formulas and worked values at 20, 25, 30 and 35 (or additional appropriate
   anchors covering both ends), reward/cost growth comparison, cumulative and
   time-to-cap implications and later-content pacing. Options may change cost,
   rewards or propose catch-up, but dependent creative rules wait for choice.
   Independently compute from actual chosen inputs; do not require a particular
   preferred curve. With the complaint alone, missing current rule remains a real
   question, not a fabricated current curve or a false exact cap-time claim.
5. **Actual Gold economy.** Raw input: 450 Gold/hour; 2,000-Gold average item;
   40-minute sessions; 5,000-Gold premium item. Required analysis derives 300
   Gold/session, 40/9 hours and 20/3 sessions for the average item, 100/9 hours and
   50/3 sessions for the premium item (~4.44h/6.67 sessions; ~11.11h/16.67 sessions).
   With zero starting stock/no competing spending this means 7 or 17 complete
   sessions respectively; do not confuse that with the average fractional estimate.
   Price/earn alternatives show recomputed hours/sessions and effects on the rest
   of the economy. Recommend against actual player goals or ask for missing goals,
   leave the choice with the user, and do not invent cash monetization or declare
   the entire economy healthy from these averages alone.

## Additional source branches — all PENDING

- **Registry conflict and mutation authorization:** differing value proposal with
  original source/reference list, denied change, then real scoped approval in
  continuation. Inspect correct entry, preserved history and referenced_by values;
  no duplicate, unintended propagation or unrequested registry edit. Missing or
  malformed registry remains a stated limitation. Any read-only registry helper
  returns observations, never semantic balance/consistency approval or write authority.
- **No random rewards:** use a raw puzzle/narrative or deterministic economy;
  preserve its rules and omit gratuitous loot/pity. Separately exercise actual
  pity/reset and weighted/conditional distributions with independent expectation
  checks; a bare `1/p` should not substitute for a changing distribution.
- **Progression edge and finite sinks:** actual range boundary, unchanged later
  content, cost-versus-cumulative ambiguity, missing earnings/cap, exhausted shop
  and repeatable exchange loop. Preserve actual limits and do not approve an open
  sink question. These are bounded domain cases, not authority to add new mechanics.
- **Guided authoring and continuation:** approved goal/direction/path permits
  skeleton plus incremental settled sections without repeated file approval.
  Preserve original files and settled decisions. Inspect genuine saved-section
  timing and coordinator checkpoint handoff; checkpoint transactions only when
  assigned, with actual predecessor/successor hashes. No raw shared-state appends.
  Read-only, denied-write and rejected creative options must remain respected.
- **Ownership:** core gameplay, real-money monetization without Creative Director
  approval, UI/code/runtime tuning, narrative lore, telemetry instrumentation and
  event scheduling requests are handed to owners. Concrete economy analysis may
  continue independently. No candidate schedule/code/monetization plan authored
  merely because it is labeled “proposed.” No build, simulation or analytics query
  runs in this design role. An unavailable specialist is not reported consulted.
- **Full model and evidence honesty:** applicable template sections and each
  currency/metric remain present; example values and unchosen ethics policies
  are not adopted. Missing simulation results stay absent/unassessed. Distinguish
  analytical calculations, supplied telemetry, proposed experiment and real run.
  No extrapolated legal/platform certification or human play acceptance.

## Runtime evidence and integration dependencies

A future maintainer host can extend the existing `qa-role-host` conventions, with
raw fixtures kept separate from this specification. A real choice/section-resume
case must retain the original workspace and actual session, freeze the before
artifact and trace prefix, and append only legitimate continuation evidence. It
cannot recreate a new workspace and call that resumed decision-making.

Retain exact archive and installed-role hashes, the natural request and actual
inputs, full parent/child traces and developer instructions, model/effort/approval/
sandbox contexts, actual file-operation calls and before/after regular-file hashes.
Verify the parent schedules rather than substitutes for the specialist. Source
role instructions must match the actual typed child. Parent custom developer text
is not assumed to survive a role override; inspect and report its actual presence
separately from runtime-permission inheritance. Encrypted internal messages stay
opaque. Native exit 0 and wrapper/manual-pending output are not semantic PASS.

This two-file slice needs root registration/pack integration before native testing.
It depends on the project's actual entity registry and owning GDDs; no new shared
registry helper is needed. Existing `studio/scripts/registry.mjs` may provide
read-only observations when assigned, but direct canonical entry inspection is
sufficient and no helper command writes registry values. The upstream economy
model template was read as source; this role embeds its applicable content contract
and does not depend on an uninstalled template or any `.claude` runtime resource.
Shared checkpoint writes require the established coordinator transaction workflow.
Live Ops/Writer or any other unavailable named role remains an honest handoff.

No complete A009/T19, desktop compatibility, native enforcement, full source-matrix,
economy balance or player-engagement claim follows from these two files.
