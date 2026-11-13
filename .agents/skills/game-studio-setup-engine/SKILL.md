---
name: game-studio-setup-engine
description: Choose and pin a game's engine and language, configure an existing Web project without converting it, scaffold a new project, or refresh and upgrade its version references. Use for Godot, Unity, Unreal or Web engine setup before implementation.
---

# Set up the game's engine

Work at the game root containing `.game-studio/run.cjs`. Read
`node .game-studio/run.cjs config get --json` and
`node .game-studio/run.cjs engine inspect --json`. Use effective workflow,
automation, always-ask categories, density and engine settings with their sources.
Missing runtime or failed reads are unresolved prerequisites; report the explicit
attach/restore action rather than manufacturing settings or assuming minimal.

At minimal, the design artifact is `design/game-brief.md`; setup normally runs
before it exists. Standard/full use `design/gdd/game-concept.md`. Missing design
is not permission to invent genre, input, dimension or platform.

## Choose the operation

- Engine and version supplied: reuse them; verify installation separately.
- Engine supplied: resolve and confirm its version; Web follows its own branch.
- No engine supplied: [select the engine](references/selection.md), retaining an
  existing engine before offering options for a genuinely new project.
- Web: [existing project](references/web-existing.md) when root `package.json`
  exists; otherwise [new Web starter](references/web-new.md). These replace
  editor version/risk/references/scaffold steps, not configuration readback.
- `refresh`: [refresh references](references/maintenance.md), keeping the pin.
- `upgrade [old] [new]`: [audit and upgrade](references/maintenance.md), with
  approval before updating the pin; no automatic game source migration.

Read each reference before its phase and reread the active phase after resuming.
Do not load Godot-only material on another engine.

## Configure the selected engine

1. [Version and knowledge risk](references/version-and-risk.md): selected vs
   installed version, executable provenance and uncertainty. For Godot, read
   [language choices and per-file rules](references/godot-language.md) once.
2. [Preferences](references/preferences.md): language, naming, input/platform,
   budgets and framework. Settle consequential choices and preserve existing ones.
3. [Configuration](references/configuration.md), with the applicable
   [commands](references/commands.md) and [routing](references/routing.md): show
   the concrete proposal; use `engine setup` for structured settings and their
   mirror, then scoped project-owned rich documentation edits.
4. [Version references](references/reference-docs.md): preserve existing checked
   notes, historical spans and other engines. New factual claims need actual
   sources; unknown facts remain explicit.
5. [Scaffold](references/scaffold.md): create only a missing authorized project;
   verify only with the actual supported engine. Unity/Unreal remain editor-owned.
6. [Read back and finish](references/verification.md): configuration, rich rules,
   pointer, references, coherence observations and actual execution evidence.

## Authority and persistence

This is configuration work, with no director gate. Reuse the user's scoped
setup/write/install decisions in guided mode; show a concrete preview and proceed
when already authorized. Ask for an unanswered consequential choice, a change to
settled choices, an unapproved install/download, or an expanded write scope.
A skipped question is not an answer: use the available question tool or a short
numbered question and end the turn awaiting the owner. Do not choose for them.
Read-only planning changes no project files.

`project.yaml` is primary; `docs/technical-preferences.md` is its project-owned
mirror plus rich conventions. Use the installed settings API, not manual YAML
edits. `engine setup` guards its paired write; later rich-document edits are
separate operations, not a claimed atomic workflow. Inspect existing text and
retain unrelated sections/comments/history. Reconcile conflicts explicitly;
never delete approved Both/routing notes just to make a validator accept a write.

Resolve helpers with
`node .game-studio/run.cjs resource path <resource-id> --json` and execute only
the returned installed path. No retained migration-source runtime dependencies.
Do not hand-edit installer-owned `AGENTS.md`, installed role files or global Codex
configuration. Native engine specialists that are unavailable remain unavailable;
a generic agent is not an equivalent specialist. Setup does not require spawning
reviewers or accepting any game quality gate.

Use uniquely owned temporary files/directories for any input draft and clean up
only those owned paths. Do not stage, commit or publish unrelated work. The
separate existing-Web hook branch has its own explicit checkpoint/commit scope.
Report actual partial completion and blocked checks; `COMPLETE` describes settled
configuration, never proof of a playable game, installed toolchain or human QA.
