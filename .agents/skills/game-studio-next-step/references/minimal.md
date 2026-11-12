# Minimal route

Read recovery context first. Run exactly one
`node .game-studio/run.cjs check --kind artifacts --path minimal --json`.
Use [artifact statuses](studio.md#artifact-statuses), without walking studio
phases. Do not re-glob catalog steps or reinterpret `any_of`; implement and
story-done deliberately lack artifact completion checks.

When story routing/counts are needed, resolve `studio/scripts/story-status.mjs`
with the pinned runtime's `resource path ... --json`, then run
`node <returned-path> --project <game-root>` once. It returns direct JSON:
`status`, `qualityAssessed: false`, ordered unfinished `stories` with
`path/status/line/group`, and `counts.complete/total`. Reuse this observation;
do not rerun it, reparse all story Status lines or re-rank rows. Failed or
not_assessed output is a limitation, not zero stories or all work complete.
Reading a selected story's title, Build step or blocker remains appropriate.

## Main path and prerequisites

Choose the first applicable branch:

1. **No engine artifact:** look for `prototypes/*/index.html`.
   - Made game, no confirmed play: next is play it and describe changes in plain
     words. Do not launch it during this orientation.
   - Played game: next is choosing continued iteration or growth through prototype;
     engine setup is a secondary alternative afterward.
   - No prototype and fewer than ten source files: make a small playable game
     via prototype; engine setup is the alternative afterward. Existing GDDs stay
     authoritative: use the whole-game concept and make the brief a build summary.
   - No prototype and ten or more actual source files: configure the engine for
     the existing game instead of starting a replacement prototype.
2. **Engine present, brief missing:** ten or more source files means document the
   existing design into `design/game-brief.md` (the intended reverse-document
   design route), not brainstorm a replacement. With fewer files and nothing
   under `prototypes/`, next is first prototype; brainstorm is the alternative
   for someone without an idea. With a prototype already made, brainstorm at
   minimal creates the one-page brief. Respect current native-engine limitations.
3. **Brief present, stories absent:** a grown game continues one feature per sitting
   via prototype; suggest the first unchecked Features item. Cutting scope is
   secondary. Introduce stories/epics/gates only if requested; explicit stories
   requests select create-stories instead. Otherwise use create-stories without
   an argument: the brief's Features build order needs no epic or sprint. With no
   unchecked Feature and no `thin stand-in`/`later` item under `## Your systems`,
   say the recorded features are built and ask what to add; the intended workflow
   adds the agreed feature to the brief and makes stories. Do not edit it here.
4. **Stories exist:** follow the ordered story route below.

**Explicit feedback takes priority over a generic next action.** A requested
change, love-it or hate-it on a made game goes to prototype with the user's actual
words. The later workflow handles the agreed change/accept-or-undo, Keep record,
or fix/pivot/kill choice. Do not invent a change, kill the game, record feedback
or force engine setup here.

Play clues include the same game's `feel-log.md`, `REPORT.md`, or brief's
`After play:`/nonempty `## Keep`, and the user's actual account. Read the content:
a placeholder, machine-only replay or explicit NOT ASSESSED/unplayed report is
not human play confirmation. Link the existing game without inventing a live URL.

Recognize legacy `production/qa/evidence/grow-*/replay.args` as a growth clue.
Current Codex growth uses `grow.md`, actual root source/project and
reference/copy/typescript/final `report.json` evidence. Read the record and
relevant paths: a copied root, reference screenshot, failed conversion or pending
tests is still growth in progress. Recommend resuming it, not copying over it or
starting a new game. Completed recorded growth supports the feature route, not
a claim of human acceptance or current passing tests.

## Ordered story route

The helper orders IN_REVIEW, IN_PROGRESS, TODO, BLOCKED, then OTHER/NO_STATUS in
preserved file order. Completed stories contribute only to counts. Select the
first row among the first three groups:

- **IN_REVIEW:** work awaits closure; story-done for that exact path.
- **IN_PROGRESS:** dev-story unless the user, applicable checkpoint or relevant
  Git log explicitly says this story's implementation is written; then story-done.
  A same-branch checkpoint whose `Next step` is `$game-studio-story-done <this
  story path>` (or legacy `/story-done <this story path>`) is the source workflow's
  written-work handoff: route to closure without requiring a separate prose claim
  or Git commit. It does not prove acceptance or make the story Complete. A
  different story or mismatched branch does not supply this handoff.
  Inspect a bounded relevant `git log` only if needed. Code presence or unrelated
  commits are insufficient. Never count In Progress as Complete.
- **TODO** (Ready/Not Started): dev-story for that exact path.

For selected TODO or In Progress without written implementation, inspect a
`> **Build step**: deepen — <system>` header. Lowercase the system, drop leading
a/an/the, hyphenate spaces; check `design/gdd/<system>.md`. If absent, recommend
design-system for this one system first: the deeper story needs the owner's
design, not guessed rules. Put the story first under Coming up. With the doc,
continue the story; do not add a design blocker. In Review does not use this detour.

Name blocked stories and actual blockers, never send them to implementation.
If no runnable/closable group remains but BLOCKED/OTHER/NO_STATUS rows remain,
the build order is not done. Name those rows and their raw statuses; read blocked
files for blockers. Next is clear the first unresolved row: resolve its blocker
or agree a recognized Status such as Ready. Do not edit or treat Draft as Ready.

Only positive total with every story Complete/Done means the recorded build
order is done. Offer play, the next feature (prototype for grown games; otherwise
the intended create-stories route), or optional increased rigor when one brief
no longer fits. Retain one primary action. Zero files is not all-complete.

## Size and process suggestions

With stories, read the brief's Features and Skeleton only. Count `[x]`/`[ ]`
Features, excluding cut `[-]`. At least 9 total stories, 9 Features or 4 Skeleton
systems is the source's optional studio-mode signal. Show it only at `0 of M`
complete and once per conversation, naming the count. It changes neither next
story nor settings and blocks nothing. Omit a separate rigor line when shown.

At minimal never require concept, art bible, systems map, general GDDs, epics,
sprints, gates or sprint close-out (smoke/team QA/retrospective). Mention them only
for explicit requests; a selected deepen story's one system design is the named
exception. Finish with [output.md](output.md).
