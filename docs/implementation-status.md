# Implementation status — 2026-11-12

This is an initial executable alpha, not completion of the full migration plan.
The owner authorized implementation and chose GitHub owner `T-X-R`, repository
`codex-game-studio`, and GitHub archive distribution without npm publication.

## Implemented and exercised

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
- Project attachment, exact runtime pins, local launchers, portable development
  archives, explicit npm restore with lifecycle scripts disabled and single-hop
  dispatch from a different global CLI version.
- Owned-file conflict detection, dry runs, install locks, journals, rollback,
  explicit interrupted-install recovery and conservative detach.
- Web fixed-step scaffold, standalone game import, classic-script static checks,
  localhost preview, deterministic browser replay and a new static distribution
  directory with development-only evidence omitted.
- Three project Skills: start, prototype and next-step. These are alpha entry
  points covering implemented operations; they do not close the full upstream
  behavioral migration rows.

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

Source additions after the published alpha: build/typecheck and 106 local tests
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
or make the final migration complete. The alpha does not install roles or hooks;
the verified CLI role fixture does not establish desktop support.

Detach retains game configuration, runtime archives/dependencies/lock and backups.
It restores/removes only unchanged files that its manifest owns. Edited managed
files block detach; no force overwrite or recursive cleanup is provided.
