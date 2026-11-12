# Implementation status — 2026-11-12

This is an initial executable alpha, not completion of the full migration plan.
The owner authorized implementation and chose GitHub owner `T-X-R`, repository
`codex-game-studio`, and GitHub archive distribution without npm publication.

## Implemented and exercised

- Systems mapping now has a Codex Skill, two focused references and the complete
  fixed-column index template. [Eight native scenarios](evidence/map-systems-skill-2026-11-12.json)
  cover new/resumed mapping, source absence, read-only next selection, optional
  minimal use, sequential full reviews, a one-run solo override and a negative
  trigger. Existing rows/GDDs and recovery narrative survive the resumed update;
  actual director findings retain unresolved verification and unaccepted advice.
  Three early runs exposed annotated checkpoint identity fields; two full-review
  runs recovered from an ambiguous role-resource lookup. Both guidance defects
  are corrected and fresh same-input runs verify the fixes. Four prior attempts
  remain in the evidence. Build/typecheck, 184 regression tests and rebuilt
  archive checks pass. This is selected CLI evidence, not complete S030 or desktop
  acceptance; the remaining behavior matrix stays open.
- Read-only gate prerequisites now expose `check --kind gdd` for section and
  placeholder observations and `check --kind adr-deps` for dependency edges,
  cycles, transitive blocking and tentative ordering. Missing dependency
  declarations, nonexistent references and ambiguous IDs remain visible.
  Empty scans return not assessed; successful collection is not a gate verdict.
  Eight GDD fixtures match the upstream helper, and a separate ADR fixture
  matches cycle members, blocked dependents and independent ordering. Nine new
  CLI tests bring the local suite to 176 passes; build/typecheck/content
  validation and packed-runtime positive/empty cases pass. The initial full
  GDD regression run hit sandbox localhost-listen restrictions; its authorized
  rerun passed before the ADR additions. See [GDD observations](gdd-structure.md)
  and [ADR observations](adr-dependencies.md). Complete gate-check behavioral
  and native workflow acceptance remain open.
- The complete workflow catalog now ships with the pinned runtime: seven phase
  groups / 49 steps plus the five-step minimal path. `check --kind artifacts`
  reports existence, pattern matches, minimum counts, alternatives and steps
  that cannot be judged from disk. Ten project fixtures match 540 upstream
  step observations, including required/repeatable flags and check kinds.
  An unreadable-report control returns UNKNOWN / not assessed while retaining
  all nine phase rows. Catalog integrity, CLI and installed-runtime checks pass;
  the local suite now has 184 passing tests. See [artifact observations](artifact-check.md).
  The catalog names intended Skills without claiming they are all installed;
  phase verdicts, content adequacy and stage changes remain workflow work.
- Six phase-gate criteria resources now live in `studio/docs/phase-gates`,
  retaining 115 checklist items and all three workflow-tier definitions.
  Engine inspection, ADR graph observations and configured tests use the pinned
  CLI instead of Claude paths/tools. The copied criteria preserve minimal-path
  exceptions, missing-playtest distinctions, vertical-slice failure rules and
  scope-sensitive security/localization evidence. Command examples validate and
  all six installed resource files match their canonical bytes. G1/G2 resource
  migration is complete. The gate Skill entry point and six orchestration
  references now use these resources, preserve independent workflow/QA policy,
  and require actual native reviewer results. Stage changes use the existing
  configuration transaction and previously granted concrete authorization.
  Difficulty-curve and player-journey templates are included without claiming
  an installed authoring workflow. The native fixture now verifies 20 installed
  Skill/reference/template files, including the integration guide, against
  canonical bytes. G3–G5 implementation is complete.
- Thirteen isolated native gate-check scenarios now have [reviewed evidence](evidence/gate-check-skill-2026-11-12.json).
  The real 0/1/2/4-role panels preserve independent READY, CONCERNS and NOT READY
  outcomes; missing roles remain unassessed. A missing concept, placeholder
  evidence, unplayed build and required unknowns beneath accepted concerns do
  not advance. Three eligible, specifically authorized transitions update only
  the stage scalar and its mirror through the CLI transaction. Ordinary code
  questions do not trigger a gate; unspecified targets require confirmation.
  An initial harness backup false alarm, contradictory fixture input and stale
  five-role integration guide are preserved with their corrections and fresh
  reruns. Build/typecheck/content checks, 184 regression tests and rebuilt-archive
  verification pass. Later-phase, full QA/override, interactive/recovery and
  desktop cases remain open under G6/S025; synthetic owner feedback is not actual
  human game acceptance.
- Typed CLI argument contracts, JSON results, help/schema and explicit exit codes.
- Nearest project discovery, configuration reads with provenance and rigor/local
  precedence, named system workflow overrides and legacy technical-preference
  import, plus legacy boolean test strictness. Explicit summaries cover gate
  levels, review gates, engine values/roots, performance budgets, input methods
  and specialist selections. Selections do not prove native role loading.
- Configuration writes with local-key restrictions, value validation, comment
  and scalar-quote preservation, no-op detection and synchronized stage mirrors.
  Concurrent changes and destructive YAML shape edits are refused. Transaction
  journals and backups are created with owner-only POSIX permissions.
- Checkpoint show/save with a bounded recovery preview, whole-record expected
  hashes, immutable save events, replay protection and interrupted-write recovery.
  Existing narrative/line endings survive updates. Git observations are separate
  from recorded claims; automatic lifecycle hook integration remains open.
- Engine inspection preserves engine-specific roots and reports missing,
  ambiguous, case-mismatched, unsafe or unresolved module paths. Inspection does
  not certify editor installation, licensing or execution.
- Engine setup applies explicit version/language/paths and selected specialist,
  naming and command settings in one transaction with the technical preference
  mirror. It preserves custom notes and unspecified values, guards both documents
  against concurrent edits, and reports uncreated directories without claiming
  runtime readiness. See [the configuration contract](engine-configuration.md).
- Godot scaffolding creates only a missing project file from explicit settings.
  Editor verification checks the pinned version and import capability, preserves
  per-process logs, and rejects engine errors even with a zero exit. Unity/Unreal
  project creation remains editor-owned; Web growth remains open.
- Configured test/smoke/build execution selects OS-specific project commands,
  uses explicit engine defaults only when applicable, preserves stdout/stderr and
  original exit codes, and distinguishes failure, timeout and unavailable capability.
- Canonical resource packaging and one globally installed onboarding Skill.
- `lint:content` now parses canonical Skill YAML and role TOML, checks local
  references and packaging boundaries, and reconciles catalog v3 with 75 primary
  workflow inputs, 49 roles and three retired aliases. The mapping slice's eight project
  Skills and nine roles remain explicitly partial; no behavior row is promoted
  by static checks. Complete-declaration mode correctly fails for open rows.
  Installed-archive verification uses the packaged validator and rejects a
  deliberately removed reference before restoring it. Metadata, resource,
  catalog and negative-path tests bring the local suite to 149 passes. See
  [validation evidence](evidence/content-validation-2026-11-12.json) and
  [the contract](content-validation.md). A subsequent [command-example slice](evidence/command-examples-2026-11-12.json)
  checks explicit invocations against runtime command metadata, including an
  installed-archive stale-command control; 153 local tests pass. T20 still needs
  remaining legacy consumer/spec replacement; host/journey acceptance remains independently open. The
  [Codex rubric](../studio-tests/quality-rubric.md), maintainer guide and spec
  templates now preserve 15 categories/57 metrics with guided authorization and
  separate static versus behavioral evidence. Their migration is documentation
  work, not a new live acceptance result.
  Source inventory reconciliation additionally covers all 86 rule/Hook/helper
  inputs and 15 retained Hook registrations. Negative controls and 159 local
  tests pass, along with packed installation; no Codex runtime behavior is
  inferred. Windows CI exposed two LF-only negative-fixture mutations; explicit
  CRLF reproduction and corrected fixtures bring local tests to 162 passes. The
  validator is unchanged. See [source inventory evidence](evidence/source-inventory-2026-11-12.json),
  including the failed CI attempt.
- Installed project content checks through `check --kind content` validate actual
  Skill/role bodies and missing expected entries, resolve shared resources from
  the running pinned package, and preserve local Markdown reference semantics.
  Other namespaces remain unassessed; no command or Hook executes during the
  check. 167 local tests and packed positive/mutation/restoration checks pass.
  See [project content evidence](evidence/project-content-check-2026-11-12.json).
- Project attachment, exact runtime pins, local launchers, portable development
  archives, explicit npm restore with lifecycle scripts disabled and single-hop
  dispatch from a different global CLI version.
- Owned-file conflict detection, dry runs, install locks, journals, rollback,
  explicit interrupted-install recovery and conservative detach.
- Web fixed-step scaffold, standalone game import, classic-script static checks,
  localhost preview, deterministic browser replay and a new static distribution
  directory with development-only evidence omitted.
- Read-only Web growth prerequisites detect existing game/toolchain conflicts,
  invalid engine choices and dirty prototype code, including both rename paths.
  Broken Git inspection is not assessed. Eligibility does not claim a completed
  growth, build or gameplay comparison. See [the growth contract](prototype-growth.md).
- Explicit Web growth copy stage preserves prototype and binary asset bytes,
  generates pinned build tooling, refuses conflicts and separates development
  tuning from production. A packed-runtime fixture builds both outputs and proves
  same-seed input/scoring states and screenshots match in real Chrome. Copy does
  not complete TypeScript/data conversion, game-rule tests or human play.
- Six project Skills: start, prototype, next-step, project-settings, smoke-check and brainstorm. These are alpha entry
  points covering implemented operations; they do not close the full upstream
  behavioral migration rows.
- Brainstorm now selects a lean brief or full concept flow, packages both original
  templates and four director gate resources, and preserves user creative choices
  with guided write authorization. Native CLI fixtures exercise natural discovery,
  negative routing, an authorized brief and a standard/solo concept. Full review
  mode also saved an authorized draft with all four missing director reviews
  explicitly NOT ASSESSED; no substitute reviewer was invented. The first
  brief incorrectly copied tooling/permission text into game design; a focused
  correction and fresh same-request replay removed that contamination while
  preserving exact game input. See [the evidence](evidence/brainstorm-skill-2026-11-12.json).
  A subsequent [four-role integration](evidence/brainstorm-directors-2026-11-12.json)
  selects independent native creative/art reviewers, then technical and production
  reviewers. The draft retains APPROVE / STRONG / CONCERNS / OPTIMISTIC without
  silently accepting schedule changes; all 392 original files are preserved.
  Removing the four roles in a separate fixture still produces honest NOT ASSESSED
  reviews. These observations do not close S008: interactive selections, resume,
  mode variations, remaining director verdict paths and desktop remain open.
- The prototype Skill now includes selected/resumed Web growth guidance and
  shared TypeScript hook/tuning resources. An independent scoring/pause fixture
  completed typed modules, JSON/live configuration, 5 rule tests, 3 real Chrome
  tests and 1 smoke check. Independent type-error injection, source preservation
  and replay/screenshot equality passed. See [the evidence](evidence/web-growth-skill-2026-11-12.json).
  This is not native host-discovery, broad game or human-play acceptance.
- Project-settings preserves source/rigor explanations, allowed personal
  overrides, reserved-setting warnings and authorized shared writes. Runtime
  reads now expose stored layers and override/reserved annotations. Five isolated
  supplied-Skill scenarios and two follow-up regressions passed file/result
  verification; a native CLI natural-language read selected the installed Skill
  and queried the runtime. No files changed in that read. See
  [the evidence](evidence/project-settings-skill-2026-11-12.json). Native writes,
  desktop execution and the remaining S037 scenarios are still open.
- Smoke-check now has installed runner, coverage/manual and verdict references.
  The command wrapper accepts explicit 15-minute suites/30-minute builds and
  one-run command adjustments with preserved configuration and evidence. Seven
  isolated scenarios plus a platform-report regression distinguish failed
  assertions, empty/zero-test runs, missing manual observations, minimal waivers,
  quick scope and reported platform failures. Fixture human feedback is simulated,
  not actual play acceptance. See [the evidence](evidence/smoke-skill-2026-11-12.json).
  A native CLI natural-language rerun selected the Skill, recorded actual zero
  tests despite exit zero, and reported NOT ASSESSED. All 323 pre-existing files,
  including earlier reports/evidence and installed runtime files, were unchanged.
  Desktop and remaining engine/behavior acceptance are still open.
- A project-scoped QA tester role is installed by development packages.
  Native CLI selected `game-studio-qa-tester`, loaded its full instructions and
  inherited the parent model, effort and sandbox. It rejected a zero-test PASS,
  separated a static score defect from runtime reproduction, wrote nine planned
  test cases and a structured bug report, and returned unresolved acceptance
  decisions. All 322 existing files remained unchanged; only the two authorized
  reports were added. See [QA role evidence](evidence/qa-role-2026-11-12.json).
  Further native scenarios verify read-only output, targeted save regression,
  save edge cases, configured advisory policy and unavailable-lead/S1 escalation.
  The first regression invented a UI approval requirement; a small role correction
  and fresh identical-input rerun removed that extra gate while retaining evidence
  and severity boundaries. The corrected run produced 11 unexecuted cases and a
  pending-severity bug report, preserving all 321 existing files. See
  [workflow evidence](evidence/qa-role-workflows-2026-11-12.json), including the
  initial failure. A native Godot/GdUnit run now generates 12 executable damage
  tests, all passing with zero orphans. Independent formula and cleanup mutations
  trigger assertion failure and orphan detection, then restore to green. The role
  correctly reports a failing overall execution audit for retained native editor,
  user-directory and certificate errors. A separate CLI correction recognizes only
  the exact expected port-zero debugger diagnostics in explicit GdUnit test
  commands; fresh packed maintainer execution passes and a real parse error still
  fails. See [Godot QA evidence](evidence/qa-godot-2026-11-12.json). Clean native
  engine execution, Unity/Unreal scaffolds, enforced write-denial testing, T19
  collaboration, final validation and desktop acceptance remain open.
- Development packages also install `game-studio-qa-lead` with portable
  QL-STORY-READY and QL-TEST-COVERAGE definitions. Native CLI scenarios exercise
  per-story readiness, minimal QA evidence waivers, standard coverage, severity
  triage, release pressure and scoped output. A readiness failure exposed an
  input-versus-deliverable ambiguity; the corrected native rerun returns NOT
  ASSESSED for otherwise measurable criteria lacking GDD context. Minimal QA
  retains UI screenshots and Visual/Feel screenshots plus named lead acceptance,
  without inventing an extra UI sign-off. A second observed failure concerns
  test-harness ownership; the corrected native rerun explicitly assigns QA tester
  implementation while preserving all 327 original files and adding only its
  authorized report. See [five-run evidence](evidence/qa-lead-2026-11-12.json),
  retaining both failures and the targeted corrections. The child received the
  actual role instructions and inherited the parent's model, effort and sandbox;
  the parent only delegated and aggregated. All temporary trust profiles were removed.
  These synthetic assessments do not prove actual game execution or release
  acceptance. A027, desktop, nested collaboration and the final validator remain open.
- Game Designer now has a canonical role and installed professional-methods
  reference. Four native CLI cases cover full/standard/minimal document authoring
  and read-only review. The actual role reads effective policy, preserves approved
  numbers and movement ownership, flags a capacity/reset contradiction for the
  owner, and keeps human criteria/proposed thresholds separate from acceptance.
  Review uses all supplied pillars, identifies hazard-rule gaps and routes formula
  detail and final lore without writing implementation or narrative. Each fixture
  preserves its original regular files and permits only the specified artifact.
  See [designer evidence](evidence/game-designer-2026-11-12.json). Existing-brief
  updates, initial design choices, broader domain/host coverage and final validation
  remain open; written design is not proof of a playable or accepted game.
- Creative Director, Art Director, Technical Director and Producer now have native
  roles and all 23 corresponding gate resources. Seven isolated native CLI cases
  prove actual role selection, requested gate reads, exact verdict vocabularies
  and preserved files: pillar approval, weak visual-direction concerns,
  implementation-feasibility concerns, zero-buffer scope, missing pillars,
  missing capacity and a phase-required architecture blocker. See
  [director evidence](evidence/director-roles-2026-11-12.json). Their full source
  matrices, other gate paths, strategic decisions, writes, image/engine evidence
  and desktop behavior remain open; role files alone do not establish these.
- Lead Programmer now has a canonical role and installed LP code-review/feasibility
  gates. Two native cases distinguish sound code, a formula defect, omitted versus
  nonexistent GDD and estimate-based performance blockers. The actual role cites
  source/requirements, does not transfer clean-test results to the faulty candidate,
  and returns creative cost decisions separately from architecture approval.
  Three actual Node fixture tests and an independent runtime counterexample are
  maintainer evidence, not native agent execution. A preparation-only TAP/spec
  reporter mismatch was fixed before the successful native review. See
  [programmer evidence](evidence/lead-programmer-2026-11-12.json). No benchmark,
  engine API acceptance or full T19 completion is claimed by those isolated cases.
- Gameplay Programmer now has a canonical role that implements approved mechanics
  and tests within the confirmed scope. Native standard and minimal Web fixtures
  produce pure combo modules, externally injected tuning, documented transitions
  and retained red/green logs. The red failures are missing-module imports before
  implementation, not failed gameplay assertions; green runs execute 22 and 23
  passing tests. Both modules pass seven independent contract groups, including
  timing boundaries, resets, variants, instances and query-frequency independence.
  The independent checker rejects three altered-behavior controls. Separately,
  changing `<=` to `<` in isolated source copies causes the role-authored suites
  to fail 10 and 9 cases, proving meaningful boundary coverage. Original modules
  and all prior fixture files remain unchanged. A read-only native case retains
  Accepted ADR governance, appropriate domain hand-offs, unverified API status and
  unresolved coefficients. See [gameplay evidence](evidence/gameplay-programmer-2026-11-12.json).
  Pure logic tests do not establish engine/browser integration, human acceptance,
  an existing-source fix or the full role matrix; A012/T19 remain open.
- A fresh packed project now exercises an actual native sequential chain from
  Game Designer to Gameplay Programmer to independent QA Tester to Lead Programmer.
  The programmer runs 17 tests; QA adds seven independent tests and runs all 24;
  the separate lead reads actual artifacts/logs and returns APPROVE for pure logic.
  Six maintainer behavior groups pass, while an isolated affordability mutation
  fails eight programmer tests and four QA tests. The coordinator only delegates
  and aggregates; child instructions, inherited settings and completion order are
  verified from native traces. All 332 original files survive and 17 authorized
  outputs are added. The evidence preserves the unavailable-close fixture failure,
  cancelled output-path conflict and completed run's overly strict report-path
  assertion; corrected postconditions pass on the same retained native artifacts.
  See [handoff evidence](evidence/role-handoff-2026-11-12.json). T19 remains open for
  parallel/conflict/blocked-role and broader host cases; no actual game, engine,
  browser or human acceptance is inferred.

## Verification performed

Baseline: macOS ARM64, Node.js 24.22.2, Codex CLI 0.162.0,
HeadlessChrome 157.0.0.0. The local default Node 22 and broken Homebrew Node link
were not modified; verification used an isolated Node 24 distribution.

- `npm --prefix toolkit run build` and `typecheck`.
- `npm --prefix toolkit test`: filesystem ownership, rollback/recovery, invalid
  input, YAML safety, symlinks, Unicode/space paths, source preservation, process
  timeout, preview boundaries and replay-log parsing.
- `npm --prefix toolkit run test:pack`: actual packed install in an isolated
  directory, global onboarding setup/removal, project init, exact runtime restore,
  restored launcher, prototype scaffold/check/export, changed global version,
  portable lock after deleting the original archive, and conservative detach.
- `npm --prefix toolkit run test:browser`: two actual Chrome replays with the
  same seed/input produce equal states and identical screenshots; source content
  remains unchanged; an intentional browser error returns failure.
- Official Skill-format validation for onboarding and the three project Skills.
- Missing replay hooks and blocked file-protocol modules now return not assessed,
  even when the driver emits a final `done` row. Real Chrome red/green regression
  and the packed growth journey cover the correction discovered in Skill evaluation.

Source additions after the published alpha: build/typecheck and 131 local tests
pass with no skips. Packed-install tests exercise configuration summaries/writes,
checkpoint save/reopen/detach preservation, engine setup dry-run/apply/no-op and
preference preservation after detach, engine inspection and actual test
execution through the restored project launcher. These additions are not in the existing
`v0.1.0-alpha.0` download; a later archive is required to distribute them.

The published alpha commit `92242edc44f99c9c4b7dc0c24ac7bee12c62e7eb`
passed [native CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43022709665)
on macOS/Windows/Linux Node 24 and Linux Node 26, plus actual Chrome replay on
macOS. This verifies the implemented alpha operations at that commit, not the
remaining migration or the newer local source additions.

The configuration additions and permission fix at
`32d5195be05373cd0690742854503eafa6cb867e` also passed all five native/browser jobs
in [development-branch CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43137793165).
No new installation archive has been published. An earlier CLI role probe did
not establish project configuration loading. A revised trusted positive/negative
pair now proves native custom role selection, independent child instructions and
hidden-marker return in CLI 0.162.0. The child retained the read-only sandbox.
The actual parent/child traces were reviewed; see
[Codex compatibility](codex-compatibility.md). C0 remains open for the remaining
host, permission and hook acceptance.

The owner then explicitly approved two isolated test hooks. A fresh CLI fixture
verified SessionStart context and actual PreToolUse allow/deny behavior through
native `apply_patch` calls, including code-mode invocation. The denied target
remained unchanged and the tool result contained the hook rejection. A separate
untrusted fixture ran neither hook and allowed both patches. Native `/hooks`
review, captured payloads and before/after files are recorded in
[`cli-hook-gate-2026-11-12.json`](evidence/cli-hook-gate-2026-11-12.json).
The probe never grants trust itself. These fixture tests do not implement the
packaged Hook adapter or upstream guard policies.
Further reviewed CLI cases verify startup and complete multi-file patch denial
from both root and subdirectory launches. An allowed two-file patch succeeds;
the mixed two-file patch changes neither target. Native Hook trust lives in the
temporary named profile, so the runner now retains that profile across a requested
case sequence and removes it after the last case. See
[`cli-hook-multifile-2026-11-12.json`](evidence/cli-hook-multifile-2026-11-12.json).
The fixture and evidence commit `dbde457f97e6b7b1f75d9ce6e50cdd500889beed`
passed all jobs in [native CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43147237189).

Engine configuration and its packed-runtime checks at
`bd4bd1a120c85c3eccfe0d52588960fcae6cd1fa` passed all five jobs in
[native CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43149199444):
macOS/Windows/Linux Node 24, Linux Node 26, and real Chrome replay. No new
installation archive has been published.

A real Godot `4.7.2.stable.official.ed1daf0bf` fixture on macOS ARM64 verifies the
packed launcher through engine configuration, scaffold preview/create/preservation,
headless import, successful GDScript smoke execution, an actual test exit 7, and
version mismatch without import. A corrupt PNG produces Godot errors with exit 0;
`engine verify` correctly returns failure. See
[`godot-import-2026-11-12.json`](evidence/godot-import-2026-11-12.json) and the
reproducible `toolkit/test/godot-smoke.mjs`. This is engine execution evidence,
not an export/build, C# test, graphical gameplay run or human play acceptance.
The same real corrupt-asset case exposed a zero-exit false positive in the generic
configured `test` command. Fix `2780583` applies Godot diagnostic interpretation
there too, preserves the actual process exit code, and leaves other engines'
output semantics unchanged. Fresh real-engine red/green fixtures and unit tests
cover the correction; the final fixture repeats the complete packed journey.

The checkpoint, engine inspection, test execution and configuration summary
additions at `bbcb238505c457ac047938f2949e2bf8c9e98e58` passed all five jobs in
[development CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43142741958):
native macOS/Windows/Linux Node 24, Linux Node 26 and actual Chrome replay.
Earlier Windows runs exposed quoted-path and shell-exit-code defects. The fixed
runner uses an isolated UTF-8 batch script and returns its final ERRORLEVEL;
regressions cover Unicode/space paths, literal ampersands, successful commands,
ordinary exit 1/7 failures, missing executables and timeout. These source changes
are not yet part of a new released archive.

The replay initially rejected a comma-separated input example. The source parser
uses whitespace-separated tokens; the documented example and regression now use
`Enter wait:1`. A saved screenshot alone was not treated as a passing replay.

## Open release gates

The full acceptance contract remains in `tasks/todo.md`. In particular:

- Codex desktop live discovery, role selection, hook trust and permission tests.
- CLI subdirectory role discovery, actual sandbox write-boundary tests,
  shell hook cases and the remaining lifecycle/failure fixtures.
- All 75 upstream workflow adaptations, 49 roles, 14 scoped rules, individual
  hook behaviors and remaining helper parity. The retained `.claude` source is
  not shipped as an active compatibility layer.
- Broader validators, remaining configuration helper parity, engine scaffolding and
  live native-engine build/test acceptance, prototype growth/tuning, checkpoint
  automation and version upgrade.
- Native platform evidence for the remaining operations, full natural-language journeys,
  human play acceptance, and stable-release review.

The implementation order was adjusted to exercise deterministic installation and
Web operations while host compatibility remains open. This does not waive C0–C5
or make the final migration complete. The published alpha does not install roles
or hooks. Development packages now install nine roles; their verified CLI scenarios
do not establish desktop support. No production Hooks are installed.

Detach retains game configuration, runtime archives/dependencies/lock and backups.
It restores/removes only unchanged files that its manifest owns. Edited managed
files block detach; no force overwrite or recursive cleanup is provided.
