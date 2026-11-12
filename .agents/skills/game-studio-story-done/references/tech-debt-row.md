# Phase 7: selected advisory deviations as technical debt

Read only after the user chose, or previously authorized, closing this story with
its advisory deviations logged as debt. Ordinary close authority alone does not
select this optional action. Add one row per selected advisory deviation to
`docs/tech-debt-register.md`; do not turn a blocking finding into advisory debt.

Use the existing register, preserving other rows/history and its ten-column schema:

```text
| TD-[next free NNN] | [category] | [deviation] — from [story path] | [files] | [S/M/L/XL] | [Low/Med/High/Critical] | — | Open | [YYYY-MM-DD] | Backlog |
```

- ID: one above the highest actual TD number in the file, at least three digits;
  TD-001 for a new register. Re-read before writing so concurrent additions cannot
  reuse an ID. Do not overwrite a row or duplicate this closure's existing entry.
- Category: Architecture, Code Quality, Test, Documentation, Dependency or
  Performance, based on the actual deviation.
- Effort and Impact are estimates, not measured facts. Priority stays `—` until
  a separately requested prioritization; Status Open; Added today; Sprint Backlog.
- Escape table delimiters/newlines in descriptions/paths so one item remains one
  ten-cell row. Include the actual source story and affected files.

A new file starts with:

```markdown
## Technical Debt Register
Last updated: [today]
Total items: [N] | Estimated total effort: [sizes summed]

| ID | Category | Description | Files | Effort | Impact | Priority | Status | Added | Sprint |
|----|----------|-------------|-------|--------|--------|----------|--------|-------|--------|
```

For an existing register update Last updated and Total items/Estimated total effort,
counting its actual rows and retaining a meaningful size tally (no invented numeric
conversion of S/M/L/XL). Add the table header if absent. If existing rows cannot be
mapped to the schema without rewriting unrelated history, stop that mutation and
report the conflict; do not silently lose old debt. Use native editing within the
close's preflight/change checks. Record the actual number added in Completion Notes
or checkpoint. Logging debt does not claim it is prioritized, fixed or accepted
for release, and does not invoke an uninstalled tech-debt workflow.
