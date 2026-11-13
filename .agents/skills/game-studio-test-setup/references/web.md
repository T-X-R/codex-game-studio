# Web test setup

Read actual package.json, lock, scripts, tests and existing Playwright config.
Use the installed web-detect resource for observations when needed; inspect its
diagnostics rather than treating incomplete scans as absence. The studio Web
starter uses Vitest for Node-only game rules and Playwright for the built game.
An existing Web game may use a different bundler/language/runner; the helper
uses its actual detection results for README/CI, not a forced Vite record. Do not
convert scripts, dependencies, tests or config merely because the studio starter
uses Vitest/Playwright. Missing/incompatible runner setup remains a concrete need,
not an invented starter dependency or test result.

## Use the shared missing-only scaffold

The source requires a deterministic scaffold, not hand-authored approximations
of its Playwright file. Use the exact installed test-scaffold invocation in
setup-and-summary.md and inspect its actual plan. If it is unavailable, the Web scaffold remains
pending: do not invoke an unimplemented command, the retained source script,
or engine scaffold against an existing package.json as a substitute.

The helper's applicable Web outputs are tests/README.md,
production/qa/evidence/.gitkeep, tests/unit/.gitkeep,
tests/integration/.gitkeep, playwright.config.ts,
.github/workflows/tests.yml and tests/smoke/critical-paths.md. It preserves every
existing file. Copy the canonical installed
`studio/templates/web-growth/playwright.config.ts` for an applicable missing
Playwright config; it is the same config used by setup-engine and does not depend
on Vite or dist-single itself. At the default root it is byte-identical; for an
actual valid custom test root, the helper changes only testDir. A non-Playwright
project has a skipped config plus an explicit runner need, not an imposed choice. Do not overwrite
an owner's config or change renderer/browser behavior to make a test pass.
Existing starter example tests remain their existing bytes, not newly generated
“evidence”. This scaffold does not add invented tests to an unknown game.

Preview every path and unmet input, reuse the concrete approved scope, then apply
only missing files. Report all NEEDS observations: no package.json means engine
setup has not created the Web project; missing framework dependencies need an
explicit appropriate change; absent installed modules means a dependency install
is still needed. Unknown versions stay unknown. Resolve exact dependencies from
this project's accepted pins, not latest or a historical template's unrelated
Vite line. A helper's exit0 is an operation result, not framework readiness. The helper
can still create README/CI for an existing non-starter from its actual manager,
lock/test commands and an optional actual build command. Missing a resolved
frozen install, required test command or usable lock leaves explicit failing CI
placeholders and NEEDS, not passing empty steps. A project without a build script
does not gain a new blocker merely from this utility. Settle and implement the
actual framework/scripts as separate authorized work; do not change existing
package/lock/tests under this missing-only scaffold.

## README and execution boundary

For the compatible studio starter, document the actual existing scripts:

```text
npm test              # Vitest, then Playwright
npm run test:unit     # Vitest only
npm run test:e2e      # build:single, then Playwright
npm run smoke         # build:single, then the @boot test
```

Vitest selects tests/unit/**/*.test.ts for pure rules under src/game, in Node
without a browser. Playwright selects tests/integration and opens the actual
dist-single/index.html from disk; no server or port is needed. Preserve actual
roots/scripts for a supported intentional customization. The absence of these
scripts in a project intended to use this starter contract is a need, never
evidence the commands ran. Other projects retain their actual runner, scripts
and build/URL contract; these starter script names are not universal requirements.

The canonical config uses GAME_STUDIO_BROWSER for an explicitly chosen installed
browser, otherwise Playwright's installed browser. Resolve installed
`studio/scripts/page-shot.mjs` and use `--which` to observe the capture browser;
pass that exact path via GAME_STUDIO_BROWSER when using it for tests. Do not
claim the new config invokes the old source script automatically. A missing
browser remains NOT ASSESSED. Installing an appropriate Playwright browser
(such as the source's chromium-headless-shell choice) is a separately authorized
download, not an automatic response. No npm install or browser policy changes
are implied by scaffold approval.

With an actual valid npm lock and authorized dependency setup, use npm ci;
otherwise respect the project's manager/frozen install contract and explain
what is missing. No silent lock generation or unfrozen fallback. A dependency
install is distinct from tests; package scripts/network effects stay visible.

When asked to verify, use the installed bounded `test` command and separate new
evidence directories for unit and browser runs, with `--command` for the inspected
script when appropriate. Its report is raw command evidence, not the source
Bash runner's parser/orchestrator. Read real reporter logs/counts/failures/skips.
A chain that stops at Vitest has not run Playwright. Vitest “No test files found”
and Playwright “No tests found” (source exit1) mean NOT ASSESSED, no tests, not a
passing test or an asserted failing gameplay behavior. Preserve process errors.

For the compatible TypeScript/Vitest/Playwright starter, naming is
`[module].test.ts` for unit and `[system].spec.ts` for integration. Preserve the
actual language, runner discovery rules and existing naming conventions for other
projects. Test descriptions state `[scenario] [expected]`, e.g. “keeps the square
inside the field”.
Retain arrange/act/assert, local fixtures, integration cleanup and meaningful
regressions; a placeholder or screenshot alone is not a behavior assertion.

The CI browser environment must select a real available executable explicitly
or record its absence; it must not depend on a retained migration directory.
No editor specialist or director gate applies to Web test setup. Real browser
execution, image inspection, human play and physical inputs remain separate
acceptance scopes from scaffold creation.
