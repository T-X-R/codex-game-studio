# Codex Game Studio implementation tasks

Status: Implementation in progress. Initial executable alpha; full migration gates remain open. See [implementation evidence](../docs/implementation-status.md).
Requirements and interfaces: [plan.md](plan.md)  
Source identities and proposed dispositions: [migration-inventory.md](migration-inventory.md)

## Execution rules

- Implementation was authorized on 2026-11-11. GitHub owner is T-X-R; deliver a GitHub repository and local installation archive, without npm registry publication.
- Complete dependencies before a task. Record changed paths and evidence below its checkbox when finishing it.
- Limit one execution slice to approximately five implementation/test/content files. A Skill with many references must be split into numbered child slices before editing, and its parent stays open until all references and behavior pass. The same rule applies to the script/rule work queues.
- Use implemented maintainer scripts under `toolkit/`; remaining verification commands below are target contracts. Current names are `build`, `typecheck`, `test`, `test:pack` and `test:browser`. Live host checks require fresh disposable projects.
- A migration row requires static validation and the stated behavioral evidence. No row is completed solely because its name/path changed.
- Checkpoints are release criteria, not requests to reapprove an unchanged scope. User decisions or external publication actions still follow their actual authorization.

## Progress note

The development source implements deterministic install and Web slices while C0 host verification remains open. This sequencing adjustment does not waive host acceptance. Seven project Skill entry points and nine roles (Game Designer, Lead Programmer, Gameplay Programmer, two QA roles, Creative Director, Art Director, Technical Director and Producer) exist, but their full behavioral migration rows remain open.

2026-11-12: configuration reads now cover named-system workflow overrides and
legacy engine preferences (`8bf457f`). `config set` adds validated project/local
writes, comment/quote/line-ending preservation and stage synchronization
(`c6a7365`); transaction backups are private on POSIX (`1356b97`). Build,
typecheck and 47 tests pass locally; packed-install coverage includes writes
through the pinned runtime. T04/T22 and S037 remain open until the remaining
derived helpers and live workflow evidence are complete. Existing alpha CI
passed all five jobs at `92242ed`. Configuration changes at `32d5195` also passed
all five jobs in run `43137793165` on the development branch; no new archive is published.
The configuration reader also preserves legacy boolean `testing.strict` fallback
after explicit per-type overrides; derived gate/engine helper parity is still open.

Further 2026-11-12 slices: checkpoint CLI persistence/recovery (`e19aac9`),
gate/review/engine/performance summaries (`92ab7f3`), engine root validation
(`942451a`), configured test/smoke/build execution with logs (`ed3e03b`) and engine
inspection (`cbe931b`) pass build, typecheck, 74 local tests and packed-install
verification. These do not close T18's live hook/compaction acceptance or T23's
native editor execution requirements. Native CI initially exposed Windows
command quoting and ERRORLEVEL defects; fixes and the input-method/specialist
summaries now pass all five jobs at `bbcb238` in run `43142741958`. Local build,
typecheck, 79 tests and packed-install checks pass. Source additions remain
unreleased; full host and workflow acceptance is still open.

## M0 Compatibility and contracts

- [ ] T01 Establish Codex integration evidence
  - 2026-11-12 evidence: the earlier role probe did not prove project config loading; command-line trust overrides left the project layer disabled. A revised temporary-profile fixture verifies config loading before running. Its positive CLI session selected `agent_type: game-studio-probe`, spawned an independent child with that role and received the hidden marker; the role-absent control did not spawn or return the marker. Both profiles were removed. Sanitized parent/child evidence is in `docs/evidence/cli-role-selection-2026-11-12.json`. Desktop, subdirectory, actual write denial and hook acceptance remain open.
  - Further evidence: after the owner's explicit authorization, two fixture hooks were reviewed/trusted through native `/hooks`. CLI startup context loaded, an allowed patch completed, and a denied patch rejected before changing its target. The separate untrusted fixture executed no hooks. See `docs/evidence/cli-hook-gate-2026-11-12.json` and `toolkit/test/host-hook-probe.mjs`. Offline contract coverage brings the local suite to 81 passing tests; build/typecheck/packed install pass. This closes only the tested startup/single-file patch behavior, not T01 or the production T16 adapter.
  - Additional CLI evidence: the same two unchanged Hooks, reviewed natively under the owner's existing authorization, pass startup and multi-file patch tests from root and subdirectory. Mixed allowed/blocked patches leave both files unchanged. The runner preserves the reviewed profile across requested cases because native trust hashes live there; earlier trust-reset controls are not treated as host failures. See `docs/evidence/cli-hook-multifile-2026-11-12.json`. Desktop, subdirectory roles, shell interception, sandbox boundaries and other lifecycle/failure cases remain open.
  - Module: `codex-integration`. Dependencies: none.
  - Verify custom-agent TOML, project Skill discovery, Hook trust, patch payload and real block behavior in desktop and CLI. Include launch from a subdirectory and desktop PATH differences.
  - Acceptance: exact client versions, positive/negative transcripts and filesystem observations recorded; unsupported behavior listed without a silent fallback.
  - Verification: disposable fixtures; a permitted write succeeds and a denied write leaves its target unchanged.
  - Likely files: `toolkit/test/fixtures/codex/` (up to three files per slice), `docs/codex-compatibility.md`. Scope: M.

- [ ] T02 Freeze command and version contracts
  - Module: `cli-core`. Dependencies: T01.
  - Acceptance: common result/exit schema, command leaf metadata, project root rules and runtime/bundle version checks match the proposal. Name/technology decisions relevant to implementation resolved.
  - Verification: representative valid/invalid result and argument fixtures; help/schema have one source.
  - Likely files: `toolkit/src/contract.ts`, `toolkit/src/commands.ts`, `toolkit/test/contract.test.ts`, `docs/cli-contract.md`. Scope: M.

- [x] T03 Create a minimal packaged CLI
  - Evidence: implemented and covered by unit/packed-install tests; see `docs/implementation-status.md`. Host compatibility remains independently gated.
  - Module: `cli-core`. Dependencies: T02.
  - Acceptance: `version`, `--help`, `schema`, and a JSON error work from an installed archive; no install script changes Agent directories.
  - Verification: build, typecheck and CLI subprocess tests; inspect `npm pack` contents.
  - Likely files: `toolkit/package.json`, `toolkit/package-lock.json`, `toolkit/tsconfig.json`, `toolkit/src/cli.ts`, `toolkit/test/cli.test.ts`. Scope: M.

- [ ] C0 Compatibility checkpoint
  - T01–T03 pass. Record the client/OS/Node baseline and any change to proposed contracts before content conversion.

## M1 Install and inspect

- [ ] T04 Implement project discovery and configuration reads
  - Module: `project-state`. Dependencies: T03.
  - Acceptance: explicit project wins; nearest nested initialized project is selected; override/rigor resolution and provenance preserve existing semantics.
  - Verification: fixture matrix for empty/missing/legacy config, nested roots, worktrees, spaces and Unicode; `status --json` never invents a stage.
  - Likely files: `toolkit/src/project.ts`, `toolkit/src/config.ts`, `toolkit/src/status.ts`, `toolkit/test/project.test.ts`, `toolkit/test/config.test.ts`. Scope: M.

- [x] T05 Build the canonical content archive
  - Evidence: implemented and covered by unit/packed-install tests; see `docs/implementation-status.md`. Host compatibility remains independently gated.
  - Module: `distribution`. Dependencies: T03.
  - Acceptance: package assets come from one canonical tree; references resolve without the maintainer checkout; document assets are read-only resources.
  - Verification: pack/install into a clean temporary home; resolve a shared resource and a Skill reference; check all paths stay in the payload.
  - Likely files: `toolkit/build.mjs`, `toolkit/package.json`, `studio/bundle.json`, `toolkit/src/resources.ts`, `toolkit/test/resources.test.ts`. Scope: M.

- [ ] T06 Install the global onboarding Skill
  - Module: `codex-integration`. Dependencies: T04, T05.
  - Acceptance: explicit `skills setup` previews exact target paths, installs one owned onboarding Skill, preserves collisions, and supports repeat setup/removal.
  - Verification: isolated home/custom home fixtures; natural-language positive and unrelated negative triggers in both clients.
  - Likely files: `studio/onboarding/game-studio/SKILL.md`, its optional `agents/openai.yaml`, `toolkit/src/skills-setup.ts`, `toolkit/test/skills-setup.test.ts`. Scope: M.

- [ ] T07 Implement runtime pin and local launcher
  - Module: `cli-core`. Dependencies: T04, T05.
  - Acceptance: project uses an exact runtime; `restore` changes only the private runtime package; hook launcher has no global PATH or implicit network dependency.
  - Verification: missing runtime, version mismatch, offline operation, local packed archive, and global CLI upgrade while old project remains pinned.
  - Likely files: `toolkit/src/runtime.ts`, `studio/codex/run.cjs.template`, `studio/templates/runtime-package.json`, `toolkit/test/runtime.test.ts`. Scope: M.

- [x] T08 Implement owned file planning and rollback
  - Evidence: implemented and covered by unit/packed-install tests; see `docs/implementation-status.md`. Host compatibility remains independently gated.
  - Module: `codex-integration`. Dependencies: T04.
  - Acceptance: mutation plans list all effects; expected hashes protect modified/unowned files; journal and project lock recover partial installation.
  - Verification: dry-run creates nothing; failure injection restores prior owned files; repeated application is a no-op; concurrent change yields conflict.
  - Likely files: `toolkit/src/install-plan.ts`, `toolkit/src/ownership.ts`, `toolkit/src/install-apply.ts`, `toolkit/test/install.test.ts`. Scope: M.

- [ ] T09 Integrate new and existing projects
  - Module: `codex-integration`. Dependencies: T06, T07, T08.
  - Acceptance: `init` and `attach` use the same content/runtime; preserve game dependencies, root instructions, overrides and unrelated hooks/config; cloned-template flow works.
  - Verification: empty folder and existing Web project snapshots; no writes outside advertised targets; config parse/merge failures stop before mutation.
  - Likely files: `toolkit/src/init.ts`, `toolkit/src/attach.ts`, `toolkit/src/codex-config.ts`, `toolkit/test/attach.test.ts`, `studio/codex/AGENTS.md.template`. Scope: M.

- [ ] T10 Implement installation and capability diagnostics
  - Module: `cli-core`. Dependencies: T01, T07, T09.
  - Acceptance: doctor separates installed/configured/unknown-trust/observed-running states; missing browser/engine is explicit; commands don't auto-install anything.
  - Verification: dependency absent, unsupported client, trusted/untrusted hook and subdirectory cases; JSON contains actionable results.
  - Likely files: `toolkit/src/doctor.ts`, `toolkit/src/capabilities.ts`, `toolkit/test/doctor.test.ts`. Scope: M.

- [ ] C1 Installation checkpoint
  - A clean packed install can attach, restore, inspect and reopen a disposable game in both clients. Existing game files remain unchanged. Package ownership and dependency behavior match the plan.

## M2 Complete Web prototype slice

- [ ] T11 Scaffold and import a prototype
  - Module: `game-operations`. Dependencies: C1.
  - Acceptance: selected genre/template resources create a valid skeleton; import copies the source without changing it; reruns protect existing work.
  - Verification: reference prototype and imported standalone game fixtures; dry-run and destination conflicts; no arbitrary deletion.
  - Likely files: `toolkit/src/prototype/scaffold.ts`, `toolkit/src/prototype/import.ts`, `toolkit/test/prototype-files.test.ts`, two selected resource files. Scope: M.

- [ ] T12 Run preview and capture evidence
  - Module: `game-operations`. Dependencies: T11.
  - Acceptance: preview lifecycle is explicit, local and stoppable; capture preserves seeded replay semantics and reports missing browser/errors accurately.
  - Verification: replay existing browser-driver fixtures; console failure, timeout and cancellation cases; source game is unchanged by instrumentation.
  - Likely files: `toolkit/src/preview.ts`, `toolkit/src/capture.ts`, migrated `one-shot-driver.js`, `toolkit/test/capture.test.ts`, `toolkit/test/preview.test.ts`. Scope: M.

- [ ] T13 Produce checks and a distributable artifact
  - Module: `game-operations`. Dependencies: T12.
  - Acceptance: deterministic check results distinguish failed/not-assessed; local package excludes known work/tuning files and preserves required assets; no upload occurs.
  - Verification: failing game, missing check capability, output replacement conflict, and packaged game smoke run.
  - Likely files: `toolkit/src/check.ts`, `toolkit/src/package.ts`, `toolkit/test/check.test.ts`, `toolkit/test/package.test.ts`. Scope: M.

- [ ] T14 Migrate the core user journey
  - 2026-11-12 S054 smoke slice: installed smoke Skill and three references preserve engine result interpretation, coverage, manual/platform observations and QA policy. CLI supports explicit 900000/1800000 ms budgets and one-run command adjustments without config edits. Seven isolated Node-runner/feedback scenarios and one same-agent platform-table regression passed file/result verification; simulated feedback is not human play acceptance. Build/typecheck, 130 tests and packed install pass. Evidence: `docs/evidence/smoke-skill-2026-11-12.json`. Full engine/host and remaining behavior matrix stay open.
  - 2026-11-12 S037 settings slice: installed Skill and advisory reference, CLI read annotations for reserved/overridden values, and preserved source-derived behavior mapping. Five isolated behavior cases and two post-clarification regressions passed independent file/result checks. A natural-language CLI 0.162.0 read discovered and used the installed Skill from the game root; a non-Git nested launch did not discover it. See `docs/evidence/project-settings-skill-2026-11-12.json`. Local build/typecheck, 128 tests and packed install pass. Native writes, desktop, cancellation and unavailable/conflicting Skill scenarios remain open.
  - 2026-11-12 S040 growth supplement: the installed prototype Skill now routes selected/resumed growth to a focused reference; packed attachment includes the reference and shared TypeScript resources. Independent behavior evaluation plus a separate result verifier completed a scoring/pause fixture without changing its prototype or brief constraints. See `studio-tests/skills/utility/prototype-growth.md` and `docs/evidence/web-growth-skill-2026-11-12.json`. Native CLI/desktop journeys and the other prototype scenarios remain open.
  - Module: `codex-integration`. Dependencies: T13.
  - Work queue: the individual Skill rows for `start`, `prototype`, `next-step`, `project-settings`, `smoke-check`; execute each in bounded slices.
  - Acceptance: natural-language request reaches a brief, built game and evidence; subsequent change preserves agreed requirements; guided behavior avoids per-file approval loops.
  - Verification: one full scenario in each client plus the individual Skill specifications. Missing runtime/approval returns a clear next action.
  - Likely files per slice: one Skill body, up to three references, its behavior spec. Scope: M per slice; this parent closes only after all child rows pass.

- [ ] T15 Grow a prototype and configure an engine
  - 2026-11-12 semantic conversion fixture: strict TypeScript, existing JSON/live configuration, actual extracted rule tests (5), Chrome integration (3), smoke (1), normal/single-file builds, mutation red/green and independent injected-type-error checks passed. Same-seed state/screenshot equality and original bytes survived. The evaluation found a missing-hook capture false positive; `f389fd5` fixes the verdict and `a047f73` adds packed regression. This is one supplied-Skill fixture, not proof for all game/import/tuning/starter/host/human-play gates.
  - 2026-11-12 copy slice: `prototype grow <name> --stage copy` creates the pinned Web toolchain and JavaScript entry with recoverable binary transactions, source guards and conflict refusal. The packed-runtime live fixture proves same-seed input/scoring states and screenshots match after `npm ci`, normal build and single-file build; original bytes survive, tuning is excluded from production, and empty game tests fail. See `docs/evidence/web-growth-copy-2026-11-12.json`. Local build/typecheck, 126 tests and packed install pass. CI now repeats live growth. TypeScript/data conversion, richer import/script/asset cases, meaningful game tests, final records, alternative starters and human play remain open.
  - 2026-11-12 growth prerequisite slice: `prototype grow-check` inspects the engine, source entry, existing code/toolchain files, Git code changes (including renames and ignored files), grown tags and dirty briefs without writes. Corrupt/unavailable Git is not assessed; no-Git workspaces have an explicit backup warning. Eight new real-filesystem/Git/CLI tests bring the suite to 115, and packed dispatch verifies eligibility plus conflict refusal. See `docs/prototype-growth.md`. Copy, TypeScript conversion, build/test tooling, replay equivalence, alternative starters and human play remain open.
  - 2026-11-12 configuration slice: grouped settings (`2054c77`) and `engine setup` (`8df646e`) atomically update explicit engine/version/language/paths plus selected specialist/naming/command fields and `docs/technical-preferences.md`. Missing directories remain pending; invalid paths and concurrent edits are refused. Build/typecheck and 93 local tests pass. Packed-install coverage verifies dry-run, apply, no-op, pinned runtime dispatch and preference retention after detach. See `docs/engine-configuration.md`. This does not close prototype growth, engine scaffolding, S051 or live editor acceptance.
  - Module: `game-operations`. Dependencies: T14.
  - Acceptance: Web growth preserves the game's behavior and establishes build/test scripts without overwriting toolkit or existing game configuration; engine setup records explicit paths/version.
  - Verification: before/after seeded run, configuration preservation, build/test discovery, and one Web starter fixture per advertised option.
  - Likely files per slice: `toolkit/src/prototype/grow.ts`, `toolkit/src/engine.ts`, one starter resource, two test files. Split additional starters into separate slices. Scope: M.

- [ ] C2 Web journey checkpoint
  - Fresh install to prototype, change, growth, test, package and reopen succeeds in both clients. Browser evidence and a human play observation are recorded separately. This is an internal usable milestone, not full migration completion.

## M3 Collaboration and recovery

- [ ] T16 Implement the Codex Hook adapter
  - Module: `codex-integration`. Dependencies: T01, T08, T13.
  - Acceptance: normalize real inputs and translate supported outputs; no false success on unknown events; multiple handler side effects have a defined order/ownership.
  - Verification: captured host fixtures plus live allow/deny tests in both clients; malformed input, timeout, missing runtime and untrusted hook paths.
  - Likely files: `toolkit/src/hooks/input.ts`, `toolkit/src/hooks/output.ts`, `toolkit/src/hooks/dispatch.ts`, `studio/codex/hooks.json.template`, `toolkit/test/hooks.test.ts`. Scope: M.

- [ ] T17 Port individual guard behaviors
  - Module: `codex-integration`. Dependencies: T16.
  - Work queue: each of the 18 hook inventory rows, handled independently. Start with write/registry and commit/push checks; retain diagnostics/replacements for unregistered or unsupported handlers.
  - Acceptance per row: intended check/feedback preserved or named replacement documented; no host permission bypass or fictitious read interception.
  - Verification per row: positive, negative and unavailable-input cases, followed by the relevant real host operation.
  - Likely files per slice: one validator, its adapter binding, one fixture, one test, inventory evidence. Scope: M per row.

- [ ] T18 Implement checkpoint persistence and recovery
  - Implemented CLI slice: bounded show, expected-hash save, legacy narrative preservation, immutable event deduplication, stale-writer rejection and interrupted transaction recovery. Unit and packed subprocess tests pass; actual Stop/compaction integration and host restart evidence remain open.
  - Module: `project-state`. Dependencies: T04, T16.
  - Acceptance: state save is atomic with concurrency detection; repeated Stop events do not duplicate work; recovery checks files rather than assuming surviving processes.
  - Verification: crash/interruption, two attempted writers, stale hash, restart and compaction scenarios; concise context output.
  - Likely files: `toolkit/src/checkpoint.ts`, `toolkit/src/events.ts`, `toolkit/test/checkpoint.test.ts`, `studio/docs/recovery.md`. Scope: M.

- [ ] T19 Validate role delegation and guided collaboration
  - 2026-11-12 sequential slice: four actual native children pass approved design to implementation, independent QA and read-only LP review in one fresh packed project. Programmer tests pass 17; a separate QA child adds seven and runs all 24; the lead returns APPROVE for pure logic. Six maintainer behavior groups pass; an isolated exact-affordability mutation makes eight programmer and four QA tests fail. All 332 original regular files survive, with 17 authorized additions. Traces prove selected roles, instruction isolation, inherited settings, completion-before-next-spawn and coordinator-only delegation. Evidence retains a mandatory-close fixture failure, a cancelled output-path conflict, and the completed native run's overly strict report nesting assertion; corrected postconditions pass against the same retained artifacts. See [evidence](../docs/evidence/role-handoff-2026-11-12.json) and [behavior spec](../studio-tests/roles/sequential-handoff-codex.md). Parallel writes, shared-checkpoint conflicts, unavailable-role behavior, adversarial permission checks, desktop and full role matrices remain open.
  - Module: `codex-integration`. Dependencies: T01, T18; core role rows for designer, programmer and QA complete.
  - Acceptance: coordinator delegates with explicit scope, aggregates findings and handles blocked roles; independent review is performed by a separate agent; parent permissions remain effective.
  - Verification: parallel read-only tasks, sequential dependency, disjoint writes and shared-checkpoint conflict; unknown task/role returns a clear failure.
  - Likely files per slice: orchestration guidance, one `team-*` Skill, two scenario fixtures, behavior spec. Scope: M.

- [ ] C3 Control and recovery checkpoint
  - Real guards block their tested violations, evidence is attributed correctly, and desktop/CLI resume use the same project state. Unsupported hook/capability cases are visible in doctor and release notes.

## M4 Complete content and engine migration

- [ ] T20 Replace the content validator and test catalog rules
  - 2026-11-12 installed-project slice: `check --kind content` uses the pinned runtime to inspect actual project Skill/role instructions and references, identifies missing expected entries, separates local Markdown paths from bundled resource calls, and lists unrelated namespaces as unassessed. Invalid content returns exit 5; missing/empty package baselines cannot pass. Build/typecheck/content lint, 167 tests and a fresh packed positive/mutation/restoration check pass. See [evidence](../docs/evidence/project-content-check-2026-11-12.json). This supplies a runtime validator for future workflow migration, not native discovery or completed `skill-test` behavior.
  - 2026-11-12 source-inventory slice: default `lint:content` now reconciles the existing inventory tables with all 18 Hook files, 54 script/resources and 14 rules, plus the 15 actual retained Hook registrations and three unregistered files. Same-count omission/duplication, missing/nonregular sources, empty dispositions, changed matchers, unknown/dynamic/duplicate registrations and malformed settings fail explicitly. Build/typecheck, 159 tests and packed installation pass; complete-declaration mode still correctly fails on unfinished workflow/role/alias rows. See [evidence](../docs/evidence/source-inventory-2026-11-12.json). This checks retained input coverage only; replacement behavior and host/journey gates remain open.
  - Inventory CI follow-up: run `43190208145` passed Windows source lint but failed two LF-only negative-fixture mutations. Explicit CRLF variants reproduced both failures locally; corrected mutation regexes and an actual-change assertion now cover LF/CRLF on every platform. The unchanged validator and 162 local tests pass. Failed-run evidence is retained in the source-inventory record.
  - 2026-11-12 rubric slice: `studio-tests/quality-rubric.md` preserves all 15 categories and 57 metric identities while adapting host mechanics and guided authorization. The maintainer README, Codex AGENTS instructions and both spec templates separate instruction review from observed behavior, retain source-case mapping, and require native/negative/mode evidence. Manual semantic review plus source/current metric identity and local-link checks pass; no live behavior is inferred from this documentation change. Individual source specs, remaining legacy consumers and rule/hook/helper inventory coverage still require migration.
  - 2026-11-12 command-example slice: explicit inline/fenced invocations are checked against actual command metadata for leaves, options, positional counts and schema targets. Negative fixtures cover entrypoints, role bodies, nested references and an installed archive; the archive is restored before continuing smoke checks. Build/typecheck/content lint, 153 tests and packed installation pass. See [evidence](../docs/evidence/command-examples-2026-11-12.json). Handler values, prose/abbreviated commands and native behavior still require review; no migration row is promoted.
  - 2026-11-12 foundation: `lint:content` parses canonical Skill YAML and role TOML, checks names/types/entrypoints, recursive local references, literal bundled resource paths, symlinks and active legacy runtime syntax. Catalog v3 preserves all 75 workflow/49 role source contracts plus three explicit alias mappings, records Codex targets and partial/pending states, and rejects omitted sources, untracked targets and unsupported verified declarations. `--complete` correctly fails while migration is open; static success always retains `behaviorVerified: false`. Tests include malformed metadata, missing references/roles/specs/evidence, duplicate names and alias conflicts; packed verification runs the installed validator and rejects an intentionally removed resource before restoring it. See [validation contract](../docs/content-validation.md). Command-example checking, rule/hook/helper inventory cross-checks, Codex rubric/legacy-consumer replacement and dependent host/journey gates remain open; this does not close T20 or any migration row.
  - Module: `verification`. Dependencies: T02, T05, C2.
  - Acceptance: validate Codex metadata, names, resources and inventory coverage; retire Claude-only linter requirements; aliases remain explicitly accounted for.
  - Verification: invalid frontmatter, missing resource, duplicate name, omitted role, stale command example and residual Claude runtime fixtures.
  - Likely files: `toolkit/src/content-check.ts`, `toolkit/test/content-check.test.ts`, `studio-tests/catalog.yaml`, `studio-tests/quality-rubric.md`, `toolkit/package.json`. Scope: M.

- [ ] T21 Complete the individual Skill and role queues
  - Module: `codex-integration`. Dependencies: T20, C3 for advanced orchestration; core rows may be completed earlier under T14/T19.
  - Acceptance: all S/A rows below complete with evidence; no omitted references or undocumented functionality losses.
  - Verification: catalog lint plus individual live scenarios and cross-workflow regression runs.
  - Likely files: specified by each S/A row contract below. Scope: S/M per row, not one bulk task.

- [ ] T22 Migrate shared helpers and scoped rules
  - 2026-11-13 Markdown reader: `list`, `status` and `extract` preserve read-only source observations, including documented parser quirks. Forty-four helper checks include 228 actual Bash comparisons; Node 24/26 each pass 287 integrated tests, and the actual installed resource is exercised. `replace`, `insert-before` and `set-field` remain unimplemented. See [contract](../studio-tests/helpers/md-section-codex.md) and [evidence](../docs/evidence/md-section-2026-11-13.json).
  - 2026-11-13 Markdown writers: `replace`, `insert-before` and `set-field` now preserve source transformations with explicit dry-run and scoped atomic writes. The suite includes 54 real Bash writer comparisons plus retained reader checks; build/typecheck/content/package and 362 tests per Node 24/26 pass. Installed archive tests exercise each writer and failure/nonmutation boundaries. Hardlink, invalid UTF-8, permission, mixed-EOL, no-op and stale-file cases are retained. [Writer evidence](../docs/evidence/md-section-writers-2026-11-13.json) separates local/helper acceptance from pending CI/native-consuming workflows.
  - 2026-11-12 registry slice: a portable, read-only bundled helper supports list/get/refs/slice/validate/compare and all eight next-ID kinds using parsed YAML, explicit missing/layout states and exact source/reference locations. Ten reader/command tests and installed-package execution pass; the integrated suite has 198 passes, including receipt tests. `validate`/`compare` findings remain observations, never domain approval. See [contract and limits](../docs/registry-observations.md). Broader source parity and consuming-workflow acceptance remain open.
  - 2026-11-12 artifact follow-up: `3b6b61a` preserves the complete catalog as a packaged Codex resource; `c6e3c7e` adds `check --kind artifacts [--phase <id> | --path <id>]`. Ten legacy/new project fixtures match 540 step observations across 49 phase steps and five minimal-path steps. A real unreadable-file control reports UNKNOWN and exit three without dropping phase rows. Catalog parity, seven CLI/helper tests, build/typecheck/content validation, 184 full-suite tests and installed-runtime inspection pass. See [artifact contract](../docs/artifact-check.md). Workflow consumers and remaining helper/rule migrations remain open.
  - 2026-11-12 deterministic gate prerequisites: `d7da380` ports GDD section/placeholder observations as `check --kind gdd`; eight legacy/new fixtures match. `26ac61f` ports ADR dependency extraction, cycle membership, transitive blocking and dependency-first ordering as `check --kind adr-deps`; a real upstream comparison matches the cycle/blocked/independent fixture. Both use project-relative safe paths, preserve input files, distinguish empty input as not assessed and leave verdicts to workflows. Nine new CLI tests bring the suite to 176 passes; build/typecheck/content validation and packed-runtime positive/empty checks pass. The first full GDD run encountered the sandbox's localhost-listen denial; the authorized rerun passed all 171 tests before the ADR additions. See [GDD contract](../docs/gdd-structure.md) and [ADR contract](../docs/adr-dependencies.md). Artifact-catalog checking, workflow consumers, remaining helpers and scoped rules remain open.
  - Modules: `project-state`, `game-operations`, `codex-integration`. Dependencies: T20.
  - Work queue: each of 54 shared-script/resource rows and 14 scoped-rule rows in the inventory; complete reused items after their T11–T18 implementation is verified.
  - Acceptance per helper: preserved observations/side effects, correct package/project roots, declared platform dependencies and no active Claude coupling. Acceptance per rule: correct scope and no unrelated global trigger.
  - Verification: representative legacy/new fixture parity; packed-install execution; rule positive/negative applicability cases.
  - Likely files per helper slice: source/resource, consumer, contract fixture, test, source mapping. Per rule slice: rule, applicability index, behavior fixture. Scope: S/M.

- [ ] T23 Validate engine-specific operations
  - 2026-11-12 Godot slice: `engine scaffold` preserves existing files and derives only an absent Godot 4.x project from explicit choices; `engine verify` checks installed version/capability and interprets import logs. Build/typecheck, 106 local tests and packed-install checks pass. A real macOS ARM64 Godot 4.7.2 fixture verifies packed setup/scaffold/import, GDScript smoke, nonzero failure, version mismatch and zero-exit corrupt-asset rejection. See `docs/evidence/godot-import-2026-11-12.json`. Export/build, C#, other OS/editor execution and full S051 behavior remain open.
  - Follow-up `2780583`: the real corrupt-asset fixture reproduced a zero-exit false positive in configured Godot smoke commands. Shared error interpretation now rejects it while retaining process exit 0. A fresh installed-runtime run and 107 unit/integration tests pass; evidence retains both the failing pre-fix observation and corrected result. This does not close the parent engine gate.
  - GdUnit follow-up `6f22e7d`: a real 4.7.2/6.2.2 suite exposed a false command failure from the explicitly configured port-zero debugger pair. Only the two exact diagnostics in that GdUnit test context are now expected; raw logs, script/parse errors and other engine failures remain intact. Fresh packed execution passes 12 assertions; an injected parse error returns process 105/CLI 5. Independent formula and orphan controls return 100/101 and restore to 12 passes/zero orphans. See [Godot QA evidence](../docs/evidence/qa-godot-2026-11-12.json). Native sandbox editor/user-data/certificate errors remain open and are not suppressed.
  - Implemented shared slice: engine-specific root inspection and configured OS-aware command execution with failure/unavailable/timeout evidence. Tests exercise actual Node/npm processes; they do not certify Godot, Unity or Unreal editor/license/build execution. Engine setup remains open.
  - Module: `game-operations`. Dependencies: T15, T22 relevant helpers.
  - Work queue: separate Web, Godot, Unity and Unreal slices; further split build and test adapters if more than five files are needed.
  - Acceptance per engine: preserve configured roots/version and command semantics; missing editor/license/tests cannot pass; evidence names the actual environment.
  - Verification: fixtures for configuration and exit interpretation, then an installed-engine smoke run when available. Record unverified live execution explicitly.
  - Likely files per slice: engine descriptor, command adapter, scaffold resource, adapter test, compatibility record. Scope: M.

- [ ] T24 Finish native CLI portability
  - Module: `cli-core`. Dependencies: T22.
  - Acceptance: core install/state/scaffold/check/package paths work on native Windows, macOS and Linux without undeclared shell dependencies; cancellation cleans child processes.
  - Verification: native platform CI, executable paths with spaces, Unicode, quoting, locked files and line endings; fail if a test is skipped while marked supported.
  - Likely files per slice: one platform-sensitive operation, its process/filesystem adapter, two tests, compatibility record. Scope: M.

- [ ] C4 Migration checkpoint
  - Inventory reconciles 75 primary Skills, 3 retired aliases, 49 roles, 18 hook-directory files, 54 shared resources and 14 rules. Active Claude-only references are absent; historical mentions remain permitted. Claimed live behavior has evidence.

## M5 Upgrade and publication readiness

- [ ] T25 Implement project upgrade and safe detach
  - Module: `codex-integration`. Dependencies: T07, T08, C4.
  - Acceptance: explicit version upgrades protect modified files; interrupted application restores owned integration; detach preserves all user game artifacts.
  - Verification: old/new packed releases, same-version rerun, conflicting content, incompatible schema, failed install, global/local mismatch and detach snapshots.
  - Likely files: `toolkit/src/upgrade.ts`, `toolkit/src/detach.ts`, `toolkit/test/upgrade.test.ts`, `toolkit/test/detach.test.ts`. Scope: M.

- [ ] T26 Finalize public documentation and identity
  - Module: `distribution`. Dependencies: C4; identity decision resolved.
  - Acceptance: English setup examples match the package; install-plus-Skills and template use both explained; upstream notice/history preserved; support limits clear.
  - Verification: follow README from a clean environment; inspect links/commands and attribution. No placeholder owner is published.
  - Likely files per slice: at most five of README, CONTRIBUTING, SECURITY, UPGRADING, CHANGELOG, attribution and GitHub metadata. Scope: M per slice.

- [ ] T27 Build release gates and test the archive
  - Module: `verification`. Dependencies: T24, T25, T26.
  - Acceptance: static/contract/integration/package checks run in CI; archive contains needed runtime/resources and excludes secrets, local state and generated games.
  - Verification: `npm --prefix toolkit run build`, `typecheck`, `lint:content`, `test`, `test:integration`, `test:package`; clean packed install and template scenario.
  - Likely files: `.github/workflows/ci.yml`, `toolkit/test/package.test.ts`, `toolkit/package.json`, package file list/build rules, release evidence index. Scope: M.

- [ ] T28 Prepare and publish the first release
  - Module: `distribution`. Dependencies: T27; external publication authorization and real account/name details available.
  - Acceptance: reviewed release notes, compatibility matrix, archive/checksums and exact source commit are ready before any publish; final repository/npm names match the user's ownership.
  - Verification: release artifact inspection, then public clean install and repository-template walkthrough after authorized publication.
  - Likely files: release notes, compatibility record, release workflow and at most two metadata files. Scope: M plus external actions.
  - The owner has since authorized implementation and GitHub/archive delivery. npm registry publication is explicitly deferred. Initial alpha publication does not close this full-migration release task.

- [ ] C5 Completion checkpoint
  - All requirements R01–R08 have traceable outcomes. All claimed supported paths have evidence. No open item is hidden by a passing static scan. Optional plugin distribution stays outside this release gate.

## Skill migration work queue

Each S-row is an individual task owned by `codex-integration`.

- Dependencies: T05 and T20; core journey rows may start under T14 before T20 and must be revalidated afterward. Agent/team workflows also need T19 and their selected role rows; engine workflows need the corresponding T23 adapter.
- Files: one source Skill converted to `.agents/skills/game-studio-<name>/SKILL.md`, its necessary reference files, and its behavior spec. Split references into child slices to respect the five-file limit.
- Acceptance: valid metadata and trigger boundaries; explicit CLI/config calls; no Claude tool/model substitution; guided behavior; original domain outcomes retained; all references resolved.
- Verification: `lint:content`, one positive and one negative trigger, and the linked behavioral spec in a live Codex scenario. Alias rows verify the replacement mapping and absence of duplicate active entries instead.
- Record the tested client, scenario, artifact and result before checking a row. The inventory contains each row's exact source/spec paths.

- [ ] S001 Migrate `adopt` to `game-studio-adopt`. Evidence: pending.
- [ ] S002 Migrate `architecture-decision` to `game-studio-architecture-decision`. Partial: author/retrofit/accept Skill, references and complete ADR template; [12 reviewed native cases](../docs/evidence/architecture-decision-skill-2026-11-12.json), retaining the first Layer failure and recovered temporary-file ownership risk. Actual Web expert/TD sequence, authorized Status-only changes and precise story effects verified. Full native/engine/desktop acceptance remains pending in [the Codex matrix](../studio-tests/skills/authoring/architecture-decision-codex.md).
- [ ] S003 Migrate `architecture-review` to `game-studio-architecture-review`. Partial: six review modes, stable requirement IDs, engine lenses and structural traceability; build/content lint, 198 regression tests and installed archive pass. Native acceptance is in progress in [the Codex matrix](../studio-tests/skills/review/architecture-review-codex.md); no behavioral pass declared yet.
- [ ] S004 Migrate `art-bible` to `game-studio-art-bible`. Evidence: pending.
- [ ] S005 Migrate `asset-audit` to `game-studio-asset-audit`. Evidence: pending.
- [ ] S006 Migrate `asset-spec` to `game-studio-asset-spec`. Evidence: pending.
- [ ] S007 Migrate `balance-check` to `game-studio-balance-check`. Evidence: pending.
- [ ] S008 Migrate `brainstorm` to `game-studio-brainstorm`. Evidence: partial — [native CLI scenarios and preserved failure](../docs/evidence/brainstorm-skill-2026-11-12.json), plus [four native director reviews and missing-role regression](../docs/evidence/brainstorm-directors-2026-11-12.json); interactive choices, resume, other modes, remaining gate-verdict paths and desktop remain open.
  - Slices B1–B4 now have templates, gates, entrypoint/references and selected native evidence. Keep S008 open until its complete trigger, tier, mode, gate, resume and host matrix is verified. Missing director roles are explicit unavailable dependencies, not solo reviews counted as director evidence.
- [ ] S009 Migrate `bug-report` to `game-studio-bug-report`. Evidence: pending.
- [ ] S010 Migrate `bug-triage` to `game-studio-bug-triage`. Evidence: pending.
- [ ] S011 Retire alias `changelog`; route users to `game-studio-write-changelog`. Evidence: pending.
- [ ] S012 Migrate `code-review` to `game-studio-code-review`. Evidence: pending.
- [ ] S013 Migrate `consistency-check` to `game-studio-consistency-check`. Evidence: pending.
- [ ] S014 Migrate `content-audit` to `game-studio-content-audit`. Evidence: pending.
- [ ] S015 Migrate `create-architecture` to `game-studio-create-architecture`. Partial: source baseline, tiered architecture and native TD/LP reviews. [Native evidence](../docs/evidence/create-architecture-skill-2026-11-12.json) retains four failed full-generation attempts and selected other passes; the same-session revision branch passes with two real CONCERNS reviews, no acceptance. [Independent historical/current-byte audit](../docs/evidence/navigation-revision-integration-2026-11-12.json) verifies continuity and permitted changes. The broader [Codex matrix](../studio-tests/skills/authoring/create-architecture-codex.md) and desktop remain open.
- [ ] S016 Migrate `create-control-manifest` to `game-studio-create-control-manifest`. Evidence: pending.
- [ ] S017 Migrate `create-epics` to `game-studio-create-epics`. Evidence: pending.
- [ ] S018 Migrate `create-stories` to `game-studio-create-stories`. Evidence: pending.
- [ ] S019 Migrate `cut` to `game-studio-cut`. Evidence: pending.
- [ ] S020 Migrate `day-one-patch` to `game-studio-day-one-patch`. Evidence: pending.
- [ ] S021 Migrate `design-review` to `game-studio-design-review`. Partial: Skill, references and byte-sensitive receipt helper; [14 selected cases plus real review-to-reuse](../docs/evidence/design-review-skill-2026-11-12.json) verified across 17 native runs, retaining two initial scope-estimate failures. Four helper tests cover latest-entry receipt isolation. Actual specialist overlap, subsequent senior synthesis, missing-coverage refusal, exact tracking writes and identical-input scope correction verified. [Full Codex matrix](../studio-tests/skills/review/design-review-codex.md), complete domain panels and desktop remain open.
- [ ] S022 Migrate `design-system` to `game-studio-design-system`. Partial: full sectional workflow, local lenses and GDD template/guide; [10 reviewed native cases](../docs/evidence/design-system-skill-2026-11-12.json) preserve the initial cross-reference ownership-label failure and corrected same-input run. Exact Designed status, existing content/index/registry ownership, incremental checkpoint chains and no-spawn self-review verified. Full source/native/desktop acceptance remains open in [the Codex matrix](../studio-tests/skills/authoring/design-system-codex.md).
- [ ] S023 Migrate `dev-story` to `game-studio-dev-story`. Evidence: pending.
- [ ] S024 Migrate `estimate` to `game-studio-estimate`. Evidence: pending.
- [ ] S025 Migrate `gate-check` to `game-studio-gate-check`. Evidence: partial — canonical Skill, six orchestration references, all six phase definitions and [13 reviewed native scenarios](../docs/evidence/gate-check-skill-2026-11-12.json); the complete native matrix remains open.
  - Deterministic prerequisites now exist: `check --kind artifacts`, `check --kind gdd`, `check --kind adr-deps`; see T22. This does not close the Skill row.
  - [x] G1 Port Systems Design, Technical Setup and Pre-Production gate references (three files); retain workflow/QA/per-system criteria and declared evidence gaps. `4df86fb`: shared resources in `studio/docs/phase-gates`, actual engine inspection and ADR JSON observations replace Claude-only instructions; packed bytes verified.
  - [x] G2 Port Production, Polish and Release gate references (three files); retain smoke authenticity, performance policy, review and release requirements. All six resources retain 115 checklist items and all three tier definitions; literal CLI examples validate and installed archive bytes match. These are criteria resources, not completed host/workflow acceptance.
  - [x] G3 Port workflow-tier, deterministic-check and assessment references (three files); use pinned CLI observations and actual native director results. `1d69b28`: explicit workflow/QA reductions, effective system overrides, unknown evidence and native 0/1/2/4-role panel requirements.
  - [x] G4 Port verdict, stage-update and next-step references (three files); preserve failed/unassessed stage invariants and use transactional config writes within actual authorization. `1d69b28`: required unknowns remain blocking beneath a concern headline; concrete prior stage authorization is reused; future/unavailable workflows are not represented as installed.
  - [x] G5 Add the Codex Skill entry point, behavioral contract and catalog mapping; validate packaged references and instructions. `1d69b28` / `e49f0ea`: entry point, six references, six gate resources and two player-experience templates pass installed byte checks; catalog remains partial.
  - [ ] G6 Verify positive/negative triggers, tier/QA combinations, missing or placeholder evidence, real director execution, verdict precedence, authorized stage changes and rejected advancement in isolated native host scenarios. Keep unrun desktop and broader workflow cases open.
    - Native CLI fixtures verify 0/1/2/4-reviewer panels, actual director findings, missing-role reporting, target confirmation, negative triggering, unknown evidence, accepted-risk boundaries and three authorized stage transactions. All existing regular files outside the two stage files in those three cases are preserved. The evidence retains an initial backup assertion error, a contradictory test input and the stale five-role integration guide; corrected fresh runs are recorded. This does not close the later-phase, full QA/override, interactive/recovery or desktop matrix.
- [ ] S026 Retire alias `help`; route users to `game-studio-next-step`. Evidence: pending.
- [ ] S027 Migrate `hotfix` to `game-studio-hotfix`. Evidence: pending.
- [ ] S028 Migrate `launch-checklist` to `game-studio-launch-checklist`. Evidence: pending.
- [ ] S029 Migrate `localize` to `game-studio-localize`. Evidence: pending.
- [ ] S030 Migrate `map-systems` to `game-studio-map-systems`. Evidence: partial — canonical Skill, fixed template and [eight reviewed native cases](../docs/evidence/map-systems-skill-2026-11-12.json), with four prior attempts retained; full source/Codex and desktop matrices remain open.
  - [x] M1 Port the fixed-column systems-index template and verify its installed archive bytes. All sections and both table schemas are retained; only workflow/role names are namespaced. Build and packed install verification pass.
  - [x] M2 Implement the Codex entry point, phased director review and index/checkpoint/handoff references; preserve existing-index progress and guided authorization. Native evidence exposed checkpoint identity annotations and ambiguous gate-resource wording; both are corrected with fresh same-input runs.
  - [ ] M3 Validate natural triggering, missing context, new/resumed indexes, lean/solo/full reviews, fixed table contracts, explicit next-system routing and authorized checkpoint effects in isolated native fixtures. Preserve untested interactive, adverse-review and desktop cases as open.
    - Eight selected CLI cases pass manual artifact/trace review: new solo, resume, missing source, read-only next, voluntary minimal, full sequential director reviews, one-run solo override and negative trigger. Checkpoint saves retain one event/backup transaction and exact observed identity fields. Build/typecheck, 184 regression tests and corrected packed install pass. Missing roles, adverse outcomes, interactive modes, density/cycles, recovery conflicts and desktop remain open.
- [ ] S031 Migrate `milestone-review` to `game-studio-milestone-review`. Evidence: pending.
- [ ] S032 Migrate `next-step` to `game-studio-next-step`. Partial: complete source routes, installed capability checks, pinned artifact/story observations and 40 native scenarios defined. [43 native sessions](../docs/evidence/next-step-skill-2026-11-12.json) retain 39 scoped passes and four initial failures; all 40 defined labels have selected passes, with two identical labels sharing one actual session. [Independent reconciliation](../docs/evidence/navigation-revision-integration-2026-11-12.json) verifies all regular bytes/raw hashes; broader source variants and both-host acceptance remain open. See [Codex specification](../studio-tests/skills/utility/next-step-codex.md).
- [ ] S033 Migrate `onboard` to `game-studio-onboard`. Evidence: pending.
- [ ] S034 Migrate `patch-notes` to `game-studio-patch-notes`. Evidence: pending.
- [ ] S035 Migrate `perf-profile` to `game-studio-perf-profile`. Evidence: pending.
- [ ] S036 Migrate `playtest-report` to `game-studio-playtest-report`. Evidence: pending.
- [ ] S037 Migrate `project-settings` to `game-studio-project-settings`. Evidence: partial; installed Skill, five supplied-Skill cases, two regressions and native CLI read in `docs/evidence/project-settings-skill-2026-11-12.json`. Remaining cases in `studio-tests/skills/utility/project-settings-codex.md`.
- [ ] S038 Migrate `project-stage-detect` to `game-studio-project-stage-detect`. Evidence: pending.
- [ ] S039 Migrate `propagate-design-change` to `game-studio-propagate-design-change`. Evidence: pending.
- [ ] S040 Migrate `prototype` to `game-studio-prototype`. Evidence: pending.
- [ ] S041 Migrate `qa-plan` to `game-studio-qa-plan`. Evidence: pending.
- [ ] S042 Migrate `quick-design` to `game-studio-quick-design`. Evidence: pending.
- [ ] S043 Migrate `regression-suite` to `game-studio-regression-suite`. Evidence: pending.
- [ ] S044 Migrate `release-checklist` to `game-studio-release-checklist`. Evidence: pending.
- [ ] S045 Migrate `retrospective` to `game-studio-retrospective`. Evidence: pending.
- [ ] S046 Migrate `reverse-document` to `game-studio-reverse-document`. Evidence: pending.
- [ ] S047 Migrate `review-all-gdds` to `game-studio-review-all-gdds`. Evidence: pending.
- [ ] S048 Migrate `scope-check` to `game-studio-scope-check`. Evidence: pending.
- [ ] S049 Migrate `security-audit` to `game-studio-security-audit`. Evidence: pending.
- [ ] S050 Retire alias `settings`; route users to `game-studio-project-settings`. Evidence: supplied-Skill personal-settings request routes correctly; native alias selection remains pending.
- [ ] S051 Migrate `setup-engine` to `game-studio-setup-engine`. Evidence: pending.
- [ ] S052 Migrate `skill-improve` to `game-studio-skill-improve`. Evidence: pending.
- [ ] S053 Migrate `skill-test` to `game-studio-skill-test`. Evidence: pending.
- [ ] S054 Migrate `smoke-check` to `game-studio-smoke-check`. Evidence: partial; installed Skill, seven supplied-Skill scenarios, platform-table regression and native CLI zero-test rerun with prior-evidence preservation in `docs/evidence/smoke-skill-2026-11-12.json`. Remaining matrix: `studio-tests/skills/utility/smoke-check-codex.md`.
- [ ] S055 Migrate `soak-test` to `game-studio-soak-test`. Evidence: pending.
- [ ] S056 Migrate `sprint-plan` to `game-studio-sprint-plan`. Evidence: pending.
- [ ] S057 Migrate `sprint-status` to `game-studio-sprint-status`. Partial: read-only minimal/sprint routes and source boundary rules. [33 native runs](../docs/evidence/sprint-status-skill-2026-11-12.json) retain 26 scoped passes and seven original/intermediate failures; all 26 defined scenarios have selected passes after same-input corrections. Desktop, subdirectory, unavailable-runtime and broader source variants remain open. See [Codex specification](../studio-tests/skills/sprint/sprint-status-codex.md).
- [ ] S058 Migrate `start` to `game-studio-start`. Evidence: pending.
- [ ] S059 Migrate `story-done` to `game-studio-story-done`. Partial: eight phases and three conditional references preserve criteria/evidence, native reviews, authorized exact record closure, scope/commit boundaries and checkpoint recovery. [Five native runs](../docs/evidence/story-done-skill-2026-11-13.json) cover four selected cases with four scoped passes and one retained unsupported-system failure; a same-input retry uses project workflow correctly. Actual criterion markers, five authorized closure records, explicit risk acceptance, unchanged source/evidence/staged work and checkpoint hashes are verified. Six checker regression/negative controls and 293 tests on each Node 24/26 pass. Remaining native variants and desktop scenarios in the [Codex specification](../studio-tests/skills/readiness/story-done-codex.md) stay open.
- [ ] S060 Migrate `story-readiness` to `game-studio-story-readiness`. Partial: complete six-phase/six-group source mapping, pinned observers and true per-story QA routing. The [44-run selected matrix](../docs/evidence/story-readiness-final-matrix-2026-11-13.json) covers all 39 defined labels with 33 latest scoped PASS and six NOT ASSESSED, retaining five historical FAIL. Same-input repairs restore story-owned Engine Notes, scope announcement before facts and the one-story-only footer. Actual QA selection, inherited context and findings are observable; exact encrypted dispatch fields and latest multi-story internal verdict-before-dispatch timing remain unknown. Earlier domain passes retain their protocol limits. Broader variants, interactive follow-up/desktop and final-archive acceptance remain open. Build/typecheck/content, 293 tests per Node 24/26 and installed-package checks pass locally.
  - [Protocol follow-up](../docs/evidence/story-readiness-protocol-2026-11-13.json) retains two failures and two further cross-tier domain passes. Scope announcement timing was not fully covered by earlier scoped successes. Two explicit source requirements are clarified; both original-input native retries pass, and the remaining matrix stays open.
- [ ] S061 Migrate `team-audio` to `game-studio-team-audio`. Evidence: pending.
- [ ] S062 Migrate `team-combat` to `game-studio-team-combat`. Evidence: pending.
- [ ] S063 Migrate `team-level` to `game-studio-team-level`. Evidence: pending.
- [ ] S064 Migrate `team-live-ops` to `game-studio-team-live-ops`. Evidence: pending.
- [ ] S065 Migrate `team-narrative` to `game-studio-team-narrative`. Evidence: pending.
- [ ] S066 Migrate `team-polish` to `game-studio-team-polish`. Evidence: pending.
- [ ] S067 Migrate `team-qa` to `game-studio-team-qa`. Evidence: pending.
- [ ] S068 Migrate `team-release` to `game-studio-team-release`. Evidence: pending.
- [ ] S069 Migrate `team-ui` to `game-studio-team-ui`. Evidence: pending.
- [ ] S070 Migrate `tech-debt` to `game-studio-tech-debt`. Evidence: pending.
- [ ] S071 Migrate `test-evidence-review` to `game-studio-test-evidence-review`. Evidence: pending.
- [ ] S072 Migrate `test-flakiness` to `game-studio-test-flakiness`. Evidence: pending.
- [ ] S073 Migrate `test-helpers` to `game-studio-test-helpers`. Evidence: pending.
- [ ] S074 Migrate `test-setup` to `game-studio-test-setup`. Evidence: pending.
- [ ] S075 Migrate `ux-design` to `game-studio-ux-design`. Evidence: pending.
- [ ] S076 Migrate `ux-review` to `game-studio-ux-review`. Evidence: pending.
- [ ] S077 Migrate `vertical-slice` to `game-studio-vertical-slice`. Evidence: pending.
- [ ] S078 Migrate `write-changelog` to `game-studio-write-changelog`. Evidence: pending.

## Role migration work queue

Each A-row is an individual task owned by `codex-integration`.

- Dependencies: T01, T05, T20; core roles may start under T19 and must pass the final validator.
- Files: one `.codex/agents/game-studio-<name>.toml`, at most two role-specific references, its behavior spec, and one fixture.
- Acceptance: expertise and output responsibilities preserved; only supported Codex fields; session model inherited by default; no claims of permissions the role does not actually have.
- Verification: TOML/content validation and one actual delegated task using the linked behavior spec. Check role identity, write boundaries, meaningful output and parent aggregation.
- Record evidence before checking a row. Schema conversion alone is insufficient.

- [ ] A001 Migrate `accessibility-specialist` to `game-studio-accessibility-specialist`. Partial: [source/content and installed-byte review](../docs/evidence/accessibility-specialist-content-2026-11-13.json) covers all six responsibilities, five domain baselines and eight audit checks, separating studio thresholds, WCAG applicability, severity and gate status. Build/typecheck/content/packed checks and 293 tests per Node 24/26 pass. Seven raw native fixtures are in progress; full behavior, runtime/assistive-technology evidence, desktop and final archive acceptance remain open.
- [ ] A002 Migrate `ai-programmer` to `game-studio-ai-programmer`. Evidence: pending.
- [ ] A003 Migrate `analytics-engineer` to `game-studio-analytics-engineer`. Evidence: pending.
- [ ] A004 Migrate `art-director` to `game-studio-art-director`. Evidence: partial — native role, four gate resources and selected live cases; full source matrix, image review and desktop remain open. See [director evidence](../docs/evidence/director-roles-2026-11-12.json).
- [ ] A005 Migrate `audio-director` to `game-studio-audio-director`. Evidence: pending.
- [ ] A006 Migrate `community-manager` to `game-studio-community-manager`. Evidence: pending.
- [ ] A007 Migrate `creative-director` to `game-studio-creative-director`. Evidence: partial — native role, six gate resources and selected live cases; full source matrix, conflicts, writes and desktop remain open. See [director evidence](../docs/evidence/director-roles-2026-11-12.json).
- [ ] A008 Migrate `devops-engineer` to `game-studio-devops-engineer`. Evidence: pending.
- [ ] A009 Migrate `economy-designer` to `game-studio-economy-designer`. Evidence: pending.
- [ ] A010 Migrate `engine-programmer` to `game-studio-engine-programmer`. Evidence: pending.
- [ ] A011 Migrate `game-designer` to `game-studio-game-designer`. Partial: canonical role/methods resource and packed install/detach pass. Four native CLI cases exercise full/standard/minimal authoring and read-only specialist review. The role preserves approved rules, writes only the requested tier's document, flags the capacity/reset conflict without silently changing it, returns pillar tensions and formula/lore ownership, and claims no play acceptance. All 325 existing regular files in each initial fixture and 329 in the later minimal fixture remain unchanged; no checkpoint side writes. See [behavior spec](../studio-tests/roles/game-designer-codex.md) and [evidence](../docs/evidence/game-designer-2026-11-12.json). Existing-brief edits, open initial choices, economy/progression depth, broader specialist collaboration, desktop and final validator remain open. The T19 sequential fixture additionally proves actual brief-to-programmer hand-off.
- [ ] A012 Migrate `gameplay-programmer` to `game-studio-gameplay-programmer`. Partial: canonical role and packed install/detach pass. Native standard/minimal fixtures implement the approved pure combo module with external tuning, events, transition tables and real retained red/green runs; 22/23 authored tests pass respectively. Each implementation passes seven independent contract groups and three checker controls. In isolated copies, changing inclusive window comparisons to exclusive makes the original authored suites fail 10/9 tests, preserving original source. The read-only boundary case respects the Accepted ADR, UI/threading ownership, unverified engine API and missing design coefficients. See [behavior spec](../studio-tests/roles/gameplay-programmer-codex.md) and [evidence](../docs/evidence/gameplay-programmer-2026-11-12.json). Existing-source fixes, broader cross-role behavior, real engine/browser integration, desktop and final validator remain open. The T19 sequential fixture additionally proves independent native QA and lead review of its actual implementation.
- [ ] A013 Migrate `godot-csharp-specialist` to `game-studio-godot-csharp-specialist`. Evidence: pending.
- [ ] A014 Migrate `godot-gdextension-specialist` to `game-studio-godot-gdextension-specialist`. Evidence: pending.
- [ ] A015 Migrate `godot-gdscript-specialist` to `game-studio-godot-gdscript-specialist`. Evidence: pending.
- [ ] A016 Migrate `godot-shader-specialist` to `game-studio-godot-shader-specialist`. Evidence: pending.
- [ ] A017 Migrate `godot-specialist` to `game-studio-godot-specialist`. Evidence: pending.
- [ ] A018 Migrate `lead-programmer` to `game-studio-lead-programmer`. Partial: canonical role and two LP gates pass metadata/packed checks. Native code review returns APPROVE for sound combat, REJECT for armor addition, NOT ASSESSED for omitted GDD and CONCERNS for explicitly nonexistent GDD. Three real maintainer Node tests and an independent faulty-candidate run support the observations without being attributed to the native agent. A read-only feasibility task quantifies budgets/estimates, proposes unapproved alternatives and preserves creative versus technical ownership. Review preserves 338 original regular files and adds only its report; feasibility preserves 328 and adds none. A preparation reporter mismatch was corrected before native execution. See [behavior spec](../studio-tests/roles/lead-programmer-codex.md) and [evidence](../docs/evidence/lead-programmer-2026-11-12.json). Architecture/refactoring writes, broader specialist hand-offs, engine API validation, desktop and final validator remain open. The T19 sequential fixture additionally proves read-only review of a separately authored native implementation and QA suite.
- [ ] A019 Migrate `level-designer` to `game-studio-level-designer`. Evidence: pending.
- [ ] A020 Migrate `live-ops-designer` to `game-studio-live-ops-designer`. Evidence: pending.
- [ ] A021 Migrate `localization-lead` to `game-studio-localization-lead`. Evidence: pending.
- [ ] A022 Migrate `narrative-director` to `game-studio-narrative-director`. Evidence: pending.
- [ ] A023 Migrate `network-programmer` to `game-studio-network-programmer`. Evidence: pending.
- [ ] A024 Migrate `performance-analyst` to `game-studio-performance-analyst`. Evidence: pending.
- [ ] A025 Migrate `producer` to `game-studio-producer`. Evidence: partial — native role, five gate resources and selected live cases; full source matrix, planning writes and desktop remain open. See [director evidence](../docs/evidence/director-roles-2026-11-12.json).
- [ ] A026 Migrate `prototyper` to `game-studio-prototyper`. Evidence: pending.
- [ ] A027 Migrate `qa-lead` to `game-studio-qa-lead`. Partial: canonical role and two portable QL gate definitions pass TOML parsing, packed installation/resource resolution and detach. Native CLI readiness and minimal-policy scenarios preserve all 321 existing files per fixture; read-only work creates no artifact, while an authorized plan adds only its named report. Readiness initially confused missing GDD input with a story defect; a definition/role correction and identical-input native rerun restore NOT ASSESSED. Standard coverage correctly rejects zero-test PASS, distinguishes advisory Config evidence, triages reported data loss and refuses release, but initially misroutes test-harness ownership; its corrected native rerun assigns the actual QA tester and preserves all 327 original files, adding only the named report. See [behavior spec](../studio-tests/roles/qa-lead-codex.md) and [five-run evidence including both failures](../docs/evidence/qa-lead-2026-11-12.json). Desktop, nested collaboration, remaining matrix and final validator acceptance remain open.
- [ ] A028 Migrate `qa-tester` to `game-studio-qa-tester`. Partial: canonical TOML and packed install/detach pass; native CLI selected the real role, inherited model/permissions, rejected zero-test PASS, reported the static score defect and returned nine unexecuted test cases plus pending decisions. All 322 pre-existing files were unchanged; only two authorized Markdown reports were added. See [behavior spec](../studio-tests/roles/qa-tester-codex.md) and [initial evidence](../docs/evidence/qa-role-2026-11-12.json). Additional [workflow evidence](../docs/evidence/qa-role-workflows-2026-11-12.json) verifies read-only output with no changes, targeted save regression/edge cases, explicit gate policy, unavailable-lead/S1 escalation and no release approval. A first regression run invented an extra UI sign-off gate; the role was corrected and a fresh run with identical inputs returned 11 unexecuted cases without extra approval gates, preserving all 321 existing files. [Godot evidence](../docs/evidence/qa-godot-2026-11-12.json) now verifies actual role-authored GdUnit tests, 12 passing assertions/zero orphans, honest engine-error reporting and independent failure/cleanup controls; all 836 original files were preserved. Clean native engine execution, Unity/Unreal scaffolds and the final validator remain open.
- [ ] A029 Migrate `release-manager` to `game-studio-release-manager`. Evidence: pending.
- [ ] A030 Migrate `security-engineer` to `game-studio-security-engineer`. Evidence: pending.
- [ ] A031 Migrate `sound-designer` to `game-studio-sound-designer`. Evidence: pending.
- [ ] A032 Migrate `systems-designer` to `game-studio-systems-designer`. Partial: native role and complete formula/interaction/tuning methods; [17 recorded native scenarios](../docs/evidence/systems-designer-role-2026-11-12.json) include 15 scoped passes and two retained initial failures, plus [independent file/trace reconciliation](../docs/evidence/systems-designer-integration-2026-11-12.json). Static and installed-package checks pass; missing-resource/denial, desktop/subdirectory, concurrent-write and remaining domain acceptance stay open.
- [ ] A033 Migrate `technical-artist` to `game-studio-technical-artist`. Evidence: pending.
- [ ] A034 Migrate `technical-director` to `game-studio-technical-director`. Evidence: partial — native role, eight gate resources and selected live cases; full source matrix, engine API validation, ADR acceptance writes and desktop remain open. See [director evidence](../docs/evidence/director-roles-2026-11-12.json).
- [ ] A035 Migrate `tools-programmer` to `game-studio-tools-programmer`. Evidence: pending.
- [ ] A036 Migrate `ue-blueprint-specialist` to `game-studio-ue-blueprint-specialist`. Evidence: pending.
- [ ] A037 Migrate `ue-gas-specialist` to `game-studio-ue-gas-specialist`. Evidence: pending.
- [ ] A038 Migrate `ue-replication-specialist` to `game-studio-ue-replication-specialist`. Evidence: pending.
- [ ] A039 Migrate `ue-umg-specialist` to `game-studio-ue-umg-specialist`. Evidence: pending.
- [ ] A040 Migrate `ui-programmer` to `game-studio-ui-programmer`. Partial: complete source responsibilities mapped; installed bytes and [flow-design ownership redirect](../docs/evidence/ui-programmer-role-2026-11-13.json) pass selected checks. [Inventory and same-session bounce](../docs/evidence/ui-programmer-interactions-2026-11-13.json) have actual Godot 4.7.2 rendering, bindings, input and animation evidence with frozen/current file and trace continuity. Default gamepad confirmation remains FAIL from the existing input map; bounce has unapproved focus/interruption choices and an overstated parent import summary. No original failure is erased by later screenshots. [Original Godot 4.6 evidence](../docs/evidence/ui-programmer-godot46-2026-11-13.json) now verifies the actual 4.6.1 Control/ScrollContainer core, retaining the full-fixture gamepad failure (29/30 assertions); root reconciled 100 frozen artifacts, 640 files and the engine binary. [Empty-slot continuation](../docs/evidence/ui-programmer-empty-2026-11-13.json) proves the actual question and clearing after the supplied answer, preserving 568 originals and both trace prefixes. Full fixture FAIL retains missing gamepad input, transient root export writes and unanswered initial state questions. Broader input/accessibility/performance and desktop/final-archive behavior in the [Codex specification](../studio-tests/roles/ui-programmer-codex.md) remain open.
- [ ] A041 Migrate `unity-addressables-specialist` to `game-studio-unity-addressables-specialist`. Evidence: pending.
- [ ] A042 Migrate `unity-dots-specialist` to `game-studio-unity-dots-specialist`. Evidence: pending.
- [ ] A043 Migrate `unity-shader-specialist` to `game-studio-unity-shader-specialist`. Evidence: pending.
- [ ] A044 Migrate `unity-specialist` to `game-studio-unity-specialist`. Evidence: pending.
- [ ] A045 Migrate `unity-ui-specialist` to `game-studio-unity-ui-specialist`. Evidence: pending.
- [ ] A046 Migrate `unreal-specialist` to `game-studio-unreal-specialist`. Evidence: pending.
- [ ] A047 Migrate `ux-designer` to `game-studio-ux-designer`. Partial: all six responsibilities, seven accessibility checks, research-driven choices, flow-step purposes and ownership boundaries mapped into native TOML. [Content/install validation](../docs/evidence/ux-designer-content-2026-11-13.json) and 293 tests per Node 24/26 pass. [Six native runs](../docs/evidence/ux-designer-native-2026-11-13.json) retain two selected passes and four contract failures. Approved specification writes and implementation hand-off pass; flow preservation/research/timing constraints pass domain subchecks, while premature dependent drafting and end-of-analysis decision presentation need correction. Root rehashed 3,383 actual files and reviewed all six child finals. [Four same-input retries](../docs/evidence/ux-designer-reruns-2026-11-13.json) and a minimal decision/order correction add two selected passes; discovery no longer drafts dependent flow, while discovery/timing still fail final-choice ordering. Root independently checked 2,255 additional regular files and actual archive differences. Latest six scenarios: four selected passes, two failures. Actual owner-choice continuation, specialist coordination, analytics/ux-design dependencies and desktop remain open.
- [ ] A048 Migrate `world-builder` to `game-studio-world-builder`. Evidence: pending.
- [ ] A049 Migrate `writer` to `game-studio-writer`. Evidence: pending.

## Requirement traceability

| Requirement | Main tasks | Completion evidence |
| --- | --- | --- |
| R01 Desktop and CLI | T01, T10, T14, T16–T19, T27 | Named client integration/journey records |
| R02 Codex specialization | T17, T20–T22, T26 | Inventory parity and residual-coupling scan |
| R03 English documentation | T26 | Reviewed English install/reference material |
| R04 Template support | T05, T09, T27 | Clean repository-template walkthrough |
| R05 CLI plus Skills | T03–T15 | Packed install, discovery and real operations |
| R06 Guided autonomy | T14, T19, every relevant S/A row | Scenario with key decisions and uninterrupted authorized execution |
| R07 User-owned GitHub | T26, T28 | Verified owner, attribution and authorized release |
| R08 Design before code | Current documents | This task adds planning documents only |

