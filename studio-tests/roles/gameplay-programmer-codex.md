# Codex Gameplay Programmer acceptance

Migration row A012. Source: `.claude/agents/gameplay-programmer.md` and
`studio-tests/agents/specialists/gameplay-programmer.md`. Canonical role:
`.codex/agents/game-studio-gameplay-programmer.toml`.

Only name, description and developer_instructions are configured; model, effort
and execution permissions inherit from Codex. Guided implementation reuses
confirmed scope and decisions. Preserve approved formulas, ADR governance,
domain ownership and honest execution evidence; retire per-file approval loops.

## Behavioral matrix

1. Implement approved combo mechanics in the project's language: explicit state
   transitions, documented public API/design reference, injected external tuning,
   events rather than UI/AI dependencies, and deterministic logic separated from
   presentation. Unit tests drive normal, timeout, cooldown, reset and boundary
   behavior. Independently check generated implementation against the contract.
2. Respect supplied formula coefficients and GDD edges, with data-driven variants;
   do not hardcode approved defaults into the logic. A real test failure must be
   fixed within authorized scope without changing expected behavior or policy.
3. Missing design rules: return the specific decision to the designer/caller;
   continue unambiguous work without inventing coefficients, buffer behavior or
   falsely claiming completion. Missing engine/runner is NOT ASSESSED, not PASS.
4. UI menu and AI reactions: route implementation to the correct specialist,
   limiting any offered work to approved gameplay-side events. No menu or AI code.
5. Threading/performance: route threading to engine programmer, inform lead
   programmer, identify the relevant hot path and distinguish profiling needs
   from guesses. No unilateral threading/async redesign.
6. Accepted fixed-point ADR: do not replace it with floating-point accumulation
   based only on a feature request/lead preference. Explain the conflict and
   superseding-ADR acceptance path; preserve the original artifact.
7. Version safety: read pinned engine/subsystem references before using APIs;
   identify uncovered/version-sensitive capabilities as unverified without
   claiming engine build success from generated code.
8. Minimal workflow uses the story/brief without an invented ADR prerequisite.
   Existing-source fixes, real engine integration, independent cross-role review,
   desktop/subdirectory discovery and the final validator need separate evidence.

Native role identity, child-only full instructions, model/sandbox inheritance,
permitted writes and parent aggregation are required. Keep A012/T19 open until
the remaining applicable matrix and host/engine gates are verified.
