# Markdown section observations and scoped writes

This ports `list`, `status`, `extract`, `replace`, `insert-before` and `set-field`
from `.claude/scripts/md-section.sh`. It is a narrow section parser, not a Markdown
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
they are not read heading selectors. Read commands never write the input file.
Writer operand grammar and safety differences are specified below.

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
| 1 | Input/root unreadable, nonfile, invalid UTF8 write target, or write I/O error |
| 2 | Invalid usage or payload |
| 3 | Selected heading or field/anchor not found |
| 4 | Ambiguous heading, unsafe path, or detected write conflict |

The writing commands preserve the mechanical source transformations below; they
do not establish workflow authorization, document quality or approval.

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
native consuming Skills and installed writer commands require their own evidence.

See [recorded validation](../../docs/evidence/md-section-2026-11-13.json).


## Writer implementation (2026-11-13)

The implementation provides retained `replace`, `insert-before` and `set-field`
operations. Previous reader evidence remains history. Integrated writer evidence
is recorded separately below.

```text
node <resolved-md-section.mjs> --project ROOT replace FILE HEADING < body.txt
node <resolved-md-section.mjs> --project ROOT insert-before FILE HEADING < block.txt
node <resolved-md-section.mjs> --project ROOT set-field FILE FIELD VALUE [--after FIELD2]
```

All writer JSON carries `status: observed`, `qualityAssessed: false`, `command`,
`path`, `action`, 1-based `line`, `dryRun` and `applied`. Action is `replaced`,
`inserted`, `set`, `added` or `unchanged`. An unchanged action has applied:false.
Actual `--text` writes preserve source receipt shape:

```text
file<TAB>FILE<TAB>ACTION
line<TAB>LINE<TAB>-
```

`--dry-run` is available only for the three writers and performs no file, staging,
backup or installation-state writes. It reports the proposed action with
`dryRun:true, applied:false`. Text previews prepend `dry_run<TAB>true` and
`applied<TAB>false`; they are explicitly not applied source receipts. Preview does
not reserve file content or establish later write permission. Actual use requires
an already authorized file/change scope; the helper does not supply that authority.

The existing `mdSectionCommand(root,args)` reader API remains valid. The optional
third argument is `{ readInput?: () => Promise<Buffer>, dryRun?: boolean }`.
The payload provider is called only by replace/insert, after target/argument
validation. It supplies actual pipe bytes without making read commands or set-field
wait for stdin. No stdin defaults to the source's empty-payload usage error. The
wrapper refuses an interactive terminal rather than asking for content or approval.

For new write forms, mandatory operands immediately after the command are literal,
including `--text` or `--project` as a value/heading/field. `--after` consumes exactly
one literal anchor. Put wrapper flags before the command or after its mandatory
operands. Duplicate/unknown trailing wrapper flags fail. Reader option behavior
stays unchanged; no new generic parser or CLI subcommand is introduced.

### Retained transformation rules

- Trim only blank space/tab lines at stdin ends, stripping one terminal CR per
  line; preserve spaces on nonblank lines and all internal blank lines. Empty
  payload is exit2 before heading lookup. VALUE rejects LF but accepts CR.
- replace preserves the heading and substitutes its entire body including nested
  sections, with one blank after heading and before a following peer/higher section.
- insert-before separates payload from target heading by a blank and adds a leading
  blank only when prior line has text. Only the identical immediate payload+blank
  block is idempotent; no broad search/de-duplication. Report payload start line.
- Field matching preserves source's plain/bold/quote/list styles and ASCII matching.
  It scans eligible content throughout the file, skipping heading/fence/comment
  lines. The first matching field or anchor wins, not a duplicate error. Existing
  field wins over --after. The raw suffix is the value, including inline comments;
  replacing it can remove that suffix. This is not a YAML/Markdown metadata editor.
- New replace/insert lines follow first input line's EOL; set/added line follows
  matched field/anchor's EOL. Untouched mixed-EOL lines preserve their CRs. A real
  change appends LF to an originally unterminated last line, as source does. No-op
  preserves original bytes, mode, inode and mtime, even without a final newline.
- Missing heading/field exits3; duplicate heading exits4; duplicate field uses first.
  UTF8 file/read/write errors exit1; bad usage/payload exits2; unsafe path or a
  detected concurrent content/identity/mode change exits4. All errors keep
  qualityAssessed:false and never imply a domain/workflow verdict.

### Approved safety differences and remaining limits

- Preserve established project-relative safePath constraints, including no symlinks
  (source follows them). A real write refuses nlink>1 instead of source write-through
  or silently splitting a hardlink. Read operations stay compatible; no-op leaves
  linked bytes and inodes alone. Dry-run computes an unapplied transformation.
- Reject invalid UTF8 file bytes before writing (exit1), and invalid UTF8 stdin
  (exit2), instead of corrupting decoded/re-encoded non-target content. UTF8 BOM and
  valid Unicode remain intact. Existing readers retain their decoding behavior.
- Open target without truncation for actual write permission before staging; rename
  alone must not bypass a read-only destination. Stage exclusively in its existing
  parent, chmod the owned temporary file to preserve ordinary mode bits despite
  umask, sync/close, recheck target, and atomically rename. No global atomicWrite
  change and no install journal/backup/planner is introduced.
- Atomic replacement deliberately changes inode. Arbitrary ACLs/xattrs/ownership,
  special mode bits and source inode identity are not promised. No-op no longer
  requires or creates source-style temporary files in a writable parent.
- Content/identity/mode rechecks detect tested conflicts, including changes while
  awaiting payload. They are not a kernel compare-and-swap or a claim against hostile
  directory changes between syscalls. Host permissions/sandbox remain authoritative.
- A helper write is one file, not an all-files story/checkpoint transaction. Caller
  workflow still owns its broader transaction, approvals and provenance rules.

### Candidate evidence

The original unsupported writer returned exit2 in a preserved RED run. Original
reader baseline44 passed. Isolated candidate strict TypeScript compilation passes;
Node24.22.2 and Node26.13.1 on macOS each pass113 tests with 0fail/0skip. The writer
suite includes54 actual Bash byte/stdout/exit comparisons; a separate preserved
20-case Bash probe also passes. The existing44 reader tests retain their prior
assertions except the one intentional unsupported set-field case now tests missing
VALUE instead. Existing228 reader Bash comparisons still run.

Permission checks exercised real 0444-file and 0555-parent failures on this account;
mode0666 survives process umask077. Hardlink rejection, real directory-link rejection,
UTF8 failures, exact EOL/no-op/Unicode, stale-content/identity/new-hardlink failures,
wrapper literal flags and side-effect-free previews are actual tests. Windows Bash
and Unix-mode branches have explicit skips; portable cases remain runnable there.

Root review and integration now pass build, typecheck, content lint and 362 tests
on each Node 24/26. The actual installed archive exercises all three writes, a
side-effect-free preview, literal flag values, no-op and missing-heading protection
from an unrelated working directory. See [integrated writer evidence](../../docs/evidence/md-section-writers-2026-11-13.json).
Windows/Linux CI and native consuming Skills remain separate acceptance work.
