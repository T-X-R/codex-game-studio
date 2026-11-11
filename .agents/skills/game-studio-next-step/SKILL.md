---
name: game-studio-next-step
description: Inspect a game workspace and recommend one concrete next action, especially when resuming development or deciding what to do after a prototype.
---

# Choose the next step

This workflow is read-only. Run `node .game-studio/run.cjs status --json` from the
game root. Read the brief, any current checkpoint and the most recent relevant
report under `production/evidence/`. Inspect actual game files before inferring
progress. Treat the configured stage as a recorded value, not proof of acceptance.

Recommend one action with its reason and expected evidence:
- No agreed concept: settle the core loop and prototype question with `game-studio-start`.
- Brief exists, no playable build: build the smallest loop with `game-studio-prototype`.
- Build exists: examine its latest browser evidence and ask for missing human play feedback.
- Feedback exists: implement the highest-impact agreed change and replay it.
- User asks to share: produce a new local distribution with `package`; uploading is separate.

Name missing evidence and blockers. Do not fabricate tests, fun, stage-gate
approval or a running server. Do not launch a full audit for a simple next-step
request. Broader studio workflows remain in the migration backlog for this alpha.
