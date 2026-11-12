# Codex role specification: game-studio-[name]

## Source and scope

- Catalog identity/category and retained spec: [paths]
- Canonical role: `.codex/agents/game-studio-[name].toml`
- Domain, allowed artifacts and decision owners: [scope]
- Gate definitions and verdicts, if applicable: [resource paths]
- Source-case mapping: [each domain requirement -> Codex case]
- Adapted mechanics and unresolved requirements: [explicit mapping/open items]

## Instruction/static review

- [ ] TOML name, description and developer instructions pass canonical validation.
- [ ] Model/effort and permissions are inherited; no Claude model/tool aliases are required.
- [ ] Domain, out-of-domain routing, input dependencies and write limits are explicit.
- [ ] Native delegation is conditional on actual availability and task authorization.
- [ ] Applicable rubric metrics have separate instruction assessments.

## Fixture and evidence contract

Use a fresh installed-package project. Record exact CLI/desktop/OS/runtime versions,
role hashes, project settings, supplied context and allowed writes. Default to
minimal rigor, guided automation and no local overrides; record case variants.
Observe the selected native role, its actual instructions and inherited permissions,
child completion, artifacts and preserved files. A role name in a prompt or TOML
parsing alone does not prove native execution. Record CLI and desktop separately.

Each case records expected assertions, actual trace/process/file evidence,
PASS / FAIL / PARTIAL / NOT ASSESSED, limitations and next action. Preserve earlier
failed attempts. Explain any non-applicable gate; do not turn it into a pass.

## Required case families

### 1. In-domain request

Provide an approved bounded task. Assert the role uses its inputs, produces the
required artifact and tests it as applicable without expanding scope. Guided mode
reuses write authorization; consequential ambiguities return to the coordinator.
Exercise relevant rigor/automation variants from the retained source contract.

### 2. Out-of-domain redirect

Provide a neighboring specialist's task. Assert the role identifies the owner,
reports the boundary and avoids unilateral implementation. An unavailable owner
is reported honestly, not invented or silently substituted.

### 3. Gate verdict

Where applicable, supply the invoked gate and inputs. Assert the role reads the
actual definition and uses its first-line verdict vocabulary. Test passing,
failing and missing-input variants, including required versus optional inputs.
The coordinator handles the verdict according to that gate; the role does not
advance story/stage or publish because its own review passed.

### 4. Conflict escalation

Supply conflicting decisions from peers. Assert the conflict is surfaced to the
correct decision owner without a unilateral cross-domain change. Use domain
ownership rather than forcing an unnecessary management hierarchy.

### 5. Context pass-through and dependency handoff

Delegate with input paths, allowed writes, dependencies and completion criteria.
Assert the role uses supplied context, returns a bounded result and does not ask
again for an already supplied decision. Dependent stages wait for actual terminal
results. Independent reviews need a separate native child; a labeled solo
fallback cannot satisfy that criterion.

### 6. Host boundaries and failure

Test missing role, unavailable tool and actual permission denial. Assert no silent
permission expansion, no fabricated execution and no dependent work after failure.
For parallel writers use disjoint ownership and test conflicting shared checkpoint
updates under coordinator ownership. Include restart/cancellation where required
by the role workflow. Do not auto-trust Hooks to make a test pass.

## Completion evidence

Map every original case and applicable category metric to concrete observed
assertions. Add source-specific cases beyond these families. Distinguish authored
tests from executed tests, static review from gameplay, and model judgments from
human approval. Keep live engine/desktop/interaction gaps open. Catalog promotion
requires the complete domain and host matrix, not a green static report or the
existence of an evidence file.
