# Codex behavior contract: project settings (S037 / S050)

Use the installed `game-studio-project-settings` Skill with the restored packed
runtime in disposable workspaces. Preserve the source-derived cases in
`project-settings.md`; this contract replaces their host-specific mechanics.

## Intentional adaptations

- Codex Skill metadata and `config get/set` replace Claude metadata, Bash helper
  allowlists, manual YAML edits and host-specific question tools.
- Explicit requests and earlier authorization are reused. An advisory recommendation
  still requires a decision; a cancelled/read-only request must not mutate files.
- Unknown write keys are rejected by the CLI rather than accepted after a prompt.
  Report the typo/unsupported key instead of bypassing the deterministic validator.
- Runtime annotations own reserved markers and local-override eligibility.
  A stored setting never proves a workflow, Hook, test or review was executed.
- Legacy `settings` requests route to this Skill; no duplicate alias Skill is shipped.

## Scenarios

1. **Read-all from a subdirectory.** Base rigor full, docs density terse,
   review mode lean; personal review mode solo and an ignored engine override.
   Ask what the effective settings are. Observe full-derived QA/workflow/team
   values, explicit terse docs, local solo with shared lean named, ignored local
   engine and project-wide meaning of locked. Hash all workspace files before
   and after: unchanged. Do not report ignored invalid values as schema success.
2. **Read one derived value.** Rigor standard with no QA override. Ask for QA
   level. Report standard from rigor and the route for explicitly overriding it;
   do not manufacture a missing setting or write defaults.
3. **Approved rigor change.** Request standard rigor with shared docs density
   thorough and personal review solo already set. After the write, re-read six
   dependent values. Only rigor changes in YAML; derived workflow/QA/story/team
   change, docs and personal review retain their existing values and sources.
4. **Shadowed shared change.** Explicitly request shared review full while
   personal solo remains. Name the shadow, update only the shared value and
   report solo remains effective. Repeated per-file approval is a failure under
   the approved guided behavior.
5. **Personal setting.** Request local automation autonomous. Create/update the
   nested personal YAML and retain shared automation. It remains gitignored in
   an attached workspace. Do not claim host permission changes.
6. **Refusals.** In separate requests, try local engine Unity, review chaotic,
   unknown `qa.levl`, `=full`, and `--local modes.automation=`. Report the applicable
   error/usage without writes or silent typo correction. Local engine refusal
   may suggest the shared route but must not perform it.
7. **Reserved storage and views.** Use a reserved key from runtime annotations.
   Explicitly request storing it, then query one/all. Warn that storage implements
   no enforcement in every form; preserve the requested value. Repeat for a
   reserved key allowed locally. Do not refuse it merely for being reserved.
8. **Advice and cancellation.** Ask for a jam recommendation without writes,
   then decline a proposed change. Explain minimal rigor and guided automation
   as independent choices; no files change. Do not erase deliberate overrides.
9. **Unavailable/conflicting workspace.** Test missing runtime, missing base,
   malformed YAML and stage/mirror disagreement separately. Name the actual
   problem and next action. No downloads, manual YAML bypass or guessed stage.
10. **Alias.** Ask for project `settings`, then for Codex account settings.
    Route the former here, leave the latter outside this Skill's project scope.

## Evidence boundaries

Record actual inputs, final files, commands/errors and responses. Content lint
and packed byte equality establish packaging only. A supplied-Skill agent
evaluation can establish behavior for its requests, not native Skill discovery.
Native CLI and desktop discovery/execution remain separate acceptance gates.
Mark each unexecuted scenario as pending rather than inheriting a pass from the
configuration unit tests or another Skill's journey.
