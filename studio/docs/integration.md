# Codex Game Studio integration

The toolkit supplies local commands and focused Skills. Codex owns reasoning,
code changes and delegation; no second model client or API credential is needed.

Run project operations through `node .game-studio/run.cjs`. The launcher checks
the exact version pinned in `.game-studio/package.json` and never downloads code.
Use `game-studio restore --project .` when a committed runtime lock is present.

The default collaboration mode is `guided`: settle the goal and important
decisions, then implement and verify within the agreed scope. Ask again when
the requested scope changes or a consequential decision is still unresolved.
File writes already covered by the task do not require repeated approval.

Keep game artifacts in the game workspace. Treat bundled resources as read-only.
Record observed test results and outstanding limitations separately from design
judgments. A configured role or hook is not evidence that the host ran it.
