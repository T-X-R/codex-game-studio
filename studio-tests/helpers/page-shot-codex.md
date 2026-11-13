# Existing-page screenshot — Codex helper contract

Source: `.claude/scripts/page-shot.sh` and setup-engine Web W1/W6. The Bash
source remains migration input; this installed helper requires Node 24–26 and
an installed Chromium-family browser. It does not download a browser.

Resolve `studio/scripts/page-shot.mjs` using `game-studio resource path`, then:

```text
node <resolved-page-shot.mjs> --project ROOT PAGE OUTPUT_DIRECTORY [options]
node <resolved-page-shot.mjs> --which [--browser EXECUTABLE]
```

The page and new output directory are project-relative. The wrapper imports
the installed `dist/page-shot.js`; it requires neither the maintainer checkout
nor Bash. JSON is default; `--text` emits escaped TSV observations. `--which`
prints only the selected executable. Duplicate, unknown and incomplete flags
fail before execution. `--dry-run` validates paths/options and discovers the
browser without launching it or creating profiles/evidence.

## Retained source behavior

| Source capability | Codex behavior |
|---|---|
| Direct local page | Open the original file URL, including a scriptless page. No copied/injected hook, dev server, build, source edit or replay inputs. |
| Query/render | `--query TEXT` preserves query key/value meaning through URLSearchParams; default adds `render=cheap`. `--full` omits that imposed default. It does not remove an explicitly supplied render query. |
| Size/wait | `--size WxH`, default 1280x720; `--wait MS`, default 2000 virtual milliseconds. Dimensions 1–16384; wait 0–600000. |
| Browser | `--browser` or `GAME_STUDIO_BROWSER`, then platform installations/PATH and installed headless shell caches. Explicit names resolve on PATH; Windows also searches `.exe` names. No shell evaluation. |
| Profile | Fresh temporary profile, removed after the operation. Explicit `--profile PROJECT_DIRECTORY` retains project-local browser state. Page, evidence and profile may not overlap. |
| Software rendering | `--software` enables the retained ANGLE/SwiftShader flags. It does not prove hardware rendering or visual correctness. |
| Disk modules/data | `--file-access` enables local file access for an existing build. Root-relative `/assets` URLs can still fail; no game configuration is repaired. |
| Fallback | Automatically selected browser failure without a screenshot may try an installed headless shell. An explicit browser remains authoritative, an intentional correction to source fallback. |
| Timeout | `--timeout MS`, default 60000, range 1000–600000. Timeout without a screenshot retries once with real-time Chrome timeout at half the process cap (minimum 1000 ms), unless `--once`. Interruption never retries. |
| Evidence | Each attempted process retains stdout, stderr and any raw PNG bytes. JSON and TSV expose attempt timing/exit, console lines, uncaught messages and selected screenshot. |

## Intentional interface and evidence changes

- `--project` replaces source `--root`; output is a new evidence directory,
  not an arbitrary overwriteable PNG path. Safe project paths reject escapes
  and symlink components. Existing output conflicts rather than overwriting.
- `GAME_STUDIO_BROWSER` replaces `PAGE_SHOT_BROWSER`. Explicit millisecond
  `--timeout` replaces the source seconds-valued environment setting.
- JSON is default, TSV optional. Timestamp is UTC ISO 8601; durations use
  milliseconds. Every attempt has its own logs instead of only the final log.
- Screenshot selection checks PNG container integrity: signature, chunk bounds
  and CRCs, first/single IHDR with nonzero dimensions, image data and final IEND.
  It does not decode pixels or validate every PNG semantic constraint. This uses
  the [W3C PNG structure and error-checking specification](https://www.w3.org/TR/png-3/).
  Incomplete or CRC-corrupt bytes remain `attempt-N.png` but never become the
  selected `screenshot.png`. Image viewing remains a separate acceptance step.
- A browser's nonzero exit is not converted to success merely because it wrote
  bytes. Exit **0** means planned or screenshot recorded; **1** input/I/O failure;
  **2** invalid usage; **3** unavailable capture; **4** unsafe/conflicting path;
  **124** timeout; **130** interruption. Source timeout exit 4 is intentionally
  replaced by the shared process contract.

`qualityAssessed` and `replayAssessed` are always false. A captured page with
console errors is still an observation, not a passing game. Browser absence or
unexpected filesystem/discovery errors can occur before evidence exists; the
wrapper reports these errors without claiming a retained attempt. Browser
arguments and console output may contain project data: review evidence before
sharing it. Temporary profile cleanup does not delete an explicitly kept profile.

## Acceptance scope

Portable subprocess tests cover source preservation, query/full/profile behavior,
console/error retention, invalid/truncated PNGs, failure logs, timeout retry and
`--once`, dry-run and path conflicts. Windows name discovery is simulated on
other hosts; native Windows execution requires its CI result. Actual browser
smoke tests cover unchanged seeded replay, a scriptless page, and local module
plus data loading with and without explicit file access. Installed-package checks
must resolve and invoke the wrapper through both the global and restored runtime.
These checks do not close S051, desktop acceptance or human play acceptance.
