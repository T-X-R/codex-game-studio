# Canonical content validation

After `npm --prefix toolkit run build`, run
`npm --prefix toolkit run lint:content`. To inspect an extracted canonical
resource tree, append `-- --root <directory>`. Inspection is read-only; exit 0
means the implemented static checks found no errors, 1 means content errors,
and 2 means invalid invocation or an inspection failure. JSON includes each
affected path and issue, observed counts and `behaviorVerified: false`.

This replaces the test-local metadata assertions with a reusable validator for
the current Codex content. It is not the final T20 catalog/release gate yet:
inventory reconciliation, aliases, command-example validation and complete
behavioral-catalog migration remain pending. The original catalog and linter
remain historical migration inputs until that replacement is finished.

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
