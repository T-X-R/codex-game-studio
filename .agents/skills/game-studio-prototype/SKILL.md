---
name: game-studio-prototype
description: Build or iterate a small Web game prototype from an agreed concept, using deterministic local scaffolding, preview, replay evidence and export commands.
---

# Build a Web prototype

Use the game root and `node .game-studio/run.cjs`. Check `--help` and `doctor` for
the installed capabilities. This alpha supports standalone HTML/JavaScript games.
Preserve an existing engine choice; don't convert an engine project to Web without
that decision. Read `design/game-brief.md` and existing prototypes before creating
anything. Obtain only missing goal, look and scope decisions; reuse authorization.

For a new prototype, identify a falsifiable question: what player action should
produce what experience, and what observation would count as success? Keep the
first build small enough to answer it. Write the agreed brief before the game.

Run `prototype scaffold <name> --title "Title" --question "Question" --dry-run`,
then apply the same command when creation is authorized. The starter is a
fixed-step skeleton, **not a finished game**. Implement the actual core loop,
feedback, failure/restart behavior and the agreed look. Keep tuning parameters in
`config.js`; preserve `window.game`, seeded randomness and the fixed-step contract
so replay can observe the game. Keep asset origin/licence records alongside assets.
For an existing standalone game use `prototype import <source-directory> <name>`;
preview first with `--dry-run` and preserve its original behavior.

Run `check prototypes/<name> --json` for classic-script parsing. It does not prove
browser behavior. Run `preview prototypes/<name> --json` to serve the chosen game
on localhost in a foreground process; stop it when no longer needed. For seeded
browser evidence, run:

```bash
node .game-studio/run.cjs capture prototypes/<name> --log "Enter ArrowRight:1.5 wait:1" --seed 7 --json
```

Replay tokens are separated by **spaces**, not commas. Read the command's JSON
status, report and browser log, then inspect the screenshot. Use `--hookless` only
for an imported game without `window.game`; CSS animation, workers and pointer
lock remain outside that instrumentation. A missing browser is not a passing test.
Do not equate a screenshot, parsing success or deterministic replay with human
play acceptance. Record what actually ran, errors, limitations and user feedback.

After an agreed change, rerun the relevant checks and the same seed/input trace.
Keep a concise progress note in `production/session-state/active.md` with completed
work, decisions, evidence paths and next action. Do not claim an automated stage
gate or merge approval. When asked to export, use `package prototypes/<name>` to
create a fresh local distribution; publishing requires the user's instruction.
