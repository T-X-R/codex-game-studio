# Codex Game Studio

This repository is being migrated from Claude Code Game Studios into a Codex
CLI-and-Skills toolkit. The approved scope and remaining acceptance work are in
`tasks/plan.md`, `tasks/todo.md`, and `docs/implementation-status.md`.

For toolkit development, work under `toolkit/`; the root `src/` belongs to games
created from the template. Canonical Codex Skills live in `.agents/skills` and
shared package resources in `studio/`. Do not edit generated `toolkit/dist` or
`toolkit/resources`. The `.claude` tree is retained migration input and is not
part of the Codex runtime archive. Preserve upstream attribution and history.

Use Node.js 24–26. Install maintainer dependencies with
`npm --prefix toolkit ci --ignore-scripts`, then run `build`, `typecheck`, `test`,
and `test:pack` through `npm --prefix toolkit run <script>`. `test:browser` needs
an installed Chromium-family browser and uses an isolated temporary profile.
Do not call a skipped or unavailable browser/engine/host test a pass.

Confirm the goal and consequential decisions, then execute and verify within
the agreed scope. Reuse user authorization; ordinary file writes do not need
repeated permission prompts. Keep changes focused and test observable behavior.
Surface actual ambiguity before implementing a conflicting interpretation.

For game work in a template checkout, attach the toolkit and restore its archive
as described in README. Follow the relevant installed `game-studio-*` Skill.
Do not treat the fixed-step starter as a completed game or infer human play
acceptance from static checks, screenshots, or deterministic replay alone.
