# Story status observations

Resolve the internal resource through the restored project runtime:

```sh
node .game-studio/run.cjs resource path studio/scripts/story-status.mjs --json
node <returned-path> --project <game-root>
```

The result is direct JSON, not a CLI `data` envelope. `qualityAssessed` is always
false. `stories` contains unfinished rows with their path, first Status value,
one-based source line and group; `counts` records Complete/Done and total files.
Rows are ordered In Review, In Progress, Ready/Not Started, Blocked, then other or
missing statuses. UTF-8 byte filename order is preserved within each group; other
and missing statuses stay interleaved in that order. This is observation data,
not permission to implement, close a story, advance a stage or claim tests passed.

The retained source's glob is exactly `production/epics/*/story-*.md`, excluding
hidden epic directories and deeper subdirectories. Status labels are case-sensitive
`Status:` with the source's supported Markdown decoration; values are classified
case-insensitively by leading ASCII words, matching the retained parser with
`LC_ALL=C`. Unicode characters remain word boundaries even when Unicode case
folding would map them to ASCII letters. `Done.` counts, while `Not Done` and
`Completed` do not. The first Status line wins, including an empty value. This
preserves the source parser rather than interpreting arbitrary Markdown headings.

`--text` reproduces the retained script's line format. No files prints
`STORIES      none`; an entirely completed set prints `COMPLETE N of M`, not an
empty-project result. Exit zero means observations were collected. Bad arguments
exit 2; unsafe paths, including symlinks, exit 4; other read errors exit 1 and return
`not_assessed` instead of silently calling the project empty or work complete.
The source shell script can silently misclassify unreadable files; that behavior
is deliberately not preserved. No game or project files are changed.
