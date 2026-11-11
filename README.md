# Codex Game Studio

A local game development toolkit for Codex: executable CLI operations, project
Skills and reproducible game-workspace setup. Codex handles reasoning and game
implementation; the toolkit handles deterministic file, replay and packaging work.

**Initial development alpha.** The executable Web path is implemented and tested.
The full migration of upstream workflows, roles and hooks is still in progress.
Codex desktop integration is a target, not yet a verified compatibility claim.
See [implementation status](docs/implementation-status.md) and the
[full migration plan](tasks/plan.md).

Derived from [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios).
Original history and MIT attribution are preserved; see [UPSTREAM.md](UPSTREAM.md).
This is an independent community project.

## Install from an archive

Requires **Node.js 24–26** and npm. Download the `.tgz` and checksum from this
repository's GitHub release. There is no npm registry publication for this alpha.

```bash
npm install -g /absolute/path/to/t-x-r-game-studio-0.1.0-alpha.0.tgz

game-studio skills setup --scope user --target codex --dry-run
game-studio skills setup --scope user --target codex

game-studio init ./my-game --engine web --dry-run
game-studio init ./my-game --engine web
game-studio restore --project ./my-game --archive /absolute/path/to/t-x-r-game-studio-0.1.0-alpha.0.tgz
```

Skill setup installs one onboarding Skill in `$CODEX_HOME/skills/game-studio`, or
`~/.codex/skills/game-studio` when `CODEX_HOME` is unset. Use `--home <codex-home>`
to choose another Codex home. Start a new Codex session if it is not discovered.
Project workflows are installed under the game's `.agents/skills/` directory.

Open `my-game` in Codex CLI or the desktop app, then describe the game:

> Use Game Studio to prototype a fishing game where rare fish appear at dusk.
> First settle the core loop and visual direction, then build and verify it.

The default is guided execution: settle goals and key decisions, then implement
and verify within that scope without asking permission for every file. The starter
is a fixed-step skeleton; Codex still needs to implement the actual game.

## Existing project or repository template

Inspect and attach instead of initializing over existing files:

```bash
game-studio attach --project ./existing-game --dry-run
game-studio attach --project ./existing-game
game-studio restore --project ./existing-game --archive /absolute/path/to/t-x-r-game-studio-0.1.0-alpha.0.tgz
```

The same commands work with a clone or a GitHub template copy of this repository.
Existing source, game dependencies, instructions and `project.yaml` are preserved.
Edited or colliding managed files block installation instead of being overwritten.
The root `src/` and root `package.json` remain available for the game; toolkit
implementation and its maintainer dependencies live under `toolkit/`.

Commit `.game-studio/package.json`, `package-lock.json`, `runtime.tgz`, `run.cjs`
and `install.json`, plus the installed integration files. The archive is kept in
the project so the lock does not depend on the original download location. On
another checkout, run `game-studio restore --project .` to use that lock. Restore
uses npm's cache/network as needed, disables dependency lifecycle scripts, and
never changes the game's own dependencies. A missing runtime is never fetched
implicitly by an inspection, workflow or hook.

## Executable operations

From a restored game directory:

```bash
node .game-studio/run.cjs doctor --json
node .game-studio/run.cjs status --json
node .game-studio/run.cjs config get modes.automation --json
node .game-studio/run.cjs prototype scaffold dusk-fishing --title "Dusk Fishing" --question "Does waiting for dusk change the player's choices?"
# Implement the game's loop and look in prototypes/dusk-fishing/.
node .game-studio/run.cjs check prototypes/dusk-fishing --json
node .game-studio/run.cjs preview prototypes/dusk-fishing --json
# Stop the foreground preview with Ctrl-C when finished.
node .game-studio/run.cjs capture prototypes/dusk-fishing --log "Enter ArrowRight:1.5 wait:1" --seed 7 --json
node .game-studio/run.cjs package prototypes/dusk-fishing --output builds/dusk-fishing-v1 --json
```

`capture` needs an installed Chromium-family browser. Set `--browser <path>` or
`GAME_STUDIO_BROWSER` if discovery cannot find it. Each run uses a temporary game
copy and isolated browser profile, saving its report, browser log and screenshot
under a new evidence directory. Replay inputs are **space-separated**. Browser
replay, static parsing and human play acceptance are distinct observations.

Use `game-studio --help` and `game-studio schema <command> --json` for the actual
installed API. Commands not listed there are not implemented in this alpha.
Finite commands return one JSON result; foreground preview returns its readiness
result and stays running. Exit codes distinguish bad input, missing capability,
file conflicts, failed checks, timeout and interruption.

## Recovery and removal

```bash
game-studio recover --project ./my-game --dry-run
game-studio recover --project ./my-game
game-studio detach --project ./my-game --dry-run
game-studio detach --project ./my-game
game-studio skills remove
```

Recovery only rolls back an interrupted integration transaction after its writer
has exited, and refuses to overwrite subsequent user changes. Detach restores or
removes unchanged owned integration files; game artifacts, runtime archives,
dependencies, lock and backups remain. Resolve conflicts explicitly. Automatic
version upgrade is not available yet.

## Develop the toolkit

```bash
npm --prefix toolkit ci --ignore-scripts
npm --prefix toolkit run build
npm --prefix toolkit run typecheck
npm --prefix toolkit test
npm --prefix toolkit run test:pack
npm --prefix toolkit run test:browser
npm pack ./toolkit --pack-destination /path/to/output --ignore-scripts
```

`test:pack` bootstraps a real archive install, fetching dependency metadata when
needed, then verifies subsequent project restores with npm offline mode. `test:browser` requires an
installed browser. Neither test downloads a browser automatically.

Canonical Codex content lives in `.agents/skills/` and `studio/`. Build output in
`toolkit/dist/` and `toolkit/resources/` is generated. The retained `.claude` tree
and older upstream documentation are migration inputs, excluded from the CLI
archive. Current project Skills cover start, prototype and next-step; they are not
a claim that all 75 upstream workflows or 49 roles have been migrated.

See [host compatibility](docs/codex-compatibility.md),
[implementation status](docs/implementation-status.md),
[migration inventory](tasks/migration-inventory.md) and [remaining tasks](tasks/todo.md).
