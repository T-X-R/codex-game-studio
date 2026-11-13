# Assess content, then report a verdict

Gather deterministic section observations with the installed toolkit:

```sh
node .game-studio/run.cjs check <target-gdd> --kind gdd --json
```

Read its actual rows/errors; absent, placeholder-only and empty headings do not
satisfy a required section. `Detailed Design` is an accepted alias for `Detailed
Rules`. The helper makes no quality or tier judgment. If it is unavailable,
report that limit and inspect the content directly rather than inventing output.

| Section | Full workflow | Standard workflow | Minimal workflow |
| --- | --- | --- | --- |
| Overview | Required | Required | Advisory |
| Player Fantasy | Required | Advisory | Advisory |
| Detailed Rules / Detailed Design | Required | Required | Advisory |
| Formulas | Required | Required if numeric behavior exists | Advisory |
| Edge Cases | Required | Required | Advisory |
| Dependencies | Required | Required | Advisory |
| Tuning Knobs | Required | Advisory unless explicitly required by workflow override | Advisory unless explicitly required by workflow override |
| Acceptance Criteria | Required | Required | Advisory |

Use explicit requirements from the effective workflow overrides; reductions do
not erase an explicit requirement. Count required sections: full 8, standard 5
plus Formulas for rates/curves/thresholds/costs/damage/drop weights and any actual
additional requirement. Minimal expects no GDD: assess an existing one advisorily,
report 0 required sections (not missing 8), and do not require authoring one.
A category label is only a hint: a UI spec with numeric rules still needs Formulas
at standard. Present sections may still be inadequate on semantic inspection.

Check internal consistency: formula examples and boundary inputs, edge cases
against normal rules, and reciprocal awareness of declared system interfaces.
Check implementability: unambiguous rules/state/ownership, actual performance
constraints, and independently testable acceptance criteria. Quote each vague
criterion and suggest a measurable rewrite as a proposal, not an approved change.
In lean/solo this is the main review's job; no QA specialist will do it later.
Check cross-system mechanics and unintended interactions, plus consistency with
established fantasy, pillars, tone and lore. Distinguish real defects from missing
implementation/playtest evidence that is not required to assess a design.

## Output

Use these sections, omitting a senior result only when no senior review ran:

- **Design Review: <title>**; target path; effective workflow/review and sources;
  Specialists consulted (actual roles), unavailable coverage, and Re-review
  (prior verdict/date or first review). Clearly identify reused prior evidence.
- **Completeness: X/N required sections**; list missing required sections and
  separate advisory gaps. Minimal's N is 0 unless an explicit override applies.
- **Dependency Graph**: each declared dependency, resolved path and exists/missing/
  ambiguous state. A name in a table does not prove a file exists.
- **Registry Values**: searched names/keys, match count and each line-specific
  contradiction, or explicit reason values were not cross-checked.
- **Required Before Implementation**: blocking findings, source-tagged.
- **Recommended Revisions** and **Nice-to-Have**: nonblocking recommendations.
- **Specialist Disagreements**: both views and their sources; no silent adjudication.
- **Senior Verdict [game-studio-creative-director]**: actual synthesis in full mode.
- **Scope Signal**: report the formula count, declared dependency count, systems
  touched and whether new ADRs are needed before choosing rough S/M/L/XL. **S is
  eligible only when all four conditions hold:** one system, zero formulas, no
  new ADRs and fewer than three dependencies. Simple formulas still count; small
  implementation size does not remove a formula from the design. M covers roughly
  1–2 formulas or 3–6 dependencies; L multisystem/3+ formulas/possible new ADR;
  XL cross-cutting/multiple new ADRs. Explain overlapping bands or unknown inputs,
  and ask the Producer to verify before planning. This is a scope heuristic, not
  measured effort or a delivery commitment.
- **Verdict: APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED / NOT ASSESSED**.

APPROVED requires no blocking issue and all required evidence/coverage assessed.
NEEDS REVISION or MAJOR REVISION NEEDED describes known actionable design defects;
use the latter for fundamental or pervasive changes, with reasons. An absent,
unreadable or substantively empty target, or unavailable required dependency/
review input that prevents judgment, is NOT ASSESSED. Name what is missing and
its producing workflow; do not claim that workflow is installed without checking.
A read incomplete GDD with known missing required sections receives a revision
verdict, not an escape through NOT ASSESSED. Aggregate severity is major revision,
revision, not assessed, approved; unknowns remain visible beneath a revision
headline. Senior synthesis supplies the full-mode verdict subject to these same
criteria; request correction if it ignores blocking evidence or uses gate words.

The assessment itself is read-only. A quality verdict is not permission to edit
tracking, accept a risk, implement a system or advance the project stage.
