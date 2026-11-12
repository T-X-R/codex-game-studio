---
name: game-studio-create-architecture
description: Author or update a game's master architecture from its design requirements and pinned engine, including layers, ownership, data flow, interfaces and ADR gaps. Use before implementation or for focused blueprint updates; individual ADRs and independent coverage reviews have separate workflows.
---

# Create the master game architecture

Own `docs/architecture/architecture.md` and authorized recovery checkpoints.
Do not implement code, accept ADRs, register permanent requirements, change stage,
or invoke downstream workflows merely because the blueprint is written.
Read `node .game-studio/run.cjs config get --json` for effective workflow, review,
automation, always-ask categories and density, with provenance. Missing runtime or
failed reads are unresolved inputs. `--review full|lean|solo` affects this run only.

## Choose the operation and required depth

- No argument / `full`: the walkthrough at the effective workflow depth; `full`
  as an operation name does not silently change the project's workflow tier.
- `layers`, `data-flow`, `api-boundaries`, `adr-audit`: update that one section
  of an existing document. Without one, offer the full walkthrough and wait for
  the owner's choice; do not create an unrelated partial architecture.
- Existing document, no explicit operation: offer selected in-place update,
  explicit whole rewrite, or stop. Reuse an already specific update instruction.

Full workflow covers all phases below. Standard requires the system layer map
and critical ADR list: retain the complete requirements baseline, engine findings,
critical coverage/gaps and status/handoff, but do not force full ownership/flow/API
chapters unless requested. All uncovered requirements remain visible, including
ones deferred beyond the critical list. Minimal architecture is voluntary; agree
its scope, use the brief when concept/index are absent, and do not make the
blueprint a new prerequisite for future minimal work. Explicit requests for extra
sections apply without changing configuration. A focus update preserves every
unchosen section, except the disclosed version/date/current sign-off metadata.

Density changes depth, not required evidence: terse uses diagrams and decision
bullets; balanced adds concise explanations; thorough develops rationale,
trade-offs and alternatives. No invented detail to fill a table.

## Work through the applicable phases

Read each reference before that phase; reread the current one after compaction or
resumption. Inspect actual saved artifacts rather than trusting stale checkpoints.

0. [Load context](references/0-load-context.md): engine and design prerequisites,
   complete technical requirements baseline, stable TR IDs, ADR inventory, risk
   and existing-document scope. This context also governs focused updates.
1. [Layers](references/1-layers.md): every game system, boundaries, ownership and
   engine risk. Platform is external; its wrappers belong to Foundation.
2. [Module ownership](references/2-module-ownership.md): full/requested scope only.
3. [Data flow](references/3-data-flow.md): full/requested scope only.
4. [API boundaries](references/4-api-boundaries.md): full/requested scope only.
5. [ADR audit](references/5-adr-audit.md): full audit for full/requested scope;
   standard retains critical decisions and visible coverage/deferred gaps.
6. [Missing ADRs](references/6-missing-adrs.md): concrete priority and layer order.
7. [Write and review](references/7-write.md): one master write after sections are
   settled, then the actual native TD/LP pair in full review mode.
8. [Handoff](references/8-handoff.md): truthful status, outstanding ADRs and readiness.

## Decision and persistence boundaries

[Persistence](references/persistence.md) governs every checkpoint and architecture
write. Unlike system-GDD authoring, Phases 1–6 save decisions in checkpoints;
they do not write architecture sections incrementally. Initial/revised document
content is written once at Phase 7; sign-off metadata is a separate authorized edit.
Collaborative mode shows each section before its approval and the concrete whole
changeset before writing. Guided mode reuses settled decisions and scoped writes;
ask only for unresolved consequential choices. Autonomous mode may record scoped
assumptions, but cannot invent owner consent, accept director risks, overwrite a
locked decision or bypass configured always-ask categories. A required unanswered
question remains pending. Use available native question tools or a clear
conversational fallback; do not invent Claude-only tools or logging helpers.

Read-only planning writes no architecture, registry or checkpoint. A declined write
stops creation; do not start reviews of a nonexistent artifact. A rejected review
blocks readiness, even when a draft already exists. No role availability or
approval is inferred from installed files alone.
