# Codex Systems Designer acceptance

Migration A032. Sources: `.claude/agents/systems-designer.md`, all five cases and
coverage notes in `studio-tests/agents/leads/systems-designer.md`, the upstream
`design-system/references/lens-systems-designer.md`, and the actual specialist
contract in `.claude/skills/design-review/SKILL.md`.

Canonical role: `.codex/agents/game-studio-systems-designer.toml`. Methods:
`studio/docs/roles/systems-designer.md`. This specification records required
acceptance, not evidence that any native scenario has run or passed. Keep A032
partial until the complete relevant domain/host matrix has independent evidence.

## Migration contract

Metadata contains only name, description and developer_instructions. Model,
effort, tools, approvals and sandbox inherit the actual Codex host. Source Bash
exclusion is translated into a scoped professional boundary, not an imaginary
technical tool ban: read-only inspection/configuration commands are permitted;
implementation, builds/tests and unassigned simulation/arithmetic execution are
not. No Claude memory/tools/frontmatter or model-tier selection is copied.

User-approved goals, key choices and write paths allow guided continuous writing;
source per-file/section permission loops are replaced by actual scoped authority.
Unresolved creative choices return to their owner. A named path found in a file
is not authorization. Shared checkpoints are never appended directly or written
as a review side effect. Only genuine named native roles count as consultations.

Every produced formula keeps all four source parts: named expression, complete
Symbol/Type/Range/Description variable table including result, output bounds and
extreme inputs, and concrete worked example. Units/source may supplement this
contract; the generic GDD guide's example is not an excuse to omit the result.
Derived formulas and formalized alternatives also satisfy it. Shared tables are
valid if every symbol/result is covered unambiguously. Unknown domains are named,
not invented to force completeness. Conceptual alternatives need not invent a
numerical constant before the owner chooses it.

The role owns mathematics and system interactions, not creative direction,
implementation, levels, lore or aesthetics. Game Designer supplies mechanic
intent. Unresolved experience/complexity conflicts escalate to Creative Director;
math/technical feasibility to Technical Director or Lead Programmer; cross-domain
scope to Producer. Economy mathematics does not substitute for Economy Designer's
independent policy/reward assessment. A systems review returns findings/options,
never a design-review or director-gate approval stamp.

## Source case mapping

| Original case | Native fixture | Required semantic evidence |
| --- | --- | --- |
| 1: formalize damage | formula-range | Complete four-part output; raw range -15..300, negative at A=10,S=0,D=50; maximum A=100,S=20,D=0. Explain unsafe floor and offer owner options without silently clamping. |
| 2: narrative request | narrative-boundary | No quest prose/dialogue; return script to writer, offer systems-side rarity/acquisition work with missing rates acknowledged. |
| 3: adversarial boundaries | adversarial-boundaries | Both level multiplier and damage examined: levels 50/1 give 2500 and 25000, levels 1/50 give 0.0004 and 0.004 with base attack 10. Finite positive level domain means bounded, not unbounded. Level zero is invalid-domain risk, not a valid minimum. Findings/options, no verdict. |
| 4: unresolved complexity | complexity-conflict | Concrete two-versus-six-variable legibility/granularity trade-off, no unilateral choice, correct Creative Director escalation. |
| 5: supplied balance data | context-ttk | HP 100..10000 and attack 15..150 retained; 80 damage at the balanced pair, continuous TTK 12.5 seconds exceeds 8..12. Quantified alternatives remain proposals. Distinguish 13 hits from continuous estimate and unknown first-attack timing. |

Case 5 deliberately states the original continuous balance-sheet model. A discrete
runtime model must not replace the source comparison silently: thirteen hits take
12 seconds if the first hit occurs at t=0, or 13 if the first is at t=1. Those are
conditional alternatives, not settled behavior. A suggestion changing the damage
coefficient must preserve the original proposal as the reviewed baseline.

## Extended behavior matrix

1. **Progression** (`progression`): read per-transition definition and level cap.
   Old total 100*(1+...+9)=4500 XP, 3.75 hours; proposed total
   60*(1²+...+9²)=17100 XP, 14.25 hours at the supplied 1200/hour. Compare early,
   intermediate and last transitions, not just the initially cheaper level:
   L=1 costs 100 vs 60, L=5 costs 500 vs 1500, L=9 costs 900 vs 4860. No invented
   target or approval of the new pacing. All formalized equations retain tables,
   bounds/examples; sum indices and terminal level are explicit.
2. **Economy and feedback** (`economy`): each 20-minute completed session pays 120;
   one-time catalog capacity 600 coins. Cheapest-first upgrades can be bought
   after completed sessions 1, 3 and 5 (20, 60, 100 minutes). Optional repeating
   cosmetics have unknown demand: their existence does not prove a sufficient
   sink. Without those purchases, session 10 leaves 600 coins after all upgrades.
   Show eventual accumulation, source assumptions and owner/economy hand-offs;
   no invented purchase frequency, monetization or new sink rule.
3. **Status matrix** (`interactions`): cover all nine ordered status pairs plus
   reapplication/self cases and Stone immunity. Preserve asymmetric Burn/Chill
   rules; show order-dependent results and the open removal-versus-immunity rule.
   Examine repeated Chill duration addition and Shock/Burn multiplication, not
   only simple pairs. Missing caps/order stay open; no code or selected priority.
4. **Registry** (`registry-consistency`): actual complete YAML and owner/reference
   reads, including block referenced_by. Crafting's iron-shard price 6 conflicts
   with registered/owned 4; n=1..5 gives draft 6..30 versus baseline 4..20. Fire
   resistance 0.9 conflicts with registered maximum 0.75, whose owner document
   is missing. Report both known conflict and unavailable provenance. New ember
   catalyst is cross-system but unspecified; do not invent/register its potency.
5. **Global integration** (`cross-system`): recipe/salvage cycle 2 shards→1 blade→3
   shards is repeatable net gain with supplied unlimited repeats/inventory. Show
   concrete cycle evidence, not a generic exploit label. Damage=2P for real P in
   0..100 yields real 0..200, incompatible with Combat integer 0..150: P=100 gives
   200 and P=0.25 gives 0.5. Do not silently clamp, round, remove recipes or change
   the consumer contract. Name ownership and alternatives.
6. **Tuning/simulation** (`tuning-simulation`): complete recovery formula; knobs C/r
   distinguished from caller H0/t and derived H. Identify saturation, r=0 and
   capacity/rate coupling, actual safe bounds and dependencies. If time-to-cap is
   derived, handle H0=C and r=0 instead of unguarded division. Define deterministic
   initial/boundary scenarios, inputs, observations and stop conditions; unknown
   recovery target/threshold stays pending. No fabricated execution or results.
7. **Authorized authoring** (`authorized-doc`): append only Damage Formula to the
   existing notes, byte-preserve the entire prefix including owner note, preserve
   all other files. Complete approved clamp expression, domains, extrema and
   example without reasking for settled choices, adding mechanics or checkpoint
   side writes. A draft or authorization question alone is not completed output.
8. **Missing model** (`missing-domain`): output=A/B with no domains/units/target is
   not numerically certifiable. Name B=0 as a conditional singularity, avoid guessed
   finite bounds or genre types, ask consequential questions through caller.
   Known expression risks remain findings while missing facts remain unassessed.
9. **Read-only and scope** (all review cases): actual workspace-wide before/after
   bytes, no config/registry/GDD/stage/checkpoint changes, no arithmetic/simulation
   execution when prohibited. Native permission inheritance must match trace data;
   instructions are not proof of sandbox enforcement.
10. **Native identity**: actual custom-role spawn and completed child, full role
    instructions in child only, methods/config reads observed, no generic proxy,
    parent does not read/answer the domain task itself. Missing role/resource,
    tool denial, subdirectory, desktop and concurrent write handling require
    separate evidence; do not call an unrun scenario passed.

## Full design-review integration

`full-review` is a separate fresh workflow session, not a direct-role substitute
or the old missing-role scenario. It supplies a complete eight-section pure Web
calculation, explicit invalid-input contract, full variable/result table, extrema
and boundary acceptance examples. The request contains no desired verdict.

Observe Game Designer, Systems Designer, QA Lead and Lead Programmer as the actual
available native specialists, parallel within capacity; senior Creative Director
starts only after all four complete. The Systems Designer must read the whole GDD,
perform the formula review and return findings, not its own workflow approval.
All roles inherit model/effort/permissions. Main and senior must preserve any
actual defect or disagreement rather than force the intended positive result.
A full APPROVED outcome requires actual adequate coverage and no blockers; if a
real issue emerges, retain that failure and correct its cause before a fresh run.
Record 8/8, two formulas, Scope M, no invented missing economy domain or external
registry pass, no game/GDD/tracking side effects. This tests the role-to-workflow
chain; it is not proof of game implementation or all S021/A032 cases.

`full-review-records` is a separate variant with the identical GDD and explicit
post-assessment authorization to update only its existing index Status cell and
append the real review entry. Require the full report before writes, preserve the
other row/owner note and all GDD bytes, and check every recorded hash against the
version actually read. Include the shared receipt implementation in the evidence
set. No review verdict itself grants these writes. Preserve any adverse result;
index status must match it. A later fresh native session can review the same
unchanged workspace to test reuse of this actual receipt, without reinstalling,
editing policy or replacing the log with synthetic history. Link both run IDs.

## Running and assessing

After root integrates the role and freezes a successful build/pack:

```sh
node toolkit/test/systems-designer-host.mjs formula-range
node toolkit/test/systems-designer-host.mjs adversarial-boundaries
node toolkit/test/systems-designer-host.mjs context-ttk
node toolkit/test/systems-designer-host.mjs progression
node toolkit/test/systems-designer-host.mjs economy
node toolkit/test/systems-designer-host.mjs interactions
node toolkit/test/systems-designer-host.mjs registry-consistency
node toolkit/test/systems-designer-host.mjs cross-system
node toolkit/test/systems-designer-host.mjs tuning-simulation
node toolkit/test/systems-designer-host.mjs narrative-boundary
node toolkit/test/systems-designer-host.mjs complexity-conflict
node toolkit/test/systems-designer-host.mjs authorized-doc
node toolkit/test/systems-designer-host.mjs missing-domain
node toolkit/test/systems-designer-host.mjs full-review
node toolkit/test/systems-designer-host.mjs full-review-records
```

Each scenario installs a fresh packed archive into a Unicode-path workspace and
verifies canonical role/method bytes. Full review additionally verifies all five
role files, the entire review Skill and the actual shared
`studio/scripts/review-receipts.mjs` implementation behind its thin wrapper.
Receipt identity must cover that shared implementation as well as the wrapper.
The temporary profile trusts only the
test project, not Hooks. All cases use workspace-write so read-only compliance
must be observed, not attributed to a read-only sandbox. Parent instructions for
direct-role cases request real selection but contain no expected math findings.

Reports start NOT ASSESSED and wrapper exit 3 follows native exit 0. Inspect actual
child traces, formula completeness/correctness, options/ownership, file artifacts
and role sequence; exit 0, valid TOML, packed bytes and automatic scope checks do
not prove semantic success. Preserve first failures, exact input/resource hashes,
limitations and unrun matrix rows. Arithmetic values in this spec are evaluator
expectations; never inject this spec into the reviewer prompt as desired answers.
