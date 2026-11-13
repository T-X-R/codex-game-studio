# S051 Web scaffold — Codex integration contract

Source: `.claude/scripts/web-scaffold.sh`, `.claude/engines/web/scaffold/**`,
`.claude/engines/web/starters/{three,phaser,pixi}/**`, setup-engine
`references/web.md` W2–W7 and `references/7.5-scaffold.md` Web branch. Legacy
paths are source attribution only; no installed resource reads that tree.

## Existing command and transaction

```text
game-studio engine scaffold --project ROOT --starter none|three|phaser|pixi
  [--title TEXT] [--gitignore] [--dry-run] [--json]
```

`planEngineScaffold(root, {starter?, title?, gitignore?})` keeps the existing
Godot/editor behavior and delegates the Web branch to a private planner. The
caller uses the existing `describePlan` / `applyInstall` transaction. No new
top-level command, shell helper, settings key or separate transaction exists.
Web-only options on other engines fail rather than silently changing behavior.

A missing starter remains an unanswered choice: no plan writes, `not_assessed`,
and all four choices returned. `none` must be explicit. An existing package.json
entry refuses with `EXISTING_WEB_PROJECT` / exit 3; it belongs to the existing-Web
recording workflow, not growth or conversion. Other existing template targets
(including directories or identical files) fail with FILE_CONFLICT before any
writes. Symlink destinations/ancestors follow the shared safePath rejection.

The explicit engine.version must equal the bundled **Vite** pin. A Phaser/three/
Pixi version is never substituted for engine.version. A mismatched, omitted or
unknown pin returns SCAFFOLD_CHOICE_CONFLICT / exit 3, without changing settings.
Project configuration is observed and guarded; it is not updated by scaffolding.

Title precedence is explicit `--title`, project.name, then the project directory
name. Empty/NUL titles fail. HTML text escapes &, < and >, once; literal `$&` and
`@TITLE@` inside an owner's title are not replacement instructions. Nothing is
passed through a shell. The starter's package name remains source `web-game`;
it is not derived from arbitrary display text or quietly changed in the lock.

Absent .gitignore is created from the template. Existing .gitignore is preserved
unless `--gitignore` explicitly authorizes appending its missing exact lines.
Without the flag, missing patterns are reported and the original is guarded.
With the flag, existing bytes/BOM and LF/CRLF convention remain; only absent
patterns are appended under the Web output header. The BOM is ignored only for
first-line pattern comparison; original bytes are retained. Complete rules are a no-op.
Invalid UTF-8, symlinks and nonregular ignore files are preserved and rejected.

The plan guards project.yaml, every target, and the original .gitignore. The
existing transaction checks all before-images, serializes writers, rechecks
before each write and preserves its normal journal/backup/recovery behavior.
It does not claim protection against malicious concurrent directory replacement
outside that existing transaction contract. Source resources are read into the
plan: apply uses those planned bytes, not a later reread of mutable templates.
No game source becomes installer-owned or is removed by detach.

## Resources and preserved behavior

All four choices install exactly 14 project files. `.tmpl` is removed from
`.gitignore.tmpl` and the two installed test names. The suffix keeps the ignore
template inside npm archives and test templates inert inside the toolkit repo.

- Reuse the five files under `studio/templates/web-growth`: package.json,
  package-lock.json, vite.config.ts, tsconfig.json, playwright.config.ts.
- Reuse `studio/templates/web-growth-support/hook.ts` as src/hook.ts.
- Add eight files under `studio/templates/web-setup`: .gitignore.tmpl, index.html,
  data/config.json, assets/provenance.yaml, src/main.ts, src/game/rules.ts,
  tests/unit/rules.test.ts.tmpl and tests/integration/boot.spec.ts.tmpl.
- Add three files for each library under `studio/templates/web-starters/<name>`:
  package.json, package-lock.json and src/main.ts. These override only those
  base destinations. They do not replace shared tests, rules or the hook.

The common package, lock, TS/Vite configs and hook match their original source
bytes. The reused Playwright config intentionally replaces the source legacy
Bash/browser discovery with GAME_STUDIO_BROWSER or Playwright's installed browser.
It retains tests/integration, 1280×720, CI forbidOnly and the three software-WebGL
arguments; it declares no dev server. The maintainer/caller may resolve an
installed Chromium with existing toolkit discovery and pass its path explicitly.
No browser or dependency is automatically downloaded by the planner.

| Choice | Preserved renderer, loop and manual stepping | Library pins |
|---|---|---|
| none | Canvas2D/WebAudio; own fixed-step accumulator; manual query disables animation/timer loop | none |
| three | WebGLRenderer, scene/camera/lights/mesh; HTML words; Timer from injected clock and setAnimationLoop; manual query disables loop | three 0.186.1, @types/three 0.186.0 |
| phaser | Phaser scene/game, fit scaling and native game loop; manual loop.sleep and game.step(time, delta) | phaser 4.2.1 |
| pixi | async Application.init, stage/ticker, scaled canvas; autoStart:false and ticker.update(time) while manual | pixi.js 8.22.0 |

All retain title/play/pause, physical key input, blur reset, sound/mute on user
gesture, configurable speed/volume, fixed 1/60-second rules, clamping, same seed
RNG, scene query and window.game scene/state/press/hold/step. Phaser/Pixi draw on
each native frame, so draw=false is not independently implemented there, as the
source states. Do not equate arbitrary projects using those libraries with this
starter's explicitly implemented deterministic manual loop.

All direct tooling pins remain source exact: Vite 8.3.4, TypeScript 7.0.2,
Vitest 5.0.5, Playwright 1.64.1, vite-plugin-singlefile 2.3.3. Each manifest and
lock root/direct package record must agree. Four original lockfiles remain
byte-exact; no regenerated lock, latest lookup, fallback library, name rewrite,
script rewrite or dependency downgrade is used to make a test pass.

The seven original npm scripts remain: dev, build, build:single, test, test:unit,
test:e2e, smoke (test composes both unit/e2e operations).
`build` typechecks then emits dist; `build:single` emits a self-contained
HTML file; unit tests target pure rules; e2e builds single before Playwright;
smoke selects @boot. The source three unit tests and two browser tests remain,
including hook-ready wait, zero console/page errors, real canvas dimensions,
manual Enter/movement, 60 steps and two exactly matching same-seed states.
These are retained tests, not a claim that they have run.

## Result and acceptance boundary

JSON includes the actual current Node version, source game's Node range, selected
starter/libraries/toolchain pins, missing gitignore lines, full described plan,
outcome and verification. The toolkit runs on Node24–26; the source toolchain's
range is `^22.12 || ^24 || >=26`. Merely executing this planner does not certify
that dependencies, a compiler or browser are installed or usable. Dry-run makes
no target/journal/backup changes. Successful apply means files created, while
verification remains not_assessed and dependencyInstall remains not_run.

Source W5/W6 dependency installation, build, unit/browser interpretation,
screenshot opening and play acceptance remain separate authorized operations.
Keep a missing browser/offline install/lock mismatch/error as a named incomplete
or failed result; do not substitute mocks or change pins to obtain a green run.
A shipped tiny square game is scaffolding, not a completed game or human play
acceptance. W4's seven engine-reference documents and full S051 Skill integration
remain a separate packaging/workflow obligation.

## Explicit migration differences and checks

- The original helper copied around existing non-package files one at a time.
  This planner rejects any conflicting template target up front and uses the
  existing all-before-image transaction, avoiding a partially mixed scaffold.
- Missing starter is an unanswered choice rather than Bash's implicit none.
- No duplicated Node executable probe: report the actual running Node and the
  game's declared range, without launching processes or certifying toolchain use.
- CLI uses the established --project and --dry-run route; no separate --list
  command is needed because the dry-run returns every planned destination.
- Guided authorization can cover the creation and explicit gitignore addition;
  it cannot turn an unanswered starter or separate install decision into consent.

Maintainer tests cover all four manifests/locks/paths, real CLI dry-run/create,
non-Web option rejection, title escaping/defaults, existing files, directory
symlinks (Windows junction/POSIX symlink), UTF-8/BOM/newlines, missing-only ignore
rules, late config/target/ignore conflicts, no process/install, and unchanged
configuration. Existing Godot/editor tests remain intact. Package installation,
real engine build/unit/browser results and source-to-candidate hashes are
separate retained evidence; static or plan tests never stand in for them.
