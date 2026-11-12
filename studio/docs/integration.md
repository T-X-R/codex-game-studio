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

`game-studio-game-designer` authors and reviews mechanics against approved pillars,
rules and the effective documentation tier. It reads the installed
`studio/docs/roles/game-designer.md` resource, keeps unresolved creative decisions
with their owners, and does not implement code or final narrative lore. For
example: "Delegate the approved dodge design to game-studio-game-designer; write
only design/gdd/dodge.md using our workflow tier and return unresolved rule conflicts."

`game-studio-lead-programmer` reviews code, feasibility and module interfaces within
the approved architecture. Its LP-CODE-REVIEW and LP-FEASIBILITY definitions are
under `studio/docs/director-gates/`. Supply implementation, story, GDD and ADR paths
for code review, or architecture, requirements and ADR statuses for feasibility.
It separates static findings, supplied estimates and actual execution; feature
implementation remains with the appropriate specialist. A review verdict does
not merge code or approve a release.

`game-studio-gameplay-programmer` implements approved mechanics and their logic
tests using project interfaces and external tuning. Supply the story/brief or GDD,
accepted ADR where applicable, allowed source/test/evidence paths and authorized
test commands. It keeps gameplay separate from UI/AI/networking and returns missing
rules or engine capabilities instead of guessing them. For example: "Delegate the
approved combo contract to game-studio-gameplay-programmer; implement only these
module/test paths, run the existing suite and retain its actual results."

These are the five currently packaged roles. A reference to another professional
owner is a hand-off recommendation, not proof that the owner is installed or was
consulted. Request only roles the current host actually exposes.

For an authorized sequential feature task, the coordinator can hand the approved
rules to the designer, the resulting brief to the gameplay programmer, and the
actual implementation and evidence to a separate QA tester and lead programmer.
Give each assignment its inputs, allowed write paths, expected output and checks.
Wait for each prerequisite to finish before dispatching dependent work; pass the
actual artifact paths, results and unresolved decisions, not a predicted summary.
Keep independent review in a separate child from the implementation author.
Use a native close operation if exposed and needed for the host's concurrency
limit; do not invent that operation. Report an actual refused spawn as a host
limit rather than silently replacing the requested role.

If a role is unavailable or a required design decision is unresolved, name the
blocked dependency and return the decision to its owner. Continue only work that
does not depend on it. A coordinator may not silently replace independent custom
roles with its own implementation and claim equivalent verification. Assign
disjoint write paths; independent reviewers preserve the artifacts they review.
Shared checkpoints remain coordinator-owned and use the toolkit's expected-hash
save contract. Conflicts require reading the current record and reconciling it,
not overwriting another writer's progress. This guidance does not establish host
enforcement or prove parallel/checkpoint behavior; consult recorded compatibility
evidence for the specific client and scenario.

The installer does not edit `.codex/config.toml`, enable agents globally or trust
Hooks. Follow the client's native project trust/discovery controls. If the role
is unavailable, report that limitation rather than claiming a generic-agent or
single-agent result proves custom-role execution. See the host compatibility
evidence before assuming support in a particular client.
