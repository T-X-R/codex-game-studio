# Web project detection — Codex helper contract

Source: `.claude/scripts/web-detect.sh`, `.claude/scripts/json-flat.awk`, and
`.claude/skills/setup-engine/references/web.md` W1. The legacy sources are migration
inputs, never runtime dependencies. This helper observes an existing project; it
neither performs setup nor decides whether the project meets a quality gate.

## Installed entry and output

Resolve `studio/scripts/web-detect.mjs` through the toolkit's installed resource
lookup. Invoke its returned absolute path:

```text
node <resolved-web-detect.mjs> --project ROOT [--pm npm|pnpm|yarn|bun] [--text]
```

This internal resource wrapper imports `../../../dist/web-detect.js` relative to
`resources/studio/scripts`. No new top-level toolkit command, Bash, awk, package
installation or configuration is required. `--project` is explicit (unlike the
source checkout-relative default); duplicate/unknown flags fail. The source
`--root` spelling is replaced by the installed helpers' `--project` convention.

`detectWeb(ROOT, {packageManager?})` returns `{exitCode, data}`. JSON is the default.
`data.qualityAssessed` is always false. It contains `packageJson`, `workspaces`,
`lockfiles`, `packageManager`, the six observed `scripts`, derived `commands`,
`files`, `scan`, `language`, ordered `bundlers`, `engineVersion`, `testRunners`,
`libraries`, `hook`, `rows` and `diagnostics`. Missing package.json has only its
absence row, metadata and diagnostics. No field asserts that a command ran.

`--text` renders the source TSV row order: package, workspaces, locks, manager,
scripts, commands, code/test roots, test files, language, bundlers, engine version,
runners, libraries and hook. Tabs/newlines inside a cell are escaped. Incomplete
scans append a `scan` row; diagnostics append `diagnostic` rows. Ordinary complete
observations remain compatible with the source TSV. JSON retains full structured
provenance; TSV must not be parsed as a success verdict.

Exit codes: **0** observations returned (inspect diagnostics and scan.complete),
**1** unreadable root/file, invalid UTF-8/JSON/structure or metadata size limit,
**2** usage, **3** no root package.json, **4** unsafe required metadata path.
Optional installed package metadata errors become diagnostics, without replacing
an unknown version with an invented pin. Errors return `status: not_assessed`
and `qualityAssessed:false`, or stderr in text mode.

## Full source mapping

| Source behavior | Retained observation / intentional correction |
|---|---|
| Package-manager choice | Explicit `--pm`, supported packageManager field, unique lock manager, then npm without locks. Different lock managers without a choice yield `?`; all derived commands remain null. Lock conflicts remain observable even with an explicit choice. |
| Six lock variants | package-lock.json and npm-shrinkwrap.json → npm; pnpm-lock.yaml; yarn.lock; bun.lock and bun.lockb. Two npm locks are one manager. Lock contents are not parsed or asserted valid. |
| Install observation | npm ci; pnpm/bun install --frozen-lockfile; Yarn classic --frozen-lockfile or Yarn 2+ --immutable from declared packageManager. A chosen manager without its lock has no install command. Nothing runs. |
| Workspace boundary | package.json workspaces declaration (raw JSON in evidence) or pnpm-workspace.yaml. Any explicit declaration, including an empty one, is conservatively reported for caller review. No package/game is chosen automatically. |
| Scripts and commands | dev/start/serve/build/test/smoke verbatim; run chooses dev, then start, then serve. Test placeholder is unavailable. Explicit smoke wins, otherwise build. Manager-specific test/run spelling retained. |
| Dependency precedence | dependencies, devDependencies, peerDependencies, optionalDependencies; first declaration wins and its section is recorded. Invalid nonstring entries fail rather than disappearing. |
| Real roots | Exact-case real src directory; otherwise observed top-folder/flat `.` candidates, excluding tests, e2e and config files. Tests prioritize tests, test, __tests__, colocated src, then first byte-sorted folder. No tests retains table default; candidate absence does not choose a code root. |
| File observations | .js/.mjs/.ts/.tsx/.jsx only; .test/.spec suffix or __tests__ directory; count plus first five byte-sorted test folders. Source filenames are returned for provenance. Counts/candidates are partial when scan.complete is false. |
| Language | Regular tsconfig.json, then typescript dependency, then actual .ts/.tsx evidence, otherwise JavaScript on a complete scan. Incomplete scan without TS evidence yields Unknown, not inferred JavaScript. |
| Bundler families | Vite/vite; webpack; Parcel/parcel or parcel-bundler; esbuild; Rspack/@rspack/core or @rspack/cli; Bun from bun build. Package-family duplicates remain deduplicated as in the source. All observed families remain listed. |
| Bundler precedence | Recognized build-script command words precede dev/start/serve-only bundlers, then dependency-only observations; ties retain source family order. References to package-manager scripts expand two levels, without shell evaluation. |
| Version provenance | Raw declaration/source separate from exact installed version/source. Safe direct node_modules package.json exact version wins; otherwise only an already exact declaration is a declared-exact value. Ranges, tags, aliases, git/file/workspace dependencies remain unresolved without safe installed metadata. Bun/no bundler remains unknown. |
| Test runners | vitest, jest, playwright via @playwright/test or playwright, mocha, ava, uvu, cypress, web-test-runner via @web/test-runner, jasmine, tap. Two-level package-script expansion; actual named script evidence first. Nonplaceholder unrecognized test is other, not a dependency guess. Missing/placeholder script can observe dependency declarations with “no test script runs it”; none remains explicit. |
| Game libraries | phaser, three, pixi.js, @babylonjs/core, babylonjs, excalibur, kaplay, kaboom, playcanvas, matter-js, planck, howler. Raw versions and dependency-section provenance retained. |
| Hook | Lexical window/globalThis .game assignment, including `(window as any).game =`, outside test files/directories. Comparisons and arrows do not count. Comments/quoted strings are masked. No match on an incomplete scan is not_assessed. Presence does not establish the hook API, wiring, execution or replayability. |

The caller still owns W1's monorepo stop, manager/root decisions, record confirmation,
authorized config/mirror updates, build/test/install permission, real screenshot
and optional separate hook change. `other` cannot prove that tests ran; `none`
does not pass testing. Hook observations never authorize adding a hook. This
helper is not the complete S051 workflow and does not change a game's files.

## Read boundary and bounded work

The selected root is canonicalized. Child metadata paths use the existing
safePath contract (no traversal, absolute child paths, backslashes/colon, or
symlinks). Source traversal uses lstat and never follows links; skipped links
remain diagnostics. Files are opened read-only with O_NOFOLLOW where available,
checked as regular files, decoded as strict UTF-8 and size bounded. A caller may
explicitly select a root alias, but children are not followed through links.

Limits are fixed, not new public configuration: 20,000 entries, depth 32, 1 MiB
per read file, 16 MiB cumulative source content. Limit/read/link issues set
scan.complete=false; hook absence and JavaScript inference remain unavailable.
Present observations can still be reported alongside incomplete coverage. No
process, network request, install, write, chmod or configuration operation occurs.

Pruned at any depth: node_modules, .git, dist, dist-single, build, .claude,
coverage, .cache, production, docs, design, .agents, .codex, .game-studio,
toolkit, studio, studio-tests, .next, .nuxt, out. Direct installed bundler metadata
is the sole intentional node_modules read and obeys the same safety/size rules.
Custom output directories cannot be inferred universally; this explicit list
matches the source exclusions plus Codex/framework/common generated directories.

This is a bounded snapshot of an ordinary project, not a security boundary against
concurrent adversarial directory replacement. The portable filesystem APIs do
not provide a complete descriptor-relative directory walk. Script tokenization
is observational (no shell evaluation); dynamic wrappers/aliases may not reveal
the actual bundler or runner. Hook matching is lexical, not an ECMAScript parser:
computed properties, template interpolation, regex literals and shadowed globals
may need manual inspection. Lock integrity, package authenticity, runtime hook
execution and browser behavior are not assessed. Symlinked package-manager stores
are intentionally not followed, so resolved versions may be unavailable there.

## Intentional source repairs

1. Do not strip `^`, `~`, constraints or aliases to manufacture an exact version.
2. Build-script priority is stronger than dev-only family registry order.
3. Malformed JSON/invalid metadata shapes fail explicitly instead of becoming an
   empty successful project. Structured workspace evidence retains the declaration.
4. Symbolic links do not masquerade as real roots or lead outside the project.
5. Assignment comparisons/comments/strings and test fixtures do not establish a hook.
6. Scan bounds and read failures are visible, with conservative incomplete states.

## Acceptance evidence boundaries

Maintainer tests must execute the actual installed-layout wrapper and verify PM
priority/conflict, all lock/bundler/runner/library families, roots/language,
script expansion, version provenance, malformed input, safe traversal/limits,
TSV/JSON/exit codes and unchanged file bytes/mtime. Cross-platform directory-link
tests use a Windows junction and a POSIX directory symlink, never a privilege-
dependent Windows file symlink. Resource packaging is a separate root integration
check; this candidate's private installed-layout tests do not claim npm pack or
full S051/native/browser acceptance. Real source Bash comparison is maintainer-
only evidence and does not become a product dependency.
