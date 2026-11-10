@tool
extends VBoxContainer
## Hydrilla dock: paste an API key, generate models, and receive them from
## Hydrilla Studio or your AI agent. There is no sign-in.

const Bridge: GDScript = preload("res://addons/hydrilla/hydrilla_bridge.gd")

const DEFAULT_API_BASE: String = "https://hydrilla-ai-g1bm.vercel.app"
const API_KEYS_URL: String = "https://hydrilla.ai/app/api-keys"
const RETIRED_API_HOSTS: Array[String] = ["hydrilla-backend.vercel.app", "api.hydrilla.co", "api.hydrilla.ai"]
const SETTING_API_KEY: String = "hydrilla/api_key"
const SETTING_API_BASE: String = "hydrilla/api_base"
const SETTING_BRIDGE_ON: String = "hydrilla/bridge_on"
const OUTPUT_DIR: String = "res://hydrilla"
const NO_KEY_MESSAGE: String = "Add your Hydrilla API key first. Create one at hydrilla.ai/app/api-keys."
const BAD_KEY_MESSAGE: String = "Hydrilla did not accept this API key. Check it, or create a new one at hydrilla.ai/app/api-keys."
const REQUEST_TIMEOUT: float = 60.0
# Text-to-3D creates its concept image before the request returns.
const CREATE_TIMEOUT: float = 240.0
const DOWNLOAD_TIMEOUT: float = 300.0
const POLL_SECONDS: float = 2.0
const MAX_POLL_SECONDS: float = 25.0 * 60.0
const MAX_POLL_FAILURES: int = 5

var _account_label: Label
var _key_field: LineEdit
var _prompt_field: LineEdit
var _image_field: LineEdit
var _text_button: Button
var _image_button: Button
var _cancel_button: Button
var _status_label: Label
var _bridge_button: Button
var _bridge_label: Label
var _file_dialog: EditorFileDialog
var _bridge: Node

var _busy: bool = false
var _cancel_requested: bool = false


func _ready() -> void:
	_build()
	_bridge = Bridge.new()
	add_child(_bridge)
	_bridge.mesh_received.connect(_on_bridge_mesh)
	_bridge.mesh_url_received.connect(_on_bridge_mesh_url)

	_key_field.text = _saved_api_key()
	if _api_key().is_empty():
		_account_label.text = "Add your API key to start"
	else:
		_check_key()
	if bool(_setting(SETTING_BRIDGE_ON, false)):
		_start_bridge()


# ---- layout ---------------------------------------------------------------

func _label(text: String) -> Label:
	var label: Label = Label.new()
	label.text = text
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(label)
	return label


func _button(text: String, handler: Callable, parent: Node = self) -> Button:
	var button: Button = Button.new()
	button.text = text
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.pressed.connect(handler)
	parent.add_child(button)
	return button


func _field(placeholder: String) -> LineEdit:
	var field: LineEdit = LineEdit.new()
	field.placeholder_text = placeholder
	add_child(field)
	return field


func _build() -> void:
	_label("Hydrilla account")
	_account_label = _label("")
	_key_field = _field("hyd_live_…")
	_key_field.secret = true
	_key_field.text_submitted.connect(_on_key_submitted)
	var key_row: HBoxContainer = HBoxContainer.new()
	add_child(key_row)
	_button("Get API key", _open_api_keys_page, key_row)
	_button("Save and check", _save_key, key_row)
	_button("Remove", _remove_key, key_row)

	add_child(HSeparator.new())
	_prompt_field = _field("Describe the model you want")
	_text_button = _button("Generate from text", _generate_text)
	var image_row: HBoxContainer = HBoxContainer.new()
	add_child(image_row)
	_image_field = LineEdit.new()
	_image_field.placeholder_text = "Image file or https:// link"
	_image_field.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	image_row.add_child(_image_field)
	var browse: Button = _button("Browse…", _browse_image, image_row)
	browse.size_flags_horizontal = Control.SIZE_SHRINK_END
	_image_button = _button("Generate from image", _generate_image)
	_status_label = _label("Ready")
	_cancel_button = _button("Cancel", _request_cancel)
	_cancel_button.visible = false

	add_child(HSeparator.new())
	_bridge_button = _button("Run Bridge", _toggle_bridge)
	_bridge_button.toggle_mode = true
	_bridge_label = _label("Lets Hydrilla Studio and your AI agent send models into this project.")

	_file_dialog = EditorFileDialog.new()
	_file_dialog.file_mode = EditorFileDialog.FILE_MODE_OPEN_FILE
	_file_dialog.access = EditorFileDialog.ACCESS_FILESYSTEM
	_file_dialog.filters = PackedStringArray(["*.png, *.jpg, *.jpeg, *.webp ; Images"])
	_file_dialog.file_selected.connect(_on_image_chosen)
	add_child(_file_dialog)


func _open_api_keys_page() -> void:
	OS.shell_open(API_KEYS_URL)


func _on_image_chosen(path: String) -> void:
	_image_field.text = path


func _on_key_submitted(_text: String) -> void:
	_save_key()


# ---- settings -------------------------------------------------------------

func _setting(name: String, fallback: Variant) -> Variant:
	var settings: EditorSettings = EditorInterface.get_editor_settings()
	if settings.has_setting(name):
		return settings.get_setting(name)
	return fallback


func _set_setting(name: String, value: Variant) -> void:
	EditorInterface.get_editor_settings().set_setting(name, value)


## Strips whitespace, quotes and a pasted "Bearer " prefix.
func _clean_key(value: String) -> String:
	var text: String = value.strip_edges()
	text = text.trim_prefix("\"").trim_suffix("\"").trim_prefix("'").trim_suffix("'").strip_edges()
	if text.to_lower().begins_with("bearer "):
		text = text.substr(7).strip_edges()
	return text


func _looks_like_api_key(value: String) -> bool:
	if not value.begins_with("hyd_") or value.length() < 16:
		return false
	for index: int in range(value.length()):
		var ch: String = value[index]
		if not (ch.is_valid_identifier() or ch.is_valid_int() or ch == "-"):
			return false
	return true


func _saved_api_key() -> String:
	return _clean_key(str(_setting(SETTING_API_KEY, "")))


## The key shared by the other Hydrilla plugins on this computer, if any.
func _shared_config() -> Dictionary:
	var folder: String = OS.get_environment("HYDRILLA_CONFIG_DIR")
	if folder.is_empty():
		var home: String = OS.get_environment("USERPROFILE") if OS.has_feature("windows") else OS.get_environment("HOME")
		if home.is_empty():
			return {}
		folder = home.path_join(".hydrilla")
	var path: String = folder.path_join("config.json")
	if not FileAccess.file_exists(path):
		return {}
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if typeof(parsed) == TYPE_DICTIONARY:
		return parsed
	return {}


## Key to use: this editor's, else the environment, else the shared one.
func _api_key() -> String:
	var saved: String = _saved_api_key()
	if not saved.is_empty():
		return saved
	var from_environment: String = _clean_key(OS.get_environment("HYDRILLA_API_KEY"))
	if not from_environment.is_empty():
		return from_environment
	return _clean_key(str(_shared_config().get("api_key", "")))


func _api_base() -> String:
	var value: String = str(_setting(SETTING_API_BASE, "")).strip_edges()
	if value.is_empty():
		value = OS.get_environment("HYDRILLA_API_BASE").strip_edges()
	if value.is_empty():
		value = str(_shared_config().get("api_base", "")).strip_edges()
	value = value.trim_suffix("/")
	if not (value.begins_with("https://") or value.begins_with("http://")):
		return DEFAULT_API_BASE
	for retired: String in RETIRED_API_HOSTS:
		if value.contains(retired):
			return DEFAULT_API_BASE
	return value


# ---- account --------------------------------------------------------------

func _save_key() -> void:
	var cleaned: String = _clean_key(_key_field.text)
	_key_field.text = cleaned
	if not cleaned.is_empty() and not _looks_like_api_key(cleaned):
		_account_label.text = "That does not look like a Hydrilla key (hyd_live_…)."
		return
	_set_setting(SETTING_API_KEY, cleaned)
	if _api_key().is_empty():
		_account_label.text = "Add your API key to start"
		return
	_check_key()


func _remove_key() -> void:
	_key_field.text = ""
	_set_setting(SETTING_API_KEY, "")
	_account_label.text = "API key removed from this editor."


func _check_key() -> void:
	_account_label.text = "Checking your key…"
	var reply: Dictionary = await _request(HTTPClient.METHOD_GET, "/v1/user/me")
	if not reply["ok"]:
		_account_label.text = str(reply["error"])
		return
	var data: Dictionary = reply["data"]
	var credits: Variant = data.get("credits")
	if typeof(credits) == TYPE_DICTIONARY and credits.has("remaining"):
		_account_label.text = "Connected · %d credits" % int(credits["remaining"])
	else:
		_account_label.text = "Connected"


# ---- HTTP -----------------------------------------------------------------

func _error_message(status: int, data: Dictionary) -> String:
	if status == 401:
		return BAD_KEY_MESSAGE
	var nested: Variant = data.get("error")
	if typeof(nested) == TYPE_DICTIONARY and nested.has("message"):
		return str(nested["message"])
	if typeof(nested) == TYPE_STRING and not str(nested).is_empty():
		return str(nested)
	if status == 402:
		return "Not enough credits. Top up at hydrilla.ai."
	if status == 429:
		return "Too many requests. Wait a moment and try again."
	if status >= 500:
		return "Hydrilla is having trouble right now (%d). Try again shortly." % status
	if status > 0:
		return "Hydrilla API request failed (%d)." % status
	return "Could not reach the Hydrilla API. Check your internet connection."


## Sends one API request. Returns {"ok", "status", "data", "error"}.
func _request(
	method: int,
	path: String,
	body: PackedByteArray = PackedByteArray(),
	content_type: String = "",
	timeout: float = REQUEST_TIMEOUT
) -> Dictionary:
	var key: String = _api_key()
	if key.is_empty():
		return {"ok": false, "status": 0, "data": {}, "error": NO_KEY_MESSAGE}

	var http: HTTPRequest = HTTPRequest.new()
	http.timeout = timeout
	add_child(http)
	var headers: PackedStringArray = PackedStringArray([
		"Accept: application/json",
		"Authorization: Bearer %s" % key,
	])
	if not content_type.is_empty():
		headers.append("Content-Type: %s" % content_type)

	var started: int = http.request_raw(_api_base() + path, headers, method, body)
	if started != OK:
		http.queue_free()
		return {"ok": false, "status": 0, "data": {}, "error": "Could not start the request. Check the API address."}

	var response: Array = await http.request_completed
	http.queue_free()
	var result: int = response[0]
	var status: int = response[1]
	var raw: PackedByteArray = response[3]
	var data: Dictionary = {}
	var parsed: Variant = JSON.parse_string(raw.get_string_from_utf8()) if raw.size() > 0 else null
	if typeof(parsed) == TYPE_DICTIONARY:
		data = parsed
	if result != HTTPRequest.RESULT_SUCCESS:
		return {"ok": false, "status": 0, "data": data, "error": _error_message(0, data)}
	if status < 200 or status >= 300:
		return {"ok": false, "status": status, "data": data, "error": _error_message(status, data)}
	return {"ok": true, "status": status, "data": data, "error": ""}


func _json_body(value: Dictionary) -> PackedByteArray:
	return JSON.stringify(value).to_utf8_buffer()


## Builds a multipart upload with the image in the "image" field.
func _multipart_image(path: String, boundary: String) -> PackedByteArray:
	var bytes: PackedByteArray = FileAccess.get_file_as_bytes(path)
	var extension: String = path.get_extension().to_lower()
	var mime: String = "image/png"
	if extension == "jpg" or extension == "jpeg":
		mime = "image/jpeg"
	elif extension == "webp":
		mime = "image/webp"
	var filename: String = path.get_file().replace("\"", "")
	var head: String = "--%s\r\nContent-Disposition: form-data; name=\"image\"; filename=\"%s\"\r\nContent-Type: %s\r\n\r\n" % [boundary, filename, mime]
	var body: PackedByteArray = head.to_utf8_buffer()
	body.append_array(bytes)
	body.append_array(("\r\n--%s--\r\n" % boundary).to_utf8_buffer())
	return body


# ---- generation -----------------------------------------------------------

func _set_busy(busy: bool) -> void:
	_busy = busy
	_text_button.disabled = busy
	_image_button.disabled = busy
	_cancel_button.visible = busy
	_cancel_button.disabled = false
	if not busy:
		_cancel_requested = false


func _set_status(message: String) -> void:
	_status_label.text = message


func _browse_image() -> void:
	_file_dialog.popup_centered_ratio(0.6)


func _request_cancel() -> void:
	_cancel_requested = true
	_cancel_button.disabled = true
	_set_status("Cancelling…")


func _generate_text() -> void:
	var prompt: String = _prompt_field.text.strip_edges()
	if prompt.is_empty():
		_set_status("Enter a prompt.")
		return
	if not _begin():
		return
	_set_status("Creating the concept image…")
	var created: Dictionary = await _request(
		HTTPClient.METHOD_POST, "/v1/3d/text-to-3d", _json_body({"prompt": prompt}), "application/json", CREATE_TIMEOUT
	)
	await _finish(created)


func _generate_image() -> void:
	var source: String = _image_field.text.strip_edges()
	var is_link: bool = source.begins_with("https://") or source.begins_with("http://")
	if not is_link and (source.is_empty() or not FileAccess.file_exists(source)):
		_set_status("Choose an image file, or paste an https:// image link.")
		return
	if not _begin():
		return
	var created: Dictionary
	if is_link:
		_set_status("Sending the image…")
		created = await _request(
			HTTPClient.METHOD_POST, "/v1/3d/image-to-3d", _json_body({"image_url": source}), "application/json", CREATE_TIMEOUT
		)
	else:
		_set_status("Uploading the image…")
		var boundary: String = "HydrillaBoundary%d" % Time.get_ticks_usec()
		created = await _request(
			HTTPClient.METHOD_POST,
			"/v1/3d/image-to-3d",
			_multipart_image(source, boundary),
			"multipart/form-data; boundary=%s" % boundary,
			CREATE_TIMEOUT
		)
	await _finish(created)


func _begin() -> bool:
	if _busy:
		return false
	if _api_key().is_empty():
		_set_status(NO_KEY_MESSAGE)
		return false
	_set_busy(true)
	return true


## Waits for the created task, then downloads its mesh into the project.
func _finish(created: Dictionary) -> void:
	var outcome: String = await _wait_and_download(created)
	_set_busy(false)
	_set_status(outcome)
	_check_key()


func _wait_and_download(created: Dictionary) -> String:
	if not created["ok"]:
		return str(created["error"])
	var created_data: Dictionary = created["data"]
	var task_id: String = str(created_data.get("id", ""))
	if task_id.is_empty():
		return "Hydrilla did not return a task id."

	var path: String = "/v1/3d/tasks/%s" % task_id.uri_encode()
	var started: int = Time.get_ticks_msec()
	var failures: int = 0
	while true:
		if _cancel_requested:
			# Stop the task on the server so unused credits are refunded.
			await _request(HTTPClient.METHOD_DELETE, path)
			return "Cancelled. Unused credits are refunded."

		var reply: Dictionary = await _request(HTTPClient.METHOD_GET, path)
		if not reply["ok"]:
			# A brief network or server hiccup should not lose a paid task.
			var status_code: int = reply["status"]
			failures += 1
			if (status_code != 0 and status_code < 500) or failures > MAX_POLL_FAILURES:
				return str(reply["error"])
			await get_tree().create_timer(POLL_SECONDS * 2.0).timeout
			continue
		failures = 0

		var task: Dictionary = reply["data"]
		var state: String = str(task.get("status", ""))
		if state == "SUCCEEDED":
			var result: Variant = task.get("result")
			var mesh_url: String = ""
			if typeof(result) == TYPE_DICTIONARY:
				mesh_url = str(result.get("mesh_url", ""))
			if mesh_url.is_empty():
				return "The finished task has no mesh."
			_set_status("Downloading the mesh…")
			return await _download_mesh(mesh_url, task_id)
		if state == "FAILED" or state == "CANCELLED":
			var reason: Variant = task.get("error")
			if typeof(reason) == TYPE_STRING and not str(reason).is_empty():
				return str(reason)
			return "Generation failed"
		if not _cancel_requested:
			if state == "PENDING":
				_set_status("Waiting for a GPU…")
			else:
				_set_status("Generating… %d%%" % int(task.get("progress", 0)))

		if float(Time.get_ticks_msec() - started) / 1000.0 > MAX_POLL_SECONDS:
			return "The task is still running. Check it later at hydrilla.ai."
		await get_tree().create_timer(POLL_SECONDS).timeout
	return ""


## Downloads a GLB into the project. The API key is never sent to file storage.
func _download_mesh(mesh_url: String, mesh_name: String) -> String:
	if not _bridge.is_mesh_url_allowed(mesh_url):
		return "Refusing to download from this address."
	var http: HTTPRequest = HTTPRequest.new()
	http.timeout = DOWNLOAD_TIMEOUT
	add_child(http)
	if http.request(mesh_url) != OK:
		http.queue_free()
		return "Could not start the mesh download."
	var response: Array = await http.request_completed
	http.queue_free()
	var result: int = response[0]
	var status: int = response[1]
	if result != HTTPRequest.RESULT_SUCCESS or status < 200 or status >= 300:
		return "Could not download the mesh (%d)." % status
	var bytes: PackedByteArray = response[3]
	return _save_mesh(bytes, mesh_name)


## Writes a GLB into res://hydrilla and lets the editor import it.
func _save_mesh(bytes: PackedByteArray, mesh_name: String) -> String:
	if not _bridge.is_glb(bytes):
		return "The downloaded file is not a GLB mesh."
	var error: int = DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(OUTPUT_DIR))
	if error != OK:
		return "Could not create %s." % OUTPUT_DIR
	var stem: String = mesh_name.validate_filename().replace(" ", "-").left(48)
	if stem.is_empty():
		stem = "hydrilla-model"
	var path: String = "%s/%s.glb" % [OUTPUT_DIR, stem]
	var suffix: int = 1
	while FileAccess.file_exists(path):
		suffix += 1
		path = "%s/%s-%d.glb" % [OUTPUT_DIR, stem, suffix]
	var file: FileAccess = FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return "Could not write %s." % path
	file.store_buffer(bytes)
	file.close()
	EditorInterface.get_resource_filesystem().scan()
	return "Imported %s" % path


# ---- bridge ---------------------------------------------------------------

func _start_bridge() -> void:
	var problem: String = _bridge.start()
	if not problem.is_empty():
		_bridge_button.set_pressed_no_signal(false)
		_bridge_button.text = "Run Bridge"
		_bridge_label.text = problem
		return
	_bridge_button.set_pressed_no_signal(true)
	_bridge_button.text = "Bridge ON"
	_bridge_label.text = "Ready to receive models (port %d)." % Bridge.PORT


func _toggle_bridge() -> void:
	if _bridge.is_running():
		_bridge.stop()
		_set_setting(SETTING_BRIDGE_ON, false)
		_bridge_button.set_pressed_no_signal(false)
		_bridge_button.text = "Run Bridge"
		_bridge_label.text = "Lets Hydrilla Studio and your AI agent send models into this project."
		return
	_start_bridge()
	_set_setting(SETTING_BRIDGE_ON, _bridge.is_running())


func _on_bridge_mesh(bytes: PackedByteArray, mesh_name: String) -> void:
	_bridge_label.text = _save_mesh(bytes, mesh_name)


func _on_bridge_mesh_url(url: String, mesh_name: String) -> void:
	_bridge_label.text = "Receiving a model…"
	_bridge_label.text = await _download_mesh(url, mesh_name)
