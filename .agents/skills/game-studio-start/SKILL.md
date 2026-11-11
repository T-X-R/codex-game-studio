---
name: game-studio-start
description: Orient a new or resumed game project, confirm its immediate goal, and choose the next game development workflow.
---

# Start a game session

Work from the game root (the directory containing `.game-studio/run.cjs`). Run
`node .game-studio/run.cjs doctor --json` and `node .game-studio/run.cjs status --json`.
Inspect existing game files and the latest brief/checkpoint before asking for
information already recorded. A missing runtime needs an explicit restore from
the distribution archive, not an automatic download.

For a new idea, settle the core player action, the first playable scope, visual
intent and target platform. Reuse earlier answers. Record the agreed brief in
`design/game-brief.md`, then use `$game-studio-prototype` for a Web prototype.
For an existing game, preserve its engine and dependencies. This alpha executes
Web operations; report engine-specific execution that remains unavailable.

Default to guided execution: after the goal and important decisions are agreed,
implement, check and fix within that scope. Do not ask permission for each file.
Surface actual creative ambiguity, scope expansion and externally visible actions.

On resume, inspect files and current Git state; an old preview URL or browser
process in a note does not prove it is running. Use `$game-studio-next-step` when
the user asks what to do next. Do not promote a project stage from file counts.
