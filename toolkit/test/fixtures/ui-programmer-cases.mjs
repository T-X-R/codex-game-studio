// Maintainer-only raw game inputs. No prewritten implementation or expected report.
const model = `extends Node
signal changed
signal selection_requested(index: int)
var slots: Array[Dictionary] = [
 {"key": "ITEM_POTION", "quantity": 2, "locked": false},
 {"key": "ITEM_KEY", "quantity": 1, "locked": false},
 {"key": "", "quantity": 0, "locked": false},
 {"key": "ITEM_GEM", "quantity": 1, "locked": true}]
var requests: Array[int] = []
## Game-side quantity change; the UI observes changed, not raw input mutations.
func set_quantity(index: int, quantity: int) -> void:
 slots[index]["quantity"] = quantity
 changed.emit()
## The UI requests selection through this command; inventory ownership stays here.
func request_select(index: int) -> void:
 requests.append(index)
 selection_requested.emit(index)
`;
const ux = `# Inventory screen — approved implementation spec
Use the configured Godot Control toolkit and GDScript. A 640 by 480 panel contains
a title, a horizontal row of four focusable slot Buttons named Slot0 through
Slot3, and a Details Label. These names are the game integration contract.
The panel follows the parent viewport. Slots have equal width, at least64px high,
with12px gaps. This is a supplied mockup, not a request to redesign the flow.
States: default (occupied/unselected), hover (pointer over unselected occupied),
selected (after activation), empty-slot and locked-slot. Locked/empty appearance
has priority over hover. Selection has priority over hover on occupied slots.
Use normal #273244, hover #415878, selected #237a58, empty #171d28, locked #5a3038
backgrounds, white text and a visible white2px keyboard/gamepad focus outline.
Only locked slots are disabled. Empty slots remain focusable and activatable.
Selecting an occupied slot shows its localized item name and current quantity in
Details. Selecting an empty slot clears Details. Activate through the existing
InventoryModel.request_select command; use its selection_requested signal for
selection feedback. Game changes emit InventoryModel.changed; refresh labels and
selected Details automatically. Never modify slots from the UI.
Use title/localized slot labels from i18n/en.po; empty and locked each have labels,
not color alone. Layout must accommodate text changes. Support mouse hover/click,
keyboard left/right+Enter and the corresponding gamepad focus/accept actions.
Use existing remappable ui_left/ui_right/ui_accept actions. No inventory item
movement, equipping, dropping or combining belongs in this screen.
No audio event is specified, so do not add a sound. No animation is specified.
`;
const po = `msgid ""
msgstr ""
"Language: en\\n"
"Content-Type: text/plain; charset=UTF-8\\n"

msgid "INVENTORY_TITLE"
msgstr "Inventory"

msgid "ITEM_POTION"
msgstr "Potion"

msgid "ITEM_KEY"
msgstr "Key"

msgid "ITEM_GEM"
msgstr "Gem"

msgid "EMPTY_SLOT"
msgstr "Empty"

msgid "LOCKED_SLOT"
msgstr "Locked"

msgid "ITEM_QUANTITY"
msgstr "{item} x{quantity}"
`;
const files = version => ({
 'project.yaml': `engine:\n  name: Godot\n  version: '${version}'\n  language: GDScript\n  code_root: src\nmodes:\n  automation: guided\n  rigor: standard\n`,
 'project.godot': `config_version=5\n[application]\nconfig/name="UI inventory fixture"\nrun/main_scene="res://src/ui/inventory_screen.tscn"\n[autoload]\nInventoryModel="*res://src/inventory_model.gd"\n[display]\nwindow/size/viewport_width=640\nwindow/size/viewport_height=480\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n[internationalization]\nlocale/translations=PackedStringArray("res://i18n/en.po")\n`,
 'src/inventory_model.gd': model,
 'i18n/en.po': po,
 'design/ux/inventory-flow.md': ux,
 'docs/coding-standards.md': '# Code standards\nDocument public UI APIs and non-obvious state transitions; use typed GDScript and existing game command interfaces.\n',
 'docs/engine-reference/godot/VERSION.md': `# Fixture engine pin\nEngine Version: Godot ${version}\nLanguage: GDScript\nLLM Knowledge Cutoff: May2025\nInstalled version is recorded separately in the maintainer engine-preflight evidence.\nPackaged module references may describe newer versions; their version claims are not proof of compatibility with this pin. Verify against actual version-matched engine reference material.\n`,
});
const configuredInventory = files('4.7.2');
configuredInventory['project.godot'] += "\n[input]\n\nui_left={\n\"deadzone\": 0.5,\n\"events\": [Object(InputEventKey,\"keycode\":4194319), Object(InputEventJoypadButton,\"button_index\":13)]\n}\nui_right={\n\"deadzone\": 0.5,\n\"events\": [Object(InputEventKey,\"keycode\":4194321), Object(InputEventJoypadButton,\"button_index\":14)]\n}\nui_accept={\n\"deadzone\": 0.5,\n\"events\": [Object(InputEventKey,\"keycode\":4194309), Object(InputEventKey,\"keycode\":4194310), Object(InputEventKey,\"keycode\":32), Object(InputEventJoypadButton,\"button_index\":0)]\n}\n";
configuredInventory['design/ux/inventory-flow.md'] += "\nWhen the screen opens, focus Slot0 for keyboard/gamepad navigation. No slot is selected until the player activates one, and Details is initially empty. Focus alone must not request selection or display item details. Use the project's remappable ui_left, ui_right and ui_accept mappings for navigation and activation.\n";
const implement = 'Implement the inventory screen from design/ux/inventory-flow.md, using the existing model and localization resources. Approved architecture: a Control scene and script at src/ui/inventory_screen.tscn and src/ui/inventory_screen.gd, observing the supplied InventoryModel interface. Only those two new source files, their engine-generated uid files, new tests/ui_* files and fresh production/qa/evidence/ files may be written. Preserve all existing game/config/spec/runtime files. Run available relevant checks and retain a screenshot of the screen if rendering works; report limitations honestly. Do not install dependencies, commit, publish or run another specialist. Work offline.';
const question = 'Read design/ux/inventory-flow.md and advise how to implement the requested change. First return any unresolved spec-owner decisions through the caller; do not write project files or guess missing behavior. No engine/test execution, installs or further delegation in this first turn.';
const base = { role: 'game-studio-ui-programmer', sandbox: 'workspace-write', expectedVersion: '4.7.2', engine: 'godot', timeoutMs: 720000 };
export const uiScenarios = {
 'inventory': { ...base, needsEngine: true, inputs: files('4.7.2'), request: implement },
 'inventory-configured-input': { ...base, needsEngine: true, inputs: configuredInventory, request: implement },
 'flow-design': { ...base, sandbox: 'read-only', inputs: files('4.7.2'), request: 'Design the inventory interaction flow: what should happen when the player equips, drops or combines items? This is read-only; do not implement code or run tests. Return your response to me; do not launch another role.' },
 'bounce-question': { ...base, inputs: { ...files('4.7.2'), 'design/ux/inventory-flow.md': ux.replace('No animation is specified.', 'Selection needs a custom bounce animation; timing, easing and overshoot have not been decided.') }, request: question,
  continuation: 'The UX owner has answered: animate the selected slot scale from 1.0 to1.06 over0.08seconds with quadratic ease-out, then return to1.0 over0.12seconds with quadratic ease-in. Art direction approves those values and the existing appearance. Add a public set_reduced_motion(enabled) and skip_animation() on the screen; either reduced motion or skipping settles scale to1.0 immediately. Keep other approved decisions. '+implement },
 'empty-question': { ...base, inputs: { ...files('4.7.2'), 'design/ux/inventory-flow.md': ux.replace('Selecting an empty slot clears Details.', 'The behavior of Details when an empty slot is selected is not yet defined.') }, request: question,
  continuation: 'The UX owner has answered: selecting an empty slot clears the detail panel; all other approved behavior is unchanged. '+implement },
 'godot46': { ...base, expectedVersion: '4.6', needsEngine: true, inputs: { ...files('4.6'), 'design/ux/inventory-flow.md': ux+'\nPlace the slot row within a ScrollContainer so it can be scrolled when the viewport is narrow; preserve the stated controls and behavior.\n' }, request: implement },
};
export const mutable = path => ['src/ui/inventory_screen.gd', 'src/ui/inventory_screen.tscn', 'src/ui/inventory_screen.gd.uid', 'src/ui/inventory_screen.tscn.uid'].includes(path);
export const allowedNew = path => mutable(path) || /^tests\/ui_[^/]+\.(gd|tscn|uid)$/.test(path) || path.startsWith('production/qa/evidence/');
