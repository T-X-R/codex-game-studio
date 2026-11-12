# Codex compatibility evidence

Status: CLI custom role selection and a startup/patch Hook fixture verified with controls; full host compatibility gate is open.

## Packaged design and programming roles — 2026-11-12

Codex CLI 0.162.0 on macOS ARM64 selected the packaged
`game-studio-game-designer` in four fresh projects: full, standard and minimal
authoring plus response-only review. It read installed methods and effective
workflow, wrote the appropriate artifact, preserved approved decisions and
returned a conflicting future tuning rule without silently changing it. Review
retained creative, formula and narrative ownership. See [designer evidence](evidence/game-designer-2026-11-12.json).

The packaged `game-studio-lead-programmer` ran two native tasks: code review with
sound/faulty/missing-context controls, and read-only quantitative feasibility.
Original Node tests and an independent defect execution are identified as
maintainer evidence; feasibility numbers remain estimates, not measured results.
Its first preparation attempt failed on the Node reporter format before native
execution; explicit TAP output corrected that fixture issue. See
[programmer evidence](evidence/lead-programmer-2026-11-12.json).

All six native sessions selected the actual role, loaded full instructions only
in the child, inherited parent model/effort/sandbox, preserved original regular
files and stayed within their permitted outputs. Parent sessions only delegated
and aggregated. Temporary project-trust profiles were removed; no Hook trust was
configured. These tests do not prove desktop discovery, intentional write denial,
nested specialist collaboration, engine performance or human play acceptance.

## Packaged QA Lead — 2026-11-12

The development package also supplies `game-studio-qa-lead` and two portable QL
gate definitions. Codex CLI 0.162.0 selected the real custom role in fresh packed
projects, with instructions isolated to the child and inherited model, effort and
sandbox. A read-only readiness assessment and two report-writing policy/coverage
scenarios preserved all existing files and stayed within their allowed outputs.

The first readiness run misclassified missing GDD input as a story deficiency;
the first coverage run misrouted test-harness ownership. Both have role corrections
and fresh identical-input native reruns. The evidence includes the failures and
does not claim that all cases ran against the final role hash. Configured minimal
waivers, UI versus Visual sign-off, zero-test evidence, severity triage and release
pressure were assessed with synthetic inputs; no actual game or human acceptance
was established. Temporary project-trust profiles were removed, with no Hook trust.

See [the behavior specification](../studio-tests/roles/qa-lead-codex.md) and
[sanitized traces and semantic review](evidence/qa-lead-2026-11-12.json).
Desktop, nested delegation, write-denial controls and remaining behavior remain open.

## Packaged QA tester — 2026-11-12

The actual development package now supplies `game-studio-qa-tester`. A fresh
trusted CLI 0.162.0 fixture selected that custom role and the child's developer
context contained its complete installed instructions. The parent did no file
inspection or report writing; it waited and aggregated the child's findings.
Model, effort and workspace-write sandbox matched the parent's settings.

The child audited a deliberately unsupported zero-test PASS, identified a +1/+2
source/requirement mismatch without claiming runtime reproduction, wrote nine
unexecuted test cases and BUG-0008, and escalated subjective acceptance criteria.
Independent hashes verified all 322 existing files unchanged and exactly two
new Markdown reports in the allowed QA directory. This proves observed scope
compliance, not an attempted-write sandbox denial. The temporary trust profile
was removed; no Hooks were configured or trusted.

Run `node toolkit/test/qa-role-host.mjs` with supported Node after building.
Its exit 3 deliberately requires semantic/trace review; the underlying native
run exited 0. See [the reviewed evidence](evidence/qa-role-2026-11-12.json) and
[behavior spec](../studio-tests/roles/qa-tester-codex.md). Desktop, remaining QA
behavior cases and the full multi-role collaboration gate are still open.

The subsequent `readonly` scenario inherited a read-only sandbox, returned its
audit in the response and changed/added no files (322 existing files checked).
The `regression` scenario exercised synthetic save-loss evidence, targeted
regression, configured advisory/blocking policy and an unavailable QA lead.
Its initial result incorrectly added a UI sign-off requirement. The corrected
role's fresh run used identical game inputs, produced 11 unexecuted Integration
cases without importing other story-type approval gates, left suspected S1 and
priority pending, and granted no release approval. All 321 prior files survived
unchanged; only the two requested Markdown reports were added. The actual child
instructions, model/effort, sandbox and parent aggregation were reviewed for all
three runs. Temporary profiles were removed. See [the complete workflow record](evidence/qa-role-workflows-2026-11-12.json).
This is role behavior evidence, not executed game regression or human acceptance.

Local candidate: Codex CLI 0.162.0 on macOS ARM64. The installed feature listing
reported hooks and multi-agent support enabled. This is not a claimed minimum
version or a proof of desktop equivalence.

Disposable CLI experiments observed an explicitly invoked project Skill marker,
a SessionStart context marker and a PreToolUse denial for an `apply_patch` command.
The input shape used `tool_input.command`. The first attempt omitted the complete
project/trust setup, and overlapping attempts reused a fixture. Those filesystem
observations are not accepted as clean positive/negative release fixtures.

An ephemeral role experiment failed with `no rollout found for thread id`.
A subsequent persisted experiment returned a requested reviewer marker, but the
prompt also contained that marker. It does not independently establish that Codex
selected and loaded the configured TOML role. Those experiments alone did not
verify role selection; the fresh trusted test below does.

No live desktop compatibility result is recorded. Installing files, a successful
TOML parse, a reported feature flag or a generic subagent response is insufficient
to close this gate. Future host tests must use fresh isolated directories, hidden
role-only markers, non-overlapping runs, explicit client versions and before/after
hashes for both permitted and denied writes. A subdirectory launch and desktop
PATH differences also remain to be tested.

The alpha therefore installs project Skills and a local launcher, and exposes
these limitations through `doctor`. It does not install unverified automatic hooks
or substitute prose for an enforced permission boundary.

## Earlier CLI role probe — 2026-11-12

A new persisted CLI 0.162.0 session attempted to trust an isolated temporary workspace,
a project-scoped `game-studio-probe.toml`, and a random marker present only in that
role's instructions. The parent prompt prohibited reading files or simulating
the role. The run used a read-only sandbox, inherited the existing login, ignored
user configuration and disabled unrelated plugins/apps/memory/Skill instructions.
The selected model matched the local configured model, `gpt-6.1-sol`.

The process completed with exit code 0 after transport retries, but the response
was `ROLE_SELECTION_UNAVAILABLE`: it reported that the native spawn interface had
no custom-agent selector. No child was spawned and the hidden marker was absent.
The persisted parent developer context contained neither the custom role name
nor the hidden marker. This is a negative observation for that invocation, not
proof that every Codex configuration lacks custom agents. The documented standalone
TOML contract still needs a verified client/configuration path before role installs
can be advertised as active. A later configuration read found that command-line
`projects.<path>.trust_level` overrides did not enable project configuration.
This earlier probe did not establish configuration loading and is superseded
by the trusted positive/negative pair below.

Sanitized observations are in
[`evidence/cli-role-probe-2026-11-12.json`](evidence/cli-role-probe-2026-11-12.json).

## Verified CLI role selection — 2026-11-12

The revised probe initializes a fresh Git workspace and creates a unique named
user profile containing trust only for that fixture. It deletes the profile in
`finally`, without editing the base user configuration. Before any model call,
`codex debug prompt-input` must contain a separate project-configuration marker
and must not contain the hidden role marker. `--strict-config` is applied to
`exec`; this client does not support it for `debug`.

The positive session called `collaboration.spawn_agent` with
`agent_type: game-studio-probe` and `fork_turns: none`. Its independent child's
session metadata recorded the matching role and parent thread. The child's
developer context contained the hidden role instructions; its final answer
matched the random marker exactly, with no tool calls. The parent waited and
returned that response. The role file was unchanged. The child retained the
parent's read-only sandbox; actual denied writes remain a separate test.

The negative control used another fresh trusted fixture with the same project
configuration but no role file. Configuration preflight passed. The parent
searched tool catalog metadata, made no file/shell/web calls, spawned no child,
returned no hidden marker and reported that no role selector was available.
Both temporary profiles were removed.

The manually reviewed record is
[`evidence/cli-role-selection-2026-11-12.json`](evidence/cli-role-selection-2026-11-12.json).
This verifies the [documented standalone role contract](https://learn.chatgpt.com/docs/agent-configuration/subagents)
for this CLI invocation. It does not close desktop, subdirectory, hook, write
boundary or all-role behavioral acceptance.

To repeat the positive and negative cases in separate fresh workspaces:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-role-probe.mjs
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-role-probe.mjs --without-role
```

This is an explicit live test using the existing Codex login, not part of the
offline test suite. It retains a temporary evidence directory, has a three-minute
process timeout, and does not edit the base user configuration. Exit code 3 means
not assessed, including when a marker needs trace review. A successful CLI exit
alone never counts as role compatibility. The script deliberately leaves its
result unassessed until the persisted parent/child traces are reviewed; the
reviewed record above supplies that evidence for this pair. T01 remains open.

## Verified CLI startup and patch Hook fixture — 2026-11-12

A separate disposable Git project contains a short fixture script and exactly
two project hooks: `SessionStart` and `PreToolUse` matching `^apply_patch$`.
The script appends events only inside the fixture, returns a startup context
marker, and denies patches naming `blocked.txt`. It is test code, not a production
validator. It performs no network calls or subprocess execution.

The untrusted control loaded project configuration but ran no fixture hook;
both requested patches completed. In another fresh fixture, the native `/hooks`
screen showed two installed hooks, zero active and two requiring review. The
owner explicitly authorized trusting these two test hooks. Each source, command,
matcher and five-second timeout was inspected before selecting Trust. The screen
then showed both active, with no pending review. No trust-bypass flag was used.

The subsequent persisted CLI session added the startup marker to developer
context and emitted two real `PreToolUse` events. `tool_name` was `apply_patch`
and the patch text was in `tool_input.command`, even though the model invoked
the tool through JavaScript code mode. The allowed patch changed `allowed.txt`;
the denied patch's tool promise rejected with the fixture's reason and left
`blocked.txt` byte-for-byte unchanged. There was no retry or alternate write.
Both scripts/configurations retained their original hashes and both temporary
user profiles were removed.

The reviewed record is
[`evidence/cli-hook-gate-2026-11-12.json`](evidence/cli-hook-gate-2026-11-12.json).
This does not prove desktop behavior, multi-file patches, shell interception,
other lifecycle events, production validators or the packaged runtime adapter.
It narrows the earlier exploratory uncertainty without closing T01/T16.

A subsequent pair of fresh cases verifies multi-file patches from both the Git
root and a subdirectory. In each session, startup context loaded, the two-file
allowed patch completed, and the two-file mixed patch was denied before either
file changed. Both actual `PreToolUse` payloads carried the entire patch in
`tool_input.command`. The subdirectory case's three Hook events reported its
subdirectory as `cwd`. There were no retries or alternate writes. See
[`evidence/cli-hook-multifile-2026-11-12.json`](evidence/cli-hook-multifile-2026-11-12.json).

These cases exposed a test-environment pitfall: native `/hooks` saves
`hooks.state` entries and their `trusted_hash` values in the selected named user
profile. Deleting that profile also removes its Hook trust. Two initial follow-up
cases recreated only project trust and therefore ran no Hooks, from either
launch directory. They are retained as trust-reset controls, not classified as
trusted subdirectory failures. Under the owner's existing authorization, the same
unchanged Hooks were reviewed again through native `/hooks`; the reviewed profile
then remained identical across both successful cases and was removed afterward.

To prepare a new fixture on macOS/Linux:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-hook-probe.mjs
```

The command prints the fixture directory, script and native review command.
For an untrusted control, run the fixture directly. For the trusted case, review
the exact generated hooks through `/hooks` only after explicit authorization,
then close that interactive client and run:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-hook-probe.mjs <fixture-directory>
```

Each case is single-use. The runner never grants hook trust and returns unassessed
until the actual trace and files are reviewed. To run root and subdirectory
multi-file cases after the initial case, use `--keep-profile` on that initial run
and all intermediate cases, retaining the actual native review state:

```bash
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-hook-probe.mjs <fixture-directory> --keep-profile
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-hook-probe.mjs <fixture-directory> --case root-multifile --keep-profile
GAME_STUDIO_HOST_MODEL=<available-model> node toolkit/test/host-hook-probe.mjs <fixture-directory> --case subdirectory-multifile --subdirectory
```

The final invocation removes the named profile. Do not rebuild or copy trust
entries to work around a deleted profile; use native review again under the
appropriate authorization. The runner refuses a missing profile, preserves prior
case files, and records each case's profile hash and incremental Hook events.
If a sequence stops while `--keep-profile` is active, remove its named temporary
profile when abandoning the fixture. The live fixture script is not shipped in
the toolkit archive. Its offline input/output contract tests also run in native
Windows CI. Desktop, shell, permission boundaries, remaining lifecycle behavior
and production validators remain open.

## Installed project settings Skill — 2026-11-12

A natural-language read request in CLI 0.162.0 selected the installed
`game-studio-project-settings` Skill without naming it in the prompt. The trace
shows the actual Skill read and a successful `config get --json` through the
restored project launcher. The response correctly described personal `solo`
overriding shared `lean`, rigor-derived values, ignored personal engine settings
and reserved-setting warnings. Hash verification found no project changes.
See [the evidence record](evidence/project-settings-skill-2026-11-12.json).

The default Node was unsupported and the Homebrew Node failed to load a library.
The session found an existing isolated Node 24.22.2 and successfully used it;
system installations were not changed. These failed attempts remain in the trace.

Host discovery has an observed boundary: `debug prompt-input` from this non-Git
game's nested `src/nested` directory omitted project Skills, while the same
command from the game root listed them. Launch Codex from the game root for
this route. Toolkit commands can independently find their project from a
subdirectory; that does not establish host Skill discovery. Git-root nested
discovery and desktop behavior are not established by this comparison.

Five isolated supplied-Skill cases separately exercised read-only inspection,
approved shared writes, personal overrides, refusals and reserved settings.
Two regressions verified a clarified before-write read and unset-value wording.
Those write cases are not native CLI/desktop mutation evidence. The remaining
settings behavior and full host gates stay open.

## Native smoke-check rerun — 2026-11-12

A natural-language sprint smoke request in CLI 0.162.0 selected and read the
installed smoke-check Skill, ran the actual configured Node test command and
wrote a new report in a disposable game root. The command's name filter matched
zero tests: process and toolkit exits were both zero, but the Skill inspected
the output and reported **NOT ASSESSED**, with absent manual observations named
separately. It did not run an unfiltered replacement suite or change the config.

The workspace already contained a report and run evidence from a supplied-Skill
evaluation. The native rerun used a suffixed report name and fresh evidence;
independent SHA-256 verification found all 323 prior files unchanged, including
source, tests, configuration, prior evidence and installed dependencies. The
trace records the Skill read, configured command and result inspection. See
[the evidence record](evidence/smoke-skill-2026-11-12.json).

This proves that specific root-launched CLI journey and its write/preservation
behavior. It does not prove desktop execution, native engine suites, other smoke
verdict paths or actual human play. Supplied console/quick feedback in the
separate behavior fixtures is simulation only and does not establish hardware
or human acceptance. No new Hook trust or custom agent configuration was needed.
