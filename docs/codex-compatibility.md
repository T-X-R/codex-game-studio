# Codex compatibility evidence

Status: CLI custom role selection verified with a negative control; full host compatibility gate is open.

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
selected and loaded the configured TOML role. Those experiments alone did not
verify role selection; the fresh trusted test below does.

No live desktop compatibility result is recorded. Installing files, a successful
TOML parse, a reported feature flag or a generic subagent response is insufficient
to close this gate. Future host tests must use fresh isolated directories, hidden
role-only markers, non-overlapping runs, explicit client versions and before/after
hashes for both permitted and denied writes. A subdirectory launch and desktop
PATH differences also remain to be tested.

The alpha therefore installs project Skills and a local launcher, and exposes
these limitations through `doctor`. It does not install unverified automatic hooks
or substitute prose for an enforced permission boundary.

## Earlier CLI role probe — 2026-11-12

A new persisted CLI 0.162.0 session attempted to trust an isolated temporary workspace,
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
can be advertised as active. A later configuration read found that command-line
`projects.<path>.trust_level` overrides did not enable project configuration.
This earlier probe did not establish configuration loading and is superseded
by the trusted positive/negative pair below.

Sanitized observations are in
[`evidence/cli-role-probe-2026-11-12.json`](evidence/cli-role-probe-2026-11-12.json).

## Verified CLI role selection — 2026-11-12

The revised probe initializes a fresh Git workspace and creates a unique named
user profile containing trust only for that fixture. It deletes the profile in
`finally`, without editing the base user configuration. Before any model call,
`codex debug prompt-input` must contain a separate project-configuration marker
and must not contain the hidden role marker. `--strict-config` is applied to
`exec`; this client does not support it for `debug`.

The positive session called `collaboration.spawn_agent` with
`agent_type: game-studio-probe` and `fork_turns: none`. Its independent child's
session metadata recorded the matching role and parent thread. The child's
developer context contained the hidden role instructions; its final answer
matched the random marker exactly, with no tool calls. The parent waited and
returned that response. The role file was unchanged. The child retained the
parent's read-only sandbox; actual denied writes remain a separate test.

The negative control used another fresh trusted fixture with the same project
configuration but no role file. Configuration preflight passed. The parent
searched tool catalog metadata, made no file/shell/web calls, spawned no child,
returned no hidden marker and reported that no role selector was available.
Both temporary profiles were removed.

The manually reviewed record is
[`evidence/cli-role-selection-2026-11-12.json`](evidence/cli-role-selection-2026-11-12.json).
This verifies the [documented standalone role contract](https://learn.chatgpt.com/docs/agent-configuration/subagents)
for this CLI invocation. It does not close desktop, subdirectory, hook, write
boundary or all-role behavioral acceptance.

To repeat the positive and negative cases in separate fresh workspaces:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-role-probe.mjs
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-role-probe.mjs --without-role
```

This is an explicit live test using the existing Codex login, not part of the
offline test suite. It retains a temporary evidence directory, has a three-minute
process timeout, and does not edit the base user configuration. Exit code 3 means
not assessed, including when a marker needs trace review. A successful CLI exit
alone never counts as role compatibility. The script deliberately leaves its
result unassessed until the persisted parent/child traces are reviewed; the
reviewed record above supplies that evidence for this pair. T01 remains open.
