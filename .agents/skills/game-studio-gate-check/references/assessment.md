# Resolve unknowns and run the actual director panel

For relevant facts that files cannot establish, ask concise questions using an
available question tool or ordinary text. Reuse answers already supplied. Keep
unanswered, dismissed and “I don't know” items MANUAL CHECK NEEDED; never infer
consent or a positive observation from silence.

A confirmed “no/not yet” about a review means it has not happened: grade that
known gap as FAIL or CONCERNS at its requirement level and name the missing
review. A play question is different: “not yet” means nobody has played, hence
NOT ASSESSED; an actual negative play result is FAIL where the gate defines it.
Declining an offer to generate evidence leaves the applicable check unassessed.
Human feedback supplied in a test fixture is synthetic, not real play acceptance.

## Panel selection

Use the resolved review mode (including a one-run override) and project workflow:

| Review mode | Panel |
| --- | --- |
| solo | Skip, naming Solo mode; artifact and quality checks still apply. |
| lean or full | Run the phase panel selected below. |

| Workflow | Native role types |
| --- | --- |
| minimal | `game-studio-producer` |
| standard | `game-studio-technical-director`, `game-studio-producer` |
| full | `game-studio-creative-director`, `game-studio-technical-director`, `game-studio-producer`, `game-studio-art-director` |

The not-applicable minimal design transition skips its panel explicitly.
`team.size` affects specialist depth, never panel width. Roles inherit host model,
effort and permissions; do not request a fixed model or alternate provider.

When required roles and native delegation are available, explicitly request them
as independent read-only subagents, concurrently within host capacity. Start
independent reviews without waiting serially when capacity allows; queue the
remainder if necessary. Wait for all required outcomes before final aggregation.
Do not substitute a generic agent or coordinator self-review for a native role.
A required unavailable, failed or interrupted role is NOT ASSESSED, not skipped
as if solo. Do not auto-install roles or switch modes to obtain a passing panel.

Give each reviewer the target and source phases, effective workflow/QA policy,
applicable required/recommended checklist, observed artifact paths and its own
gate ID. Ask it to read its packaged gate definition through `resource path`:

| Role | Gate resource under `studio/docs/director-gates/` | Additional context |
| --- | --- | --- |
| Creative Director | `cd-phase-gate.md` (CD-PHASE-GATE) | Game pillars/core fantasy from concept or brief. |
| Technical Director | `td-phase-gate.md` (TD-PHASE-GATE) | Architecture path, engine VERSION.md path, ADR list. |
| Producer | `pr-phase-gate.md` (PR-PHASE-GATE) | Sprint/milestone plans, effective team size, actual capacity when known, count of Blocked stories; at minimal use the brief's Build order. |
| Art Director | `ad-phase-gate.md` (AD-PHASE-GATE) | Art artifacts, concept Visual Identity Anchor or brief Look and references (legacy Label / Art & audio direction), art-bible path. |

Each context item must be a present path/value, explicitly “none” when this gate
requires/recommends it and it is absent, or “not expected before [phase]” / “not
required at this workflow”. Zero blocked stories is a value. Do not make a
reviewer demand future-stage artifacts or confuse a known absent required
artifact with an unspecified input. Read GDDs/ADRs/art-bible by relevant sections.
Delegated tasks cannot edit shared reports, accept ADRs, change scope/stage or
publish anything; the coordinator owns the report and authorized stage update.

Show one result row per requested reviewer with actual READY / CONCERNS / NOT
READY / NOT ASSESSED and findings. Identify omitted perspectives for narrower
panels and the setting provenance controlling width: changing rigor does not
change an explicitly set workflow. `--review full` does not widen a panel.

Any NOT READY makes the gate FAIL; any CONCERNS sets at least CONCERNS. A required
NOT ASSESSED prevents PASS and prevents stage advancement even when a known
concern takes precedence in the headline verdict. All required reviewers READY
only makes PASS eligible, subject to artifact and quality checks. Preserve each
reviewer's independent findings; do not silently flatten them into approval.
