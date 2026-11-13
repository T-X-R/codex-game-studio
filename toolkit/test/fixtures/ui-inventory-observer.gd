# Maintainer-owned observer. Records actual Control/input/render output, never PASS.
# API references (documentation, not proof this candidate compiled or ran):
# https://docs.godotengine.org/en/4.6/classes/class_input.html
# https://docs.godotengine.org/en/4.6/classes/class_viewport.html
# https://docs.godotengine.org/en/4.6/classes/class_displayserver.html
extends SceneTree

var output: String
var observations: Array[Dictionary] = []

func _initialize() -> void:
 call_deferred("observe")

func settle() -> void:
 await process_frame
 await process_frame

func controls(node: Node) -> Array[Dictionary]:
 var found: Array[Dictionary] = []
 if node is Control:
  var entry := {"path": str(node.get_path()), "class": node.get_class(),
   "visible": node.is_visible_in_tree(), "position": str(node.global_position),
   "size": str(node.size), "focus": node.has_focus(), "scale": str(node.scale)}
  if node is Label or node is Button:
   entry["text"] = node.text
  if node is BaseButton:
   entry["disabled"] = node.disabled
  found.append(entry)
 for child in node.get_children():
  found.append_array(controls(child))
 return found

func record(label: String) -> void:
 await settle()
 await RenderingServer.frame_post_draw
 var image := root.get_texture().get_image()
 var capture := output.path_join(label + ".png")
 var saved := image.save_png(capture) if not image.is_empty() else ERR_INVALID_DATA
 var model := root.get_node("InventoryModel")
 observations.append({"interaction": label, "ticks_ms": Time.get_ticks_msec(), "controls": controls(current_scene),
  "slots": model.get("slots").duplicate(true), "selection_commands": model.get("requests").duplicate(),
  "screenshot": capture, "capture_error": saved})

func record_now(label: String) -> void:
 # Deliberately synchronous: motion setters are observed before another frame.
 observations.append({"interaction": label, "ticks_ms": Time.get_ticks_msec(), "controls": controls(current_scene)})

func sample_frames(label: String, slot: Control) -> void:
 var start := Time.get_ticks_msec()
 var samples: Array[Dictionary] = []
 var frames := 0
 while Time.get_ticks_msec() - start < 350 and frames < 240:
  await process_frame
  frames += 1
  samples.append({"ticks_ms": Time.get_ticks_msec(), "slot_scale": str(slot.scale)})
 observations.append({"interaction": label, "started_ms": start, "samples": samples})

func press_now(slot: Control) -> void:
 for pressed in [true, false]:
  var event := InputEventMouseButton.new()
  event.position = slot.get_global_rect().get_center()
  event.global_position = event.position
  event.button_index = MOUSE_BUTTON_LEFT
  event.pressed = pressed
  Input.parse_input_event(event)

func pointer(slot: Control) -> void:
 var motion := InputEventMouseMotion.new()
 motion.position = slot.get_global_rect().get_center()
 motion.global_position = motion.position
 Input.parse_input_event(motion)
 await settle()

func click(slot: Control) -> void:
 await pointer(slot)
 for pressed in [true, false]:
  var event := InputEventMouseButton.new()
  event.position = slot.get_global_rect().get_center()
  event.global_position = event.position
  event.button_index = MOUSE_BUTTON_LEFT
  event.pressed = pressed
  Input.parse_input_event(event)
  await settle()

func key(code: Key) -> void:
 for pressed in [true, false]:
  var event := InputEventKey.new()
  event.keycode = code
  event.pressed = pressed
  Input.parse_input_event(event)
  await settle()

func observe() -> void:
 var args := OS.get_cmdline_user_args()
 if args.size() != 1 or not args[0].begins_with("res://production/qa/evidence/"):
  push_error("Supply one fresh res://production/qa/evidence/ output directory")
  quit(2)
  return
 output = args[0]
 if DirAccess.dir_exists_absolute(output):
  push_error("Refusing existing observation output")
  quit(2)
  return
 if DisplayServer.get_name() == "headless":
  print("NOT ASSESSED: real UI rendering is unavailable in headless mode")
  quit(3)
  return
 var created := DirAccess.make_dir_recursive_absolute(output)
 if created != OK:
  quit(2)
  return
 var changed := change_scene_to_file("res://src/ui/inventory_screen.tscn")
 if changed != OK:
  push_error("Screen could not be loaded")
  quit(1)
  return
 await settle()
 var slot0 := current_scene.find_child("Slot0", true, false) as Control
 var slot1 := current_scene.find_child("Slot1", true, false) as Control
 var slot2 := current_scene.find_child("Slot2", true, false) as Control
 var slot3 := current_scene.find_child("Slot3", true, false) as Control
 if slot0 == null or slot1 == null or slot2 == null or slot3 == null:
  push_error("Required integration controls missing")
  quit(1)
  return
 await record("initial")
 await pointer(slot0)
 await record("pointer-over-first-slot")
 await click(slot0)
 await record("first-slot-mouse-activation")
 root.get_node("InventoryModel").call("set_quantity", 0, 7)
 await record("game-side-quantity-change")
 slot0.grab_focus()
 await key(KEY_RIGHT)
 await key(KEY_ENTER)
 await record("keyboard-right-and-accept")
 slot0.grab_focus()
 record_now("before-gamepad-navigation")
 for pressed in [true, false]:
  var direction := InputEventJoypadButton.new()
  direction.button_index = JOY_BUTTON_DPAD_RIGHT
  direction.pressed = pressed
  Input.parse_input_event(direction)
  await settle()
 await record("gamepad-right-focus-before-confirm")
 for pressed in [true, false]:
  var gamepad := InputEventJoypadButton.new()
  gamepad.button_index = JOY_BUTTON_A
  gamepad.pressed = pressed
  Input.parse_input_event(gamepad)
  await settle()
 await record("gamepad-accept")
 await click(slot2)
 await record("empty-slot-activation")
 await click(slot3)
 await record("locked-slot-click")
 if current_scene.has_method("set_reduced_motion") and current_scene.has_method("skip_animation"):
  current_scene.call("set_reduced_motion", false)
  await pointer(slot0)
  press_now(slot0)
  record_now("selection-animation-start")
  await sample_frames("selection-animation-frames", slot0)
  await pointer(slot1)
  press_now(slot1)
  await process_frame
  record_now("before-skip-animation")
  current_scene.call("skip_animation")
  record_now("immediately-after-skip-animation")
  await sample_frames("post-skip-frames", slot1)
  await pointer(slot0)
  press_now(slot0)
  await process_frame
  record_now("before-enabling-reduced-motion")
  current_scene.call("set_reduced_motion", true)
  record_now("immediately-after-enabling-reduced-motion")
  await sample_frames("reduced-motion-during-active-animation", slot0)
  await pointer(slot1)
  press_now(slot1)
  record_now("reduced-motion-selection-start")
  await sample_frames("reduced-motion-selection-frames", slot1)
  await record("reduced-motion-selection")
 else:
  observations.append({"interaction": "animation-methods", "set_reduced_motion": current_scene.has_method("set_reduced_motion"),
   "skip_animation": current_scene.has_method("skip_animation")})
 var file := FileAccess.open(output.path_join("observations.json"), FileAccess.WRITE)
 if file == null:
  quit(2)
  return
 file.store_string(JSON.stringify({"status": "not_assessed", "engine": Engine.get_version_info(),
  "display_server": DisplayServer.get_name(), "observations": observations,
  "limitations": ["Injected Godot input events are not physical-device or human-play evidence.",
   "Inspect screenshots, controls and game command records against the design; no semantic PASS is assigned.",
   "Inspect animation samples against supplied values; screen reader, remapping, RTL and measured performance require additional observation."]}, "  "))
 file.close()
 print("Recorded UI observations: " + output)
 quit(0)
