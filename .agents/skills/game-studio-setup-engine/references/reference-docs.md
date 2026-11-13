# Install and maintain version evidence

Project-owned reference destination is `docs/engine-reference/<engine>/` with
VERSION.md, breaking-changes.md, deprecated-apis.md, current-best-practices.md
and only useful subsystem modules. Bundled source is
`studio/engine-reference/<engine>/`; its pins, dates and coverage statements are
historical template evidence, not observations of this machine or current model.
Web follows its existing/new branch before applying editor-engine rules.

## Seed only an absent reference set

Resolve `studio/scripts/engine-references.mjs`; run its installed path with
`--project ROOT --dry-run`. Review selected engine, project/template pin,
file actions and warnings. Under authorized scope rerun without --dry-run.
This initializer copies a wholly missing selected-engine set and missing common
README, never replaces or fills a partial existing engine tree. It preserves
other engines. No model-quality or installed-version assessment is implied.
If it reports existing/partial content, continue by inspecting that content;
rerunning seeding is not refresh or a way around a version conflict.

Read the selected VERSION.md and its actual unique pin before editing. A template
with an older pin can be a starting point but is not already the selected pin.
A higher bundled/current project pin must not be silently downgraded to the
chosen version. Present that conflict before writing a changed pin.

## Reconcile the selected project reference

- No VERSION.md: create the appropriate minimal/full reference from actually
  sourced information. Preserve other existing files; no silent mixed-version
  fill of a partial tree.
- Same version: no regeneration. Record the actual Installed at pin time result;
  do not restamp Project Pinned/Last Docs Verified unless the corresponding
  action really occurred.
- Older version: update in place and append every new version span. Update
  selected Engine Version, actual Project Pinned date, actual verified date,
  installed observation and timeline rows. Retain all older migration history.
- Newer version: stop for an explicit choice; it may be a deliberate forward pin.

Show the affected paths and proposed edits; reuse authorization only for that
scope. An engine change is not authorization to delete another engine's reference
set. Use the stable installed AGENTS pointer to locate the selected engine from
configuration; do not hardcode a second per-project pointer by editing AGENTS.

## Source every new claim

Fetch official migration guides, releases/changelogs, deprecations and API docs
for relevant version spans. Each new factual claim records its actual source URL.
Never fill reference gaps from memory. Write `NOT SOURCEABLE — <fact>, not stated
at <URL>` when the consulted source does not establish it. This is a useful
explicit result. An inference must name its evidence and be labeled as one;
no listed physics change does not prove the default stayed the same.

LOW risk needs a minimal VERSION.md with Engine Version, Project Pinned,
Installed at pin time, honest coverage basis and Risk Level. Full documents are
optional/recommended, not empty required files. MEDIUM/HIGH needs the full
reference set: version-by-version breaking changes from the established baseline,
deprecated→replacement APIs, new practices and significant subsystem changes.
Create modules only where actual changes justify them. Every modified sourced
file records its actual verification date; copied historical dates stay historical.

Appending newer spans must not truncate earlier ones. Regrade historical risk
only when an actual coverage basis justifies it, never merely because time passed.
Report source gaps and differing project/toolchain versions rather than treating
an existing directory as evidence the references are current.
