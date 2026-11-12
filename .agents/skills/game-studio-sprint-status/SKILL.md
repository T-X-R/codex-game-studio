---
name: game-studio-sprint-status
description: Report a concise read-only sprint snapshot with progress, burndown, blockers and stale work, or minimal build-order progress when no sprint exists. Use for “How is the sprint going?” and status requests, not sprint planning or a quality review.
---

# Sprint status

Report current recorded facts and at most one concrete next action. Do not write
files, update statuses, propose scope cuts, run tests, invoke gates, spawn agents
or ask permission to save a report. A recorded completion is not test or play
acceptance. Full review mode does not change this read-only workflow.

## 1. Resolve scope

From the game root, use the pinned runtime:

```sh
node .game-studio/run.cjs config get modes.workflow --json
node .game-studio/run.cjs config get modes.story_granularity --json
```

Read each `data.settings` value and source. Do not resolve review mode or invent
configuration after a failed read. Grain is feature-sized at coarse, task-sized
at balanced and acceptance-criterion-sized at fine; report the existing entries
at that grain, without splitting or re-estimating them.

With a sprint number, find its actual file under `production/sprints/`, accepting
three-, two- or unpadded forms such as sprint-003.md, sprint-03.md and sprint-3.md.
Do not substitute another sprint when the requested one is missing. If multiple
files represent that number, name the ambiguity. Without a number, select the
most recently modified sprint file and report which one; do not infer recency
from the largest number alone. A tied current selection stays explicit.

No sprint files: at minimal use [build-order.md](references/build-order.md) and
stop. At standard/full report “No sprint files found” and the intended next
action of creating a sprint plan, then stop without a table or burndown verdict.
Do not turn an unreadable directory into “no sprint.”

With a selected sprint, read it completely: number, goal, start/end and every
story/task's title, path, priority, owner and estimate. Continue with
[sprint.md](references/sprint.md).

## 2. Keep recommendations executable and bounded

Before displaying a Skill invocation, verify that its actual frontmatter name
is installed or explicitly exposed by the host. Otherwise describe the required
action and the missing capability. Preserve the intended story-close, implement,
create-story, replan or readiness outcome; do not silently substitute a different
installed workflow. Never execute the recommendation here.

Keep the snapshot brief: normally under 30 lines, aiming below 50 when tables
need more space; include every sprint entry even when that exceeds the target.
For sprint snapshots, required sections and tables take priority over the soft
line target: shorten cell text rather than merging sections or replacing the
Attention Needed table with prose. Minimal build-order output stays below 15 lines. These are observations, not a
sprint review, release approval or an instruction to change project scope.
