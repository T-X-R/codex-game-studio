---
name: game-studio
description: Set up Codex Game Studio for a new game or an existing game workspace, then route to the installed game development workflows. Use when the user wants to make a game or enable this toolkit in a game project.
---

# Game Studio

Use the user's current game directory. Inspect its files before choosing `init`
for an empty directory or `attach` for an existing project. Preserve the chosen
engine and existing code.

Run `game-studio version --json` and `game-studio --help`. The installed CLI is
the authority for available commands; don't invent operations from a future
release. If the command is missing, report that the toolkit must be installed
using its distribution instructions. Do not fetch an unverified package.

Confirm only the missing creative goal, engine choice, and material scope
decisions. An already approved implementation authorizes normal file changes
and local checks within that scope. Continue without per-file permission prompts.

Preview integration with `game-studio init <directory> --engine web --dry-run`
or `game-studio attach --project <directory> --dry-run`. Apply when that scope is
already authorized. Report collisions instead of overwriting them. Follow the
CLI's runtime restoration instructions; project setup never implies permission
to publish, change Git remotes, or install system dependencies.

After attachment, read the installed `.agents/skills/game-studio-*` Skill most
relevant to the task. A new Codex session may be needed for discovery. Use
`node .game-studio/run.cjs doctor --json` to distinguish available operations
from missing dependencies. Hook installation is not proof of hook trust or
execution. Do not promise a game was play-tested without observed evidence.
