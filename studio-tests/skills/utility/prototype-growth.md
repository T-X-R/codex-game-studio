# Codex prototype growth: behavioral acceptance

This supplements S040's upstream prototype cases. It covers the selected Web
growth path; it does not close all prototype routes, native host acceptance,
alternative renderers, tuning workflows or human play.

## Resuming an authorized copy

Prepare an isolated real package installation with
`node toolkit/test/prepare-growth-skill.mjs`. It creates a playable scoring/input
fixture, an unchanged original prototype, copied Web sources, pinned dependencies,
reference/copy replay evidence and agreed brief. Give an independent evaluator
only the installed Skill, the game workspace and `request.txt`, plus executable
locations needed by that environment. Keep the evaluator within this disposable
game and its evidence directory. Do not provide the expected source structure or
implementation. The harness does not claim native Skill discovery merely because
an evaluator was given the Skill path.

Verify the actual result, not the final prose alone:

- The evaluator resumes the copied game rather than overwriting it or asking
  again whether growth is authorized. No unrelated features or publication occur.
- The prototype remains byte-identical; Keep, Avoid and Out of scope retain their
  exact meaning/text, with only genuine Feature completion updated.
- Game-owned code is TypeScript with strict checking. Actual running rules are
  extracted and tested; configuration values retain their meaning and live reads.
- Build, unit tests, Playwright boot/input tests and smoke run successfully using
  a real installed browser. Missing tools are not converted into successful checks.
- The reference stays immutable, and same-seed state/screenshot comparison after
  conversion agrees with it. The expected action result is asserted independently
  of repeatability; two runs that both ignore the action must fail.
- A deliberately broken game rule causes its test to fail; restoring the rule
  returns green. Inspect the mutation and logs to ensure the failure is relevant.
- The growth record identifies actual runs, evidence, metadata and any remaining
  loose typing or unassessed behavior. No human play observation is invented.

Run `node toolkit/test/verify-grown-fixture.mjs <game-directory>` after the
evaluator finishes. It independently checks source/brief preservation, configuration,
strict type-error detection, real test/build commands and replay equality. Review
the generated modules and mutation evidence too; this script alone does not prove
every acceptance item. It retains its own command logs and results beside the
fixture, and refuses to replace a prior independent verification directory.

## Other required scenarios

| Context | Required behavior |
| --- | --- |
| User requests ordinary iteration | Keep the game in its current location; growth is not implied. |
| Uncommitted prototype code | Report the guard conflict; do not commit, discard or hide user edits to clear it. |
| Existing main game or another engine | Preserve it and resolve the scope decision before changing the project. |
| Configuration contains computed/non-JSON values | Preserve the calculation in typed code; do not silently serialize it away. |
| Non-repeatable or hookless source | Name the narrower evidence and limits; do not claim hidden-state equivalence. |
| Additional scripts/vendor/assets | Preserve order, bindings, licence and loading behavior through an explicit conversion; do not lose `left` files silently. |
| Resume after a failed conversion check | Continue from preserved evidence and the last verified stage; never change the reference to hide a regression. |

These scenarios require their own behavior evidence. Static Skill validation and
the scoring fixture are not substitutes for them or for CLI/desktop end-to-end
journeys. User authorization to continue replaces the upstream per-file approval
loops; consequential changes still follow the user's selected scope.
