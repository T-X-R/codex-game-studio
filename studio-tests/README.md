# Codex Game Studio verification

This directory preserves the original Claude Code Game Studios domain contracts
and tracks their migration to Codex. It tests the toolkit's Skills and roles;
it is separate from tests of a user's game. The complete migration scope remains
75 primary Skills, three retired aliases and 49 roles, plus the rule, Hook and
helper queues in [the implementation plan](../tasks/todo.md).

Start with [catalog.yaml](catalog.yaml). `spec` identifies the retained source
contract, `target` identifies the intended canonical Codex entrypoint, and
`migration_state` is `pending`, `partial` or `verified`. A target name is not
proof that it is installed. Source specs and historical result fields are not
Codex acceptance evidence. Current support and limitations are recorded in
[implementation status](../docs/implementation-status.md).

## Static checks

From the repository root, after installing maintainer dependencies:

```sh
npm --prefix toolkit run build
npm --prefix toolkit run typecheck
npm --prefix toolkit run lint:content
npm --prefix toolkit run test
npm --prefix toolkit run test:pack
```

`lint:content` checks canonical metadata, references, explicit command examples
and the source catalog. `-- --complete` additionally checks complete declarations
and evidence-file presence; it currently fails because migration is unfinished.
Neither mode judges the truth of behavioral evidence. See the exact checks and
limits in [content validation](../docs/content-validation.md).

The retained `.claude` linter and `/skill-test` examples in upstream specs are
migration inputs, not the current Codex maintainer interface. Do not run those
old checks and interpret a result as Codex compliance. No replacement
`game-studio-skill-test` workflow is advertised until its own row is implemented
and verified. `CLAUDE.md` here is retained historical guidance; Codex maintainers
use [AGENTS.md](AGENTS.md) and the current rubric.

## Behavioral acceptance

Use [the Codex rubric](quality-rubric.md) alongside the original domain spec.
Draft a Codex spec using the [Skill template](templates/skill-test-spec.md) or
[role template](templates/agent-test-spec.md). Preserve domain outcomes; explicitly
map changed host mechanics, automation policy and unsupported capabilities.
Do not silently waive an upstream requirement because a current implementation
cannot satisfy it.

Run fresh, disposable installed-package fixtures. Record exact host/OS/Node and
engine versions where relevant, installed content hashes, input state, actual
native transcripts, process results, file changes and expected-vs-observed
assertions. Keep instruction review separate from live behavior. Test the CLI
and desktop independently; delegated fixtures or CLI success alone do not prove
native Skill discovery or desktop compatibility. Human play and approval need
actual human observations.

Only mark a case PASS when its complete assertions are observed. Missing inputs,
capabilities or unrun checks are NOT ASSESSED; contradictions are FAIL; mixed or
incomplete coverage is PARTIAL. Preserve failed attempts with their explanation
and the exact subsequent recheck, rather than replacing them with later success.

## Recording migration progress

- Keep `spec`, source identity, category and original scope intact.
- Move `pending` to `partial` when the canonical target is added. Include required
  references in the package and update content/packed-install coverage.
- Add `codex_spec` pointing to the adapted behavior specification. Record sanitized
  results under `docs/evidence/`; transcripts may be summarized with trace IDs,
  hashes and concrete assertions, without secrets or private source payloads.
- Set `verified` only after reviewing all applicable source, rubric, host and
  workflow assertions. Supply the evidence path list required by the catalog.
  Static green status and evidence-file existence are insufficient.
- Update the corresponding S/A task and any parent gate only when its complete
  acceptance scope is proved. Alias rows require the approved replacement and
  absence of a duplicate active entrypoint. Rules/Hooks/helpers retain their
  separate full inventory and acceptance queues.

No live result or aggregate count in this directory implies permission to
publish, trust Hooks, weaken a sandbox or change another project's files.
