# Codex compatibility evidence

Status: exploratory CLI evidence; full host compatibility gate is open.

Local candidate: Codex CLI 0.162.0 on macOS ARM64. The installed feature listing
reported hooks and multi-agent support enabled. This is not a claimed minimum
version or a proof of desktop equivalence.

Disposable CLI experiments observed an explicitly invoked project Skill marker,
a SessionStart context marker and a PreToolUse denial for an `apply_patch` command.
The input shape used `tool_input.command`. The first attempt omitted the complete
project/trust setup, and overlapping attempts reused a fixture. Those filesystem
observations are not accepted as clean positive/negative release fixtures.

An ephemeral role experiment failed with `no rollout found for thread id`.
A subsequent persisted experiment returned a requested reviewer marker, but the
prompt also contained that marker. It does not independently establish that Codex
selected and loaded the configured TOML role. Role selection remains unverified.

No live desktop compatibility result is recorded. Installing files, a successful
TOML parse, a reported feature flag or a generic subagent response is insufficient
to close this gate. Future host tests must use fresh isolated directories, hidden
role-only markers, non-overlapping runs, explicit client versions and before/after
hashes for both permitted and denied writes. A subdirectory launch and desktop
PATH differences also remain to be tested.

The alpha therefore installs project Skills and a local launcher, and exposes
these limitations through `doctor`. It does not install unverified automatic hooks
or substitute prose for an enforced permission boundary.

## Fresh CLI role probe — 2026-11-12

A new persisted CLI 0.162.0 session used an isolated trusted temporary workspace,
a project-scoped `game-studio-probe.toml`, and a random marker present only in that
role's instructions. The parent prompt prohibited reading files or simulating
the role. The run used a read-only sandbox, inherited the existing login, ignored
user configuration and disabled unrelated plugins/apps/memory/Skill instructions.
The selected model matched the local configured model, `gpt-6.1-sol`.

The process completed with exit code 0 after transport retries, but the response
was `ROLE_SELECTION_UNAVAILABLE`: it reported that the native spawn interface had
no custom-agent selector. No child was spawned and the hidden marker was absent.
The persisted parent developer context contained neither the custom role name
nor the hidden marker. This is a negative observation for that invocation, not
proof that every Codex configuration lacks custom agents. The documented standalone
TOML contract still needs a verified client/configuration path before role installs
can be advertised as active.

Sanitized observations are in
[`evidence/cli-role-probe-2026-11-12.json`](evidence/cli-role-probe-2026-11-12.json).
To repeat in a fresh workspace after investigating the host interface:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-role-probe.mjs
```

This is an explicit live test using the existing Codex login, not part of the
offline test suite. It retains a temporary evidence directory, has a three-minute
process timeout, and does not modify global configuration. Exit code 3 means
not assessed, including when a marker needs trace review. A successful CLI exit
alone never counts as role compatibility. The fresh probe also needs a negative
control and actual child/selection evidence before it can close T01.
