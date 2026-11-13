# Select an engine without replacing an existing project

## Establish the current project first

An explicit engine request is a proposed engine selection, not approval to
replace existing project files. Otherwise read effective `engine.name` and its
source: a configured engine continues without another engine menu. With no
configured engine, inspect root markers: `project.godot`,
`ProjectSettings/ProjectVersion.txt`, root `*.uproject`, or `package.json`.
A unique marker continues that engine; competing markers need clarification,
not a default to Web. Name the evidence. Existing engine projects remain intact
when changing the configured engine; reference sets can coexist.

For a new project, read only useful design sections. Resolve
`studio/scripts/md-section.mjs`, then `--project ROOT list FILE` and
`--project ROOT extract FILE HEADING`. At standard/full inspect the concept's
genre, scope, platform, art style, team size and named engine preference. At
minimal inspect the brief's genre, scope, platform and art direction if present.
An explicitly named engine in the user's request or design wins. A missing
minimal brief is expected; an undecided preference is not an engine choice.

## A new project with no named engine

Explain first: Godot, Unity or Unreal may fit a large 3D game, console or
phone-store release, or an engine the owner already knows. Ask which engine:

1. Web (Recommended): a browser game, with Node tooling and no editor to learn.
2. Godot.
3. Unity.
4. Unreal Engine 5.
5. Help me choose.

Use the question tool if available, otherwise numbered text. If the actual brief
requires console/store delivery, a large open world or photorealistic 3D, retain
Web first but remove its recommendation and recommend the suitable editor engine
with the brief's reason. Do not imply Web directly ships to console or a phone
store. Do not claim a recommendation was selected until the owner answers.

## Help the owner choose

Ask prior experience first: Web/TypeScript/JavaScript, Godot, Unity, Unreal,
none or several. A specific familiar engine outweighs the other factors:
recommend it, confirm, then skip the remaining questionnaire. With none/several,
ask platform (browser/PC, phone, console or several), then only missing details:
2D/3D/both, keyboard/mouse/gamepad/touch/mixed input, team size/experience,
language preference and licensing constraints.

Use the source tradeoffs as a starting point, checking current platform/support
and licensing claims against official sources before stating them as current:

| Engine | Strengths and suitable work | Tradeoffs to discuss |
|---|---|---|
| Web | Browser sharing/itch.io, jams, first games, 2D/light3D, no editor, headless tests, open tooling | No editor/asset store in the base starter, browser limits for heavy3D/worlds, console unavailable directly, store wrappers needed |
| Godot | 2D, stylized/contained3D, rapid iteration, MIT/open source, solo control and gentler learning curve | Smaller3D ecosystem/professional market, large seamless worlds require careful proof, console requires extra publisher/porting arrangements |
| Unity | Mobile/mid-scope3D, broad assets/tutorials, C#, indie console ecosystem, small teams | Heavier editor/C# learning curve, licensing policy trust/history; verify current pricing before quoting any ceiling |
| Unreal | High-end/photoreal3D, mature large-world tooling, Blueprint prototyping and C++ | Heavy editor/compile footprint, steepest learning curve, excessive for small2D, poor match for browser and simple mobile; verify current royalty/seat terms |

Platform weighs before genre: browser favors Web (other engines' export support
must be checked); mobile favors Unity with Godot viable for simpler projects;
console favors Unity/Unreal; PC permits all; multiple PC/mobile/console targets
favor Unity's portability. Do not turn these into an automatic scoring verdict.

Genre guidance retained: small2D/puzzle/arcade/jam/link-sharing→Web; dedicated2D
and 2D platformer→Godot; contained stylized/atmospheric3D→Godot or Unity;
large3D open-world→Unity/Unreal; photorealistic3D→Unreal; mobile-first→Unity;
console-first→Unity/Unreal; horror/narrative/walking simulator→match art and
team rather than one engine; 3D action-RPG/Soulslike→Unity/Unreal ecosystem;
strategy/top-down/RTS→Godot or Unity according to dimension/scope.

Present a comparison table whose rows are the owner's actual factors, one primary
recommendation with reasoning, and the strongest alternative with its conditions.
Explain this is a starting point rather than a verdict; changing engines between
projects is possible but does not make migration free. End with real choices:
primary, alternative, another plausible engine, or explore further.

For exploration, derive topics from the actual concept: the primary engine's
specific limitations, the alternative's tradeoffs, language effects on technical
challenges and a concept-specific issue such as adaptive audio/streaming/netcode.
Allow multiple topics, answer each selected topic before returning to engine
confirmation. Never silently start configuration while the choice remains open.
