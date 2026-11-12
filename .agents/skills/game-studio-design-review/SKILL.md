---
name: game-studio-design-review
description: Review one game design document for completeness, consistency, implementability and design quality before programming, or revisit its prior review. Use for GDD review rather than source-code review or authoring a new system.
---

# Review a game design document

Review the actual target, with evidence and the project's effective requirements.
An author's self-check is not an independent review: use a fresh review session
when arriving from game-studio-design-system. Do not adopt its claimed approval.
This workflow assesses design; it does not implement the system or advance stages.

## Resolve the target and policy

Take the requested GDD path, or resolve one unambiguous system from the index.
Ask if the target is missing from the request or ambiguous; never pick an unrelated
GDD. From the game root run:

```sh
node .game-studio/run.cjs config get --system <system-id> --json
```

Use the actual system identifier for per-system workflow overrides; if it cannot
be resolved, read project settings without `--system` and surface the ambiguity.
Read the applicable AGENTS.md and effective workflow, review, automation and
workflow override settings with provenance. Workflow tier and review mode are
independent. Explicit `--review full|lean|solo` wins for this run only. The legacy
`--depth` flag means the same thing: mention its rename once; when both are given,
`--review` wins. Do not rewrite settings to implement a one-run preference.

- **full:** main review, actual parallel domain specialists, then a senior synthesis.
- **lean:** complete main review without delegated specialists.
- **solo:** complete main review only; no tracking writes or next-step interaction.

## Read evidence and assess

1. Read [freshness and inputs](references/freshness-and-inputs.md) before deciding
   whether a prior review covers this run. Its receipt helper only reports byte
   identity. A previous adverse verdict never becomes approval through reuse.
2. Unless a verified prior verdict can be reused, read the complete target in
   heading-sized ranges, not only changed sections. Read required cross-document
   facts and validate every declared dependency. Missing/unreadable input is
   visible; an empty registry is not a substitute for relevant GDDs.
3. Read [assessment and output](references/assessment-and-output.md). Use the
   installed deterministic `check --kind gdd` observations, then judge content,
   numeric rules, boundaries, registry values throughout the document, and every
   acceptance criterion. Section presence and a zero CLI exit are not approval.
4. In full mode, read [specialists](references/specialists.md). Dispatch only
   actual available native role types with inherited settings, collect independent
   findings, then request Creative Director synthesis. Do not impersonate missing
   specialists or substitute a generic agent. Retain disagreements and missing
   coverage; a partial panel cannot establish full approval.
5. Present the complete review with exactly one final verdict: **APPROVED**,
   **NEEDS REVISION**, **MAJOR REVISION NEEDED**, or **NOT ASSESSED**. Known blocking
   defects outrank unknown coverage; unknown required evidence outranks approval.
   Nothing is written during assessment.

## Follow through within the user's scope

Solo ends with the review. For lean/full, read
[follow-up and records](references/follow-up-and-records.md) when a next action or
tracking write is wanted. An explicit read-only/stop-after-review request ends
here without soliciting extra work. Reuse concrete prior authorization for the
index/log writes; otherwise offer those actions after the review, not before it.
Guided mode asks only unresolved consequential decisions. Collaborative mode
retains interactive decisions; autonomous mode records assumptions without
inventing risk acceptance, a new scope choice or a design approval.

Never mark a revised design Approved without re-review. Updating an index,
appending a receipt and revising the GDD are separate effects. Do not silently
create a missing index, change unrelated rows, overwrite review history, save a
checkpoint, invoke another workflow, commit or publish as a consequence of review.
