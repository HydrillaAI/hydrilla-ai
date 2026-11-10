@tool
extends Node
## A small local server so Hydrilla Studio and the Hydrilla MCP server can send
## a mesh into this project. It carries no account data and accepts no
## credentials.
##
## It listens on 127.0.0.1 only. Requests from a web page are accepted only
## from Hydrilla's own sites, because any page open in a browser can reach
## localhost.

signal mesh_received(bytes: PackedByteArray, mesh_name: String)
signal mesh_url_received(url: String, mesh_name: String)

const PORT: int = 7350
const HOST: String = "127.0.0.1"
const SERVICE_NAME: String = "hydrilla-bridge"
const PLUGIN_VERSION: String = "2.0.0"
const MAX_MESH_BYTES: int = 200 * 1024 * 1024
# Base64 adds a third; leave room for the JSON around it.
const MAX_BODY_BYTES: int = 280 * 1024 * 1024 + 65536
const MAX_HEADER_BYTES: int = 16 * 1024
const MAX_CLIENTS: int = 16
const CLIENT_TIMEOUT_MS: int = 120 * 1000
const ALLOWED_ORIGINS: Array[String] = [
	"https://hydrilla.ai",
	"https://www.hydrilla.ai",
	"https://hydrilla.co",
	"https://www.hydrilla.co",
]
const LOOPBACK_HOSTS: Array[String] = ["localhost", "127.0.0.1", "::1"]

var _server: TCPServer = TCPServer.new()
var _clients: Array[Dictionary] = []


func is_running() -> bool:
	return _server.is_listening()


## Starts listening. Returns "" on success, otherwise a message for the user.
func start() -> String:
	if _server.is_listening():
		return ""
	var error: int = _server.listen(PORT, HOST)
	if error != OK:
		return "Bridge could not start. Port %d is in use, possibly by another Godot window." % PORT
	set_process(true)
	return ""


func stop() -> void:
	for client: Dictionary in _clients:
		var peer: StreamPeerTCP = client["peer"]
		peer.disconnect_from_host()
	_clients.clear()
	_server.stop()
	set_process(false)


func _ready() -> void:
	set_process(false)


func _exit_tree() -> void:
	stop()


func _process(_delta: float) -> void:
	if not _server.is_listening():
		return
	while _server.is_connection_available():
		var peer: StreamPeerTCP = _server.take_connection()
		if _clients.size() >= MAX_CLIENTS:
			peer.disconnect_from_host()
			continue
		_clients.append({
			"peer": peer,
			"buffer": PackedByteArray(),
			"started": Time.get_ticks_msec(),
			"head": {},
		})

	var remaining: Array[Dictionary] = []
	for client: Dictionary in _clients:
		if _service(client):
			remaining.append(client)
	_clients = remaining


## Reads what has arrived. Returns false once the client is finished.
func _service(client: Dictionary) -> bool:
	var peer: StreamPeerTCP = client["peer"]
	peer.poll()
	if peer.get_status() != StreamPeerTCP.STATUS_CONNECTED:
		return false
	if Time.get_ticks_msec() - int(client["started"]) > CLIENT_TIMEOUT_MS:
		peer.disconnect_from_host()
		return false

	var available: int = peer.get_available_bytes()
	if available > 0:
		var read: Array = peer.get_data(available)
		if int(read[0]) != OK:
			peer.disconnect_from_host()
			return false
		var chunk: PackedByteArray = read[1]
		var buffer: PackedByteArray = client["buffer"]
		buffer.append_array(chunk)
		client["buffer"] = buffer

	var head: Dictionary = client["head"]
	if head.is_empty():
		head = _parse_head(client["buffer"])
		if head.has("invalid"):
			_respond(peer, 400, {}, _error_body("bad request"))
			return false
		if head.is_empty():
			var waiting: PackedByteArray = client["buffer"]
			if waiting.size() > MAX_HEADER_BYTES:
				_respond(peer, 431, {}, _error_body("headers too large"))
				return false
			return true
		client["head"] = head
		if int(head["content_length"]) > MAX_BODY_BYTES:
			_respond(peer, 413, head, _error_body("request too large"))
			return false

	var received: PackedByteArray = client["buffer"]
	var body_start: int = int(head["body_start"])
	var content_length: int = int(head["content_length"])
	if received.size() - body_start < content_length:
		return true

	_handle(peer, head, received.slice(body_start, body_start + content_length))
	return false


## Returns {} until the header block is complete, {"invalid": true} if malformed.
func _parse_head(buffer: PackedByteArray) -> Dictionary:
	var scan: PackedByteArray = buffer.slice(0, mini(buffer.size(), MAX_HEADER_BYTES))
	var text: String = scan.get_string_from_ascii()
	var end: int = text.find("\r\n\r\n")
	if end < 0:
		return {}
	var lines: PackedStringArray = text.substr(0, end).split("\r\n")
	var request_line: PackedStringArray = lines[0].split(" ")
	if request_line.size() < 2:
		return {"invalid": true}
	var headers: Dictionary = {}
	for index: int in range(1, lines.size()):
		var separator: int = lines[index].find(":")
		if separator > 0:
			headers[lines[index].substr(0, separator).strip_edges().to_lower()] = lines[index].substr(separator + 1).strip_edges()
	var length_text: String = str(headers.get("content-length", "0"))
	if not length_text.is_valid_int() or int(length_text) < 0:
		return {"invalid": true}
	return {
		"method": request_line[0].to_upper(),
		"path": request_line[1].split("?")[0],
		"headers": headers,
		"body_start": end + 4,
		"content_length": int(length_text),
	}


## No Origin header means a local program, not a web page, which is allowed.
func _is_origin_allowed(origin: String) -> bool:
	if origin.is_empty():
		return true
	var cleaned: String = origin.strip_edges().trim_suffix("/")
	if ALLOWED_ORIGINS.has(cleaned):
		return true
	# A site served from this machine (local development) may also send.
	for scheme: String in ["http://", "https://"]:
		if cleaned.begins_with(scheme):
			return LOOPBACK_HOSTS.has(_host_name(cleaned.substr(scheme.length())))
	return false


## Rejects names that merely resolve to this machine (DNS rebinding).
func _is_host_allowed(host_header: String) -> bool:
	if host_header.strip_edges().is_empty():
		return false
	return LOOPBACK_HOSTS.has(_host_name(host_header))


## "localhost:7350" -> "localhost", "[::1]:7350" -> "::1".
func _host_name(authority: String) -> String:
	var value: String = authority.strip_edges().to_lower().split("/")[0]
	if value.begins_with("["):
		var close: int = value.find("]")
		if close < 0:
			return ""
		return value.substr(1, close - 1)
	var colon: int = value.rfind(":")
	if colon > 0:
		return value.substr(0, colon)
	return value


func _error_body(message: String) -> String:
	return JSON.stringify({"ok": false, "status": "error", "error": message})


func _respond(peer: StreamPeerTCP, status: int, head: Dictionary, body: String) -> void:
	var reasons: Dictionary = {
		200: "OK", 204: "No Content", 400: "Bad Request", 403: "Forbidden", 404: "Not Found",
		413: "Payload Too Large", 415: "Unsupported Media Type", 431: "Request Header Fields Too Large",
	}
	var payload: PackedByteArray = body.to_utf8_buffer()
	var lines: PackedStringArray = PackedStringArray()
	lines.append("HTTP/1.1 %d %s" % [status, str(reasons.get(status, "Error"))])
	var headers: Dictionary = head.get("headers", {})
	var origin: String = str(headers.get("origin", ""))
	if not origin.is_empty() and _is_origin_allowed(origin):
		lines.append("Access-Control-Allow-Origin: %s" % origin)
		lines.append("Vary: Origin")
		lines.append("Access-Control-Allow-Methods: GET, POST, OPTIONS")
		lines.append("Access-Control-Allow-Headers: Content-Type, Accept")
		# Browsers ask before letting a public site reach a local address.
		lines.append("Access-Control-Allow-Private-Network: true")
		lines.append("Access-Control-Max-Age: 600")
	lines.append("Content-Type: application/json")
	lines.append("Content-Length: %d" % payload.size())
	lines.append("Connection: close")
	var response: PackedByteArray = ("\r\n".join(lines) + "\r\n\r\n").to_utf8_buffer()
	response.append_array(payload)
	peer.put_data(response)
	peer.disconnect_from_host()


func _handle(peer: StreamPeerTCP, head: Dictionary, body: PackedByteArray) -> void:
	var headers: Dictionary = head["headers"]
	if not _is_host_allowed(str(headers.get("host", ""))):
		_respond(peer, 403, {}, _error_body("host_not_allowed"))
		return
	if not _is_origin_allowed(str(headers.get("origin", ""))):
		_respond(peer, 403, {}, _error_body("origin_not_allowed"))
		return

	var method: String = head["method"]
	var path: String = head["path"]
	if method == "OPTIONS":
		_respond(peer, 204, head, "")
		return
	if method == "GET" and ["/health", "/status", "/ping"].has(path):
		_respond(peer, 200, head, JSON.stringify({
			"ok": true,
			"status": "ok",
			"service": SERVICE_NAME,
			"protocol": 2,
			"version": PLUGIN_VERSION,
			"app": "godot",
			"pending": 0,
		}))
		return
	if method != "POST" or not ["/import", "/import-file"].has(path):
		_respond(peer, 404, head, _error_body("not_found"))
		return

	var parsed: Variant = JSON.parse_string(body.get_string_from_utf8())
	if typeof(parsed) != TYPE_DICTIONARY:
		_respond(peer, 400, head, _error_body("body must be a JSON object"))
		return
	var payload: Dictionary = parsed
	var mesh_name: String = str(payload.get("name", ""))
	if mesh_name.is_empty():
		mesh_name = str(payload.get("job_id", "model"))

	var encoded: String = str(payload.get("file_base64", ""))
	if not encoded.is_empty():
		var bytes: PackedByteArray = Marshalls.base64_to_raw(encoded)
		if bytes.is_empty():
			_respond(peer, 400, head, _error_body("file_base64 is not valid base64"))
			return
		if bytes.size() > MAX_MESH_BYTES:
			_respond(peer, 413, head, _error_body("mesh file too large"))
			return
		if not is_glb(bytes):
			_respond(peer, 415, head, _error_body("only GLB meshes are accepted"))
			return
		_respond(peer, 200, head, JSON.stringify({"ok": true, "status": "ok", "app": "godot"}))
		mesh_received.emit(bytes, mesh_name)
		return

	var mesh_url: String = str(payload.get("mesh_url", ""))
	if mesh_url.is_empty():
		mesh_url = str(payload.get("url", ""))
	if mesh_url.is_empty():
		_respond(peer, 400, head, _error_body("mesh_url or file_base64 is required"))
		return
	if not is_mesh_url_allowed(mesh_url):
		_respond(peer, 400, head, _error_body("mesh_url must be an https address"))
		return
	_respond(peer, 200, head, JSON.stringify({"ok": true, "status": "ok", "app": "godot"}))
	mesh_url_received.emit(mesh_url, mesh_name)


## Meshes are fetched over https; plain http is accepted for this machine only.
func is_mesh_url_allowed(url: String) -> bool:
	if url.begins_with("https://"):
		return not _host_name(url.substr(8)).is_empty()
	if url.begins_with("http://"):
		return LOOPBACK_HOSTS.has(_host_name(url.substr(7)))
	return false


func is_glb(bytes: PackedByteArray) -> bool:
	# "glTF" in ASCII.
	return bytes.size() > 12 and bytes[0] == 0x67 and bytes[1] == 0x6C and bytes[2] == 0x54 and bytes[3] == 0x46
