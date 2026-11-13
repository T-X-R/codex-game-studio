# S074 test-setup — Codex source-mapped acceptance

Status: partial content integration. No native Skill behavior, actual engine/browser tests
or remote CI is accepted by this document. S074 remains open. Source: retained
`.claude/skills/test-setup/SKILL.md`, all six references, original
`studio-tests/skills/utility/test-setup.md`, the shared test-scaffold source and
its referenced test standards. These are migration inputs, not runtime paths. Adapted from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios); preserve its upstream attribution and history.

## Complete source map

| Source contract | Codex location / retained meaning |
| --- | --- |
| Entry, force, Technical Setup | SKILL: six phases; optional force means fill missing, never overwrite; before first implementation/sprint; no director gate |
| Modes/preprocessing/model | Explicit actual settings/provenance; no shell preprocessing or model/tool/permission pins; guided scope reuse and unknown choices wait |
| 1 engine detection | setup-and-summary: nonempty primary then real preference fallback for absent/empty/null; explicit UE5 read alias with raw/source/warning; invalid primary and true engine conflict refused; no guessed markers |
| 1 existing-state checks | actual test roots/runner/CI/package/config; core existing early exit with no writes or redundant approval; partial and force inspect missing paths |
| 2 concrete plan | actual new and skipped paths + prerequisites; shared README/smoke/evidence, selected engine roots and CI; existing authorized scope reused |
| 3 common README | actual engine/version/framework/date/layout/commands/naming; full five story types/evidence table; correct engine roots; production/qa/evidence, not tests/evidence |
| 3 Godot | godot: native gdUnit4 runner, no custom runner; import/cache; port0/headless flags; full failure/warning/no-tests codes; retained placeholder behavior and install steps |
| 3 Unity | unity: Assets/Tests EditMode/PlayMode, exact asmdef flags; installed test-package version; game asmdef visibility, real package refs and Editor-only assemblies; two fresh result files and zero-count distinction |
| 3 Unreal | unreal: compiled module root, distinct actual project/target/filter, WITH_DEV_AUTOMATION_TESTS, EditorContext/ProductFilter, unique classes; build before tests, absolute paths, Windows/Linux/macOS boundaries, failure/no-match interpretation |
| 3 Web | web: shared deterministic missing-only scaffold, exact canonical Playwright config, per-path outcomes and NEEDS; original tests untouched; Vitest/Playwright scripts, disk build, actual browser and no-tests distinctions |
| 4 shared CI | ci: push/main + PR/main, action refs, result uploads on failure, prerequisites; no automatic remote settings/merge protection claim |
| 4 Godot CI | installed committed gdUnit4, full selected release, checks:write, both roots, Run GdUnit4 Tests job check vs publication check, reports upload |
| 4 Unity CI | separate editmode/playmode, distinct artifact paths, manual UNITY_LICENSE, actual execution only when observed |
| 4 Unreal CI | self-hosted windows, actual UE_ROOT/project/target/filter, editor build, quoted Bash script placeholder, logs/stdout, no-test/failure evidence |
| 4 Web CI | Run Web Tests; source Node24 and compatible-starter npmci defaults, actual manager/lock/test and optional real build; declared runtime/manager needs explicit; installed browser env for actual Playwright, failure artifacts; no download implied |
| 5 smoke seed | setup-and-summary: all eight source entries, under15min aim, future mechanic/save/load/core-loop conditions and target hardware; planned checks not observed success |
| 6 finish | actual created/preserved/blocked list, installation→first test→applicable qa-plan→smoke handoffs; minimal no sprint; minimal automated waiver not UI/Visual waiver; correct gate roots+example+CI; COMPLETE scaffold not test pass |
| Protocol | no overwritten original file even under force; no engine guessed, no license automation, no gate; actual effects and unresolved needs retained |

## Dependencies and intentional Codex corrections

Available interfaces: pinned config get and engine inspect/engine_row, resource
path, engine setup/config APIs if a separately authorized configuration repair is
needed, bounded `test` with actual command/source/processExitCode/raw logs,
md-section observations/scoped writes, page-shot --which, canonical Web Playwright
config and starter tests. They do not collectively replace missing-only test
scaffolding. `engine scaffold` preserves an existing Web package and must not be
misrepresented as test repair. The dedicated test-scaffold internal helper is
integrated with separate helper and installed-archive verification; it does not
prove this Skill's native workflow. Verify the caller's installed runtime
contains it before dependent execution. No pseudo CLI is permitted.

1. Canonical project preferences replace mandatory source-era metadata paths;
   compatible legacy read observations are allowed through the reader,
   not direct dependence on the retained tree. The companion read compatibility
   preserves empty/null fallback and explicit case-insensitive UE5→Unreal with
   raw/source/warning; write enums remain unchanged. Invalid nonempty primary
   values and real conflicting engine selections are not silently overridden.
   This requires the corrected installed reader/helper, not a config rewrite.
   Runtime model/effort/permissions
   are inherited. No Hook trust/config changes or installed-role mutation.
2. Approved guided writes proceed continuously; source's repeated new-file
   confirmation is superseded by the user's settled mode. Unanswered choices,
   additional package/assembly/remote effects retain real authorization scope.
3. Core early-exit is source structural behavior, not a “tests passed” verdict.
   Source Case3 does not require missing README/smoke/evidence to be created first.
4. Skill/spec Godot .gdignore_placeholder and old helper .gitkeep differ. Neither
   is .gdignore or a test. Root selected the Skill/spec names for the migrated helper; preserve old
   .gitkeep files rather than renaming/deleting. This discrepancy is not silently erased from acceptance.
5. Source catalog says “and an example test”; source Godot/Unity/Unreal phases
   scaffold infrastructure and put writing an example in next steps. Do not
   invent game assertions. Keep an actual example as the standard/full gate
   prerequisite and report it missing when absent; Web starter examples count
   only when actually present and meaningful, not because config exists.
6. Actual engine roots and module metadata replace guessed hardcoded modules.
   Unreal project/editor target/module/filter are distinct, including common-name
   collision prevention. Host shell syntax replaces the source's Windows Bash
   pwd substitution; quoted CI Bash remains an explicit separate shell context.
7. Unity fresh unique result paths preserve the source's no-stale-results
   invariant without deleting retained evidence. Old output is never passed
   off as a new result. Existing assembly files remain protected.
8. Web preserves an actual existing runner/toolchain and never blindly labels
   it Vite. GAME_STUDIO_BROWSER replaces the old automatic source-script lookup.
   A mismatched existing project is a prerequisite/choice, not automatic conversion.
   CI uses generic Run Web Tests; starter TypeScript filenames/scripts do not
   override another runner. An actual build command is optional. Declared
   engines.node and packageManager constraints remain comments plus ci_runtime /
   ci_package_manager NEEDS until settled; default Node24 is not asserted compatible
   with every project and no semver evaluator/version installation is implied.
9. Generating tests.yml cannot enable branch protection, secrets or a runner.
   Report those real prerequisites rather than repeating the source's unconditional
   merge-blocking assertion. Source action majors are retained, not latest pins.
10. Unknown/zero tests, package/runner absence, invalid paths, unreadable reports,
    partial chained execution and unrun modes remain explicit. Generic `test`
    output is not the source Bash parser's schema or a quality verdict.

## Original five cases — every case pending native acceptance

Keep original requests unchanged; neutral routing can select the namespaced
installed Skill without appending expected outcomes. All source default fixtures
are minimal/collaborative without a project.local.yaml. Expectations stay in
maintainer files, never inside native requests or synthetic project documents.

| Source case / request | Fixture and full acceptance |
| --- | --- |
| 1 `/test-setup` | configured Godot, no tests/plugin/CI; genuine plan approval or accurately labeled synthetic dialogue; report missing states, no runner script, correct retained folders/evidence, complete gdUnit command, plugin install handoff, installed-plugin CI with checks write/full-release need, actual scaffold COMPLETE only |
| 2 `/test-setup` | configured Unity, genuine manifest test-framework dependency, no Assets/Tests; exact Editor/Play asmdefs at compiled roots; two local and CI modes/results; manual license note and engine-specific gate roots; preserve all originals |
| 3 `/test-setup` | Godot unit/integration/CI/runner already exist; early exit, force hint, zero writes and no approval question; do not repair missing README as a side effect |
| 4 `/test-setup` | no engine.name and placeholder preferences; inspect fallback then explicit setup-engine handoff; no writes and not COMPLETE |
| 5 `/test-setup` | configured engine, no infrastructure; all applicable scaffolding with real scope; zero director dispatch, no gate IDs or fabricated gate skips |

Original “user approves” fixture text is a scenario, not a real response. Native
continuation must log actual question/answer provenance; an unavailable question
surface cannot auto-select or imply consent. A controlled scripted answer can
be labeled synthetic behavior coverage, never real user/desktop acceptance.

## Required branches beyond the original five

| Area | Cases and evidence still needed |
| --- | --- |
| force/preservation | partial dirs, customized tests/README/CI/runner, wrong engine's old files, directory/link at a target, late conflict; force creates only missing paths and never changes existing bytes |
| settings | missing/empty/null/invalid primary; canonical/legacy preference fallback/UE5 alias; config precedence; valid/missing/unsafe/case-mismatched root override; engine never inferred from marker |
| Godot | missing plugin, wrong case, import cache failure, real0/no-tests,100,101,103/104,105; full/series/unknown version; known portzero messages vs real script errors; C# scope explicitly unverified unless actually exercised |
| Unity | package absent/unknown bundled version, declined install, default Assembly-CSharp, needed package refs, nested Editor folders, owner asmdefs preserved, actual Edit+Play reports, compile failure/no XML/stale XML/zero tests/nonzero errors, license unavailable |
| Unreal | actual module differs from uproject, editor target differs, distinct filter/common-name collision, no/ambiguous module, Blueprint-only, editor build failure, matched/failed/no-match logs, real Windows/Linux/macOS boundaries, runner path spaces |
| Web | all compatible studio starters, complete/partial config, shared Playwright copy (only testDir adapts to a valid root override), actual non-starter runner not converted, missing package/required install-test scripts/dependencies/lock/browser, absent optional build accepted, declared Node/manager requirements kept as needs, actual non-TypeScript naming retained, failed npmci, separate actual unit/e2e evidence, zero tests, game bytes preserved |
| CI | full selected release vs unresolved placeholder, existing workflow never overwritten, parsed YAML and actual engine-specific params, secrets absent, nonrequired check cannot block merges, real remote job separately authorized/recorded; no source path dependency |
| summary/tier | created vs skipped vs missing, evidencepath consistency, first example not fake, minimal workflow no sprint/low QA waiver, standard/full actual root+example+CI gate prerequisite, unavailable downstream workflow named |
| modes/hosts | guided prior authorization reused, collaborative waits, autonomous remains within permissions, skipped answer no write, resume rereads current phase; actual CLI and desktop coverage separate |

## Evidence standard

Static validation checks frontmatter/links/resource references, source mapping
and parseable samples only. It is not behavioral acceptance. The helper needs
its own actual isolated dry-run/create/preserve/conflict/package checks, retaining
source differences and all initial failures. These cannot substitute for native
Skill runs using the actual installed content.

A future native host records archive and installed Skill/helper hashes, original
and full actual request hashes, complete visible commands/transcripts/final answer,
model/effort/permission inheritance and any real role identity, plus all project
before/after bytes and output paths. Read every produced README/asmdef/workflow/
smoke file; compare real reporter/error evidence before verdicts. Preserve failed
attempts and missing capabilities. No opaque dispatch decryption, automatic Hook
trust, remote CI, physical-input or human-play claim from a local static check.
