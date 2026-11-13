# Codex acceptance: sprint status (S057)

Source: `.claude/skills/sprint-status/SKILL.md`, all six phases and the seven
retained cases in `studio-tests/skills/sprint/sprint-status.md`; YAML schema from
`.claude/skills/sprint-plan/SKILL.md` Phase 3. The source files remain unchanged.
Status: partial implementation. All 26 defined CLI scenarios have selected
passes in [33 retained runs](../../../docs/evidence/sprint-status-skill-2026-11-12.json);
seven failures remain recorded. Broader source and desktop acceptance stay open.

## Migration contract

- Native Skill metadata replaces Claude allowed-tools/model/injected Bash; inherit
  Codex model and permissions. Read-only behavior must be observed, not asserted
  from metadata. No role, director gate, test execution or permission prompt.
- Two real pinned config queries resolve workflow and granularity with provenance;
  review mode is not a requested key and cannot add gates. Grain remains the
  recorded feature/task/AC unit; no automatic decomposition or weighted burn.
- Padded explicit sprint selection and mtime-selected current sprint; report the
  selected path. Missing/ambiguous requested selection does not change the request.
- No files: minimal uses the pinned story observer once with exact priority and
  counts; standard/full returns intended sprint-plan new outcome and stops.
- YAML is authoritative when applicable; Markdown fallback only if absent.
  Selected-sprint mismatch, malformed YAML, unknown states and missing paths remain
  explicit. Current YAML must never impersonate a requested historical sprint.
- All sprint entries appear in the table. Calendar-day date differences, unweighted
  completion, exact 10/25 percentage-point boundaries and strictly <40% remaining.
  Exactly four days is not stale; >4 is. One timestamp search accepts Markdown field
  wrappers and all four source labels; no timestamp, inline, invalid/future dates
  are concerns rather than invented ages. Each stale row retains its own age.
- On Track is escalated by stale work; Behind never improves. No/invalid dates keep
  burndown unknown. All-Must-Haves flag requires a nonempty complete set.
- Critical/completion/missing flags precede the table; table precedes verdict;
  at most one assigned recommendation across output. Minimal all-done's three
  directions are alternatives, preserving the source branch without three tasks.
- Installed Skill checks preserve intended actions when sprint-plan/dev-story/
  story-done/create-stories/readiness are absent. Never manufacture invocations.
- Whole workspace files remain byte-identical; no checkpoint/config/status writes.

## Source conflicts resolved explicitly

The source intro says under 30 lines but Phase 5 aims under 50 and forbids table
truncation: all entries take precedence over the approximate sprint line target.
Required report sections and tables also take precedence over that soft target;
shorten cell text instead of merging sections or replacing Attention Needed
with prose. Minimal's separate under-15-line output remains. The stale escalation prose says
“4+” while the actual rule and cases say “more than 4”; the strict >4 rule governs.
Multiple flag examples contain separate recommendations, but the final protocol
allows at most one: retain all facts and select one action. Source authority cannot
justify reporting a different sprint when a historical number was requested.
None of these adaptations removes a source branch or lowers a failed assertion.

## Retained behavioral cases

| Case | Actual fixture / expected observation |
| --- | --- |
| 1 mixed | 20-day sprint, 13 elapsed; 3/6 done, two recent in progress, blocked Must Have: 50% vs 65%, At Risk, critical at 35% remaining, all six rows/blocker. |
| 2 complete | 5/5 done, nonempty three Must Haves; 50% elapsed, On Track, completion flag, no Attention section, one/no recommendation. |
| 3 no-sprint | Explicit standard workflow, absent sprint folder: no-sprint message and new-plan outcome only. |
| 4 stale | 50% done/time, ages 6 and 3: only six-day story STALE, own age shown, At Risk escalation, one timestamp search. |
| 5 no-gate | Full review mode with normal sprint: no review-mode query/gates/writes/prompts. |
| 6 minimal-route | Default workflow, one done then In Review, In Progress, Ready; report 1/4, review story first regardless of filename. |
| 7 minimal-blocked | Two done plus blocked and Draft; no Next/not done, actual blocker and raw Draft status, one action. |

## Additional source and boundary cases

- Minimal all done, no stories, unknown/no status only, failed helper; no sprint
  table/burndown or false all-complete. No uninstalled Skill invocation.
- All Must Haves complete while Should Have entries remain: completion flag and
  one optional pull-backlog recommendation without calling the entire sprint done.
- Markdown linked/inline/missing tasks and warning; explicit padded sprint; mtime
  selection with a higher-numbered older plan; no/invalid dates and zero entries.
- 10/25 point gap equality; 40% time remaining equality; stale ages 4/5 and two
  different stale ages; all timestamp labels/wrappers; missing/inline timestamps.
- YAML versus Markdown conflict; YAML sprint mismatch/malformed input; In Review
  and unknown states never counted complete. Missing paths remain independent of
  YAML status. More than 50 output rows are preserved.
- Negative activation: a request to replan/change scope belongs to planning, not
  this read-only snapshot. Explicit invocation still stays inside requested scope.
- Missing runtime, project-subdirectory entry and both Codex desktop/CLI hosts.

## Evidence rules

Use fresh installed/restored Unicode-path projects with real dates recorded by
fixture metadata. Natural prompts contain no expected verdict or routing answer.
Keep raw input, package and resource hashes, actual tool calls/trace identity,
whole before/after snapshots and final output. Native zero exit is not acceptance.
Record failures and unchanged-input fixes separately; a narrowed scope never
counts as full source migration. No row is verified until its required coverage
and both-host evidence are demonstrated.
