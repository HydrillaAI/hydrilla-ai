#!/usr/bin/env bash
# Build the downloadable plugin zips into public/plugins/.
#
# The Python plugins share one API client, one config module and one Bridge
# server (shared/). They are copied into each zip here, so shared/ stays the
# only place that code is edited.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/../public/plugins"
SHARED="$ROOT/shared"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"

SHARED_MODULES=(hydrilla_config.py hydrilla_api.py bridge_server.py)
# The window used by the apps that ship Qt (Maya, 3ds Max).
QT_PANEL=hydrilla_qt.py

copy_shared() {
  local dest="$1"
  local module
  for module in "${SHARED_MODULES[@]}"; do
    cp "$SHARED/$module" "$dest/"
  done
}

clean_python() {
  find "$1" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null || true
  find "$1" -name '*.pyc' -delete 2>/dev/null || true
}

# zip_dir <zip name> <top-level folder inside the zip>
zip_dir() {
  local name="$1"
  local folder="$2"
  rm -f "$OUT/$name.zip"
  TZ=UTC find "$TMP/$folder" -exec touch -h -t 202501010000.00 {} + 2>/dev/null || \
    TZ=UTC find "$TMP/$folder" -exec touch -t 202501010000.00 {} +
  (cd "$TMP" && zip -qr -X "$OUT/$name.zip" "$folder" -x '*.DS_Store')
  echo "Wrote $OUT/$name.zip"
}

# Blender: the folder name must match the add-on package name.
mkdir -p "$TMP/hydrilla_blender"
cp -R "$ROOT/blender/hydrilla_blender"/. "$TMP/hydrilla_blender"/
copy_shared "$TMP/hydrilla_blender"
clean_python "$TMP/hydrilla_blender"
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH="$TMP/hydrilla_blender" python3 - "$TMP/hydrilla_blender" <<'PY'
import json, os, sys
import addon_updater, hydrilla_config

folder = sys.argv[1]
info = {
    "addon": "hydrilla_blender",
    "version": hydrilla_config.PLUGIN_VERSION,
    "build_id": addon_updater.compute_build_id(folder),
}
with open(os.path.join(folder, addon_updater.BUILD_INFO_FILE), "w", encoding="utf-8") as fh:
    json.dump(info, fh, indent=2, sort_keys=True)
    fh.write("\n")
PY
clean_python "$TMP/hydrilla_blender"
zip_dir hydrilla-blender hydrilla_blender
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH="$TMP/hydrilla_blender" python3 - "$TMP/hydrilla_blender" "$OUT/hydrilla-blender.zip" "$OUT/hydrilla-blender.json" <<'PY'
import hashlib, json, os, sys
import addon_updater, hydrilla_config

folder, zip_path, manifest_path = sys.argv[1], sys.argv[2], sys.argv[3]
with open(zip_path, "rb") as fh:
    raw = fh.read()
manifest = {
    "addon": "hydrilla_blender",
    "version": hydrilla_config.PLUGIN_VERSION,
    "build_id": addon_updater.compute_build_id(folder),
    "sha256": hashlib.sha256(raw).hexdigest(),
    "size": len(raw),
    "zip_path": "/plugins/hydrilla-blender.zip",
}
with open(manifest_path, "w", encoding="utf-8") as fh:
    json.dump(manifest, fh, indent=2, sort_keys=True)
    fh.write("\n")
print("Wrote " + manifest_path)
PY

# Maya
mkdir -p "$TMP/hydrilla-maya"
cp "$ROOT/maya/hydrilla_maya.py" "$TMP/hydrilla-maya/"
copy_shared "$TMP/hydrilla-maya"
cp "$SHARED/$QT_PANEL" "$TMP/hydrilla-maya/"
zip_dir hydrilla-maya hydrilla-maya

# 3ds Max
mkdir -p "$TMP/hydrilla-3dsmax"
cp "$ROOT/max/hydrilla_max.py" "$TMP/hydrilla-3dsmax/"
copy_shared "$TMP/hydrilla-3dsmax"
cp "$SHARED/$QT_PANEL" "$TMP/hydrilla-3dsmax/"
zip_dir hydrilla-3dsmax hydrilla-3dsmax

# Unreal: the scripts go in the project's Content/Python folder.
mkdir -p "$TMP/hydrilla-unreal/Python"
cp "$ROOT/unreal/Hydrilla/hydrilla_unreal.py" "$TMP/hydrilla-unreal/Python/"
cp "$ROOT/unreal/Hydrilla/init_unreal.py" "$TMP/hydrilla-unreal/Python/"
copy_shared "$TMP/hydrilla-unreal/Python"
zip_dir hydrilla-unreal hydrilla-unreal

# Unity
mkdir -p "$TMP/Hydrilla/Editor"
cp "$ROOT/unity/Editor"/*.cs "$TMP/Hydrilla/Editor/"
zip_dir hydrilla-unity Hydrilla

# Godot
mkdir -p "$TMP/hydrilla-godot"
cp -R "$ROOT/godot/addons" "$TMP/hydrilla-godot/"
zip_dir hydrilla-godot hydrilla-godot

# MCP server source (the published npm package is the normal way to install it).
mkdir -p "$TMP/hydrilla-mcp"
cp -R "$ROOT/mcp/." "$TMP/hydrilla-mcp/"
rm -rf "$TMP/hydrilla-mcp/node_modules" "$TMP/hydrilla-mcp/dist" "$TMP/hydrilla-mcp/mcp.env"
zip_dir hydrilla-mcp hydrilla-mcp

echo "Done."
