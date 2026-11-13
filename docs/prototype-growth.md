# Web prototype growth

The CLI provides a read-only prerequisite check and an explicit JavaScript copy
stage. The installed prototype Skill now guides the subsequent semantic conversion;
broader game, host and release acceptance remains open.

```sh
game-studio prototype grow-check demo --project /path/to/game --json
```

This inspects `prototypes/demo/`. It does not copy files, install dependencies,
execute game scripts, create commits or tags, or start a browser.

## Eligibility

The report checks that:

- The standalone prototype has a regular `index.html`. Concept, engine-spike
  and vertical-slice names are not eligible for this Web growth path.
- The engine is unset or `Web`, and its code root is unset or `src/`.
- No existing root game entry point, dependency manifest/lock, supported Web
  toolchain configuration, or game code in `src/` would conflict. Root
  `src/AGENTS.md`, `src/CLAUDE.md`, `src/README.md` and `.gitkeep` placeholders
  are retained. Nested README files count as existing game files.
- In a Git working tree, the prototype has no staged, unstaged, untracked or
  ignored code changes and the repository has no `grown/*` tag. Both paths of
  a rename are inspected. The prototype's `brief.md`, `evidence/` and `dist/`
  are excluded from the code-change check; dirty debrief files are listed
  separately without committing them.

Git inspection disables optional index writes and filesystem-monitor execution.
The report includes the latest source commit and existing `one-shot/<name>` tag
commit when available. A project without Git can be eligible with an explicit
warning that its unchanged prototype folder is its backup. A detected repository
that cannot be inspected is **not assessed**, rather than treated as absent.

Without `config.js`, the report warns that imported values have not been extracted
or assessed for tuning. No prototype JavaScript is evaluated by the check.

Exit `0` means the checked prerequisites passed; `4` means a conflict blocks
growth; `3` means the assessment could not complete. Invalid arguments use `2`.
The JSON `verification.state` remains `not_assessed` even for an eligible project:
eligibility is not build, replay, test or human-play evidence. A report is a
snapshot, not a reservation of paths or authorization for future writes.

## Copy into a Web project

```sh
game-studio prototype grow demo --stage copy --dry-run --project /path/to/game
game-studio prototype grow demo --stage copy --project /path/to/game
```

The explicit `--stage copy` is required. This stage supports one plain inline game
script, optional preceding `config.js`, and optional following `tune.js`. Other
script layouts require explicit conversion before any copy occurs; execution
order must be preserved and checked. The HTML shell is retained, the main script
moves to `src/main.js`, configuration is imported from `src/config.js`, and tuning
loads only in development. Configuration code is copied without evaluating it.
Extracting typed configuration data remains a subsequent conversion step.

The copy includes binary `assets/` with provenance and the prototype feel log at
`design/feel-log.md`. Other files needing migration are listed in `left` and in
warnings. Original prototype files, briefs and evidence remain unchanged.
New destinations must not already exist, even with identical content. Transactions
check source and target before-images, retain recoverable backups, and roll back
on failure; binary bytes survive both writes and recovery. Generated game files
are user-owned and are not deleted when the toolkit is detached.

The bundled toolchain preserves the upstream pins: Vite 8.3.4, TypeScript 7.0.2,
Vitest 5.0.5, Playwright 1.64.1 and vite-plugin-singlefile 2.3.3. Its package and
lockfile names are updated together. An explicitly different Web version blocks
copy until the engine choice is resolved. Existing `.gitignore` lines are preserved
and missing build-output entries are appended. The CLI does not install packages:
after the source review, use `npm ci --ignore-scripts`, `npm run build`, and
`npm run build:single` in the game directory. Review asset URL/import handling
before claiming either build is distributable.

`strict` stays enabled in the TypeScript configuration; the copy stage is still
JavaScript with `allowJs`. It does not generate pretend game-rule tests. The test
commands require the meaningful rule and browser tests created during conversion;
an empty test suite fails. For Playwright, set `GAME_STUDIO_BROWSER` to an installed
browser executable or explicitly install its Chromium browser.

The repeatable `toolkit/test/growth-smoke.mjs` fixture installs the real CLI archive
online, restores its project runtime offline using the populated dependency cache,
installs the locked game tools, builds both outputs and compares same-seed
Chrome states/screenshots before and after copy. It also checks source/binary
preservation, removal of development tuning from the build, and rejection of an
empty unit-test suite. See [recorded evidence](evidence/web-growth-copy-2026-11-12.json).
This small input/scoring fixture does not establish design quality, every possible
asset-loading pattern or human play acceptance. CI preserves its reports and images.
The fixture was also run with a fresh empty npm cache. Offline restoration alone
requires cached dependency metadata; an initial CI failure exposed that test setup
assumption, and the fixture now performs the actual first installation explicitly.

## Skill-guided conversion and remaining acceptance

The installed `game-studio-prototype` Skill routes a selected or resumed growth
request to its `references/grow.md`. The workflow preserves the source prototype, records a same-seed
reference, copies it into a pinned Web build scaffold, converts its code to
TypeScript without changing behavior, tests actual game rules, and compares the
built game's replay with the original. Engine configuration and a growth record
are completed only with the corresponding evidence. Imported scripts/assets,
tuning, alternative Web starters and human play remain part of that acceptance.

An independent evaluation resumed the actual packed copy, produced strict typed
modules and JSON configuration, and completed 5 unit tests, 3 Chrome integration
tests and 1 smoke test. A real rule mutation failed its score assertion; restoring
it passed. A separate verifier injected a type error to prove the build checks
game code, then reran build/tests/smoke and confirmed unchanged prototype hashes,
brief constraints, same-seed states and screenshot bytes. See
[the evidence](evidence/web-growth-skill-2026-11-12.json) and
[behavioral acceptance](../studio-tests/skills/utility/prototype-growth.md).
This verifies one small scoring/pause fixture through an explicitly supplied Skill;
it does not prove native discovery in either Codex host or the full S040 inventory.

The evaluation exposed and corrected a capture verdict bug: a driver `done` row
with missing hooks is no longer considered a completed replay. `capture` opens
its temporary copy from disk; Chrome may block a folder build's external ES
modules under `file://`. That path now returns exit 3 / `not_assessed` with its
diagnostics. Use `dist-single` for this capture path and test `dist/` over HTTP.
The original failed evidence was retained; a blank screenshot is not a passing run.

The check and copy commands do not close T15, S040 or C2. They are available in the
development source; the published `v0.1.0-alpha.0` archive predates these commands.
