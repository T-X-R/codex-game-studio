# Existing Web game: observe and configure it as it is

Root package.json means an existing project. Preserve its own source, scripts,
configs, assets and lockfiles byte-for-byte; never run scaffold or convert its
bundler/language/tests. The configuration, project-owned preferences/reference
pointer and explicitly disclosed evidence outputs are the setup scope. Builds
may write the game's normal output; optional hook integration is separate.

## Read before proposing a record

Resolve `studio/scripts/web-detect.mjs`, then run
`node <resolved-path> --project ROOT` (optional --text). It reads only; inspect
its diagnostics and scan completeness, not just exit0. Malformed/unsafe metadata
stops, never becomes an empty new project. Workspace declarations, including
pnpm-workspace.yaml, stop writes: open a single game's folder and resume there.
Do not pick a workspace package automatically.

Probe Node independently. The new starter's Node range is not this project's
requirement; preserve its actual engines/toolchain requirements. The toolkit
still needs its supported runtime to execute. If the game cannot run on the
available Node, record that accurately and leave execution pending rather than
claiming configuration means the game is runnable.

PM priority is explicit choice, packageManager declaration, a unique lock
manager, then npm; unresolved conflicting managers require a question naming
the actual locks. Rerun with `--pm npm|pnpm|yarn|bun` after the real answer.
An explicit choice does not make other locks disappear.

Show one proposed record: manager/provenance, six observed scripts and derived
run/build/test/smoke/install commands (unavailable commands with reasons), real
code/test roots, language, bundler with raw declaration and exact-version
provenance, test runners, all observed libraries and hook observation. Keep
build-script bundler precedence. A dependency range is not an installed pin;
unknown version stays null, never strip ^/~. Exact declared and exact installed
are distinguishable evidence. A lexical hook assignment is not verified wiring
or replayability; incomplete scanning cannot prove absence or JavaScript.

When src is absent, ask among actual code-root candidates, including flat `.`
when appropriate. Do not guess a nonexistent src. Write engine.test_root only
for the detector's explicit non-table root; otherwise retain valid existing
intent/default and resolve conflicts rather than deleting an override blindly.
`other` runner means generic exit-code evidence may conceal zero tests; `none`
means tests remain NOT ASSESSED until a real script exists.

## Apply only the accepted metadata

Follow configuration.md: engine.name Web, actual language, exact selected bundler
version or explicit null, chosen roots, and available commands from detector
results. Install is never a commands field. Clear stale renderer/physics when
changing from a template/editor record; package.json is this game's technology
record. No invented rendering/physics/library values or starter pins. Use W3
naming defaults only where the game's files do not plainly establish its own
style. Shared Web routing can describe the lead programmer; no engine specialist.

Rich stack says Web plus actual bundler/library declaration or no bundler;
build is the project's own script, not an implied single-file build. Assets are
its own pipeline. Preserve other rich project notes. Initialize missing project
Web reference material through the approved helper if needed, explaining it is
historical **template** documentation. Its Vite table is not the project's
bundler or APIs; skip the new-starter pin comparison. Use the actual project's
versions when checking API questions. Do not overwrite a curated Web reference
with template data or stamp it freshly verified merely by copying it.

## Build and test without changing the game

With no installed dependencies, show the detector's exact frozen install:
npm ci, pnpm/bun --frozen-lockfile, or Yarn classic --frozen-lockfile versus
modern --immutable. Reuse only explicit authorized installation. If no matching
lock gives no safe install command, do not create one: tell the owner to install
the usual way, then resume smoke verification. Lock/package mismatch refusal is
retained and stops execution; never substitute an unfrozen install.

Run the project's configured build and test through the bounded toolkit test
command and retain separate evidence. Inspect the actual runner/report for
counts/failures/skips. This wrapper does not implement the source's Web parser
rows, and an exit0 cannot prove tests ran. When the command includes several
runners, report each actually reached runner; unexecuted ones are pending.
A missing test script is `NOT ASSESSED — no tests`. Do not substitute the
starter's Vitest/Playwright suite for the game's own tests.

Locate its actual build output from its configuration/output, then capture its
own index.html directly from disk using resolved page-shot:
`--project ROOT BUILD/index.html production/qa/evidence/setup-engine-web-UNIQUE --software --file-access`.
Inspect returned PNG and uncaught/error logs. Missing root-relative `/assets/…`
from a file URL is `NOT ASSESSED — build requires server-root assets`, not a
reason to start commands.run or rewrite game config. Report the game's own
errors; setup does not repair them. Missing build/image stays pending.

## Optional hook is a separate choice

If hook is absent, explain that scripted input/state reads/same-seed replay are
unavailable without actual wiring; screenshots/console observations still work.
Offer **Not now (recommended for setup)** or **Add it as its own change**. No
answer means no source change. An uncertain lexical observation first needs
inspection, not a blanket absence assertion.

On a real yes, settle the exact game-source scope. The source branch requires a
committed game baseline: inspect git status, ask before committing uncommitted
game files unless already explicitly authorized, and stop if that precondition
is declined. Preserve unrelated/staged work; no automatic broad commit.
Resolve `studio/templates/web-growth-support/hook.ts` for the API contract, not
as permission to copy TypeScript into a JavaScript game. Implement scene/state/
press/hold/step in the game's own language beside its entry point, wired to
actual state/input. Expose step only if the loop can truly be stepped. A library
name alone proves neither deterministic nor nondeterministic replay; retain
NOT ASSESSED where independent clocks remain.

Build, run the actual tests, inspect the diff and obtain/reuse the explicit
separate hook-commit authorization. Commit only the selected change, never other
owner work. If any portion is unavailable, retain its failure/pending evidence
and do not claim setup itself added a verified hook.
