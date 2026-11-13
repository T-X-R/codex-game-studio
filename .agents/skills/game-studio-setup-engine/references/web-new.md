# New Web project: choose, scaffold and observe

Use this only when no root package.json exists. An existing package routes to
[web-existing.md](web-existing.md), never into a template conversion. Do not load
Godot language tables or look up latest package versions here.

## Node, starter and exact pins

Observe `node --version`. The source game tools declare
`^22.12 || ^24 || >=26`; the Codex toolkit itself supports Node24–26, which also
satisfies that game range. Do not misstate every version above22.12 as supported
(e.g. the source range excludes23/25). Missing/unsupported toolkit Node stops
this setup tooling with an explicit install/use-supported-Node handoff; no silent
download. The standalone prototype workflow can be offered separately, not
claimed to have run.

If the owner already named a starter, reuse it and say so. Otherwise ask once:

1. Nothing extra (Recommended): browser drawing and Web Audio, minimal2D setup.
2. three.js: 3D rendering.
3. Phaser: 2D framework, sprites/physics/scenes.
4. PixiJS: fast2D drawing.

The raw selected value is none/three/phaser/pixi. Each starts with the same small
title/moving-square game and actual game-state hook, not a completed game.

Read the installed resources, resolved through resource path:
`studio/templates/web-growth/package.json` and package-lock.json for common
Vite/TypeScript/Vitest/Playwright tooling; for a library use
`studio/templates/web-starters/<starter>/package.json` and package-lock.json.
Read installed `studio/engine-reference/web/VERSION.md`. Compare **each** pinned
tooling/library version in the reference against its selected package/lock.
A discrepancy stops setup and names every mismatch; no silent version bump,
lock rewrite or template-date update. `engine.version` is the selected Vite pin,
not Phaser/three/Pixi or the model's remembered latest version. Bundled version
facts remain historical; treat API knowledge conservatively HIGH risk.

## Values and references

Use engine Web, TypeScript, selected exact Vite version; rendering Canvas2D,
three.js (WebGL), Phaser4 or PixiJS8 according to actual selected pinned resource;
physics none. Shared routing points code/shader/UI to lead-programmer, with no
additional engine specialist. Classes/types/interfaces PascalCase,
variables/functions camelCase, module constants SCREAMING_SNAKE, handlers
on<Event>, files kebab-case; machine signals on_event_name and scenes snake_case.
Default code root src is from the table, not a redundant explicit override.

Commands: build `npm run build`, test `npm test`, run `npm run dev`, smoke
`npm run smoke`. The run command is a persistent development server for the owner;
setup checks never launch it. Rich stack records Vite dist and single-file build,
selected library/pin, and plain assets imported by code. Follow configuration.md
for structured pair and rich document edits. Use the reference initializer only
for a completely absent Web reference directory; preserve existing material.
Template reference pins do not establish installed packages until npm ci succeeds.

## Create and install

Preview `node .game-studio/run.cjs engine scaffold --starter STARTER --title TITLE --dry-run --json`
with the actual title (brief/project title, else folder). Review all target files,
selected pins and missing ignore patterns. Reuse scoped authorization or settle
it; apply the same arguments without --dry-run, adding `--gitignore` only when
appending missing existing ignore patterns was authorized. The scaffold refuses
an existing package or conflicting template path; it does not overwrite or
assemble a partial mixed starter. Report the conflict and preserve all files.

Show `npm ci` before installation: exact lock dependencies, network/cache and
package lifecycle policy may apply. Reuse an explicit install authorization;
otherwise ask. Declined/offline/unavailable installation leaves build/tests
pending. Retain actual errors, including lifecycle warnings; do not trust scripts
or change npm/global policy to hide a failure. Never fall back to npm install,
update locks, or change pinned packages to make installation pass.

## Build, unit, browser and image

Resolve `studio/scripts/page-shot.mjs`, then invoke its installed path with
`--which`.
Use the selected installed executable through GAME_STUDIO_BROWSER for the
starter's Playwright config. Do not download a browser implicitly. If none is
available, offer an explicit Playwright browser install as a separate authorized
download; declined/unavailable browser is `NOT ASSESSED — browser tests`, while
unit results retain their own status.


Do this browser discovery/selection before the e2e invocation below; if browser
setup is declined or unavailable, run only the supported build/unit operations.

Use the installed bounded `test` command with separate output directories so
raw command/code/log evidence survives:

1. `test --kind build`: configured npm run build (typecheck then dist).
2. `test --kind test --command "npm run test:unit"`: actual Vitest run.
3. `test --kind test --command "npm run test:e2e"`: actual build:single then Playwright.

Invoke these through `node .game-studio/run.cjs test`, adding a distinct
`--output NEW_DIRECTORY --json` to each operation.
Read the installed package scripts first, and report the actual executed script
and actual reporter results. The generic runner does not return source
`runner/rule` rows: identify real Vitest/Playwright counts/failures/skips from
the retained outputs, do not invent fields. Starter's source minimum is three
unit tests and two browser tests, but counts alone do not prove their assertions
or a finished game. A unit success does not cover a missing browser. A chained
npm test that stopped at unit failure has not executed browser tests.


Capture the actual single-file build with the installed page-shot wrapper:
`--project ROOT dist-single/index.html production/qa/evidence/setup-engine-web-UNIQUE`.
The output is a new evidence directory, not an overwriteable PNG argument.
Inspect actual returned PNG and console/uncaught logs. Describe what is visibly
present and any uncertainty; a screenshot file or exit0 does not establish that
all text, controls, rendering, input or audio works. Retain this first image as
evidence. No human play acceptance follows from deterministic tests/images.

Web has no engine specialist; the actual native lead programmer, if available,
checks APIs against the project's versions. A test-setup workflow would add CI
and a tests README; if unavailable, name that handoff as pending rather than
silently doing unrelated workflow or claiming it completed. Finish with the
shared verification/summary reference.
