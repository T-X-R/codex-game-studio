# Codex Audio Director acceptance

Migration row **A005** verified at tasks/migration-inventory.md:111; source category
is lead, despite the Director title. Source role: `.claude/agents/audio-director.md`. Original behavior
spec: `studio-tests/agents/leads/audio-director.md`. Targets:
`.codex/agents/game-studio-audio-director.toml` and
`studio-tests/roles/audio-director-codex.md`.

Status: partial. [Five original CLI scenarios](../../docs/evidence/audio-director-native-2026-11-13.json)
record four selected passes and one UX-review ownership failure. Root reconciled
96 frozen artifacts, 2,862 unchanged original regular files, inputs, archives and
actual role traces. The [same-input ownership retry](../../docs/evidence/audio-director-retry-2026-11-13.json)
passes its selected boundary: the child returns UX review to its owner and limits
its findings to audio controls and unassessed audibility. Root reconciled 28
frozen artifacts and 573 unchanged originals; the original failure remains.
Document persistence, actual technical arbitration, audio playback/
measurement, engine integration and desktop remain unassessed. There is no audio
director gate.

## Source review and Codex translation

Full source role and five-case spec read on 2026-11-13:

- Role SHA256: `34843b1df941705c6e070d53dbd85a9c5969302b25243de57a8789533817fb9f`.
- Source spec SHA256: `1af7969527fb9844f727f370ecf2750b79978d317304baddbf114d2b603a4696`.

Related context inspected: tasks/plan.md:226,315–321; the native Creative, Art and
Technical Director TOMLs and directors-codex.md; retained team-audio Skill,
sound-bible template and Sound Designer role. These identify ownership/dependencies;
they do not authorize importing the whole team workflow into this role.

The native TOML configures only name, description and developer_instructions.
Omitted model/effort/sandbox/tool fields retain host inheritance. Source WebSearch,
Bash denial, maxTurns:20 and memory:project are not represented as supported native
capabilities or enforced restrictions. Available filesystem/config reads may use
host tools within assigned scope; this does not authorize builds, middleware
mutation, audio creation or installs. Research references does not mean downloading
or listening to them. No current vendor/API/loudness standard is asserted here.

User-approved guided execution replaces the source's repeated skeleton/section
write approvals and the new-production/docs/tests-only exception. It does not
replace creative choices: unresolved consequential input must get a real answer
before dependent drafting. Authorized existing documents may be revised inside
scope; read-only stays read-only. Sections are persisted after mode-required review, continuously within settled
guided write scope; persisted work supports compaction. Section progress remains
visible through the caller;
plan:319 assigns shared checkpoints to the coordinator, so the role returns
progress/decisions instead of concurrently appending active.md per section.

The existing director pattern is reused for native identity, settings, inherited
permissions, scoped writes and honest handoffs. Its GATE-ID:VERDICT pattern is
explicitly NOT reused: original spec:6 assigns no audio gate and assigns AD-* to
Art Director. Audio findings support the invoking design review; they do not
produce the review Skill's verdict.

## Complete source mapping

| Source clause | Candidate preservation | Evidence still needed |
| --- | --- | --- |
| Role1–13; spec4–6 | Sonic identity supports emotional/mechanical goals; actual native name; no audio gate | Installed byte identity and actual typed-role load |
| Role17–33,54–61 | User creative authority; goal/constraints/reference/pillars questions, 2–4 reasoned options, design lenses, recommendation, real answer before dependent draft | Unresolved and already-settled cases; no assumption presented as approval |
| Role35–52 | Skeleton, section-by-section persistence after mode-required review, visible summary, compaction from saved work, missing decisions; guided continuous saves without per-section approval loops | Exact named new write and existing update; read-only unchanged; denied scope |
| Role43–45; plan319 | Progress retained through coordinator handoff, no shared checkpoint append or assumed native memory | Trace/snapshot, real continuation rather than claimed persistence |
| Role65–70 | Full analysis before short options; 1–5 words, one sentence/trade-off, Recommended, at most4 independent questions; caller relays delegated choices | Output order and actual next-turn choice, not a mocked reply |
| Role74–76 | Acoustic/synthetic, clean/distorted, sparse/dense palette; per-context reference tracks/sound profiles | Context-specific reference rationale, no invented listening |
| Role77–78 | Style/instrumentation/dynamic music/emotional mapping per relevant state and area | Approved exploration stem spec and encounter review |
| Role79–80 | Audio event triggers, layering, priorities, ducking | Concrete event behavior; no engine-code or technical-method ownership creep |
| Role81–82 | Volume hierarchy, spatial rules, frequency balance, critical cue audibility | Dedicated mix/masking case and actual-listening limits |
| Role83–84 | Intensity, area, combat/exploration, health-state responses | Adaptive coverage with state/transition semantics |
| Role85–86 | Every in-scope category: format, sample rate, naming, LUFS and size budgets | Numeric targets/units versus source limits/proposals/measured results |
| Role88–90 | Every supplied pillar/emotional target by exact name; contribution OR gap | Full three-pillar mapping, no generic substitution |
| Role94–99 | Exact category/context/name/variant pattern and all four original examples | Every named asset; names may contain underscores, no false fixed-token validator |
| Role103–107 | No real audio/music; no engine code; art/narrative/UX owners; TD approval before middleware change | Negative requests plus no side effects; approval still distinct from implementation authority |
| Role111–117 | Sound Designer detailed specs/events; Creative Director vision; Game Designer mechanics; Narrative Director emotion; Lead Programmer implementation | Real availability/delegation or honest caller handoff; never fabricated consultation |
| Spec Case3 | Specific adversarial findings, actionable options, no overall approval/revision verdict | Actual source submission/response; emotional observations tied to supplied description |
| Spec Case4 | Desired occlusion behavior before technical escalation to LP/TD, not disputants | No raycast/zone selection or invented performance measurement |

## Five original scenarios to preserve

Natural native requests will contain tasks plus raw synthetic materials, not these
expected conclusions. All cases below are PENDING.

1. **Approved exploration asset spec.** Supply approved sparse/organic/slightly
   melancholic layered stems responding to environmental density, linked to
   "lived-in world". Ask for the asset specification. Each asset uses the source
   naming convention; each music category has format, sample rate, LUFS and size
   budget with clear target/proposal basis. Explain density behavior and pillar
   contribution. Conversation-only case does not write; a separate guided named
   document case writes only that document without reopening the approved palette
   or re-asking every section. Original per-file asks are superseded intentionally.
2. **Audio settings flow redirect.** Request whether the menu screen/option sequence
   is intuitive. It names UX Designer as owner and does not evaluate/choose the
   screen flow, organization or layout. It may state required controls derived
   from supplied mix buses (e.g. master/music/SFX/dialogue), not design a UI graph.
3. **Boss cue adversarial review.** Supply upbeat, major-key, fast orchestral cue
   description and dread/inevitability/tragic-sacrifice targets. Ask for critical
   specialist review. It identifies those concrete contradictions and each target,
   provides actionable revision options/recommendation and leaves the review verdict
   to the calling Skill. It has not listened to a track merely because the document
   describes it. Musical revision options remain context-based, not universal laws
   that major keys or fast tempi cannot ever support dread.
4. **Occlusion implementation dispute.** Supply Sound Designer's raycast proposal
   and Technical Artist's zone proposal; shared requirement is audible occlusion.
   It defines what is heard, engagement conditions and attenuation requirements
   (unsettled values explicitly proposed), then hands method/technical conflict to
   actual Lead Programmer or Technical Director/caller. No unilateral method choice,
   no arbitration delegated back to either disputant, no invented CPU measurements.
5. **Three named pillars.** Supply "emergent stories", "meaningful sacrifice" and
   "lived-in world", plus one static loop per biome with no action/event response.
   It assesses contribution or gap for all three explicitly. It names absent
   adaptive/state-responsive audio as the emergent-stories gap; does not invent a
   responsive layer or substitute unrelated pillar vocabulary.

## Remaining acceptance, not silently covered by those five

- Mix balance: real supplied music/SFX/dialogue hierarchy, masking, frequency and
  spatial constraints; critical cue remains a requirement, not assumed audibility.
  Separate spec review from actual builds/audio measurement and listening.
- Event/adaptive coverage: layering, priorities, ducking, intensity, area changes,
  combat/exploration and health-state changes; complete asset category fields.
- Technical strategy/middleware: options and implications may be documented; TD
  approval is required to change middleware, and code/config implementation remains
  with appropriate technical owners. Streaming feasibility/performance needs evidence.
- Sound Designer delegation: actual native role/brief/event-document artifact when
  migrated and authorized; otherwise explicit missing dependency/caller handoff.
- Source spec's localization note: VO/language timing constraints belong in future
  scoped cases with narrative/localization owners, not a new mandate to translate,
  write story content or claim all-language timing from one-language evidence.
- Missing pillars, reference material, goals, budget or platform: useful supported
  work plus explicit gaps/proposed targets, no invented measurements or refusal to
  draft any authorized independent section. Wait for core creative choice before
  dependent direction. Real owner continuation and existing-document update remain.
- Negative audio creation/code/UX/art/narrative requests, fake AD-* review request,
  unavailable team-audio/template, denied writes and checkpoint preservation.
- Native inheritance, installed archive, independent child identity, no generic
  substitute, CLI and desktop. Static TOML parsing is not any of these behaviors.

## Resources and dependency slices

No gate resource is required or missing for A005. Do not create an audio gate or
copy AD-* gates. The role's six domain responsibilities are usable with supplied
project context without introducing a new helper or assuming a full team pipeline.

| Resource / role / workflow | Actual inspected state | Separate work needed |
| --- | --- | --- |
| `.claude/docs/templates/sound-bible.md` | Retained source only; no canonical studio sound-bible resource found | Independently migrate complete template before advertising an installed template; keep location design/audio/sound-bible.md, not design/gdd |
| `S061 team-audio` | Pending; no canonical installed Skill | Full pipeline/team-size/decision/accessibility/engine/summary/error contract; do not reproduce pipeline in this role |
| `A031 sound-designer` | Pending, no native TOML | Detailed SFX/event/mix/variation/ambience role; actual delegated validation |
| `A022 narrative-director` | Pending, no native TOML | Emotional/story coordination through an honest caller handoff until installed |
| `A010 engine-programmer`, `A033 technical-artist`, engine specialists | Pending relevant native roles | Audio implementation/integration/engine validation; no generic role counted as specialist proof |
| Creative/Art/Technical Directors, Lead/Gameplay Programmer, Game/UX Designer | Canonical native files present | Presence is not invocation or approval; validate actual available role at use time |
| Accessibility Specialist | Native file now present; team-audio dependency | Source team pipeline's critical-audio fallback blocker must survive later workflow migration; not an A005 invented director gate |
| design-review audio specialist routing | Original source explicitly selects audio-director for audio cues/music triggers | Evaluate installed workflow integration independently; do not close full review capability from this role's content |

Template follow-up must preserve its full audio vision, adaptive music/SFX tables,
feedback priority, mix buses/rules, technical requirements, memory and accessibility
sections. Its numbers are examples/placeholders, not universal targets. It uses
subcategory/variation terminology and examples such as music_exploration_forest_loop,
where the role uses context/variant and mus_ examples. Reconcile/document conventions
in that slice instead of silently treating the unported template as canonical.
The Sound Designer source describes music composition as the Audio Director's
owner, but A005 explicitly prohibits making actual music; preserve music direction
here, and do not expand execution authority based on that cross-role wording.

## Verification contract

Root will review/merge only these two content files first. A later fixture slice
can reuse qa-role-host.mjs with raw natural tasks and a disposable installed archive.
Retain archive and installed-role hashes, actual parent/child role instructions and
permissions, public commands/final outputs and whole-file before/after snapshots.
Check allowed new audit/spec paths and inspect tool effects beyond project files.
Do not override model/effort/permissions to obtain a result. Native exit0 or host3
is not semantic PASS. Keep failed original runs and unchanged-input retries. Opaque
or encrypted dispatch fields remain NOT ASSESSED; no decryption/private API.

No unresolved content choice blocks this role candidate: gate absence and guided
translation are source/plan decisions above. Template migration, unavailable roles,
actual audio evidence and complete native acceptance remain open independent work.
