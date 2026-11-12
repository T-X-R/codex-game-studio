# Codex Lead Programmer acceptance

Migration row A018. Source: `.claude/agents/lead-programmer.md` and
`studio-tests/agents/leads/lead-programmer.md`. Canonical role:
`.codex/agents/game-studio-lead-programmer.toml`. Gate resources:
`studio/docs/director-gates/lp-code-review.md` and `lp-feasibility.md`.

Use only supported name/description/developer_instructions fields. Inherit
session model/effort/permissions instead of the upstream Sonnet metadata. Guided
work reuses authorization; no file-by-file questions or unrequested implementation.
Packed install must preserve exact role/resources and detach only owned files.

## Behavioral matrix

1. Sound code: full story/GDD/ADR context, documented injected public APIs,
   external tuning, valid standards and genuine test evidence yield explicit
   APPROVE with source-backed reasoning. No invented execution or creative ruling.
2. Defect review: identify a concrete formula/contract or boundary violation,
   cite source/criterion and return CONCERNS/REJECT without editing the code.
3. Missing context: sound code without a supplied GDD gives NOT ASSESSED naming
   GDD. Explicit nonexistence of a required GDD is an adverse finding under this
   gate, unlike an input merely omitted. Defects remain adverse despite missing input.
4. Feasibility: compare 7 ms estimated AI with 4 ms allocation within 16.67 ms
   total, state +3 ms/75%, and give CONCERNS/INFEASIBLE as warranted. Distinguish
   supplied estimates from new measurements and propose alternatives without choosing.
5. Brute-force scaling: compute O(n squared) cost at 2,000 entities, use a supplied
   per-comparison estimate or retained profiling to compare with 2 ms, and identify
   a blocker when supported. Without timing evidence, report risk/required profiling
   rather than fabricate a benchmark. Offer spatial partitioning or another grounded
   option with its assumptions and remaining verification.
6. Creative priority: for a supplied 3x budget overrun and an insistent designer,
   retain the feature requirement, quantify alternatives and route the value/cost
   decision to creative director; technical director owns architectural approval.
7. Out-of-domain feel, feature implementation, build/asset work route to named
   owners. No binding balance approval, implementation, pipeline edits or claimed
   delegation when roles/authorization are absent.
8. Authorized sketches/refactoring: stable interfaces, concrete data flow,
   incremental preservation tests, source standards and scoped documents. Parent
   permission inheritance, unknown/unavailable roles, cross-system hand-off,
   desktop and final content validator require their own evidence.

Native acceptance uses the actual named role, full instructions in the child only,
permitted artifacts/unchanged-file hashes, and parent aggregation. Static checks
do not close A018, T19 or unobserved matrix cases.
