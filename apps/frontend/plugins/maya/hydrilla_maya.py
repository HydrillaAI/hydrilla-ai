"""Hydrilla for Maya.

Install: unzip, put the folder on Maya's script path (or anywhere on
PYTHONPATH), then run in the Script Editor (Python tab):

    import hydrilla_maya
    hydrilla_maya.show()

Paste your API key in the window. Sign-in is not needed.
"""

from __future__ import annotations

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
# Next to this file in the downloaded zip; in ../shared in the source tree.
for _folder in (_HERE, os.path.abspath(os.path.join(_HERE, "..", "shared"))):
    if os.path.isdir(_folder) and _folder not in sys.path:
        sys.path.insert(0, _folder)

try:
    import maya.cmds as cmds
except ImportError:
    cmds = None

GLTF_FILE_TYPES = ("glTF", "GLTF", "glb")


class MayaHost:
    app = "maya"
    title = "Hydrilla"

    def main_window(self):
        try:
            import maya.OpenMayaUI as omui

            try:
                from PySide6 import QtWidgets
                from shiboken6 import wrapInstance
            except ImportError:
                from PySide2 import QtWidgets
                from shiboken2 import wrapInstance
            pointer = omui.MQtUtil.mainWindow()
            if pointer is None:
                return None
            return wrapInstance(int(pointer), QtWidgets.QWidget)
        except Exception:
            # Without a parent the panel is simply a free-floating window.
            return None

    def import_glb(self, path: str, name: str) -> str:
        if cmds is None:
            raise RuntimeError("Run this inside Maya")
        for file_type in GLTF_FILE_TYPES:
            try:
                cmds.file(
                    path,
                    i=True,
                    type=file_type,
                    ignoreVersion=True,
                    mergeNamespacesOnClash=False,
                    namespace="Hydrilla",
                )
                return "Imported “%s” into the scene." % name
            except Exception:
                # This Maya has no importer registered under that name; try the next.
                continue
        return (
            "Saved to %s. This Maya has no glTF importer: install a glTF import "
            "plug-in, or convert the file to FBX." % path
        )


def show():
    """Open the Hydrilla window."""
    if cmds is None:
        raise RuntimeError("Run this inside Maya")
    import hydrilla_qt

    return hydrilla_qt.show_panel(MayaHost())


if __name__ == "__main__":
    show()
