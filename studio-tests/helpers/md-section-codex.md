# Markdown section observations

This ports the read-only `list`, `status` and `extract` behavior of
`.claude/scripts/md-section.sh`. It is a narrow section parser, not a Markdown
renderer or a document-quality assessor. The retained source remains a test
oracle; the installed runtime does not execute Bash or read `.claude`.

Resolve `studio/scripts/md-section.mjs` through the pinned project runtime, then:

```text
node <resolved-md-section.mjs> --project ROOT list FILE
node <resolved-md-section.mjs> --project ROOT status FILE [HEADING ...]
node <resolved-md-section.mjs> --project ROOT extract FILE HEADING [--body]
```

JSON is the default, with `status: observed` and `qualityAssessed: false`.
`--text` returns the retained TSV or extracted text. `FILE` must be a project-
relative path without traversal, backslashes, drive prefixes or symbolic links.
Paths containing spaces are supported. The wrapper reserves its option names;
they are not heading selectors. No command writes the input file.

## Observed behavior

- Heading levels 1–6, inclusive line bounds and nested sections follow the
  retained parser. A parent extraction includes its child sections; `--body`
  removes only the selected heading line.
- Selectors normalize ASCII case, leading section numbers, emphasis and comments.
  A leading `#` sequence restricts the level. Non-ASCII case is not folded.
  `status` expands duplicate matches, while `extract` rejects ambiguity.
- `COMPLETE`, `EMPTY`, `PLACEHOLDER` and `NOT_FOUND` describe parsed content only.
  A fence-only section counts as COMPLETE; line-leading TODO inside a multiline
  HTML comment can count as PLACEHOLDER. These retained quirks are not evidence
  of design completeness, readiness or approval.
- Empty `list --text` retains the source's blank count after `headings\t`;
  JSON reports an empty array. Extracted text uses LF and a trailing newline
  when nonempty, including for CRLF input or an absent final newline.

| Exit | Meaning |
| --- | --- |
| 0 | Observation returned, including `status` with NOT_FOUND rows |
| 1 | Input/root unreadable or input is not a regular file |
| 2 | Invalid usage or unsupported writing command |
| 3 | Extracted heading not found |
| 4 | Ambiguous extraction or unsafe path |

`replace`, `insert-before` and `set-field` remain unimplemented. Consumers must
not infer write support from the source script's larger command set.

## Verification and limits

The helper's 44 tests including subtests exercise hierarchy, normalization,
duplicates, missing input, unsafe paths, real external directory links, wrapper
outputs, exact exit classes and unchanged input bytes/mtime. On macOS, 36
explicit Bash comparisons and 192 comparisons over 48 fixed-seed mixed inputs
verify source parity. Independent review corrected the Windows link fixture to
use a directory junction; portable CRLF assertions run separately from Bash.

Installed-archive checks resolve the actual pinned script, compare source bytes,
extract nested CRLF sections in both output modes, check missing/unsupported
commands and preserve original bytes. Node 24 and 26 integrated suites pass
locally. Bash comparisons are explicitly skipped on Windows; cross-platform CI,
native consuming Skills and writer commands require their own evidence.

See [recorded validation](../../docs/evidence/md-section-2026-11-13.json).
