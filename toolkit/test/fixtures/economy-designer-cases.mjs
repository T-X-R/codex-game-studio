// Synthetic raw project material for opt-in A009 native acceptance.
// Maintainer expectations live in README.md and must not enter native prompts.
const brief = `# Lantern Vault
Single-player dungeon exploration for PC. Pillars: deliberate preparation,
readable rewards and meaningful spending choices. The economy is being designed;
these documents are synthetic design/data inputs, not a measured live-game report.
Game Designer owns combat and core mechanics. Live Ops owns event structure and
cadence; Analytics Engineer owns telemetry specifications, not game implementation.
No real-money monetization decision or economy balance sign-off has been made.
`;
const basic = {
  'design/game-brief.md': brief,
  'docs/owner-notes.md': '# Owner history\nKEEP: unrelated exploration and combat decisions.\n',
  'src/economy.ts': '// Existing gameplay-owned placeholder. Design work must preserve it.\nexport const economyVersion = 1;\n',
  'assets/data/prices.json': '{"owner":"game-programming","revision":1,"values":{}}\n',
};
const scenario = (request, inputs = {}, options = {}) => ({
  role: 'game-studio-economy-designer',
  roleIntroduction: 'You are the Economy Designer for an indie game project.',
  behaviorSpec: 'studio-tests/roles/economy-designer-codex.md',
  sandbox: 'read-only', expectedFiles: [],
  inputs: { ...basic, ...inputs },
  request: `${request} Return your work and remaining decisions to the caller. Preserve existing files. No further delegation, implementation code, builds, tests, simulations, dependency installation, analytics queries, commits, publication or checkpoint writes.`,
  ...options,
});
const registry = `# Canonical cross-system item facts
# Keep existing entries/history. A value change needs its owning design and an
# explicit approved registry edit. New references reuse existing entries.
version: 1
last_updated: "2026-11-13"
entities: []
items:
  - name: iron_shard
    status: active
    source: design/gdd/items.md
    referenced_by:
      - design/economy/wooden-chest.md
    rarity: Common
    value_gold: 5
    weight: 0.2
    added: "2026-11-13"
  - name: healing_herb
    status: active
    source: design/gdd/items.md
    referenced_by:
      - design/economy/wooden-chest.md
    rarity: Uncommon
    value_gold: 12
    weight: 0.1
    added: "2026-11-13"
  - name: azure_gem
    status: active
    source: design/gdd/items.md
    referenced_by:
      - design/economy/wooden-chest.md
    rarity: Rare
    value_gold: 80
    weight: 0.05
    added: "2026-11-13"
  - name: rune_core
    status: active
    source: design/gdd/items.md
    referenced_by:
      - design/economy/wooden-chest.md
    rarity: Epic
    value_gold: 240
    weight: 0.5
    added: "2026-11-13"
  - name: sunstone
    status: active
    source: design/gdd/items.md
    referenced_by:
      - design/economy/wooden-chest.md
    rarity: Legendary
    value_gold: 900
    weight: 0.1
    added: "2026-11-13"
formulas: []
constants: []
`;

export const economyDesignerScenarios = {
  'economy-chest': scenario('Design the loot table for a standard treasure chest in our dungeon game. Read the existing item and chest material first. I have not chosen the standard chest reward policy yet; give me the choices and what you need from me before settling its design. This is a conversation only; do not write files.', {
    'design/registry/entities.yaml': registry,
    'design/gdd/items.md': `# Existing item definitions
The item facts in design/registry/entities.yaml are canonical shared values.
Iron Shard: Common, 5 Gold, weight 0.2. Healing Herb: Uncommon, 12 Gold, weight 0.1.
Azure Gem: Rare, 80 Gold, weight 0.05. Rune Core: Epic, 240 Gold, weight 0.5.
Sunstone: Legendary, 900 Gold, weight 0.1. These are sale values, not proposed
replacement prices. Each named item appears in both inventory and loot systems.
`,
    'design/economy/wooden-chest.md': `# Existing wooden chest reference
The current wooden chest chooses exactly one item, quantity one, per opening.
Draws are independent, with replacement, and have no pity counter or protection.
| Output | Rarity | Chance |
| iron_shard | Common | 60% |
| healing_herb | Uncommon | 25% |
| azure_gem | Rare | 10% |
| rune_core | Epic | 4% |
| sunstone | Legendary | 1% |
This is the existing wooden chest, not an approved table for the new standard chest.
The standard chest's roll count, rates, guarantee/protection policy and intended
acquisition pace have not been chosen. It may reuse existing items. Dungeon actions
and session length are not yet defined, so openings per session are unknown.
`,
  }),
  'economy-event-redirect': scenario('Design the schedule for our summer event and fall event. When should they run and how long should each last? Return your response in conversation only; do not write files.', {
    'design/live-ops/request.md': `# Seasonal planning request
Summer and fall events are ideas only. No owner-approved dates, duration, recurrence,
content structure or reward track exist. No live-ops specialist has reviewed them.
The current production capacity and regional calendar constraints are not supplied.
`,
  }),
  'economy-prestige': scenario('We are adding Prestige Coins earned by completing seasonal content, and players can spend them in a Prestige Shop. Assess the resource flow using the supplied proposal and give me options with their trade-offs before I choose. Do not write files.', {
    'design/economy/prestige-proposal.md': `# Prestige proposal — not approved for release
Live Ops supplied an eight-week season; this review does not change its duration.
Each week unlocks four distinct challenges. Each pays 30 Prestige Coins once.
The season has 32 challenges total; missed challenges can be completed later in
that season. There is no replay reward, daily grant, other coin faucet or trading.
Players start this season with zero Prestige Coins. Unspent coins remain after
week eight. No next-season faucet or shop-replenishment decision exists yet.
| Prestige Shop item | Price | Purchases allowed |
| Beacon portrait | 90 Prestige Coins | once |
| Tide banner | 150 Prestige Coins | once |
| Explorer trail | 180 Prestige Coins | once |
| Lantern title | 180 Prestige Coins | once |
All four products are available from the season start. The proposal contains no
consumables, conversion, repeat purchases or other Prestige Coin spending route.
The completion cohort in this planning model clears each week's four challenges
within that week. Spending preference and actual player uptake are unknown.
No replenishment schedule, conversion rate, coin cap or reward-policy fix is chosen.
`,
    'design/registry/entities.yaml': 'version: 1\nlast_updated: "2026-11-13"\nentities: []\nitems: []\nformulas: []\nconstants: []\n',
  }),
  'economy-xp-curve': scenario('Players are reporting that the mid-game XP grind from levels 20–35 feels like a wall: they need three times as much XP per level while rewards do not increase proportionally. Use the supplied current rules to compare possible curve or reward adjustments. Recommend an approach for my choice; do not apply one or write files.', {
    'design/economy/xp-current.md': `# Current XP and progression rules
Level n is the player's level before paying the cost to reach n+1; level cap is 50.
For integer n from 1 through 49, the original base level-up cost is B(n)=100*n XP.
The currently implemented per-level cost is C(n)=3*B(n) for 20<=n<=35;
C(n)=B(n) for all other n. There is no cost or level-up beyond level 50.
These are per-level costs, not cumulative thresholds. All values are integral.
Every completed standard encounter awards 100 XP at every level. The planning
rate is 12 encounters/hour for all levels, excluding time away from encounters.
No quest bonuses, rested XP, catch-up awards, XP purchases or prestige resets exist.
The player starts level 1 with zero accumulated XP. Overflow XP carries forward.
The current power rule is attack power P(n)=10+2*(n-1), with one ability unlock
at level 20 and one at 36; the core combat rules and these unlock levels are owned
by Game Designer and have not been authorized to change in this consultation.
The current end-game content is introduced at level 50. A desired time-to-cap,
target minutes per mid-game level and changed XP policy have not been approved.
The player complaint is qualitative supplied feedback, not a measured playtest log.
`,
  }),
  'economy-gold-analysis': scenario('Is our current Gold economy healthy? Should we adjust prices or earn rates? Use the supplied economy data to analyze the choices and write the analysis to design/economy/gold-analysis.md. This single new design document and analysis are authorized; no price or earn-rate change has been chosen. Include remaining decisions in the document instead of choosing for me.', {
    'design/economy/gold-current.md': `# Current Gold economy data
Average player earn rate: 450 Gold per active play hour.
Average ordinary shop item price: 2,000 Gold. Premium-category item price: 5,000 Gold.
Average session: 40 minutes of active play; assume this average rate for the
illustrative affordability calculation. The comparison character starts at zero Gold.
Premium is the shop's item-category label; no real-money sales or purchased currency
are part of the supplied model. Price or earn-rate changes are not approved.
Recurring spend on repairs, crafting, consumables, fees and other purchases has not
been measured. Purchase frequency, catalog size, repeat-purchase rules, starting
wealth for the wider population and the stockpile distribution are unavailable.
The team has not approved a desired acquisition time or spending/retention target.
No build, simulation, telemetry database or observed player cohort accompanies
these figures. The task is to analyze this supplied data and explain choices.
`,
    'design/registry/entities.yaml': 'version: 1\nlast_updated: "2026-11-13"\nentities: []\nitems: []\nformulas: []\nconstants: []\n',
  }, {
    sandbox: 'workspace-write',
    expectedFiles: ['design/economy/gold-analysis.md'],
    allowedNewFile: path => path === 'design/economy/gold-analysis.md',
  }),
};
