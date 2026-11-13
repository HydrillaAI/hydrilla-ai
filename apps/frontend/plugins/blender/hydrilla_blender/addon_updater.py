"""Self-updater for the Hydrilla Blender add-on.

Checks `hydrilla-blender.json` on the Hydrilla site (built alongside
`hydrilla-blender.zip` by `pack.sh`), verifies the zip's SHA-256 and file
contents in a staging folder, swaps the add-on files in place, and hot-reloads
the package inside Blender so users never have to uninstall or reinstall zips.

Standard library only (except `bpy` inside `schedule_hot_reload`), Python 3.7+.
"""

from __future__ import annotations

import hashlib
import importlib
import io
import json
import os
import shutil
import sys
import tempfile
import time
import types
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from typing import Any, Dict, List, Optional

try:
    from . import hydrilla_config as config
except ImportError:
    import hydrilla_config as config

ADDON_FOLDER_NAME = "hydrilla_blender"
BUILD_INFO_FILE = "build_info.json"
MANIFEST_PATH = "/plugins/hydrilla-blender.json"
DEFAULT_ZIP_PATH = "/plugins/hydrilla-blender.zip"

CHECK_TIMEOUT_S = 15
DOWNLOAD_TIMEOUT_S = 60
MAX_MANIFEST_BYTES = 256 * 1024
MAX_ZIP_BYTES = 25 * 1024 * 1024

IGNORED_NAMES = {"__pycache__", ".DS_Store", BUILD_INFO_FILE}
IGNORED_SUFFIXES = (".pyc", ".pyo")
LOOPBACK_HOSTS = ("localhost", "127.0.0.1", "::1")


class UpdaterError(Exception):
    """Raised when checking, verifying, or installing an add-on update fails."""


def addon_directory() -> str:
    return os.path.dirname(os.path.abspath(__file__))


def is_dev_symlink(folder: Optional[str] = None) -> bool:
    """True when the add-on folder is a symlink (e.g. a local git checkout)."""
    target = folder or addon_directory()
    return os.path.islink(target.rstrip("/\\"))


def _iter_source_files(folder: str) -> List[str]:
    """Sorted relative POSIX paths of all distributable files under `folder`."""
    found: List[str] = []
    for current_root, dirs, files in os.walk(folder):
        dirs[:] = sorted(
            name for name in dirs if name not in IGNORED_NAMES and not name.startswith(".")
        )
        for filename in files:
            if (
                filename in IGNORED_NAMES
                or filename.startswith(".")
                or filename.endswith(IGNORED_SUFFIXES)
            ):
                continue
            full_path = os.path.join(current_root, filename)
            rel_path = os.path.relpath(full_path, folder).replace("\\", "/")
            found.append(rel_path)
    found.sort()
    return found


def compute_build_id(folder: str) -> str:
    """Deterministic SHA-256 over relative paths and contents of `folder`."""
    digest = hashlib.sha256()
    for rel_path in _iter_source_files(folder):
        full_path = os.path.join(folder, *rel_path.split("/"))
        with open(full_path, "rb") as handle:
            content = handle.read()
        digest.update(rel_path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(content)
        digest.update(b"\0")
    return digest.hexdigest()


def installed_info(folder: Optional[str] = None, fallback_version: str = "") -> Dict[str, str]:
    """Return `{"version": ..., "build_id": ...}` for the installed add-on."""
    target = folder or addon_directory()
    version = fallback_version or config.PLUGIN_VERSION
    recorded_build = ""

    info_path = os.path.join(target, BUILD_INFO_FILE)
    try:
        with open(info_path, "r", encoding="utf-8") as handle:
            parsed = json.load(handle)
        if isinstance(parsed, dict):
            if parsed.get("version"):
                version = str(parsed["version"])
            if parsed.get("build_id"):
                recorded_build = str(parsed["build_id"]).strip().lower()
    except (OSError, ValueError):
        pass

    try:
        live_build = compute_build_id(target)
    except OSError:
        live_build = recorded_build

    return {
        "version": version,
        "build_id": live_build or recorded_build,
    }


def _is_hex_sha256(value: str) -> bool:
    return len(value) == 64 and all(ch in "0123456789abcdef" for ch in value)


def _is_allowed_update_url(url: str, site_base: str) -> bool:
    """Updates must come over HTTPS (or loopback HTTP in dev) from the configured site."""
    parsed = urllib.parse.urlparse((url or "").strip())
    expected = urllib.parse.urlparse((site_base or "").strip())
    if parsed.netloc.lower() != expected.netloc.lower() or not parsed.netloc:
        return False
    if parsed.scheme == "https":
        return True
    if parsed.scheme == "http":
        return (parsed.hostname or "").lower() in LOOPBACK_HOSTS
    return False


def _with_cache_buster(url: str, token: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    pairs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    pairs = [(k, v) for (k, v) in pairs if k != "_cb"]
    pairs.append(("_cb", token))
    return urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urllib.parse.urlencode(pairs), parsed.fragment)
    )


def _request_headers(accept: str) -> Dict[str, str]:
    return {
        "Accept": accept,
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "User-Agent": "Hydrilla-Blender/%s" % config.PLUGIN_VERSION,
    }


def fetch_manifest(
    site_base: Optional[str] = None,
    timeout_s: int = CHECK_TIMEOUT_S,
) -> Dict[str, Any]:
    """Fetch and validate `hydrilla-blender.json` from the Hydrilla site."""
    base = config.site_url(site_base)
    manifest_url = base + MANIFEST_PATH
    if not _is_allowed_update_url(manifest_url, base):
        raise UpdaterError("Refusing to check updates from an insecure address: %s" % base)

    url = _with_cache_buster(manifest_url, str(int(time.time())))
    request = urllib.request.Request(
        url,
        headers=_request_headers("application/json"),
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_s) as response:
            raw = response.read(MAX_MANIFEST_BYTES + 1)
    except urllib.error.HTTPError as error:
        raise UpdaterError("Could not check for add-on updates (%d)." % error.code) from error
    except urllib.error.URLError as error:
        raise UpdaterError("Could not reach %s to check for updates." % base) from error
    except (TimeoutError, OSError) as error:
        raise UpdaterError("Update check timed out (%s)." % error) from error

    if len(raw) > MAX_MANIFEST_BYTES:
        raise UpdaterError("Update manifest is unexpectedly large.")
    try:
        data = json.loads(raw.decode("utf-8"))
    except ValueError as error:
        raise UpdaterError("Update manifest is not valid JSON.") from error
    if not isinstance(data, dict):
        raise UpdaterError("Update manifest must be a JSON object.")

    version = str(data.get("version") or "").strip()
    build_id = str(data.get("build_id") or "").strip().lower()
    sha256 = str(data.get("sha256") or "").strip().lower()
    zip_path = str(data.get("zip_path") or DEFAULT_ZIP_PATH).strip()

    if not version or not _is_hex_sha256(build_id) or not _is_hex_sha256(sha256):
        raise UpdaterError("Update manifest is missing version or checksum fields.")

    zip_url = urllib.parse.urljoin(base + "/", zip_path.lstrip("/"))
    if zip_path.startswith("https://") or zip_path.startswith("http://"):
        zip_url = zip_path
    if not _is_allowed_update_url(zip_url, base):
        raise UpdaterError("Refusing to download add-on zip from %s." % zip_url)

    return {
        "version": version,
        "build_id": build_id,
        "sha256": sha256,
        "zip_url": zip_url,
        "site_base": base,
    }


def check_for_update(
    site_base: Optional[str] = None,
    addon_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """Compare the installed add-on's build hash against the remote manifest."""
    local = installed_info(addon_dir, config.PLUGIN_VERSION)
    manifest = fetch_manifest(site_base)
    available = bool(manifest["build_id"] and manifest["build_id"] != local["build_id"])
    return {
        "available": available,
        "installed_version": local["version"],
        "installed_build_id": local["build_id"],
        "remote_version": manifest["version"],
        "remote_build_id": manifest["build_id"],
        "manifest": manifest,
    }


def cleanup_dir(path: Optional[str]) -> None:
    if path and os.path.isdir(path):
        shutil.rmtree(path, ignore_errors=True)


def _safe_extract_zip(raw_zip: bytes, dest_dir: str) -> None:
    """Extract `hydrilla-blender.zip` into `dest_dir`, rejecting unsafe paths."""
    try:
        archive = zipfile.ZipFile(io.BytesIO(raw_zip))
    except zipfile.BadZipFile as error:
        raise UpdaterError("Downloaded file is not a valid zip archive.") from error

    with archive:
        extracted_count = 0
        for info in archive.infolist():
            mode = (info.external_attr >> 16) & 0o170000
            if mode == 0o120000:
                raise UpdaterError("Refusing zip entry containing a symbolic link.")

            normalized = info.filename.replace("\\", "/")
            if normalized.startswith("/"):
                raise UpdaterError("Refusing zip entry with an absolute path.")
            parts = [part for part in normalized.split("/") if part]
            if not parts or any(part in (".", "..") for part in parts):
                if not parts:
                    continue
                raise UpdaterError("Refusing zip entry with relative path traversal.")

            if parts[0] == ADDON_FOLDER_NAME:
                parts = parts[1:]
            if not parts or info.is_dir():
                continue

            target_path = os.path.abspath(os.path.join(dest_dir, *parts))
            root_abs = os.path.abspath(dest_dir)
            if os.path.commonpath([root_abs, target_path]) != root_abs:
                raise UpdaterError("Refusing zip entry outside staging folder.")

            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with archive.open(info, "r") as src, open(target_path, "wb") as dst:
                shutil.copyfileobj(src, dst)
            extracted_count += 1

        if extracted_count == 0:
            raise UpdaterError("Downloaded add-on zip was empty.")


def _validate_staged_python(staged_dir: str) -> None:
    """Ensure `__init__.py` exists and every `.py` file compiles cleanly."""
    init_file = os.path.join(staged_dir, "__init__.py")
    if not os.path.isfile(init_file):
        raise UpdaterError("Downloaded add-on zip is missing __init__.py.")

    for rel_path in _iter_source_files(staged_dir):
        if not rel_path.endswith(".py"):
            continue
        full_path = os.path.join(staged_dir, *rel_path.split("/"))
        with open(full_path, "rb") as handle:
            source = handle.read()
        try:
            compile(source, rel_path, "exec")
        except SyntaxError as error:
            raise UpdaterError("Staged file %s failed syntax check: %s" % (rel_path, error)) from error


def download_and_stage(
    manifest: Dict[str, Any],
    timeout_s: int = DOWNLOAD_TIMEOUT_S,
) -> str:
    """Download the zip, verify SHA-256 + build hash + syntax, and return the staged dir."""
    zip_url = str(manifest.get("zip_url") or "")
    site_base = str(manifest.get("site_base") or config.site_url())
    expected_sha256 = str(manifest.get("sha256") or "").strip().lower()
    expected_build_id = str(manifest.get("build_id") or "").strip().lower()

    if not _is_allowed_update_url(zip_url, site_base):
        raise UpdaterError("Refusing to download update from %s." % zip_url)

    request = urllib.request.Request(
        _with_cache_buster(zip_url, expected_build_id[:12] or str(int(time.time()))),
        headers=_request_headers("application/zip, application/octet-stream"),
        method="GET",
    )
    digest = hashlib.sha256()
    chunks: List[bytes] = []
    total = 0
    try:
        with urllib.request.urlopen(request, timeout=timeout_s) as response:
            while True:
                chunk = response.read(256 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_ZIP_BYTES:
                    raise UpdaterError("Add-on zip exceeds maximum allowed size.")
                digest.update(chunk)
                chunks.append(chunk)
    except urllib.error.HTTPError as error:
        raise UpdaterError("Could not download add-on update (%d)." % error.code) from error
    except urllib.error.URLError as error:
        raise UpdaterError("Could not reach %s to download update." % site_base) from error
    except (TimeoutError, OSError) as error:
        if isinstance(error, UpdaterError):
            raise
        raise UpdaterError("Add-on download failed (%s)." % error) from error

    if total == 0:
        raise UpdaterError("Downloaded add-on zip was empty.")
    if digest.hexdigest() != expected_sha256:
        raise UpdaterError(
            "Downloaded zip checksum did not match manifest. A deploy may be in progress; try again shortly."
        )

    staged_dir = tempfile.mkdtemp(prefix="hydrilla-addon-stage-")
    try:
        _safe_extract_zip(b"".join(chunks), staged_dir)
        _validate_staged_python(staged_dir)
        staged_build_id = compute_build_id(staged_dir)
        if expected_build_id and staged_build_id != expected_build_id:
            raise UpdaterError("Extracted add-on contents did not match expected build hash.")
        return staged_dir
    except Exception:
        cleanup_dir(staged_dir)
        raise


def _atomic_copy_file(src_path: str, dst_path: str) -> None:
    parent = os.path.dirname(dst_path)
    os.makedirs(parent, exist_ok=True)
    descriptor, temp_path = tempfile.mkstemp(prefix=".hydrilla-upd-", suffix=".tmp", dir=parent)
    try:
        with open(src_path, "rb") as src, os.fdopen(descriptor, "wb") as dst:
            shutil.copyfileobj(src, dst)
        os.replace(temp_path, dst_path)
    except Exception:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
        raise


def _clear_pycache(folder: str) -> None:
    for current_root, dirs, files in os.walk(folder):
        if "__pycache__" in dirs:
            shutil.rmtree(os.path.join(current_root, "__pycache__"), ignore_errors=True)
            dirs.remove("__pycache__")
        for filename in files:
            if filename.endswith(IGNORED_SUFFIXES):
                try:
                    os.remove(os.path.join(current_root, filename))
                except OSError:
                    pass


def _copy_tree_files(src_dir: str, dst_dir: str) -> List[str]:
    """Copy all files (including `build_info.json`) from `src_dir` to `dst_dir`."""
    copied: List[str] = []
    for current_root, dirs, files in os.walk(src_dir):
        dirs[:] = sorted(
            name for name in dirs if name != "__pycache__" and not name.startswith(".")
        )
        for filename in files:
            if (
                filename == ".DS_Store"
                or filename.startswith(".hydrilla-upd-")
                or filename.endswith(IGNORED_SUFFIXES)
            ):
                continue
            full_src = os.path.join(current_root, filename)
            rel_path = os.path.relpath(full_src, src_dir).replace("\\", "/")
            full_dst = os.path.join(dst_dir, *rel_path.split("/"))
            _atomic_copy_file(full_src, full_dst)
            copied.append(rel_path)
    return copied


def restore_backup(backup_dir: str, target_dir: str) -> None:
    """Restore `target_dir` from `backup_dir` if hot-reloading fails."""
    if not backup_dir or not os.path.isdir(backup_dir):
        return
    restored = set(_copy_tree_files(backup_dir, target_dir))
    for rel_path in _iter_source_files(target_dir):
        if rel_path not in restored:
            stale = os.path.join(target_dir, *rel_path.split("/"))
            try:
                os.remove(stale)
            except OSError:
                pass
    _clear_pycache(target_dir)


def swap_addon_files(staged_dir: str, addon_dir: Optional[str] = None) -> str:
    """Replace the installed add-on files with `staged_dir`, returning a backup dir."""
    target_dir = addon_dir or addon_directory()
    if not os.path.isdir(target_dir):
        cleanup_dir(staged_dir)
        raise UpdaterError("Add-on directory not found: %s" % target_dir)
    if not os.access(target_dir, os.W_OK):
        cleanup_dir(staged_dir)
        raise UpdaterError("Blender's add-on folder is not writable (%s)." % target_dir)

    backup_dir = tempfile.mkdtemp(prefix="hydrilla-addon-backup-")
    try:
        previous_files = set(_copy_tree_files(target_dir, backup_dir))
        installed_files = set(_copy_tree_files(staged_dir, target_dir))
        for rel_path in previous_files - installed_files:
            stale = os.path.join(target_dir, *rel_path.split("/"))
            if os.path.isfile(stale):
                try:
                    os.remove(stale)
                except OSError:
                    pass
        _clear_pycache(target_dir)
        return backup_dir
    except Exception as error:
        try:
            restore_backup(backup_dir, target_dir)
        finally:
            cleanup_dir(backup_dir)
        raise UpdaterError("Could not write updated add-on files: %s" % error) from error
    finally:
        cleanup_dir(staged_dir)


def perform_hot_reload(
    *,
    addon_id: str,
    addon_dir: str,
    backup_dir: str,
    new_version: str,
    was_bridge_running: bool,
    prefs_snapshot: Dict[str, Any],
) -> None:
    """Reload the updated add-on on Blender's main thread without restarting Blender."""
    pkg = sys.modules.get(addon_id)
    if pkg is None:
        cleanup_dir(backup_dir)
        return

    try:
        if hasattr(pkg, "unregister"):
            pkg.unregister()
    except Exception as error:
        print("[Hydrilla] Warning while unregistering previous version: %s" % error)

    def _load_package():
        importlib.invalidate_caches()
        prefix = addon_id + "."
        for mod_name in [name for name in list(sys.modules) if name.startswith(prefix)]:
            sys.modules.pop(mod_name, None)
        for attr_name in list(vars(pkg)):
            attr_val = getattr(pkg, attr_name, None)
            if isinstance(attr_val, types.ModuleType) and getattr(
                attr_val, "__name__", ""
            ).startswith(prefix):
                delattr(pkg, attr_name)
        reloaded_mod = importlib.reload(pkg)
        reloaded_mod.__addon_enabled__ = True
        reloaded_mod.register()
        return reloaded_mod

    try:
        reloaded = _load_package()
    except Exception as error:
        err_text = str(error).strip() or error.__class__.__name__
        print("[Hydrilla] Hot reload failed (%s); rolling back add-on files." % err_text)
        try:
            restore_backup(backup_dir, addon_dir)
            restored = _load_package()
            if (
                was_bridge_running
                and hasattr(restored, "bridge_runtime")
                and not restored.bridge_runtime.is_running()
            ):
                restored.bridge_runtime.start()
            if hasattr(restored, "_on_update_failed"):
                restored._on_update_failed(
                    "Update failed and was rolled back: %s" % err_text,
                    prefs_snapshot=prefs_snapshot,
                )
        except Exception as rollback_error:
            print("[Hydrilla] Rollback failed: %s" % rollback_error)
        finally:
            cleanup_dir(backup_dir)
        return

    cleanup_dir(backup_dir)
    try:
        import addon_utils

        if hasattr(addon_utils, "modules_refresh"):
            addon_utils.modules_refresh()
    except Exception:
        pass

    try:
        if hasattr(reloaded, "_restore_after_hot_reload"):
            reloaded._restore_after_hot_reload(
                new_version=new_version,
                was_bridge_running=was_bridge_running,
                prefs_snapshot=prefs_snapshot,
            )
    except Exception as error:
        print("[Hydrilla] Post-update restore warning: %s" % error)


def schedule_hot_reload(
    *,
    addon_id: str,
    addon_dir: str,
    backup_dir: str,
    new_version: str,
    was_bridge_running: bool,
    prefs_snapshot: Dict[str, Any],
) -> None:
    """Schedule `perform_hot_reload` on the next Blender main-thread timer tick."""
    import bpy

    def _reload_tick():
        perform_hot_reload(
            addon_id=addon_id,
            addon_dir=addon_dir,
            backup_dir=backup_dir,
            new_version=new_version,
            was_bridge_running=was_bridge_running,
            prefs_snapshot=prefs_snapshot,
        )
        return None

    bpy.app.timers.register(_reload_tick, first_interval=0.05)
