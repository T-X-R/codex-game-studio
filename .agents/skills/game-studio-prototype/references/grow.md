# Grow an agreed Web prototype

Use this reference when the user wants a standalone prototype to become the main
Web game, or wants to resume that conversion. The outcome is the same game in a
typed, buildable project with meaningful tests and evidence. Copying files alone
does not complete growth. Ordinary game iteration stays in its current location
unless growth was selected; reuse an existing growth decision and authorization.

## Preserve the starting point

Read the brief, the prototype, installed CLI capabilities and current engine
choices. Keep the brief's Keep, Avoid and Out of scope text unchanged. Run
`prototype grow-check <name> --json`. A different engine or an existing main game
means this prototype stays separate unless the user makes a new scope decision.
Do not commit, discard or hide pre-existing game edits merely to clear the guard.
Dirty debrief files are separate from code; preserve their words and follow the
user's existing Git instructions. With no Git, keep the prototype as the backup.

For a resumed conversion, inspect the existing root package, code, evidence and
record; do not rerun the copy into an occupied root or overwrite that work.
Identify the last verified step and continue from it. Never install another tool
version merely to make a failed build pass.

Before editing game behavior or layout, record two runs of the original prototype
with the same seed and input sequence. Choose inputs that start the game and
exercise its core action, not just its title screen. Use separate, new evidence
directories under `production/qa/evidence/grow-<name>/`, for example:

```sh
node .game-studio/run.cjs capture prototypes/<name> --seed 7 --log "Enter Space wait:1 Space wait:1" --output production/qa/evidence/grow-<name>/reference --json
```

Repeat into `reference-repeat`. Adapt the keys to this game and retain the exact
seed, input string and hook mode for later runs. A reference is immutable: use new
directories for retries. Compare ordered scene/state/observable event rows,
completion and errors, and screenshot bytes; ignore timestamps and artifact paths.
Inspect the images as well. Non-repeating source runs mean exact equivalence is
not assessed, even if two screenshots look similar. Missing browser or unreachable
play also remains not assessed. Hookless imports use `--hookless` consistently;
their screenshots/errors cannot establish hidden-state equivalence.

## Copy without changing the game

Preview `prototype grow <name> --stage copy --dry-run`, then apply the authorized
copy. It brings pinned tooling, the HTML shell, JavaScript, assets and feel log;
it does not install dependencies or perform the later conversion. Review `left`,
warnings and the actual source for files or imports still needing migration.

The deterministic copy currently handles one plain inline script with optional
preceding `config.js` and following `tune.js`. For other script layouts, preserve
the original and implement an explicit copy plan using the bundled tooling from
`resource path studio/templates/web-growth`. Do not weaken the guard or replace an
existing root package. Carry additional scripts in their original execution order;
preserve shared bindings, browser globals and event handlers when turning them
into modules. Retain vendor licence/provenance. Use an already recorded exact npm
version for a vendor dependency; otherwise carry its local source and report that
choice. Review every asset URL: Vite must import assets for hashing/inlining; a
copied string URL alone does not prove the built game can load the asset.

Use `npm ci --ignore-scripts` with the generated lock, then `npm run build:single`.
Capture `dist-single` into a new `copy` evidence directory with the reference's
inputs. Resolve migration-caused differences before proceeding; do not edit the
reference or add a feature to explain a mismatch. Keep the prototype untouched.

## Convert by meaning, with strict types

Split according to the game: pure rules and state types in `src/game/`, input,
rendering and audio modules where those responsibilities already exist, and the
scene/loop coordination in `src/main.ts`. Extract real core-loop rules that the
running game calls; a duplicate function used only by a test proves nothing.
Preserve RNG call order, arithmetic, timing, state keys, scene names and controls.
Save behavior changes, renames for style and unrelated fixes for a later feature.

Move JSON-compatible configuration into `data/config.json`, keeping the same
keys, values, seed, slider bounds/steps and switch options. Retain useful units
and comments in `data/config-notes.md`. Functions, computed values, undefined and
nonfinite numbers must be handled explicitly in code rather than silently lost in
JSON serialization. Imported games without configuration may keep their values
in code until extraction is actually needed. Export typed `CONFIG` and live tuning
reads from `src/config.ts`; do not snapshot values that previously changed live.

Retrieve the shared hook with
`resource path studio/templates/web-growth-support/hook.ts` and adapt the game's
existing clock, seed, audio and installed hook to that contract while preserving
its behavior. When the game has a development tuning panel, the corresponding
`tune.ts` resource can be placed at `src/dev/tune.ts`: replace `@NAME@` with the
prototype identifier and load it behind `import.meta.env.DEV`. Ensure the panel
and game share the same mutable data object. Preserve any game-specific controls;
do not install a panel on a game that had none merely to satisfy this reference.

Keep `strict: true`. Type parameters, state, configuration, entities and saves;
do not silence the conversion with `@ts-nocheck`, blanket `any` or disabled checks.
If a large dynamic entity dictionary genuinely needs a temporary `Loose` alias,
isolate it in one types file and name each remaining use in the growth record.
Once game-owned JavaScript is converted, remove the superseded copies, point the
page to `src/main.ts`, and disable `allowJs` for those game sources. Vendor code
can remain an explicitly reviewed dependency. Run the actual TypeScript build and
capture a new `typescript` run against the unchanged reference.

## Test behavior and record the result

Write Vitest tests under `tests/unit/` for actual extracted rules, with tuning
values read from the data file. Check a real invariant or boundary, not a function
name or the generated source text. Temporarily break that rule, observe the test
fail for the intended reason, restore it, then retain the red/green evidence.

Write Playwright tests under `tests/integration/`: an `@boot` test for the game's
actual initial scene and visible canvas, plus a same-seed input scenario that
asserts the core action's observable result and repeatability. Capture page and
console errors for every run. Drive `window.game` only after its `step` function
is ready, using `?manual=1&seed=...`; do not assume the canvas's global name is the
hook. Use an installed browser via `GAME_STUDIO_BROWSER`, or explicitly install
Playwright's browser within the authorized setup. No browser means not assessed.
Tests must include the expected behavior; two equally broken runs are not a pass.

Run `npm test`, `npm run smoke`, `npm run build` and the final same-seed capture.
Keep the reports, logs and screenshots. Use `engine setup --input <file>` for the
agreed Web metadata and readable preferences, taking the actual Vite version from
the root package and preserving existing specialist/naming/command choices.
Update implemented Features in the main brief; leave the original prototype brief
unchanged. Record the source commit/hash, copy/conversion/test outcomes, evidence
paths, remaining `Loose` uses and every not-assessed item in `grow.md` beside the
evidence. A successful compile or deterministic trace is not human play acceptance.

Follow existing Git authorization for focused commits at verified boundaries;
use `one-shot/<name>` and `grown/<name>` tags only when appropriate and authorized.
Do not tag an incomplete conversion as grown. No automatic publish is implied.
Hand over the actual dev/build/test/smoke commands, what was proved, limitations
and the next agreed feature. Keep the session checkpoint current. Later features
use a new run and compare with the last accepted behavior; intended changes can
become the new accepted baseline after the user's decision, while old evidence
remains intact. Do not introduce a story/epic process unless the user selected it.
