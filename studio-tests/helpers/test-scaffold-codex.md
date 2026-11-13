# Portable test scaffold — source contract and acceptance

Source: `.claude/scripts/test-scaffold.sh` (878 lines), the six references under
`.claude/skills/test-setup/`, and `studio-tests/skills/utility/test-setup.md`.
These are migration inputs, never installed runtime dependencies. This helper
implements file creation, not the Skill's questions, early exit, engine/tool
installation, first example, QA planning, stage gate or test execution.

## Installed interface

Resolve `studio/scripts/test-scaffold.mjs` from the installed package:

```text
node <resolved-path> --project ROOT ENGINE [--dry-run | --list]
  [--module NAME] [--project-name NAME] [--test-prefix PREFIX] [--date YYYY-MM-DD]
```

ENGINE accepts Godot/Unity/Unreal/Web case-insensitively, not UE5. The shared settings reader normalizes only the source-explicit UE5 legacy alias
to Unreal with a warning and original annotation/provenance; the helper argument
still uses canonical Unreal. New settings writes do not accept the alias. ROOT is an existing project
root. The three name flags are Unreal-only. Project basename and module are
single letters/digits/underscore identifiers; the filter may be dot-separated.
The optional date retains source lexical YYYY-MM-DD validation and local-today
default. It is a setup date, not a test date. No public CLI command is added.

Source `--root` is now explicit `--project ROOT`; source `--project NAME` becomes
`--project-name NAME`. There is no overwrite/force option. Force belongs to the
Skill's already-present early-exit branch. No new test-root flag: effective
shared `project.yaml` engine.test_root or the installed engine-table default is
used. Shared engine fields ignore local overrides. Missing/empty/null primary engine values use the shared reader's selected
project-owned preference fallback. Other nonempty invalid primary values and
true engine conflicts are rejected before writes, not silently ignored. Version
uses that same effective reader with provenance, never an installed-editor guess
or template pin. No owner settings are rewritten.

`--list` emits project-relative paths only; no writes. Other modes emit JSON:
project, engine, mode, `qualityAssessed:false`, files, needs, warnings and counts.
Each file has path and CREATED / WOULD_CREATE / EXISTS / SKIPPED / FAILED;
planned/created bytes have sha256. Existing non-regular leaves remain EXISTS,
with reason and `expected_regular_file` NEEDS. Their preservation is not proof
the required file exists. engineSelection retains effective value/source and raw projectValue. The Web branch also retains the actual detector's
observations/provenance. No quality status is derived from these observations.
Exit0 can include NEEDS;3 means a path was skipped;4 means a path failed creation.
Usage/config/input failures use the existing StudioError/failure envelope.
`--list` and `--dry-run` are mutually exclusive; duplicate flags are rejected.

## Full source mapping

| Source surface | Portable behavior |
| --- | --- |
| lines119–162 names/version/date | Primary shared YAML through existing parser, actual separate Unreal descriptor/module/editor/filter observations, source date contract; unresolved values remain placeholders plus NEEDS |
| lines164–185 path inventory | Same README/evidence/engine-specific/CI/smoke order; configured engine-valid test root preserved; approved Godot placeholder correction below |
| readme_godot / ci_godot | gdUnit4 capital-U runner, import first, port-zero command, local all-suite versus CI unit/integration, leak warning and all source failure/no-tests meanings; committed runner version installed; reports artifact and check permissions |
| readme_unity / asmdef_edit / asmdef_play / ci_unity | Actual Assets/Packages test root, separate Edit/Play assemblies and invocations, no -quit, fresh result files and zero-test exclusion; exact source base asmdef bodies, both CI modes, license NEEDS |
| readme_unreal / unreal_tests_readme / ci_unreal | Actual module-private root, WITH_DEV_AUTOMATION_TESTS, EditorContext/ProductFilter, unique class names, absolute uproject, build editor target first, separate actual test prefix, no-match/fail255 interpretation, Windows shell-with-spaces and self-hosted UE_ROOT |
| readme_web / ci_web / external Playwright | Actual package manager/lock/scripts/runners/bundler via shared detector; canonical installed Playwright, GAME_STUDIO_BROWSER; frozen install, optional actual build, then the required test stage, existing runner preserved |
| smoke | All eight conditional source seed entries, purpose10–15 checks, save/load and core-loop conditions,60fps seed and memory observation; only invocation migrated to game-studio-smoke-check |
| lines784–825 write loop | Per-path exclusive-create, retained regular/file/directory/link leaves, no overwrite, independent paths continue after local failure, no all-batch transaction claim |
| lines826–878 NEEDS | Engine/full Godot version, actual gdUnit runner, actual Unity package/license/game assembly visibility, independent Unreal identities/compiler environment, actual Web package/tool/lock/install/browser gaps; missing resources explicit |

The twelve heredoc bodies are separately packaged under
`studio/templates/test-scaffold/`; no duplicate engine starter or invented
example tests. Playwright is reused from
`studio/templates/web-growth/playwright.config.ts`, byte-identical when the test
root is tests. With a configured alternate root only testDir is changed. Existing
JS/MJS/CJS/MTS/CTS configs prevent a competing TS config. Existing TS is retained.

Web template dependencies are specific, not a Vite gate:

- README needs actual detector observations; absent facts are labelled unknown.
- Unit/integration retention files, evidence, smoke need no bundler/runner.
- Canonical Playwright imports @playwright/test and uses the integration root;
  it does not require Vite, dist-single, window.game or a server. A project with
  that selected dependency can use it regardless of bundler. A different runner
  leaves this one file SKIPPED and browser setup NEEDS, not a skipped Web setup.
- CI uses the resolved frozen install and test commands. Missing ones produce
  explicit failing steps and NEEDS. A discovered build command is optional;
  none is not an invented failure. Non-npm managers need their actual pinned
  executable provisioned on CI; the helper does not install it or guess a pin.
  Any declared engines.node constraint is explicitly UNRESOLVED against the
  template Node24 default in both CI comments and ci_runtime NEEDS. Any declared
  packageManager pin, including npm, likewise produces ci_package_manager NEEDS
  and an unresolved CI comment. The owner reconciles these before enabling CI;
  no semver compatibility or implicit package-manager pin is claimed.
- Playwright CI discovers an actual installed Chrome-family executable, exports
  GAME_STUDIO_BROWSER, and fails clearly if absent. The browser-discovery step never downloads a browser.
- Existing project/runner/CI/config/package/lock files are not changed. Owner
  follow-up supplies unresolved dependencies, browser coverage, script/runtime
  setup and custom CI changes. Monorepo/lock conflicts remain detector evidence,
  not implicit permission to pick a workspace/package manager.

## Deliberate source corrections

1. Formal Skill/spec Godot `.gdignore_placeholder` wins over Bash's `.gitkeep`;
   old `.gitkeep` remains untouched. Neither creates the real `.gdignore` that
   hides tests. The placeholder explains the distinction.
2. Unreal project filename, game module, editor target and test prefix are not
   conflated; every .uproject argument uses the actual project basename, never
   the test prefix. Local Windows commands explicitly require Git Bash; cmd and
   PowerShell need their own quoting and absolute path. An unresolved module skips only its README; identity placeholders
   and NEEDS remain in the other source artifacts. Actual Build.cs absence is
   reported instead of pretending a newly created directory is compiled.
3. Non-Vite Web is not labelled Vite; existing runners are preserved. No global
   Vitest/Playwright choice is imposed. If an actual script selects them without
   a root declaration, report the missing dependency/workspace determination.
4. Removed runtime Claude paths. Standard test names remain self-contained;
   canonical browser config uses the installed-browser environment contract.
5. Merge blocking requires actual branch rules; creating tests.yml alone does
   not configure GitHub. Unity/Unreal evidence tables point at compiled roots.
6. Validate ancestors and metadata before writes; refuse symlink traversal,
   malformed JSON and invalid roots. Existing leaf links/directories are preserved
   but explicitly unresolved. Resource absence is SKIPPED, never an empty file.
7. Base Unity test asmdefs always need actual game/package references reconciled
   by the Skill, even when some unrelated game asmdef already exists. Only newly
   created, unchanged authorized files may later be edited; no implicit Game
   assembly, package references or Editor assembly is fabricated here.

## Focused observable acceptance

The dedicated test module covers preview/no-write, real fill/repeat with preserved
CRLF bytes, custom Godot/Unity/Web roots, all four engines, distinct Unreal
identities/unknowns, webpack+Playwright and Jest, browser config collisions,
malformed/missing package inputs, unresolved lock manager, missing template in a
real isolated installed layout, directory/link/dangling leaves, ancestor and
dependency symlinks, parent-file failures, two concurrent exclusive creates,
strict CLI flags and path-with-spaces wrapper invocation, YAML parsing, no
unresolved internal tokens, source smoke entries and actual dependency NEEDS.

Retain real Bash differential evidence for list/preview/create/repeat on all four
engines. Normalize only the approved Godot unit/integration placeholder names;
never normalize content differences into a false byte-parity claim. Keep the
source symlink-ancestor counterexample and the new refusal. Template source hashes
and intentional diff map make preserved versus changed bytes reviewable.

Limits: lexical Unreal target observation is not C# compilation; dependency
presence is not an installed/tested runner; CI YAML parsing is not remote CI.
No engine/editor/browser/install/network/Hook/native workflow runs in this helper.
It performs exclusive leaf creation, not directory-tree locking or a batch
rollback: a hostile concurrent ancestor replacement is outside this guarantee.
Local write failure may leave that new incomplete file, explicitly FAILED;
never delete it blindly or overwrite it on retry. No Windows runtime evidence is
claimed by macOS tests; the junction test branch still needs actual Windows CI.
Full original five native Skill scenarios and first-example/engine evidence
remain separate pending acceptance, not inferred from these helper tests.
