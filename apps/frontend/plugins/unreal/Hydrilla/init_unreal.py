"""Unreal runs this file on editor start when it is in Content/Python."""

import hydrilla_unreal

try:
    hydrilla_unreal.install_menu()
except Exception as error:
    # The menu is a convenience; the Python functions work without it.
    print("[Hydrilla] Menu not installed: %s" % error)
