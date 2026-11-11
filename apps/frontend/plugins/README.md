# Hydrilla plugins

Source for the Blender, Maya, 3ds Max, Unity, Unreal and Godot plugins, and the MCP server.

## How they work

- **One API key, no sign-in.** Every plugin authenticates with a `hyd_live_…` key from
  `/app/api-keys` and calls the `/v1` developer API. Nothing depends on a browser session.
- **Paste the key once.** The Python plugins save it to `~/.hydrilla/config.json` (readable
  only by the user). The other plugins and the MCP server read it from there, so a key
  pasted in Blender also works for the agent. `HYDRILLA_API_KEY` in the environment wins
  over the file for the MCP server.
- **Bridge = receive models.** Each plugin can run a small local server ("Run Bridge") so
  Hydrilla Studio (Send to DCC) and the MCP server can put a model straight into the open
  scene. The Bridge takes meshes only: no accounts, no tokens.

## Bridge

| App | Port |
|---|---|
| Blender | 7345 |
| Maya | 7346 |
| 3ds Max | 7347 |
| Unreal | 7348 |
| Unity | 7349 |
| Godot | 7350 |

One port per app, so several apps can listen at once and a sender can see which are open.

- `GET /health` → `{ "ok": true, "service": "hydrilla-bridge", "app": "blender", … }`
- `POST /import` or `/import-file` with `{ "mesh_url": "https://…" }` or
  `{ "file_base64": "…" }`, plus optional `name` and `job_id`. GLB only.

It listens on `127.0.0.1` only. A request that carries an `Origin` header (a web page) is
accepted only from Hydrilla's own sites or from a site served on this machine; everything
else gets `403`. Extra origins for development: `HYDRILLA_BRIDGE_ORIGINS=https://a,https://b`.

## Layout

| Folder | What |
|---|---|
| `shared/` | The one copy of the Python API client, config and Bridge server, plus the Qt window used by Maya and 3ds Max |
| `blender/`, `maya/`, `max/`, `unreal/` | Thin host code on top of `shared/` |
| `unity/`, `godot/` | Self-contained C# and GDScript plugins with the same behaviour |
| `mcp/` | MCP server (`hydrilla_text_to_3d`, `hydrilla_send_to_app`, `hydrilla_blender_run_python`, …) |

Edit shared Python code in `shared/` only. `pack.sh` copies it into each zip.

## Pack downloads

```bash
./pack.sh
# writes plugin zips to ../public/plugins/
```

Run it after any plugin change and commit the zips; the site serves them as static files.

## Local development

- API address: `HYDRILLA_API_BASE=http://localhost:4000`, or the Developer section of each
  plugin's settings.
- Site address for the "Get API key" link: `HYDRILLA_SITE_URL=http://localhost:3000`.
- Config folder (tests): `HYDRILLA_CONFIG_DIR=/some/temp/folder`.
