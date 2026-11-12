# Checkpoints and recovery

Current source builds provide `checkpoint show` and `checkpoint save`. These are
unreleased additions; the `v0.1.0-alpha.0` archive does not include them. Automatic
Stop/compaction hook integration remains unverified and is not installed.

The coordinator owns `production/session-state/active.md`. Keep a concise
CHECKPOINT region for recovery and longer narrative notes outside it. Saves
replace only the region body, preserving surrounding history and existing line
endings. A legacy file with no markers is retained when a region is inserted;
incomplete or duplicated markers require repair rather than a guessed overwrite.

```bash
node .game-studio/run.cjs checkpoint show --json
node .game-studio/run.cjs checkpoint save --input production/checkpoint-draft.md --expect-hash missing --dry-run
node .game-studio/run.cjs checkpoint save --input production/checkpoint-draft.md --expect-hash missing
```

Use `missing` only when no checkpoint exists. For an existing record, use the
exact `data.sha256` returned by `checkpoint show`. The draft is a project-relative
Markdown file, for example:

```markdown
**Updated:** 2026-11-12
**Branch:** `game/jump-buffer`
**Stage:** Production
**Current task:** Add jump buffering to src/player.js
**Next step:** Replay the late-jump scenario and compare landing state
**Blocked on:** nothing
**Constraints:** Preserve keyboard controls and the 60 Hz simulation
**Decisions:** Buffer input for 100 ms
**Files in progress:** src/player.js, tests/player.test.js
**Evidence:** tests/player.test.js passes; human play review is still pending
**Open questions:** Does the new timing feel too forgiving?
```

The CLI records supplied observations; it does not certify the statements in
the draft. On resume, inspect the referenced files and evidence, compare current
Git state and rerun relevant checks. A checkpoint cannot prove a preview server
or a subagent process survived. `checkpoint show` observes Git branch, commit
and dirty state and warns when the recorded branch differs. Missing Git is
reported as not assessed. The preview is capped at 25 lines and 3000 characters;
read `active.md` directly for longer records and narrative. Keep essential
next actions near the beginning.

Save plans check the whole previous file, including narrative, before writing.
They use the same lock, journal, rollback and recovery mechanism as installation.
`game-studio recover --project . --dry-run` inspects interrupted writes; applying
recovery refuses later user edits. Detach preserves checkpoints and evidence.

Each changed checkpoint creates one separate immutable record in
`production/session-logs/events/`. For lifecycle retries, supply the same
`--event-id` and the original input/hash. Reusing an ID for different content is
a conflict; retrying a completed event never rewinds a newer checkpoint. Without
an explicit ID, the operation's input/hash identifies it. An unchanged checkpoint
creates no additional event. These records describe checkpoint saves only; they
do not claim a host hook or a role actually ran.
