// Synthetic gate submissions: no real play, profiling or market evidence.
const config = 'schema_version: 1\nengine:\n  name: Web\nmodes:\n  rigor: minimal\n  automation: guided\n';
function gate(role, title, gateId, content) {
  return {
    role: `game-studio-${role}`, roleIntroduction: `You are the ${title} for an indie game project.`,
    behaviorSpec: 'studio-tests/roles/directors-codex.md', sandbox: 'read-only', expectedFiles: [],
    inputs: { 'project.yaml': config, 'docs/gate-submission.md': content },
    request: `Perform ${gateId} on docs/gate-submission.md using the installed gate definition. The submission is synthetic and self-contained; judge the supplied constraints rather than researching other projects. Response only. No writes, builds, tests, installs, commits, publication or further agents.`,
  };
}
export const directorScenarios = {
  'director-missing-pillars': gate('creative-director', 'Creative Director', 'CD-GDD-ALIGN', `# CD-GDD-ALIGN submission
System GDD, supplied inline: Players can arrange their inventory by selecting an item, moving it to an empty slot and confirming. Moves are reversible; occupied slots reject the move without losing items. Player Fantasy: control and understand what I carry. Inputs are item ID and destination slot; output is the revised arrangement or unchanged state. Acceptance: valid moves preserve item identity, invalid moves preserve the previous arrangement.
The MDA target is Expression. Game pillars were not supplied. No game concept, pillar document or game brief exists in this fixture. No authority is delegated to invent pillars.
`),
  'director-pillars': gate('creative-director', 'Creative Director', 'CD-PILLARS', `# CD-PILLARS submission
Core fantasy: lead a fragile settlement through survival, knowing every survivor lost changes the world permanently.
Unique hook: like Don't Starve, and also every survivor you lose changes the world for good. The creator's positioning brief identifies permanent survivor-caused world changes, not ordinary resource survival, as the differentiator; this is supplied design context, not market research.
Pillars:
- Emergent stories: interacting survivor histories and world changes produce situations the player authors. Test: choose a lasting relationship consequence over a scripted interchangeable reward.
- Meaningful sacrifice: a loss changes future options and can never be fully undone. Test: reject a resurrection that restores the same survivor and all their world relationships.
- Lived-in world: inhabitants and places retain the traces of what happened. Test: preserve an altered settlement after a death instead of resetting it to the same neutral map.
Tension: sacrifice can save the settlement while permanently damaging the relationships and places the player wants to preserve; emergent stories may create difficult sacrifices rather than optimal reward routes.
Anti-pillars: no consequence-free resurrection; no interchangeable survivors; no world reset that erases history.
`),
  'director-visual-concerns': gate('art-director', 'Art Director', 'AD-CONCEPT-VISUAL', `# AD-CONCEPT-VISUAL submission
Pitch: an action adventure in which a wandering fighter explores places and fights enemies.
Core fantasy: be the hero of an adventure. Platform: Web/browser.
Pillars: fun combat, great story, lots of content. Their tests are respectively whether players enjoy fighting, enjoy the plot and have many places to visit. No mood, atmosphere, shape-language, color meaning or visual touchstones were supplied. The user has not chosen a visual direction.
`),
  'director-feasibility': gate('technical-director', 'Technical Director', 'TD-FEASIBILITY', `# TD-FEASIBILITY submission
Platform: PC. Engine preference: Godot 4.6, supplied by the owner; project engine configuration has not yet been updated. No setup change is authorized.
Core loop: move, observe nearby entities, respond to visible enemies, repeat. Multiplayer visibility is needed; all-pairs per-frame raycasting is a proposed implementation, not a creative requirement.
Technical risk: every active entity raycasts against every other entity every frame at 1000 expected active entities. The target is 60 frames per second, a total frame budget of 16.67 ms. No measured raycast timing is available.
The mechanic can survive a different implementation or update schedule. No concept change or algorithm choice is authorized; compare mitigation options and name what needs measurement.
`),
  'director-scope': gate('producer', 'Producer', 'PR-SCOPE', `# PR-SCOPE submission
Team: one developer. Total available project timeline: four months.
Original MVP: movement and combat, estimated at three months using the developer's supplied planning estimates.
Revised MVP: movement, combat, crafting, weather and faction reputation. The owner estimates these five together at exactly four months, leaving zero time for unplanned work or bug fixes. Each added system can move to a later tier without breaking the movement/combat core loop.
Full vision beyond this milestone: those five systems plus authored campaign content, deferred to a later scope tier with no committed delivery date. The four-month commitment is the revised MVP only. Reduced scope: original two-system MVP in three months, preserving one month for uncertainty inside the four-month budget. No scope cut has been approved.
Assess production fit only. Estimates are supplied planning assumptions, not observed velocity or measured completion times.
`),
  'director-missing-capacity': gate('producer', 'Producer', 'PR-SPRINT', `# PR-SPRINT submission
Milestone: eight weeks away. Two-week sprint cadence. Backlog debt: none.
Stories in dependency order: Player movement (3 points); Jump buffering (2 points, depends on Player movement); Enemy patrol AI (5 points); Pause menu (2 points); Save slots (2 points). Each has an assigned implementation owner and an observable acceptance criterion: movement responds to input, jump buffering consumes one queued press, patrol follows its route, pause freezes simulation, save slots restore the chosen state.
Team hours and capacity were not supplied. There are no earlier sprint records or velocity data. Estimates are story points, not person-days. No staffing or calendar assumptions are authorized.
`),
  'director-required-architecture': gate('technical-director', 'Technical Director', 'TD-PHASE-GATE', `# TD-PHASE-GATE submission
Target phase: Pre-Production. Resolved workflow: standard.
Required technical artifacts at this target: architecture document and Foundation ADRs. Architecture document: none. ADR list: none, because the architecture work has not been done. These artifacts are required now, not deferred to a later phase.
Engine reference: docs/engine-reference/web/VERSION.md. Other phase artifacts are outside this isolated technical readiness request. Do not change phase or create documents.
`),
};
directorScenarios['director-required-architecture'].inputs['project.yaml'] = config.replace('rigor: minimal', 'rigor: standard');
directorScenarios['director-required-architecture'].inputs['docs/engine-reference/web/VERSION.md'] = '# Web runtime reference\nSynthetic fixture: browser Canvas 2D with no engine-specific API proposal. Engine knowledge gaps: none identified for this readiness submission. This is supplied context, not an execution result.\n';
