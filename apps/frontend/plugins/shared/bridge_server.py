"""Hydrilla Bridge: a small local server a plugin runs so meshes can be sent to it.

Hydrilla Studio (in the browser) and the Hydrilla MCP server post a mesh to
the Bridge; the host app imports it. The Bridge carries no account data and
accepts no credentials. It only receives meshes.

It listens on 127.0.0.1 only. Requests from a web page are accepted only from
Hydrilla's own sites, because any page open in a browser can reach localhost.

Endpoints
  GET  /health                  liveness and which app is listening
  POST /import, /import-file    {"mesh_url": "..."} or {"file_base64": "..."}

Standard library only, Python 3.7+.
"""

from __future__ import annotations

import base64
import json
import os
import queue
import tempfile
import threading
import time
import urllib.error
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable, Dict, List, Optional
from urllib.parse import urlparse

try:
    from . import hydrilla_api as api
    from . import hydrilla_config as config
except ImportError:
    import hydrilla_api as api
    import hydrilla_config as config

SERVICE_NAME = "hydrilla-bridge"
PROTOCOL_VERSION = 2
MAX_MESH_BYTES = 200 * 1024 * 1024
# Base64 adds a third; leave room for the JSON around it.
MAX_BODY_BYTES = int(MAX_MESH_BYTES * 1.4) + 64 * 1024
MAX_QUEUED = 25
ORIGINS_ENV = "HYDRILLA_BRIDGE_ORIGINS"

ALLOWED_ORIGINS = (
    "https://hydrilla.ai",
    "https://www.hydrilla.ai",
    "https://hydrilla.co",
    "https://www.hydrilla.co",
)
LOOPBACK_HOSTS = ("localhost", "127.0.0.1", "::1")


class BridgeRequestError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status


def _extra_origins() -> List[str]:
    raw = os.environ.get(ORIGINS_ENV) or ""
    return [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]


def is_origin_allowed(origin: Optional[str]) -> bool:
    """No Origin header means a local program, not a web page, which is allowed."""
    if not origin:
        return True
    cleaned = origin.strip().rstrip("/")
    if cleaned in ALLOWED_ORIGINS or cleaned in _extra_origins():
        return True
    parsed = urlparse(cleaned)
    # A site served from this machine (local development) may also send.
    return parsed.scheme in ("http", "https") and (parsed.hostname or "").lower() in LOOPBACK_HOSTS


def is_host_allowed(host_header: Optional[str]) -> bool:
    """Reject names that merely resolve to this machine (DNS rebinding)."""
    host = (host_header or "").strip().lower()
    if not host:
        return False
    if host.startswith("["):
        return host.split("]")[0].lstrip("[") in LOOPBACK_HOSTS
    return host.rsplit(":", 1)[0] in LOOPBACK_HOSTS


class _Handler(BaseHTTPRequestHandler):
    server_version = "HydrillaBridge/%s" % config.PLUGIN_VERSION
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: Any) -> None:
        return

    @property
    def bridge(self) -> "Bridge":
        return self.server.bridge  # type: ignore[attr-defined]

    def _send(self, status: int, payload: Optional[Dict[str, Any]] = None) -> None:
        body = b"" if payload is None else json.dumps(payload).encode("utf-8")
        origin = self.headers.get("Origin")
        self.send_response(status)
        if origin and is_origin_allowed(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
            # Browsers ask before letting a public site reach a local address.
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        self.end_headers()
        if body:
            self.wfile.write(body)
        self.close_connection = True

    def _guard(self) -> bool:
        if not is_host_allowed(self.headers.get("Host")):
            self._send(403, {"ok": False, "error": "host_not_allowed"})
            return False
        if not is_origin_allowed(self.headers.get("Origin")):
            self._send(403, {"ok": False, "error": "origin_not_allowed"})
            return False
        return True

    def _read_json(self) -> Dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            raise BridgeRequestError(400, "invalid Content-Length")
        if length <= 0:
            return {}
        if length > MAX_BODY_BYTES:
            raise BridgeRequestError(413, "request too large")
        chunks = []
        remaining = length
        while remaining > 0:
            chunk = self.rfile.read(min(remaining, 256 * 1024))
            if not chunk:
                break
            chunks.append(chunk)
            remaining -= len(chunk)
        try:
            data = json.loads(b"".join(chunks).decode("utf-8"))
        except ValueError:
            raise BridgeRequestError(400, "body must be JSON")
        if not isinstance(data, dict):
            raise BridgeRequestError(400, "body must be a JSON object")
        return data

    def do_OPTIONS(self) -> None:
        if not self._guard():
            return
        self._send(204)

    def do_GET(self) -> None:
        if not self._guard():
            return
        path = urlparse(self.path).path
        if path in ("/health", "/status", "/ping"):
            self._send(200, self.bridge.health())
            return
        self._send(404, {"ok": False, "error": "not_found"})

    def do_POST(self) -> None:
        if not self._guard():
            return
        path = urlparse(self.path).path
        if path not in ("/import", "/import-file"):
            self._send(404, {"ok": False, "error": "not_found"})
            return
        try:
            item = self.bridge.receive(self._read_json())
        except BridgeRequestError as error:
            self._send(error.status, {"ok": False, "status": "error", "error": str(error)})
            return
        except api.HydrillaApiError as error:
            self._send(502, {"ok": False, "status": "error", "error": str(error)})
            return
        except Exception as error:
            self._send(500, {"ok": False, "status": "error", "error": str(error)})
            return
        self._send(
            200,
            {
                "ok": True,
                "status": "ok",
                "app": self.bridge.app,
                "item": {"id": item["id"], "name": item["name"]},
            },
        )


class _Server(ThreadingHTTPServer):
    daemon_threads = True
    # On Windows this option would let a second program bind the same port.
    allow_reuse_address = os.name != "nt"


class Bridge:
    """One app's Bridge. Start it, then call drain() from the app's main thread."""

    def __init__(
        self,
        app: str,
        port: Optional[int] = None,
        on_item: Optional[Callable[[Dict[str, Any]], None]] = None,
    ):
        self.app = app
        self.port = port or config.bridge_port(app)
        self.on_item = on_item
        self._items: "queue.Queue[Dict[str, Any]]" = queue.Queue()
        self._lock = threading.Lock()
        self._server: Optional[_Server] = None
        self._thread: Optional[threading.Thread] = None
        self._folder = os.path.join(tempfile.gettempdir(), "hydrilla-bridge-%s" % app)

    @property
    def url(self) -> str:
        return "http://%s:%d" % (config.BRIDGE_HOST, self.port)

    def is_running(self) -> bool:
        with self._lock:
            return self._server is not None

    def health(self) -> Dict[str, Any]:
        return {
            "ok": True,
            "status": "ok",
            "service": SERVICE_NAME,
            "protocol": PROTOCOL_VERSION,
            "version": config.PLUGIN_VERSION,
            "app": self.app,
            "pending": self._items.qsize(),
        }

    def start(self) -> Dict[str, Any]:
        """Start listening. Returns {"ok": True} or {"ok": False, "error": "..."}."""
        with self._lock:
            if self._server is not None:
                return {"ok": True, "already": True, "url": self.url}
            try:
                server = _Server((config.BRIDGE_HOST, self.port), _Handler)
            except OSError as error:
                return {"ok": False, "error": self._bind_error(error)}
            server.bridge = self  # type: ignore[attr-defined]
            thread = threading.Thread(
                target=server.serve_forever,
                kwargs={"poll_interval": 0.25},
                name="hydrilla-bridge-%s" % self.app,
                daemon=True,
            )
            self._server = server
            self._thread = thread
            thread.start()
        return {"ok": True, "already": False, "url": self.url}

    def stop(self) -> None:
        with self._lock:
            server = self._server
            thread = self._thread
            self._server = None
            self._thread = None
        if server is None:
            return
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            # The socket is being torn down either way.
            pass
        if thread is not None and thread.is_alive():
            thread.join(timeout=2.0)
        for item in self.drain():
            self.discard(item)

    def _bind_error(self, error: OSError) -> str:
        owner = probe(self.port)
        if owner is not None:
            other = str(owner.get("app") or "another app")
            return (
                "Hydrilla Bridge is already running on port %d (%s). "
                "Close the other window or stop its Bridge first." % (self.port, other)
            )
        return "Port %d is in use by another program (%s)." % (self.port, error)

    def receive(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Store the posted mesh as a local GLB and queue it for import."""
        if self._items.qsize() >= MAX_QUEUED:
            raise BridgeRequestError(429, "too many meshes waiting to be imported")

        name = api.safe_stem(str(payload.get("name") or payload.get("job_id") or "model"), "model")
        item_id = uuid.uuid4().hex
        os.makedirs(self._folder, exist_ok=True)
        dest = os.path.join(self._folder, "%s-%s.glb" % (name, item_id[:8]))

        file_b64 = payload.get("file_base64")
        mesh_url = str(payload.get("mesh_url") or payload.get("url") or "").strip()
        if file_b64:
            try:
                raw = base64.b64decode(str(file_b64), validate=True)
            except ValueError:
                raise BridgeRequestError(400, "file_base64 is not valid base64")
            if len(raw) > MAX_MESH_BYTES:
                raise BridgeRequestError(413, "mesh file too large")
            if raw[:4] != api.GLB_MAGIC:
                raise BridgeRequestError(415, "only GLB meshes are accepted")
            with open(dest, "wb") as handle:
                handle.write(raw)
        elif mesh_url:
            if not api.is_mesh_url_allowed(mesh_url):
                raise BridgeRequestError(400, "mesh_url must be an https address")
            api.download_to_file(mesh_url, dest, max_bytes=MAX_MESH_BYTES)
        else:
            raise BridgeRequestError(400, "mesh_url or file_base64 is required")

        item = {
            "id": item_id,
            "name": name,
            "file_path": dest,
            "job_id": payload.get("job_id"),
            "created_at": time.time(),
        }
        self._items.put(item)
        if self.on_item is not None:
            try:
                self.on_item(item)
            except Exception:
                # The mesh stays queued; the host can still pick it up with drain().
                pass
        return item

    def drain(self) -> List[Dict[str, Any]]:
        """Take every mesh waiting to be imported. Call from the app's main thread."""
        items = []
        while True:
            try:
                items.append(self._items.get_nowait())
            except queue.Empty:
                return items

    @staticmethod
    def discard(item: Dict[str, Any]) -> None:
        """Delete an item's temporary file once it has been imported."""
        path = str(item.get("file_path") or "")
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except OSError:
                pass


def probe(port: int, timeout_s: float = 1.0) -> Optional[Dict[str, Any]]:
    """Return the health payload of a Hydrilla Bridge on this port, if there is one."""
    request = urllib.request.Request(
        "http://%s:%d/health" % (config.BRIDGE_HOST, port),
        headers={"Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_s) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, OSError, ValueError):
        return None
    if isinstance(data, dict) and data.get("service") == SERVICE_NAME:
        return data
    return None
