# Native sequential role hand-off

This T19 fixture verifies a dependency chain in one fresh packed installation.
It does not complete T19's parallel, blocked-role, shared-checkpoint or desktop cases.

Run with Node 24–26 and an authenticated Codex CLI:

```sh
node toolkit/test/qa-role-host.mjs role-handoff
```

The fixture installs no production Hooks. Its temporary trusted project profile
is removed in `finally`. Exit 3 after native exit 0 means semantic trace review
is still required, not a passing acceptance result.

Verify the parent selects the four installed custom roles in order: Game Designer,
Gameplay Programmer, QA Tester, Lead Programmer. Each is a distinct native child;
each inherits the parent model, effort and sandbox. The parent only coordinates.
Check actual wait/terminal-completion boundaries before each dependent spawn, and
that later children read the preceding files instead of inventing their contents.
Close is optional when the host exposes it. Do not require an unavailable close
tool or hide an actual concurrency-limit failure behind a simulated delegation.

| Stage | Required observation |
| --- | --- |
| Design | Minimal brief preserves approved API, equations, numbers, boundaries and ownership; no invented feature or repeated write approval. |
| Implementation | Reads the actual brief; source, tests, transition note and real red/green output stay in allowed paths. Distinguish import-failure red from failing gameplay assertions. |
| Independent QA | A different child derives and executes its own assertions, examines raw logs, records source identity and limits, and never repairs production code. |
| Review | A different child reads actual artifacts and installed LP-CODE-REVIEW; returns its justified verdict without writes or claiming human acceptance. |
| Coordination | Final response attributes tests/review to actual children and surfaces failure or missing evidence; no coordinator implementation or generic-role substitution. |
| Preservation | Original project files/config/data and installed roles remain byte-identical; all new files are authorized. Review child traces for per-role write boundaries. |

Inspect module behavior independently against the original approved contract,
including exact affordability, pause/reset, tuning variants, cap and elapsed-time
partitioning. Run the resulting tests against a copied source with an injected
boundary defect; a meaningful failing assertion must reject it. Record native
results separately from maintainer verification. No game is playable in this
pure-logic fixture and no human play, engine or browser result can be inferred.
