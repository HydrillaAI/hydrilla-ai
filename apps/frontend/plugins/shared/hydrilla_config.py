"""Settings shared by every Hydrilla plugin and the MCP server.

One API key authenticates everything. It is stored in the user's home folder so
that pasting it once (in any plugin) also makes it available to the other
plugins and to the MCP server on the same machine.

Standard library only, Python 3.7+ (Maya 2022 and 3ds Max 2021 ship 3.7).
"""

from __future__ import annotations

import json
import os
import tempfile
from typing import Any, Dict, Optional

PLUGIN_VERSION = "2.0.0"

DEFAULT_API_BASE = "https://hydrilla-ai-g1bm.vercel.app"
LOCAL_API_BASE = "http://localhost:4000"
DEFAULT_SITE_URL = "https://hydrilla.ai"
API_KEYS_PATH = "/app/api-keys"

API_KEY_ENV = "HYDRILLA_API_KEY"
API_BASE_ENV = "HYDRILLA_API_BASE"
SITE_URL_ENV = "HYDRILLA_SITE_URL"
CONFIG_DIR_ENV = "HYDRILLA_CONFIG_DIR"

API_KEY_PREFIX = "hyd_"

# Hosts that do not serve the developer API (old backend, GPU gateway). A saved
# setting that still points at one of them is replaced with the current default.
RETIRED_API_HOSTS = ("hydrilla-backend.vercel.app", "api.hydrilla.co", "api.hydrilla.ai")

# Each app listens on its own port, so several can run at once and a sender
# can tell which ones are open.
BRIDGE_HOST = "127.0.0.1"
BRIDGE_PORTS = {
    "blender": 7345,
    "maya": 7346,
    "3dsmax": 7347,
    "unreal": 7348,
    "unity": 7349,
    "godot": 7350,
}


def bridge_port(app: str) -> int:
    key = (app or "").strip().lower()
    if key not in BRIDGE_PORTS:
        raise ValueError("Unknown Hydrilla app: %s" % app)
    return BRIDGE_PORTS[key]


def bridge_url(app: str) -> str:
    return "http://%s:%d" % (BRIDGE_HOST, bridge_port(app))


def config_dir() -> str:
    override = (os.environ.get(CONFIG_DIR_ENV) or "").strip()
    if override:
        return override
    return os.path.join(os.path.expanduser("~"), ".hydrilla")


def config_path() -> str:
    return os.path.join(config_dir(), "config.json")


def load_config() -> Dict[str, Any]:
    """Read the shared config. A missing or unreadable file is an empty config."""
    try:
        with open(config_path(), "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return {}
    if isinstance(data, dict):
        return data
    return {}


def save_config(values: Dict[str, Any]) -> None:
    """Merge values into the shared config. A value of None removes that entry."""
    merged = load_config()
    for key, value in values.items():
        if value is None:
            merged.pop(key, None)
        else:
            merged[key] = value

    folder = config_dir()
    os.makedirs(folder, exist_ok=True)
    try:
        os.chmod(folder, 0o700)
    except OSError:
        # Windows has no POSIX modes; the home folder ACL already limits access.
        pass

    # Write beside the target and rename, so a crash never leaves half a file.
    descriptor, temp_path = tempfile.mkstemp(prefix="config-", suffix=".tmp", dir=folder)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(merged, handle, indent=2, sort_keys=True)
            handle.write("\n")
        try:
            os.chmod(temp_path, 0o600)
        except OSError:
            pass
        os.replace(temp_path, config_path())
    except Exception:
        try:
            os.remove(temp_path)
        except OSError:
            pass
        raise


def clean_api_key(value: Optional[str]) -> str:
    """Strip whitespace, quotes and a pasted 'Bearer ' prefix from a key."""
    text = (value or "").strip().strip("\"'").strip()
    if text.lower().startswith("bearer "):
        text = text[7:].strip()
    return text


def looks_like_api_key(value: Optional[str]) -> bool:
    text = clean_api_key(value)
    if not text.startswith(API_KEY_PREFIX) or len(text) < 16:
        return False
    return all(ch.isalnum() or ch in "_-" for ch in text)


def stored_api_key() -> str:
    return clean_api_key(str(load_config().get("api_key") or ""))


def save_api_key(api_key: Optional[str]) -> None:
    """Store the key for every Hydrilla tool on this machine. Empty removes it."""
    cleaned = clean_api_key(api_key)
    save_config({"api_key": cleaned or None})


def resolve_api_key(explicit: Optional[str] = None) -> str:
    """Key to use: the one given, else the environment, else the shared config."""
    for candidate in (explicit, os.environ.get(API_KEY_ENV), stored_api_key()):
        cleaned = clean_api_key(candidate)
        if cleaned:
            return cleaned
    return ""


def _is_http_url(value: str) -> bool:
    lower = value.lower()
    if not (lower.startswith("https://") or lower.startswith("http://")):
        return False
    return not any(ch.isspace() for ch in value) and "(" not in value


def normalize_api_base(value: Optional[str]) -> str:
    """Return a usable API origin, falling back to the default when it is not one."""
    text = (value or "").strip().rstrip("/")
    if not text or not _is_http_url(text):
        return DEFAULT_API_BASE
    lower = text.lower()
    if any(host in lower for host in RETIRED_API_HOSTS):
        return DEFAULT_API_BASE
    return text


def resolve_api_base(explicit: Optional[str] = None) -> str:
    for candidate in (explicit, os.environ.get(API_BASE_ENV), load_config().get("api_base")):
        text = str(candidate or "").strip()
        if text:
            return normalize_api_base(text)
    return DEFAULT_API_BASE


def site_url() -> str:
    override = (os.environ.get(SITE_URL_ENV) or "").strip().rstrip("/")
    if override and _is_http_url(override):
        return override
    return DEFAULT_SITE_URL


def api_keys_url() -> str:
    return site_url() + API_KEYS_PATH
