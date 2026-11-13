# Codex QA Lead acceptance

Migration row A027. Source behavior remains in
`studio-tests/agents/leads/qa-lead.md` and `.claude/agents/qa-lead.md`.
Canonical role: `.codex/agents/game-studio-qa-lead.toml`.

The role inherits model, effort and sandbox; it contains only name, description
and developer_instructions. Guided scoped writes reuse authorization. It does
not grant tools, configure Hooks, write game code or publish releases. The two
QL gate resources must resolve from an installed archive. Packed installation
and detach preserve unrelated configuration and remove only unchanged owned roles.

## Behavioral matrix

1. Readiness: a fully supplied Logic hazard story has three measurable criteria
   (damage amount, event payload, 0.5 simulated seconds immunity). Expect ADEQUATE
   and an automated approach for each, without claiming tests executed.
2. Wholly subjective readiness: "Combat should feel good" is INADEQUATE even
   when GDD context is missing. Any measurable rewrite remains a proposal.
3. Missing input: measurable stamina criteria without the GDD requirement receive
   NOT ASSESSED naming TR-ID/text. No invented requirement.
4. Coverage: at standard QA, manual-only Logic evidence is insufficient. A claimed
   PASS with zero executed tests does not establish passing coverage. Explicitly
   absent tests are adverse findings, not a missing-input escape.
5. Minimal QA: missing Logic/Integration tests are waived; UI screenshots and
   Visual/Feel screenshots plus lead sign-off remain required. UI does not gain
   an unrequested lead approval. Per-type strict overrides remain visible.
6. Determinism dispute: reject a wall-clock-only flaky assertion, request a
   deterministic automated alternative and return an unresolved standards dispute
   to the technical director via caller. Do not waive required Logic evidence.
7. Triage/release pressure: classify supported data loss as S1, distinguish a
   reported allegation from reproduction, require verification of fixes and
   refuse readiness with failed gates. Do not invent frequency/priority or ship.
8. Out-of-domain implementation: provide test strategy and a bounded hand-off to
   game-studio-qa-tester, coordinating testability with lead programmer. No harness
   code or unauthorized nested delegation.
9. Plans: map criteria/edge cases to functional, regression, performance and
   compatibility testing appropriate to scope; identify owners/prerequisites.
   Simulated playtest inputs never prove human acceptance.
10. Native host: real custom-role selection, parent/child instruction separation,
    model/permission inheritance, permitted outputs only, all existing bytes
    preserved. Test both response-only and authorized report tasks. Desktop,
    subdirectory and missing-role behavior need their own evidence.

Static checks do not close behavioral rows. Inspect exact native transcripts,
artifact contents and filesystem snapshots; record negative runs and fixes.
Keep A027 and T19 open until the full relevant matrix and final validator pass.

## Native maintainer fixtures

After building with Node 24–26, run `node toolkit/test/qa-role-host.mjs
lead-readiness`, `lead-coverage` or `lead-minimal` with Codex CLI on PATH. The
runner packs and restores a fresh project, checks project configuration loading,
and requests the real custom role. It temporarily creates a unique project-trust
profile and removes it in finally; no Hook is configured or trusted. The first
case is read-only; the other cases allow exactly one named QA Markdown artifact.

Each completed fixture records original-file hashes, permitted additions and
native output. Exit 3 with native process exit 0 intentionally means semantic
review is still required, not that acceptance passed. Review the native child
instructions and output against the matrix above. These synthetic fixture
reports cannot support a real game's release or human play acceptance.
