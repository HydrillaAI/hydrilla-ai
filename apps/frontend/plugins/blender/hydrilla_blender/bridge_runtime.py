"""Blender side of the Hydrilla Bridge: start/stop buttons, scene import and agent commands.

The server itself lives in bridge_server (shared with the other plugins). It
receives meshes and agent commands on background threads; a timer on
Blender's main thread imports the meshes and runs the commands, because bpy
may only be used from the main thread.
"""

import bpy
from bpy.types import Operator

from . import agent_commands
from . import bridge_server

APP = "blender"
POLL_SECONDS = 0.25
# Commands that change the scene; the rest only read it.
EDIT_COMMANDS = {"run_python"}

_BRIDGE = bridge_server.Bridge(APP)
_BRIDGE.enable_commands(sorted(agent_commands.HANDLERS))
# Set by the add-on: "status" shows events in the Hydrilla panel's status line,
# "agent_edits_allowed" returns whether the user lets the agent change the scene.
_HOOKS = {"status": None, "agent_edits_allowed": None}

AGENT_EDITS_OFF_MESSAGE = (
    "The user has not allowed AI agents to edit this Blender scene. Ask them to turn on "
    "“Let AI agent edit this scene” in Blender (press N in the 3D viewport, "
    "Hydrilla tab, Bridge section), then run the script again."
)


def set_status_hook(callback) -> None:
    _HOOKS["status"] = callback


def set_agent_edits_hook(callback) -> None:
    _HOOKS["agent_edits_allowed"] = callback


def _agent_edits_allowed() -> bool:
    callback = _HOOKS["agent_edits_allowed"]
    return bool(callback is not None and callback())


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


def _run_command(kind: str, params: dict) -> dict:
    if kind in EDIT_COMMANDS and not _agent_edits_allowed():
        _notify("Your AI agent asked to edit the scene. Turn on “Let AI agent edit this scene” to allow it.", "ERROR")
        return {"ok": False, "error": "agent_edits_off", "message": AGENT_EDITS_OFF_MESSAGE}
    handler = agent_commands.HANDLERS.get(kind)
    if handler is None:
        return {"ok": False, "error": "unknown_command", "message": "Unknown command %r." % kind}
    try:
        reply = handler(params)
    except Exception as error:
        return {"ok": False, "error": "command_failed", "message": "%s: %s" % (type(error).__name__, error)}
    if kind in EDIT_COMMANDS:
        if reply.get("ok"):
            _notify("Your AI agent ran a script in this scene (Ctrl+Z undoes it).", "DONE")
        else:
            _notify("Your AI agent's script failed: %s" % reply.get("message", ""), "ERROR")
    return reply


def _import_timer():
    if not _BRIDGE.is_running():
        return None
    for command in _BRIDGE.take_commands():
        reply = _run_command(command["type"], command["params"])
        _BRIDGE.finish_command(command, reply)
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
        if result.get("commands_error"):
            _notify(str(result["commands_error"]), "ERROR")
        else:
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
