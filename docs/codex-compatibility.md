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
