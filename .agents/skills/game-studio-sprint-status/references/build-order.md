# Minimal without sprint files

Resolve `studio/scripts/story-status.mjs` through the pinned runtime's
`resource path ... --json`, then run `node <returned-path> --project <game-root>`
once. The result is direct JSON with `status`, `qualityAssessed:false`, ordered
unfinished `stories` and `counts.complete/total`. A helper failure is not zero
stories or all-complete. Reuse this observation; do not rescan Status lines,
rerank files or run it again. Reading selected titles/blockers remains appropriate.

Report `Build order: N of M stories complete`; only Complete/Done count. Select
**Next** from the first IN_REVIEW, IN_PROGRESS or TODO row, in the helper's order:

- IN_REVIEW → close this exact story through the intended story-done workflow.
- IN_PROGRESS or TODO → continue/implement this exact story through dev-story.

In Review is unfinished, even though its implementation is written. Name blocked
stories with actual blockers, usually the `BLOCKED:` note in their files; they
are never Next. This status snapshot does not add next-step's separate checkpoint
or deepen-design routing.

If no runnable/closable row remains but BLOCKED, OTHER or NO_STATUS rows exist,
there is **no Next** and the build order is **not done**. Name all blocked rows
with their blockers and the other rows with their raw status or missing status.
Recommend only resolving the first blocker, or otherwise finishing the first
Draft/unstatused story and agreeing a Ready status. Do not change it yourself.

A positive total with every story Complete/Done means `Build order done: M of M
stories complete.` Offer three possible directions without executing/selecting
all three: play the build, add the next stories from the brief, or consider
raising rigor if one brief no longer fits. Distinguish alternatives from multiple
assigned recommendations. Zero stories means “No stories yet”; the intended
next action is create-stories from the brief's build order.

Keep output under 15 lines, grouping blocker/status observations if needed without
losing named unfinished stories. No sprint table, burndown, gate or sprint-plan
requirement at this branch. Check actual Skill availability before showing any
invocation; an unavailable action remains a capability gap, not a different next.
