---
name: game-studio-story-done
description: Verify a finished game story against its criteria, retained evidence and design, then close it and synchronize its records when authorized. Use when a story is done, finished or ready to close; this workflow does not implement fixes or execute tests.
---

# Verify and close one story

Assess one story; keep the verification verdict separate from whether it was
closed. Inspect actual artifacts and use actual human answers. Do not run tests,
launch a game, capture replacement evidence, implement fixes or edit design,
ADRs, source code or tests here. A test file's presence is not a passing run.

Read applicable AGENTS.md. Reuse the user's authorization: “verify and close this
story if it passes” covers the ordinary close and applicable companion records.
Show the complete report and concrete write set before executing that scope;
do not ask again merely because a file is new. A verification-only request does
not authorize closure; an explicit read-only request also forbids checkpoint,
draft and log writes. A role's approval never authorizes closure. Closing despite
known blockers or unknowns requires an actual acceptance of those named risks.
Previously settled choices remain settled for unchanged work; unanswered human
observations, own calls or newly raised concerns cannot be inferred from guided
automation or silence. Use the available question mechanism, or numbered options
and wait. Empty/dismissed input is not an answer.

Keep an eight-phase checklist: story/policy; governing requirements; criteria;
evidence; deviations/own calls; reviews; report/close; next action/checkpoint.
Only load the three references on the branches linked below.

## Phase 1: Story, facts and policy

Accept `[story-path] [--review full|lean|solo]`; remove the valid review pair
before interpreting the remaining text as one path, including spaces. An explicit
story named in the request has priority. Otherwise inspect `checkpoint show
--json` through the pinned runtime below: use Current task only when it names a
real story and its branch/context still applies. Else collect story-facts `--all`
and select IN_REVIEW/IN_PROGRESS. Multiple candidates: ask which; none: ask for
the path. No story files under production/epics/: stop with the searched path and
story-creation action, with epic creation first at standard/full when absent.
Do not choose a different story merely because the selected one is unreadable.

From the game root use its restored pinned runtime:

```sh
node .game-studio/run.cjs config get --json
node .game-studio/run.cjs config get review_gate --json
node .game-studio/run.cjs config get gate_level --json
node .game-studio/run.cjs config get engine_row --json
node .game-studio/run.cjs checkpoint show --json
```

Read `data.settings[KEY].value`, its source and warnings. Resolve automation,
always-ask categories, workflow, QA level and review mode independently. Per-run
`--review` changes reviewMode/skillGates only, never shared policy. Invalid or
unreadable settings are unassessed, not permissive defaults.

Resolve shared scripts with `node .game-studio/run.cjs resource path <resource>
--json`; use the actual returned `data.path`, not an assumed installation path:

- `studio/scripts/story-facts.mjs`: `node <path> --project . <story-path>`;
  `--all` for selection and same-epic completion ownership when needed.
- `studio/scripts/md-section.mjs`: `node <path> --project . list <file>`;
  `extract <file> <heading> [--body]`; `status <file> [heading...]`.
- `studio/scripts/adr-status.mjs`: `node <path> --project . <ADR-ID-or-path>...`.
- `studio/scripts/registry.mjs`: `node <path> --project . get <TR-ID>...`.

These return JSON observations, never quality verdicts. Story-facts testEvidence
is its section's Status, not the evidence path. Preserve missing-path/read/layout
diagnostics; never bypass an unsafe-path refusal with another reader. Read the
selected story in full once, including actual criteria, Test Evidence, Files,
Out of Scope and prior Completion Notes. Do not close an already Complete story
again or duplicate its notes; report existing closure unless a repair/reopen is
specifically requested.

Resolve the story's workflow with `config get modes.workflow --system <id> --json`.
The system is the GDD filename stem; only when no GDD path exists may the TR-ID's
system supply it. With neither a GDD path nor a TR-ID, use the project workflow
(`config get modes.workflow --json`) without --system; do not derive a system
from the story title, filename or brief feature. Conflicting GDD/TR identities
remain unresolved, not a convenient tier choice.
Read the full bounded CHECKPOINT region when needed: `checkpoint show`'s preview
can truncate and its fields omit Own calls and Same-seed run. Those claims apply
only to this story and verified branch/context; do not substitute another task's
run. Relevant actual answers in this conversation need not be asked again.

| Check | QA minimal | QA standard | QA full |
| --- | --- | --- | --- |
| Logic/Integration tests | waived | required | required |
| Config/Data smoke report | waived | required, default advisory | required, default blocking |
| UI/Visual retained screenshots | required | required | required |
| UNTESTED criteria escalate | never | more than half block | any block |

Use gate_level's logic/integration/visual/ui/config level and source. At QA full,
Config's default advisory becomes blocking; explicit testing.strict.config:false
stays advisory. Other explicit per-type false values make evidence gaps advisory.
A waived test requirement does not waive criteria verification or visual evidence.

## Phase 2: Governing requirements by workflow

Read GDD and ADR documents by named section with md-section, not whole documents.
Its extract includes nested sections, returns 3 for absent heading and 4 for
ambiguous heading. A duplicate requires the real level/title, never a guessed
first match. This reader implements no replace/insert/set-field commands.

- **Full:** get each exact current TR entry and its requirement text, including
  all cited IDs; never use a stale quotation in the story or a prefix match.
  Read the GDD Acceptance Criteria and Detailed Design; only if the latter is
  absent try Detailed Rules. Observe every governing ADR's status, then read its
  Decision and Consequences. Duplicate IDs/layout errors remain visible.
- **Standard:** the same GDD sections; use ADR-status to identify critical ADRs
  (Foundation or absent Layer), then their Decision and Consequences. Other ADR
  sections are not required solely to inflate this tier.
- **Minimal:** the story's criteria are the spec; no general GDD/ADR prerequisite.
  Read the relevant brief/design passage later when checking own calls.

At every tier inspect the control manifest's Manifest Version line if it exists.
Read applicable forbidden-rule sections only for the checks that need them.
Missing/unreadable required requirements or decisions leave their checks
unassessed; they never establish agreement with the implementation.

## Phase 3: Every acceptance criterion

For each criterion distinguish its evaluation from its coverage. Missing or empty
Acceptance Criteria is NOT ASSESSED; zero criteria is not proof of completion:

- Check actual file/test existence where that is the criterion. Say “test file
  present,” never “tests passed.” Inspect tuning literals/player-facing strings
  in the real code root for the data/localization checks.
- Behaviour, feel and performance need actual applicable observation or a human
  answer; code states intended behaviour. Batch at most four unanswered criteria:
  Yes — passes / No — fails / I'll check it when I play / Not tested yet.
- Open retained images before saying what they show. A visible criterion can be
  verified by an image under production/qa/evidence/<story-slug>/, or the matching
  grown-game story image/run path. A still frame cannot prove motion, timing,
  persistence or a whole play session. Attribute unopened OBSERVED text to its
  author; do not present it as this review's observation.
- A full-play criterion or “I'll check it when I play” is **DEFERRED — requires
  playtest session**, nonblocking and named in the notes. Do not count it as
  UNTESTED. “Not tested yet” is **UNTESTED**: apply the QA threshold above and,
  below that threshold, keep the verdict at best NOT ASSESSED.
- A vague criterion with no observable outcome is NOT ASSESSED, not deferred.
  Identify what would make it checkable. A known relevant failure is FAILS even
  when the corresponding test file exists. Do not run or repair it here.

Map every criterion to the exact test/function, retained image or actual answer:

| Criterion | Covered by | Status |
| --- | --- | --- |
| AC-N: actual words | actual path/function or attributed answer | COVERED / DEFERRED / UNTESTED / NOT ASSESSED |

COVERED alone is not an evaluation pass. Record pass/fail/unknown separately in
the report; never count reading a test body as observing the build. Do not invent
answers to finish a headless run; keep unresolved questions pending.

## Phase 4: Evidence and observed run

Use engine_row.value.code_root/test_root, their states and excluded directories.
An invalid/unresolved root is NOT ASSESSED for that scan, never a fallback to src/
or zero hits. A root of `.` excludes the returned framework/tool/test directories.
Use the actual engine test root (Unity Assets/Tests, for example), not universally
`tests/`; Unreal placeholders need an actual module before a scan can count.

Apply the type gate, skipping only the QA-waived requirements:

- **Logic:** exact Test Evidence path first; if absent/missing, search the actual
  test root's unit/<system>/ for applicable tests and report the fallback used.
- **Integration:** exact path, then integration/<system>/; alternatively an actual
  production/qa/playtests/ record naming this story.
- **UI:** retained screenshot of every screen touched under production/qa/evidence/.
  No evidence document or sign-off is required.
- **Visual/Feel:** those screenshots plus <story-slug>-evidence.md under that
  evidence root, every named sign-off row `[x] Approved`; one person may sign all
  roles. Never fill approval rows yourself.
- **Config/Data:** an actual production/qa/smoke-*.md report. If missing, name the
  smoke-check action; do not execute it here.
- **No Type:** advisory “Story Type not declared; add Type to the header.”

A missing required item is BLOCKING or ADVISORY by its resolved gate. Existing
but unreadable evidence is unassessed. A description with no image is not visual
evidence. Report actual paths, requirement/waiver and limits; no tests run here.

For retained images resolve `studio/scripts/review-receipts.mjs`, then from the
game root run `node <path> check production/qa/evidence/<story-slug>/stamp.txt`.
Report CHANGED/GONE as re-capture needed and NONE as freshness unknown; missing
coverage, NEW/UNRESOLVED/read errors also cannot establish unchanged evidence.
Freshness output alone never changes the verdict or replaces actual inspection.

Take Run result from the matching checkpoint or this story's Completion Notes.
OBSERVED with a path is attributed until opened. Accept N/A only with a reason
why nothing is observable; “it is Logic” is insufficient. NOT VERIFIED on visible
criteria, or a human Yes with no retained image, is an evidence gap at the type
gate. No Run result line is an informational reminder to confirm launch/observation;
missing bookkeeping alone does not change the verdict.

For a grown game inspect the existing grow-<name>/replay.args legacy marker or
current grow.md plus actual completed conversion/test/replay artifacts. Copy-only,
an unfinished migration or screenshots alone do not establish completed growth.
When growth is established, use this story's Same-seed run and referenced actual
post-story run: SAME or CHANGED, accepted is recorded; CHANGED, not accepted is
BLOCKING in every mode; no post-story comparison is NOT ASSESSED. An explicit
NOT ASSESSED — reason is advisory with that reason. Preserve old baselines;
never manufacture a comparison or user acceptance from deterministic equality.

## Phase 5: Deviations, scope and own calls

Check actual implementation against the Phase 2 current GDD/TR rules and ADR
constraints (full, or required sections/critical ADRs at standard). Minimal skips
these two checks. At all tiers check tuning literals and localization strings,
and carry Manifest-Note verbatim. Older story Manifest Version is advisory:
name both dates and recommend readiness reassessment; no manifest means skip.

Compare the story's Files section to actual uncommitted code/test changes from
`git status --porcelain` (use NUL-safe parsing for unusual paths). An undeclared
changed path is OUT OF SCOPE; exclude a path owned by a Complete story in the same
epic, not arbitrary other work. Missing Files: matching checkpoint Files in
progress can substitute; otherwise Scope: NOT ASSESSED — story lists no files.
Clean tree: Scope: not checked — no uncommitted changes to compare. Missing Git
is unassessed; never claim the tree is clean from an unsuccessful command.

Classify deviations with actual references: BLOCKING contradicts a GDD/ADR or
verified criterion; ADVISORY drifts without changing agreed behaviour; OUT OF
SCOPE identifies unclaimed work. Do not fix or reinterpret the design to erase a
contradiction. Scope unknown is reported separately; it cannot certify scope.

Read the listed implementation alongside its criteria and relevant GDD/brief;
combine with the matching checkpoint's Own calls. List every player-visible or
cross-story decision absent from the design: value, timing, colour, unprovided
case behaviour or wording, with its actual file. Code organization/names are not
own calls. Reuse previously accepted choices for unchanged work. For each unresolved
call ask Keep it / Change it — say how, and wait before Phase 6. No answer is not
kept. Kept calls go into closure history; requested changes are BLOCKING, quoting
the user's words, with implementation as a later action. None found: say “none
beyond the design,” naming what was read. No files available to assess: Own calls
NOT ASSESSED — no changed files to read. Do not change game files here.

## Phase 6: Review gates

Resolve review mode before loading anything conditional:

- **Solo:** neither role; name both gate skips. Reviewed by: self, no independent
  review. No code-review question.
- **Lean:** neither role; name both gate skips. Reuse an actual prior answer or ask
  whether code review ran: Yes — passed/approved with suggestions / No — skipping
  for this story / No — before sprint close-out. All three may proceed. Yes means
  “code review (you said you ran it; not verified here)”; either No means self,
  no independent review. Do not claim an unavailable workflow actually ran.
- **Full:** read [review gates](references/review-gates.md), then invoke the actual
  eligible native QL and LP reviews. A missing/refused/failed role is NOT ASSESSED,
  never a generic-agent substitute. Preserve the actual gate results and limits.

Reviewed by is never blank. When LP actually reviewed, name the lead-programmer
and its result; unavailable LP is self, no independent review with the failed
attempt explained. With no implementation LP is skipped, not approved.

## Phase 7: Report, verdict and authorized close

Show the complete report before a close decision or mutation:

```text
Story Done: [title]
Story: [path] · Type: [type] · Date: [today]
Acceptance Criteria: [X/Y passing]
[every criterion: PASS/how verified, FAILS/reason, DEFERRED/playtest, or unknown]
Traceability: [complete criterion | covered by | status table]
Test Evidence: Required [type/QA requirement or waiver]; Found [paths or gap/level]
Run result: [attributed observation/reason/unknown]
Same-seed run: [grown game only, actual result and provenance]
Deviations: [NONE or every BLOCKING / ADVISORY / OUT OF SCOPE with reference]
Scope: [actual comparison and limits]
Own calls: [kept / change requested / none / NOT ASSESSED]
Review: [both actual gate results/skips and limits]
Reviewed by: [actual provenance, never blank]
Verdict: [COMPLETE | COMPLETE WITH NOTES | NOT ASSESSED | BLOCKED]
```

First matching verdict wins; preserve subordinate unknowns/findings:

1. **BLOCKED:** failed criterion, blocking evidence/threshold/deviation, rejected
   own call or adverse blocking gate.
2. **NOT ASSESSED:** criterion not evaluable/UNTESTED below blocking threshold,
   unreadable evidence/required design, unassessed own calls or required review.
3. **COMPLETE WITH NOTES:** all criteria pass or are DEFERRED, with deferred or
   advisory items retained. Receipt lines, absent sprint and Run result bookkeeping
   alone are information, not advisory findings.
4. **COMPLETE:** every criterion passes and nothing advisory remains.

Name the exact proposed record changes. If no applicable close authorization
exists, offer Close and log notes / Close and log advisory deviations as debt /
Don't close yet / Close anyway accepting the listed risks. Recommend leaving a
BLOCKED or NOT ASSESSED story open. A concrete prior conditional close request
suffices for a passing verdict; an explicit acceptance of these exact adverse
findings suffices for close-anyway. Honor always-ask categories without repeating
already answered decisions. A general request to finish work is not acceptance
of newly discovered failures. Pending choices leave the story open.

On authorized close, use the host's actual native file editing. Preflight all
applicable targets, exact story identity, current contents and intended changes
before the first edit; re-read before each edit for conflicts. Preserve unrelated
bytes, comments, CRLF, existing histories and user edits. Do not silently update a
same-basename story, guess malformed YAML or overwrite ambiguous headings/rows.
No md-section write command or generic close-plan JSON API exists. Native edits
are not a multi-file atomic transaction: verify every affected file/diff before
claiming closure; if an edit fails or conflicts, stop dependent writes, retain
actual durable state and report incomplete synchronization for recovery. Never
roll back concurrent user edits or claim a checkpoint save made all edits atomic.

1. Update this story's actual header Status to Complete, Last Updated to today
   (insert beside Status if absent); do not edit code-sample fields. Append a dated
   Completion Notes record preserving previous history: completion date, X/Y and
   deferred/untested criteria, all deviations/unknowns, evidence/waiver, Reviewed by,
   Run result and applicable Same-seed run. For overrides retain the original
   adverse verdict and explicit accepted risks; Status Complete does not become a
   quality pass. Record Calls beyond the design with every kept call/location/date,
   or “none beyond the design”; never mark an unanswered/rejected call kept.
2. Only for selected debt logging, read [tech-debt rows](references/tech-debt-row.md)
   and append the chosen advisory items. Blocking findings remain blocking even
   when an override allows closure; do not reclassify them as mere debt.
3. If production/sprint-status.yaml exists and lists this story, match its unique
   exact `file` entry, set status: done, completed: today and top-level updated:
   today. Preserve every other entry. Invalid schema/duplicates are a conflict,
   not a silently skipped sync. A valid plan without this story is explicitly
   not applicable; do not invent membership.
4. At minimal, Requirement `Brief MVP feature N` ticks that exact brief Features
   item only after its last non-Complete story finishes. A `deepen — <system>`
   story ticks the Features line naming its system when present. Inspect siblings;
   do not tick a guessed/ambiguous feature or unrelated/cut item.
5. If the epic's EPIC.md Stories table lists this story, set its exact Status cell
   Complete, preserving other cells/rows. Missing row is stated, not synthesized.
6. Commit only with actual authorization for this story. Otherwise offer “Commit
   this story? feat: [title]” / Not now once. Inspect both staged and unstaged
   changes first. Include only authorized story Files and this close's records;
   no git add -A or dot. Exclude unrelated pre-staged changes from the actual
   commit (for example, a reviewed path-limited commit); mixed unrelated edits in
   a selected file need scope resolution. Preserve user author settings. Use
   `feat: [title] ([TR-ID])` when an ID exists; don't invent one. A failed commit
   doesn't undo a saved close, and must not be called committed.

Don't close yet: no story/companion/debt edits and no self-directed fixes. List
what remains; save only the permitted checkpoint below. Read-only: no writes at all.

## Phase 8: Next story, checkpoint and closing block

At minimal always use the build-order path; otherwise use it when no sprint plan
exists under production/sprints/. After an actual close, resolve and run
`studio/scripts/story-status.mjs` with `--project .` once; any pre-close snapshot
is stale. For an open story prioritize its unresolved fix over claiming it finished.
The observer's global ordering is authoritative: first IN_REVIEW → story closure,
else IN_PROGRESS → implementation, else TODO (Ready/Not Started) → implementation.
Show its actual path/title and one-line purpose; do not re-rank within one epic.
Minimal prints no readiness action at all. Standard/full build-order may add
readiness before implementation when available.

Only positive COMPLETE N of N means all built: offer all three directions—play
and note problems; describe the next addition for brief/story authoring with
existing authorization; or raise rigor if the brief is outgrown. With only
BLOCKED/OTHER/NO_STATUS remaining, name each blocker/Draft/no-status item; no Next
Up and no false completion. Zero stories is not all built. No sprint close-out
sequence belongs on this branch.

With an applicable sprint plan read [sprint next](references/sprint-next.md).
Recommendations do not run downstream work. Before printing a $game-studio-*
invocation verify its installed frontmatter name/exposed capability. If missing,
retain the intended action and state the capability gap; never imply the user
can invoke an uninstalled dev-story/create-stories/team-QA workflow or silently
substitute a different engine/workflow. Separately authorized sequential delivery
can continue in its coordinator; this Skill does not launch it itself.

On every completed verdict path, closed or left open, save a checkpoint within
permitted writes. Read pinned `studio/docs/recovery.md` before the first save.
Use `checkpoint show --json` and its actual whole-file sha256, a unique
project-relative draft created by native editing, then `checkpoint save --input
<draft> --expect-hash <sha256-or-missing> --dry-run`, followed by the authorized
save. Remove only that draft after successful save. Preserve surrounding history,
constraints and still-relevant open work. A conflict requires re-reading and
reconciliation, never a blank replacement. The CLI transaction protects the
checkpoint/event/backup, not earlier story edits. Missing/failed checkpoint is a
separate reported outcome. Explicit read-only means report the checkpoint intent
without saving it.

Record Updated, exact observed Branch/Stage, Current task with this story/verdict
and closed/open/partially synchronized state, Next step matching the report,
Blocked on, Files in progress (none only if none remain) and Open questions/debt
count. Omit an unknown branch rather than inventing it. Keep evidence/run/calls
provenance in the story history; checkpoint summaries do not supersede artifacts.

The final reply ends with this block, repeating it if shown earlier:

```text
Verdict: [COMPLETE | COMPLETE WITH NOTES | NOT ASSESSED | BLOCKED] — [story path]
Story: [closed — Status: Complete | left open — Status: actual | sync incomplete]
Review: [Reviewed by; actual gate results/skip notes]
Next step: [actual next story action | required fix/input | play the build]
```
