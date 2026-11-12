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

The development package installs `game-studio-qa-tester` and
`game-studio-qa-lead` as project-scoped custom agents in `.codex/agents/`.
In a trusted project session, explicitly ask
Codex to delegate a bounded QA task to that role, naming the input paths, allowed
writes and expected artifact. For example: "Delegate a read-only audit of the
score story and its test evidence to game-studio-qa-tester; summarize defects,
unverified claims and the next verification step."

Both roles inherit the session model and permissions. The tester produces test
cases, test scaffolds, bug reports and targeted regression checklists. The lead
plans QA, assesses readiness/coverage, rules on severity and evaluates quality
gates; it routes implementation to the appropriate programmer or tester. For
example: "Delegate QL-STORY-READY for these three story paths to
game-studio-qa-lead; read the installed gate definition, return one verdict per
story and identify unresolved requirements without editing files."

The lead resolves `studio/docs/director-gates/ql-story-ready.md` and
`studio/docs/director-gates/ql-test-coverage.md` through `resource path` in the
pinned runtime. Gate assessments do not execute tests or change story status.
Neither role may invent missing execution, human observations or sign-off, or
publish a release. Any nested delegation must stay within the caller's explicit
authorization and the host's actual available roles.
The installer does not edit `.codex/config.toml`, enable agents globally or trust
Hooks. Follow the client's native project trust/discovery controls. If the role
is unavailable, report that limitation rather than claiming a generic-agent or
single-agent result proves custom-role execution. See the host compatibility
evidence before assuming support in a particular client.
