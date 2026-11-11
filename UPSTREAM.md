# Upstream attribution

Codex Game Studio is derived from [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
by Donchitos, using version 1.3.0 at commit `abc0de7` as the migration baseline.
The original Git history and MIT copyright notice in [LICENSE](LICENSE) are retained.

The Codex toolkit, TypeScript command layer, installation transactions and Codex
Skill adaptations are maintained in this repository by T-X-R. This is an
independent community project, not an official OpenAI product.

The Web starter in `studio/templates/web-prototype/` and deterministic browser
driver in `studio/scripts/one-shot-driver.js` originate from the corresponding
upstream resources. The driver is currently preserved unchanged. Its Node-based
execution wrapper replaces the original platform-specific shell invocation.

The `.claude/` tree, `CLAUDE.md` files and older workflow documentation remain
migration inputs in this alpha. They are excluded from the npm-format archive
and are not active Codex integration. Their presence does not mean every upstream
workflow has been migrated; see [implementation status](docs/implementation-status.md).
