# Web prototype growth

The full growth workflow remains under migration. The current implementation
provides a read-only prerequisite check:

```sh
game-studio prototype grow-check demo --project /path/to/game --json
```

This inspects `prototypes/demo/`. It does not copy files, install dependencies,
execute game scripts, create commits or tags, or start a browser.

## Eligibility

The report checks that:

- The standalone prototype has a regular `index.html`. Concept, engine-spike
  and vertical-slice names are not eligible for this Web growth path.
- The engine is unset or `Web`, and its code root is unset or `src/`.
- No existing root game entry point, dependency manifest/lock, supported Web
  toolchain configuration, or game code in `src/` would conflict. Root
  `src/AGENTS.md`, `src/CLAUDE.md`, `src/README.md` and `.gitkeep` placeholders
  are retained. Nested README files count as existing game files.
- In a Git working tree, the prototype has no staged, unstaged, untracked or
  ignored code changes and the repository has no `grown/*` tag. Both paths of
  a rename are inspected. The prototype's `brief.md`, `evidence/` and `dist/`
  are excluded from the code-change check; dirty debrief files are listed
  separately without committing them.

Git inspection disables optional index writes and filesystem-monitor execution.
The report includes the latest source commit and existing `one-shot/<name>` tag
commit when available. A project without Git can be eligible with an explicit
warning that its unchanged prototype folder is its backup. A detected repository
that cannot be inspected is **not assessed**, rather than treated as absent.

Without `config.js`, the report warns that imported values have not been extracted
or assessed for tuning. No prototype JavaScript is evaluated by the check.

Exit `0` means the checked prerequisites passed; `4` means a conflict blocks
growth; `3` means the assessment could not complete. Invalid arguments use `2`.
The JSON `verification.state` remains `not_assessed` even for an eligible project:
eligibility is not build, replay, test or human-play evidence. A report is a
snapshot, not a reservation of paths or authorization for future writes.

## Remaining workflow

The approved workflow preserves the source prototype, records a same-seed
reference, copies it into a pinned Web build scaffold, converts its code to
TypeScript without changing behavior, tests actual game rules, and compares the
built game's replay with the original. Engine configuration and a growth record
are completed only with the corresponding evidence. Imported scripts/assets,
tuning, alternative Web starters and human play remain part of that acceptance.

`prototype grow-check` does not close T15, S040 or C2. It is available in the
development source; the published `v0.1.0-alpha.0` archive predates this command.
