# Codex verification work

Read the repository root AGENTS.md, `tasks/plan.md`, the relevant task and
`studio-tests/catalog.yaml` before changing an acceptance contract. This subtree
contains retained upstream specs and new Codex specs; distinguish them explicitly.
`CLAUDE.md` is historical input, not the Codex execution policy.

Use the catalog's paths and categories. Preserve all original source identities
and domain outcomes. New specs use `templates/skill-test-spec.md` or
`templates/agent-test-spec.md` and `quality-rubric.md`. Current canonical Skills
are in `.agents/skills`, roles in `.codex/agents`, and shared resources in `studio`.
Do not migrate Claude model aliases, tool names or per-file approval checks as
if they were native Codex requirements.

Default Codex behavior fixtures explicitly record `modes.rigor: minimal` and
`modes.automation: guided`, with no local overrides unless the scenario specifies
otherwise. A source spec's explicit settings remain part of that source case;
map any policy change in its Codex spec rather than silently changing its meaning.
Test other rigor/review/automation modes wherever the workflow depends on them.

Keep static/instruction review, live native behavior and human acceptance separate.
Use disposable installed-package workspaces and record allowed writes, starting
hashes, actual commands/results and final file observations. No test may trust
Hooks or broaden host permissions without the appropriate existing authorization.
A missing role or engine is an observed limitation, never a passing fallback.
Independent review requires an actual separate reviewer; the coordinator owns
shared checkpoints. Delegation must be authorized by the current test/task.

Keep failed attempts and evidence limitations visible. Do not rewrite historical
results into passes, promote rows because files exist, or reduce scope to make
`--complete` pass. Updating documentation alone requires a semantic consistency
review, not a fabricated live run. Follow README for actual maintainer commands.
