"""Hydrilla for 3ds Max.

Install: unzip, then in Max choose Scripting > Run Script and pick this file.
To open it again later, run in the Python listener:

    import hydrilla_max
    hydrilla_max.show()

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
    from pymxs import runtime as rt
except ImportError:
    rt = None


class MaxHost:
    app = "3dsmax"
    title = "Hydrilla"

    def main_window(self):
        try:
            import qtmax

            return qtmax.GetQMaxMainWindow()
        except Exception:
            # Without a parent the panel is simply a free-floating window.
            return None

    def import_glb(self, path: str, name: str) -> str:
        if rt is None:
            raise RuntimeError("Run this inside 3ds Max")
        imported = False
        try:
            imported = bool(rt.importFile(path, rt.Name("noPrompt")))
        except Exception:
            imported = False
        if imported:
            return "Imported “%s” into the scene." % name
        return (
            "Saved to %s. This 3ds Max version cannot import glTF directly: "
            "use a glTF importer, or convert the file to FBX." % path
        )


def show():
    """Open the Hydrilla window."""
    if rt is None:
        raise RuntimeError("Run this inside 3ds Max")
    import hydrilla_qt

    return hydrilla_qt.show_panel(MaxHost())


if __name__ == "__main__":
    show()
