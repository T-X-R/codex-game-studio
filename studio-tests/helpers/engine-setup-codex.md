# Engine settings and technical preferences — Codex contract

Source: setup-engine's platform, performance, testing, technical-preferences and
configuration stages, including the Godot Both-language branch. This is the
existing `game-studio engine setup --input PROJECT_FILE --project ROOT` command,
with `--dry-run` and JSON result support. It records agreed choices; it neither
chooses unanswered settings nor executes an editor, build, scaffold or tests.

## Shared configuration

Input accepts the existing engine, specialists, naming and commands blocks, plus:

- `platform`: targets (array of names), primary_input, gamepad_support and
  touch_support (`Full`, `Partial`, `None`, case-insensitive).
- `performance`: target_framerate, frame_budget_ms, draw_call_limit,
  memory_ceiling_mb, using the existing finite-number validation and bounds.
- `testing.framework` and `qa.coverage_minimum` (integer percentage, 0–100).

Explicit null remains deferred/unconfigured where the schema permits it. It
does not create a default budget or invent a testing framework. Unknown fields
or invalid shapes fail before writes. A new null inside a flow-style YAML
mapping is serialized as an explicit scalar and survives parsing; comments
and existing quoting/line-ending behavior retain the config writer contract.

Engine name/language remain required; an explicit version is required except
for Web's already-supported unknown/null version. Omitted code/test roots use
the existing engine table and preserve existing overrides. They are not written
as explicit overrides or created as directories. Unreal's unknown test module
remains unresolved with a warning; no fabricated module path is installed.

## Project-owned mirror

The transaction updates `project.yaml` and `docs/technical-preferences.md`,
guarding both before-images even when only one changes. Concurrent modification
of either prevents a mismatched pair. Legacy technical preferences can seed the
new document with a visible migration warning; the source file is retained.

Shared labels belong to matching H2 sections: Engine & Language, Naming
Conventions, Engine Specialists, Input & Platform, Performance Budgets and
Testing. Legacy unsectioned/H1 fields also remain supported. New shared fields
enter a section's direct body before its nested sections. Duplicate actual
sections/labels conflict; examples in fences, comments, nested contexts and
unrelated owner sections do not become shared fields. Original owner bytes,
BOM, CRLF and inline/multiline comment topology are preserved. A field whose
visible value resumes after an interleaved comment requires reconciliation,
rather than silently deleting part of its content.

Numeric mirror values retain source-compatible bare numbers; their YAML keys
define units. Input Methods uses the existing derived input-settings semantics.
No unsupported reverse-migration or richer unit parser is implied.

An explicitly approved Godot Both choice, including `GDScript + C#`, survives
same-engine/same-primary synchronization. Both's YAML primary remains GDScript.
Changing engine or primary language while actual rich language/routing content
remains requires reconciliation. This includes populated Unreal routing when
switching engines. Specialist names or incidental prose never imply Both.
Per-file conventions, routing, Platform Notes and actual .NET/editor validation
remain the Skill's responsibility using the existing section-editing tools.
No wholesale rich-document replacement interface was added.

## Verification boundary

Tests cover typed fields/nulls, source root defaults, comments and Both/routing
preservation, conflicts and paired-file guards. Installed-package checks write,
read and repeat setup through global and restored runtimes. These establish
configuration behavior only. Full S051, version-reference maintenance, the
installer-owned AGENTS pointer, native workflows and engine execution remain
separate acceptance obligations.
