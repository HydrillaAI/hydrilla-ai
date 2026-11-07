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
| `HYDRILLA_API_KEY` | Yes | `hyd_live_…` from `/app/api-keys` |
| `HYDRILLA_API_BASE` | No | Defaults to production backend |
| `POSTHOG_PROJECT_TOKEN` | Recommended | `phc_…` for MCP Analytics |
| `POSTHOG_HOST` | No | Defaults to `https://us.i.posthog.com` |

## Project MCP config (any AI)

Committed configs (no secrets):

- Workspace root: `Hydrilla_all/.mcp.json`
- Repo root: `hydrilla-ai/.mcp.json`

Both point at `dist/index.js` and load `mcp.env`.

Manual client config if needed:

```json
{
  "mcpServers": {
    "hydrilla": {
      "command": "node",
      "args": ["/absolute/path/to/plugins/mcp/dist/index.js"],
      "envFile": "/absolute/path/to/plugins/mcp/mcp.env"
    }
  }
}
```

## Tools

`hydrilla_me`, `hydrilla_text_to_3d`, `hydrilla_image_to_3d`, `hydrilla_get_task`
