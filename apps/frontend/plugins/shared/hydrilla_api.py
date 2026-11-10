"""Hydrilla developer API client for the DCC plugins.

Authenticates with an API key only (`Authorization: Bearer hyd_live_…`) and
talks to the `/v1` routes. Standard library only, Python 3.7+.
"""

from __future__ import annotations

import json
import mimetypes
import os
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any, Callable, Dict, List, Optional, Tuple

try:
    from . import hydrilla_config as config
except ImportError:
    import hydrilla_config as config

USER_AGENT = "Hydrilla-DCC/%s" % config.PLUGIN_VERSION
DEFAULT_TIMEOUT_S = 60
# Text-to-3D creates its concept image before the request returns.
CREATE_TIMEOUT_S = 240
DOWNLOAD_TIMEOUT_S = 300
POLL_INTERVAL_S = 2.0
MAX_POLL_S = 25 * 60
MAX_MESH_BYTES = 300 * 1024 * 1024
MAX_IMAGE_BYTES = 30 * 1024 * 1024
GLB_MAGIC = b"glTF"

TERMINAL_STATUSES = ("SUCCEEDED", "FAILED", "CANCELLED")

ERROR_AUTH = "auth"
ERROR_CREDITS = "credits"
ERROR_NETWORK = "network"
ERROR_CANCELLED = "cancelled"
ERROR_API = "api"

NO_KEY_MESSAGE = (
    "Add your Hydrilla API key first. Create one at hydrilla.ai/app/api-keys."
)
BAD_KEY_MESSAGE = (
    "Hydrilla did not accept this API key. Check it, or create a new one at "
    "hydrilla.ai/app/api-keys."
)


class HydrillaApiError(Exception):
    def __init__(
        self,
        message: str,
        status: Optional[int] = None,
        body: Any = None,
        kind: str = ERROR_API,
    ):
        super().__init__(message)
        self.status = status
        self.body = body
        self.kind = kind


def _unreachable_message(base_url: str, reason: Any) -> str:
    reason_text = str(reason or "unknown")
    lower = reason_text.lower()
    host = urllib.parse.urlparse(base_url).netloc or base_url
    if "refused" in lower or "errno 61" in lower or "errno 111" in lower or "10061" in lower:
        return "Hydrilla API is not reachable at %s. Check your connection and try again." % host
    if "timed out" in lower or "timeout" in lower:
        return "Hydrilla API timed out (%s). Try again in a moment." % host
    if "nodename" in lower or "name or service" in lower or "getaddrinfo" in lower:
        return "Cannot find the Hydrilla API host (%s). Check your internet connection." % host
    if "certificate" in lower or "ssl" in lower:
        return "Secure connection to %s failed: %s" % (host, reason_text)
    return "Could not reach the Hydrilla API (%s): %s" % (host, reason_text)


def _error_message(body: Any, fallback: str) -> str:
    if isinstance(body, dict):
        nested = body.get("error")
        if isinstance(nested, dict) and nested.get("message"):
            return str(nested["message"])
        if isinstance(nested, str) and nested:
            return nested
        if body.get("message"):
            return str(body["message"])
    return fallback


def _http_error(error: urllib.error.HTTPError, base_url: str) -> HydrillaApiError:
    body: Any = None
    try:
        body = json.loads(error.read().decode("utf-8"))
    except Exception:
        body = None
    generic = "Hydrilla API request failed (%d)" % error.code
    message = _error_message(body, generic)
    kind = ERROR_API
    if error.code == 401:
        message = BAD_KEY_MESSAGE
        kind = ERROR_AUTH
    elif error.code == 402:
        kind = ERROR_CREDITS
        if message == generic:
            message = "Not enough credits. Top up at hydrilla.ai."
    elif error.code == 404 and message == generic:
        message = "This Hydrilla API route does not exist on %s." % base_url
    elif error.code == 429 and message == generic:
        message = "Too many requests. Wait a moment and try again."
    elif error.code >= 500 and message == generic:
        message = "Hydrilla is having trouble right now (%d). Try again shortly." % error.code
    return HydrillaApiError(message, status=error.code, body=body, kind=kind)


def is_mesh_url_allowed(url: str) -> bool:
    """Meshes are fetched over https; plain http is accepted for local servers only."""
    parsed = urllib.parse.urlparse((url or "").strip())
    if parsed.scheme == "https":
        return bool(parsed.hostname)
    if parsed.scheme == "http":
        return (parsed.hostname or "").lower() in ("localhost", "127.0.0.1", "::1")
    return False


def safe_stem(value: str, fallback: str = "hydrilla") -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in str(value or ""))
    return cleaned.strip("-")[:48] or fallback


def download_to_file(
    url: str,
    dest_path: str,
    headers: Optional[Dict[str, str]] = None,
    max_bytes: int = MAX_MESH_BYTES,
    timeout_s: int = DOWNLOAD_TIMEOUT_S,
    require_glb: bool = True,
) -> str:
    """Stream a URL to dest_path. The file only appears once the download is complete."""
    if not is_mesh_url_allowed(url):
        raise HydrillaApiError("Refusing to download from this address: %s" % url)

    request_headers = {"User-Agent": USER_AGENT}
    request_headers.update(headers or {})
    request = urllib.request.Request(url, headers=request_headers, method="GET")
    folder = os.path.dirname(dest_path) or tempfile.gettempdir()
    os.makedirs(folder, exist_ok=True)
    descriptor, temp_path = tempfile.mkstemp(prefix="hydrilla-", suffix=".part", dir=folder)
    try:
        written = 0
        first_bytes = b""
        with os.fdopen(descriptor, "wb") as handle:
            with urllib.request.urlopen(request, timeout=timeout_s) as response:
                while True:
                    chunk = response.read(256 * 1024)
                    if not chunk:
                        break
                    if len(first_bytes) < 4:
                        first_bytes = (first_bytes + chunk)[:4]
                    written += len(chunk)
                    if written > max_bytes:
                        raise HydrillaApiError("The mesh file is larger than the allowed size.")
                    handle.write(chunk)
        if written == 0:
            raise HydrillaApiError("The mesh download was empty.")
        if require_glb and first_bytes != GLB_MAGIC:
            raise HydrillaApiError("The downloaded file is not a GLB mesh.")
        os.replace(temp_path, dest_path)
        return dest_path
    except urllib.error.HTTPError as error:
        raise HydrillaApiError(
            "Could not download the mesh (%d)." % error.code, status=error.code
        ) from error
    except urllib.error.URLError as error:
        raise HydrillaApiError(
            _unreachable_message(url, error.reason), kind=ERROR_NETWORK
        ) from error
    except (TimeoutError, OSError) as error:
        if isinstance(error, HydrillaApiError):
            raise
        raise HydrillaApiError("Mesh download failed: %s" % error, kind=ERROR_NETWORK) from error
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


def _encode_multipart_file(
    field_name: str,
    file_path: str,
    fields: Optional[Dict[str, str]] = None,
) -> Tuple[bytes, str]:
    boundary = "----HydrillaBoundary%s" % uuid.uuid4().hex
    filename = (os.path.basename(file_path) or "image.png").replace('"', "")
    content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    with open(file_path, "rb") as handle:
        file_bytes = handle.read()

    chunks = []
    for key, value in (fields or {}).items():
        chunks.append(("--%s\r\n" % boundary).encode("utf-8"))
        chunks.append(('Content-Disposition: form-data; name="%s"\r\n\r\n' % key).encode("utf-8"))
        chunks.append(str(value).encode("utf-8"))
        chunks.append(b"\r\n")

    chunks.append(("--%s\r\n" % boundary).encode("utf-8"))
    chunks.append(
        ('Content-Disposition: form-data; name="%s"; filename="%s"\r\n' % (field_name, filename)).encode(
            "utf-8"
        )
    )
    chunks.append(("Content-Type: %s\r\n\r\n" % content_type).encode("utf-8"))
    chunks.append(file_bytes)
    chunks.append(b"\r\n")
    chunks.append(("--%s--\r\n" % boundary).encode("utf-8"))
    return b"".join(chunks), "multipart/form-data; boundary=%s" % boundary


class HydrillaClient:
    """API-key client for the Hydrilla `/v1` developer API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_s: int = DEFAULT_TIMEOUT_S,
    ):
        self.api_key = config.resolve_api_key(api_key)
        self.base_url = config.resolve_api_base(base_url)
        self.timeout_s = timeout_s

    def _headers(self, content_type: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Authorization": "Bearer %s" % self.api_key,
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def _request(
        self,
        method: str,
        path: str,
        payload: Optional[Dict[str, Any]] = None,
        data: Optional[bytes] = None,
        content_type: Optional[str] = None,
        timeout_s: Optional[int] = None,
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise HydrillaApiError(NO_KEY_MESSAGE, kind=ERROR_AUTH)

        body = data
        body_type = content_type
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            body_type = "application/json"

        request = urllib.request.Request(
            "%s%s" % (self.base_url, path),
            data=body,
            headers=self._headers(body_type),
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout_s or self.timeout_s) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            raise _http_error(error, self.base_url) from error
        except urllib.error.URLError as error:
            raise HydrillaApiError(
                _unreachable_message(self.base_url, error.reason), kind=ERROR_NETWORK
            ) from error
        except (TimeoutError, OSError) as error:
            raise HydrillaApiError(
                _unreachable_message(self.base_url, error), kind=ERROR_NETWORK
            ) from error

        if not raw:
            return {}
        try:
            parsed = json.loads(raw)
        except ValueError as error:
            raise HydrillaApiError(
                "Unexpected response from %s. Check the API address in settings." % self.base_url
            ) from error
        if isinstance(parsed, dict):
            return parsed
        return {"data": parsed}

    def me(self) -> Dict[str, Any]:
        """Account plan and credit balance. Free; used to verify a key."""
        return self._request("GET", "/v1/user/me")

    def credits_remaining(self) -> Optional[int]:
        credits = self.me().get("credits")
        if isinstance(credits, dict) and isinstance(credits.get("remaining"), (int, float)):
            return int(credits["remaining"])
        return None

    def list_tasks(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Recent 3D tasks for this account, newest first."""
        query = urllib.parse.urlencode({"limit": max(1, min(int(limit), 100))})
        data = self._request("GET", "/v1/3d/tasks?%s" % query)
        items = data.get("data")
        if not isinstance(items, list):
            return []
        return [item for item in items if isinstance(item, dict) and item.get("id")]

    def text_to_3d(self, prompt: str, **options: Any) -> Dict[str, Any]:
        payload = {"prompt": prompt}
        payload.update({key: value for key, value in options.items() if value is not None})
        return self._request("POST", "/v1/3d/text-to-3d", payload=payload, timeout_s=CREATE_TIMEOUT_S)

    def image_to_3d_url(self, image_url: str, **options: Any) -> Dict[str, Any]:
        payload = {"image_url": image_url}
        payload.update({key: value for key, value in options.items() if value is not None})
        return self._request("POST", "/v1/3d/image-to-3d", payload=payload, timeout_s=CREATE_TIMEOUT_S)

    def image_to_3d_file(self, file_path: str, **options: Any) -> Dict[str, Any]:
        if not os.path.isfile(file_path):
            raise HydrillaApiError("Image file not found: %s" % file_path)
        if os.path.getsize(file_path) > MAX_IMAGE_BYTES:
            raise HydrillaApiError("Image is too large. Use a file under 30 MB.")
        body, content_type = _encode_multipart_file(
            "image",
            file_path,
            fields={key: str(value) for key, value in options.items() if value is not None},
        )
        return self._request(
            "POST",
            "/v1/3d/image-to-3d",
            data=body,
            content_type=content_type,
            timeout_s=CREATE_TIMEOUT_S,
        )

    def get_task(self, task_id: str) -> Dict[str, Any]:
        return self._request("GET", "/v1/3d/tasks/%s" % urllib.parse.quote(str(task_id), safe=""))

    def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """Stop a running task. Unused credits are refunded by the API."""
        return self._request("DELETE", "/v1/3d/tasks/%s" % urllib.parse.quote(str(task_id), safe=""))

    def wait_for_task(
        self,
        task_id: str,
        on_progress: Optional[Callable[[Dict[str, Any]], None]] = None,
        should_cancel: Optional[Callable[[], bool]] = None,
        poll_interval_s: float = POLL_INTERVAL_S,
        max_wait_s: float = MAX_POLL_S,
    ) -> Dict[str, Any]:
        """Poll until the task finishes. Brief network errors are retried."""
        started = time.time()
        network_failures = 0
        while True:
            if should_cancel is not None and should_cancel():
                raise HydrillaApiError("Generation cancelled", kind=ERROR_CANCELLED)
            try:
                task = self.get_task(task_id)
                network_failures = 0
            except HydrillaApiError as error:
                retryable = error.kind == ERROR_NETWORK or (error.status or 0) >= 500
                network_failures += 1
                if not retryable or network_failures > 5:
                    raise
                time.sleep(poll_interval_s * 2)
                continue
            if on_progress is not None:
                on_progress(task)
            status = str(task.get("status") or "").upper()
            if status in TERMINAL_STATUSES:
                return task
            if time.time() - started >= max_wait_s:
                raise HydrillaApiError(
                    "Task %s is still running after %d minutes. Check it later under your tasks."
                    % (task_id, int(max_wait_s // 60))
                )
            time.sleep(poll_interval_s)

    def download_mesh(self, mesh_url: str, dest_path: str) -> str:
        # The key is only ever sent to the API host, never to file storage.
        headers = {}
        if mesh_url.startswith(self.base_url + "/"):
            headers["Authorization"] = "Bearer %s" % self.api_key
        return download_to_file(mesh_url, dest_path, headers=headers)

    def download_mesh_to_temp(self, mesh_url: str, stem: str) -> str:
        dest = os.path.join(tempfile.gettempdir(), "hydrilla-%s.glb" % safe_stem(stem))
        return self.download_mesh(mesh_url, dest)


def mesh_url_of(task: Dict[str, Any]) -> str:
    result = task.get("result")
    if isinstance(result, dict) and result.get("mesh_url"):
        return str(result["mesh_url"])
    return ""


def generate_and_download(
    client: HydrillaClient,
    prompt: Optional[str] = None,
    image_url: Optional[str] = None,
    image_path: Optional[str] = None,
    on_status: Optional[Callable[[str], None]] = None,
    should_cancel: Optional[Callable[[], bool]] = None,
    dest_dir: Optional[str] = None,
) -> str:
    """Create a task, wait for it, and return the path of the downloaded GLB."""

    def report(message: str) -> None:
        if on_status is not None:
            on_status(message)

    if image_path:
        report("Uploading image…")
        created = client.image_to_3d_file(image_path)
    elif image_url:
        report("Submitting image to 3D…")
        created = client.image_to_3d_url(image_url)
    elif prompt:
        report("Submitting text to 3D…")
        created = client.text_to_3d(prompt)
    else:
        raise HydrillaApiError("Enter a prompt or choose an image.")

    task_id = str(created.get("id") or "")
    if not task_id:
        raise HydrillaApiError("Hydrilla did not return a task id.")

    def on_progress(task: Dict[str, Any]) -> None:
        status = str(task.get("status") or "").upper()
        if status == "PENDING":
            report("Waiting for a GPU…")
        elif status == "IN_PROGRESS":
            report("Generating… %s%%" % (task.get("progress") or 0))

    try:
        task = client.wait_for_task(task_id, on_progress=on_progress, should_cancel=should_cancel)
    except HydrillaApiError as error:
        if error.kind == ERROR_CANCELLED:
            try:
                client.cancel_task(task_id)
            except HydrillaApiError:
                # The task may already have finished; nothing left to stop.
                pass
        raise

    if str(task.get("status") or "").upper() != "SUCCEEDED":
        raise HydrillaApiError(str(task.get("error") or "Generation failed"))
    mesh_url = mesh_url_of(task)
    if not mesh_url:
        raise HydrillaApiError("The finished task has no mesh.")

    report("Downloading mesh…")
    folder = dest_dir or tempfile.gettempdir()
    return client.download_mesh(mesh_url, os.path.join(folder, "hydrilla-%s.glb" % safe_stem(task_id)))
