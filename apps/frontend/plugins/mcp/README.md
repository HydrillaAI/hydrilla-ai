# Hydrilla MCP Server

Stdio MCP server for the Hydrilla developer API. Shared across Cursor, Claude Code, and other MCP clients via project-root `.mcp.json` (not under `.cursor/`).

## Build

```bash
cd apps/frontend/plugins/mcp
pnpm install   # or npm install
pnpm run build # or npm run build
```

## Secrets

```bash
cp mcp.env.example mcp.env
# edit mcp.env — never commit mcp.env
```

| Variable | Required | Purpose |
|---|---|---|
| `HYDRILLA_API_KEY` | No, if a plugin has the key | `hyd_live_…` from `/app/api-keys`. When unset, the server uses the key pasted into a Hydrilla plugin (`~/.hydrilla/config.json`), read on every call |
| `HYDRILLA_API_BASE` | No | Defaults to production backend |
| `POSTHOG_PROJECT_TOKEN` | Recommended | `phc_…` for MCP Analytics |
| `POSTHOG_HOST` | No | Defaults to `https://us.i.posthog.com` |

## Project MCP config (any AI)

The committed config (no secrets) is `.mcp.json` at the repo root. It points at `dist/index.js` with a path relative to that folder. The server loads `mcp.env` from its own directory. Do not use `${workspaceFolder}` or `envFile` here: Claude Code does not expand that variable and does not read `envFile`.

The fastest setup is to paste this into any agent: `Read and follow https://hydrilla.ai/agent-onboarding/SKILL.md`.

Public install by hand (same flow as the MCP page). The npm package is `hydrilla-mcp` (Node.js 20+). Replace `hyd_live_…` with a key from `/app/api-keys`. The key stays in the client config, not in chat.

Claude Code (macOS / Linux):

```bash
claude mcp add -s user hydrilla --env HYDRILLA_API_KEY=hyd_live_… -- npx -y hydrilla-mcp@latest
```

Claude Code (Windows):

```bash
claude mcp add -s user hydrilla --env HYDRILLA_API_KEY=hyd_live_… "--" cmd /c npx -y hydrilla-mcp@latest
```

Codex:

```bash
codex mcp add hydrilla --env HYDRILLA_API_KEY=hyd_live_… -- npx -y hydrilla-mcp@latest
```

Cursor: open the install link from `/integrations/mcp`, or paste this into `~/.cursor/mcp.json` and turn `hydrilla` on:

```json
{
  "mcpServers": {
    "hydrilla": {
      "command": "npx",
      "args": ["-y", "hydrilla-mcp@latest"],
      "env": {
        "HYDRILLA_API_KEY": "hyd_live_…"
      }
    }
  }
}
```

Local checkout of this repo:

```json
{
  "mcpServers": {
    "hydrilla": {
      "command": "node",
      "args": ["apps/frontend/plugins/mcp/dist/index.js"]
    }
  }
}
```

The path is relative to the folder that contains `.mcp.json`. The server reads `mcp.env` beside itself, so the key is not written into this file.

## Tools

| Tool | What it does |
|---|---|
| `hydrilla_me` | Plan and credit balance. Free. |
| `hydrilla_text_to_3d` | Generate a GLB from a prompt. `send_to` places it in an open app. |
| `hydrilla_image_to_3d` | Generate a GLB from an image URL. `send_to` places it in an open app. |
| `hydrilla_get_task` | Waits up to ~45 s on one task, then returns status, progress and mesh URL. `send_to` places it in an app once ready. |
| `hydrilla_list_tasks` | Recent models on the account. Free. |
| `hydrilla_cancel_task` | Stop a running task; unused credits are refunded. |
| `hydrilla_list_apps` | Which apps have their Bridge running right now. |
| `hydrilla_send_to_app` | Put an existing model into Blender, Unity, Unreal, Godot, Maya or 3ds Max. Free. |
| `hydrilla_blender_scene_info` | Objects in the open Blender scene with world location, rotation, scale and bounding-box size. Read-only. |
| `hydrilla_blender_run_python` | Run Python (`bpy`) in the open Blender session and return what it printed. Needs the user's permission in the add-on. |
| `hydrilla_blender_screenshot` | The Blender 3D viewport as an image. Read-only. |

## Building a scene in Blender

With the Blender add-on 2.1+ and its Bridge running, the agent can also see and change the
open scene, the same way the community `mcp-for-blender` server works, but through the one
Hydrilla Bridge (no second server or port):

1. `hydrilla_blender_scene_info` lists what is in the scene and how big it is.
2. `hydrilla_blender_run_python` runs a script on Blender's main thread. Each script is one
   Ctrl+Z step.
3. `hydrilla_blender_screenshot` returns the viewport so the agent can check the result.

Scripts only run after the user turns on **Let AI agent edit this scene** in the add-on's
Bridge panel (off by default). Reading the scene and the viewport needs no extra permission.

The command endpoint (`POST /command`) is stricter than `/import`:

- It refuses every request that carries `Origin` or `Sec-Fetch-Site`, so no web page can send
  one, including Hydrilla's own sites.
- Each request needs the `X-Hydrilla-Token` header. The add-on writes a fresh random token to
  `~/.hydrilla/bridge/blender.token` (mode 600) each time the Bridge starts and deletes it when
  the Bridge stops. This server reads it on every call.

## Sending models into an app

Each Hydrilla plugin has a **Run Bridge** button that listens on its own local port
(Blender 7345, Maya 7346, 3ds Max 7347, Unreal 7348, Unity 7349, Godot 7350). With the
Bridge running, `send_to: "blender"` on a generate tool, or `hydrilla_send_to_app`, makes
the plugin download the GLB and import it into the open scene. If the Bridge is off, the
tool says which button to click and the model can be sent again without regenerating.

A model takes 10 to 20 minutes to generate. No tool call stays open longer than about a
minute: a generate call returns the task id with the progress so far, and the agent calls
`hydrilla_get_task` (which waits up to ~45 seconds per call) until the model is ready, telling
the user the progress in between. Calls also send progress notifications to clients that ask
for them. Hydrilla fails and refunds a task that runs longer than 20 minutes.
