# Codex Game Studio migration proposal

Status: Implementation authorized by the owner on 2026-11-11; release/account details remain subject to the decisions below  
Date: 2026-11-11, Asia/Shanghai  
Source baseline: Claude Code Game Studios 1.3.0, commit `abc0de7`  
Working product name: Codex Game Studio  
Working command name: `game-studio`

Build an installable game development toolkit for Codex. The CLI supplies executable operations, Skills describe development workflows, and Codex performs reasoning, code generation, and agent orchestration. Users install the toolkit, open a new or existing game project in Codex, and work through natural language. A usable template repository remains a supported entry point.

This proposal covers product requirements, architecture, command contracts, installation, migration, verification, and publication. [The migration inventory](migration-inventory.md) accounts for every current Skill, role, rule, hook-directory script, and shared script. [The task list](todo.md) defines the implementation sequence and evidence required to complete it. All commands, target paths, and package names below describe the proposed implementation unless explicitly identified as existing.

## 1. Confirmed requirements and proposed decisions

### Confirmed with the owner

| ID | Requirement |
| --- | --- |
| R01 | Support both Codex desktop and Codex CLI. |
| R02 | Make the active product Codex-specific; retain upstream attribution. Dual Claude Code support is outside the target. |
| R03 | Use English as the primary public documentation language. Users can still interact in their preferred language. |
| R04 | Support cloning or using the repository as a template to begin a game. |
| R05 | Provide the CLI-plus-Skills experience exemplified by DingTalk Workspace CLI: install capabilities, then use them from Codex conversation. The CLI must perform real operations, not only installation. |
| R06 | After the user confirms goals and important decisions, continue implementation, verification, and fixes within that scope without approval for every file. |
| R07 | Publish the adapted project to a new repository owned by the user, with a potentially new name. |
| R08 | Complete requirements and design before implementation. Design was completed before implementation, which the owner subsequently authorized. |

### Proposed defaults

The owner authorized implementation according to this plan on 2026-11-11. Use the technical defaults below. The GitHub owner is `T-X-R`, repository is `codex-game-studio`, and archive package identity is `@t-x-r/game-studio`. Distribution is GitHub source and installation archives; npm registry publication is deferred.

| Decision | Proposal | Reason and alternative |
| --- | --- | --- |
| Product identity | `Codex Game Studio`; command `game-studio`; archive package `@t-x-r/game-studio` | Confirmed user-owned identity; no npm registry publication. |
| Implementation | TypeScript, Node.js 24 LTS minimum; test Node.js 24 and 26 | Fits the existing JavaScript browser driver and Web templates. Go offers standalone binaries but adds another language without removing browser/engine dependencies. |
| Package structure | One npm package, one repository, no service or daemon | Keeps release and dependency management small. |
| Installation | Explicit CLI install followed by explicit Codex Skill setup | Avoids silently changing Agent configuration during npm installation. |
| Skill scope | One global discovery/onboarding Skill; project-scoped workflow Skills and roles | Discoverable in an empty folder without globally loading all 75 workflows. |
| Runtime version | Exact project-local toolkit version, restored through a small private package under `.game-studio/` | A global upgrade must not silently change an existing game's execution behavior. |
| Collaboration | `guided` by default, preserving stricter and more autonomous options | Matches R06 while retaining configurable workflows. |
| Platforms | macOS and Linux first verified beta; native Windows included in the stable CLI target | Existing Bash dependencies must be ported or explicitly gated, not hidden behind a portability claim. |
| Engines | Preserve Web, Godot, Unity, and Unreal workflows; prove Web end to end first | Engine-specific execution claims require actual engine evidence. |
| Plugin | Optional later distribution adapter, excluded from first-release completion | CLI plus Skills already provides the requested experience. |

Node.js 24 and 26 are listed as LTS in the [official release table](https://nodejs.org/en/about/previous-releases). The exact supported Codex desktop builds and CLI version range will be established by the compatibility work in M0; the locally observed CLI `0.162.0` is a candidate test version, not a proven minimum.

## 2. Product scope and user experience

The product is a game development toolkit used by Codex, not a separate model client. It does not require its own OpenAI API key, proxy model traffic, recreate Codex sessions, or launch another hidden Codex instance for each command. Codex remains responsible for design judgment, implementation, and subagents.

### Supported journeys

| Journey | Expected experience | Acceptance outcome |
| --- | --- | --- |
| Install once | Install the CLI, register the global onboarding Skill, open Codex | A game-related request can discover the toolkit; unrelated requests do not trigger it. |
| Start from nothing | Open an empty directory and describe a game | Confirm a brief, create a playable prototype, run checks, hand over evidence and limitations. |
| Start from template | Clone/use the repository, follow its setup, open Codex | The same game workflow works without editing framework internals. |
| Bring an existing game | Open the game, ask Codex to enable the toolkit | Inspect first, preview integration changes, preserve existing code/configuration, then attach. |
| Iterate | Ask for a mechanic or visual change | Preserve agreed constraints, implement, retest, and update the checkpoint. |
| Grow | Ask to turn a prototype into a maintained project | Scaffold the selected Web setup, preserve behavior, and establish tests/builds. |
| Studio workflow | Ask for design, architecture, planning, or specialist review | Use relevant roles and workflow depth; produce traceable artifacts. |
| Resume | Reopen the project in another session/client | Reconstruct state from files and actual repository status, including unresolved decisions. |
| Package | Ask for a distributable build | Produce and inspect a local package; uploading or publishing is a separate authorized action. |

### Proposed setup flow

Install the archive downloaded from the user-owned GitHub release. `<version>` denotes the selected release; check its compatibility record before installing.

```bash
npm install -g /absolute/path/to/t-x-r-game-studio-<version>.tgz
game-studio skills setup --scope user --target codex --dry-run
game-studio skills setup --scope user --target codex
```

The user can then open Codex in a target folder and say, for example, “Make a small fishing game where rare fish appear at dusk.” The global Skill checks the installation, explains any project setup required, and uses `init` or `attach`. After project integration, the appropriate workflow Skills take over. Changes requiring a new Codex session or hook trust review are reported explicitly.

For manual setup:

```bash
game-studio init ./my-game --engine web --dry-run
game-studio init ./my-game --engine web
game-studio restore --project ./my-game --archive /absolute/path/to/t-x-r-game-studio-<version>.tgz
game-studio doctor --project ./my-game --json
codex --cd ./my-game
```

For an existing project:

```bash
game-studio attach --project ./existing-game --dry-run
game-studio attach --project ./existing-game
game-studio restore --project ./existing-game --archive /absolute/path/to/t-x-r-game-studio-<version>.tgz
```

`init` creates a new workspace; `attach` integrates an existing one without relocating game code. A cloned framework template uses `attach` with the recognized template content as its input. Both routes produce the same managed integration. Neither silently commits, changes remotes, or publishes anything.

## 3. Capability map and dependency boundaries

| Module ID | Responsibility | Depends on |
| --- | --- | --- |
| `cli-core` | Command parsing, JSON results, project discovery, process execution, version dispatch | None |
| `project-state` | Configuration, stage/state observations, checkpoints, artifact paths | `cli-core` |
| `game-operations` | Scaffolding, preview, browser evidence, engine commands, local packaging | `cli-core`, `project-state` |
| `codex-integration` | Skills, roles, instructions, hooks, installation ownership and project attachment | `cli-core`, `project-state`, `game-operations` |
| `verification` | Contract tests, migration checks, behavioral scenarios, compatibility records | All preceding modules |
| `distribution` | npm archive, usable repository template, documentation, GitHub release | `verification` |

Build `cli-core` and the minimum `project-state` first, then one complete prototype journey across `game-operations` and `codex-integration`. Extend that path with checks and recovery before migrating the rest of the workflows. Module IDs remain stable even if internal directories change.

The CLI's operations must work without importing Skill instructions or invoking an LLM. Skills may invoke CLI operations, read references, and coordinate Codex agents. Installation and release code may package these modules but cannot become a second source of workflow logic.

## 4. Architecture and repository layout

```text
User in Codex desktop or CLI
          |
          v
Global onboarding Skill / project workflow Skills
          |
          +---- Codex native subagents (selected roles)
          |
          v
game-studio command contract
          |
          +---- project configuration and checkpoints
          +---- file and artifact validation
          +---- browser evidence and game build/test processes
          +---- local export/package operations

Codex lifecycle hooks ---> bounded CLI hook adapter ---> same validators
```

### Maintainer repository and template route

Keep toolkit implementation out of the game's `src/` and root `package.json`. A Web game must be able to own those paths after it grows.

```text
AGENTS.md                      concise root guidance
README.md                      English install and natural-language quick start
LICENSE                        preserved MIT notice
toolkit/
  package.json                 CLI package and maintainer scripts
  package-lock.json
  src/                         CLI implementation
  test/                        deterministic CLI/integration tests
  dist/                        generated publish payload, not hand maintained
.agents/skills/                canonical project workflow Skills
.codex/agents/                 canonical project role definitions
studio/
  onboarding/                  global discovery Skill source
  codex/                       hook/config/launcher templates
  rules/                       scoped rules and applicability index
  scripts/                     reusable support scripts during migration
  docs/                        shared workflow references
  templates/                   document and game templates
  engines/                     engine descriptors and starter resources
  genres/                      genre resources
project.yaml                   game configuration, existing schema preserved where possible
design/                        game design artifacts
src/                           game source, initially empty
production/                    game planning, checkpoints and evidence
studio-tests/                  workflow and role behavioral specifications
tasks/                         this migration plan, not a game task database
```

The repository remains usable as a game template, including its framework sources, as the upstream repository is today. `init` produces a smaller consumer project without maintainer sources or migration documents. Build tooling packages the same canonical Skills, roles, resources and templates; generated copies are never edited independently. A separate template repository is not required for the first release.

### Installed consumer project

```text
AGENTS.md                      preserved user content plus bounded integration pointer
.agents/skills/                managed game-studio-* workflow Skills
.codex/agents/                 managed game-studio-* role definitions
.codex/hooks.json              reviewed project hook bindings, merged conservatively
.game-studio/
  package.json                 private package pinning exact toolkit version
  package-lock.json            committed reproducible dependency resolution
  run.cjs                      generated local launcher, no implicit download
  install.json                 managed file ownership and previous hashes
  node_modules/                ignored installed runtime and bundled shared resources
  backups/                     ignored installation backups
  cache/                       ignored transient runtime files
project.yaml
project.local.yaml             ignored personal overrides
design/
production/
<existing engine directories>
```

The checked-in launcher resolves the project-local runtime, so hooks do not depend on a globally installed binary being visible to the desktop app. The global command resolves the project and dispatches to its exact local version for game operations. Bootstrap operations (`version`, installation diagnostics, Skill setup, `init`, `attach`, `restore`, `upgrade`, and `detach`) can run without a functioning project runtime; they validate the installation-manifest version before changing it. Dispatch is single-hop and must not recursively invoke the global command. A missing or incompatible local runtime reports a recovery command; it does not download packages while servicing a hook or state query.

`game-studio restore --project PATH` restores the committed private package lock through npm in `.game-studio/`. Its network effects are disclosed. It does not run `npm install` in the game's package or alter its dependencies. Repository-template users restore the released package corresponding to the template release; maintainers can test a locally packed archive before publishing it.

## 5. CLI design and contracts

### Public commands for the first complete release

The table defines command families. Each leaf will have one argument schema, effect classification, result schema, and focused test. Only deterministic operations become commands; writing a compelling game design remains a Skill workflow.

| Command | Purpose | Effect |
| --- | --- | --- |
| `version` | Report CLI, project runtime and bundle versions | Read |
| `doctor` | Check dependencies, installation, capability/trust evidence and version compatibility | Read; optional explicit smoke probes |
| `skills setup`, `skills remove` | Install/remove the owned global onboarding Skill | User-scope write |
| `init <path>` | Create a fresh game workspace | Project write |
| `attach` | Integrate an existing project | Project write |
| `detach` | Remove unchanged owned integration; preserve game artifacts | Project write |
| `restore` | Install the exact project runtime from its lockfile | Dependency/network write |
| `upgrade --to <version>` | Prepare and apply a project toolkit update | Dependency/network and owned integration write |
| `status` | Report stage, engine, artifacts and open work from evidence | Read |
| `config get`, `config set` | Read provenance-aware settings or update an allowed key | Read / project write |
| `resource path <id>` | Resolve a known bundled reference/template for Codex to read | Read |
| `prototype scaffold`, `prototype import` | Create a prototype skeleton or copy an existing game | Project write |
| `prototype grow`, `prototype tune` | Apply the selected growth scaffold or tuning support | Project write |
| `engine setup`, `engine inspect` | Configure or inspect an engine and its paths | Project write / read |
| `preview` | Run a local foreground preview process | Process/local network |
| `check` | Run selected deterministic validators | Read by default; evidence write when requested |
| `test` | Run configured tests with bounded execution and preserved logs | Process/evidence write |
| `capture` | Run browser scenarios and capture evidence | Process/evidence write |
| `package` | Produce a local distributable artifact | Output write |
| `checkpoint show`, `checkpoint save` | Read/save structured progress and recovery references | Read / project write |
| `schema <command>` | Describe an individual command for agents and tooling | Read |

Private `hook <event>` entry points are callable by generated hooks but are not a user workflow API. Helpers needed only by a few advanced Skills can remain bundled internal scripts initially. Before stable release, each must have an explicit invocation contract and no dependency on a `.claude` project directory. Do not turn all 54 helpers into public subcommands merely to give them names.

### Common behavior

- `--project <path>` explicitly chooses the game workspace. Otherwise locate the nearest initialized ancestor; nested projects win over a parent repository. Do not silently use the toolkit installation directory as the game root.
- `--json` emits exactly one result object on stdout for a finite command. Diagnostics and progress go to stderr. Child output is captured in evidence files or stderr, not mixed into JSON.
- `--dry-run` on mutating commands returns planned writes, deletions, processes and network effects without applying them. It must not install dependencies, launch an engine, or write a backup while previewing.
- `--yes` means the caller has already authorized the displayed scope. It cannot bypass file conflicts, hook trust, Codex permissions, or destructive-output checks.
- Non-interactive commands with unresolved decisions return `NEEDS_INPUT`; they never wait forever on stdin. An Agent Skill uses the user's prior authorization or asks the missing question.
- Shell/process arguments use arrays by default. Legacy shell command strings are supported only as explicitly configured project commands, identified as such in the execution plan; they are not interpolated from user prose.
- `preview` is deliberately foreground and long-running: readiness JSON is one event, logs go to stderr, and Ctrl-C ends its process tree. It binds to localhost by default. A fresh process after a resumed chat is not inferred from an old checkpoint.
- Package creation uses a new/versioned output path or explicit replacement of an owned output. It must not recursively delete an arbitrary user-selected directory.
- `schema` and `--help` are generated from the same command definitions. Unknown arguments fail rather than being ignored.

### Machine-readable result

```json
{
  "schemaVersion": 1,
  "command": "check",
  "status": "not_assessed",
  "data": {
    "checks": [
      {
        "id": "browser-smoke",
        "status": "not_assessed",
        "reason": "Browser executable not configured"
      }
    ]
  },
  "artifacts": [],
  "warnings": [],
  "error": {
    "code": "DEPENDENCY_MISSING",
    "message": "Configure a supported browser before running browser checks."
  }
}
```

Use `status: ok | failed | blocked | not_assessed`. `data` is command-specific and validated at the boundary; `artifacts` contains paths, types and content hashes when evidence was produced. `error` is nullable. A successful inspection can report an unhealthy project in `data`; a requested check that could not run must not return a passing check result.

| Exit code | Meaning |
| --- | --- |
| 0 | Requested operation completed successfully; individual observations remain in the result |
| 1 | Unexpected internal failure |
| 2 | Invalid arguments, incompatible schema, or malformed external input |
| 3 | Required dependency/capability absent or requested assessment unavailable |
| 4 | Conflict, unsupported migration, or required user input/authorization |
| 5 | Validation/test failure |
| 124 | Execution timeout |
| 130 | User interruption |

The hook adapter translates this contract into Codex event-specific output and blocking conventions; it must not pass these exit codes through blindly. CLI-level “passed” means a deterministic criterion was satisfied. Fun, design quality, review judgment, and human play acceptance remain separately attributed decisions.

### Implementation conventions

Use TypeScript strict mode, small command handlers, Node's process/filesystem APIs, a maintained YAML parser, and a TOML parser where needed. Use `node:test` for CLI contracts and integration tests. Preserve the current browser driver initially; choose a new browser automation dependency only if the compatibility spike demonstrates a need. Lock selected dependencies before implementation batches.

Illustrative boundary, not code to add in this phase:

```ts
async function statusCommand(input: StatusInput): Promise<CommandResult<ProjectStatus>> {
  const project = await resolveProject(input.project);
  const data = await inspectProject(project);
  return { schemaVersion: 1, command: "status", status: "ok", data,
    artifacts: [], warnings: [], error: null };
}
```

Do not introduce a generic workflow interpreter, remote API, database, plugin SDK, or persistent scheduler. File-based configuration and focused operations are sufficient for the current product.

## 6. Skill and role delivery

Codex supports repository Skills under `.agents/skills`, and a Skill's required metadata includes `name` and `description`. Optional `agents/openai.yaml` supplies presentation and invocation policy. Use short descriptions, focused triggers, and references loaded when needed; do not load every workflow body at startup. [Official Skill documentation](https://learn.chatgpt.com/docs/build-skills)

### Skill layers

1. Install one user-level `game-studio` onboarding Skill in the selected Codex-supported user Skill root. Detect `CODEX_HOME`/host conventions and show the actual destination before writing; do not blindly hard-code the currently active desktop environment's paths.
2. `init`/`attach` materializes the 75 project workflow Skills using a `game-studio-` prefix. Existing built-ins or unrelated user Skills must not be overwritten.
3. Retire the three old aliases (`help`, `settings`, `changelog`) from active installation. Document their replacements; their underlying capabilities remain.
4. Install only one copy per scope. Reattachment detects an existing global full bundle or legacy managed copy and proposes a deduplication plan; it does not delete by prefix alone.
5. Rewrite `${CLAUDE_SKILL_DIR}`, `$ARGUMENTS`, `!` command substitutions, hard-coded tools, and model pins. Skills explicitly resolve configuration and invoke commands. Arguments in user prompts are workflow inputs, not automatic host substitutions.

The global Skill handles discovery and setup only; project Skills own game work once attached. Shared resources resolve from the pinned runtime via `resource path`, while Skill-specific references remain beside their Skill. No Skill assumes that a path beside the installed CLI is writable game content.

The Skill catalog must fit the verified host's discovery limits. Measure the full 75-Skill set with concise descriptions in both clients. If Skills are omitted, resolve this with measured metadata reduction or an explicit capability-pack design before release; do not silently call missing Skills “fully supported.”

### Roles and collaboration

Preserve all 49 professional roles as project-scoped, namespaced Codex custom agents. Translate role instructions into TOML definitions using supported fields; inherit the user's model/effort by default. Claude's `tools`, `maxTurns`, `model`, and memory metadata are not assumed to map directly. Codex documents standalone role definitions in `.codex/agents/`; children inherit parent execution permissions. [Official subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)

Each delegated task contains its goal, input paths/sections, allowed write scope, dependencies, expected artifact, and completion criteria. Skills explicitly request delegation where the workflow requires it. The coordinator schedules independent tasks within available capacity, waits before dependent stages, and reports partial/blocking outcomes. Avoid a mandatory multi-level management hierarchy for small tasks.

Parallel writers must have disjoint ownership. The coordinator owns shared planning/checkpoint updates; append-only agent events are separate from mutable project state. Persist role memory as project artifacts when needed, not as an assumed host-native memory feature. A single-agent fallback must be labeled and cannot count as independent review.

The default `guided` policy asks about goals, substantial scope changes and consequential design choices. It continues through already authorized implementation and verification. `collaborative` is explicitly selectable; `autonomous` does not override host permissions or create permission to publish. Preserve distinct rigor/review/team-size semantics in `project.yaml` rather than collapsing them into one flag.

## 7. Hooks, rules, and recovery

Current official Codex Hooks support project-local configuration and require trust review. `apply_patch` hook input differs from Claude's file-edit payload; matching multiple handlers may run concurrently. Supported blocking output is event-specific. These are integration contracts to test, not a promise that existing shell handlers will work unchanged. [Official Hooks documentation](https://learn.chatgpt.com/docs/hooks)

### Hook groups

| Group | Target behavior | Verification |
| --- | --- | --- |
| Startup/resume | Identify workspace, load a concise checkpoint, report missing integration | Root/subdirectory starts, resume, missing state, bounded output |
| Before edit | Validate proposed multi-file patch and protected artifacts | Add/edit/delete/rename, paths with spaces, malformed patches, atomic rejection |
| Before command | Check relevant commit/push and configured operation constraints | Direct CLI and Codex command paths; allowed and denied fixtures |
| After operation | Gather asset/registry observations and recommend relevant checks | Failed child commands, bounded logs, no false success |
| Agent lifecycle | Record actual role execution and artifact completion | Repeated events, concurrent agents, missing identity fields |
| Stop/compaction | Persist/restore pointers and report incomplete work | Interrupted turns, repeated Stop, manual/automatic compression |

Do not pretend a Claude `Read` matcher covers `rg`, shell reads, and arbitrary connectors in Codex. Treat large-document reading as a scoped instruction/resource command unless verified interception exists. Unsupported notification and status-line behavior is replaced by native client feedback or explicit `status` output, and recorded as such.

The adapter normalizes inputs, validates affected paths against the selected workspace, and translates results into supported responses. Shell writes and external tools are separate paths: patch validation alone does not cover them. Protect release quality through explicit checks/CI as well as hooks. Hooks are workflow checks, not a substitute for the host sandbox or a security guarantee against arbitrary programs.

Non-managed hook trust is never auto-accepted. `doctor` distinguishes files installed, configuration parseable, trust known/unknown, and actual execution observed. It must not infer that hooks ran from file existence. Unknown status is visible. Hook timeout/error scenarios are tested so a failed adapter cannot be mistaken for a successful guard.

Preserve `production/session-state/active.md` as the human-readable recovery record, with references to current stage, agreed constraints, decisions, work in progress, test evidence, and next actions. Use atomic replacement and an expected-content hash for coordinator saves to detect concurrent changes. Record append-only events separately. Repeated lifecycle events must not duplicate completed work. Recover from disk and Git reality; a checkpoint is not proof that a browser, server or subagent process survived.

## 8. Installation, ownership, upgrades, and removal

Installing the executable and configuring Codex are separate visible operations. No npm lifecycle script silently writes global Skills, `AGENTS.md`, `.codex/config.toml`, or hook trust state.

An installation plan lists each create/update/conflict, source version and content hash. On application, unchanged owned files may be updated; modified or unowned paths become conflicts. Track ownership explicitly in `install.json`. Names and prefixes alone never authorize deletion.

For `AGENTS.md`, preserve the existing text and add a bounded integration section or reference only after presenting its diff. If `AGENTS.override.md` takes precedence, integrate with the actual active instruction route or report the unresolved conflict. Directory guidance remains scoped; do not assume a root session automatically loads all descendant files. Existing `.codex` configuration and hooks are parsed and merged conservatively, retaining unrelated entries. [Instruction discovery documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

Installation mutations use a per-project lock, a preparation directory and a journal/backups for rollback. Revalidate destination hashes before applying a previewed change. A failed step restores previously replaced owned integration files. Re-running `init`/`attach` against the same version is a no-op when managed contents match. Unresolved concurrent changes stop application.

Version domains are distinct: toolkit package version, command result schema, project configuration schema, and content bundle version. A bundle is tied to its toolkit release. Preserve the upstream configuration semantics first; introduce an explicit schema migration only when a structural change requires it. Adding fields does not by itself justify rewriting every existing config.

Global CLI upgrades do not rewrite project bundles. Project `upgrade --to VERSION` stages the exact runtime, dependencies and content; compares managed files; applies a reviewed plan; and records the old state. There is no mutable remote “latest” lookup in normal game commands or hooks. Downgrades/schema rollback are permitted only when defined and tested, otherwise return a clear conflict. Keep prior backups until explicit cleanup.

Toolkit-generated launchers, copied Skills and role definitions must change together with the runtime pin. Refuse a partially upgraded bundle instead of mixing new instructions with an old command contract. A local customization remains a conflict to resolve, not a file to overwrite for version consistency.

`detach` removes only unchanged owned integration after preview. It never deletes game code, design documents, assets, tests, checkpoints, evidence, or user modifications. A copied global Skill cannot carry a hidden absolute dependency on the maintainer checkout. Resolve project resources independently of the caller's current directory, including paths with spaces, Unicode paths and worktrees.

## 9. Migration strategy

Preserve domain knowledge and behavior; rewrite runtime coupling. The inventory is the per-item accountability list. “Retain” means preserve the capability with converted paths and host contracts, not copy a file verbatim.

| Area | Migration rule |
| --- | --- |
| 75 workflow Skills | Migrate triggers, instructions, references, examples, parameters, role calls and checks; verify one behavior per workflow |
| 3 aliases | Retire active aliases; map them to retained workflows in migration docs |
| 49 roles | Preserve professional expertise; replace Claude metadata and per-file approval language |
| 14 scoped rules | Preserve applicable standards; publish an applicability index and test how Skills load them |
| Hook scripts | Separate host input/output adapters from reusable validators; test actual dispatch |
| Shared scripts | Port core/platform-sensitive operations into TypeScript; reuse engine/browser resources where practical |
| Config and state | Preserve precedence and rigor expansion; migrate renamed keys explicitly |
| Reference docs | Move shared framework docs out of `.claude`; keep project engine docs and registries as game artifacts |
| Test specifications | Adapt to Codex behavior, distinguish static checks from live workflow evidence |
| Documentation/branding | Rewrite setup, examples, contribution, security and upgrade docs; retain origin/license/history |
| Repository metadata | Update CODEOWNERS, funding links, issue/PR templates and release URLs deliberately; no invented owner or sponsorship details |

During implementation, use an isolated development branch and small behavioral slices. Keep the current source until each migrated area has passing evidence, then remove its active Claude-only counterpart. Do not ship two independently editable workflow trees. A scoped residual scan permits historical attribution and migration documentation but rejects active `.claude` paths, Claude tools, dynamic substitutions, and Anthropic model aliases.

The prototype migration must preserve the existing seeded input/replay and evidence semantics. Do not replace detailed browser checks with “page opened” and call it parity. Imported games must remain unchanged in their original location. Growth and packaging must preserve user-owned assets and explicitly identify omissions.

## 10. Verification and release criteria

### Test layers

| Layer | What it proves | Required evidence |
| --- | --- | --- |
| Static | Manifest syntax, references, names, schemas, inventory coverage and no active Claude coupling | Machine report with exact counts |
| CLI contracts | Arguments, stdout, status/exit codes, dry-run, conflict and timeout behavior | `node:test` results and CLI subprocess fixtures |
| Filesystem integration | Install/attach/upgrade/detach preservation and idempotency | Before/after snapshots, rollback tests, Unicode/space/nested paths |
| Hook integration | Real host dispatch, denial and feedback behavior | Disposable workspace transcripts plus observed filesystem outcomes |
| Skill behavior | Appropriate triggering, workflow steps, authorization, artifacts | Scenario-based evidence per primary Skill |
| Role behavior | Actual delegation, role boundaries and meaningful results | One smoke scenario per role plus orchestration scenarios |
| Game journey | A game is built, tested, changed, recovered and packaged | Runnable artifact, logs, screenshots and human play notes |
| Distribution | An archive works without the maintainer checkout | Clean install from `npm pack`, Skill setup and template flow |

Preserve `studio-tests/` as the behavioral catalog. Rewrite the old linter, which currently requires Claude-specific metadata. Zero discovered tests, unavailable dependencies, missing reviewers, and incomplete browser observations must not count as passed. Avoid tests that simply restate a renamed directory.

### Mandatory scenarios

1. Empty directory to playable Web prototype from a natural-language prompt in each Codex client.
2. Existing project attachment preserving its code, dependency files, AGENTS instructions and unrelated Codex settings.
3. Prototype import, modification, replay comparison, growth and local packaging.
4. Game logic regression that fails before a fix and passes afterward.
5. Positive and negative hook cases for single/multi-file patches and relevant shell commands; untrusted/missing/broken hooks visibly distinct.
6. Session restart and compaction recover agreed constraints and outstanding work without duplicate actions.
7. Two independent roles run and return results; a dependent task waits; a blocked role is reported; shared state is not corrupted.
8. Install twice, attach twice, interrupted upgrade, modified owned file, unrelated same-name file, runtime mismatch, offline restore and safe detach.
9. Missing browser/engine and zero-test output produce unavailable/incomplete evidence, not success.
10. Package built from a clean release contains everything needed and no local paths, secrets, game outputs or personal settings.

### Compatibility matrix

Record exact tested client, Node, OS, browser and engine versions in a release artifact. Separate CLI-core portability from actual engine/editor availability.

| Surface | Beta gate | Stable claim |
| --- | --- | --- |
| Codex desktop and CLI | Core prototype journey and host integration tested in both | All claimed workflow families have evidence in both; each Skill/role has at least one live scenario on a named client |
| macOS and Linux | CLI install, contracts and Web scenario | Full CLI contract/integration suite on both |
| Windows | Core porting and CI fixtures, capability gaps explicit | Native CLI core tested; no undeclared Bash dependency; game/engine checks qualified by available dependencies |
| Web | Prototype, growth, build/test and browser evidence | Complete reference journey and regression scenarios |
| Godot | Static/schema and configuration tests | One real configured-engine smoke journey for a declared version |
| Unity | Static/schema and configuration tests | Real licensed-editor evidence for a declared version, or clearly unverified runtime status |
| Unreal | Static/schema and configuration tests | Real editor/build evidence for a declared version, or clearly unverified runtime status |

“Fully adapted to Codex” requires the 75 workflows, 49 roles, applicable rules, replacement guards and supported entry points to be accounted for and tested. It does not imply every engine version or operating system combination has been exercised. If required live verification is unavailable, release a qualified beta or narrow the explicit support matrix; do not quietly lower the stable completion criteria.

### Proposed maintainer commands

These scripts do not exist yet. Their implementation is part of the task list.

```bash
npm --prefix toolkit ci
npm --prefix toolkit run build
npm --prefix toolkit run typecheck
npm --prefix toolkit run lint:content
npm --prefix toolkit test
npm --prefix toolkit run test:integration
npm --prefix toolkit run test:package
npm --prefix toolkit pack --dry-run
```

Use targeted tests during each change and the release matrix before publication. Live Codex/engine scenarios consume external resources and are run in disposable fixtures, recording their precise environment. CI must not auto-publish merely because tests pass.

## 11. Milestones and delivery order

| Milestone | Deliverable | Exit gate |
| --- | --- | --- |
| M0 Compatibility and contracts | Verify roles, Skill discovery, Hooks and desktop PATH behavior; freeze core command/config contracts | Real positive/negative host probes; decide minimum supported client versions |
| M1 Install and inspect | CLI archive, onboarding Skill, project pin, attach/restore, doctor/status | Clean isolated install; no game-file damage; repeat setup is idempotent |
| M2 Playable Web slice | Prototype Skill, scaffold, browser run/capture, check, change and package | Complete reference journey in desktop and CLI |
| M3 Collaboration and recovery | Role adapter, checks, guided policy, checkpoint recovery | Independent reviews observed; blocked work and failed checks cannot disappear |
| M4 Complete migration | All workflow/role/rule batches, engine paths, advanced helpers and test catalog | Inventory reconciled; no unapproved capability omission or active Claude dependency |
| M5 Upgrade and release | Conflict-aware upgrade/detach, Windows core portability, docs and publication artifacts | Distribution and compatibility gates pass; remaining limits explicit |

M2 is an internal usable milestone, not “complete adaptation.” M0 resolves the most expensive uncertainties before mass conversion. M4 is executed in small batches listed in the task document; no single task bulk-rewrites all Skills or all agents.

No calendar deadline is assumed. The dominant uncertainties are Hook semantics across clients, behavioral regressions in long Skills, platform-dependent scripts, and access to native engines. Estimate implementation effort after M0 and the first Web slice rather than assigning a misleading number of days now.

## 12. GitHub, npm and release plan

Preserve upstream Git history and the MIT notice identifying Donchitos. Add an English attribution statement explaining the Codex adaptation and its divergence. Use a separate version sequence for the new toolkit and record upstream baseline `1.3.0 / abc0de7`; do not imply the new CLI is an upstream release. [Upstream repository](https://github.com/Donchitos/Claude-Code-Game-Studios)

The confirmed repository is `T-X-R/codex-game-studio`, an independently named derived repository with retained history and an `upstream` remote. `origin` points to the user-owned repository. The archive package identity is `@t-x-r/game-studio`; this does not require or assert ownership of an npm registry account.

The first distribution channel is GitHub source plus a release installation archive. npm is the local package installer, not a publication channel for this scope. Package compilation must include the canonical resource bundle, roles and Skills. Test the packed archive rather than relying only on the source checkout. A user must be able to install and work without cloning this repository. The repository-template route must also work from a clean copy.

README leads with installation, opening Codex, and natural-language examples. Follow with template use, existing-project attachment, supported clients/platforms, hook trust, modes, upgrades, attribution, and troubleshooting. Update stale upstream links and maintainer metadata deliberately. Keep the tool's technical implementation details out of the first game-creation conversation.

Build artifacts, changelog, checksums, package contents and release notes are prepared before publication. The owner has authorized GitHub creation/push and archive delivery. The initial alpha publication does not close the full-migration release gates. Do not publish to npm without a later explicit change to the agreed distribution scope.

Optional later work: a thin Codex plugin package built from the same content. It must not fork Skills or replace tested CLI contracts. Current plugin distribution and hook restrictions require a separate compatibility assessment. [Official plugin packaging documentation](https://developers.openai.com/plugins/build/plugins)

## 13. Risks and explicit exclusions

| Risk | Mitigation and release consequence |
| --- | --- |
| Hooks load but do not inspect real edits | Test actual patch payloads and observable denied writes before bulk migration. |
| Global update breaks older games | Exact project runtime/bundle pin; explicit restore and upgrade. |
| Agent discovery omits workflows | Measure the full catalog; shorten metadata or explicitly redesign packs before claiming completeness. |
| Role permissions are overstated | Separate instructional boundaries from inherited host enforcement; test actual delegation. |
| Installation damages existing instructions/config | Preview, ownership hashes, conservative merges, backups and conflict tests. |
| Source-relative paths break packaged installs | Run release tests outside the source tree with a clean home and workspace. |
| Bash/PowerShell assumptions break Windows | Port core operations; declare remaining engine/tool dependencies and test native commands. |
| Shared checkpoints race | Coordinator ownership, atomic saves and expected-hash conflict detection. |
| Browser evidence changes during migration | Golden fixtures and reproducible seeded scenario comparisons; preserve unassessed outcomes. |
| Scope grows into an Agent platform | No model server, dashboard, custom scheduler or generic orchestration DSL. |

Excluded from the first complete release: dual Claude support, a graphical studio application, hosted accounts, billing, asset marketplaces, automatic cloud publication, a new game engine, public plugin directory submission, and unrequested translations. No separate API service or MCP server is required for a CLI that Codex can execute locally.

Always preserve user work, report evidence accurately, and keep the active user instruction above workflow defaults. Ask only for material scope/contract choices or actions outside existing authorization. Never turn skipped questions into consent, silently remove a failed check, auto-trust hooks, or mark unavailable engine testing as passed.

## 14. Decisions still needed before their dependent work

| Decision | Proposed answer | Needed by |
| --- | --- | --- |
| Final product/repository/package identity | Resolved: Codex Game Studio / `T-X-R/codex-game-studio` / `@t-x-r/game-studio` archive | No further identity approval needed |
| Node/TypeScript approach | Approved single-package implementation | M1 implementation |
| Global onboarding plus local full bundle | Approved default; avoid globally registering all workflows | M1 installation |
| Platform priority | macOS/Linux beta, native Windows core by stable | Porting and release scope |
| Native engine evidence | Determine installed/licensed engines and available test machines | M4/M5 runtime claims |
| Publishing accounts and repository relationship | Resolved: user-owned independent repository retaining history; GitHub/archive only | M5 external publication; npm excluded |

The established requirements in section 1 do not need to be asked again. Unresolved choices above do not prevent reviewing this complete proposal; they prevent silently treating a proposed technical default as an approved implementation decision.

## 15. Reference basis

- Local source baseline: `README.md`, `CLAUDE.md`, `.claude/settings.json`, `.claude/skills/`, `.claude/agents/`, `.claude/hooks/`, `.claude/scripts/`, `project.yaml`, and `studio-tests/`. Counts and source links are recorded in the inventory.
- [DingTalk Workspace CLI](https://github.com/DingTalk-Real-AI/dingtalk-workspace-cli#using-with-agents) demonstrates executable CLI capabilities paired with Agent Skills and installation paths. Its enterprise authentication and remote services are not requirements for this local game toolkit.
- [Codex Skills](https://learn.chatgpt.com/docs/build-skills), [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Hooks](https://learn.chatgpt.com/docs/hooks), and [AGENTS.md discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) define host integration points. Recheck relevant contracts when implementation starts and record tested versions.

