bl_info = {
    "name": "Hydrilla",
    "author": "Hydrilla",
    "version": (2, 2, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Sidebar > Hydrilla",
    "description": "Generate AI 3D models, receive them from Hydrilla Studio, and let your AI agent build the scene",
    "category": "Import-Export",
}

import importlib
import os
import threading
import time
from queue import Empty, Queue

import bpy
from bpy.props import BoolProperty, EnumProperty, PointerProperty, StringProperty
from bpy.types import AddonPreferences, Operator, Panel
from bpy_extras.io_utils import ImportHelper

from . import hydrilla_config
from . import hydrilla_api
from . import addon_updater
from . import bridge_server
from . import agent_commands
from . import bridge_runtime

ADDON_ID = __package__ or __name__
TASK_LIST_LIMIT = 30
TASK_REFRESH_SECONDS = 10.0
# A task still "running" after this long is no longer worth polling for.
STALE_TASK_SECONDS = 30 * 60
VISIBLE_TASKS = 12

# Everything below is runtime state. Nothing here is saved into the .blend file.
_EVENTS = Queue()
_JOB = {"busy": False, "cancel": False, "started_at": 0.0, "task_id": ""}
_STATUS = {"text": "Ready", "kind": "INFO", "phase": "", "progress": 0}
_ACCOUNT = {"state": "NONE", "credits": None, "plan": "", "message": ""}
_TASKS = {"items": [], "fetching": False, "error": "", "fetched_at": "", "next_refresh": 0.0}
# Guards the key and server fields' update callbacks against re-entering themselves.
_GUARD = {"key": False, "base": False, "site": False}

ACCOUNT_NONE = "NONE"
ACCOUNT_UNVERIFIED = "UNVERIFIED"
ACCOUNT_CHECKING = "CHECKING"
ACCOUNT_OK = "OK"
ACCOUNT_BAD = "BAD"
ACCOUNT_ERROR = "ERROR"

UPDATE_IDLE = "IDLE"
UPDATE_CHECKING = "CHECKING"
UPDATE_AVAILABLE = "AVAILABLE"
UPDATE_UPDATING = "UPDATING"
UPDATE_UP_TO_DATE = "UP_TO_DATE"
UPDATE_UPDATED = "UPDATED"
UPDATE_ERROR = "ERROR"

_UPDATE = {
    "state": UPDATE_IDLE,
    "remote_version": "",
    "remote_build_id": "",
    "manifest": None,
    "message": "",
    "manual": False,
}

# --------------------------------------------------------------------------
# Settings
# --------------------------------------------------------------------------


def _prefs(context=None):
    ctx = context or bpy.context
    addon = ctx.preferences.addons.get(ADDON_ID)
    return addon.preferences if addon else None


def _api_key(context=None) -> str:
    prefs = _prefs(context)
    return hydrilla_config.resolve_api_key(prefs.api_key if prefs else "")


def _api_base(context=None) -> str:
    prefs = _prefs(context)
    return hydrilla_config.resolve_api_base(prefs.api_server if prefs else "")


def _has_api_key(prefs=None) -> bool:
    target = prefs if prefs is not None else _prefs()
    return bool((target and target.api_key) or hydrilla_config.resolve_api_key(""))


def _editing_api_key() -> bool:
    window_manager = getattr(bpy.context, "window_manager", None)
    if window_manager is None or not hasattr(window_manager, "hydrilla_edit_api_key"):
        return False
    return bool(window_manager.hydrilla_edit_api_key)


def _set_editing_api_key(editing: bool) -> None:
    window_manager = getattr(bpy.context, "window_manager", None)
    if window_manager is None or not hasattr(window_manager, "hydrilla_edit_api_key"):
        return
    window_manager.hydrilla_edit_api_key = editing


def _show_api_field(prefs) -> bool:
    """The key box stays up until a key is saved and accepted."""
    if not _has_api_key(prefs) or _editing_api_key():
        return True
    return _ACCOUNT["state"] == ACCOUNT_BAD


def _site_base(context=None) -> str:
    prefs = _prefs(context)
    explicit = ""
    if prefs and prefs.site_server and prefs.site_server != hydrilla_config.DEFAULT_SITE_URL:
        explicit = prefs.site_server
    return hydrilla_config.site_url(explicit)


def _version_text() -> str:
    return ".".join(str(part) for part in bl_info["version"])


def _background_calls_allowed() -> bool:
    """Whether the add-on may contact Hydrilla without the user pressing anything.

    Blender 4.2+ has an "Allow Online Access" setting. With it off, the add-on
    only goes online for something the user explicitly asks for.
    """
    return bool(getattr(bpy.app, "online_access", True))


def _client(context=None):
    """Build an API client, or raise with a message the user can act on."""
    key = _api_key(context)
    if not key:
        raise hydrilla_api.HydrillaApiError(
            hydrilla_api.NO_KEY_MESSAGE, kind=hydrilla_api.ERROR_AUTH
        )
    return hydrilla_api.HydrillaClient(key, _api_base(context))


def _on_api_key_changed(self, context):
    if _GUARD["key"]:
        return
    cleaned = hydrilla_config.clean_api_key(self.api_key)
    if cleaned != self.api_key:
        _GUARD["key"] = True
        try:
            self.api_key = cleaned
        finally:
            _GUARD["key"] = False
    try:
        # Shared with the other Hydrilla plugins and the MCP server.
        hydrilla_config.save_api_key(cleaned)
    except OSError as error:
        print("[Hydrilla] Could not save the API key for other tools: %s" % error)

    _TASKS["items"] = []
    _TASKS["error"] = ""
    _ACCOUNT.update(credits=None, plan="", message="")
    if not cleaned:
        _ACCOUNT["state"] = ACCOUNT_NONE
        _set_status("API key removed.", "INFO")
    elif not hydrilla_config.looks_like_api_key(cleaned):
        _ACCOUNT["state"] = ACCOUNT_BAD
        _ACCOUNT["message"] = "That does not look like a Hydrilla key (hyd_live_…)."
    else:
        _ACCOUNT["state"] = ACCOUNT_UNVERIFIED
        _start_verify(context)
    _tag_redraw()


def _on_api_base_changed(self, context):
    if _GUARD["base"]:
        return
    fixed = hydrilla_config.normalize_api_base(self.api_server)
    if fixed != self.api_server:
        _GUARD["base"] = True
        try:
            self.api_server = fixed
        finally:
            _GUARD["base"] = False


def _on_site_base_changed(self, context):
    if _GUARD["site"]:
        return
    fixed = hydrilla_config.normalize_site_url(self.site_server)
    if fixed != self.site_server:
        _GUARD["site"] = True
        try:
            self.site_server = fixed
        finally:
            _GUARD["site"] = False


# --------------------------------------------------------------------------
# Status
# --------------------------------------------------------------------------


def _tag_redraw() -> None:
    window_manager = getattr(bpy.context, "window_manager", None)
    if not window_manager:
        return
    for window in window_manager.windows:
        screen = window.screen
        if not screen:
            continue
        for area in screen.areas:
            if area.type in {"VIEW_3D", "PREFERENCES"}:
                area.tag_redraw()


def _set_status(text: str, kind: str = "INFO", phase: str = "", progress: int = -1) -> None:
    _STATUS["text"] = text
    _STATUS["kind"] = kind
    _STATUS["phase"] = phase
    if progress >= 0:
        _STATUS["progress"] = max(0, min(100, int(progress)))
    _tag_redraw()


def _wrap(text: str, width: int = 34) -> list:
    words = (text or "").replace("\n", " ").split()
    lines = []
    current = ""
    for word in words:
        candidate = ("%s %s" % (current, word)).strip()
        if len(candidate) > width and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines or ["Ready"]


def _truncate(text: str, width: int = 30) -> str:
    value = (text or "").replace("\n", " ").strip()
    if not value:
        return "(no prompt)"
    if len(value) <= width:
        return value
    return value[: width - 1] + "…"


def _popup(message: str, title: str = "Hydrilla", icon: str = "INFO") -> None:
    lines = _wrap(message, width=48)

    def draw_popup(menu, _context):
        column = menu.layout.column(align=True)
        for line in lines:
            column.label(text=line)

    # Popups need a real window: none exists in background mode, and timers
    # run without an active one.
    if bpy.app.background:
        return
    window_manager = getattr(bpy.context, "window_manager", None)
    if not window_manager or not len(window_manager.windows):
        return
    window = bpy.context.window or window_manager.windows[0]
    try:
        if hasattr(bpy.context, "temp_override"):
            with bpy.context.temp_override(window=window):
                window_manager.popup_menu(draw_popup, title=title, icon=icon)
        else:
            window_manager.popup_menu(draw_popup, title=title, icon=icon)
    except Exception as error:
        # The status line already carries the message.
        print("[Hydrilla] %s (%s)" % (message, _error_text(error)))


def _task_state(task: dict) -> str:
    """READY, RUNNING, STALLED, CANCELLED or FAILED for a task from the API."""
    status = str(task.get("status") or "").upper()
    if status == "SUCCEEDED":
        return "READY"
    if status in ("PENDING", "IN_PROGRESS"):
        try:
            age = time.time() - float(task.get("created_at") or 0)
        except (TypeError, ValueError):
            age = 0.0
        return "STALLED" if age > STALE_TASK_SECONDS else "RUNNING"
    if status == "CANCELLED":
        return "CANCELLED"
    return "FAILED"


def _error_text(error: BaseException) -> str:
    return str(error).strip() or error.__class__.__name__


# --------------------------------------------------------------------------
# Background work. Threads never touch bpy; they post events for the timer.
# --------------------------------------------------------------------------


def _emit(kind: str, **payload) -> None:
    payload["kind"] = kind
    _EVENTS.put(payload)


def _ensure_pump() -> None:
    if not bpy.app.timers.is_registered(_pump):
        bpy.app.timers.register(_pump, first_interval=0.05, persistent=True)


def _handle_event(event: dict) -> None:
    kind = event.get("kind")
    if kind == "account":
        state = event.get("state", ACCOUNT_ERROR)
        _ACCOUNT.update(
            state=state,
            credits=event.get("credits"),
            plan=event.get("plan", ""),
            message=event.get("message", ""),
        )
        if state == ACCOUNT_OK:
            _set_editing_api_key(False)
        return

    if kind == "tasks":
        _TASKS["fetching"] = False
        _TASKS["error"] = event.get("error", "")
        if not _TASKS["error"]:
            _TASKS["items"] = event.get("items") or []
            _TASKS["fetched_at"] = time.strftime("%H:%M:%S")
        if event.get("auth_failed"):
            _ACCOUNT.update(state=ACCOUNT_BAD, message=_TASKS["error"])
        return

    if kind == "job_status":
        if event.get("task_id"):
            _JOB["task_id"] = event["task_id"]
        _set_status(
            str(event.get("text") or "Working…"),
            "RUNNING",
            phase=str(event.get("phase") or ""),
            progress=int(event.get("progress", -1)),
        )
        return

    if kind == "job_done":
        _JOB.update(busy=False, cancel=False)
        path = str(event.get("path") or "")
        try:
            bridge_runtime.import_glb(path, str(event.get("name") or ""))
            _set_status("Imported into the scene. Find it in the Outliner.", "DONE", progress=100)
            _popup("Model imported into the scene.", title="Hydrilla", icon="CHECKMARK")
        except Exception as error:
            message = "Generated, but the import failed: %s" % _error_text(error)
            _set_status(message, "ERROR")
            _popup(message, title="Hydrilla", icon="ERROR")
        finally:
            if path and os.path.isfile(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
        _refresh_after_job()
        return

    if kind == "job_error":
        _JOB.update(busy=False, cancel=False)
        message = str(event.get("text") or "Generation failed")
        error_kind = event.get("error_kind")
        if error_kind == hydrilla_api.ERROR_CANCELLED:
            _set_status("Cancelled. Unused credits are refunded.", "INFO")
        else:
            if error_kind == hydrilla_api.ERROR_AUTH:
                _ACCOUNT.update(state=ACCOUNT_BAD, message=message)
            _set_status(message, "ERROR")
            _popup(message, title="Hydrilla", icon="ERROR")
        _refresh_after_job()
        return

    if kind == "update_checked":
        result = event.get("result") or {}
        available = bool(result.get("available"))
        manifest = result.get("manifest")
        manual = bool(event.get("manual"))
        install_if_found = bool(event.get("install_if_found"))
        remote_version = str(result.get("remote_version") or "")
        remote_build_id = str(result.get("remote_build_id") or "")
        if available:
            _UPDATE.update(
                state=UPDATE_AVAILABLE,
                remote_version=remote_version,
                remote_build_id=remote_build_id,
                manifest=manifest,
                message="",
                manual=manual,
            )
            if install_if_found and not _JOB["busy"]:
                _start_addon_install(manual=manual)
        else:
            _UPDATE.update(
                state=UPDATE_UP_TO_DATE,
                remote_version=remote_version,
                remote_build_id=remote_build_id,
                manifest=manifest,
                message="",
                manual=manual,
            )
        return

    if kind == "update_check_error":
        manual = bool(event.get("manual"))
        message = str(event.get("message") or "Could not check for updates.")
        if manual:
            _UPDATE.update(state=UPDATE_ERROR, message=message, manual=True)
        else:
            _UPDATE.update(state=UPDATE_IDLE, message="", manual=False)
            print("[Hydrilla] Startup update check skipped: %s" % message)
        return

    if kind == "update_staged":
        staged_dir = str(event.get("staged_dir") or "")
        remote_version = str(event.get("remote_version") or _version_text())
        if _JOB["busy"]:
            addon_updater.cleanup_dir(staged_dir)
            _UPDATE.update(state=UPDATE_AVAILABLE, message="", manual=True)
            return
        try:
            prefs = _prefs()
            prefs_snapshot = _snapshot_prefs(prefs)
            was_bridge_running = bridge_runtime.is_running()
            target_dir = addon_updater.addon_directory()
            backup_dir = addon_updater.swap_addon_files(staged_dir, target_dir)
            addon_updater.schedule_hot_reload(
                addon_id=ADDON_ID,
                addon_dir=target_dir,
                backup_dir=backup_dir,
                new_version=remote_version,
                was_bridge_running=was_bridge_running,
                prefs_snapshot=prefs_snapshot,
            )
        except Exception as error:
            addon_updater.cleanup_dir(staged_dir)
            message = _error_text(error)
            _UPDATE.update(state=UPDATE_ERROR, message=message, manual=True)
            _set_status("Add-on update failed: %s" % message, "ERROR")
        return

    if kind == "update_install_error":
        message = str(event.get("message") or "Could not install add-on update.")
        _UPDATE.update(state=UPDATE_ERROR, message=message, manual=True)
        if event.get("manual"):
            _set_status(message, "ERROR")


def _refresh_after_job() -> None:
    _start_tasks_fetch()
    _start_verify()


def _pump():
    """Main-thread timer: apply results from background threads to the UI."""
    handled = False
    while True:
        try:
            event = _EVENTS.get_nowait()
        except Empty:
            break
        handled = True
        try:
            _handle_event(event)
        except Exception as error:
            print("[Hydrilla] Could not apply update: %s" % _error_text(error))

    waiting_on_tasks = _background_calls_allowed() and any(
        _task_state(item) == "RUNNING" for item in _TASKS["items"]
    )
    if waiting_on_tasks and not _TASKS["fetching"] and time.time() >= _TASKS["next_refresh"]:
        _start_tasks_fetch()

    active = (
        _JOB["busy"]
        or _TASKS["fetching"]
        or _ACCOUNT["state"] == ACCOUNT_CHECKING
        or _UPDATE["state"] in (UPDATE_CHECKING, UPDATE_UPDATING)
        or waiting_on_tasks
    )
    if handled or _JOB["busy"]:
        _tag_redraw()
    if not active and _EVENTS.empty():
        return None
    return 0.2 if _JOB["busy"] else 0.5


def _snapshot_prefs(prefs) -> dict:
    if prefs is None:
        return {}
    return {
        "api_key": prefs.api_key,
        "auto_start_bridge": bool(prefs.auto_start_bridge),
        "allow_agent_edits": bool(prefs.allow_agent_edits),
        "auto_update": bool(prefs.auto_update),
        "show_developer": bool(prefs.show_developer),
        "api_server": prefs.api_server,
        "site_server": prefs.site_server,
    }


def _apply_prefs_snapshot(prefs_snapshot: dict) -> None:
    prefs = _prefs()
    if prefs is None or not isinstance(prefs_snapshot, dict):
        return
    _GUARD["key"] = True
    _GUARD["base"] = True
    _GUARD["site"] = True
    try:
        for field, value in prefs_snapshot.items():
            if hasattr(prefs, field) and getattr(prefs, field) != value:
                setattr(prefs, field, value)
    finally:
        _GUARD["key"] = False
        _GUARD["base"] = False
        _GUARD["site"] = False


def _restore_after_hot_reload(*, new_version: str, was_bridge_running: bool, prefs_snapshot: dict) -> None:
    _apply_prefs_snapshot(prefs_snapshot)

    if was_bridge_running and not bridge_runtime.is_running():
        bridge_runtime.start()

    shown_version = new_version or _version_text()
    _UPDATE.update(
        state=UPDATE_UPDATED,
        remote_version=shown_version,
        message="",
        manual=True,
    )
    _set_status("Hydrilla add-on updated (v%s)." % shown_version, "DONE")
    _tag_redraw()


def _on_update_failed(message: str, prefs_snapshot=None) -> None:
    if prefs_snapshot:
        _apply_prefs_snapshot(prefs_snapshot)
    _UPDATE.update(state=UPDATE_ERROR, message=message, manual=True)
    _set_status(message, "ERROR")
    _tag_redraw()


def _start_update_check(context=None, *, manual: bool = False, install_if_found: bool = False) -> bool:
    """Check whether a newer `hydrilla-blender.zip` build is available."""
    if _UPDATE["state"] in (UPDATE_CHECKING, UPDATE_UPDATING):
        return False
    site = _site_base(context)
    _UPDATE.update(state=UPDATE_CHECKING, message="", manual=manual)

    def worker():
        try:
            result = addon_updater.check_for_update(site_base=site)
            _emit(
                "update_checked",
                result=result,
                manual=manual,
                install_if_found=install_if_found,
            )
        except Exception as error:
            _emit("update_check_error", message=_error_text(error), manual=manual)

    threading.Thread(target=worker, name="hydrilla-update-check", daemon=True).start()
    _ensure_pump()
    _tag_redraw()
    return True


def _start_addon_install(context=None, *, manual: bool = True) -> bool:
    """Download, verify, swap, and hot-reload the updated Blender add-on."""
    if _UPDATE["state"] == UPDATE_UPDATING:
        return False
    if _JOB["busy"]:
        if manual:
            _UPDATE.update(
                state=UPDATE_AVAILABLE,
                message="Wait for the running generation to finish before updating.",
                manual=True,
            )
            _tag_redraw()
        return False

    site = _site_base(context)
    cached_manifest = _UPDATE.get("manifest") if isinstance(_UPDATE.get("manifest"), dict) else None
    _UPDATE.update(state=UPDATE_UPDATING, message="", manual=manual)
    if manual:
        _set_status("Updating Hydrilla add-on…", "RUNNING", phase="Updating")
    else:
        _tag_redraw()

    def worker():
        try:
            manifest = cached_manifest
            if manifest is None:
                check = addon_updater.check_for_update(site_base=site)
                if not check.get("available"):
                    _emit("update_checked", result=check, manual=manual, install_if_found=False)
                    return
                manifest = check["manifest"]
            staged_dir = addon_updater.download_and_stage(manifest)
            _emit(
                "update_staged",
                staged_dir=staged_dir,
                remote_version=str(manifest.get("version") or ""),
                manifest=manifest,
                manual=manual,
            )
        except Exception as error:
            _emit("update_install_error", message=_error_text(error), manual=manual)

    threading.Thread(target=worker, name="hydrilla-update-install", daemon=True).start()
    _ensure_pump()
    return True


def _start_verify(context=None) -> bool:
    """Check the key and load the credit balance. Free to call."""
    if _ACCOUNT["state"] == ACCOUNT_CHECKING:
        return False
    try:
        client = _client(context)
    except hydrilla_api.HydrillaApiError as error:
        state = ACCOUNT_NONE if error.kind == hydrilla_api.ERROR_AUTH else ACCOUNT_ERROR
        _ACCOUNT.update(state=state, message=_error_text(error))
        return False
    _ACCOUNT.update(state=ACCOUNT_CHECKING, message="")

    def worker():
        try:
            profile = client.me()
            credits = profile.get("credits") if isinstance(profile.get("credits"), dict) else {}
            remaining = credits.get("remaining")
            _emit(
                "account",
                state=ACCOUNT_OK,
                credits=int(remaining) if isinstance(remaining, (int, float)) else None,
                plan=str(profile.get("plan") or ""),
            )
        except hydrilla_api.HydrillaApiError as error:
            state = ACCOUNT_BAD if error.kind == hydrilla_api.ERROR_AUTH else ACCOUNT_ERROR
            _emit("account", state=state, message=_error_text(error))
        except Exception as error:
            _emit("account", state=ACCOUNT_ERROR, message=_error_text(error))

    threading.Thread(target=worker, name="hydrilla-verify", daemon=True).start()
    _ensure_pump()
    return True


def _start_tasks_fetch(context=None) -> bool:
    if _TASKS["fetching"]:
        return False
    try:
        client = _client(context)
    except hydrilla_api.HydrillaApiError as error:
        _TASKS["error"] = _error_text(error)
        return False
    _TASKS["fetching"] = True
    _TASKS["next_refresh"] = time.time() + TASK_REFRESH_SECONDS

    def worker():
        try:
            _emit("tasks", items=client.list_tasks(limit=TASK_LIST_LIMIT))
        except hydrilla_api.HydrillaApiError as error:
            _emit(
                "tasks",
                error=_error_text(error),
                auth_failed=error.kind == hydrilla_api.ERROR_AUTH,
            )
        except Exception as error:
            _emit("tasks", error=_error_text(error))

    threading.Thread(target=worker, name="hydrilla-tasks", daemon=True).start()
    _ensure_pump()
    return True


def _progress_event(task: dict, task_id: str) -> None:
    status = str(task.get("status") or "").upper()
    try:
        percent = int(task.get("progress") or 0)
    except (TypeError, ValueError):
        percent = 0
    detail = str(task.get("status_message") or "").strip()
    if status == "PENDING":
        phase, text = "Queued", "Waiting for a GPU…"
    elif status == "IN_PROGRESS":
        phase, text = "Generating", detail or "Building the mesh…"
    else:
        phase, text = status.title(), detail or status.title()
    _emit("job_status", text=text, phase=phase, progress=percent, task_id=task_id)


def _start_job(context, *, create=None, task_id: str = "", mesh_url: str = "", name: str = "") -> str:
    """Run create → wait → download on a thread. Returns an error message, or ""."""
    if _JOB["busy"]:
        return "A model is already generating. See Status."
    try:
        client = _client(context)
    except hydrilla_api.HydrillaApiError as error:
        return _error_text(error)

    _JOB.update(busy=True, cancel=False, started_at=time.time(), task_id=task_id)

    def worker():
        current_id = task_id
        url = mesh_url
        try:
            if create is not None:
                created = create(client)
                current_id = str(created.get("id") or created.get("task_id") or "")
                if not current_id:
                    raise hydrilla_api.HydrillaApiError("Hydrilla did not return a task id.")
                _emit(
                    "job_status",
                    text="Task created. Waiting for a GPU…",
                    phase="Queued",
                    progress=10,
                    task_id=current_id,
                )
            if not url:
                try:
                    task = client.wait_for_task(
                        current_id,
                        on_progress=lambda task: _progress_event(task, current_id),
                        should_cancel=lambda: bool(_JOB["cancel"]),
                    )
                except hydrilla_api.HydrillaApiError as error:
                    if error.kind == hydrilla_api.ERROR_CANCELLED:
                        try:
                            client.cancel_task(current_id)
                        except hydrilla_api.HydrillaApiError:
                            # Already finished on the server; nothing to stop.
                            pass
                    raise
                if str(task.get("status") or "").upper() != "SUCCEEDED":
                    raise hydrilla_api.HydrillaApiError(str(task.get("error") or "Generation failed"))
                url = hydrilla_api.mesh_url_of(task)
                if not url:
                    raise hydrilla_api.HydrillaApiError("The finished task has no mesh.")
            if _JOB["cancel"]:
                raise hydrilla_api.HydrillaApiError(
                    "Generation cancelled", kind=hydrilla_api.ERROR_CANCELLED
                )
            _emit("job_status", text="Downloading the mesh…", phase="Download", progress=95)
            path = client.download_mesh_to_temp(url, "%s-%d" % (current_id, int(time.time())))
            _emit("job_done", path=path, name=name or current_id[:12])
        except hydrilla_api.HydrillaApiError as error:
            _emit("job_error", text=_error_text(error), error_kind=error.kind)
        except Exception as error:
            _emit("job_error", text=_error_text(error), error_kind=hydrilla_api.ERROR_API)

    threading.Thread(target=worker, name="hydrilla-generate", daemon=True).start()
    _ensure_pump()
    return ""


# --------------------------------------------------------------------------
# Preferences
# --------------------------------------------------------------------------


def _draw_account(layout, prefs, context, *, compact: bool = False) -> None:
    """Connection line, and the API key field only while it still needs attention."""
    state = _ACCOUNT["state"]
    env_key = not prefs.api_key and bool(hydrilla_config.resolve_api_key(""))
    show_field = _show_api_field(prefs)

    if not show_field:
        row = layout.row(align=True)
        if state == ACCOUNT_OK:
            credits = _ACCOUNT["credits"]
            text = "Connected" if credits is None else "%d credits" % credits
            row.label(text=text, icon="CHECKMARK")
        elif state == ACCOUNT_CHECKING:
            row.label(text="Checking…", icon="SORTTIME")
        elif state == ACCOUNT_ERROR:
            row.label(text="Offline", icon="ERROR")
        else:
            row.label(text="Key saved", icon="KEYINGSET")
        row.operator("hydrilla.edit_api_key", text="", icon="PREFERENCES")
        if state == ACCOUNT_ERROR and _ACCOUNT["message"] and not compact:
            for line in _wrap(_ACCOUNT["message"], width=42):
                layout.label(text=line)
        return

    column = layout.column(align=True)
    if not _has_api_key(prefs):
        column.label(text="Paste your API key", icon="KEYINGSET")
    elif state == ACCOUNT_BAD:
        column.label(text="Key not accepted", icon="ERROR")
    elif state == ACCOUNT_CHECKING:
        column.label(text="Checking your key…", icon="SORTTIME")
    else:
        column.label(text="API key", icon="KEYINGSET")

    if state in (ACCOUNT_BAD, ACCOUNT_ERROR) and _ACCOUNT["message"]:
        for line in _wrap(_ACCOUNT["message"], width=40):
            column.label(text=line)

    column.prop(prefs, "api_key", text="")
    if env_key:
        column.label(text="Using the key from this computer", icon="INFO")

    row = column.row(align=True)
    row.operator("wm.url_open", text="Get API key", icon="URL").url = hydrilla_config.api_keys_url(
        _site_base(context)
    )
    if prefs.api_key or env_key:
        row.operator("hydrilla.verify_key", text="", icon="FILE_REFRESH")
    if prefs.api_key:
        row.operator("hydrilla.remove_key", text="", icon="X")


def _draw_update_banner(layout) -> None:
    """Sidebar notice only while an update needs the user, or is in progress."""
    state = _UPDATE["state"]
    if state == UPDATE_UPDATING:
        layout.label(text="Updating add-on…", icon="SORTTIME")
        return
    if state == UPDATE_CHECKING and _UPDATE["manual"]:
        layout.label(text="Checking for updates…", icon="SORTTIME")
        return
    if state == UPDATE_AVAILABLE:
        box = layout.box()
        box.label(text=_update_ready_label(), icon="INFO")
        if _UPDATE["message"]:
            for line in _wrap(_UPDATE["message"], width=36):
                box.label(text=line)
        action = box.row()
        action.scale_y = 1.2
        action.enabled = not _JOB["busy"]
        action.operator("hydrilla.update_addon", text="Update", icon="IMPORT")
        return
    if state == UPDATE_ERROR and _UPDATE["manual"] and _UPDATE["message"]:
        box = layout.box()
        for line in _wrap(_UPDATE["message"], width=36):
            box.label(text=line, icon="ERROR")
        if isinstance(_UPDATE.get("manifest"), dict):
            action = box.row()
            action.enabled = not _JOB["busy"]
            action.operator("hydrilla.update_addon", text="Try again", icon="FILE_REFRESH")


def _draw_bridge_controls(layout, prefs) -> None:
    column = layout.column(align=True)
    if bridge_runtime.is_running():
        column.operator("hydrilla.bridge_stop", text="Bridge on", icon="CHECKMARK", depress=True)
    else:
        column.operator("hydrilla.bridge_start", text="Run Bridge", icon="PLAY")
    column.prop(prefs, "auto_start_bridge", text="Start with Blender")
    column.separator()
    column.prop(prefs, "allow_agent_edits", text="Let AI edit this scene")


def _update_ready_label() -> str:
    remote_version = _UPDATE["remote_version"]
    if remote_version and remote_version != _version_text():
        return "Add-on update ready (v%s)" % remote_version
    return "New add-on build ready"


def _draw_updates_prefs(layout, prefs) -> None:
    state = _UPDATE["state"]
    layout.label(text="Updates · v%s" % _version_text(), icon="FILE_REFRESH")
    layout.prop(prefs, "auto_update")

    if state == UPDATE_CHECKING:
        layout.label(text="Checking for add-on updates…", icon="SORTTIME")
    elif state == UPDATE_UPDATING:
        layout.label(text="Downloading and reloading add-on…", icon="SORTTIME")
    elif state == UPDATE_AVAILABLE:
        layout.label(text=_update_ready_label(), icon="INFO")
    elif state == UPDATE_UPDATED:
        layout.label(text="Updated to v%s" % _version_text(), icon="CHECKMARK")
    elif state == UPDATE_UP_TO_DATE and _UPDATE["manual"]:
        layout.label(text="Add-on is up to date", icon="CHECKMARK")
    elif state == UPDATE_ERROR and _UPDATE["message"]:
        for line in _wrap(_UPDATE["message"], width=48):
            layout.label(text=line, icon="ERROR")

    row = layout.row(align=True)
    check_sub = row.row(align=True)
    check_sub.enabled = state not in (UPDATE_CHECKING, UPDATE_UPDATING)
    check_sub.operator("hydrilla.check_updates", text="Check for updates", icon="FILE_REFRESH")
    if state in (UPDATE_AVAILABLE, UPDATE_ERROR) and isinstance(_UPDATE.get("manifest"), dict):
        install_sub = row.row(align=True)
        install_sub.enabled = state != UPDATE_UPDATING and not _JOB["busy"]
        install_sub.operator("hydrilla.update_addon", text="Update now", icon="IMPORT")


class HydrillaPreferences(AddonPreferences):
    bl_idname = ADDON_ID

    api_key: StringProperty(
        name="API Key",
        description="Your Hydrilla API key (hyd_live_…). Create one at hydrilla.ai/app/api-keys",
        subtype="PASSWORD",
        default="",
        update=_on_api_key_changed,
    )
    auto_start_bridge: BoolProperty(
        name="Start Bridge with Blender",
        description=(
            "Turn the Bridge on automatically whenever Blender starts, so Hydrilla Studio "
            "and your AI agent can always send models to Blender"
        ),
        default=True,
    )
    allow_agent_edits: BoolProperty(
        name="Let AI agent edit this scene",
        description=(
            "Allow your AI agent (through the Hydrilla MCP) to run Python in Blender to "
            "move, build and change objects. Only turn this on while you are using an "
            "agent you trust, and save your work first. Each script can be undone with Ctrl+Z"
        ),
        default=False,
    )
    auto_update: BoolProperty(
        name="Keep add-on updated automatically",
        description=(
            "Check hydrilla.ai when Blender starts and install new Hydrilla add-on "
            "builds in place without reinstalling the zip"
        ),
        default=True,
    )
    show_developer: BoolProperty(name="Developer", default=False)
    api_server: StringProperty(
        name="API address",
        description="Leave as is unless you run your own Hydrilla backend",
        default=hydrilla_config.DEFAULT_API_BASE,
        update=_on_api_base_changed,
    )
    site_server: StringProperty(
        name="Plugin site",
        description="Site hosting /plugins/hydrilla-blender.zip (leave as is unless testing locally)",
        default=hydrilla_config.DEFAULT_SITE_URL,
        update=_on_site_base_changed,
    )

    def draw(self, context):
        layout = self.layout
        box = layout.box()
        box.label(text="Account", icon="USER")
        _draw_account(box, self, context)

        box = layout.box()
        box.label(text="Bridge", icon="LINKED")
        _draw_bridge_controls(box, self)

        box = layout.box()
        _draw_updates_prefs(box, self)

        box = layout.box()
        row = box.row()
        row.prop(
            self,
            "show_developer",
            icon="TRIA_DOWN" if self.show_developer else "TRIA_RIGHT",
            emboss=False,
        )
        if self.show_developer:
            box.prop(self, "api_server")
            row = box.row(align=True)
            row.operator("hydrilla.use_api_base", text="Use production").target = "PRODUCTION"
            row.operator("hydrilla.use_api_base", text="Use local (:4000)").target = "LOCAL"

            box.prop(self, "site_server")
            row = box.row(align=True)
            row.operator("hydrilla.use_site_base", text="Use hydrilla.ai").target = "PRODUCTION"
            row.operator("hydrilla.use_site_base", text="Use local (:3000)").target = "LOCAL"
            local_build = addon_updater.installed_info().get("build_id") or ""
            if local_build:
                box.label(text="Installed build: %s" % local_build[:12])


# --------------------------------------------------------------------------
# Operators
# --------------------------------------------------------------------------


class HYDRILLA_OT_use_api_base(Operator):
    bl_idname = "hydrilla.use_api_base"
    bl_label = "Set API address"
    bl_description = "Switch between the Hydrilla API and a backend on this machine"

    target: EnumProperty(
        items=(
            ("PRODUCTION", "Production", ""),
            ("LOCAL", "Local", ""),
        ),
        default="PRODUCTION",
    )

    def execute(self, context):
        prefs = _prefs(context)
        if self.target == "LOCAL":
            prefs.api_server = hydrilla_config.LOCAL_API_BASE
        else:
            prefs.api_server = hydrilla_config.DEFAULT_API_BASE
        self.report({"INFO"}, "Hydrilla API: %s" % prefs.api_server)
        _start_verify(context)
        return {"FINISHED"}


class HYDRILLA_OT_use_site_base(Operator):
    bl_idname = "hydrilla.use_site_base"
    bl_label = "Set plugin site"
    bl_description = "Switch between hydrilla.ai and a local frontend server (:3000)"

    target: EnumProperty(
        items=(
            ("PRODUCTION", "Production", ""),
            ("LOCAL", "Local", ""),
        ),
        default="PRODUCTION",
    )

    def execute(self, context):
        prefs = _prefs(context)
        if self.target == "LOCAL":
            prefs.site_server = hydrilla_config.LOCAL_SITE_URL
        else:
            prefs.site_server = hydrilla_config.DEFAULT_SITE_URL
        self.report({"INFO"}, "Hydrilla plugin site: %s" % prefs.site_server)
        return {"FINISHED"}


class HYDRILLA_OT_check_updates(Operator):
    bl_idname = "hydrilla.check_updates"
    bl_label = "Check for add-on updates"
    bl_description = "Check hydrilla.ai for a newer Blender add-on zip and update in place"

    def execute(self, context):
        prefs = _prefs(context)
        install_now = bool(prefs is not None and prefs.auto_update and not addon_updater.is_dev_symlink())
        if _start_update_check(context, manual=True, install_if_found=install_now):
            return {"FINISHED"}
        if _UPDATE["state"] in (UPDATE_CHECKING, UPDATE_UPDATING):
            return {"FINISHED"}
        return {"CANCELLED"}


class HYDRILLA_OT_update_addon(Operator):
    bl_idname = "hydrilla.update_addon"
    bl_label = "Update Hydrilla add-on"
    bl_description = "Download the latest Hydrilla Blender zip and reload the add-on in place"

    def execute(self, context):
        if _JOB["busy"]:
            self.report({"ERROR"}, "Wait for the current model generation to finish first")
            return {"CANCELLED"}
        if _start_addon_install(context, manual=True) or _UPDATE["state"] == UPDATE_UPDATING:
            return {"FINISHED"}
        return {"CANCELLED"}


class HYDRILLA_OT_edit_api_key(Operator):
    bl_idname = "hydrilla.edit_api_key"
    bl_label = "Change API key"
    bl_description = "Show the API key field to replace the saved key"
    bl_options = {"INTERNAL"}

    def execute(self, context):
        _set_editing_api_key(True)
        return {"FINISHED"}


class HYDRILLA_OT_verify_key(Operator):
    bl_idname = "hydrilla.verify_key"
    bl_label = "Check API key"
    bl_description = "Check the key and refresh your credit balance (free)"

    def execute(self, context):
        if _start_verify(context):
            return {"FINISHED"}
        if _ACCOUNT["state"] == ACCOUNT_CHECKING:
            return {"FINISHED"}
        self.report({"ERROR"}, _ACCOUNT["message"] or "Add your API key first")
        return {"CANCELLED"}


class HYDRILLA_OT_remove_key(Operator):
    bl_idname = "hydrilla.remove_key"
    bl_label = "Remove API key"
    bl_description = (
        "Remove the key from Blender and from the other Hydrilla tools on this computer"
    )

    def invoke(self, context, event):
        return context.window_manager.invoke_confirm(self, event)

    def execute(self, context):
        _prefs(context).api_key = ""
        self.report({"INFO"}, "Hydrilla API key removed")
        return {"FINISHED"}


class HYDRILLA_OT_text_to_3d(Operator):
    bl_idname = "hydrilla.text_to_3d"
    bl_label = "Generate"
    bl_description = "Generate a 3D model from the prompt and import it here"

    def execute(self, context):
        prompt = (context.scene.hydrilla_prompt or "").strip()
        if not prompt:
            self.report({"ERROR"}, "Enter a prompt")
            return {"CANCELLED"}

        problem = _start_job(
            context,
            create=lambda client: client.text_to_3d(prompt),
            name=prompt[:24],
        )
        if problem:
            _set_status(problem, "ERROR")
            self.report({"ERROR"}, problem)
            return {"CANCELLED"}
        _set_status("Creating the concept image…", "RUNNING", phase="Starting", progress=2)
        return {"FINISHED"}


class HYDRILLA_OT_pick_image(Operator, ImportHelper):
    bl_idname = "hydrilla.pick_image"
    bl_label = "Choose image"
    bl_description = "Pick a PNG, JPG or WebP to turn into a 3D model"

    filename_ext = ".png"
    filter_glob: StringProperty(
        default="*.png;*.jpg;*.jpeg;*.webp",
        options={"HIDDEN"},
    )

    def execute(self, context):
        scene = context.scene
        path = (self.filepath or "").strip()
        if not path or not os.path.isfile(path):
            self.report({"ERROR"}, "Choose an image file")
            return {"CANCELLED"}
        try:
            image = bpy.data.images.load(path, check_existing=True)
        except Exception as error:
            self.report({"ERROR"}, "Could not open the image: %s" % error)
            return {"CANCELLED"}

        scene.hydrilla_image_path = path
        scene.hydrilla_preview = image
        scene.hydrilla_image_url = ""
        _set_status("Image ready: %s" % os.path.basename(path), "INFO")
        return {"FINISHED"}


class HYDRILLA_OT_image_to_3d(Operator):
    bl_idname = "hydrilla.image_to_3d"
    bl_label = "Generate from image"
    bl_description = "Generate a 3D model from the image and import it here"

    def execute(self, context):
        scene = context.scene
        image_path = bpy.path.abspath((scene.hydrilla_image_path or "").strip())
        image_url = (scene.hydrilla_image_url or "").strip()

        if image_url.startswith("https://") or image_url.startswith("http://"):
            create = lambda client: client.image_to_3d_url(image_url)  # noqa: E731
            label = "image"
        elif image_path and os.path.isfile(image_path):
            create = lambda client: client.image_to_3d_file(image_path)  # noqa: E731
            label = os.path.splitext(os.path.basename(image_path))[0][:24]
        else:
            message = "Choose an image file, or paste an https:// image link."
            _set_status(message, "ERROR")
            self.report({"ERROR"}, message)
            return {"CANCELLED"}

        problem = _start_job(context, create=create, name=label)
        if problem:
            _set_status(problem, "ERROR")
            self.report({"ERROR"}, problem)
            return {"CANCELLED"}
        _set_status("Sending the image…", "RUNNING", phase="Starting", progress=2)
        return {"FINISHED"}


class HYDRILLA_OT_cancel_generate(Operator):
    bl_idname = "hydrilla.cancel_generate"
    bl_label = "Cancel"
    bl_description = "Stop the running generation. Unused credits are refunded"

    def execute(self, context):
        if not _JOB["busy"]:
            return {"CANCELLED"}
        _JOB["cancel"] = True
        _set_status("Cancelling…", "RUNNING", phase="Cancelling")
        return {"FINISHED"}


class HYDRILLA_OT_refresh_tasks(Operator):
    bl_idname = "hydrilla.refresh_tasks"
    bl_label = "Refresh"
    bl_description = "Reload your recent Hydrilla models"

    def execute(self, context):
        if _start_tasks_fetch(context) or _TASKS["fetching"]:
            return {"FINISHED"}
        self.report({"ERROR"}, _TASKS["error"] or "Could not load your models")
        return {"CANCELLED"}


class HYDRILLA_OT_import_task(Operator):
    bl_idname = "hydrilla.import_task"
    bl_label = "Import"
    bl_description = "Download this model and add it to the scene"
    bl_options = {"REGISTER", "UNDO"}

    task_id: StringProperty(default="", options={"HIDDEN", "SKIP_SAVE"})

    def execute(self, context):
        task = next((item for item in _TASKS["items"] if item.get("id") == self.task_id), None)
        if task is None:
            self.report({"ERROR"}, "That model is no longer in the list. Refresh and try again.")
            return {"CANCELLED"}

        problem = _start_job(
            context,
            task_id=self.task_id,
            mesh_url=hydrilla_api.mesh_url_of(task),
            name=str(task.get("prompt") or self.task_id)[:24],
        )
        if problem:
            _set_status(problem, "ERROR")
            self.report({"ERROR"}, problem)
            return {"CANCELLED"}
        _set_status("Getting the model…", "RUNNING", phase="Download", progress=50)
        return {"FINISHED"}


# --------------------------------------------------------------------------
# Panels
# --------------------------------------------------------------------------


class _HydrillaPanel:
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Hydrilla"


class HYDRILLA_PT_main(_HydrillaPanel, Panel):
    bl_label = "Hydrilla"
    bl_idname = "HYDRILLA_PT_main"

    def draw_header(self, context):
        self.layout.label(text="", icon="MESH_CUBE")

    def draw(self, context):
        layout = self.layout
        prefs = _prefs(context)
        if prefs is None:
            layout.label(text="Enable the Hydrilla add-on", icon="ERROR")
            return

        _draw_update_banner(layout)
        _draw_account(layout, prefs, context, compact=True)


class HYDRILLA_PT_generate(_HydrillaPanel, Panel):
    bl_label = "Generate"
    bl_idname = "HYDRILLA_PT_generate"
    bl_parent_id = "HYDRILLA_PT_main"

    @classmethod
    def poll(cls, context):
        return _has_api_key(_prefs(context))

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        busy = bool(_JOB["busy"])

        layout.prop(scene, "hydrilla_gen_mode", expand=True)
        if scene.hydrilla_gen_mode == "TEXT":
            layout.prop(scene, "hydrilla_prompt", text="", icon="OUTLINER_OB_FONT")
            row = layout.row()
            row.scale_y = 1.4
            row.enabled = not busy
            row.operator("hydrilla.text_to_3d", text="Generate", icon="MESH_CUBE")
        else:
            row = layout.row(align=True)
            row.enabled = not busy
            row.operator("hydrilla.pick_image", text="Choose image", icon="IMAGE_DATA")
            if scene.hydrilla_preview and scene.hydrilla_image_path:
                layout.template_ID_preview(scene, "hydrilla_preview", rows=3, cols=4)
            layout.prop(scene, "hydrilla_image_url", text="", icon="URL")
            row = layout.row()
            row.scale_y = 1.4
            row.enabled = not busy
            row.operator("hydrilla.image_to_3d", text="Generate", icon="MESH_CUBE")

        show_status = busy or _STATUS["kind"] != "INFO" or _STATUS["text"] not in ("", "Ready")
        if not show_status:
            return

        status = layout.column(align=True)
        status.separator()
        kind = _STATUS["kind"]
        icon = "SORTTIME" if busy else ("ERROR" if kind == "ERROR" else ("CHECKMARK" if kind == "DONE" else "INFO"))
        if busy:
            header = status.row(align=True)
            phase = _STATUS["phase"] or "Working"
            percent = int(_STATUS["progress"] or 0)
            header.label(text="%s · %d%%" % (phase, percent) if percent else phase, icon=icon)
            header.label(text="%ds" % max(0, int(time.time() - float(_JOB["started_at"]))))
            status.operator("hydrilla.cancel_generate", text="Cancel", icon="X")
        else:
            lines = _wrap(_STATUS["text"], width=36)
            for index, line in enumerate(lines):
                status.label(text=line, icon=icon if index == 0 else "NONE")


class HYDRILLA_PT_tasks(_HydrillaPanel, Panel):
    bl_label = "Your models"
    bl_idname = "HYDRILLA_PT_tasks"
    bl_parent_id = "HYDRILLA_PT_main"
    bl_options = {"DEFAULT_CLOSED"}

    @classmethod
    def poll(cls, context):
        return _has_api_key(_prefs(context))

    def draw(self, context):
        layout = self.layout
        header = layout.row(align=True)
        if _TASKS["fetching"]:
            header.label(text="Loading…", icon="SORTTIME")
        elif _TASKS["fetched_at"]:
            header.label(text=_TASKS["fetched_at"])
        else:
            header.label(text="Recent")
        refresh = header.row(align=True)
        refresh.alignment = "RIGHT"
        refresh.enabled = not _TASKS["fetching"]
        refresh.operator("hydrilla.refresh_tasks", text="", icon="FILE_REFRESH")

        if _TASKS["error"]:
            for line in _wrap(_TASKS["error"], width=36):
                layout.label(text=line, icon="ERROR")
            return

        items = _TASKS["items"]
        if not items:
            if not _TASKS["fetching"]:
                layout.label(text="Nothing here yet.")
            return

        column = layout.column(align=True)
        for task in items[:VISIBLE_TASKS]:
            state = _task_state(task)
            row = column.row(align=True)
            row.label(text=_truncate(str(task.get("prompt") or ""), width=22))
            if state == "READY":
                action = row.row(align=True)
                action.enabled = not _JOB["busy"]
                action.operator("hydrilla.import_task", text="", icon="IMPORT").task_id = str(
                    task.get("id") or ""
                )
            elif state == "RUNNING":
                row.label(text="", icon="SORTTIME")
            elif state == "CANCELLED":
                row.label(text="", icon="X")
            else:
                row.label(text="", icon="ERROR")


class HYDRILLA_PT_bridge(_HydrillaPanel, Panel):
    bl_label = "Bridge"
    bl_idname = "HYDRILLA_PT_bridge"
    bl_parent_id = "HYDRILLA_PT_main"
    bl_options = {"DEFAULT_CLOSED"}

    @classmethod
    def poll(cls, context):
        """Shown while the API key is still missing, so setup stays in one place."""
        prefs = _prefs(context)
        return prefs is not None and not _has_api_key(prefs)

    def draw(self, context):
        prefs = _prefs(context)
        if prefs is None:
            return
        _draw_bridge_controls(self.layout, prefs)


def _agent_edits_allowed() -> bool:
    prefs = _prefs()
    return bool(prefs is not None and prefs.allow_agent_edits)


classes = (
    HydrillaPreferences,
    HYDRILLA_OT_use_api_base,
    HYDRILLA_OT_use_site_base,
    HYDRILLA_OT_check_updates,
    HYDRILLA_OT_update_addon,
    HYDRILLA_OT_verify_key,
    HYDRILLA_OT_edit_api_key,
    HYDRILLA_OT_remove_key,
    HYDRILLA_OT_text_to_3d,
    HYDRILLA_OT_pick_image,
    HYDRILLA_OT_image_to_3d,
    HYDRILLA_OT_cancel_generate,
    HYDRILLA_OT_refresh_tasks,
    HYDRILLA_OT_import_task,
    HYDRILLA_PT_main,
    HYDRILLA_PT_generate,
    HYDRILLA_PT_tasks,
    HYDRILLA_PT_bridge,
)

SCENE_PROPERTIES = (
    "hydrilla_prompt",
    "hydrilla_image_url",
    "hydrilla_image_path",
    "hydrilla_preview",
    "hydrilla_gen_mode",
)


def _startup():
    """Runs once after Blender has finished loading the add-on."""
    prefs = _prefs()
    if prefs is None:
        return None

    # A key saved by an earlier version may point at an API host that is gone.
    fixed_base = hydrilla_config.normalize_api_base(prefs.api_server)
    if fixed_base != prefs.api_server:
        prefs.api_server = fixed_base

    fixed_site = hydrilla_config.normalize_site_url(prefs.site_server)
    if fixed_site != prefs.site_server:
        prefs.site_server = fixed_site

    stored = hydrilla_config.stored_api_key()
    if not prefs.api_key and stored:
        # Pasted earlier in another Hydrilla plugin on this computer.
        _GUARD["key"] = True
        try:
            prefs.api_key = stored
        finally:
            _GUARD["key"] = False
    elif prefs.api_key and prefs.api_key != stored:
        try:
            hydrilla_config.save_api_key(prefs.api_key)
        except OSError as error:
            print("[Hydrilla] Could not save the API key for other tools: %s" % error)

    if _api_key():
        _ACCOUNT["state"] = ACCOUNT_UNVERIFIED
        if _background_calls_allowed():
            _start_verify()

    if (
        prefs.auto_start_bridge
        and not bridge_runtime.is_running()
        and not bpy.app.background
        and _UPDATE["state"] != UPDATE_UPDATED
    ):
        result = bridge_runtime.start()
        if not result.get("ok"):
            _set_status(str(result.get("error") or "Bridge could not start"), "ERROR")

    if (
        _background_calls_allowed()
        and _UPDATE["state"] not in (UPDATE_UPDATED, UPDATE_ERROR)
        and not addon_updater.is_dev_symlink()
    ):
        _start_update_check(
            manual=False,
            install_if_found=bool(prefs.auto_update),
        )
    return None


def register():
    # Pick up new files after reinstalling the zip without restarting Blender.
    # Order matters: each module is reloaded after the ones it imports.
    for module in (
        hydrilla_config,
        hydrilla_api,
        addon_updater,
        bridge_server,
        agent_commands,
        bridge_runtime,
    ):
        importlib.reload(module)

    bridge_runtime.register_runtime()
    bridge_runtime.set_status_hook(_set_status)
    bridge_runtime.set_agent_edits_hook(_agent_edits_allowed)
    for cls in classes:
        bpy.utils.register_class(cls)

    scene = bpy.types.Scene
    scene.hydrilla_prompt = StringProperty(
        name="Prompt",
        description="Describe the model you want",
        default="",
        maxlen=2000,
    )
    scene.hydrilla_image_url = StringProperty(
        name="Image link",
        description="An https:// link to an image",
        default="",
    )
    scene.hydrilla_image_path = StringProperty(
        name="Image file",
        default="",
        subtype="FILE_PATH",
    )
    scene.hydrilla_preview = PointerProperty(name="Preview", type=bpy.types.Image)
    scene.hydrilla_gen_mode = EnumProperty(
        name="Mode",
        items=(
            ("TEXT", "Text", "Generate from a prompt"),
            ("IMAGE", "Image", "Generate from an image"),
        ),
        default="TEXT",
    )
    bpy.types.WindowManager.hydrilla_edit_api_key = BoolProperty(
        name="Edit API key",
        description="Keep the API key field open until the new key is accepted",
        default=False,
        options={"SKIP_SAVE", "HIDDEN"},
    )

    bpy.app.timers.register(_startup, first_interval=0.5)


def unregister():
    _JOB.update(busy=False, cancel=True)
    for timer in (_startup, _pump):
        if bpy.app.timers.is_registered(timer):
            bpy.app.timers.unregister(timer)

    for name in SCENE_PROPERTIES:
        if hasattr(bpy.types.Scene, name):
            delattr(bpy.types.Scene, name)
    if hasattr(bpy.types.WindowManager, "hydrilla_edit_api_key"):
        del bpy.types.WindowManager.hydrilla_edit_api_key
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    bridge_runtime.set_status_hook(None)
    bridge_runtime.set_agent_edits_hook(None)
    bridge_runtime.unregister_runtime()
