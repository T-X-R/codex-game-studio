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

The initial alpha implements deterministic install and Web slices while C0 host verification remains open. This sequencing adjustment does not waive host acceptance. Three project Skill entry points exist, but their full S-row behavioral migration remains open. All role rows remain open.

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
native editor execution requirements. Native CI for this batch is pending.

## M0 Compatibility and contracts

- [ ] T01 Establish Codex integration evidence
  - 2026-11-12 evidence: a fresh read-only CLI role fixture completed but returned `ROLE_SELECTION_UNAVAILABLE`, with no child or hidden marker. The reproducible probe and sanitized record are linked from `docs/codex-compatibility.md`. Native role selection and desktop acceptance remain open.
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
  - Module: `codex-integration`. Dependencies: T13.
  - Work queue: the individual Skill rows for `start`, `prototype`, `next-step`, `project-settings`, `smoke-check`; execute each in bounded slices.
  - Acceptance: natural-language request reaches a brief, built game and evidence; subsequent change preserves agreed requirements; guided behavior avoids per-file approval loops.
  - Verification: one full scenario in each client plus the individual Skill specifications. Missing runtime/approval returns a clear next action.
  - Likely files per slice: one Skill body, up to three references, its behavior spec. Scope: M per slice; this parent closes only after all child rows pass.

- [ ] T15 Grow a prototype and configure an engine
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
  - Module: `codex-integration`. Dependencies: T01, T18; core role rows for designer, programmer and QA complete.
  - Acceptance: coordinator delegates with explicit scope, aggregates findings and handles blocked roles; independent review is performed by a separate agent; parent permissions remain effective.
  - Verification: parallel read-only tasks, sequential dependency, disjoint writes and shared-checkpoint conflict; unknown task/role returns a clear failure.
  - Likely files per slice: orchestration guidance, one `team-*` Skill, two scenario fixtures, behavior spec. Scope: M.

- [ ] C3 Control and recovery checkpoint
  - Real guards block their tested violations, evidence is attributed correctly, and desktop/CLI resume use the same project state. Unsupported hook/capability cases are visible in doctor and release notes.

## M4 Complete content and engine migration

- [ ] T20 Replace the content validator and test catalog rules
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
  - Modules: `project-state`, `game-operations`, `codex-integration`. Dependencies: T20.
  - Work queue: each of 54 shared-script/resource rows and 14 scoped-rule rows in the inventory; complete reused items after their T11–T18 implementation is verified.
  - Acceptance per helper: preserved observations/side effects, correct package/project roots, declared platform dependencies and no active Claude coupling. Acceptance per rule: correct scope and no unrelated global trigger.
  - Verification: representative legacy/new fixture parity; packed-install execution; rule positive/negative applicability cases.
  - Likely files per helper slice: source/resource, consumer, contract fixture, test, source mapping. Per rule slice: rule, applicability index, behavior fixture. Scope: S/M.

- [ ] T23 Validate engine-specific operations
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
- [ ] S002 Migrate `architecture-decision` to `game-studio-architecture-decision`. Evidence: pending.
- [ ] S003 Migrate `architecture-review` to `game-studio-architecture-review`. Evidence: pending.
- [ ] S004 Migrate `art-bible` to `game-studio-art-bible`. Evidence: pending.
- [ ] S005 Migrate `asset-audit` to `game-studio-asset-audit`. Evidence: pending.
- [ ] S006 Migrate `asset-spec` to `game-studio-asset-spec`. Evidence: pending.
- [ ] S007 Migrate `balance-check` to `game-studio-balance-check`. Evidence: pending.
- [ ] S008 Migrate `brainstorm` to `game-studio-brainstorm`. Evidence: pending.
- [ ] S009 Migrate `bug-report` to `game-studio-bug-report`. Evidence: pending.
- [ ] S010 Migrate `bug-triage` to `game-studio-bug-triage`. Evidence: pending.
- [ ] S011 Retire alias `changelog`; route users to `game-studio-write-changelog`. Evidence: pending.
- [ ] S012 Migrate `code-review` to `game-studio-code-review`. Evidence: pending.
- [ ] S013 Migrate `consistency-check` to `game-studio-consistency-check`. Evidence: pending.
- [ ] S014 Migrate `content-audit` to `game-studio-content-audit`. Evidence: pending.
- [ ] S015 Migrate `create-architecture` to `game-studio-create-architecture`. Evidence: pending.
- [ ] S016 Migrate `create-control-manifest` to `game-studio-create-control-manifest`. Evidence: pending.
- [ ] S017 Migrate `create-epics` to `game-studio-create-epics`. Evidence: pending.
- [ ] S018 Migrate `create-stories` to `game-studio-create-stories`. Evidence: pending.
- [ ] S019 Migrate `cut` to `game-studio-cut`. Evidence: pending.
- [ ] S020 Migrate `day-one-patch` to `game-studio-day-one-patch`. Evidence: pending.
- [ ] S021 Migrate `design-review` to `game-studio-design-review`. Evidence: pending.
- [ ] S022 Migrate `design-system` to `game-studio-design-system`. Evidence: pending.
- [ ] S023 Migrate `dev-story` to `game-studio-dev-story`. Evidence: pending.
- [ ] S024 Migrate `estimate` to `game-studio-estimate`. Evidence: pending.
- [ ] S025 Migrate `gate-check` to `game-studio-gate-check`. Evidence: pending.
- [ ] S026 Retire alias `help`; route users to `game-studio-next-step`. Evidence: pending.
- [ ] S027 Migrate `hotfix` to `game-studio-hotfix`. Evidence: pending.
- [ ] S028 Migrate `launch-checklist` to `game-studio-launch-checklist`. Evidence: pending.
- [ ] S029 Migrate `localize` to `game-studio-localize`. Evidence: pending.
- [ ] S030 Migrate `map-systems` to `game-studio-map-systems`. Evidence: pending.
- [ ] S031 Migrate `milestone-review` to `game-studio-milestone-review`. Evidence: pending.
- [ ] S032 Migrate `next-step` to `game-studio-next-step`. Evidence: pending.
- [ ] S033 Migrate `onboard` to `game-studio-onboard`. Evidence: pending.
- [ ] S034 Migrate `patch-notes` to `game-studio-patch-notes`. Evidence: pending.
- [ ] S035 Migrate `perf-profile` to `game-studio-perf-profile`. Evidence: pending.
- [ ] S036 Migrate `playtest-report` to `game-studio-playtest-report`. Evidence: pending.
- [ ] S037 Migrate `project-settings` to `game-studio-project-settings`. Evidence: pending.
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
- [ ] S050 Retire alias `settings`; route users to `game-studio-project-settings`. Evidence: pending.
- [ ] S051 Migrate `setup-engine` to `game-studio-setup-engine`. Evidence: pending.
- [ ] S052 Migrate `skill-improve` to `game-studio-skill-improve`. Evidence: pending.
- [ ] S053 Migrate `skill-test` to `game-studio-skill-test`. Evidence: pending.
- [ ] S054 Migrate `smoke-check` to `game-studio-smoke-check`. Evidence: pending.
- [ ] S055 Migrate `soak-test` to `game-studio-soak-test`. Evidence: pending.
- [ ] S056 Migrate `sprint-plan` to `game-studio-sprint-plan`. Evidence: pending.
- [ ] S057 Migrate `sprint-status` to `game-studio-sprint-status`. Evidence: pending.
- [ ] S058 Migrate `start` to `game-studio-start`. Evidence: pending.
- [ ] S059 Migrate `story-done` to `game-studio-story-done`. Evidence: pending.
- [ ] S060 Migrate `story-readiness` to `game-studio-story-readiness`. Evidence: pending.
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

- [ ] A001 Migrate `accessibility-specialist` to `game-studio-accessibility-specialist`. Evidence: pending.
- [ ] A002 Migrate `ai-programmer` to `game-studio-ai-programmer`. Evidence: pending.
- [ ] A003 Migrate `analytics-engineer` to `game-studio-analytics-engineer`. Evidence: pending.
- [ ] A004 Migrate `art-director` to `game-studio-art-director`. Evidence: pending.
- [ ] A005 Migrate `audio-director` to `game-studio-audio-director`. Evidence: pending.
- [ ] A006 Migrate `community-manager` to `game-studio-community-manager`. Evidence: pending.
- [ ] A007 Migrate `creative-director` to `game-studio-creative-director`. Evidence: pending.
- [ ] A008 Migrate `devops-engineer` to `game-studio-devops-engineer`. Evidence: pending.
- [ ] A009 Migrate `economy-designer` to `game-studio-economy-designer`. Evidence: pending.
- [ ] A010 Migrate `engine-programmer` to `game-studio-engine-programmer`. Evidence: pending.
- [ ] A011 Migrate `game-designer` to `game-studio-game-designer`. Evidence: pending.
- [ ] A012 Migrate `gameplay-programmer` to `game-studio-gameplay-programmer`. Evidence: pending.
- [ ] A013 Migrate `godot-csharp-specialist` to `game-studio-godot-csharp-specialist`. Evidence: pending.
- [ ] A014 Migrate `godot-gdextension-specialist` to `game-studio-godot-gdextension-specialist`. Evidence: pending.
- [ ] A015 Migrate `godot-gdscript-specialist` to `game-studio-godot-gdscript-specialist`. Evidence: pending.
- [ ] A016 Migrate `godot-shader-specialist` to `game-studio-godot-shader-specialist`. Evidence: pending.
- [ ] A017 Migrate `godot-specialist` to `game-studio-godot-specialist`. Evidence: pending.
- [ ] A018 Migrate `lead-programmer` to `game-studio-lead-programmer`. Evidence: pending.
- [ ] A019 Migrate `level-designer` to `game-studio-level-designer`. Evidence: pending.
- [ ] A020 Migrate `live-ops-designer` to `game-studio-live-ops-designer`. Evidence: pending.
- [ ] A021 Migrate `localization-lead` to `game-studio-localization-lead`. Evidence: pending.
- [ ] A022 Migrate `narrative-director` to `game-studio-narrative-director`. Evidence: pending.
- [ ] A023 Migrate `network-programmer` to `game-studio-network-programmer`. Evidence: pending.
- [ ] A024 Migrate `performance-analyst` to `game-studio-performance-analyst`. Evidence: pending.
- [ ] A025 Migrate `producer` to `game-studio-producer`. Evidence: pending.
- [ ] A026 Migrate `prototyper` to `game-studio-prototyper`. Evidence: pending.
- [ ] A027 Migrate `qa-lead` to `game-studio-qa-lead`. Evidence: pending.
- [ ] A028 Migrate `qa-tester` to `game-studio-qa-tester`. Evidence: pending.
- [ ] A029 Migrate `release-manager` to `game-studio-release-manager`. Evidence: pending.
- [ ] A030 Migrate `security-engineer` to `game-studio-security-engineer`. Evidence: pending.
- [ ] A031 Migrate `sound-designer` to `game-studio-sound-designer`. Evidence: pending.
- [ ] A032 Migrate `systems-designer` to `game-studio-systems-designer`. Evidence: pending.
- [ ] A033 Migrate `technical-artist` to `game-studio-technical-artist`. Evidence: pending.
- [ ] A034 Migrate `technical-director` to `game-studio-technical-director`. Evidence: pending.
- [ ] A035 Migrate `tools-programmer` to `game-studio-tools-programmer`. Evidence: pending.
- [ ] A036 Migrate `ue-blueprint-specialist` to `game-studio-ue-blueprint-specialist`. Evidence: pending.
- [ ] A037 Migrate `ue-gas-specialist` to `game-studio-ue-gas-specialist`. Evidence: pending.
- [ ] A038 Migrate `ue-replication-specialist` to `game-studio-ue-replication-specialist`. Evidence: pending.
- [ ] A039 Migrate `ue-umg-specialist` to `game-studio-ue-umg-specialist`. Evidence: pending.
- [ ] A040 Migrate `ui-programmer` to `game-studio-ui-programmer`. Evidence: pending.
- [ ] A041 Migrate `unity-addressables-specialist` to `game-studio-unity-addressables-specialist`. Evidence: pending.
- [ ] A042 Migrate `unity-dots-specialist` to `game-studio-unity-dots-specialist`. Evidence: pending.
- [ ] A043 Migrate `unity-shader-specialist` to `game-studio-unity-shader-specialist`. Evidence: pending.
- [ ] A044 Migrate `unity-specialist` to `game-studio-unity-specialist`. Evidence: pending.
- [ ] A045 Migrate `unity-ui-specialist` to `game-studio-unity-ui-specialist`. Evidence: pending.
- [ ] A046 Migrate `unreal-specialist` to `game-studio-unreal-specialist`. Evidence: pending.
- [ ] A047 Migrate `ux-designer` to `game-studio-ux-designer`. Evidence: pending.
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

