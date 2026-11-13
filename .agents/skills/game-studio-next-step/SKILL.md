---
name: game-studio-next-step
description: Identify one next action from a game's prototype, play feedback, growth, stories or studio workflow, especially when resuming or unsure what comes next. Read-only orientation, not a full audit or implementation.
---

# Choose the next step

Give one concrete next action from actual project state and the user's latest
context. The main path is make, play, change, grow; the phase ladder is studio
mode. Do not write files, save checkpoints, change settings/stage, run tests,
start servers, spawn reviewers or automatically run the recommended workflow.

## Observe once, then route

Use the game root and pinned `node .game-studio/run.cjs`. Read `config get --json`
once; retain `data.settings` values/sources for workflow, rigor, stage, engine and
overrides. The CLI resolves local eligibility, rigor and stage-file fallback;
do not recreate precedence or turn an unset stage into Concept before inference.
A failed read is not an empty project or default tier.

Resolve `studio/docs/workflow-catalog.yaml` with `resource path ... --json` and
read that installed file. It defines ordered checks and required/repeatable flags,
not Skill availability. Enumerate actual `.agents/skills/*/SKILL.md` frontmatter
names/descriptions and other Skills the host explicitly exposes. Compare names
against catalog commands, ignoring the leading `$`; retain this inventory.

Read recovery context before choosing an action, at every tier:

- `checkpoint show --json` supplies fields, branch and warnings. Recorded claims
  are context, not proof of tests, live processes or completed stories.
- Inspect `production/session-state/active.md` marker lines and read only STATUS
  and CHECKPOINT regions. CLI preview can truncate and omits STATUS; supplement
  it with the full bounded regions, not the long narrative.
- Without markers read the last `## Session Extract`. Incomplete/duplicate markers
  or branch mismatch stay explicit; do not repair or assume the historical work
  applies to this branch. Missing context is allowed.
- Retain active task/epic, next step, blockers and open decisions. A user naming
  finished work supplies context, not a topic filter or permission to do more.

At effective `minimal`, read [minimal.md](references/minimal.md); ignore recorded
phase for routing. Otherwise read [studio.md](references/studio.md). Both finish
with [output.md](references/output.md).

When a branch needs the ten-source-file threshold, resolve `config get engine_row
--json` once. Use its actual `code_root` and excluded directories; count game
sources (.gd/.cs/.cpp/.h/.js/.ts as applicable), excluding framework, dependencies,
generated files, assets and tests. Ten files is navigation evidence, never proof
of a working game. Ambiguous/invalid roots stay unknown; do not count this toolkit
or assume every engine uses `src/`.

## Capability and evidence boundaries

Preserve the intended next outcome if its workflow is unavailable. Explain the
gap and give a concrete plain-language task or installation/restoration dependency;
do not present an uninstalled `$game-studio-*` as runnable, impersonate it, or skip
a real blocker for a later installed Skill. Only actual applicable Skills receive
invocation commands. The real `engine setup` CLI records agreed configuration;
it neither verifies an engine game nor replaces all setup-engine workflow work.

Prototype currently supports Web. Preserve Godot/Unity/Unreal choices and name
unsupported native-engine prototyping. A separate disposable browser sketch needs
that scope choice; it is not engine conversion or a supported `--path html` flag.
Growth is a distinct choice; iteration alone does not authorize it.

Presence checks, screenshots, replay and saved review files are observations, not
quality, human play or stage approval. Read relevant play/growth record content;
retain unknowns and contradictory evidence rather than certifying outcomes.
