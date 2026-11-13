# Codex director acceptance

Source contracts are `studio-tests/agents/directors/creative-director.md`,
`art-director.md`, `technical-director.md` and `producer.md`, together with their
retained role definitions and all 23 associated director gate definitions.
Targets are the four corresponding `game-studio-*` native TOML roles. Their
catalog rows remain partial until all source cases, extensions and host checks
are supported by observed evidence.

## Native adaptation

- Inherit the host model, tool permissions and sandbox. Claude tool lists, model
  aliases, memory and injected Skill fields are not copied as Codex capabilities.
- Reuse authorized guided writes and settled decisions. Preserve collaborative
  review and user authority over strategic/creative choices; no per-file approval
  loop, invented choice or per-section shared checkpoint write.
- Select the actual named role independently. Passing a professional title to a
  generic child or reviewing as coordinator does not prove native role loading.
- Resolve and read the requested gate resource only; retain its context, domain
  criteria and exact verdict vocabulary. The first review line is GATE-ID: VERDICT.
- Distinguish missing review input (NOT ASSESSED) from a known missing required
  phase artifact (a readiness finding) and an artifact not required yet (no finding).
- Read-only reviews must preserve all files. Document writes stay within the
  approved scope; a verdict does not accept an ADR, advance stages or publish.
- Handoffs require actual role availability and authorization; names alone are
  not proof of consultation. Synthetic fixtures are not human or market evidence.

## Preserved source cases and extensions

| Role | Source behavior that must be exercised |
| --- | --- |
| Creative director | CD-PILLARS with three falsifiable, tension-producing pillars; PostgreSQL-schema redirection; CD-GDD-ALIGN on a localized decay/fantasy conflict without authoring formulas; technical-cost dispute returned as joint options to the user; exact supplied pillar vocabulary; missing pillars NOT ASSESSED |
| Art director | AD-ART-BIBLE with consistent palette/shape/platform/anchor; audio-layer redirection; AD-CONCEPT-VISUAL concerns for vague pillars without rewriting them; muted-bible versus accessible HUD conflict escalated to creative director; exact palette violations in AD-VISUAL; missing platform/budgets NOT ASSESSED |
| Technical director | TD-ARCHITECTURE with TR/ADR coverage and clean layers; dialogue redirected to narrative director; quadratic line-of-sight feasibility mitigations without cutting the concept; design-priority escalation; TD-ADR no-compute-platform conflict; absent TR baseline NOT ASSESSED; phase-appropriate readiness and required-absent variant |
| Producer | Sprint feasibility, production scope only; out-of-domain redirection; PR-SCOPE with no remaining buffer uses OPTIMISTIC; design-cost conflict goes to creative director with quantified schedule effects; supplied velocity/dependency calculation; missing capacity NOT ASSESSED; minimal Build order replaces sprint plan without invented velocity |

Also cover CD-SYSTEMS, CD-NARRATIVE, CD-PLAYTEST and CD-PHASE-GATE; AD-PHASE-GATE
and asset-standard/image inspection; TD-SYSTEM-BOUNDARY, TD-ENGINE-RISK,
TD-MANIFEST and TD-CHANGE-IMPACT; PR-EPIC, PR-MILESTONE and later-tier phase gates.
Test positive, adverse and missing-input paths without collapsing vocabularies.
ADR acceptance needs explicit owner confirmation; technical approval alone is
insufficient. Producer plans retain 20% buffer, single ownership, dependencies,
critical path, acceptance criteria and honest estimates rather than made-up velocity.

## Verification

Build/typecheck/content checks and packed byte identity are structural evidence.
Live fixtures use `node toolkit/test/qa-role-host.mjs <case>` with the existing
Codex login and a disposable installed package. Director cases are defined in
`toolkit/test/fixtures/director-cases.mjs`. The wrapper's exit 3 means native
execution completed but semantic inspection of the child trace/output is pending.
Record the real selected role, parent/child IDs, resource reads, initial/final
hashes and review reasoning. Native CLI results do not prove desktop, interactive
owner decisions, writes, multi-role conflict resolution or Brainstorm phase order.
