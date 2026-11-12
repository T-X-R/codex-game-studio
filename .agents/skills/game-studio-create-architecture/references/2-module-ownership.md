# $game-studio-create-architecture — Phase 2: Module Ownership Map

> Part of `$game-studio-create-architecture`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 2: Module Ownership Map

For each module defined in Phase 1, define ownership:

- **Owns**: what data and state this module is solely responsible for
- **Exposes**: what other modules may read or call
- **Consumes**: what it reads from other modules
- **Engine APIs used**: which specific engine classes/nodes/signals this module
  calls directly (with version and risk level noted)

Format as a table per layer, then as an ASCII dependency diagram.

**Engine awareness check**: For every engine API listed, verify against the
relevant module reference doc. If an API is post-cutoff, flag it:

```
⚠️  [ClassName.method()] — Godot 4.7 (post-cutoff, HIGH risk)
    Verified against: docs/engine-reference/godot/modules/[domain].md
    Behaviour confirmed: [yes / NEEDS VERIFICATION]
```

Settle the ownership map using the selected decision cadence, then checkpoint it
through [persistence](persistence.md); the architecture is written at Phase 7.

---
