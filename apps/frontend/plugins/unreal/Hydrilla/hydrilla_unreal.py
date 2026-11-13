"""Hydrilla for Unreal Editor (Python).

Install
  1. Enable Edit > Plugins > "Python Editor Script Plugin" and restart.
  2. Unzip, then copy the contents of the Python folder into
     <YourProject>/Content/Python/ and restart the editor.
  3. A "Hydrilla" menu appears in the main menu bar.

API key
  Paste it once in any other Hydrilla plugin, or set the HYDRILLA_API_KEY
  environment variable, or run in the Python console:
      import hydrilla_unreal; hydrilla_unreal.set_api_key("hyd_live_…")

Generate (Python console)
      hydrilla_unreal.generate_text("a sci-fi crate")
      hydrilla_unreal.generate_image("https://example.com/chair.png")

Models are imported into /Game/Hydrilla. Sign-in is not needed.
"""

from __future__ import annotations

import os
import queue
import sys
import threading
import webbrowser

_HERE = os.path.dirname(os.path.abspath(__file__))
# Next to this file in the downloaded zip; in ../../shared in the source tree.
for _folder in (_HERE, os.path.abspath(os.path.join(_HERE, "..", "..", "shared"))):
    if os.path.isdir(_folder) and _folder not in sys.path:
        sys.path.insert(0, _folder)

import bridge_server  # noqa: E402
import hydrilla_api as api  # noqa: E402
import hydrilla_config as config  # noqa: E402

try:
    import unreal
except ImportError:
    unreal = None

APP = "unreal"
CONTENT_PATH = "/Game/Hydrilla"
MENU_OWNER = "Hydrilla"

_BRIDGE = bridge_server.Bridge(APP)
# Results from worker threads, applied on the editor's main thread by _tick.
_RESULTS = queue.Queue()
_STATE = {"tick": None, "busy": False, "cancel": False}


def _log(message: str, error: bool = False) -> None:
    if unreal is None:
        print("[Hydrilla] %s" % message)
    elif error:
        unreal.log_error("[Hydrilla] %s" % message)
    else:
        unreal.log("[Hydrilla] %s" % message)


def _require_editor() -> None:
    if unreal is None:
        raise RuntimeError("Run this inside Unreal Editor")


def _models_dir() -> str:
    folder = os.path.join(unreal.Paths.project_saved_dir(), "Hydrilla")
    os.makedirs(folder, exist_ok=True)
    return folder


def import_glb(path: str, name: str = "") -> list:
    """Import a GLB into /Game/Hydrilla. Must run on the editor's main thread."""
    _require_editor()
    task = unreal.AssetImportTask()
    task.set_editor_property("filename", path)
    task.set_editor_property("destination_path", CONTENT_PATH)
    if name:
        task.set_editor_property("destination_name", "Hydrilla_%s" % api.safe_stem(name).replace("-", "_"))
    task.set_editor_property("automated", True)
    task.set_editor_property("replace_existing", True)
    task.set_editor_property("save", True)
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    imported = [str(item) for item in (task.get_editor_property("imported_object_paths") or [])]
    if imported:
        _log("Imported %s" % ", ".join(imported))
    else:
        _log(
            "The model was saved to %s but Unreal did not import it. Enable the "
            "glTF importer (Interchange) and import the file from there." % path,
            error=True,
        )
    return imported


def _tick(_delta_seconds: float) -> None:
    """Runs every editor frame while Hydrilla has work: apply finished results."""
    for item in _BRIDGE.drain():
        try:
            import_glb(str(item.get("file_path") or ""), str(item.get("name") or "model"))
        except Exception as error:
            _log("Could not import the model sent to Unreal: %s" % error, error=True)
        finally:
            _BRIDGE.discard(item)

    while True:
        try:
            result = _RESULTS.get_nowait()
        except queue.Empty:
            break
        if result.get("log"):
            _log(str(result["log"]), error=bool(result.get("error")))
        if result.get("path"):
            try:
                import_glb(str(result["path"]), str(result.get("name") or ""))
            except Exception as error:
                _log("Generated, but the import failed: %s" % error, error=True)

    if not _BRIDGE.is_running() and not _STATE["busy"] and _RESULTS.empty():
        _stop_tick()


def _start_tick() -> None:
    if _STATE["tick"] is None:
        _STATE["tick"] = unreal.register_slate_post_tick_callback(_tick)


def _stop_tick() -> None:
    if _STATE["tick"] is not None:
        unreal.unregister_slate_post_tick_callback(_STATE["tick"])
        _STATE["tick"] = None


def set_api_key(key: str) -> None:
    """Save the API key for every Hydrilla tool on this computer and check it."""
    cleaned = config.clean_api_key(key)
    if cleaned and not config.looks_like_api_key(cleaned):
        raise ValueError("That does not look like a Hydrilla key (hyd_live_…).")
    config.save_api_key(cleaned)
    if cleaned:
        check_api_key()
    else:
        _log("API key removed from this computer.")


def check_api_key() -> None:
    """Check the key and log the credit balance. Free."""
    try:
        remaining = api.HydrillaClient().credits_remaining()
    except api.HydrillaApiError as error:
        _log(str(error), error=True)
        return
    _log("Connected" if remaining is None else "Connected · %d credits" % remaining)


def open_api_keys_page() -> None:
    webbrowser.open(config.api_keys_url())


def start_bridge() -> bool:
    """Let Hydrilla Studio and your AI agent send models into this project."""
    _require_editor()
    result = _BRIDGE.start()
    if not result.get("ok"):
        _log(str(result.get("error") or "Bridge could not start."), error=True)
        return False
    _start_tick()
    _log("Bridge on (port %d). Models sent to Unreal import into %s." % (_BRIDGE.port, CONTENT_PATH))
    return True


def stop_bridge() -> None:
    _BRIDGE.stop()
    _log("Bridge off.")


def cancel() -> None:
    """Stop the running generation. Unused credits are refunded."""
    if _STATE["busy"]:
        _STATE["cancel"] = True
        _log("Cancelling…")


def _generate(name: str, **source) -> None:
    _require_editor()
    if _STATE["busy"]:
        _log("A model is already generating.", error=True)
        return
    client = api.HydrillaClient()
    if not client.api_key:
        _log(api.NO_KEY_MESSAGE, error=True)
        return
    dest_dir = _models_dir()
    _STATE.update(busy=True, cancel=False)
    _start_tick()

    def worker() -> None:
        last = {"message": ""}

        def report(message: str) -> None:
            # Progress repeats every two seconds; log each distinct line once.
            if message != last["message"]:
                last["message"] = message
                _RESULTS.put({"log": message})

        try:
            path = api.generate_and_download(
                client,
                on_status=report,
                should_cancel=lambda: bool(_STATE["cancel"]),
                dest_dir=dest_dir,
                **source
            )
            _RESULTS.put({"path": path, "name": name})
        except api.HydrillaApiError as error:
            if error.kind == api.ERROR_CANCELLED:
                _RESULTS.put({"log": "Cancelled. Unused credits are refunded."})
            else:
                _RESULTS.put({"log": str(error), "error": True})
        except Exception as error:
            _RESULTS.put({"log": str(error), "error": True})
        finally:
            _STATE.update(busy=False, cancel=False)

    threading.Thread(target=worker, name="hydrilla-generate", daemon=True).start()
    _log("Generating… progress appears in the Output Log.")


def generate_text(prompt: str) -> None:
    """Generate a model from a prompt and import it into /Game/Hydrilla."""
    text = (prompt or "").strip()
    if not text:
        raise ValueError("Enter a prompt")
    _generate(text[:24], prompt=text)


def generate_image(source: str) -> None:
    """Generate a model from an image link or a local image file."""
    value = (source or "").strip()
    if value.startswith("https://") or value.startswith("http://"):
        _generate("image", image_url=value)
    elif value and os.path.isfile(value):
        _generate(os.path.splitext(os.path.basename(value))[0][:24], image_path=value)
    else:
        raise ValueError("Give an https:// image link or the path of an image file")


def show_help() -> None:
    _log(
        "Generate from the Python console: "
        "import hydrilla_unreal; hydrilla_unreal.generate_text('a sci-fi crate'). "
        "Set a key with hydrilla_unreal.set_api_key('hyd_live_…')."
    )


MENU_ENTRIES = (
    ("RunBridge", "Run Bridge", "Receive models from Hydrilla Studio and your AI agent", "start_bridge()"),
    ("StopBridge", "Stop Bridge", "Stop receiving models", "stop_bridge()"),
    ("CheckKey", "Check API key", "Check the key and show your credit balance", "check_api_key()"),
    ("GetKey", "Get API key…", "Open the API keys page in your browser", "open_api_keys_page()"),
    ("Cancel", "Cancel generation", "Stop the running generation", "cancel()"),
    ("Help", "How to generate", "Show the Python commands in the Output Log", "show_help()"),
)


def install_menu() -> None:
    """Add the Hydrilla menu to the editor's main menu bar."""
    _require_editor()
    menus = unreal.ToolMenus.get()
    main_menu = menus.find_menu("LevelEditor.MainMenu")
    if not main_menu:
        _log("Could not find the editor main menu; use the Python console instead.", error=True)
        return
    submenu = main_menu.add_sub_menu(MENU_OWNER, "Hydrilla", "Hydrilla", "Hydrilla")
    for name, label, tooltip, call in MENU_ENTRIES:
        entry = unreal.ToolMenuEntry(name="Hydrilla%s" % name, type=unreal.MultiBlockType.MENU_ENTRY)
        entry.set_label(label)
        entry.set_tool_tip(tooltip)
        entry.set_string_command(
            unreal.ToolMenuStringCommandType.PYTHON,
            "",
            "import hydrilla_unreal; hydrilla_unreal.%s" % call,
        )
        submenu.add_menu_entry("Hydrilla", entry)
    menus.refresh_all_widgets()
