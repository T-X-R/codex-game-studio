# Pin a chosen version and record what is installed

Web uses its own existing/new references, not this editor lookup.

Reuse an explicitly supplied version. Otherwise look up the current stable
release in official engine documentation/release notes and confirm the proposed
version with the owner. Ambiguous releases remain a choice, not a guessed pin.
Do not confuse latest published with installed. Check the chosen version's actual
capabilities and dependencies before suggesting API/runtime support.

## Installation evidence

| Engine | Probe and location |
|---|---|
| Godot | Try `godot --version`; otherwise inspect known platform locations or ask for the executable, including macOS `Godot.app/Contents/MacOS/Godot` and Windows versioned executable. Run that exact executable with `--version`. |
| Unity | Probe the chosen Hub editor: Windows `C:/Program Files/Unity/Hub/Editor/<version>/Editor/Unity.exe`, macOS `/Applications/Unity/Hub/Editor/<version>/Unity.app/Contents/MacOS/Unity`, Linux user's `Unity/Hub/Editor/<version>/Editor/Unity`; run the actual editor with `-version`. Bare `Unity` may be a different CLI. |
| Unreal | Inspect the actual launcher/build installation, e.g. `UE_<version>` below Epic Games on Windows; ask for a nonstandard build location. Engine root and actual `Engine/Build/Build.version` are stronger evidence than a folder name. Do not assume the editor is on PATH. |

Retain command, executable/root, actual output, errors and exact version. A failed
probe means `installed version NOT DETERMINED`, never proof no engine exists.
An installed series match is not exact patch equality. If selected and installed
versions differ, state both and offer: use installed, pin selected and upgrade
installation later, or deliberately pin selected. Wait for a real choice and
record its reason. Do not silently select the installed version or pretend the
newer engine was run.

Record `Installed at pin time` in the chosen project's VERSION.md even for a
same-version reference, reusing approved setup write scope. Include the actual
version/path or NOT DETERMINED with its reason. Merely recording this observation
does not justify changing a documentation verification date. Store `engine.path`
when needed; commands must also contain the correct executable, since it is not
injected into commands at execution time.

Godot C#/Both additionally requires the matching .NET-enabled Godot editor and
compatible SDK. Probe their actual availability when authorized; a regular Godot
version string or writing C# conventions does not establish .NET functionality.

## Knowledge risk

The source shipped a conservative **historical** baseline: May2025, Godot~4.3,
Unity~2022.3 LTS, Unreal~5.3. It is not a claim about the current Codex model's
training cutoff or verified API knowledge. Do not advance that baseline from
confidence or assume a later model knows every newer API. If actual coverage is
earlier or cannot establish a safer baseline, retain conservative HIGH risk for
uncertain versions. Historical template risk dates remain historical.

Classify with an explicit basis: within established coverage LOW (reference
optional but recommended), near its edge MEDIUM (reference recommended), beyond
or unknown HIGH (reference required). The pinned modern Web starter is treated
conservatively HIGH. Explain the category and why. Even LOW does not authorize
inventing reference facts: new reference claims always require fetched official
sources. A NOT SOURCEABLE entry honestly records a gap.
