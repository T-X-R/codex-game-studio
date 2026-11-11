# Contributing to Codex Game Studio

This is an executable alpha under active migration. Start with
[implementation status](docs/implementation-status.md) and choose a focused item
from [the task list](tasks/todo.md). Preserve the upstream MIT notice and history.

Keep toolkit code under `toolkit/src`, project Skills under `.agents/skills`, and
shared resources under `studio`. Generated `toolkit/dist` and `toolkit/resources`
are build outputs. The retained `.claude` tree is migration input, not the active
Codex runtime. Do not mechanically substitute Claude tool/model names and claim
behavioral equivalence.

Use Node.js 24–26. Run `npm --prefix toolkit ci --ignore-scripts`, then `build`,
`typecheck`, `test` and `test:pack` through `npm --prefix toolkit run <script>`.
Browser changes also require `test:browser` with an installed Chromium-family
browser. Record actual platform/client versions and unavailable checks.

Test observable behavior: preserve user code and configuration, reject collisions,
exercise dry runs and failures, and verify a real installed archive. A metadata
validator cannot prove host Skill discovery, role selection, hook trust or enforcement.

Skills need concise `name` and `description` metadata and focused triggers.
Follow guided execution within the user's approved scope. Resource references must
work outside the maintainer checkout. Only implemented commands belong in help,
schema and public examples. Keep generated games and personal credentials out of
contributions to this toolkit repository.

Describe the problem, resulting behavior, validation and remaining limitations in
your pull request. A migration row closes only after its documented acceptance
evidence is available; an alpha entry point is not a full upstream workflow port.
