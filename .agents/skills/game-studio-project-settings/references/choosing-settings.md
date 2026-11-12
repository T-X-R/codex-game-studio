# Choosing settings

`modes.rigor` sets a baseline for workflow depth, documentation density, QA,
story granularity, review mode and team size. Explicit values still win.
Automation is a separate choice about collaboration, not rigor or game size.

| Described project | Starting recommendation | Reason |
| --- | --- | --- |
| Jam, experiment or first small prototype | minimal | Keep the first playable small. |
| Small solo/hobby game | minimal, revisited as it grows | Add coordination when actual scope warrants it. |
| Focused commercial indie with one clear loop | standard | Record enough decisions to maintain and release it. |
| Many interacting systems or a long development horizon | full | Cross-system decisions and review have greater consequences. |
| Competitive multiplayer or live service | full with targeted QA | Network, security and operations need their own concrete checks. |

These are suggestions, not classifications that override the user. Infer a
starting point from the actual concept; without one, explain the minimal default.
One difficult subsystem can use `workflow_overrides.system_overrides.NAME`
instead of increasing depth everywhere. Full rigor with terse documentation is
valid; so is a deliberately selected personal review mode. Neither removes an
explicit requirement for independent review on a particular task.

Recommend revisiting rigor when scope actually crosses a meaningful boundary,
a stage review establishes new needs, or the user says the process is too heavy.
Do not infer a stage transition or raise rigor merely from a file count. Avoid
repeating the same suggestion without new information.

`guided` means agree on goals and consequential decisions, then execute within
that scope. `collaborative` can request closer involvement; `autonomous` can
reduce routine interruptions within prior authorization. None overrides host
permissions or authorizes unrelated changes. Describe the capabilities actually
available in the installed version, not just the policy value stored on disk.
