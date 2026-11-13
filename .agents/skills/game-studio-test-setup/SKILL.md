---
name: game-studio-test-setup
description: Set up a configured game's engine-specific test directories, runner configuration, smoke checklist and CI workflow, or fill missing infrastructure with force while preserving existing tests.
---

# Set up test infrastructure

Use this during Technical Setup, before implementation or the first sprint.
The input is optional `force`: it bypasses the existing-infrastructure early
exit and creates missing files only. It never authorizes replacing tests,
workflows, runner configuration, game sources or package locks.

Work at the game root with the pinned `.game-studio/run.cjs`. Read
`node .game-studio/run.cjs config get --json` and
`node .game-studio/run.cjs engine inspect --json`. Use actual engine/version,
roots and modes.automation, modes.automation_always_ask, modes.workflow and
qa.level with their sources. An unavailable runtime is a prerequisite, not
permission to guess an engine or invoke retained migration scripts.

## Phase 1: Detect engine and existing state

Read [detection and shared artifacts](references/setup-and-summary.md).
A configured engine is required; engine markers alone do not configure it.
Report the engine, test directory and CI findings. When the engine's core
infrastructure is present and `force` was not requested, report the early exit
and the missing-only force option. Do not write or request a redundant plan
approval in that branch. Existence is not evidence that tests compile or pass.

## Phase 2: Present the concrete plan

Read only the selected engine's reference:
[Godot](references/godot.md), [Unity](references/unity.md),
[Unreal](references/unreal.md), or [Web](references/web.md).
List actual new paths, preserved existing paths, unresolved inputs and separate
installation/CI prerequisites. Include the common smoke/evidence/README paths.
Resolve engine-specific choices before generating misleading files.

Use the applicable collaboration mode. In guided mode, reuse the user's already
confirmed setup goal and concrete write scope; preview and continue through
ordinary writes without asking per file. In collaborative mode, obtain the
concrete plan's approval when not already granted. Autonomous mode proceeds
within the settled scope and logs the choice, but overrides neither host
permissions nor always-ask categories. A skipped question is not consent.
Package installation, creating a Unity game assembly, changing existing files,
secrets, remote repository settings and publication have separate effects;
settle their scope before acting. This utility has no director gate.

## Phase 3: Create missing directories and runner configuration

Follow the selected engine reference and shared artifact specification. Use
installed resources via `resource path <resource-id> --json`; never resolve
runtime content from a maintainer checkout. The bundled test-scaffold capability
must actually exist before invoking it. If unavailable, report the unmet
capability and retain the plan rather than inventing a command or substituting
engine scaffold for repair of an existing game.

Preserve all files that existed before this run, including customized README,
CI and test configuration. `force` does not weaken this rule. Treat links and
wrong file types as unresolved paths, not permission to follow or replace them.
A late conflict stops that write; read back what actually exists. Keep temporary
input/output files in exclusively owned locations and clean only owned paths.

## Phase 4: Create CI workflow

Read [CI requirements](references/ci.md). Create only the missing
`.github/workflows/tests.yml`, matching the chosen engine and actual project.
Retain prerequisite placeholders/needs when values are unknown; do not claim
such a workflow is runnable. Creating YAML does not execute CI, set repository
secrets, install a runner or configure branch protection.

## Phase 5: Create smoke checklist seed

Use the shared reference's complete seed at `tests/smoke/critical-paths.md`
only when absent. These are planned checks, not completed play evidence.

## Phase 6: Read back and summarize

Follow the shared reference's summary and tier-aware handoffs. Report actual
created/preserved/blocked paths and every unmet installation/input requirement.
`COMPLETE` means the agreed scaffold is present; qualify pending editor,
framework, example tests, CI secrets/runner and real execution separately.
Missing required writes or unanswered choices remain pending, not COMPLETE.
Never call a zero-test run, missing engine/browser, generated checklist or
unrun CI a pass. No model/effort/permissions or native role files are changed.

Read the active phase's reference again after compaction or resuming.
