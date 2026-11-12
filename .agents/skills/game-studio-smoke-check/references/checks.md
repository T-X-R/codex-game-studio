# Coverage and manual checks

For a full (`sprint`) run, take story scope from the chosen QA plan's test summary,
otherwise the current sprint plan. Read the story, its Test file/Test Evidence
fields and relevant tests under the engine's actual roots; filenames alone do
not establish that an assertion covers the requirement. If no story scope is
available, say what scope is unknown rather than claiming complete coverage.

| Coverage | Evidence |
| --- | --- |
| COVERED | A relevant game test checks the story's system and requirement. |
| MANUAL | Visual/feel/UI evidence exists; distinguish the document from current human confirmation. |
| MISSING | A Logic/Integration story lacks matching test evidence. |
| EXPECTED | A Config/Data story calls for a spot-check, not an invented test. |
| UNKNOWN | A scoped story is missing/unreadable or its scope cannot be established. |

MISSING is an advisory gap to resolve before story completion. UNKNOWN prevents
a complete smoke assessment. Quick runs skip the scan: report “Coverage not
checked (quick run)” and do not invent rows or claim all stories are covered.

## Actual manual observations

Choose and name the checklist source, in order: QA plan Smoke Test Scope,
`production/qa/smoke-tests.md`, relevant `tests/smoke/` checklists, then the
fallback below. Tailor mechanics to the actual game/changed stories. A checklist
file containing expected steps is not evidence the steps were performed.

Group unanswered questions rather than asking per item. Record who observed
what, for which build/session, and preserve descriptions of failures. First
establish whether the current build was launched and the checks were actually
performed. “Not launched” means NOT RUN for manual checks; skip later batches
that require it and explain why. An empty failure list without this confirmation
means nothing. Automated browser checks may support named technical observations,
but never impersonate a person's play or performance judgment.

- **Always: stability.** Launch/menu, start a new session, input response,
  basic navigation without crash/hang.
- **Always: changes/regressions.** The actual changed mechanics and relevant
  previously working features. Ask for a description when something failed.
- **Full runs: data/performance.** Save/load (N/A only if no save system),
  observable frame drops/hitches, and whether performance was checked at all.
  Offered-but-skipped performance is NOT ASSESSED; a quick run's deliberate
  exclusion is simply part of its reduced scope.

Reuse explicit current-build feedback already supplied. Do not contact others
or create a report attribution on their behalf. If evidence comes from the
user's IDE/CI, name that source and whether it was inspected or only reported.
An unanswered question stays pending, not automatically confirmed.

## Requested platforms

Add only the requested platform rows (`all` includes all three). Use actual
target-device/build evidence; a desktop browser viewport is not a console or
mobile hardware test. Any observed platform failure contributes FAIL. Unavailable
checks remain NOT ASSESSED and prevent a complete platform/overall pass.

| Platform | Checks |
| --- | --- |
| PC | Keyboard, mouse/cursor, windowed/fullscreen, resolution changes. |
| Console | Gamepad, TV safe areas/text clipping, incorrect keyboard prompts, cold start without a save. |
| Mobile | Touch, orientation, background/foreground, target-device performance/thermal behavior. |

These observations are not platform certification. No requested platform can
inherit another platform's pass. Keep N/A, skipped, failed and unobserved distinct.
