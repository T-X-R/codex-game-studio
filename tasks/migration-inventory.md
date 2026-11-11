# Migration inventory for Codex Game Studio

Status: Proposed dispositions; every item is unimplemented and unverified. Baseline: upstream 1.3.0, `abc0de7`, inspected 2026-11-11. This inventory records source identity and intended destination; it does not assert behavioral equivalence. See [the main proposal](plan.md) and [implementation tasks](todo.md).

## Coverage totals

| Source category | Count | Planned treatment |
| --- | ---: | --- |
| Skill entry files | 78 | 75 primary workflows retained, 3 legacy aliases retired with mappings |
| Role definitions | 49 | Retain professional roles, rewrite host definitions |
| Scoped rule files | 14 | Retain scoped guidance, verify discovery/application |
| Hook-directory scripts | 18 | 15 currently registered handlers, 3 unregistered/helper files |
| Shared script/resource files | 54 | Port or retain according to contract and platform requirements |
| CLAUDE.md instruction files | 5 | Rewrite into Codex instructions and referenced guidance |

## Skill migration checklist

All retained Skills receive the prefix `game-studio-`. Category comes from the corresponding behavioral specification. Every retained entry requires a Codex trigger/negative-trigger case, explicit configuration resolution, correct command/role calls, appropriate guided-mode behavior, valid references, and one recorded live scenario. The task list uses S001–S078 to refer to these rows.

| ID | Source Skill | Category | Proposed Codex target | Behavioral specification |
| --- | --- | --- | --- | --- |
| S001 | [adopt](../.claude/skills/adopt/SKILL.md) | utility | `game-studio-adopt` | [adopt.md](../studio-tests/skills/utility/adopt.md) |
| S002 | [architecture-decision](../.claude/skills/architecture-decision/SKILL.md) | authoring | `game-studio-architecture-decision` | [architecture-decision.md](../studio-tests/skills/authoring/architecture-decision.md) |
| S003 | [architecture-review](../.claude/skills/architecture-review/SKILL.md) | review | `game-studio-architecture-review` | [architecture-review.md](../studio-tests/skills/review/architecture-review.md) |
| S004 | [art-bible](../.claude/skills/art-bible/SKILL.md) | authoring | `game-studio-art-bible` | [art-bible.md](../studio-tests/skills/authoring/art-bible.md) |
| S005 | [asset-audit](../.claude/skills/asset-audit/SKILL.md) | analysis | `game-studio-asset-audit` | [asset-audit.md](../studio-tests/skills/analysis/asset-audit.md) |
| S006 | [asset-spec](../.claude/skills/asset-spec/SKILL.md) | utility | `game-studio-asset-spec` | [asset-spec.md](../studio-tests/skills/utility/asset-spec.md) |
| S007 | [balance-check](../.claude/skills/balance-check/SKILL.md) | analysis | `game-studio-balance-check` | [balance-check.md](../studio-tests/skills/analysis/balance-check.md) |
| S008 | [brainstorm](../.claude/skills/brainstorm/SKILL.md) | utility | `game-studio-brainstorm` | [brainstorm.md](../studio-tests/skills/utility/brainstorm.md) |
| S009 | [bug-report](../.claude/skills/bug-report/SKILL.md) | utility | `game-studio-bug-report` | [bug-report.md](../studio-tests/skills/utility/bug-report.md) |
| S010 | [bug-triage](../.claude/skills/bug-triage/SKILL.md) | utility | `game-studio-bug-triage` | [bug-triage.md](../studio-tests/skills/utility/bug-triage.md) |
| S011 | [changelog](../.claude/skills/changelog/SKILL.md) | legacy alias | Retire; use `game-studio-write-changelog` | Alias-routing regression case |
| S012 | [code-review](../.claude/skills/code-review/SKILL.md) | analysis | `game-studio-code-review` | [code-review.md](../studio-tests/skills/analysis/code-review.md) |
| S013 | [consistency-check](../.claude/skills/consistency-check/SKILL.md) | analysis | `game-studio-consistency-check` | [consistency-check.md](../studio-tests/skills/analysis/consistency-check.md) |
| S014 | [content-audit](../.claude/skills/content-audit/SKILL.md) | analysis | `game-studio-content-audit` | [content-audit.md](../studio-tests/skills/analysis/content-audit.md) |
| S015 | [create-architecture](../.claude/skills/create-architecture/SKILL.md) | authoring | `game-studio-create-architecture` | [create-architecture.md](../studio-tests/skills/authoring/create-architecture.md) |
| S016 | [create-control-manifest](../.claude/skills/create-control-manifest/SKILL.md) | pipeline | `game-studio-create-control-manifest` | [create-control-manifest.md](../studio-tests/skills/pipeline/create-control-manifest.md) |
| S017 | [create-epics](../.claude/skills/create-epics/SKILL.md) | pipeline | `game-studio-create-epics` | [create-epics.md](../studio-tests/skills/pipeline/create-epics.md) |
| S018 | [create-stories](../.claude/skills/create-stories/SKILL.md) | pipeline | `game-studio-create-stories` | [create-stories.md](../studio-tests/skills/pipeline/create-stories.md) |
| S019 | [cut](../.claude/skills/cut/SKILL.md) | utility | `game-studio-cut` | [cut.md](../studio-tests/skills/utility/cut.md) |
| S020 | [day-one-patch](../.claude/skills/day-one-patch/SKILL.md) | utility | `game-studio-day-one-patch` | [day-one-patch.md](../studio-tests/skills/utility/day-one-patch.md) |
| S021 | [design-review](../.claude/skills/design-review/SKILL.md) | review | `game-studio-design-review` | [design-review.md](../studio-tests/skills/review/design-review.md) |
| S022 | [design-system](../.claude/skills/design-system/SKILL.md) | authoring | `game-studio-design-system` | [design-system.md](../studio-tests/skills/authoring/design-system.md) |
| S023 | [dev-story](../.claude/skills/dev-story/SKILL.md) | pipeline | `game-studio-dev-story` | [dev-story.md](../studio-tests/skills/pipeline/dev-story.md) |
| S024 | [estimate](../.claude/skills/estimate/SKILL.md) | analysis | `game-studio-estimate` | [estimate.md](../studio-tests/skills/analysis/estimate.md) |
| S025 | [gate-check](../.claude/skills/gate-check/SKILL.md) | gate | `game-studio-gate-check` | [gate-check.md](../studio-tests/skills/gate/gate-check.md) |
| S026 | [help](../.claude/skills/help/SKILL.md) | legacy alias | Retire; use `game-studio-next-step` | Alias-routing regression case |
| S027 | [hotfix](../.claude/skills/hotfix/SKILL.md) | utility | `game-studio-hotfix` | [hotfix.md](../studio-tests/skills/utility/hotfix.md) |
| S028 | [launch-checklist](../.claude/skills/launch-checklist/SKILL.md) | utility | `game-studio-launch-checklist` | [launch-checklist.md](../studio-tests/skills/utility/launch-checklist.md) |
| S029 | [localize](../.claude/skills/localize/SKILL.md) | utility | `game-studio-localize` | [localize.md](../studio-tests/skills/utility/localize.md) |
| S030 | [map-systems](../.claude/skills/map-systems/SKILL.md) | pipeline | `game-studio-map-systems` | [map-systems.md](../studio-tests/skills/pipeline/map-systems.md) |
| S031 | [milestone-review](../.claude/skills/milestone-review/SKILL.md) | sprint | `game-studio-milestone-review` | [milestone-review.md](../studio-tests/skills/sprint/milestone-review.md) |
| S032 | [next-step](../.claude/skills/next-step/SKILL.md) | utility | `game-studio-next-step` | [next-step.md](../studio-tests/skills/utility/next-step.md) |
| S033 | [onboard](../.claude/skills/onboard/SKILL.md) | utility | `game-studio-onboard` | [onboard.md](../studio-tests/skills/utility/onboard.md) |
| S034 | [patch-notes](../.claude/skills/patch-notes/SKILL.md) | sprint | `game-studio-patch-notes` | [patch-notes.md](../studio-tests/skills/sprint/patch-notes.md) |
| S035 | [perf-profile](../.claude/skills/perf-profile/SKILL.md) | analysis | `game-studio-perf-profile` | [perf-profile.md](../studio-tests/skills/analysis/perf-profile.md) |
| S036 | [playtest-report](../.claude/skills/playtest-report/SKILL.md) | utility | `game-studio-playtest-report` | [playtest-report.md](../studio-tests/skills/utility/playtest-report.md) |
| S037 | [project-settings](../.claude/skills/project-settings/SKILL.md) | utility | `game-studio-project-settings` | [project-settings.md](../studio-tests/skills/utility/project-settings.md) |
| S038 | [project-stage-detect](../.claude/skills/project-stage-detect/SKILL.md) | utility | `game-studio-project-stage-detect` | [project-stage-detect.md](../studio-tests/skills/utility/project-stage-detect.md) |
| S039 | [propagate-design-change](../.claude/skills/propagate-design-change/SKILL.md) | pipeline | `game-studio-propagate-design-change` | [propagate-design-change.md](../studio-tests/skills/pipeline/propagate-design-change.md) |
| S040 | [prototype](../.claude/skills/prototype/SKILL.md) | utility | `game-studio-prototype` | [prototype.md](../studio-tests/skills/utility/prototype.md) |
| S041 | [qa-plan](../.claude/skills/qa-plan/SKILL.md) | utility | `game-studio-qa-plan` | [qa-plan.md](../studio-tests/skills/utility/qa-plan.md) |
| S042 | [quick-design](../.claude/skills/quick-design/SKILL.md) | authoring | `game-studio-quick-design` | [quick-design.md](../studio-tests/skills/authoring/quick-design.md) |
| S043 | [regression-suite](../.claude/skills/regression-suite/SKILL.md) | utility | `game-studio-regression-suite` | [regression-suite.md](../studio-tests/skills/utility/regression-suite.md) |
| S044 | [release-checklist](../.claude/skills/release-checklist/SKILL.md) | utility | `game-studio-release-checklist` | [release-checklist.md](../studio-tests/skills/utility/release-checklist.md) |
| S045 | [retrospective](../.claude/skills/retrospective/SKILL.md) | sprint | `game-studio-retrospective` | [retrospective.md](../studio-tests/skills/sprint/retrospective.md) |
| S046 | [reverse-document](../.claude/skills/reverse-document/SKILL.md) | utility | `game-studio-reverse-document` | [reverse-document.md](../studio-tests/skills/utility/reverse-document.md) |
| S047 | [review-all-gdds](../.claude/skills/review-all-gdds/SKILL.md) | review | `game-studio-review-all-gdds` | [review-all-gdds.md](../studio-tests/skills/review/review-all-gdds.md) |
| S048 | [scope-check](../.claude/skills/scope-check/SKILL.md) | analysis | `game-studio-scope-check` | [scope-check.md](../studio-tests/skills/analysis/scope-check.md) |
| S049 | [security-audit](../.claude/skills/security-audit/SKILL.md) | analysis | `game-studio-security-audit` | [security-audit.md](../studio-tests/skills/analysis/security-audit.md) |
| S050 | [settings](../.claude/skills/settings/SKILL.md) | legacy alias | Retire; use `game-studio-project-settings` | Alias-routing regression case |
| S051 | [setup-engine](../.claude/skills/setup-engine/SKILL.md) | utility | `game-studio-setup-engine` | [setup-engine.md](../studio-tests/skills/utility/setup-engine.md) |
| S052 | [skill-improve](../.claude/skills/skill-improve/SKILL.md) | utility | `game-studio-skill-improve` | [skill-improve.md](../studio-tests/skills/utility/skill-improve.md) |
| S053 | [skill-test](../.claude/skills/skill-test/SKILL.md) | utility | `game-studio-skill-test` | [skill-test.md](../studio-tests/skills/utility/skill-test.md) |
| S054 | [smoke-check](../.claude/skills/smoke-check/SKILL.md) | utility | `game-studio-smoke-check` | [smoke-check.md](../studio-tests/skills/utility/smoke-check.md) |
| S055 | [soak-test](../.claude/skills/soak-test/SKILL.md) | utility | `game-studio-soak-test` | [soak-test.md](../studio-tests/skills/utility/soak-test.md) |
| S056 | [sprint-plan](../.claude/skills/sprint-plan/SKILL.md) | sprint | `game-studio-sprint-plan` | [sprint-plan.md](../studio-tests/skills/sprint/sprint-plan.md) |
| S057 | [sprint-status](../.claude/skills/sprint-status/SKILL.md) | sprint | `game-studio-sprint-status` | [sprint-status.md](../studio-tests/skills/sprint/sprint-status.md) |
| S058 | [start](../.claude/skills/start/SKILL.md) | utility | `game-studio-start` | [start.md](../studio-tests/skills/utility/start.md) |
| S059 | [story-done](../.claude/skills/story-done/SKILL.md) | readiness | `game-studio-story-done` | [story-done.md](../studio-tests/skills/readiness/story-done.md) |
| S060 | [story-readiness](../.claude/skills/story-readiness/SKILL.md) | readiness | `game-studio-story-readiness` | [story-readiness.md](../studio-tests/skills/readiness/story-readiness.md) |
| S061 | [team-audio](../.claude/skills/team-audio/SKILL.md) | team | `game-studio-team-audio` | [team-audio.md](../studio-tests/skills/team/team-audio.md) |
| S062 | [team-combat](../.claude/skills/team-combat/SKILL.md) | team | `game-studio-team-combat` | [team-combat.md](../studio-tests/skills/team/team-combat.md) |
| S063 | [team-level](../.claude/skills/team-level/SKILL.md) | team | `game-studio-team-level` | [team-level.md](../studio-tests/skills/team/team-level.md) |
| S064 | [team-live-ops](../.claude/skills/team-live-ops/SKILL.md) | team | `game-studio-team-live-ops` | [team-live-ops.md](../studio-tests/skills/team/team-live-ops.md) |
| S065 | [team-narrative](../.claude/skills/team-narrative/SKILL.md) | team | `game-studio-team-narrative` | [team-narrative.md](../studio-tests/skills/team/team-narrative.md) |
| S066 | [team-polish](../.claude/skills/team-polish/SKILL.md) | team | `game-studio-team-polish` | [team-polish.md](../studio-tests/skills/team/team-polish.md) |
| S067 | [team-qa](../.claude/skills/team-qa/SKILL.md) | team | `game-studio-team-qa` | [team-qa.md](../studio-tests/skills/team/team-qa.md) |
| S068 | [team-release](../.claude/skills/team-release/SKILL.md) | team | `game-studio-team-release` | [team-release.md](../studio-tests/skills/team/team-release.md) |
| S069 | [team-ui](../.claude/skills/team-ui/SKILL.md) | team | `game-studio-team-ui` | [team-ui.md](../studio-tests/skills/team/team-ui.md) |
| S070 | [tech-debt](../.claude/skills/tech-debt/SKILL.md) | analysis | `game-studio-tech-debt` | [tech-debt.md](../studio-tests/skills/analysis/tech-debt.md) |
| S071 | [test-evidence-review](../.claude/skills/test-evidence-review/SKILL.md) | analysis | `game-studio-test-evidence-review` | [test-evidence-review.md](../studio-tests/skills/analysis/test-evidence-review.md) |
| S072 | [test-flakiness](../.claude/skills/test-flakiness/SKILL.md) | analysis | `game-studio-test-flakiness` | [test-flakiness.md](../studio-tests/skills/analysis/test-flakiness.md) |
| S073 | [test-helpers](../.claude/skills/test-helpers/SKILL.md) | utility | `game-studio-test-helpers` | [test-helpers.md](../studio-tests/skills/utility/test-helpers.md) |
| S074 | [test-setup](../.claude/skills/test-setup/SKILL.md) | utility | `game-studio-test-setup` | [test-setup.md](../studio-tests/skills/utility/test-setup.md) |
| S075 | [ux-design](../.claude/skills/ux-design/SKILL.md) | authoring | `game-studio-ux-design` | [ux-design.md](../studio-tests/skills/authoring/ux-design.md) |
| S076 | [ux-review](../.claude/skills/ux-review/SKILL.md) | authoring | `game-studio-ux-review` | [ux-review.md](../studio-tests/skills/authoring/ux-review.md) |
| S077 | [vertical-slice](../.claude/skills/vertical-slice/SKILL.md) | pipeline | `game-studio-vertical-slice` | [vertical-slice.md](../studio-tests/skills/pipeline/vertical-slice.md) |
| S078 | [write-changelog](../.claude/skills/write-changelog/SKILL.md) | sprint | `game-studio-write-changelog` | [write-changelog.md](../studio-tests/skills/sprint/write-changelog.md) |

## Role migration checklist

Each role becomes `.codex/agents/game-studio-<name>.toml`. Preserve role expertise and input/output responsibilities; inherit session model settings by default. Each requires schema validation, a live role smoke scenario, and a check that role instructions are not misrepresented as a separate permission sandbox. The task list uses A001–A049.

| ID | Source role | Spec group | Behavioral specification |
| --- | --- | --- | --- |
| A001 | [accessibility-specialist](../.claude/agents/accessibility-specialist.md) | qa | [accessibility-specialist.md](../studio-tests/agents/qa/accessibility-specialist.md) |
| A002 | [ai-programmer](../.claude/agents/ai-programmer.md) | specialists | [ai-programmer.md](../studio-tests/agents/specialists/ai-programmer.md) |
| A003 | [analytics-engineer](../.claude/agents/analytics-engineer.md) | operations | [analytics-engineer.md](../studio-tests/agents/operations/analytics-engineer.md) |
| A004 | [art-director](../.claude/agents/art-director.md) | directors | [art-director.md](../studio-tests/agents/directors/art-director.md) |
| A005 | [audio-director](../.claude/agents/audio-director.md) | leads | [audio-director.md](../studio-tests/agents/leads/audio-director.md) |
| A006 | [community-manager](../.claude/agents/community-manager.md) | operations | [community-manager.md](../studio-tests/agents/operations/community-manager.md) |
| A007 | [creative-director](../.claude/agents/creative-director.md) | directors | [creative-director.md](../studio-tests/agents/directors/creative-director.md) |
| A008 | [devops-engineer](../.claude/agents/devops-engineer.md) | operations | [devops-engineer.md](../studio-tests/agents/operations/devops-engineer.md) |
| A009 | [economy-designer](../.claude/agents/economy-designer.md) | operations | [economy-designer.md](../studio-tests/agents/operations/economy-designer.md) |
| A010 | [engine-programmer](../.claude/agents/engine-programmer.md) | specialists | [engine-programmer.md](../studio-tests/agents/specialists/engine-programmer.md) |
| A011 | [game-designer](../.claude/agents/game-designer.md) | leads | [game-designer.md](../studio-tests/agents/leads/game-designer.md) |
| A012 | [gameplay-programmer](../.claude/agents/gameplay-programmer.md) | specialists | [gameplay-programmer.md](../studio-tests/agents/specialists/gameplay-programmer.md) |
| A013 | [godot-csharp-specialist](../.claude/agents/godot-csharp-specialist.md) | engine/godot | [godot-csharp-specialist.md](../studio-tests/agents/engine/godot/godot-csharp-specialist.md) |
| A014 | [godot-gdextension-specialist](../.claude/agents/godot-gdextension-specialist.md) | engine/godot | [godot-gdextension-specialist.md](../studio-tests/agents/engine/godot/godot-gdextension-specialist.md) |
| A015 | [godot-gdscript-specialist](../.claude/agents/godot-gdscript-specialist.md) | engine/godot | [godot-gdscript-specialist.md](../studio-tests/agents/engine/godot/godot-gdscript-specialist.md) |
| A016 | [godot-shader-specialist](../.claude/agents/godot-shader-specialist.md) | engine/godot | [godot-shader-specialist.md](../studio-tests/agents/engine/godot/godot-shader-specialist.md) |
| A017 | [godot-specialist](../.claude/agents/godot-specialist.md) | engine/godot | [godot-specialist.md](../studio-tests/agents/engine/godot/godot-specialist.md) |
| A018 | [lead-programmer](../.claude/agents/lead-programmer.md) | leads | [lead-programmer.md](../studio-tests/agents/leads/lead-programmer.md) |
| A019 | [level-designer](../.claude/agents/level-designer.md) | leads | [level-designer.md](../studio-tests/agents/leads/level-designer.md) |
| A020 | [live-ops-designer](../.claude/agents/live-ops-designer.md) | operations | [live-ops-designer.md](../studio-tests/agents/operations/live-ops-designer.md) |
| A021 | [localization-lead](../.claude/agents/localization-lead.md) | operations | [localization-lead.md](../studio-tests/agents/operations/localization-lead.md) |
| A022 | [narrative-director](../.claude/agents/narrative-director.md) | leads | [narrative-director.md](../studio-tests/agents/leads/narrative-director.md) |
| A023 | [network-programmer](../.claude/agents/network-programmer.md) | specialists | [network-programmer.md](../studio-tests/agents/specialists/network-programmer.md) |
| A024 | [performance-analyst](../.claude/agents/performance-analyst.md) | specialists | [performance-analyst.md](../studio-tests/agents/specialists/performance-analyst.md) |
| A025 | [producer](../.claude/agents/producer.md) | directors | [producer.md](../studio-tests/agents/directors/producer.md) |
| A026 | [prototyper](../.claude/agents/prototyper.md) | specialists | [prototyper.md](../studio-tests/agents/specialists/prototyper.md) |
| A027 | [qa-lead](../.claude/agents/qa-lead.md) | leads | [qa-lead.md](../studio-tests/agents/leads/qa-lead.md) |
| A028 | [qa-tester](../.claude/agents/qa-tester.md) | qa | [qa-tester.md](../studio-tests/agents/qa/qa-tester.md) |
| A029 | [release-manager](../.claude/agents/release-manager.md) | operations | [release-manager.md](../studio-tests/agents/operations/release-manager.md) |
| A030 | [security-engineer](../.claude/agents/security-engineer.md) | qa | [security-engineer.md](../studio-tests/agents/qa/security-engineer.md) |
| A031 | [sound-designer](../.claude/agents/sound-designer.md) | specialists | [sound-designer.md](../studio-tests/agents/specialists/sound-designer.md) |
| A032 | [systems-designer](../.claude/agents/systems-designer.md) | leads | [systems-designer.md](../studio-tests/agents/leads/systems-designer.md) |
| A033 | [technical-artist](../.claude/agents/technical-artist.md) | specialists | [technical-artist.md](../studio-tests/agents/specialists/technical-artist.md) |
| A034 | [technical-director](../.claude/agents/technical-director.md) | directors | [technical-director.md](../studio-tests/agents/directors/technical-director.md) |
| A035 | [tools-programmer](../.claude/agents/tools-programmer.md) | specialists | [tools-programmer.md](../studio-tests/agents/specialists/tools-programmer.md) |
| A036 | [ue-blueprint-specialist](../.claude/agents/ue-blueprint-specialist.md) | engine/unreal | [ue-blueprint-specialist.md](../studio-tests/agents/engine/unreal/ue-blueprint-specialist.md) |
| A037 | [ue-gas-specialist](../.claude/agents/ue-gas-specialist.md) | engine/unreal | [ue-gas-specialist.md](../studio-tests/agents/engine/unreal/ue-gas-specialist.md) |
| A038 | [ue-replication-specialist](../.claude/agents/ue-replication-specialist.md) | engine/unreal | [ue-replication-specialist.md](../studio-tests/agents/engine/unreal/ue-replication-specialist.md) |
| A039 | [ue-umg-specialist](../.claude/agents/ue-umg-specialist.md) | engine/unreal | [ue-umg-specialist.md](../studio-tests/agents/engine/unreal/ue-umg-specialist.md) |
| A040 | [ui-programmer](../.claude/agents/ui-programmer.md) | specialists | [ui-programmer.md](../studio-tests/agents/specialists/ui-programmer.md) |
| A041 | [unity-addressables-specialist](../.claude/agents/unity-addressables-specialist.md) | engine/unity | [unity-addressables-specialist.md](../studio-tests/agents/engine/unity/unity-addressables-specialist.md) |
| A042 | [unity-dots-specialist](../.claude/agents/unity-dots-specialist.md) | engine/unity | [unity-dots-specialist.md](../studio-tests/agents/engine/unity/unity-dots-specialist.md) |
| A043 | [unity-shader-specialist](../.claude/agents/unity-shader-specialist.md) | engine/unity | [unity-shader-specialist.md](../studio-tests/agents/engine/unity/unity-shader-specialist.md) |
| A044 | [unity-specialist](../.claude/agents/unity-specialist.md) | engine/unity | [unity-specialist.md](../studio-tests/agents/engine/unity/unity-specialist.md) |
| A045 | [unity-ui-specialist](../.claude/agents/unity-ui-specialist.md) | engine/unity | [unity-ui-specialist.md](../studio-tests/agents/engine/unity/unity-ui-specialist.md) |
| A046 | [unreal-specialist](../.claude/agents/unreal-specialist.md) | engine/unreal | [unreal-specialist.md](../studio-tests/agents/engine/unreal/unreal-specialist.md) |
| A047 | [ux-designer](../.claude/agents/ux-designer.md) | specialists | [ux-designer.md](../studio-tests/agents/specialists/ux-designer.md) |
| A048 | [world-builder](../.claude/agents/world-builder.md) | specialists | [world-builder.md](../studio-tests/agents/specialists/world-builder.md) |
| A049 | [writer](../.claude/agents/writer.md) | specialists | [writer.md](../studio-tests/agents/specialists/writer.md) |

## Hook and helper dispositions

Only registrations in `.claude/settings.json` count as active source bindings. Target behavior is tested through real Codex events in addition to adapter fixtures. All rows remain pending.

| Source | Current registration | Target | Required migration |
| --- | --- | --- | --- |
| [detect-gaps.sh](../.claude/hooks/detect-gaps.sh) | SessionStart | Startup observations | Retain gap detection; do not infer stage or manufacture missing documents. |
| [log-agent-stop.sh](../.claude/hooks/log-agent-stop.sh) | SubagentStop | Agent lifecycle | Adapt real Codex identities/events; preserve incomplete/error outcomes. |
| [log-agent.sh](../.claude/hooks/log-agent.sh) | SubagentStart | Agent lifecycle | Record actual execution and deduplicate repeated events; no invented cost estimates. |
| [log-instructions.sh](../.claude/hooks/log-instructions.sh) | Not registered | Explicit diagnostics | Not registered in current settings; retain useful inspection through doctor rather than adding an automatic hook. |
| [notify.sh](../.claude/hooks/notify.sh) | Notification (permission_prompt/idle_prompt) | Native client feedback | Replace Claude Notification/Windows toast coupling; do not claim an identical Codex event exists. |
| [pre-compact.sh](../.claude/hooks/pre-compact.sh) | PreCompact | Recovery events | Record bounded compaction information; verify Codex event semantics instead of copying the Claude restoration assumption. |
| [session-start.sh](../.claude/hooks/session-start.sh) | SessionStart | Startup/resume | Load concise state from the actual project; use verified context output. |
| [session-stop.sh](../.claude/hooks/session-stop.sh) | Stop | Checkpoint/event persistence | Atomic/idempotent save; no race between coordinator and concurrent hooks; no unconditional continuation loop. |
| [update-check.sh](../.claude/hooks/update-check.sh) | Not registered | Explicit version/upgrade | Not registered in current settings; no network update check on every turn or hook. |
| [validate-agent-artifact.sh](../.claude/hooks/validate-agent-artifact.sh) | SubagentStop | Agent completion checks | Validate expected artifact and provenance; missing output cannot be presented as success. |
| [validate-assets.sh](../.claude/hooks/validate-assets.sh) | PostToolUse (Write/Edit) | Asset validation | Preserve checks in post-operation evidence and explicit check commands. |
| [validate-commit.sh](../.claude/hooks/validate-commit.sh) | PreToolUse (Bash/PowerShell) | Command guard and explicit check | Revalidate command parsing and outputs; do not silently commit or rewrite the user command. |
| [validate-push.sh](../.claude/hooks/validate-push.sh) | PreToolUse (Bash/PowerShell) | Command guard and release check | Preserve relevant prerequisites; a hook is not permission to push. |
| [validate-read.sh](../.claude/hooks/validate-read.sh) | PreToolUse (Read) | Scoped reference reading | Claude Read payload is not universal read interception; use resource helpers and instructions unless host coverage is proven. |
| [validate-registry.sh](../.claude/hooks/validate-registry.sh) | PreToolUse (Write/Edit) | Proposed change validation | Decode Codex patches, all affected paths and the proposed resulting content before applying checks. |
| [validate-skill-change.sh](../.claude/hooks/validate-skill-change.sh) | PostToolUse (Write/Edit) | Skill validation feedback | Use actual new Skill roots and the Codex linter; avoid claiming background tests ran. |
| [validate-write.sh](../.claude/hooks/validate-write.sh) | PreToolUse (Write/Edit) | Proposed change validation | Replace file_path/old_string parsing; test add/edit/delete/rename and shell-write coverage separately. |
| [yaml-helper.sh](../.claude/hooks/yaml-helper.sh) | Not registered | Shared configuration service | Not a registered event handler; port resolution, rigor expansion and override provenance into project-state. |

## Shared scripts and executable resources

“Port” does not require rewriting domain algorithms that already work. Core operations must stop depending on Claude paths or metadata; every retained helper needs packaged-install and declared-platform validation. The CLI wraps execution and evidence without silently weakening upstream checks.

| Source | Responsibility group | Disposition |
| --- | --- | --- |
| [adr-dep-graph.sh](../.claude/scripts/adr-dep-graph.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [adr-status.sh](../.claude/scripts/adr-status.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [agent-check.sh](../.claude/scripts/agent-check.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [artifact-check.sh](../.claude/scripts/artifact-check.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [asset-scan.sh](../.claude/scripts/asset-scan.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [bug-stats.sh](../.claude/scripts/bug-stats.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [code-markers.sh](../.claude/scripts/code-markers.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [compat-inventory.sh](../.claude/scripts/compat-inventory.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [config-set.sh](../.claude/scripts/config-set.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [content-count.sh](../.claude/scripts/content-count.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [cut-apply.sh](../.claude/scripts/cut-apply.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [cut-read.sh](../.claude/scripts/cut-read.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [debt-register.sh](../.claude/scripts/debt-register.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [door-in.sh](../.claude/scripts/door-in.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [engine-row.awk](../.claude/scripts/engine-row.awk) | `host-and-config-adapters` | Replace host/parsing coupling; preserve supported legacy config migration as an explicit command path. |
| [flaky-stats.sh](../.claude/scripts/flaky-stats.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [game-read.sh](../.claude/scripts/game-read.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [gdd-structure-check.sh](../.claude/scripts/gdd-structure-check.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [godot-parse-check.gd](../.claude/scripts/godot-parse-check.gd) | `engine-tests` | Retain engine-specific semantics; wrap execution/timeouts/results with declared dependencies. |
| [hook-input.sh](../.claude/scripts/hook-input.sh) | `host-and-config-adapters` | Replace host/parsing coupling; preserve supported legacy config migration as an explicit command path. |
| [inputs-check.sh](../.claude/scripts/inputs-check.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [itch-zip.sh](../.claude/scripts/itch-zip.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [json-flat.awk](../.claude/scripts/json-flat.awk) | `host-and-config-adapters` | Replace host/parsing coupling; preserve supported legacy config migration as an explicit command path. |
| [md-section.sh](../.claude/scripts/md-section.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [migrate-v1-config.sh](../.claude/scripts/migrate-v1-config.sh) | `host-and-config-adapters` | Replace host/parsing coupling; preserve supported legacy config migration as an explicit command path. |
| [one-shot-check.sh](../.claude/scripts/one-shot-check.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-driver.js](../.claude/scripts/one-shot-driver.js) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-grow.sh](../.claude/scripts/one-shot-grow.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-new.sh](../.claude/scripts/one-shot-new.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-run.sh](../.claude/scripts/one-shot-run.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-share.sh](../.claude/scripts/one-shot-share.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [one-shot-tune.sh](../.claude/scripts/one-shot-tune.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [page-shot.sh](../.claude/scripts/page-shot.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [plan-math.sh](../.claude/scripts/plan-math.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [project-coherence.sh](../.claude/scripts/project-coherence.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [project-state.sh](../.claude/scripts/project-state.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [read-guard.sh](../.claude/scripts/read-guard.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [references-save.sh](../.claude/scripts/references-save.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [registry.sh](../.claude/scripts/registry.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [review-receipts.sh](../.claude/scripts/review-receipts.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [review-scope.sh](../.claude/scripts/review-scope.sh) | `design-records` | Retain capability as a CLI-backed operation or bundled internal helper; preserve registry and review provenance. |
| [rotate-session-state.sh](../.claude/scripts/rotate-session-state.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [session-state.sh](../.claude/scripts/session-state.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [set-stage.sh](../.claude/scripts/set-stage.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [skill-lint.sh](../.claude/scripts/skill-lint.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [story-facts.sh](../.claude/scripts/story-facts.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [story-status.sh](../.claude/scripts/story-status.sh) | `project-state` | Port filesystem/configuration operations to CLI core; preserve precedence and observed state. |
| [test-run.sh](../.claude/scripts/test-run.sh) | `engine-tests` | Retain engine-specific semantics; wrap execution/timeouts/results with declared dependencies. |
| [test-scaffold.sh](../.claude/scripts/test-scaffold.sh) | `engine-tests` | Retain engine-specific semantics; wrap execution/timeouts/results with declared dependencies. |
| [vendor-three.sh](../.claude/scripts/vendor-three.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [web-detect.sh](../.claude/scripts/web-detect.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [web-scaffold.sh](../.claude/scripts/web-scaffold.sh) | `game-operations` | Retain gameplay behavior and evidence contracts; make project root and packaged resource paths explicit. |
| [write-guard.sh](../.claude/scripts/write-guard.sh) | `validation` | Reuse validation intent; rewrite Claude metadata/payload assumptions and expose through check or private validators. |
| [yaml-get.awk](../.claude/scripts/yaml-get.awk) | `host-and-config-adapters` | Replace host/parsing coupling; preserve supported legacy config migration as an explicit command path. |

## Scoped rules

Rules move to `studio/rules/` with an applicability index. Skills load the relevant rules for the actual engine/code paths. Use nested AGENTS guidance only where Codex discovery semantics have been verified; renaming a glob rule does not reproduce automatic loading.

| Source | Applicable work | Required verification |
| --- | --- | --- |
| [agent-memory.md](../.claude/rules/agent-memory.md) | Project role notes and coordinator checkpoints; explicit write ownership. | Positive and negative scope fixture; no unrelated global activation |
| [ai-code.md](../.claude/rules/ai-code.md) | AI/game-agent implementation files selected by the engine layout. | Positive and negative scope fixture; no unrelated global activation |
| [data-files.md](../.claude/rules/data-files.md) | Game configuration/data files; structured parsing and schema checks. | Positive and negative scope fixture; no unrelated global activation |
| [design-docs.md](../.claude/rules/design-docs.md) | Design artifacts and related registries. | Positive and negative scope fixture; no unrelated global activation |
| [engine-code.md](../.claude/rules/engine-code.md) | Engine-specific source and module integration. | Positive and negative scope fixture; no unrelated global activation |
| [gameplay-code.md](../.claude/rules/gameplay-code.md) | Gameplay mechanics and data-driven tuning. | Positive and negative scope fixture; no unrelated global activation |
| [narrative.md](../.claude/rules/narrative.md) | Narrative content and consistency requirements. | Positive and negative scope fixture; no unrelated global activation |
| [network-code.md](../.claude/rules/network-code.md) | Networking and multiplayer code. | Positive and negative scope fixture; no unrelated global activation |
| [prototype-code.md](../.claude/rules/prototype-code.md) | Prototype scope, quality and evidence requirements. | Positive and negative scope fixture; no unrelated global activation |
| [scene-files.md](../.claude/rules/scene-files.md) | Engine scenes and binary/text editing boundaries. | Positive and negative scope fixture; no unrelated global activation |
| [shader-code.md](../.claude/rules/shader-code.md) | Shaders and rendering-specific requirements. | Positive and negative scope fixture; no unrelated global activation |
| [skill-authoring.md](../.claude/rules/skill-authoring.md) | Codex Skill metadata, triggering and reference contracts. | Positive and negative scope fixture; no unrelated global activation |
| [test-standards.md](../.claude/rules/test-standards.md) | Game tests and evidence interpretation. | Positive and negative scope fixture; no unrelated global activation |
| [ui-code.md](../.claude/rules/ui-code.md) | Game UI implementation, usability and accessibility. | Positive and negative scope fixture; no unrelated global activation |

## Remaining repository areas

| Source area | Proposed treatment | Evidence required |
| --- | --- | --- |
| `CLAUDE.md`, `src/CLAUDE.md`, `design/CLAUDE.md`, `docs/CLAUDE.md`, `studio-tests/CLAUDE.md` | Codex root/scoped guidance and explicit references | No literal import assumptions; root/subdirectory/override discovery cases |
| `.claude/settings.json` | Split Codex config, Hooks, instructions and execution-policy guidance | No unsupported settings silently copied; effective configuration inspected |
| `.claude/statusline.sh` | Native client/status-command presentation | Same necessary project facts accessible; cosmetic parity not promised |
| `.claude/docs/` | Shared `studio/docs/` and templates in packaged resources | Reference graph valid outside the checkout |
| `.claude/engines/` | `studio/engines/` | Preserve code/test roots, starter files and engine-specific command semantics |
| `.claude/genres/` | `studio/genres/` | Prototype questions/briefs retain genre information and valid links |
| `docs/engine-reference/` | Retain project engine references; distinguish stale inherited examples from pinned verified versions | Version and source provenance shown |
| `design/registry/`, `docs/registry/`, `docs/architecture/` | Retain game registries and their relationships | Artifact and traceability checks agree |
| `project.yaml`, local override rules | Preserve behavior; add only explicit toolkit integration/version information | Override/rigor and absent-key fixtures |
| `production/session-state/` | Human-readable checkpoint plus bounded event records | Resume, crash, compaction and concurrency fixtures |
| `studio-tests/` | Adapt specs/catalog/rubric to Codex behavior | No obsolete Claude-only requirements or false passing outcomes |
| `README.md`, `CONTRIBUTING.md`, `UPGRADING.md`, `SECURITY.md`, `CHANGELOG.md` | Rewrite active product guidance, retain historical attribution | Clean-install walkthrough and checked commands |
| `.github/`, `.gitignore`, `.gitattributes`, `.worktreeinclude` | Review ownership, release/test setup and generated-file behavior | No accidental upstream notifications, secrets or user runtime files in package |
| `LICENSE` and Git history | Preserve upstream notice/history; explain adaptation | Release archive contains the notice |

## Completion rule

An inventory item is complete only when the corresponding task links its changed files, validation results, and any replacement behavior. Unsupported host semantics must be named, replaced where required, and included in the support matrix. Static conversion or a passing catalog linter alone does not complete a workflow or role migration.
