# Codex Skill specification: game-studio-[name]

## Source and scope

- Catalog identity/category: [source name and category]
- Retained domain contract: [catalog spec path]
- Canonical target and references: [catalog target plus reference paths]
- Domain outcomes preserved: [all source requirements and case mappings]
- Adapted mechanics: [source requirement -> Codex behavior -> evidence needed]
- Unresolved requirements: [explicit open items; none silently waived]

## Instruction/static review

- [ ] Canonical metadata, names, local resources and explicit commands pass `lint:content`.
- [ ] Trigger description distinguishes this workflow from neighboring workflows.
- [ ] Domain outcomes, missing-input behavior, verdict vocabulary and next step are explicit.
- [ ] Guidance follows the effective automation policy; guided mode reuses authorization.
- [ ] Referenced native roles/commands are installed, or their absence is handled explicitly.
- [ ] Applicable category metrics from `quality-rubric.md` have separate instruction results.

These checks do not prove live behavior. Read all references; do not infer a pass
from an entrypoint or a renamed source file.

## Fixture and evidence contract

Record host/client version, OS, Node/runtime/package versions, installed content
hashes, project and local settings with provenance, source file hashes, supplied
inputs, allowed writes, selected native capabilities and expected artifacts.
Default: minimal rigor, guided automation, no local override; name case-specific
changes. Preserve explicitly required source-mode scenarios as mapped variants.

For each case record: expected assertions, actual transcript/trace and commands,
process exits/logs, changed/preserved files, result (PASS / FAIL / PARTIAL /
NOT ASSESSED), limitations, evidence path and next action. Record an inapplicable
assertion with its reason instead of treating it as passed. Test CLI and desktop
separately; a supplied-Skill simulation does not prove natural discovery.

## Required case families

### 1. Happy path and trigger boundaries

Use an in-scope natural-language request. Observe native discovery and use of the
installed Skill, expected domain artifact and verification. Run an unrelated or
neighboring request as a negative trigger control; the Skill must not take over.
Name additional source-specific happy-path cases that remain required.

### 2. Failure or blocked dependency

Provide missing or invalid input. Assert the missing dependency is named, dependent
work stops, and no unauthorized writes occur. Distinguish unavailable capability
from an actual failed test. Demonstrate recovery after the dependency is resolved.

### 3. Mode variants

Exercise relevant rigor, workflow, review and automation modes independently.
Assert differences in artifacts, gate selection and interaction. Guided mode
continues ordinary authorized writes; consequential unresolved decisions still
return to the user. Explicit collaborative choices retain their intended cadence.

### 4. Edge case and preservation

Use the source spec's edge cases plus resumed/existing artifacts and conflicting
user edits where relevant. Compare actual outputs and preserved file bytes.
Cancellation or interruption must not silently discard prior work.

### 5. Director gate or delegation

Record full/lean/solo behavior using resolved review settings. Full invokes the
required gates; lean retains applicable phase gates at workflow panel width;
solo omits directors with a stated reason. Observe native role selection and
actual verdicts. A failed or NOT ASSESSED gate cannot become a silent approval.
If no gates are applicable, state why. For team workflows also test dependency
ordering, disjoint writers, failed/unavailable children and shared checkpoints.

### 6. Could not assess

Supply an unreadable, absent or placeholder-only required input, or an unavailable
check capability. Assert NOT ASSESSED with the missing observation identified.
An observed failure alongside missing evidence must still be surfaced as failure.

## Completion evidence

Map every retained source case and applicable rubric metric to an observed result;
add source-specific cases beyond these families. Keep instruction, host runtime,
engine/browser and human observations separate. Human play/sign-off is required
where the source/plan requires it and cannot be inferred from screenshots or replay.
Keep open cases explicit. Only complete the catalog/task row after the whole
required matrix passes and its evidence has been independently assessed where
required. Do not derive completion from the number of passing cases.
