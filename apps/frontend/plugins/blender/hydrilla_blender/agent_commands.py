"""Commands the user's AI agent can send to Blender through the Hydrilla Bridge.

bridge_runtime calls these from a timer on Blender's main thread, the only
thread allowed to touch bpy. Each one takes the command's params and returns
the reply sent back to the agent: {"ok": True, ...} or {"ok": False, "error":
"<code>", "message": "..."}.
"""

import base64
import contextlib
import io
import math
import os
import tempfile
import traceback

import bmesh
import bpy
import mathutils

SCRIPT_NAME = "<agent script>"
MAX_OUTPUT_CHARS = 20000
DEFAULT_OBJECT_LIMIT = 50
MAX_OBJECT_LIMIT = 500
DEFAULT_IMAGE_SIZE = 768
MIN_IMAGE_SIZE = 128
MAX_IMAGE_SIZE = 2000
# Object types whose bounding box is real geometry (an empty's is not).
GEOMETRY_TYPES = {"MESH", "CURVE", "SURFACE", "FONT", "META", "VOLUME", "POINTCLOUD", "CURVES"}


def _error(code, message, **extra):
    reply = {"ok": False, "error": code, "message": message}
    reply.update(extra)
    return reply


def _clamp_int(value, default, low, high):
    try:
        number = int(value)
    except (TypeError, ValueError):
        return default
    return max(low, min(high, number))


def _round3(values):
    return [round(float(value), 3) for value in values]


# --------------------------------------------------------------------------
# Context
# --------------------------------------------------------------------------


def _view3d_context():
    """Window, screen, area and region of a 3D viewport, for code that needs one.

    Timers run with no active window, and many operators refuse to run without
    one. Returns {} when Blender has no window at all (background mode).
    """
    windows = bpy.context.window_manager.windows
    for window in windows:
        screen = window.screen
        for area in screen.areas:
            if area.type != "VIEW_3D":
                continue
            region = next((r for r in area.regions if r.type == "WINDOW"), None)
            if region is not None:
                return {"window": window, "screen": screen, "area": area, "region": region}
    if len(windows):
        return {"window": windows[0], "screen": windows[0].screen}
    return {}


def _override():
    found = _view3d_context()
    # temp_override exists from Blender 3.2; older versions run with the timer's context.
    if found and hasattr(bpy.context, "temp_override"):
        return bpy.context.temp_override(**found)
    return contextlib.nullcontext()


# --------------------------------------------------------------------------
# scene_info
# --------------------------------------------------------------------------


def _descendants(obj):
    found = []
    stack = list(obj.children)
    while stack:
        child = stack.pop()
        found.append(child)
        stack.extend(child.children)
    return found


def _world_bounds(obj):
    """World-space min and max corners of obj and its children's geometry, or None."""
    corners = [
        item.matrix_world @ mathutils.Vector(corner)
        for item in [obj, *_descendants(obj)]
        if item.type in GEOMETRY_TYPES
        for corner in item.bound_box
    ]
    if not corners:
        return None
    low = [min(c[i] for c in corners) for i in range(3)]
    high = [max(c[i] for c in corners) for i in range(3)]
    return low, high


def _is_hidden(obj):
    try:
        return bool(obj.hide_get() or obj.hide_viewport)
    except RuntimeError:
        # Not in the active view layer.
        return True


def _describe(obj):
    matrix = obj.matrix_world
    info = {
        "name": obj.name,
        "type": obj.type,
        "parent": obj.parent.name if obj.parent else None,
        "location": _round3(matrix.translation),
        "rotation_deg": [round(math.degrees(angle), 2) for angle in matrix.to_euler()],
        "scale": _round3(matrix.to_scale()),
        "children": len(obj.children),
        "hidden": _is_hidden(obj),
        "collections": [collection.name for collection in obj.users_collection],
    }
    bounds = _world_bounds(obj)
    if bounds is not None:
        low, high = bounds
        info["bounds_min"] = _round3(low)
        info["bounds_max"] = _round3(high)
        info["size"] = _round3(high[i] - low[i] for i in range(3))
    if obj.type == "MESH":
        info["materials"] = [slot.material.name for slot in obj.material_slots if slot.material]
    return info


def scene_info(params):
    """Objects in the open scene with their world placement and size."""
    query = str(params.get("query") or "").strip().lower()
    root_name = str(params.get("root") or "").strip()
    limit = _clamp_int(params.get("limit"), DEFAULT_OBJECT_LIMIT, 1, MAX_OBJECT_LIMIT)

    with _override():
        scene = bpy.context.scene
        view_layer = bpy.context.view_layer
        # matrix_world is stale until the dependency graph has been evaluated.
        view_layer.update()

        if root_name:
            root = scene.objects.get(root_name)
            if root is None:
                return _error("not_found", "No object named %r in scene %r." % (root_name, scene.name))
            candidates = [root, *_descendants(root)]
            listing = "%s and everything under it" % root_name
        elif query:
            candidates = [obj for obj in scene.objects if query in obj.name.lower()]
            listing = "objects whose name contains %r" % query
        else:
            candidates = [obj for obj in scene.objects if obj.parent is None]
            listing = "top-level objects (pass root to see one object's children)"

        selected = [obj.name for obj in scene.objects if obj.select_get(view_layer=view_layer)]
        active = view_layer.objects.active
        return {
            "ok": True,
            "scene": scene.name,
            "file": bpy.data.filepath or "(not saved yet)",
            "mode": bpy.context.mode,
            "unit_scale": scene.unit_settings.scale_length,
            "frame": scene.frame_current,
            "object_count": len(scene.objects),
            "active": active.name if active else None,
            "selected": selected[:50],
            "listing": listing,
            "total_matching": len(candidates),
            "shown": min(limit, len(candidates)),
            "objects": [_describe(obj) for obj in candidates[:limit]],
        }


# --------------------------------------------------------------------------
# run_python
# --------------------------------------------------------------------------


def _truncate(text):
    if len(text) <= MAX_OUTPUT_CHARS:
        return text
    hidden = len(text) - MAX_OUTPUT_CHARS
    return text[:MAX_OUTPUT_CHARS] + "\n… (%d more characters not shown; print less)" % hidden


def _script_traceback(error, code):
    """The traceback limited to the agent's own lines, with each line's source."""
    source = code.splitlines()
    lines = ["Traceback (most recent call last):"]
    for frame in traceback.extract_tb(error.__traceback__):
        if frame.filename != SCRIPT_NAME:
            continue
        lines.append('  line %d, in %s' % (frame.lineno, frame.name))
        if frame.lineno and 0 < frame.lineno <= len(source):
            lines.append("    " + source[frame.lineno - 1].strip())
    lines.extend(line.rstrip("\n") for line in traceback.format_exception_only(type(error), error))
    return "\n".join(lines)


def _push_undo():
    """Make the script one step the user can undo with Ctrl+Z."""
    try:
        with _override():
            bpy.ops.ed.undo_push(message="Hydrilla agent script")
    except Exception:
        # No window (background mode) or undo is off; the change itself stands.
        pass


def run_python(params):
    """Run the agent's Python in this Blender session and return what it printed."""
    code = params.get("code")
    if not isinstance(code, str) or not code.strip():
        return _error("bad_request", "code must be a non-empty string of Python.")

    try:
        compiled = compile(code, SCRIPT_NAME, "exec")
    except SyntaxError as error:
        return _error("syntax_error", str(error), traceback=_script_traceback(error, code))

    namespace = {
        "__name__": "__hydrilla_agent__",
        "bpy": bpy,
        "bmesh": bmesh,
        "mathutils": mathutils,
        "Vector": mathutils.Vector,
        "Matrix": mathutils.Matrix,
        "Euler": mathutils.Euler,
        "math": math,
    }
    output = io.StringIO()
    failure = None
    with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
        try:
            with _override():
                exec(compiled, namespace)
        except (Exception, SystemExit) as error:
            failure = error
    _push_undo()

    printed = _truncate(output.getvalue())
    if failure is not None:
        return _error(
            "script_error",
            "%s: %s" % (type(failure).__name__, failure),
            traceback=_script_traceback(failure, code),
            output=printed,
        )
    return {"ok": True, "output": printed}


# --------------------------------------------------------------------------
# screenshot
# --------------------------------------------------------------------------


def _scaled(width, height, max_size):
    if max(width, height) <= max_size:
        return width, height
    factor = max_size / max(width, height)
    return max(1, int(width * factor)), max(1, int(height * factor))


def _save_pixels_png(pixels, width, height, path):
    image = bpy.data.images.new("hydrilla_agent_view", width, height, alpha=True)
    try:
        image.pixels.foreach_set(pixels)
        image.filepath_raw = path
        image.file_format = "PNG"
        image.save()
    finally:
        bpy.data.images.remove(image)


def _offscreen_capture(found, max_size, path):
    """Draw the viewport into an offscreen buffer.

    Unlike a window grab, this works when Blender is behind other windows.
    """
    import gpu
    import numpy

    space = found["area"].spaces.active
    region = found["region"]
    view = space.region_3d
    width, height = _scaled(region.width, region.height, max_size)

    offscreen = gpu.types.GPUOffScreen(width, height)
    try:
        offscreen.draw_view3d(
            bpy.context.scene,
            bpy.context.view_layer,
            space,
            region,
            view.view_matrix,
            view.window_matrix,
            do_color_management=True,
        )
        buffer = offscreen.texture_color.read()
    finally:
        offscreen.free()

    buffer.dimensions = width * height * 4
    pixels = numpy.asarray(buffer, dtype=numpy.float32)
    # An 8-bit texture reads back as 0..255; Blender images take 0..1.
    if pixels.size and float(pixels.max()) > 1.0:
        pixels = pixels / 255.0
    # The viewport background can come back transparent.
    pixels = pixels.reshape(-1, 4)
    pixels[:, 3] = 1.0
    _save_pixels_png(pixels.ravel(), width, height, path)
    return width, height


def _window_capture(found, max_size, path):
    """Grab the viewport's pixels from the window (black if Blender is hidden)."""
    with bpy.context.temp_override(window=found["window"], area=found["area"]):
        bpy.ops.screen.screenshot_area(filepath=path)
    image = bpy.data.images.load(path)
    try:
        width, height = _scaled(image.size[0], image.size[1], max_size)
        if (width, height) != tuple(image.size):
            image.scale(width, height)
            image.filepath_raw = path
            image.file_format = "PNG"
            image.save()
    finally:
        bpy.data.images.remove(image)
    return width, height


def screenshot(params):
    """A PNG of the 3D viewport as the user sees it."""
    max_size = _clamp_int(params.get("max_size"), DEFAULT_IMAGE_SIZE, MIN_IMAGE_SIZE, MAX_IMAGE_SIZE)
    found = _view3d_context()
    if "area" not in found:
        return _error("no_viewport", "No 3D viewport is open in Blender. Open one and try again.")

    descriptor, path = tempfile.mkstemp(prefix="hydrilla-view-", suffix=".png")
    os.close(descriptor)
    try:
        try:
            width, height = _offscreen_capture(found, max_size, path)
            method = "offscreen"
        except Exception as offscreen_error:
            print("[Hydrilla] Offscreen viewport capture failed (%s); grabbing the window." % offscreen_error)
            if not hasattr(bpy.context, "temp_override"):
                return _error("capture_failed", "Could not capture the viewport: %s" % offscreen_error)
            width, height = _window_capture(found, max_size, path)
            method = "window"
        with open(path, "rb") as handle:
            data = handle.read()
    except Exception as error:
        return _error("capture_failed", "Could not capture the viewport: %s" % error)
    finally:
        try:
            os.remove(path)
        except OSError:
            pass

    return {
        "ok": True,
        "mime_type": "image/png",
        "image_base64": base64.b64encode(data).decode("ascii"),
        "width": width,
        "height": height,
        "method": method,
    }


HANDLERS = {
    "scene_info": scene_info,
    "run_python": run_python,
    "screenshot": screenshot,
}
