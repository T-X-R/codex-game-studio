# S051 setup-engine — Codex source-mapped acceptance specification

Status: content candidate only. No native S051 scenario is verified by this
specification. Helper/unit/browser tests from earlier slices retain their own
scope and do not establish this full workflow's behavior.

## Source and product contract

Source is `.claude/skills/setup-engine/SKILL.md` and all thirteen references,
plus `studio-tests/skills/utility/setup-engine.md` (eleven original cases).
Source source-hashes are frozen with this candidate. Preserve upstream history;
these paths are migration input, never installed runtime reads.

Canonical target is `.agents/skills/game-studio-setup-engine/` and installed
`game-studio-setup-engine` for Codex desktop/CLI. The workflow chooses/configures
Godot, Unity, Unreal or Web, preserves existing games, authors version evidence,
scaffolds only supported missing projects, and supports refresh/upgrade without
silently migrating source. No director gate applies. Guided authorization is
reused; unanswered consequential choices wait. `COMPLETE` means scoped metadata
work completed with actual limitations, never a runnable game/QA certification.

## Every source phase mapped

| Source phase | Target | Required retained behavior |
|---|---|---|
| Entry/tier/modes | SKILL.md | full engine+pin, engine-only, guided, Web, refresh, upgrade; actual effective workflow; minimal missing brief normal |
| 2 guided | selection.md | existing config/markers first, design headings, Web-first exception, experience/platform/full profile, honest tradeoffs, owner confirmation, concept-specific deep dive |
| 3 version | version-and-risk.md | latest official confirmation only when needed, exact installed version/path, mismatch three choices, failed probe unknown, installed-at-pin-time always recorded |
| 4 stack | configuration.md, preferences.md, godot-language.md | Godot3language/Unreal2primary choices, full technology stack, selected reference access through stable pointer |
| 5 preferences | preferences.md, routing.md | naming, platform support table, missing genre question, Platform Notes, optional budgets/framework, no speculative libraries |
| 5.5 primary | configuration.md, commands.md | all source structured fields/OS commands, unknown/deferred values, coherent mirror, nondefault target/preset, partial rerun preservation |
| 6 risk | version-and-risk.md | LOW/MEDIUM/HIGH with honest coverage basis and reference obligation, no fabricated active-model cutoff |
| 7 docs | reference-docs.md | absent/same/older/newer branch, preserved historical spans/other engines, real URLs, NOT SOURCEABLE, no false dates or filler modules |
| 7.5 scaffold | scaffold.md, web-new.md | no existing overwrite, Godot values/no main scene/actual import, Unity/Unreal editor handoff, fourWebchoices |
| 8/8.5 | verification.md | stable pointer readback once, config/rich agreement, all coherence differences and unavailable checks reported, expected gdUnit gap preserved |
| 9 agent awareness | routing.md | real role reads actual project pin/deprecation/transitions; unavailable role honest; Web none |
| 10 refresh | maintenance.md | new official evidence/real verified dates, preserved pin/history, change report |
| 11 upgrade | maintenance.md | source API audit/file-effort/dependency order, actual choice, metadata-only changes, appended migration notes, shared+mirror sync, downstream handoffs |
| 12 finish | verification.md | truthful complete/partial status, one next-step list, real footprint heuristic, studio route onlystandard/full |
| Godot appendix A1/A2/A3 | godot-language.md | exact GDScript primary, actual .NET needs, BothGDScriptprimary with C# per-file, full specialist and extension tables |
| Web W1 | web-existing.md | detection/monorepo/PM/root decisions, own scripts/dependencies retained, frozen install, actual reports/diskimage, separate authorized hook |
| Web W2–W7 | web-new.md | runtime range, 4starters/locks/pins, selected renderer, full preview/gitignore, npmci, build/unit/browser split, firstimage, no engine specialist |

## Intentional Codex changes and fixes

- Claude frontmatter/preprocessing/allowlists become a Codex Skill with explicit
  installed runtime calls. No model, effort, approval or sandbox override. Desktop
  and CLI share the content; only actual host availability is reported.
- Repeated ordinary-file permission prompts become concrete previews plus reused
  guided scope. Unknown engine/language/version/shape/target/install/hook choices
  still wait. Read-only requests produce no writes.
- Source CLAUDE stack/import moves to project-owned technical preferences plus
  installer-owned stable AGENTS instructions. No @import fiction or installed
  TOML mutation. Retained legacy compatibility readers may observe source-era
  documents with warnings; this Skill never directly depends on that tree.
- Structured primary/mirror uses existing engine setup transaction; rich sections
  use md-section/bounded edits and final readback. Multiple operations are not
  called atomic. Both/routing conflicts require explicit reconciliation.
- Source's YAML parser quoting bug is not copied into the real YAML API. Commands
  are quoted for the actual POSIX/cmd execution host; Windows does not receive
  Bash pwd substitution. Unreal code root is Source under the actual engine
  table; its test_root separately needs the actual module, not a guessed name.
- Unknown exact existing-Web bundler version stays null; range-stripping was a
  source bug. Bundler build-script evidence has priority. No fake installed pin.
- Initial reference copy preserves historical dates and pins. Existing/empty/
  partial engine directories are never overlaid. Reference stage still must
  reconcile project applicability and perform sourced maintenance.
- Historical May2025 knowledge labels are retained only as historical/conservative
  basis, not asserted current-model training facts or freshly verified APIs.
- Current generic test runner retains execution logs but is not the Bash runner's
  parser/orchestrator. Skill executes real needed scripts separately and reads
  actual reports, never invents runner/rule JSON fields or equates exit0 with tests.
- New scaffold rejects all conflicting target files as a transaction instead of
  source skip-around-existing behavior; no partial mixed-version starter.
- Page-shot output is a new evidence directory; installed browser env is
  GAME_STUDIO_BROWSER. Screenshot existence/PNG validity is not visual approval.
- Source engine-specific parse checker/three-vendoring and unmigrated native
  specialists/test-setup/sprint-plan/propagate-design-change remain explicit
  unavailable capabilities, not fake equivalents. This does not shrink their
  domain responsibilities or mark them verified.

## Original eleven cases — all pending native acceptance

Each fixture keeps raw project data and request separate from maintainer-only
expectations. Use actual installed Skill/resource bytes, real question/answer
continuation where choices are missing, and real host processes when available.
Never supply expected answers, a forced verdict or prewritten reference findings
to the native request. No mocking of editor/browser evidence as real execution.

| Case | Raw source condition | Full acceptance obligations |
|---|---|---|
| 1 GodotGDScript | noengine/placeholders/noartifacts, ref4.7, no project marker, fullspec4.7 | real language question; shape and input question (missinggenre); targetpreset question/no default; complete conventions/routes/machinepair; HIGH historicalbasis; sameversion no restamp except real installed row; Godot scaffold onlymissing; actual import boundary; no guessed C++primary |
| 2 Unity | placeholders/engine-only, owner supplies version+buildtarget | researched version confirmation; C# no redundantlanguage orGodotshapequestion; URP/PhysX; allroutes/conventions; actual editor path and player-buildflag; constants explicitlyunverified; no fabricatedUnityproject |
| 3 UnrealWindows | fullspec5.8, owner notBlueprintprimary, actualWindows context | real primary/no-preferencehandling; C++ vsBlueprintrecord; allBlueprint/GAS/replication/UMGroutes; hostvalidabsolutecommands/TODO; engine.path; ask budgets; no uproject creation |
| 4 rerun | existingGodot4.7, partialsmoke, modes, existingmarker/ref | fillmissingkey withoutduplicate; unrelatedbytes preserved; projectmarker unchanged; sameversion dates/pin unchanged; actual installedrow refreshed only; rerun rich Both safe variant |
| 5 no gate | freshGodot engine-only | allapplicableconfiguration; no director spawning/gate IDs or fabricated gate skips |
| 6 installedolder | selected4.7, actual4.5.1, owner selectsnewer-upgrade-later | both versions and3options; genuineanswerwait; record4.5.1; no falseimportverification/date restamp |
| 7 nonPATH | actualWindows path withspaces, presetWindowsDesktop | allcommands exactquotedexecutable, portzero retained, engine.path; unknownpathvariant visiblyunrunnable, notfalseabsence; actualshellsyntax notsourceparserformatassertions |
| 8 skippedchoice | freshproject, actualquestiondismissed/unanswered | no inferredengine/language/pin, reaskplainquestion thenwait; no projectmetadata/docs writes |
| 9 existingWeb | webpackbuild/Jest/PhaserJS/npm lock/nohook/nodemodules | ownrecord/provenance; norenderphysics/scaffold; onlyauthorizedmetadata/evidence; originalgamebytes unchanged; frozeninstall onlyauthorized; ownbuild/testresults; diskimage fileaccess; nohookwithoutyes; workspacesvariant zerowrites |
| 10 newguided | noengine/no markers/no concept | Webfirstrecommended, editortradeoffsbeforequestion; wait beforewrites; follow realselectedWebbranch; consolebrief variant Webfirstnotrecommended with source-basedreason |
| 11 preserveengine | configuredGodot or onlyproject.godot marker | nameactualevidence; noenginechoice/Weboffer; engine remainsGodot; no markeroverwrite |

Cross-platform inputs cannot be relabeled as actual execution: a Windows command
fixture on macOS checks proposed text only. Actual Windows/Linux/editor behavior
requires that host. Godot4.7 pin is not verified by a different patch version
simply because both share4.7.

## Full source obligations beyond the original eleven

These are not optional removals because the old suite did not separately test
them. Keep each pending until its real branch/evidence is accepted.

| Area | Required scenarios and evidence |
|---|---|
| Godot language | C# and Both true ownerchoice; actual .NETeditor/SDK observed orpending; .gd/.cs/.csproj/per-file naming/routing survive structured sync; change-engine/primary conflict must not delete original notes |
| Godot shape | allfourshapechoices, unavailable/defer, mixeddimension explanation, targetincludesWeb, missingbrief inputquestion, no invented preset |
| Unreal variants | Blueprintprimary; Linux command forms; macOS only sourcedbuild/actualprovidedothers; testfiltercollision; unknownmodule remainspending |
| Preferences | allsupportrows/primaryinput; Platform Notes; set/deferbudgets; framework-commandagreement; originalallowed/forbiddencontent preserved; no speculative package |
| Reference lifecycle | absent/same/older/newer/partial sets; template mismatch; preservedenginecoexistence; sourceURL gaps; onlyactualverificationdate; historicspans retained; stablepointer and installerownerconflict |
| Refresh | actualfetch/selectedpinpreserved; updatedevidence only; ambiguoustarget waits; failurecannot become freshverification |
| Upgrade | actualold/newmatch, realguide, actualresolvedroot/filematches, unknownrootnotzero, dependencyorder, approval/decline, metadatanotsourcechange, pair/ref readback and partialfailure honesty; downstreamnotautocalled |
| Web starters | each none/three/phaser/pixi with exactpins/locks andactualrenderer; safe title; missingignoreapproval; targetconflicts; actualci/build/3unit/2browser each separately; titleimageactuallyopened; no single-librarygeneralization |
| ExistingWeb | allPMpriorities/conflictinglocks; monorepo; unknownexactversion; non-src/flatroot; actualTS/JS evidence/incomplete scan; customrunner/zero-test/no-script; noNode; refused/unavailableinstall/lockmismatch/no-lock; noBrowser; rootrelativeassets; preserveoriginalsource/lock/config |
| Hook | declinewait nochange; authorizedcommittedbaseline + scope-specificsourcepatch; realAPIwiring/manualstep; partialruntimeclocks notverified; actualtest/diff andseparatecommitdecision; preserve unrelatedstagedfiles |
| Verification | staticcoherence plus explicitlyauthorizedprobe, everydifference/unavailablecheck, expectedgdUnitgap, exactimportversusseriescoherence; no gate; metadataCOMPLETE nevergamePASS |
| User interaction | actual desktop and CLI availability/permission inheritance; real question/choice persistence; compacted/resumed phase reads current files; no forced decisions when headless |

## Maintainer checks and evidence contract

1. Confirm name/description, bounded entry, all local links, source-map completeness
   and no active legacy source paths. This is content structure, not native PASS.
Before native runs, verify literal generated Both/C# Language records survive a
same-input engine setup plan unchanged. Browser discovery and GAME_STUDIO_BROWSER
selection precede the e2e command. Non-Web next actions retain the source engine
spike intent as an unavailable native handoff, not an executable Web prototype.

2. Root verifies actual package resource paths, wrappers/dist imports, stable
   pointer and global/restored archive installation; private candidate links to
   pending helper integration cannot be called an installed working Skill.
3. Native host records actual developer Skill contents/hash, runtime/resource
   bytes, input/prompt hashes, configuration/sandbox/model provenance, complete
   parent/tool/child traces and all before/after regular-file hashes. Setup needs
   no director agent. Any actual role must be typed/native and available.
4. Audit actual decisions, commands, source URLs, reports/screenshots, protected
   bytes and owner scope. A wrapper0 or content-check pass is not semantic PASS.
   No browser/editor/download permission means named NOT ASSESSED, not skip-as-pass.
5. Preserve every initial failure and raw artifact; a justified correction is a
   fresh same-input run or authorized same-session revision, with changed resource
   hashes disclosed. Never weaken source obligations to obtain a green summary.

Current evidence: content only. All eleven native cases and the broader branch
matrix above remain pending. Existing helper/scaffold/4starter runtime evidence
can support those helpers' exact scopes but cannot be transferred into native
Skill acceptance, engine-specialist availability, desktop UI or human play claims.
