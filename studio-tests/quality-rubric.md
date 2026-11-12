# Codex Skill and Role Quality Rubric

This is the Codex migration rubric for the categories in `catalog.yaml`.
Source names below identify the retained workflows; their active names and paths
are the catalog's `target` fields. Category metrics preserve upstream domain
requirements while replacing Claude metadata and per-file approval mechanics.
The approved policy is in `tasks/plan.md` sections 6–7.

Record two separate assessments per applicable metric:

- **Instruction review**: PASS means the installed instructions clearly specify
  the criterion; FAIL means absent, ambiguous or contradictory guidance; WARN
  means partial coverage; NOT ASSESSED means the material was unavailable.
- **Observed behavior**: PASS requires a live scenario and its actual artifacts,
  transcript and filesystem/process observations. FAIL records a contradiction;
  PARTIAL records mixed or incomplete coverage; NOT ASSESSED names a missing
  host, capability, input or observation. Reading instructions cannot produce a
  behavioral PASS. A non-applicable metric needs a reason, not a synthetic pass.

Static validation runs with `npm --prefix toolkit run lint:content` after build.
It does not run this semantic rubric. No `/skill-test` command is claimed to be
installed. Positive and negative trigger cases, permission failures and mode
variants require the scenario coverage defined in the corresponding Codex spec.
Record CLI and desktop evidence separately with exact versions and installed
content hashes. A synthetic fixture proves only its stated conditions; human
play/sign-off cannot be inferred from model feedback, replay or screenshots.

## Common Codex criteria

- Resolve effective settings and their provenance through the pinned toolkit;
  do not reimplement defaults or conflate rigor, workflow, review and automation.
- Default `guided` behavior confirms the goal and consequential choices, then
  continues authorized implementation and verification. Existing permission
  covers routine writes; ambiguity, changed scope and consequential decisions
  return to the user. Explicit `collaborative` choices retain their closer review
  cadence. `autonomous` does not override host permissions or authorize release.
- Respect read-only tasks and preserve unrelated files in all modes. An approved
  report can be written without separately asking about each file. A request to
  review does not authorize modifying the reviewed artifact.
- Use native Codex roles only when available and authorized. Supply input paths,
  allowed writes, dependencies and completion criteria. Observe child selection,
  isolation and results; professional role mentions alone do not prove delegation.
  Keep independent writers disjoint and shared checkpoint updates with the
  coordinator. Missing roles, denial or failed children stop dependent work and
  stay visible. A labeled solo fallback cannot count as independent review.
- Roles inherit model and permissions. Do not translate Claude model/tool aliases,
  auto-trust Hooks, bypass sandbox boundaries or invent native memory support.
- Preserve original domain acceptance and verdict vocabulary. Missing evidence
  stays NOT ASSESSED; actual failures remain failures. No static or category
  score completes a catalog migration row or approves publication.

---

## Skill Categories

### `gate`

**Skills**: gate-check

Gate skills control phase transitions. They must enforce correctness without
auto-advancing stage and must respect the three review modes.

| Metric | PASS criteria |
|---|---|
| **G1 — Review mode read** | Skill reads effective `modes.review_mode` and `modes.workflow` with provenance from the pinned CLI before deciding which directors to spawn; the configuration resolver owns local/project overrides, the legacy review-mode mirror and rigor fallback |
| **G2 — Director panel width** | Unless `solo`, the PHASE-GATE panel runs in parallel at the width `modes.workflow` sets — `minimal` PR only, `standard` TD + PR, `full` all 4 (CD, TD, PR, AD) — and the output names the perspectives a narrower panel left out |
| **G3 — Lean mode: PHASE-GATE only** | In `lean` mode, only `*-PHASE-GATE` gates run; inline gates (CD-PILLARS, TD-ARCHITECTURE, etc.) are skipped |
| **G4 — Solo mode: no directors** | In `solo` mode, no director gates spawn; each is noted as "skipped — Solo mode" |
| **G5 — No auto-advance** | Skill never writes `project.stage` in `project.yaml`, or the legacy `production/stage.txt`, without explicit authorization for that stage transition; reuse an authorization already given for the same transition |

---

### `review`

**Skills**: design-review, architecture-review, review-all-gdds

Review skills read documents and produce structured verdicts. They are primarily
read-only and must not trigger director gates during the analysis phase.

| Metric | PASS criteria |
|---|---|
| **R1 — Read-only enforcement** | Skill does not modify the reviewed document without explicit user approval; review logs/index writes stay within the authorized task and effective automation policy |
| **R2 — 8-section check** | Skill evaluates all 8 required GDD sections (or equivalent architectural sections) explicitly |
| **R3 — Correct verdict vocabulary** | Verdict is exactly one of: APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED / NOT ASSESSED (design-review, ux-review) or PASS / CONCERNS / FAIL / NOT ASSESSED (architecture-review, review-all-gdds) |
| **R4 — No director gates during analysis** | Skill does not spawn director gates during its analysis phases; post-analysis director review is acceptable when the skill's scope and stakes warrant it |
| **R5 — Structured findings** | Output contains a per-section status table or checklist before the final verdict |

> **Exceptions:**
> - `design-review`: May offer an optional "Revise now" path and write authorized review logs. R1 is satisfied only when revisions have been authorized; no Claude `allowed-tools` metadata is required.

---

### `authoring`

**Skills**: design-system, quick-design, architecture-decision, ux-design, ux-review, art-bible, create-architecture

Authoring skills create or update design documents collaboratively. Full GDD/UX
authoring skills use a section-by-section cycle; lightweight authoring skills use
a single-draft pattern appropriate to their smaller scope.

| Metric | PASS criteria |
|---|---|
| **A1 — Section-by-section cycle** | Full authoring skills (design-system, ux-design, art-bible) author one section at a time, resolving consequential section decisions before dependent sections, while reusing approved scope and the effective automation policy. Lightweight skills (quick-design, architecture-decision, create-architecture) may draft the complete document then ask for approval — single-draft is acceptable for documents under about one week of implementation scope. |
| **A2 — Authorized authoring** | Goal, document scope and consequential decisions are settled before dependent writes. Guided mode continues through the agreed sections without per-file approval loops; collaborative mode follows the selected review cadence. |
| **A3 — Retrofit mode** | Skill detects if the target file already exists and offers to update specific sections rather than overwriting the whole document. Lightweight skills (quick-design) that always create new files are exempt. |
| **A4 — Director gate at correct tier** | If a director gate is defined for this skill (e.g., CD-GDD-ALIGN, TD-ADR), it runs in `full` only; in `lean` and `solo` it is skipped with a named note (`[GATE-ID] skipped — Lean mode` / `— Solo mode`) |
| **A5 — Skeleton-first** | Full authoring skills create a file skeleton with all section headers before filling content, to preserve progress on session interruption. Lightweight skills are exempt. |

> **Full authoring skills** (must pass all 5 metrics): `design-system`, `ux-design`, `art-bible`
> **Lightweight authoring skills** (A1, A2, A5 use single-draft pattern; A3 exempt for new-file-only skills): `quick-design`, `architecture-decision`, `create-architecture`
> **Review-mode skill** (evaluated against review metrics): `ux-review`

---

### `readiness`

**Skills**: story-readiness, story-done

Readiness skills validate stories before or after implementation. They must produce
multi-dimensional verdicts and integrate correctly with director gate mode.

| Metric | PASS criteria |
|---|---|
| **RD1 — Multi-dimensional check** | Skill checks ≥3 independent dimensions (e.g., Design, Architecture, Scope, DoD) and reports each separately |
| **RD2 — Four verdict levels** | Verdict hierarchy is clearly defined, with NOT ASSESSED between the pass values and the failure values: READY > NOT ASSESSED > NEEDS WORK > BLOCKED (story-readiness); COMPLETE > COMPLETE WITH NOTES > NOT ASSESSED > BLOCKED (story-done) |
| **RD3 — BLOCKED requires external action** | BLOCKED verdict is reserved for issues that cannot be fixed by the story author alone (e.g., Proposed ADR, unresolvable dependency) |
| **RD4 — Director gate at correct mode** | QL-STORY-READY or LP-CODE-REVIEW gate spawns in `full` mode, skips in `lean`/`solo` with a noted skip message |
| **RD5 — Next-story handoff** | After completion, skill surfaces the next READY story from the active sprint. With no sprint plan, `game-studio-story-done` names the next story in the build order, and `game-studio-story-readiness` says no sprint file was found |

---

### `pipeline`

**Skills**: create-epics, create-stories, dev-story, create-control-manifest, propagate-design-change, map-systems, vertical-slice

Pipeline skills produce artifacts that other skills consume. They must write files
with correct schema, respect layer/priority ordering, and resolve consequential decisions before dependent writes.

| Metric | PASS criteria |
|---|---|
| **P1 — Correct output schema** | Each produced file follows the project template (EPIC.md, story frontmatter, etc.); skill references the template path |
| **P2 — Layer/priority ordering** | Skills that produce epics or stories respect layer ordering (foundation → core → feature → presentation) and priority fields |
| **P3 — Authorized artifact scope** | Files implement the agreed output scope; unrelated artifacts and changed requirements are not silently added. Guided mode does not require the user to enumerate or approve every routine file. |
| **P4 — Director gate at correct tier** | In-scope gates (PR-EPIC, QL-STORY-READY, LP-CODE-REVIEW, etc.) run in `full`, skip in `lean`/`solo` with noted skip |
| **P5 — Reads before writes** | Skill reads the relevant GDD/ADR/manifest before producing artifacts to ensure alignment |

---

### `analysis`

**Skills**: consistency-check, balance-check, content-audit, code-review, tech-debt,
scope-check, estimate, perf-profile, asset-audit, security-audit, test-evidence-review, test-flakiness

Analysis skills scan the project and surface findings. They are read-only during
analysis and separate findings from any subsequently authorized changes.

| Metric | PASS criteria |
|---|---|
| **AN1 — Read-only scan** | Analysis phase changes nothing: no file mutations or mutating commands during the scan itself (read-only commands such as `git log` or file-size measurement are fine) |
| **AN2 — Structured findings table** | Output includes a findings table or checklist (not prose only) with severity/priority per finding |
| **AN3 — No unauthorized changes** | Suggested fixes require authorization before implementation; reports already requested by the user follow the agreed write scope and automation policy |
| **AN4 — No director gates during analysis** | Analysis skills do not spawn director gates; they produce findings for human review |

---

### `team`

**Skills**: team-combat, team-narrative, team-audio, team-level, team-ui, team-qa,
team-release, team-polish, team-live-ops

Team skills orchestrate multiple specialist agents for a department. They must
spawn the right agents, run independent ones in parallel, and surface blocks immediately.

| Metric | PASS criteria |
|---|---|
| **T1 — Named agent list** | Skill explicitly names which agents it spawns and in what order |
| **T2 — Parallel where independent** | Native Codex children with independent inputs run concurrently within observed host capacity and authorization; reduced capacity is reported, dependent work stays sequential, and writers have disjoint ownership |
| **T3 — BLOCKED surfacing** | If any spawned agent returns BLOCKED or fails, skill surfaces it immediately and halts dependent work — never silently skips |
| **T4 — Collect all verdicts before proceeding** | Dependent phases wait for all parallel agents to complete before proceeding |
| **T5 — Usage error on no argument** | If a required argument (e.g., feature name) is missing, skill either outputs a usage hint and stops, or infers the argument (e.g., the release version, the active sprint) and confirms it with the user — in both cases before spawning any agent |

---

### `sprint`

**Skills**: sprint-plan, sprint-status, milestone-review, retrospective, write-changelog, patch-notes

Sprint skills read production state and produce reports or planning artifacts.
They have a PR-SPRINT or PR-MILESTONE gate at specific mode thresholds.

| Metric | PASS criteria |
|---|---|
| **SP1 — Reads sprint/milestone state** | Skill reads `production/sprints/` or `production/milestones/` before producing output |
| **SP2 — Correct sprint gate** | PR-SPRINT (for planning) or PR-MILESTONE (for milestone review) gate runs in `full` mode, skips in `lean`/`solo` |
| **SP3 — Structured output** | Output uses a consistent structure (velocity table, risk list, action items) rather than free prose |
| **SP4 — Authorized planning and delivery** | Sprint/milestone writes stay within agreed planning scope and automation policy. Saving a plan does not by itself authorize Git publication or a release |

---

### `utility`

**Skills**: start, next-step, brainstorm, onboard, adopt, hotfix, prototype, localize,
launch-checklist, release-checklist, smoke-check, soak-test, test-setup, test-helpers,
regression-suite, qa-plan, bug-triage, bug-report, playtest-report, asset-spec,
reverse-document, project-stage-detect, setup-engine, skill-test, skill-improve,
day-one-patch, cut, and any other skills not in categories above

Utility skills pass the implemented canonical content checks. If they happen to spawn director
gates, the gate mode logic must also be correct.

| Metric | PASS criteria |
|---|---|
| **U1 — Canonical content valid** | `lint:content` reports no applicable metadata, command, reference or catalog error; this is instruction/static evidence only |
| **U2 — Gate mode correct (if applicable)** | If the skill spawns any director gate, it reads review-mode and applies full/lean/solo logic correctly |

---

## Agent Categories

Evaluate the role at the catalog's `.codex/agents/game-studio-*.toml` target.
The spec folder's historical tier is not a model selection. Canonical roles
inherit the caller's model/effort and execution permissions. Verify loading and
actual child behavior separately from TOML parsing.

### `director`

**Agents**: creative-director, technical-director, art-director, producer

| Metric | PASS criteria |
|---|---|
| **D1 — Correct verdict vocabulary** | Returns `[GATE-ID]: [word]` as its first line, the word taken from the invoked gate's **Verdicts** line — or `NOT ASSESSED`, naming the missing input, when an input the gate names was not given |
| **D2 — Domain boundary respected** | Does not make binding decisions outside its declared domain |
| **D3 — Conflict escalation** | When two departments conflict, escalates to correct parent (creative-director or technical-director) rather than unilaterally deciding |

### `lead`

**Agents**: lead-programmer, qa-lead, narrative-director, audio-director, game-designer,
systems-designer, level-designer

| Metric | PASS criteria |
|---|---|
| **L1 — Gate verdict or findings** | A lead invoked for a gate (lead-programmer's LP-, qa-lead's QL-, narrative-director's ND- gates) returns that gate's **Verdicts** words — or `NOT ASSESSED`, naming a missing input; a lead without a gate returns findings and leaves the verdict to the calling skill |
| **L2 — Escalates to shared parent** | Out-of-domain conflicts escalate to creative-director (design) or technical-director (tech) |

### `specialist`

**Agents**: gameplay-programmer, ai-programmer, technical-artist, sound-designer,
engine-programmer, tools-programmer, network-programmer, security-engineer,
accessibility-specialist, ux-designer, ui-programmer, performance-analyst, prototyper,
writer, world-builder

| Metric | PASS criteria |
|---|---|
| **S1 — Stays in domain** | Explicitly scopes itself to its declared domain; defers out-of-domain requests |
| **S2 — No binding cross-domain decisions** | Does not unilaterally decide matters owned by another specialist |
| **S3 — Defers correctly** | Out-of-domain requests are redirected to the correct agent, not refused silently |

### `engine`

**Agents**: godot-specialist, godot-gdscript-specialist, godot-csharp-specialist,
godot-shader-specialist, godot-gdextension-specialist, unity-specialist, unity-ui-specialist,
unity-shader-specialist, unity-dots-specialist, unity-addressables-specialist,
unreal-specialist, ue-blueprint-specialist, ue-gas-specialist, ue-umg-specialist,
ue-replication-specialist

| Metric | PASS criteria |
|---|---|
| **E1 — Version-aware** | References engine version from `docs/engine-reference/` before suggesting API calls; flags post-cutoff risk |
| **E2 — File routing** | Routes file types to the correct sub-specialist (e.g., `.gdshader` → godot-shader-specialist, not godot-gdscript-specialist) |
| **E3 — Engine-specific patterns** | Enforces engine-specific idioms (e.g., GDScript static typing, C# attribute exports, Blueprint function libraries) |

### `qa`

**Agents**: qa-tester

| Metric | PASS criteria |
|---|---|
| **Q1 — QA ownership** | Produces test cases, executable test scaffolds, bug reports and coverage gaps; game implementation stays with the programmer |
| **Q2 — Evidence format** | Test cases follow the project's test evidence format (unit/integration/visual/UI per coding-standards.md) |
| **Q3 — No scope creep** | Does not propose new features; flags gaps for humans to decide |

### `operations`

**Agents**: devops-engineer, release-manager, live-ops-designer, community-manager,
analytics-engineer, economy-designer, localization-lead

| Metric | PASS criteria |
|---|---|
| **O1 — Domain ownership clear** | Agent description clearly states what it owns (pipeline, releases, economy, etc.) |
| **O2 — Defers implementation** | Does not write game logic or engine code; delegates to appropriate specialist |
| **O3 — Actions match role** | Native actions and allowed write scope match operational ownership; no Claude tool allowlist is treated as Codex permission enforcement |
