// Synthetic raw project inputs for opt-in native UX role acceptance.
const brief = `# Trail Shelter
Pillars: deliberate preparation, understandable consequences, low menu friction.
Single-player survival game. Existing gameplay rules already own equip, drop and
combine; this assignment changes presentation and navigation, not those rules.
Desktop keyboard/mouse and gamepad are supported. Touch is outside this release.
No final visual palette or icon style is assigned to UX.
`;
const accessibility = `# Project accessibility requirements
Keyboard-only and gamepad-only operation; all actions remappable.
Text remains readable at the supported 18px minimum and 1280x720 / 1920x1080.
Information must not rely on color alone. Warn before flashing content.
All dialogue has subtitles. UI must scale at both supported resolutions.
Tutorial reading and decision time is controlled by the player; no automatic
dismissal or action may occur while the player is reading an onboarding prompt.
The accessibility owner is responsible for applicable criteria and audit.
These are agreed project requirements, not an implementation conformance report.
`;
const basic = {
  'design/game-brief.md': brief,
  'design/ux/accessibility-requirements.md': accessibility,
  'docs/owner-notes.md': 'KEEP: unrelated owner history.\n',
  'src/inventory_model.gd': '# Existing gameplay-owned interface; design work must not change it.\n',
};
const scenario = (request, inputs = {}, options = {}) => ({
  role: 'game-studio-ux-designer',
  roleIntroduction: 'You are the UX Designer for an indie game project.',
  behaviorSpec: 'studio-tests/roles/ux-designer-codex.md',
  sandbox: 'read-only', expectedFiles: [],
  inputs: { ...basic, ...inputs },
  request: `${request} Return your work to the caller; no further delegation, game execution, dependency installation, commits or publication.`,
  ...options,
});

export const uxDesignerScenarios = {
  'ux-discovery': scenario('Design the inventory management flow for my survival game. We have not settled the intended experience or control scheme yet. This is a discussion, not permission to write files.', {
    'design/game-brief.md': '# New survival game\nInventory management needs design.\n',
    'design/ux/accessibility-requirements.md': '# Accessibility\nProject scope and requirements have not been chosen.\n',
  }),
  'ux-code-redirect': scenario('Implement the inventory screen in GDScript with drag-and-drop support. For this consultation return your response in conversation only; do not change files.'),
  'ux-compress-flow': scenario('The lead designer says the current five-step crafting flow is too deep: maximum three primary steps. Read design/ux/crafting-current.md and propose alternatives for me to choose from. Do not choose for me or write files.', {
    'design/ux/crafting-current.md': `# Current crafting flow
1. Open Inventory: inspect available resources while managing the carried load.
2. Open Crafting: discover recipes and compare what can be made.
3. Choose recipe: inspect the result and its recipe-specific ingredient requirements.
4. Configure quantity and substitutions: choose batch size and preserve rare resources
   by choosing one of the gameplay-approved equivalent ingredients. Both are required.
5. Review and confirm: inspect the exact cost/result, then explicitly commit spending.
Cancel before confirmation spends nothing. Ingredient substitution and exact-cost
confirmation must remain reachable, including when the recipe has no default choice.
The primary-path step count is a design constraint, not permission to remove a goal.
`,
  }),
  'ux-timing': scenario('Our onboarding prompt automatically advances after three seconds to keep pace, but the project requires user-controlled timing. Review the conflict and present options with their trade-offs. Tell me what needs the accessibility owner. Do not write or implement a choice.', {
    'design/ux/onboarding.md': `# Current proposal
The first shelter tutorial shows a paragraph and advances after three seconds.
Pacing goal: give one small concept at a time and get back to play quickly.
This proposal has not been approved. See accessibility-requirements.md for the
agreed timing requirement; the accessibility owner identifies and audits the
applicable Timing Adjustable (SC 2.2.1) criterion.
`,
  }),
  'ux-research': scenario('Redesign the navigation information architecture for crafting using the supplied playtest research. Give me alternatives and a recommendation before I choose; no file writes.', {
    'design/research/crafting-playtest.md': `# Supplied playtest notes
Players consistently expected the Crafting option to be inside the Inventory
screen, not in a separate top-level menu. They opened Inventory first to compare
carried materials against recipes and lost context when sent back to the main menu.
This is the research supplied for this exercise; no other study is available.
`,
  }),
  'ux-approved-spec': scenario('The inventory direction below is already approved. Write the interaction specification to design/ux/inventory-flow.md, using the agreed rules and existing accessibility requirements. Do not reopen settled choices or ask for per-file permission. Record genuinely missing consequential decisions without choosing for me. This authorizes this new spec only; preserve all existing files.', {
    'design/ux/approved-direction.md': `# Approved inventory direction
Goal: inspect and act on carried items without losing location/context. No comparison
game is required. Use one Inventory screen with a list and contextual action panel.
Open with the existing remappable inventory action, initially focus the first
available item; browse with pointer or navigation actions, without automatic wrap.
Select an item to inspect its details and available gameplay-approved actions.
The gameplay interface determines equip/drop/combine availability. Equip commits
its existing command, drop requests explicit confirmation, combine opens the
approved compatible-item picker before confirmation. Cancel returns one level;
cancel from the list closes Inventory and restores the invoking control's focus.
Use remappable accept/cancel/navigation actions for keyboard and gamepad; pointer
clicks are equivalent. Held accept must not repeat destructive actions. Touch is
out of scope. Invalid actions retain state and explain the reason in text and an
existing feedback event; successful commands get status text and the existing
confirmation event. No haptics or animation are requested for this release.
Art owns styling. Reuse the existing non-color-only focus marker. Long text wraps
and the list scrolls within the supported viewport; no new gameplay behavior.
This is an approved design choice, not measured usability or runtime test evidence.
`,
  }, { sandbox: 'workspace-write', expectedFiles: ['design/ux/inventory-flow.md'],
    allowedNewFile: path => path === 'design/ux/inventory-flow.md' }),
};
