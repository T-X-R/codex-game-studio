# Unity test setup

Unity compiles Assets and Packages; default test roots are
`Assets/Tests/EditMode` (unit) and `Assets/Tests/PlayMode` (integration). An actual
approved root must remain in engine-compiled scope. Top-level tests/ retains
README and smoke checklist only; a C# test there may be silently undiscovered.

Read Packages/manifest.json as JSON and inspect its dependencies for
com.unity.test-framework. A text substring/comment is not installed-package
proof. If absent, present the actual package addition separately and obtain/reuse
its authorization. Determine the compatible version from this installed editor's
bundled package metadata or current official package documentation; never copy
an example number. Source examples6000.3.23f1→1.6.0 and6000.1.0f1→1.5.1 illustrate
why this matters, not universal recommendations. On Windows the bundle path is
`Data/Resources/PackageManager/BuiltInPackages/com.unity.test-framework/package.json`
below the directory containing Unity.exe. Inspect other actual installations
rather than inventing a platform path. Missing package can hang -runTests;
retain it as a prerequisite and do not launch an unbounded test.

Create missing EditModeTests.asmdef with:

```json
{
  "name": "EditModeTests",
  "references": ["UnityEngine.TestRunner", "UnityEditor.TestRunner"],
  "includePlatforms": ["Editor"],
  "overrideReferences": true,
  "precompiledReferences": ["nunit.framework.dll"],
  "autoReferenced": false,
  "defineConstraints": ["UNITY_INCLUDE_TESTS"]
}
```

The PlayMode counterpart uses name PlayModeTests and includePlatforms `[]`.
Preserve every pre-existing assembly file. Before authoring the new assemblies,
inspect actual game assemblies and determine their needed references:

- A test asmdef cannot reference default Assembly-CSharp. If game code has no
  asmdef, explain the assembly boundary and ask before creating a game assembly,
  e.g. Assets/Scripts/Game.asmdef. That is an additional code-visibility change,
  not implied by force or mere test-folder creation.
- Inspect game using statements and installed packages. Reference only actual
  matching assemblies, such as Unity.InputSystem, Unity.TextMeshPro or
  UnityEngine.UI when genuinely used/installed; no speculative package install.
- Give each Editor folder under a new runtime assembly its own Editor-only
  asmdef referencing that runtime assembly; otherwise UnityEditor code can join
  runtime and break a player build.
- Include the settled game assembly in both newly authored test assemblies.
  If existing test assemblies need a change, report it as separately scoped work;
  this missing-only operation must not overwrite them to force the change.
  A scaffold that still cannot reference game classes has an explicit unmet need.

The shared helper emits the source base asmdefs and reports the game-assembly
reference need; it does not discover and grant every reference automatically.
After its apply, complete only asmdefs that this run actually created, using the
already settled reference list and a before-image check against the generated
bytes. This is scoped completion of new output, not permission to change any
pre-existing file. If another writer changed it, stop. Report unresolved refs
rather than implying game classes are visible. The game/Editor asmdef addition
itself still needs the separate concrete scope described above.

Name classes `[System]Tests` in the same-named .cs file, methods
`[Scenario]_[Expected]`, e.g. CombatTests.cs / BaseAttack_ReturnsExpectedDamage().

Document two independent local runs using the actual Hub editor executable,
not an unrelated Unity CLI on PATH, without -quit:

```text
"<Unity editor>" -batchmode -runTests -projectPath . -testPlatform EditMode -testResults <fresh-editmode.xml>
"<Unity editor>" -batchmode -runTests -projectPath . -testPlatform PlayMode -testResults <fresh-playmode.xml>
```

Use unique owned output directories per run, keeping editmode.xml/playmode.xml
separate. If a fixed prior result path is deliberately reused, clear only that
owned old result before execution under the authorized scope; never read stale
XML as this run. A fresh path achieves the source's same freshness requirement
without deleting retained evidence. Missing result after compile failure is not
an old success. Inspect `<test-run>` counts and actual failures: testcasecount0
is NOT ASSESSED, not “Passed”. Source codes0/2 are passing/failing tests;1 compile,
3 run failure,4 invalid testPlatform and every other nonzero remain failures.
EditMode does not cover PlayMode. Run both when their test roots contain tests;
report modes never reached rather than extending one result to the other.

The source CI has distinct editmode/playmode steps and result paths, plus a
manual UNITY_LICENSE repository secret. Creating those steps or an asmdef is
not evidence of package resolution, a licensed editor, real tests or working CI.
Never automate license management as part of this utility.
