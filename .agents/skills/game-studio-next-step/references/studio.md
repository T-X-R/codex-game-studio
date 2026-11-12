# Studio route

For standard/full, map resolved recorded stage to catalog key: Concept → concept;
Systems Design → systems-design; Technical Setup → technical-setup;
Pre-Production → pre-production; Production → production; Polish → polish;
Release → release. Preserve multiword values.

When unset, infer the most advanced observed match: at least ten actual source
files in the resolved code root → production; stories under production/epics →
pre-production; docs/architecture/adr-*.md → technical-setup; systems-index.md →
systems-design; concept or brief → concept; nothing observed → fresh concept.
Label inference; it neither writes a stage nor proves a gate. Unavailable
observations remain unknown, not absent.

For Production read `production/sprint-status.yaml` first when present. Run one
`node .game-studio/run.cjs check --kind artifacts --phase <key> --json` for the
selected phase. Use `data.groups[].steps` and counts; do not run all phases or
glob each catalog condition. YAML replaces interpretation of implement/story-done
artifact rows, not the rest of the phase observations.

## Artifact statuses

| Observation | Navigation interpretation |
| --- | --- |
| PRESENT | Artifact condition met; eligible for Done, not content-quality approval. |
| ABSENT | Incomplete artifact condition. |
| SHORT | Incomplete; retain observed count and minimum. |
| PATTERN_MISS | File exists but lacks the required marker; do not call it missing. |
| NO_CHECK with note | MANUAL: ask whether the work is completed; neither done nor absent by default. |
| NO_CHECK without note | UNKNOWN: completion is not tracked, never automatically done. |
| UNKNOWN / failed read | Not assessed; identify unavailable evidence. |

`any_of` means alternatives: one matching alternative suffices. Preserve reported
matches without recomputing them. When most steps are NO_CHECK say completion is
mostly manual, not nearly complete. Repeatable steps outside Production show
some detected work, not completion of all systems/stories.

## Choose position

Use catalog order: last confirmed required completion, first unresolved required
step, optional opportunities, subsequent required steps. A MANUAL step can make
the primary action a completion question; do not skip it or assert work missing.
When the user names a finished step, advance past it despite an ambiguous check,
attributing that completion to the user, not inventing review/test evidence.
Explicit contradictory artifacts or known unresolved blockers remain visible.

At full surface all incomplete optional opportunities; at standard surface an
optional doc only when this system/phase needs it or the user asks. Preserve
required order with explicit tier exceptions: standard art bible is required
only for visual-asset stories or strict override, full always requires it. Unknown
applicability is a question, not invented asset work. Do not import or execute a
full gate audit as navigation or infer its quality verdict from presence.

### Production stories

When sprint YAML exists, use its actual IDs/paths: in-progress is currently active;
ready-for-dev is next up after current work; done counts complete in this sprint;
blocked needs its actual blocker and is never an implementation candidate.
YAML is authoritative even if Markdown disagrees; name a material disagreement,
do not merge incompatible status sets. Malformed/unreadable YAML is not empty or
complete. Do not rescan Markdown Status lines to override it. Without YAML,
implement/story-done stay MANUAL/UNKNOWN; checkpoint/user context may support
continuation or a completion question, not automatic accepted story closure.

### A design with nothing playable

If design/gdd has Markdown but no prototypes/*/index.html, with no engine or Web,
next is prototype from the concept or GDD describing the whole game. Say design
documents remain authoritative and its brief is only a build summary. Put the
prior catalog blocker first under Coming up, then relevant intended stage-detect
and adopt routes, respecting installation availability.

For another engine keep the catalog blocker primary. A separate disposable Web
sketch may be secondary with the capability limit explicit; do not convert the
engine or claim unsupported flags/native prototypes. Existing grown/main-game
evidence prevents reporting a game missing just because it is outside prototypes.

Show active checkpoint work prominently; continue it or resolve whether it is
finished without hiding an earlier known blocker. Finish with [output.md](output.md).
