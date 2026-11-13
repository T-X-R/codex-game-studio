// Synthetic design inputs. No player observation or executable game is supplied.
const role = 'game-studio-game-designer';
const roleIntroduction = 'You are the Game Designer for an indie game project.';
const behaviorSpec = 'studio-tests/roles/game-designer-codex.md';
const restrictions = 'Preserve every existing file. No implementation code, runtime data writes, builds, tests, installs, commits, publishing, checkpoint updates or further agents. Return unresolved creative choices to the caller; do not ask the unattended user for per-file or per-section approval.';
const approved = `# Approved stamina dodge decisions
The user chose stamina-based dodge and authorizes the design document now.
Pillars: Readable mastery; Deliberate risk.
Player fantasy: evade danger through timing and resource judgment, with readable consequences.
Constraints: single-player Web action game; 5-minute sessions; no monetization, multiplayer, progression, lore or art/audio changes.
The mechanic belongs to the encounter micro-loop and resource/recovery session loop.
All timings use simulated seconds. Pause freezes time. Initial and respawn stamina are 100. Death prevents dodge/regeneration until respawn.
Capacity 100; dodge cost 25; regeneration 10 stamina/second; regeneration delay 0.4 seconds after dodge ends; dodge lasts 0.2 seconds; immunity lasts 0.12 seconds from acceptance.
A dodge request is accepted only while alive, not already dodging, and stamina >= 25. Deduct the cost immediately. Insufficient-resource and during-dodge requests have no effect and are not queued. Requests at exactly 25 are valid. No zero-cost bonus or refund.
All incoming damage, including environmental hazards, is ignored for elapsed time [0,0.12). At exactly 0.12 damage is permitted. The dodge ends at elapsed 0.2. Simultaneous input order is already resolved by the game; do not invent a new priority rule.
Regeneration occurs only while alive, not dodging, and after the delay; integrate only the eligible portion of a time step. It grants no instantaneous amount exactly when delay expires. Clamp to capacity. Before any dodge, regeneration is eligible immediately if below capacity.
Approved tuning ranges: capacity 50..200; cost 1..capacity; regeneration 0..30 stamina/second; delay 0..2 seconds; dodge duration 0.1..0.5 seconds; immunity 0..dodge duration. Current values above are approved defaults. Put the described future runtime data at assets/data/dodge.json, but do not create it now.
Input system provides an already ordered dodge request; combat consumes an immunity state; movement consumes a dodge-active state, with distance/direction owned by the existing movement system; HUD consumes stamina/capacity. Do not design new movement speed, screen visuals or interfaces in code.
Functional checks must follow these approved rules. Human criteria: players can explain why a dodge was rejected and can distinguish accepted timing from exhausted stamina. No human session or numerical usability threshold exists yet; suggest a validation protocol, mark any threshold pending owner decision.
`;
function authoring(level) {
  const output = level === 'minimal' ? 'design/game-brief.md' : 'design/gdd/stamina-dodge.md';
  return {
    role, roleIntroduction, behaviorSpec, sandbox: 'workspace-write', expectedFiles: [output],
    allowedNewFile: path => path === output,
    inputs: {
      'project.yaml': `schema_version: 1\nengine:\n  name: Web\nmodes:\n  automation: guided\n  rigor: ${level}\n`,
      'docs/approved-dodge.md': approved,
      'docs/existing-notes.md': '# Preserve this note\nThe current movement system owns dodge distance and direction.\n',
    },
    request: `Read docs/approved-dodge.md and docs/existing-notes.md. The creative choice, numeric rules and write scope are already approved. Author the mechanic at ${output} using the effective workflow tier and installed role methods. Write only that new file. Preserve the approved rules and distinguish any remaining proposals from decisions. ${restrictions}`,
  };
}
export const designerScenarios = {
  'designer-full': authoring('full'),
  'designer-standard': authoring('standard'),
  'designer-minimal': authoring('minimal'),
  'designer-review': {
    role, roleIntroduction, behaviorSpec, sandbox: 'read-only', expectedFiles: [],
    inputs: {
      'project.yaml': 'schema_version: 1\nengine:\n  name: Web\nmodes:\n  automation: guided\n  rigor: full\n',
      'design/gdd/hazards.md': '# Environmental hazards\n## Player Fantasy\nThe world is dangerous but fair: every hazard is readable and avoidable.\n## Detailed Design\nFire deals 10 damage, acid 6 damage and electricity 14 damage. The player can dodge.\n',
      'docs/review-brief.md': `# Specialist review request
Find problems in the hazard design, anchored to its Player Fantasy. Return findings to the design-review caller.
Separately assess permadeath with permanent +5% starting-health legacy bonuses after each death against these pillars: player authorship, consequence permanence, world responsiveness. No ruling on pillar tensions has been made. No other legacy rules exist.
A systems designer proposes six variables for damage to support fine tuning; the game designer prefers two so players can understand outcomes. Neither has agreed; identify ownership and escalation, do not choose the formula.
Also write the final in-world legend explaining stamina limits. No lore is approved. Return the proper owner for any work outside your domain.
`,
    },
    request: `Read design/gdd/hazards.md and docs/review-brief.md and perform the requested specialist assessment. This is read-only: response only. ${restrictions}`,
  },
};
