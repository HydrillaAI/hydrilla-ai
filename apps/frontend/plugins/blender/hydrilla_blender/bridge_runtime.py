"""Blender side of the Hydrilla Bridge: start/stop buttons and scene import.

The server itself lives in bridge_server (shared with the other plugins). It
receives meshes on a background thread; a timer on Blender's main thread
imports them, because bpy may only be used from the main thread.
"""

import bpy
from bpy.types import Operator

from . import bridge_server

APP = "blender"
POLL_SECONDS = 0.25

_BRIDGE = bridge_server.Bridge(APP)
# Set by the add-on so imports show up in the Hydrilla panel's status line.
_HOOKS = {"status": None}


def set_status_hook(callback) -> None:
    _HOOKS["status"] = callback


def _notify(text: str, kind: str = "INFO") -> None:
    callback = _HOOKS["status"]
    if callback is not None:
        callback(text, kind)


def port() -> int:
    return _BRIDGE.port


def is_running() -> bool:
    return _BRIDGE.is_running()


def import_glb(path: str, name: str = "") -> list:
    """Import a GLB into the current scene and return the new object names."""
    if not hasattr(bpy.ops.import_scene, "gltf"):
        raise RuntimeError(
            "The glTF importer is turned off. Enable “glTF 2.0 format” in "
            "Preferences › Add-ons, then try again."
        )

    window = bpy.context.window
    if window is None:
        windows = bpy.context.window_manager.windows
        window = windows[0] if len(windows) else None

    # Timers run without an active window; the importer needs one.
    if window is not None and hasattr(bpy.context, "temp_override"):
        with bpy.context.temp_override(window=window):
            bpy.ops.import_scene.gltf(filepath=path)
            imported = list(bpy.context.selected_objects)
    else:
        bpy.ops.import_scene.gltf(filepath=path)
        imported = list(bpy.context.selected_objects)

    roots = [obj for obj in imported if obj.parent is None]
    if name and len(roots) == 1:
        roots[0].name = ("Hydrilla_%s" % name)[:60]
    return [obj.name for obj in imported]


def _import_timer():
    if not _BRIDGE.is_running():
        return None
    for item in _BRIDGE.drain():
        name = str(item.get("name") or "model")
        try:
            import_glb(str(item.get("file_path") or ""), name)
            _notify("Imported “%s” into the scene." % name, "DONE")
        except Exception as error:
            _notify("Could not import “%s”: %s" % (name, error), "ERROR")
        finally:
            _BRIDGE.discard(item)
    return POLL_SECONDS


def start() -> dict:
    result = _BRIDGE.start()
    if result.get("ok") and not bpy.app.timers.is_registered(_import_timer):
        bpy.app.timers.register(_import_timer, first_interval=POLL_SECONDS, persistent=True)
    return result


def stop() -> None:
    _BRIDGE.stop()
    if bpy.app.timers.is_registered(_import_timer):
        bpy.app.timers.unregister(_import_timer)


class HYDRILLA_OT_bridge_start(Operator):
    bl_idname = "hydrilla.bridge_start"
    bl_label = "Run Bridge"
    bl_description = (
        "Let Hydrilla Studio and your AI agent send models into this Blender scene"
    )

    def execute(self, context):
        result = start()
        if not result.get("ok"):
            message = str(result.get("error") or "Bridge could not start")
            _notify(message, "ERROR")
            self.report({"ERROR"}, message)
            return {"CANCELLED"}
        _notify("Bridge on. Models sent from Studio or your agent import here.", "INFO")
        self.report({"INFO"}, "Hydrilla Bridge is on (port %d)" % _BRIDGE.port)
        return {"FINISHED"}


class HYDRILLA_OT_bridge_stop(Operator):
    bl_idname = "hydrilla.bridge_stop"
    bl_label = "Stop Bridge"
    bl_description = "Stop receiving models from Hydrilla Studio and your AI agent"

    def execute(self, context):
        stop()
        _notify("Bridge off.", "INFO")
        self.report({"INFO"}, "Hydrilla Bridge is off")
        return {"FINISHED"}


RUNTIME_CLASSES = (
    HYDRILLA_OT_bridge_start,
    HYDRILLA_OT_bridge_stop,
)


def register_runtime() -> None:
    for cls in RUNTIME_CLASSES:
        bpy.utils.register_class(cls)


def unregister_runtime() -> None:
    stop()
    for cls in reversed(RUNTIME_CLASSES):
        bpy.utils.unregister_class(cls)
