// Raw owner/project inputs; expected findings belong only in the acceptance spec.
const policy = 'schema_version: 1\nengine:\n  name: Web\nmodes:\n  workflow: full\n  review_mode: full\n  automation: guided\n';
const boundary = 'Work offline using the installed role methods. Do not implement game code, execute arithmetic or simulations, run builds/tests, install packages, change policy or stage, save checkpoints, commit or publish. Do not delegate further. Preserve unrelated files.';
const inputs = extra => ({ 'project.yaml': policy, 'production/stage.txt': 'Systems Design\n', 'docs/owner-note.md': '# Owner note\nKeep the assigned system small. Decisions not stated here or in the assignment remain open.\n', ...extra });
const review = (file, content, task) => ({ inputs: inputs({ [file]: content }), request: `Read ${file} and docs/owner-note.md. ${task} Respond only; this assignment is read-only. ${boundary}` });
const formula = '# Combat model\nThe player should predict the consequence of each hit. The design owner has approved the proposed raw expression, but has not selected behavior when it yields negative damage.\ndamage = base_attack * (1 + strength_modifier * 0.1) - defense * 0.5\nInputs are integers: base_attack 10..100 health points, strength_modifier 0..20 dimensionless, defense 0..50 health points. Do not assume integer damage rounding.\n';
const resolvedHit = `# Resolve Hit
## Overview
Resolve one supplied hit as a pure, deterministic calculation. Caller owns event timing, entities, display and persistence. No hidden state.
## Player Fantasy
A stated hit has a predictable consequence; the player can reason about exactly how much health remains.
## Detailed Design
H and D are safe integers in 0..9007199254740991. Invalid, non-finite, fractional, negative and out-of-range inputs return status "invalid-input", no R/L fields and no state change. Valid input returns R and L. Never mutate inputs or external state. No defense, resistance, healing, random factor or immunity exists in this scope.
## Formulas
Remaining health: R = max(0, H - D).
Actual loss: L = H - R.
| Symbol | Type | Range | Description |
|---|---|---|---|
| H | safe integer | 0..9007199254740991 | Supplied health in health points |
| D | safe integer | 0..9007199254740991 | Supplied damage in health points |
| R | safe integer | 0..H | Remaining health in health points |
| L | safe integer | 0..H | Actual loss in health points |
R is clamped at zero, globally 0..9007199254740991: minimum H=0,D=0, maximum H=9007199254740991,D=0. L is bounded 0..9007199254740991: minimum D=0, maximum H=D=9007199254740991. H-D lies in the signed safe-integer range; H-R is 0..H. Inputs outside this range are rejected before arithmetic. H=10,D=3 yields R=7,L=3; H=2,D=5 yields R=0,L=2.
## Edge Cases
Zero health remains zero; zero damage preserves health; overkill clamps R to zero. Identical calls are deterministic and remember nothing. Invalid input has the single result contract above.
## Dependencies
None. Supplied numeric inputs do not make their callers implementation dependencies. This design owns no enemy stats, timing, rendering or storage.
## Tuning Knobs
No internal tunable constants. Callers supply H/D within the specified validation contract and own their gameplay values.
## Acceptance Criteria
- H=10,D=3 returns R=7,L=3 without mutation.
- H=2,D=5 returns R=0,L=2.
- H=0,D=5 returns R=0,L=0; H=10,D=0 returns R=10,L=0.
- Invalid input returns invalid-input status, no R/L fields, no mutation or side effect.
- Valid outputs are nonnegative safe integers, R+L=H and repeated identical inputs return identical results.
- H=9007199254740991,D=1 returns R=9007199254740990,L=1; 9007199254740992 in either input is invalid.
`;
export const systemsDesignerScenarios = {
  'formula-range': review('design/gdd/combat.md', formula, 'Formalize the proposed damage expression for the Formulas section, including its usable domain and any decisions the owner still needs to make.'),
  'narrative-boundary': review('docs/quest-request.md', '# Writer request\nPlease draft dialogue and the quest script for a side quest awarding a rare crafting ingredient. The crafting goal is that the ingredient remains scarce during the first ten sessions. No drop rates, session durations or lore have been approved.\n', 'Handle the writer\'s request within your professional responsibilities and identify any needed hand-off.'),
  'adversarial-boundaries': review('design/gdd/level-damage.md', '# Level Damage\n## Player Fantasy\nProgression matters, while a hit remains comprehensible.\n## Formulas\ndamage = base_attack * level_multiplier\nlevel_multiplier = (player_level / enemy_level)^2\nPlayer and enemy levels are integers 1..50. base_attack is 10 health points for the weapon under review. Damage uses real arithmetic without rounding or clamping.\n## Acceptance Criteria\nShow the damage from a given attacker/defender pair.\n', 'Act as the systems specialist for a design review. Challenge every formula at its boundaries and return concrete findings and options to the review caller.'),
  'complexity-conflict': review('docs/complexity-dispute.md', '# Unresolved design dispute\nThe Game Designer wants two damage variables, attack and defense, for intuitive prediction. The Systems Designer proposed attack, defense, elemental multiplier, resistance, critical multiplier and penetration for distinct tuning control. Neither has agreed. The pillars are readable consequences and expressive builds; both matter. No relative priority between those pillars is settled.\n', 'Explain the trade-off with specific examples and how the unresolved decision should proceed; keep both proposals visible.'),
  'context-ttk': review('design/gdd/ttk.md', '# Damage proposal\nEnemy health spans 100..10000 health points; attack spans 15..150 health points. The balanced matchup uses health 1000 and attack 100, at one attack per second. The current balance sheet uses continuous health/DPS estimates, targeting 8..12 seconds at this matchup. Proposed damage_per_hit = attack * 0.8. Health and attack are integers; damage is not rounded. The runtime first-attack time has not been settled.\n', 'Assess the proposed formula against the supplied balance data and offer quantitatively grounded adjustments without choosing one.'),
  progression: review('design/gdd/progression.md', '# Progression revision\nLevels are integers 1..10. Reaching level 10 ends progression. For transition from level L to L+1, old XP cost is 100*L; proposed cost is 60*L^2, for L=1..9. Start level 1 at zero XP. XP arrives deterministically at 1200 per hour, fractional time allowed; carry all surplus XP across levels. These are per-transition costs, not cumulative thresholds. The owner wants to compare pacing across the whole progression before deciding on the revision.\n', 'Model the curves and their effect on progression pacing and time to cap using the supplied rate; identify which decisions remain open.'),
  economy: review('design/gdd/supply.md', '# Supply economy\nEach completed 20-minute session grants 120 coins; sessions repeat without a cap. Initial coins are zero. A one-time shop contains three permanent upgrades costing 100, 200 and 300 coins, each purchasable once. An optional cosmetic recolor costs 20 coins per purchase and can repeat; no purchase frequency or demand is known. There are no other faucets or sinks. The owner asks whether these rules can keep coins stable indefinitely and when each upgrade becomes affordable if bought cheapest first. No new economic policy has been agreed.\n', 'Analyze resource flows, capacities, affordability and feedback; provide mathematical findings and owner options, not a new economy policy.'),
  interactions: review('design/gdd/status.md', '# Status effects\nBurn, Chill and Shock are the only statuses. Each has a duration supplied by its caller in real seconds 1..10. Reapplying Burn refreshes its duration; reapplying Chill adds durations; reapplying Shock keeps the longer duration. A Burning target hit by Chill loses Burn and gains Chill. A Chilled target hit by Burn keeps Chill and gains Burn. Shock doubles remaining Burn duration on application; no duration cap is stated. Stone enemies are immune to Chill, but currently have no specified handling for the Burn removal step of an incoming Chill. Simultaneous status applications have no stated ordering. Other pairwise combinations coexist unchanged.\n', 'Review the complete interaction matrix, reapplication and simultaneous-event cases. Separate specified outcomes from missing or conflicting rules; do not choose new priority rules.'),
  'registry-consistency': {
    inputs: inputs({
      'design/registry/entities.yaml': 'entities:\n  - name: iron_shard\n    source: design/gdd/mining.md\n    sell_price: 4\n    referenced_by:\n      - design/gdd/crafting.md\n      - design/gdd/market.md\n  - name: fire_resist\n    source: design/gdd/missing-resistance.md\n    maximum: 0.75\n    referenced_by:\n      - design/gdd/crafting.md\n',
      'design/gdd/mining.md': '# Mining\nAn iron shard sells for 4 coins. This system owns that shared price.\n',
      'design/gdd/market.md': '# Market\nReads iron_shard sell_price from the registry; no local override.\n',
      'design/gdd/crafting.md': '# Crafting\nA batch uses n iron shards, integer n 1..5. resale_value = n * 6 coins, with 6 described as the shared iron_shard sell price. A proposed new ember catalyst is consumed by crafting and combat; its potency is not settled. This draft cites maximum fire_resist 0.9.\n',
    }), request: `Review design/gdd/crafting.md and relevant registered cross-system facts before formalizing its formulas. Response only, read-only. ${boundary}`,
  },
  'cross-system': {
    inputs: inputs({
      'design/gdd/crafting.md': '# Crafting\nRecipe: consume 2 shards to create 1 blade. Salvaging 1 blade produces 3 shards. These integer transformations are repeatable without costs, time limits or inventory limits; start with 2 shards. A blade\'s power P is supplied in 0..100 inclusive real power units. Crafted output damage = 2*P health points, no rounding. Output is passed directly to Combat.\n',
      'design/gdd/combat.md': '# Combat contract\nAccept weapon damage as an integer in 0..150 health points. Reject any other value. No rounding or clamp is applied by Combat.\n',
    }), request: `Review the mathematical integration between design/gdd/crafting.md and design/gdd/combat.md, including transformation loops and producer/consumer contracts. Response only, read-only. ${boundary}`,
  },
  'tuning-simulation': review('design/gdd/recovery.md', '# Recovery model\nCaller supplies initial health H0 in 0..C and elapsed time t in 0..60 real seconds. Health at t is H(t)=min(C,H0+r*t). Data knobs: capacity C in 50..200 health points, default 100; recovery r in 0..30 health points/second, default 10. No decay or other events. C and r are real values. The owner wants a simulation specification to study recovery time and the effect of saturation; no target recovery time or experimental pass threshold is selected.\n', 'Document safe tuning and coupled effects, then specify the smallest useful simulation experiment. Do not execute it or invent results/approved thresholds.'),
  'authorized-doc': {
    allowedChanges: ['docs/math-notes.md'], expectedFiles: ['docs/math-notes.md'], preservePrefix: ['docs/math-notes.md'],
    inputs: inputs({ 'docs/math-notes.md': '# Existing math notes\n## Owner decisions\nKEEP-OWNER-NOTE: Shield behavior is outside this assignment.\n', 'docs/agreed-rule.md': '# Agreed rule\nOwner approved damage = max(0,A-D), where integer A and D each range 0..100 health points. Output damage is an integer. No random factors, dependencies or tunable constants. User wants only a complete Damage Formula section appended to the existing notes, preserving all prior bytes.\n' }),
    request: `Read docs/agreed-rule.md and docs/math-notes.md. The rule and write scope are approved. Append the complete Damage Formula section only to docs/math-notes.md, preserving the existing prefix exactly. No other writes are authorized. ${boundary}`,
  },
  'missing-domain': review('design/gdd/ratio.md', '# Unfinished ratio\noutput = A / B. A and B have no assigned types, ranges, units or owners. The player-experience target is undecided. No input validation or fallback rule has been selected.\n', 'Assess what can and cannot be established about this expression, and return the consequential questions needed to formalize it without inventing domains.'),
  'full-review': {
    workflow: true, timeoutMs: 1200000,
    roles: ['game-studio-game-designer', 'game-studio-systems-designer', 'game-studio-qa-lead', 'game-studio-lead-programmer', 'game-studio-creative-director'],
    inputs: inputs({ 'design/gdd/resolve-hit.md': resolvedHit, 'design/gdd/game-concept.md': '# Predictable Duel\nA deterministic training duel. A hit reduces supplied defender health; negative health and healing from damage are forbidden. The fantasy is predictable consequences from stated rules. No economy, progression, multiplayer, randomness, visuals or audio are in this review.\n' }),
    request: 'Review design/gdd/resolve-hit.md before implementation using the configured review mode. Use the installed toolkit. This is a read-only design review; do not change the GDD, tracking, settings, stage or checkpoint. Work offline, do not install packages, implement a game, run builds/tests, commit or publish. Stop after the review.',
  },
};

// Separate authorized-record chain; the preceding full-review case stays read-only.
systemsDesignerScenarios['full-review-records'] = {
  ...systemsDesignerScenarios['full-review'],
  allowedChanges: ['design/gdd/systems-index.md', 'design/gdd/reviews/resolve-hit-review-log.md'],
  expectedFiles: ['design/gdd/reviews/resolve-hit-review-log.md'],
  inputs: {
    ...systemsDesignerScenarios['full-review'].inputs,
    'design/gdd/systems-index.md': '# Systems Index\n## Systems Enumeration\n| # | System Name | Category | Priority | Status | Design Doc | Depends On |\n|---|---|---|---|---|---|---|\n| 1 | Resolve Hit | Gameplay | MVP | In Review | resolve-hit.md | — |\n| 2 | Combat Display | UI | MVP | Not Started | — | Resolve Hit |\n## Owner Notes\nKEEP-INDEX-NOTE: Display design has not started.\n',
  },
  request: 'Review design/gdd/resolve-hit.md before implementation using the configured review mode and installed toolkit. After presenting the assessment, I authorize updating only its existing systems-index Status cell to match the result and appending its review-log entry with reproducible evidence. Do not modify the GDD, other index cells, unrelated files, settings, stage or checkpoint. Work offline, do not install packages, implement a game, run builds/tests, commit or publish. Stop after the review and these tracking records.',
};

// Keep completed requests intact, including the ambiguous first progression run.
// Clarify tool-execution scope only for unrun cases and a separate regression variant.
const manualArithmetic = request => request.replace(
  'Do not implement game code, execute arithmetic or simulations,',
  'Hand-derived arithmetic and fully evaluated numerical examples in the response are allowed and required for the assigned model. Do not implement game code, run arithmetic programs or simulations,',
);
for (const name of ['economy', 'interactions', 'registry-consistency', 'cross-system', 'tuning-simulation', 'authorized-doc', 'missing-domain']) {
  systemsDesignerScenarios[name].request = manualArithmetic(systemsDesignerScenarios[name].request);
}
systemsDesignerScenarios['progression-manual'] = {
  ...systemsDesignerScenarios.progression,
  request: manualArithmetic(systemsDesignerScenarios.progression.request),
};
