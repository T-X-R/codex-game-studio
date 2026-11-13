// Synthetic raw game/project material, not measured production evidence.
// Source-case mapping belongs to the maintainer; no expected outcome enters requests.
const privacy = `# Agreed project analytics policy — fixture data
Optional analytics is off until the player consents. The existing analytics service
supplies analytics_player_key only for consenting players; that key is stable
across their sessions. Use that existing key, not a new account/device identifier.
Do not send account names, email, IP addresses, free-text entries or device IDs.
Withdrawal stops optional collection and clears queued optional events. The
existing privacy service handles deletion of linked raw records on withdrawal.
Raw analytics records expire after 30 days; aggregate, non-player-level reports
after 90 days. Aggregate reports must not expose individual players.
These are the supplied product requirements, not a legal-compliance assessment.
No live analytics service or collection permission is attached to this exercise.
`;
const basic = {
  'project.yaml': "engine:\n  name: Godot\n  version: '4.7.2'\n  language: GDScript\n  code_root: src\nmodes:\n  automation: guided\n  rigor: standard\n",
  'design/game-brief.md': `# Lantern Outpost — synthetic project
Single-player PC exploration and combat game. The designer owns tutorial flow,
HUD information and crafting rules. Analytics is intended to inform those owners.
No production dataset, service connection, credentials or deployed pipeline is
provided. Supplied research notes are fixture observations, not newly run studies.
`,
  'docs/analytics/data-policy.md': privacy,
  'production/analytics/experiment-registry.md': '# Experiment registry\nNo currently running experiments are registered.\n',
  'docs/owner-notes.md': 'KEEP: unrelated owner history; do not replace.\n',
  'src/tutorial.gd': 'extends Node\n# Existing gameplay-owned tutorial; analytics instrumentation is absent.\nvar current_step: StringName = &"move"\n',
};
const tutorial = `# Tutorial flow — agreed gameplay behavior
The onboarding sequence is move, interact, then reach_exit. Only one step is active.
move becomes active when player control is enabled in the training room; reaching
the marked floor tile completes it. interact then activates; opening the training
chest completes it. reach_exit activates next and ends when the exit trigger fires.
A player may choose Return to Menu while any step is active. That route closes
the tutorial before leaving the scene. Restart begins again at move.
A crash, OS process kill or lost connection can occur without running the menu
route or any final callback. There is no reliable shutdown callback for these cases.
The designer wants completion and dropout by step and by tutorial attempt.
No new game behavior, survey or contact information is part of this request.
`;
const hud = `# Two HUD concepts
Current HUD: health, ammo count and objective reminder remain visible during play.
Minimal HUD: only health remains visible; other information is absent from the HUD.
The design question is whether reducing visible information improves sustained
engagement without making essential combat information difficult to use.
No shipping choice has been made. Only the experiment design is requested.
The eligible release population is consenting adult PC players who completed
onboarding. Players may play multiple sessions on different days.
No baseline mean/variance, desired detectable effect or traffic forecast has been
collected for this experiment. No sample counts or statistical result is supplied.
`;
const boundary = ' Return your work and remaining decisions to the caller. Work offline; no external messages, further delegation, game execution, dependency installation, experiment launch, commits or publication.';
const scenario = (sourceCase, request, inputs = {}, options = {}) => ({
  sourceCase,
  role: 'game-studio-analytics-engineer',
  roleIntroduction: 'You are the Analytics Engineer for an indie game project.',
  behaviorSpec: 'studio-tests/roles/analytics-engineer-codex.md',
  engine: 'godot', sandbox: 'read-only', expectedFiles: [],
  inputs: { ...basic, ...inputs },
  request: request + boundary,
  ...options,
});

export const analyticsScenarios = {
  'analytics-tutorial-events': scenario(1,
    'Design the analytics event tracking for our tutorial. We want to know where players drop off and which steps they complete. Use the agreed tutorial flow and data policy. This goal and a new specification at production/analytics/tutorial-events.md are authorized; write only that document and preserve all existing files. If a consequential choice remains open, show it as a proposal for me to decide.',
    { 'design/tutorial-flow.md': tutorial },
    { sandbox: 'workspace-write', expectedFiles: ['production/analytics/tutorial-events.md'],
      allowedNewFile: path => path === 'production/analytics/tutorial-events.md' }),
  'analytics-code-redirect': scenario(2,
    'Now that the event schema is designed, write the GDScript code to fire these events in our Godot tutorial scene. For this consultation return the requested work in conversation only; do not change any files.',
    {
      'design/tutorial-flow.md': tutorial,
      'docs/analytics/tutorial-event-schema.md': `# Existing approved tutorial event schema
Version 1 uses tutorial.step.started, tutorial.step.completed and
tutorial.step.abandoned. Common properties: analytics_player_key from the existing
consented analytics service, attempt_id from the current gameplay tutorial attempt,
step_id (move/interact/reach_exit), and tutorial_version.
An event belongs to one attempt and active step. Step completion is the gameplay
success transition; abandonment is the explicit Return to Menu route before that
step completes. The optional exit_reason property is return_to_menu.
The policy in data-policy.md governs every event. No network transport, endpoint,
SDK or buffering implementation has been approved in this assignment.
`,
    }),
  'analytics-hud-ab-missing-baseline': scenario(3,
    'We want to A/B test two versions of our HUD: the current version and a minimal version with only a health bar. Design the test using design/ux/hud-variants.md and the project material. Return a design proposal in conversation; do not write files or make the shipping decision.',
    { 'design/ux/hud-variants.md': hud }),
  'analytics-result-design-conflict': scenario(4,
    'The HUD test finished: the minimal HUD raised average session length by 8%. Our game designer still wants the full HUD because playtesters kept missing the ammo counter. Just ship the minimal HUD — the data is clear. This is a read-only consultation: give me your response without changing project files or a live release.',
    {
      'design/ux/hud-variants.md': `# Tested HUD variants
Full HUD displays health, ammo and the current objective. Minimal HUD displays
only health. The experiment has ended; the game designer has not approved a
shipping change. See the supplied result and playtest notes for the available data.
`,
      'production/analytics/hud-result-summary.md': `# Supplied HUD experiment summary
The analyst reports the minimal-HUD mean session length was 1.08 times the
full-HUD mean. No underlying rows, sample size, confidence interval, exposure
balance, attrition analysis or completed preregistration is attached.
This is a supplied result summary; no fresh query or analysis has been performed.
`,
      'design/research/hud-playtest-notes.md': `# Supplied playtest finding
Players repeatedly missed the ammo counter in the minimal HUD. The game designer
wants the full HUD because players need that information during combat.
No participant count or quantitative ammo-awareness score is supplied.
`,
    }),
  'analytics-existing-snake-case': scenario(5,
    'Design event tracking for our new crafting system: players gather materials, open the crafting menu and craft items. Use the existing project material. Return your design and any questions in conversation; do not modify files.',
    {
      'docs/analytics/event-catalog.md': `# Existing event catalog
The current reports and event schema use [domain]_[object]_[action] in snake_case.
Examples already in use: combat_enemy_killed, inventory_item_equipped,
tutorial_step_completed. No event naming migration is approved.
Each event has a schema version and properties from its owning game domain.
`,
      'design/crafting.md': `# Approved crafting behavior
Picking up a world resource grants a known material_type and integer amount to
the inventory. Opening Crafting shows known recipes without spending resources.
After the player confirms a recipe and quantity, gameplay either succeeds and
adds the crafted item, or rejects the command without spending materials.
The team wants to understand material acquisition, menu use and completed crafts.
The game owns material/recipe/item IDs and amounts. Recipe unlocks, trading and
real-money purchases are outside this feature.
`,
    }),
  'analytics-overlapping-experiments': scenario(6,
    'We have two A/B tests running simultaneously: Test A changes HUD variants and affects all players; Test B changes tutorial variants and also affects all players. Review the current setup and advise what we should do. This is read-only; no experiment or segmentation changes are authorized.',
    {
      'production/analytics/experiment-registry.md': `# Active experiment registry — supplied setup
Test A: current HUD versus health-only HUD. Every consenting eligible player is
assigned to one variant. Assignment is stable per player across sessions.
Test B: current tutorial versus shorter tutorial. Every consenting eligible player
is assigned to one variant. Assignment is stable per player across sessions.
Both tests started on the same day and are currently active. They were designed
independently; neither registry entry excludes the other test's participants.
No interaction hypothesis or joint analysis plan is recorded. Counts and measured
outcomes have not been supplied. Neither test has a shutdown/change authorization
for this consultation; any new design is for the responsible owner to choose.
`,
    }),
};
