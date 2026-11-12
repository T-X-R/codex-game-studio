# Codex Brainstorm acceptance

Source contract: `studio-tests/skills/utility/brainstorm.md` plus the retained
Brainstorm entrypoint and full-concept reference. Target:
`.agents/skills/game-studio-brainstorm/SKILL.md`. Catalog S008 stays partial until
all source cases, the following extensions and both native hosts have evidence.

## Preserved domain behavior and adapted mechanics

| Source requirement | Codex acceptance |
| --- | --- |
| Branch on effective workflow before loading the full flow | Read pinned CLI config with provenance; minimal does not load the full reference, full template or gates |
| Minimal 2–3 one-liners and a creative pick | Native positive trigger proposes that bounded set and waits; no unsolicited brief/build |
| Standard/full discovery and three concept cards | Preserve emotional goals, tastes, timeline/dev experience; three distinct nine-field cards; reuse supplied decisions |
| Concept selection in every automation mode | A new direction always needs a user selection; a previously explicit selection is reused, never fabricated or re-asked |
| Brief and full concept artifact tiers | Minimal uses game-brief.md only when formalization is requested or engine workflow needs it; standard/full uses game-concept.md |
| Exact user words, Avoid/Keep, feature cap, uncertainty labels | Actual saved brief preserves quotes/exclusions and prior Keep, keeps <=7 agreed features, marks inferred/delegated fields; unresolved cuts stay with the user |
| Four gates at three phase boundaries | Native CD/AD reviews after pillars, TD before scope tiers, PR after tiers; mode-specific named skips; full-mode missing roles remain NOT ASSESSED |
| Gate verdict and feedback handling | Preserve source REJECT/CONCERNS sequencing, visual choice, HIGH RISK/scope alternatives and missing-input reruns; no fabricated independent approval |
| Write permission loops and fixed Skill model | Replace with effective guided/collaborative/autonomous policy and inherited host model; reuse authorized writes and build scope |
| Engine selection and market claims | Reuse an explicit engine preference, otherwise ask instead of choosing; researched/user-supplied source or "not researched" for every market assertion |
| Handoffs | Preserve domain order, identify unavailable Skills, avoid unsolicited build; no artificial retyping to change a Skill's model |

Source case 7 includes an explicit write answer, while the source entrypoint's
no-engine fast path writes nothing unless formalization is requested. Test these
as separate branches: concept-only pick versus explicitly requested brief. Do not
collapse them into a single presumed write permission.

## Native scenario matrix

Each case records client/version, OS/runtime/package versions, installed Skill
and reference hashes, input files/settings, actual trace, changed/preserved files,
assertions and PASS/FAIL/PARTIAL/NOT ASSESSED. A missing host or unrun interaction
is NOT ASSESSED. Source fixture feedback is synthetic test input, not human play.

1. Natural positive trigger: a new calm lighthouse game-jam hint, no concept pick.
   Minimal/Web; observe installed Skill read, 2–3 one-line options and one pick
   question. No writes/build/delegation/full-flow loading.
2. Negative trigger: an existing game bug report or a read-only function review.
   Do not invoke ideation or read this Skill merely because the project is a game.
3. Minimal selected concept with explicit brief authorization: save a one-page
   brief preserving exact supplied wording, no-combat/no-timer exclusions,
   requested fields and feature scope; no repeated question about agreed writes.
   Game quotes and scope must exclude tooling paths and execution-only permissions.
4. Resume: existing brief with In your words and Keep. Append new user language,
   preserve existing feedback and unrelated content, show affected fields, never
   silently erase exclusions or expand scope. Include >7-feature pushback.
5. Concept-only pick, engine unset/Web: no brief or build; one prototype handoff.
   Existing non-Web engine: preserve engine choice, stories -> implementation
   next task; no invented available command or unsolicited engine/browser switch.
6. Standard/solo with supplied choices: actual full concept contains all template
   domains, four named solo skips, visual anchor and internally matching full
   vision/scope timeline. Market claims are sourced or marked not researched.
   No director invocation, minimal brief or game code.
7. Standard/lean and one-run review override: four correctly named skips,
   persistent config unchanged; depth follows docs.density rather than tier alone.
8. Full review: real four native role selections, phase order and independent
   pillar/visual reviews; APPROVE, REJECT, CONCERNS, NOT ASSESSED, HIGH RISK,
   OPTIMISTIC and UNREALISTIC paths with actual user decisions. Missing roles are
   an explicit unresolved dependency, never a substitute self-review or solo pass.
9. Guided reuse, collaborative draft approval, autonomous creative/engine choice
   boundaries; cancellation/dismissal is not consent. Fresh-direction and combine
   loops preserve rejected directions and resume from the right phase.
10. Root and subdirectory discovery in CLI and desktop, missing runtime/config,
    interrupted draft recovery and clear limits on durable versus unsaved state.

## Verification and status

Static checks: canonical metadata/resources, installed content check and packed
byte identity for entrypoint/references/templates/gates. Static success does not
satisfy any native interaction, director gate or human acceptance assertion.
Evaluate actual artifacts and traces against the matrix and original eight cases;
keep missing director roles and desktop coverage open. No artifact is evidence of
an engine build, playable prototype, market research or publication approval.

The opt-in CLI fixture is `node toolkit/test/brainstorm-host.mjs <case>` after a
maintainer build. Cases are `pick`, `brief`, `negative`, `standard-solo`,
`full-missing` and `full-review`. The missing-role case removes only the four
director role files from the disposable workspace before the snapshot; the full
review case retains them and authorizes independent read-only director tasks.
It uses the existing Codex login, a fresh packed installation and
a temporary trusted-project profile removed on exit; it does not trust Hooks or
pin a model. Run it only within authorized live-host testing scope. Exit 3 means
execution finished but semantic review is still required; it is not a test pass.
Review the emitted directory's trace, artifact, hashes and report. The fixture
does not exercise interactive choices, resume, other automation modes or desktop.
Full review allows 15 minutes for four native reviews and concept drafting;
timeout is a failed/incomplete run, never grounds to skip a required review.
