// Synthetic owner choices, not human play or market research evidence.
const project = (rigor = 'minimal', review = 'solo') => `schema_version: 1\nengine:\n  name: Web\nmodes:\n  rigor: ${rigor}\n  automation: guided\n  review_mode: ${review}\n`;
const boundary = 'No implementation, installs, commits, publishing or further agents. Preserve existing files. Any artifact must stay within the explicitly requested design document. The installed runtime can be used to inspect settings/resources.';
const chosen = `I have chosen Lantern Letters, a calm lighthouse game about routing beams to deliver messages. My exact pitch is: "A little light can carry a long way." No combat, no countdown timer, no failure state. Keep the name Lantern Letters. Use mouse clicks to rotate mirrors, a painted-paper look and soft bell sounds. Four features: rotate mirrors, illuminate a destination, reveal a message, reset the arrangement. The core loop is rotate, connect, read, rearrange. The prototype question is whether making a message arrive feels satisfying. Out of scope: multiplayer, combat, procedural generation. This is for relaxed solo players in five-minute sessions. The first minute teaches one mirror and one destination. Build the single beam connection first. Kill the idea if that connection remains unsatisfying after three playtest iterations. No one has played it yet. I authorize writing the brief now; unspecified optional details can remain explicitly unknown or labeled suggestions.`;
const concept = `The chosen concept is Lantern Letters. I confirm the following creative brief and decisions; continue from them, do not restart idea selection. Write the complete concept document now. I am a solo developer who has shipped a small game, with six weeks for the full vision and two weeks for an MVP. The emotional goal is calm discovery and expression. I liked quiet exploration in A Short Hike, arranging spaces in Unpacking and gentle revelation in Journey; those are personal taste references, not market evidence. The fantasy is caring for an isolated coast by delivering light-borne messages. The core verb is rotate; the hook is that a light route reveals a personal message. Core action feel: deliberate, tactile, no time pressure. Main variable: the player controls every mirror, with immediate readable beam feedback. The platform is Web/browser and my engine preference is Web. No combat, timers, multiplayer, monetization or procedural content.
Confirmed pillars: Readable light (every turn immediately shows its route; reject hidden switches); Gentle agency (every arrangement is reversible; reject punishments); Meaningful arrival (each route reveals a message; reject empty destinations). Confirmed anti-pillars: no combat, no timed puzzles, no grind. These pillars are locked. Chosen visual identity is Paper Coast: clear warm light on muted painted-paper shores; distinguish beam from scenery by luminance, keep silhouettes simple and reserve warm color for delivered messages. Do not choose another direction. Use this anchor even when reviews are unavailable.
Thirty-second loop: rotate and inspect one beam. Five-minute loop: connect a destination, read its message, freely rearrange. A session is 20–30 minutes with a natural stop after any message; no streak or return pressure. Progression unlocks the next authored shore after one delivery, and completion means reading all six messages. MVP is one shore, two mirrors, one message and reset; full vision is three shores, six messages and eight authored arrangements. Reduced scope is one polished shore and two messages. The art pipeline is hand-painted static 2D shapes by me; audio is three original bell tones. Biggest technical uncertainty is understandable beam intersections; design risk is connections feeling trivial. There is no market research. Please propose remaining non-consequential details with uncertainty labels. No further creative selection is delegated. Save only design/gdd/game-concept.md; unresolved independent reviews must stay visible in any draft.`;
export const brainstormScenarios = {
  pick: {
    sandbox: 'read-only', expectedFiles: [], inputs: { 'project.yaml': project() },
    request: `Help me brainstorm a tiny calm lighthouse game for a weekend jam. I have not chosen a concept yet. ${boundary}`,
  },
  brief: {
    sandbox: 'workspace-write', expectedFiles: ['design/game-brief.md'],
    inputs: { 'project.yaml': project() }, request: `${chosen} Save only design/game-brief.md. ${boundary}`,
  },
  negative: {
    sandbox: 'read-only', expectedFiles: [],
    inputs: { 'project.yaml': project(), 'src/score.js': 'export function addScore(score, points) { return score - points; }\n' },
    request: `Read src/score.js and explain why collecting 5 points from a score of 10 produces 5 instead of 15. Response only; do not modify files or propose a different game. ${boundary}`,
  },
  'standard-solo': {
    sandbox: 'workspace-write', expectedFiles: ['design/gdd/game-concept.md'],
    inputs: { 'project.yaml': project('standard') }, request: `${concept} ${boundary}`,
  },
  'full-missing': {
    sandbox: 'workspace-write', expectedFiles: ['design/gdd/game-concept.md'],
    removeRoles: ['creative-director', 'art-director', 'technical-director', 'producer'],
    inputs: { 'project.yaml': project('full', 'full') },
    request: `${concept} No implementation, installs, commits or publishing. Preserve existing files. You may use available native director roles for the required reviews, with read-only tasks. The installed runtime can inspect settings/resources.`,
  },
  'full-review': {
    sandbox: 'workspace-write', expectedFiles: ['design/gdd/game-concept.md'], timeoutMs: 900000,
    inputs: { 'project.yaml': project('full', 'full') },
    request: `${concept} No implementation, installs, commits or publishing. Preserve existing files. Use available native director roles for the required independent read-only reviews. Preserve my already chosen visual direction; a review may flag concerns but cannot choose another one. The installed runtime can inspect settings/resources.`,
  },
};
