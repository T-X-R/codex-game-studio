# Hand off the next useful work

After the report and any authorized stage update, offer a concise next-step
choice appropriate to the user's goal, including stopping here. A choice is not
permission to publish or silently fix gate findings. Reuse a previously chosen
follow-up within scope. Verify installed Skills/roles before invoking them;
label unavailable destinations and keep their evidence requirements open.

## Minimal workflow

Use the observed `paths.minimal` route, not phase-ladder menus. Offer the first
incomplete task: engine setup, brief, stories, then the next story in Build order.
When a meaningful game already exists in the resolved code root but its brief is
missing, the brief task is `$game-studio-reverse-document design` for that root;
for an empty/new project it is `$game-studio-brainstorm`. A generated starter or
unknown code root is not proof of an existing game. Do not infer completion of
NO_CHECK implementation/story-close rows; inspect actual story state and evidence.
After stories, use `$game-studio-dev-story` and `$game-studio-story-done` as available.

## Standard/full phase handoffs

- Systems Design target: `$game-studio-map-systems` if no systems index; otherwise
  `$game-studio-design-system` for the first system in its design order. Offer
  revisiting the concept or stopping as alternatives.
- Technical Setup target: `$game-studio-create-architecture` for the master
  blueprint and ADR work plan before `$game-studio-architecture-decision`.
  Resolve the engine with `$game-studio-setup-engine` first if still unset.
- Pre-Production target: generate a missing control manifest from Accepted ADRs
  with `$game-studio-create-control-manifest`; recommend validating the vertical
  slice before committing detailed epics/stories. Then playtest and document it,
  author outstanding key-screen UX, create Foundation then Core epics, create
  each epic's stories and plan the sprint. A skipped slice remains recommended,
  not an invented hard requirement; unplayed or failed built slices retain the
  gate's distinct outcomes. More ADR work or stopping are valid choices.
- Production target: next ready story, sprint plan or story-readiness work.
- Polish target: profiling, playtesting or a full smoke check as findings warrant.
- Release target: launch checklist and coordinated release preparation. Passing
  this gate is not authorization to publish a build, repository or release.

## Remediation routing

Choose from the actual findings rather than running every workflow:

| Missing or failing work | Intended destination |
| --- | --- |
| Concept, systems map, small design change | brainstorm, map-systems, quick-design |
| Missing design for existing code | reverse-document or available Game Designer |
| Art bible / asset specifications | art-bible / asset-spec for the relevant entity or system |
| Key-screen UX / review / accessibility / patterns | ux-design (screen, accessibility or patterns), ux-review; team-ui for an explicitly requested wider pipeline |
| Individual or cross-GDD review | design-review; review-all-gdds after individual approval; fix reported consistency findings before a later review |
| Architecture / ADRs / engine compatibility | create-architecture, architecture-decision, or a targeted manual correction |
| Control manifest | create-control-manifest from Accepted ADRs |
| Foundation/Core epics, stories, readiness | create-epics in layer order, create-stories per epic, story-readiness |
| Framework, test failures, sprint QA plan | test-setup; available Lead Programmer or QA Tester; qa-plan sprint |
| Play evidence | playtest-report; additional sessions improve confidence beyond the applicable minimum |
| Sprint snapshot / unknown performance | sprint-status / perf-profile |
| Localization / security / launch | localize; security-audit (quick after fixes); launch-checklist |

Skill names in the table use the `game-studio-` prefix. Do not present an
unimplemented destination as callable. The gate itself does not perform these
remediations or automatically rerun after them.

Difficulty curve and player journey have no dedicated writing Skill. Their
artifacts are hand-authored at `design/difficulty-curve.md` and
`design/player-journey.md` using the packaged `studio/templates/difficulty-curve.md`
and `studio/templates/player-journey.md` resources. Resolve them with `resource
path` only when needed. Quick-design may help reason about a curve but writes a
quick-spec elsewhere; UX design reads the journey and does not create it.
