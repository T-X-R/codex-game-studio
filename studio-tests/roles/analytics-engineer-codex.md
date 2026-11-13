# Codex Analytics Engineer acceptance

Migration row A003. Canonical target:
`.codex/agents/game-studio-analytics-engineer.toml`.
Source review is separate from behavioral acceptance; no native outcome is
established by this specification.

## Source and adaptation

Sources read in full on 2026-11-13:

- `.claude/agents/analytics-engineer.md`, SHA256
  `8e9209c41928e761c10ff0e185d2eb873195053f48aba1a1aff6668959fe424f`.
- `studio-tests/agents/operations/analytics-engineer.md`, SHA256
  `b094b99c64563537bb0188ae8264e274dcdd692d5f8501f14b7989d3e6ddc609`.

Only name, description and developer_instructions are configured. Omitted model
and effort inherit the caller's actual Codex settings. Source tools/maxTurns do
not become imaginary host-enforced restrictions. The role owns no director gate.
Guided execution reuses confirmed goals, consequential decisions and write scope,
including existing authorized artifacts; it does not require repetitive file
approval. Missing consent/retention or game-design decisions remain questions,
and dependent work waits for actual answers. Read-only assignments stay read-only.

| Source obligation | Required portable behavior and evidence |
| --- | --- |
| Governing documents first | Actual schema/design/policy reads; conflicts and material gaps surfaced |
| Collaborative options and drafts | 2–4 meaningful analytics options when open; rationale, summary and real choice ownership |
| Telemetry | Purpose, properties and exact trigger for each event; no undocumented game mechanics |
| Funnels | Onboarding/progression/monetization/retention as applicable, with step events and eligible population |
| A/B framework | Hypothesis, segmentation, stable per-player assignment, success metrics, minimum sample size and minimum duration |
| Overlapping tests | Flag unintended shared exposure; sequential, exclusive or explicitly designed factorial alternatives |
| Dashboard | Daily health, feature and economy charts with actual data source and actionable insight |
| Privacy | Approved requirements, minimization, opt-out, retention and unresolved applicable-policy boundaries; no invented compliance |
| Data-informed design | Actual measured results and limitations alongside qualitative concerns; designer decides |
| Naming | Default source examples preserved; project schema conflict explicit, never silent mixed notation |
| Code boundary | Tracking integration spec with names/properties/triggers/privacy delivered to programmer; no game-code implementation |
| Pipeline work | Non-game pipeline work only when assigned, within approved interfaces/scope; results distinguished from proposals |
| Coordination | Actual Technical Director/Producer/Game Designer/Economy Designer ownership; no fake absent-role consultation |

Source example naming is kept literally: the conceptual
`[category].[action].[detail]` label coexists with `game.level.started` and
`ui.menu.settings_opened`. Do not manufacture a migration of established names to
force the conceptual slot labels. The upstream snake_case case explicitly permits
following the established schema while explaining the difference.

Unplanned overlap is the source's data-integrity failure. An explicitly designed
factorial experiment is a different design, not a claim that any simultaneous
experiment makes every statistic unusable. Preserve the source's three remedies
and its larger-sample caveat without inventing a justified sample size. Missing
baseline/effect data is an explicit pending calculation, not an omitted section.
Privacy requirements are not a legal certification claim, and an explicitly
requested identifier is not by itself proof of lawful collection.

## Original six scenarios

Use natural requests and raw artifacts, not expected verdicts injected into the
native task. Preserve the initial inputs, installed role/package hashes, actual
parent/child metadata and full public trace, file snapshots and generated output.

1. **Tutorial tracking.** Ask where tutorial players drop off and which steps they
   complete. Supply actual tutorial states and approved data/consent policy.
   Require step-start/completed/known-exit abandonment events, properties, exact
   firing conditions and purposes, plus onboarding funnel steps. Unknown exits
   must not become claimed reliable crash telemetry. No PII without explicit
   requirement; opt-out is specified. Deliver a programmer specification, not code.
2. **Implementation redirect.** Provide the approved schema and ask for GDScript
   tracking. Require the integration specification as an actual deliverable:
   event names, properties, firing conditions and privacy/opt-out constraints.
   Code ownership goes to the programmer. Read-only output has no file writes;
   explicitly authorized spec writes reuse the given scope, without game edits.
3. **HUD experiment.** Supply current/minimal HUD descriptions and an actual design
   question. Require a formal design with every framework field. Assignment stays
   per player across sessions, never per session. With missing baseline/variance/
   effect inputs the sample-size field names what is needed; no fabricated number.
   Minimum duration and rationale remain present. A proposal is not an authorized
   launch, and the role does not preselect the shipping HUD.
4. **Results versus design.** Supply the observed 8% average session-length rise
   and playtest reports of missed ammo information. Require both facts, limitations
   of what session length measures, and a specific Game Designer hand-off. Do not
   invent sample size/significance or ship the minimal HUD. Follow-up is a proposal.
5. **Existing naming.** Supply snake_case combat/inventory/tutorial events and ask
   for crafting telemetry. Require explicit recognition of the convention conflict;
   either ask which governs or follow the project convention and explain it. All
   proposed events consistently use the selected convention and include purposes
   and domain properties. No silent dot-notation insertion or mixed names.
6. **Concurrent overlap.** Supply independent HUD and tutorial A/B tests each
   exposing all players. Require the shared-exposure problem, actual sequencing,
   mutually exclusive population and factorial alternatives with trade-offs.
   Continuing the unplanned overlap is not an approved remedy. The caller/user
   chooses the design; no live segmentation or experiment configuration is edited.

## Remaining source and host coverage

- Exercise daily health/feature/economy dashboard definitions and each applicable
  funnel; do not infer these from a tutorial event list. Data sources and what each
  chart would support must be explicit; query/runtime claims require real results.
- Exercise an authorized non-game pipeline task against supplied local data and
  interfaces with observable output and privacy boundaries. Do not replace this
  with game instrumentation or claim a deployed pipeline from prose alone.
- Vary complete and missing consent/retention/design inputs, including actual
  question/answer continuation. Open questions must not silently become collection
  policy. Test read-only, named new spec, authorized existing update and actual
  denied write separately; preserve unrelated file bytes/history.
- Exercise supplied baseline/effect inputs with an independently checked sample
  calculation and declared assumptions, and missing-input cases without invented
  estimates. Compare exposure stability across sessions and overlap handling.
- Exercise actual available native-role hand-offs when delegation is authorized;
  report missing specialists honestly. No external messages, experiment launches,
  game-code edits, shared checkpoints, commits or publication without assignment.
- Verify CLI and desktop discovery/role selection, actual model/effort/sandbox
  inheritance and complete role developer instructions. A generic agent using the
  role name is not native selection. Exact opaque dispatch fields stay unassessed;
  never decrypt or infer them from a result.
- Static content validation, archive install/byte checks and native process exit
  zero are separate from semantic PASS. Preserve failed first runs and unchanged
  raw inputs in retries. Full A003 stays open until its applicable matrix passes.
