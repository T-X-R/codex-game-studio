# Refresh evidence or upgrade a pin

Select the engine from actual project configuration and the request, then read
its existing VERSION.md. Multiple reference directories may coexist; directory
presence alone does not choose a different engine. If the request, config and
reference disagree, settle the target before changes. Preserve other engine
sets and unrelated project content. A missing runtime/root/reference is an
explicit prerequisite, not permission to regenerate everything from a template.

## Refresh: new evidence, same selected pin

Read current version, recorded sources and actual verification dates. Fetch
official new releases since the last verification, migration guides and newly
deprecated APIs relevant to the selected version. Update the appropriate
reference files with sourced findings, preserving older spans. Date only files
and claims actually reverified this run; historical copied material does not
become fresh evidence. Report what changed and any NOT SOURCEABLE gaps.

A release found during research is not a new project pin. Keep engine.version
and selected reference pin unless the owner separately chooses upgrade. Do not
install a new editor, migrate source, reseed an existing reference directory,
or rewrite the technical stack merely because a newer release exists. Reuse
already authorized refresh writes; a conflicting scope/choice still waits.

## Upgrade: audit first, then the selected metadata change

1. Read the existing pin, risk basis and migration-note URLs. Use it as old
   version when omitted. A provided old version that disagrees with actual state
   is a conflict, not historical truth. If target version is absent, research and
   confirm the desired version; never silently adopt latest.
2. Fetch the official old→new migration guide, breaking changes/changelog and
   deprecation information. Extract renamed/removed APIs, changed defaults,
   behavior changes and required migrations. Preserve actual URLs. Unavailable
   research is a gap; do not manufacture a clean upgrade audit from memory.
3. Resolve actual code root via engine inspect/effective engine_row. Scan only
   that root for the specific affected APIs, recording each actual file and
   matching reference with a justified Low/Medium/High effort estimate. When
   root is `.`, exclude framework/design/docs/tests/dependency/generated output;
   do not follow symlinks into unrelated work. Invalid/unresolved root means
   NOT ASSESSED, not zero affected files. A text search is not semantic proof
   that no version-sensitive behavior exists.
4. Present `Pre-Upgrade Audit: engine old → new`, a File / Deprecated API Found /
   Effort table, separately sourced breaking changes and a migration order
   grounded in actual system/layer dependencies. Say when dependencies or effort
   are unknown. No matches can be reported as no deprecated API usage found in
   the scanned root, with the actual scan limits; do not call every upgrade safe.
5. Settle the consequential version change after the audit. Explain that the
   proposed write changes pin/reference metadata, **not game source or the editor
   installation**. A prior explicit instruction may already authorize that
   concrete change; reuse it. A proposed target, changed risk/scope, or a skipped
   confirmation does not. Do not migrate code or create implementation stories
   merely because the owner authorized metadata.
6. Apply only the agreed metadata: update Engine Version, actual Project Pinned
   date, genuinely checked Last Docs Verified, risk/timeline with honest basis,
   and append `Migration Notes — old → new` containing source URL, relevant
   breaking changes, affected project files and migration order. Append spans to
   existing breaking/deprecated/practice docs without truncating history. Retain
   the true Installed at pin time observation until a new actual observation
   justifies changing it; updating a pin did not upgrade the executable.
7. Synchronize primary version and technical preference mirror through engine
   setup using the existing selected engine/primary language and intended new
   version; preserve other settings. Keep rich language/per-file notes, resolving
   conflicts explicitly. Document edits are scoped operations, **not** one
   cross-file transaction. Preserve before-images and stop/report any failed
   operation or resulting divergence; do not claim the pair and references agree
   until actual readback proves it. Do not bypass validation with direct YAML.
8. Run the shared verification/readback phase. Keep deliberate installation
   mismatches visible and distinguish accepted metadata choice from unverified
   runtime. A failed or partial metadata update is not a completed upgrade.

## Handoff

Report old→new and the concrete retained audit/evidence. One follow-up list:

1. Migrate the identified source usages manually or through scoped stories.
2. After upgrading the actual editor, refresh references and observe installation.
3. Use game-studio-architecture-review: engine changes can invalidate ADRs.
4. If ADRs are invalidated, propagate the change to downstream stories. If the
   propagate-design-change workflow is unavailable, identify that pending
   capability rather than inventing a native Skill call.

Do not execute these downstream stages automatically. A reference upgrade is
not an accepted ADR, completed source migration or tested release.
