# 08 · Developer API and integrations

There are three ways to use Hydrilla outside the web app: the **REST API** (`/v1`), the **MCP server**, and the **DCC plugins**. All of them charge the same credits as the app.

## REST API (`/v1`)

Code: `apps/backend/src/routes/v1/developerApi.ts`. It is mounted at both `/v1` and `/api/v1` in `apps/backend/api/index.ts`.

| Method | Path | Credits |
|---|---|---|
| POST | `/v1/3d/image-to-3d` | 30 (`CREDITS_3D`) |
| POST | `/v1/3d/text-to-3d` | 30 plus image credits (15/30) |
| POST | `/v1/images/generate` | 15 / 30 |
| POST | `/v1/images/edit` | 15 / 30 |
| GET | `/v1/3d/tasks/:taskId` (alias `/v1/tasks/:taskId`) | — (a task still `WAIT`/`RUN` after 20 min is marked failed and refunded when it is read) |
| DELETE | `/v1/3d/tasks/:taskId` (alias `/v1/tasks/:taskId`) | Refunds if the task is still running |
| GET | `/v1/models` | — |
| GET | `/v1/user/me` | — |

The API reuses the internals described in [05](05-CLOUD-GENERATION.md): the same GPU gateway, `deductCredit`/`refundCredit` and the hourly-plan check (`slotGenerationBlock`). It does **not** offer Water.

### API keys

- **Created** in the app under `/app/api-keys` through `/api/user/developer-keys` (GET, POST, DELETE; `apps/backend/src/routes/user.ts`).
- **Format:** `hyd_live_<random hex>`. The plain key is shown **once**; only its SHA-256 hash is stored (`hashApiKey` in `apps/backend/src/repository/developerApiKeys.ts`, table `developer_api_keys`).
- **Auth:** send `Authorization: Bearer hyd_live_…` or `x-api-key: hyd_live_…` (`apps/backend/src/middleware/developerAuth.ts`).
- **Zero credits:** the middleware returns **402** before the route runs.
- **Usage:** each call is logged to `developer_api_key_usage` (`trackKeyUsage` → `record_developer_key_usage`).
- **Rate limits:** none yet ([03 gap #3](03-SECURITY.md#known-gaps)).

### Public docs site (`apps/docs`)

- Next.js 15 site for API users (`docs.hydrilla.ai` per `apps/docs/lib/site.ts`; the backend README still says `.co`).
- **Content is TypeScript data, not MDX:**
  - Nav and endpoint specs: `apps/docs/lib/docsData.ts`.
  - Changelog: `apps/docs/lib/changelog.ts`, also published as an RSS feed.
  - Search index: `apps/docs/lib/searchIndex.ts`.
- **Pages:**
  - `/introduction`, `/quickstart`, `/authentication`, `/models`, `/changelog`, `/sdks/python`, `/sdks/typescript`.
  - Endpoint pages are generated from `apps/docs/app/api/[endpoint]/page.tsx`.
- **OpenAPI 3.1 spec:** `apps/docs/public/openapi.json`. **Update it, along with `docsData.ts`, whenever `/v1` changes.**
- **"Try it" console:** proxies through `apps/docs/app/api/proxy/route.ts` to `HYDRILA_API_BASE` (default `https://api.hydrilla.co`, env name spelled with one L).
- **Stubs:** the feedback and status routes don't do anything yet. The "Ask AI" sheet returns fixed answers and doesn't call an LLM.
- `llms.txt`, `llms-full.txt`, a sitemap and robots are generated in `apps/docs/app/`.
- The marketing page for the API is `apps/frontend/app/api/page.tsx`. Despite the folder name, it is not an API route.

## MCP server

`apps/frontend/plugins/mcp`, package `@hydrilla/mcp-server`, source in `apps/frontend/plugins/mcp/src/index.ts`.

- A stdio MCP server that wraps the REST API with a `hyd_live_` key (`HYDRILLA_API_KEY`).
- **Tools:** `hydrilla_me`, `hydrilla_text_to_3d`, `hydrilla_image_to_3d`, `hydrilla_get_task`.
- Setup for Cursor and Claude Code is in `apps/frontend/plugins/mcp/README.md`. The marketing page is `apps/frontend/app/integrations/mcp`.

## DCC plugins and the Bridge

Source: `apps/frontend/plugins/` (`blender`, `maya`, `max`, `unity`, `unreal`, `godot`, plus `bridge` and `shared`).

- **Packaging:** `apps/frontend/plugins/pack.sh` writes downloadable zips to `apps/frontend/public/plugins/`.
- **Bridge:** a local HTTP daemon on `127.0.0.1:7345` that lets the web Studio "Send to DCC". It is embedded in each plugin (Bridge ON/OFF); the reference implementation is `apps/frontend/plugins/bridge/hydrilla_bridge.py`.
  - Endpoints: `/health`, `/register`, `/import`, `/pending`, `/ack`.
  - Its CORS is open to localhost Studio pages.
- **Sign-in:** the plugin opens `/integrations/connect` (Clerk) and receives a session. It then calls the Studio routes `/api/3d/*`, and can fall back to a `hyd_live_` key on `/v1`.
- **Shared client code:** `apps/frontend/plugins/shared/` (e.g. `hydrilla_bridge_client.py`).
- **Marketing pages:** `apps/frontend/app/integrations/{blender,unity,unreal,godot}`.

## Changing the public API

1. Make the change in `apps/backend/src/routes/v1/developerApi.ts`. Don't make breaking changes to existing fields; add new ones instead.
2. Update `apps/docs/public/openapi.json` and `apps/docs/lib/docsData.ts`, and add an entry in `apps/docs/lib/changelog.ts`.
3. If a tool's inputs changed, update the MCP tools in `apps/frontend/plugins/mcp/src/index.ts`.
4. Update the plugins under `apps/frontend/plugins/` if they call the changed endpoint, then re-run `pack.sh`.
