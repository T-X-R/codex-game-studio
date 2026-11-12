# ADR dependency observations

From an attached workspace:

```sh
node .game-studio/run.cjs check --kind adr-deps --json
node .game-studio/run.cjs check docs/architecture --kind adr-deps --json
```

The portable migration of `.claude/scripts/adr-dep-graph.sh` reads top-level
`adr-*.md` files in the selected project-relative directory, defaulting to
`docs/architecture`. It extracts references from `**Depends On**` rows under
`## ADR Dependencies`, normalizes IDs to lowercase and deduplicates edges.
It preserves the upstream text rules rather than inferring dependencies from
other prose or introducing a Markdown parser. Files and directories with spaces
and Unicode are supported. Symlinks and path traversal are refused.

The result separates:

- `cycles`: cycle members and their outgoing edges within the same cycle.
- `blockedByCycle`: other ADRs that transitively depend on a cycle.
- `order`: remaining nodes, dependencies first, sorted by ID within each layer.
- `noDepsSection`: no dependency row was found; this is not an explicit “None”.
- `unfilledDeps`: the first dependency value is a bracketed placeholder and no
  ADR references were supplied.
- `missingDependencies`: referenced IDs with no matching ADR file. As upstream,
  they appear in the tentative order, but that does not mean they are implemented.
- `ignoredSelfReferences`: self mentions omitted from edges under the upstream
  convention; reviewers must still decide whether a self dependency is real.
- `duplicateIds` and `invalidFiles`: ambiguous or unidentifiable inputs. IDs
  come from filenames, so an `adr-123` directory name cannot replace a file's ID.
  Duplicate files contribute their combined declared edges and remain flagged.

Unknown dependency declarations are tentatively treated as leaves for ordering,
as in the source helper. The caller must review those uncertainties before using
the order. `qualityAssessed` is always false; exit zero confirms observation,
including observed cycles, rather than passing an architecture or phase gate.
No ADR files returns exit three / `not_assessed`. Invalid directory input returns
exit two, unsafe paths exit four, and read errors remain errors. Nothing is written.

Phase-gate severity, architecture review and stage updates belong to their
workflows, whose complete migration and host acceptance remain open.
