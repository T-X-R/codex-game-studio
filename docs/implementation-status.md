# Implementation status — 2026-11-12

This is an initial executable alpha, not completion of the full migration plan.
The owner authorized implementation and chose GitHub owner `T-X-R`, repository
`codex-game-studio`, and GitHub archive distribution without npm publication.

## Implemented and exercised

- Typed CLI argument contracts, JSON results, help/schema and explicit exit codes.
- Nearest project discovery, configuration reads with provenance and rigor/local
  precedence, named system workflow overrides and legacy technical-preference
  import, plus legacy boolean test strictness. Derived gate/engine helper parity
  remains open.
- Configuration writes with local-key restrictions, value validation, comment
  and scalar-quote preservation, no-op detection and synchronized stage mirrors.
  Concurrent changes and destructive YAML shape edits are refused. Transaction
  journals and backups are created with owner-only POSIX permissions.
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

Source additions after the published alpha: build/typecheck and 47 local tests
pass with no skips. The packed-install test also exercises configuration writes
through the restored project launcher. These additions are not in the existing
`v0.1.0-alpha.0` download; a later archive is required to distribute them.

The published alpha commit `92242edc44f99c9c4b7dc0c24ac7bee12c62e7eb`
passed [native CI](https://github.com/T-X-R/codex-game-studio/actions/runs/43022709665)
on macOS/Windows/Linux Node 24 and Linux Node 26, plus actual Chrome replay on
macOS. This verifies the implemented alpha operations at that commit, not the
remaining migration or the newer local source additions.

The replay initially rejected a comma-separated input example. The source parser
uses whitespace-separated tokens; the documented example and regression now use
`Enter wait:1`. A saved screenshot alone was not treated as a passing replay.

## Open release gates

The full acceptance contract remains in `tasks/todo.md`. In particular:

- Codex desktop live discovery, role selection, hook trust and permission tests.
- Complete CLI role selection proof and isolated repeatable hook host fixtures.
- All 75 upstream workflow adaptations, 49 roles, 14 scoped rules, individual
  hook behaviors and remaining helper parity. The retained `.claude` source is
  not shipped as an active compatibility layer.
- Broader validators, remaining configuration helper parity, engine setup/build/test adapters,
  prototype growth/tuning, checkpoint automation and version upgrade.
- Native platform evidence for the remaining operations, full natural-language journeys,
  human play acceptance, and stable-release review.

The implementation order was adjusted to exercise deterministic installation and
Web operations while host compatibility remains open. This does not waive C0–C5
or make the final migration complete. The alpha does not install hooks or claim
that role TOML is honored by either host.

Detach retains game configuration, runtime archives/dependencies/lock and backups.
It restores/removes only unchanged files that its manifest owns. Edited managed
files block detach; no force overwrite or recursive cleanup is provided.
