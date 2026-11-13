// Raw synthetic project materials for opt-in A005 native acceptance.
// These are written design inputs, not audio playback, profiling or measurements.
const common = {
  'design/game-brief.md': `# Hearthwake
Synthetic project: a single-player exploration/survival game for desktop browsers.
Input is keyboard/mouse. The existing implementation uses native Web Audio.
This fixture supplies design documents only, not playable audio or an audio build.
`,
  'docs/owner-notes.md': 'KEEP: unrelated owner history.\n',
  'src/audio.ts': '// Existing audio implementation placeholder; preserve this file.\nexport const backend = "native-web-audio";\n',
  'assets/audio/asset-list.md': '# Existing asset inventory\nNo produced audio files are supplied in this exercise.\n',
};
const scenario = (request, inputs = {}) => ({
  role: 'game-studio-audio-director',
  roleIntroduction: 'You are the Audio Director for an indie game project.',
  behaviorSpec: 'studio-tests/roles/audio-director-codex.md',
  sandbox: 'read-only', expectedFiles: [],
  inputs: { ...common, ...inputs },
  request: `${request} This assignment is conversation-only. Return the result to the caller; no further delegation, file writes, game execution, dependency installation, commits or publication.`,
});

export const audioDirectorScenarios = {
  'audio-director-exploration-spec': scenario('The Exploration music direction is approved. Draft the audio asset specification for this layer using the supplied direction and platform constraints.', {
    'design/audio/exploration-direction.md': `# Approved Exploration direction
The user selected a generative ambient system of layered stems that shift with
environmental density. Its palette is sparse, organic and slightly melancholic.
The pillar this layer serves is "lived-in world": places should feel inhabited and
retain the traces of prior activity, even while the player is travelling quietly.
Density is already available as an environmental state from gameplay; the music
responds to it without changing that gameplay state or adding a new mechanic.
This is the chosen direction, not a request to reconsider its palette or pillar.
No reference recordings or finished stems are supplied. The asset specification
has not yet been written; stem inventory, encoding, loudness and per-file allocation
are not settled. The document is a direction choice, not a runtime test report.
`,
    'design/audio/platform-constraints.md': `# Supplied platform constraints
Desktop browser release, stereo output. The owner allocates at most 20 MB of the
initial download to Exploration music; the limit is a planning constraint, not a
measurement of existing assets. No per-stem budget has been allocated. The existing
native Web Audio implementation remains in place. No new middleware is approved.
`,
  }),
  'audio-director-settings-flow': scenario('Evaluate whether the audio settings menu flow is intuitive and well-organized using the supplied screen sequence and mix notes.', {
    'design/ux/audio-settings-proposal.md': `# Proposed settings sequence
Pause menu → Settings landing → Audio category → Volume controls → Advanced audio
→ Return to Settings → Resume. The controls screen and advanced screen are separate.
The team has not approved this flow and has supplied no usability study.
`,
    'design/audio/mix-notes.md': `# Current mix direction
The project's volume hierarchy has Master, Music, SFX and Dialogue buses. Dialogue
should be intelligible over music; gameplay warnings must remain distinguishable
when other effects play. Players need control over these bus levels. This note does
not specify a screen layout or navigation architecture. No mix recording is supplied.
`,
  }),
  'audio-director-boss-review': scenario('Provide the audio-specialist contribution to a full design review of the boss encounter. Your job is NOT to validate this design — your job is to find problems. Be specific and critical.', {
    'design/gdd/boss-encounter.md': `# Final boss encounter
## Emotional targets
Dread: the player understands that the encounter threatens the people they protect.
Inevitability: the confrontation cannot be postponed by ordinary escape.
Tragic sacrifice: victory requires a permanent loss the story treats seriously.
These are the approved emotional targets; the narrative outcome is already chosen.
## Proposed music cue
When the final boss enters, an upbeat, major-key orchestral cue begins at a fast
tempo. Bright brass leads the upper register over a driving rhythmic accompaniment.
The same cue continues through the sacrifice moment without a change in arrangement.
This is a written cue proposal. No score, recording or in-game playback is supplied.
`,
  }),
  'audio-director-occlusion-conflict': scenario('Review the unresolved audio occlusion proposals and tell the caller how to take this work forward.', {
    'design/audio/occlusion-discussion.md': `# Occlusion discussion — synthetic written positions
Both participants agree that an obstacle between listener and sound source should
muffle the source, and that the occlusion effect is desirable for this game.
Sound Designer proposes real-time raycast-based physics queries to drive occlusion.
Technical Artist says that approach is too expensive and proposes zone-based
triggers instead. The disagreement is the implementation approach, not whether
the audible effect is needed. No profiling measurements have been supplied.
Attenuation amount and engagement/recovery behavior have not been specified yet.
Neither proposal is approved. No code, middleware or gameplay change is authorized.
`,
  }),
  'audio-director-three-pillars': scenario('Assess the submitted environmental ambience specification against the supplied game pillars.', {
    'design/game-brief.md': `# Hearthwake — supplied pillars
Synthetic single-player browser exploration/survival game.
- Emergent stories: player actions and interacting world events create situations
  that were not a fixed scripted sequence.
- Meaningful sacrifice: losses permanently change future opportunities and the
  relationships the player is trying to preserve.
- Lived-in world: places and inhabitants retain traces of their history.
The pillar names used by the project are "emergent stories", "meaningful sacrifice"
and "lived-in world". These are approved goals, not measured player outcomes.
`,
    'design/audio/environment-ambience.md': `# Submitted environmental ambience specification
Each biome has one static ambient loop. Entering a biome starts that loop; remaining
inside it repeats the same loop. There are no layers or transitions responding to
player actions, local events, persistent losses or changes in the world's history.
The document supplies no sound files or listening session. This is the current
proposal for review, not an approved adaptive-audio system.
`,
  }),
};
