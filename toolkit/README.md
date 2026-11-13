# Codex Game Studio CLI

Initial development alpha of a game development toolkit for Codex.
Requires Node.js 24–26. This build is distributed through GitHub as a `.tgz`
archive; it is **not published to the npm registry**.

```bash
npm install -g /absolute/path/to/t-x-r-game-studio-0.1.0-alpha.0.tgz
game-studio skills setup --scope user --target codex --dry-run
game-studio skills setup --scope user --target codex
game-studio init ./my-game --engine web
game-studio restore --project ./my-game --archive /absolute/path/to/t-x-r-game-studio-0.1.0-alpha.0.tgz
```

Open the game directory in Codex. Run `game-studio --help` for the implemented
command set. Use `node .game-studio/run.cjs` from the game root for its pinned
runtime. Normal game commands never download a missing runtime automatically.

`restore` writes only the private runtime package area plus npm's ordinary cache.
Dependency lifecycle scripts are disabled. Commit the runtime pin, lock,
`runtime.tgz`, launcher and integration manifest; ignore `node_modules`, cache,
backups and personal configuration. Later restores use the checked-in lock and
archive without requiring the original downloaded archive location.

Available operations include project attachment, configuration reads, global
onboarding setup, prototype scaffolding/import, static script checks, localhost
preview, deterministic Chromium replay and static Web export. The starter is a
skeleton for Codex to implement, not an automatically finished game.

The current source additionally implements `config set KEY VALUE`, with `--local`
and `--dry-run`, and `config get --system NAME`. These additions are not present
in the published `0.1.0-alpha.0` download. Configuration writes preserve comments,
reject conflicting changes and synchronize `production/stage.txt` for stage
edits. See the bundled `studio/docs/configuration.md` via `resource path` for
value syntax, local overrides and the distinction between recorded settings and
implemented enforcement.

Full upstream workflow/role migration, automatic hooks, engine build adapters,
upgrade and live Codex desktop validation remain incomplete. See the source
repository's README and `docs/implementation-status.md` before relying on an
unverified capability. Chrome is required for `capture`; it is never installed
automatically. `check` only parses classic JavaScript and reports unsupported
module/remote scripts as not assessed.

Source: [T-X-R/codex-game-studio](https://github.com/T-X-R/codex-game-studio).
Derived from [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios), under MIT.
