# Read the selected sprint

## Status authority

Check `production/sprint-status.yaml` first. When it describes the selected sprint,
its sprint/goal/start/end and each story's status, priority, owner and blocker
are authoritative; do not scan Markdown to override them. Preserve all actual
entries and paths. The producer's schema uses `stories` rows with `id`, `name`,
`file`, `priority`, `status`, `owner`, `estimate_days` and `blocker`. Priorities
`must-have`, `should-have`, `nice-to-have` correspond to Must Have, Should Have
and Nice to Have in the report.

Map done to complete, in-progress to in progress, blocked to blocked, backlog
and ready-for-dev to not started. Review remains In Review, not done. Keep
unknown values explicit. Invalid YAML or a different sprint number is unavailable
status evidence for this sprint; do not present another sprint's data as this one
or silently replace an unreadable authoritative record with Markdown guesses.

Only when YAML is absent, use the selected plan's entries: read referenced story
files and their explicit case-insensitive DONE, COMPLETE, IN PROGRESS, BLOCKED,
NOT STARTED markers, or the marker beside an inline task. No marker means NOT
STARTED; a missing referenced file means MISSING. Use contextual status markers,
not an unrelated “done” in prose. Keep Ready as not started and In Review unfinished.
Add the warning that no sprint-status.yaml was found and status was inferred from
Markdown; generating it belongs to sprint-plan update, never to this snapshot.

Check existence of referenced paths even with YAML, without replacing YAML status.
Report missing file coverage separately. A quick name match in the actual code
root may be an implementation hint only; skip the optional scan rather than
assuming every engine uses src/. Do not do a deep code audit.

## Dates and stale work

Use today's actual calendar date (or the user's explicit as-of date), stating it.
Use calendar-day differences, not inclusive-day counts: total = end − start;
elapsed = today − start; remaining = end − today; consumed = elapsed/total × 100.
Keep an overdue sprint overdue rather than silently clamping it to on time.
Missing dates skip burndown with “Sprint dates not found”; invalid or nonpositive
intervals stay unknown with the reason, never divide by zero.

For IN PROGRESS work, retrieve all date fields with **one search across the story
set**, not one full file read per story. Accept Markdown wrappers and these field
names with a pattern such as:

```text
\*{0,2}(Last Updated|Updated|last-updated|updated_at)\*{0,2}[[:space:]]*:
```

This includes `> **Last Updated**: ...`. Match actual paths back to the selected
sprint. No match means never stamped/no timestamp, not stale. Inline tasks have
no story timestamp; malformed, conflicting or future dates are concerns, not
invented ages. Do not use session-state dates or file mtime as story updates.

Age strictly **greater than 4 calendar days** is STALE; exactly 4 is not. Preserve
IN PROGRESS status with a stale annotation, not BLOCKED. Each stale story keeps
its own date and age. List stale stories and timestamp concerns in Attention
Needed; omit that section only when neither exists. A missing date is reported
as “no timestamp — cannot check staleness”; inline tasks as “inline task — cannot
check staleness.”

## Burndown and flags

Count complete, in progress, blocked and not started (including MISSING) entries;
retain In Review/unknown counts so nothing disappears. Completion is complete /
total × 100, using unweighted entry counts, not estimates. Zero total is unknown
progress, not all complete. Calculate gap = consumed % − completion %:

- gap ≤ 10 percentage points → **On Track**, including ahead of schedule;
- 10 < gap ≤ 25 → **At Risk**;
- gap > 25 → **Behind**.

Without valid dates, burndown is unknown; report stale risks separately. With a
valid burndown, any stale IN PROGRESS story raises On Track to at least At Risk,
never lowers Behind. Name the stale count and each story's own age, e.g. “At Risk
— 2 stale stories: Dash (6 days), Parry (9 days).” No date is not a stale finding.

Before the table, display applicable flags:

- **SPRINT AT RISK** when blocked or not-started Must Haves remain with strictly
  less than 40% of time remaining. Count/name them and the time percentage;
  replanning is the one recommended action. MISSING counts as not started.
- **All Must Haves complete** when at least one exists and all are done. The team
  can pull Should Have work; this is not sprint completion or test acceptance.
- **Missing story files**: count the actual referenced paths that do not exist;
  story-readiness is the intended coverage check if it is the selected next action.

At most one concrete recommendation overall: combine flags as observations and
choose the most urgent supported action. Do not issue separate replan, readiness
and extra-work commands in flags, warnings and the final recommendation.

## Snapshot shape

Use the source's section structure below. Only the applicable critical,
completion and missing-file flags go above the status table; give the burndown
verdict in its own section after the table, not as a separate opening summary.

```markdown
[Applicable fast flags, without additional assigned recommendations]

## Sprint [N] Status — [as-of date]
Selected plan: [actual path]
**Sprint Goal**: [goal]
**Days Remaining**: [N] of [total] ([percent] time consumed)

### Progress: [complete/total] tasks ([percent])
| Story / Task | Priority | Status | Owner | Blocker |
|---|---|---|---|---|
[Every actual entry]

### Attention Needed
| Story / Task | Status | Last Updated | Days Stale | Note |
|---|---|---|---|---|
[Stale IN PROGRESS stories and timestamp concerns; omit section if none]

### Burndown: [On Track / At Risk / Behind / unknown]
[Reason, including each stale story's own age when it escalates the verdict.
When On Track, note any eligible Should Have work the team could optionally pull;
this opportunity is not a second assigned recommendation.]

### Must-Haves at Risk
[Must Haves BLOCKED or NOT STARTED with <40% time remaining; otherwise None]

### Emerging Risks
[Other notable risks; omit section when none]

### Recommendation
[One action, or Sprint is on track — no action needed.]
```

The Must-Haves at Risk section uses the critical flag's exact condition; a stale
IN PROGRESS story belongs in Attention Needed (and its burndown explanation),
not in that narrower list merely because it is stale. Keep all actual status
rows, even when their count exceeds the normal line target. If required evidence
is unavailable, identify the unknown assessment; partial observations cannot
become an unqualified On Track verdict. No writes, gates or reviewers.
