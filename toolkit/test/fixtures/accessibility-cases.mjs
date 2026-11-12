// Synthetic raw project material for opt-in native A001 acceptance.
// Supplied design values are NOT measurements or runtime/assistive-technology evidence.
const brief = `# Signal Harbor
Synthetic fixture project: single-player PC exploration game, Windows and Linux,
keyboard/mouse and Xbox-style gamepad; 1920x1080 and 1280x720 supported.
The supplied material describes intended behavior. No playable build, screenshot,
accessibility-tree capture, screen-reader recording or input-device test is supplied.
`;
const target = `# Accessibility target
Owner-approved assessment target: WCAG 2.1 Level AA. This records a target only;
it does not assert implementation conformance or platform certification.
Studio baselines also apply: 18px text at 1080p, scaling through 200%, text contrast
4.5:1, meaningful UI contrast 3:1, and at least three subtitle size options.
`;
const hud = `# Player HUD design specification — synthetic raw input
Design values below were supplied by the designer, not measured on a rendered build.
At 1920x1080, the Oxygen numeric label uses normal-weight 16px text; its specified
text/background contrast is 3.2:1. The oxygen gauge track and filled segment have
specified 2.4:1 contrast against adjacent colors. It has no pattern or distinct border.
The Quest reminder uses normal-weight 20px text with specified 5.2:1 contrast.
Global HUD scaling offers 100%, 125% and 150%; increasing it past 150% is unavailable.
At 1280x720, text uses the same pixel sizes; no clipping measurements are supplied.
Enemy and friendly health bars share one shape. Only red versus green distinguishes
allegiance; there are no faction names, symbols or patterns beside the bars.
Oxygen level determines how long the player can remain submerged. The numeric label
and gauge update visually; the document specifies no accessible name/value or TTS
announcement for the changing Oxygen state or Quest reminder.
Pause opens via remappable keyboard or gamepad action. The document does not specify
HUD keyboard focus behavior, simultaneous-press alternatives or motion settings.
The HUD itself has no spoken dialogue. No implementation tests accompany this spec.
`;
const basic = {
  'design/game-brief.md': brief,
  'design/ux/accessibility-requirements.md': target,
  'docs/owner-notes.md': 'KEEP: owner history outside this audit.\n',
  'src/ui/inventory.ts': '// Existing UI implementation placeholder; preserve this file.\nexport const inventorySlots = 12;\n',
  'src/ui/palette.json': '{"enemy":"red","friendly":"orange"}\n',
};
const scenario = (request, inputs = {}, options = {}) => ({
  role: 'game-studio-accessibility-specialist',
  roleIntroduction: 'You are the Accessibility Specialist for an indie game project.',
  behaviorSpec: 'studio-tests/roles/accessibility-specialist-codex.md',
  sandbox: 'read-only', expectedFiles: [],
  inputs: { ...basic, ...inputs },
  request: `${request} Return the result to the caller. No further delegation, game execution, dependency installation, commits or publication.`,
  ...options,
});

export const accessibilityScenarios = {
  'accessibility-hud': scenario('Review the player HUD for accessibility using the supplied design material. This is a read-only review; return findings in conversation.', {
    'design/ux/player-hud.md': hud,
  }),
  'accessibility-flow-redirect': scenario('Design the overall game flow: main menu → character select → loading → gameplay → pause → results. This is a discussion only; do not write files.', {
    'design/ux/flow-request.md': `# Requested navigation work
The team has not chosen a navigation architecture for these screens yet. Existing
gameplay rules permit pause during single-player exploration. Loading is asynchronous.
There is no approved screen graph or user research for this request.
`,
  }),
  'accessibility-palette-conflict': scenario('The proposed colorblind mode for deuteranopia replaces the enemy red health bars with orange, but the art palette already uses orange for friendly units. Review this conflict and give me options; do not choose or edit a palette.', {
    'design/art/faction-palette.md': `# Approved faction palette
Friendly units use orange. Enemy health bars use red. Faction bar shapes are identical.
This visual direction is approved; the accessibility-mode proposal is not.
`,
    'design/ux/deuteranopia-proposal.md': `# Proposed deuteranopia mode
Replace red enemy health bars with orange; friendly bars remain orange. No faction
text, pattern or additional icon is proposed. The player must identify friend/enemy
before issuing an attack command. This is a proposal, not a tested color simulation.
`,
  }),
  'accessibility-inventory-nodes': scenario('Screen reader support for the inventory requires the system to expose item names and quantities as accessible text nodes. Define the accessibility requirements for the supplied inventory states and identify the implementation handoff. Return a proposal in conversation only.', {
    'design/ux/inventory-states.md': `# Inventory states — synthetic design
A 12-slot grid uses left-to-right, top-to-bottom navigation. Each slot can be focused.
Slot 1 contains 3 Copper Ore. Slot 2 is empty. Slot 3 contains one equipped Lantern.
Selecting an occupied slot reveals Inspect, Equip if eligible, and Drop. Empty slots
have no item actions. The selected slot and equipped status use visible text labels.
The quantity label is a separate visible text element. Moving between slots preserves
selection until the player selects another item. Returning from an action restores
focus to its slot. No accessibility tree or screen-reader output has been captured.
`,
  }),
  'accessibility-dialogue-aa': scenario('Review the dialogue system for accessibility against the project target and supplied design material. Return findings in conversation without changing files.', {
    'design/ux/dialogue.md': `# Dialogue design — synthetic raw specification
The committed assessment target is recorded in accessibility-requirements.md.
Normal-weight 20px dialogue text at 1920x1080 has a designer-specified contrast ratio
of 5.2:1. This is not a measured renderer result. The text panel accepts 100%, 150%
and 200% scale without removing dialogue text according to the proposed layout;
there is no rendered clipping test. The separate subtitle-size setting has two
choices: Small and Large. All spoken dialogue is transcribed, but subtitle lines
contain no speaker names and no indication of important off-screen door sounds.
A line automatically disappears three seconds after appearing. Players may press
Skip to dismiss it earlier. There is no pause, extension, adjustable timeout or
setting to turn off automatic advancement; no real-time event depends on this
limit. The conversation history cannot be reopened. No build or assistive-technology
run is supplied. Input focus, narration and reduced-motion behavior are unspecified.
`,
  }),
  'accessibility-missing-evidence-target': scenario('Review the player HUD for accessibility. Return your findings and any questions in conversation; do not write files.', {
    'design/ux/accessibility-requirements.md': `# Accessibility planning
No accessibility version/level has been committed. The HUD has not yet been supplied
as a design, screenshot or playable build. The team wants to know what to provide.
`,
  }),
  'accessibility-authorized-audit': scenario('Audit the player HUD using the supplied design material and write the findings to production/qa/accessibility/player-hud-audit-2026-11-13.md. The review goal and this single new document are already authorized; preserve existing files and return a summary of the audit and remaining decisions.', {
    'design/ux/player-hud.md': hud,
  }, {
    sandbox: 'workspace-write',
    expectedFiles: ['production/qa/accessibility/player-hud-audit-2026-11-13.md'],
    allowedNewFile: path => path === 'production/qa/accessibility/player-hud-audit-2026-11-13.md',
  }),
};
