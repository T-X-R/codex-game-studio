# Canonical content validation

After `npm --prefix toolkit run build`, run
`npm --prefix toolkit run lint:content`. To inspect an extracted canonical
resource tree, append `-- --root <directory> --bundle-only`. Inspection is read-only; exit 0
means the implemented static checks found no errors, 1 means content errors,
and 2 means invalid invocation or an inspection failure. JSON includes each
affected path and issue, observed counts and `behaviorVerified: false`.

This replaces the test-local metadata assertions with a reusable validator for
the current Codex content. Default inspection also checks catalog version 3
against all 78 retained Skill inputs (75 primary workflows and three aliases)
and 49 retained role inputs. Every primary row has its intended Codex target and
`migration_state`: `pending`, `partial` or `verified`. Existing partial targets
cannot disappear unnoticed; new canonical entries cannot bypass the catalog.
The original names, domain specs and historical result fields are preserved;
blank historical fields do not count as passing evidence. Aliases retain the
approved replacement and must not create duplicate active Skill entrypoints.

`--complete` additionally requires every row and alias to declare `verified`,
with readable `codex_spec` and evidence files under `docs/evidence/`. It currently
fails because the migration remains incomplete. `declaredComplete` describes
those declarations and file presence only, never the truth of behavioral claims.
Evidence still needs semantic review against the complete approved requirements.
`--bundle-only` explicitly leaves catalog inspection NOT ASSESSED and cannot be
combined with `--complete`; source inputs/catalog are not distributed at runtime.

This is not the final T20 gate yet: command-example validation, the Codex behavior
rubric and retirement of legacy lint consumers remain pending. The old linter and
upstream behavioral specs remain migration inputs until their replacement is
finished. Shared rules/helpers and host behavior are separately gated by the plan.

Checks include required nonempty Skill/onboarding/role trees, readable entrypoints,
YAML/TOML parsing, duplicate keys/names, nonempty instructions, local reference
existence and containment, and symlink rejection. Inline Markdown links (including
angle-bracket paths) and reference definitions are checked recursively; remote
links are not fetched and heading anchors are not validated. Generated/dynamic
references and escaped Markdown delimiters are not interpreted as a full Markdown
renderer would and still need review.
Literal `resource path studio/...` references resolve in the same bundle. Missing
resources name the referring file. Nested Skill guidance is inspected even when
it is not linked from the entrypoint. No command or referenced script is executed.

The canonical migration profile currently permits Skill `name`, `description`
and optional `metadata`; roles contain `name`, `description` and
`developer_instructions`. Names match their file/folder and use the `game-studio`
namespace. These are project conventions, not claims that Codex only supports
these fields. In particular, the toolkit's canonical roles intentionally inherit
model and permissions instead of carrying model pins or ineffective sandbox
settings. Changes to this profile need matching validation and host evidence.

The official [Skill format](https://learn.chatgpt.com/docs/build-skills) requires
name and description; the official
[custom-agent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
defines TOML roles and inherited permissions. TOML is parsed by pinned
`smol-toml` 1.9.1 (BSD-3-Clause, no transitive dependencies). Parser acceptance
does not prove that a specific Codex host supports every TOML syntax or feature.

Active Skill guidance and role instructions must not refer to `.claude/`,
`CLAUDE_SKILL_DIR`, `$ARGUMENTS` or `AskUserQuestion`. Upstream attribution remains
allowed. Shared migration documentation can describe historical input paths,
such as importing old technical preferences; it is not subjected to that blanket
runtime-token prohibition. Shared-document semantics still require review.

No static result establishes Skill discovery, correct triggering, role selection,
permission enforcement, gameplay behavior, human acceptance or migration completion.
Each workflow still needs the live evidence specified in `tasks/todo.md`.
