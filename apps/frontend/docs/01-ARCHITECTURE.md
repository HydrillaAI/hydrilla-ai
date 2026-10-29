# 01 · Architecture

## The monorepo

This is a pnpm workspace with one root `pnpm-lock.yaml`. Packages are listed in `pnpm-workspace.yaml`.

| Package | Path | What it is | Hosting |
|---|---|---|---|
| `hydrilla-frontend` | `apps/frontend` | Next.js 16 / React 19 product app and marketing site (`hydrilla.ai`) | Vercel, region `iad1` |
| `hydrilla-backend` | `apps/backend` | Express 4 + TypeScript API, which holds all business logic | Vercel, one Node function |
| `hydrilla-admin` | `apps/admin` | Next.js 16 internal admin panel (`admin.hydrilla.ai`) | Vercel |
| `hydrilla-docs` | `apps/docs` | Next.js 15 public developer docs for the `/v1` API | Vercel |
| `hydrilla-agents` | `apps/frontend/agent` | Vercel eve agents. **Parked: nothing calls them** (`apps/frontend/agent/README.md`) | — |
| `@hydrilla/mcp-server` | `apps/frontend/plugins/mcp` | Stdio MCP server that wraps the developer API | Runs on the user's machine |

The DCC plugins (Blender, Maya, 3ds Max, Unity, Unreal, Godot) live in `apps/frontend/plugins/`. Each one is packed into a zip by `apps/frontend/plugins/pack.sh`.

## Request flow

```
Browser (apps/frontend)
  │  Clerk session  →  useAuth().getToken()
  │  Authorization: Bearer <Clerk JWT>
  ▼
Backend (apps/backend, Express)          ← also called by apps/admin the same way
  │  requireAuth → clerk.verifyToken → req.userId
  ├── Supabase Postgres  (service-role key)
  ├── AWS S3             (GLBs, images, uploads)
  ├── GPU VM gateway     (BlueFox image→3D, X-Hydrilla-Internal header)
  ├── OpenAI / Gemini    (text→image, edits, prompt rewrite)
  ├── LLM providers      (Water: Anthropic, OpenAI, Google, OpenRouter, Cursor)
  ├── Dodo Payments      (checkout, subscriptions, webhooks)
  ├── Customer.io        (email)
  └── PostHog            (server events)
```

- The frontend API client is `apps/frontend/lib/api.ts`. Its base URL comes from `NEXT_PUBLIC_BACKEND_URL`; if that is unset it falls back to the production backend URL.
- The frontend has only these server routes:
  - `apps/frontend/app/api/revalidate/blog/route.ts` and `apps/frontend/app/api/revalidate/community/route.ts`. The backend calls these to bust the ISR cache.
  - `apps/frontend/app/markdown-mirror/[[...path]]/route.ts`, which serves `.md` copies of pages.
  - `apps/frontend/app/api/page.tsx` is a marketing page, not an API route.
- The admin app has no server data access. It calls backend `/api/admin/*` with the admin's Clerk token (`apps/admin/lib/admin-request.ts`).

## Two backend entrypoints

| | Local dev: `apps/backend/src/server.ts` | Production: `apps/backend/api/index.ts` |
|---|---|---|
| Runs as | Long-lived Express process on port 4000 | One Vercel function; `apps/backend/vercel.json` routes every path to it |
| Function limit | none | `maxDuration: 60` seconds |
| Background job sync (`syncAllJobs` in `apps/backend/src/services/jobSync.ts`) | Yes, every `POLL_INTERVAL_MS` | **No.** Job state updates only when a client polls `/api/3d/status/:id` or the GPU calls `/api/3d/webhook/job-update` |
| `/api/dodo/*` router (`apps/backend/src/routes/dodopayments/`) | Mounted | **Not mounted (returns 404).** The live payment webhook is `/api/payments/webhook/dodo` |
| DB init | `initDb()` at boot | Lazy `ensureDb()` middleware |

**If you add a router, mount it in both files.** They have already drifted apart once.

## Backend route map

All routers are mounted in `apps/backend/api/index.ts`.

| Mount | File | Who can call it |
|---|---|---|
| `/api/3d` | `apps/backend/src/routes/threeD.ts` | Users (Clerk). A few routes are public or internal |
| `/api/water` (alias `/api/code-sculpt`) | `apps/backend/src/routes/codeSculpt.ts` | Users |
| `/api/payments` | `apps/backend/src/routes/payments.ts` | Users. The webhook is verified by signature instead |
| `/api/credits/claim` | `apps/backend/src/routes/creditClaims.ts` | GET is open; POST needs a user |
| `/api/user` | `apps/backend/src/routes/user.ts` | Users (BYOK keys, models, developer keys) |
| `/api/community`, `/api/blog` | `apps/backend/src/routes/community.ts`, `apps/backend/src/routes/blog.ts` | Mixed: some routes public, some need a user |
| `/api/contact`, `/api/support` | `apps/backend/src/routes/contact.ts`, `apps/backend/src/routes/support.ts` | Public, or user if signed in |
| `/api/webhooks/clerk` | `apps/backend/src/routes/webhooks.ts` | Clerk (Svix signature) |
| `/api/cron/*` | `apps/backend/src/routes/cron.ts` | Vercel Cron (`Bearer CRON_SECRET`) |
| `/api/admin/*` | `apps/backend/src/routes/admin.ts` and its `admin*.ts` siblings | Admins |
| `/api/create/tools` | `apps/backend/src/routes/createTools.ts` | Internal secret only (for the parked agents) |
| `/v1`, `/api/v1` | `apps/backend/src/routes/v1/developerApi.ts` | Developer API keys (`hyd_live_…`) |

## The two generation engines

| | Cloud / BlueFox | Water |
|---|---|---|
| Output | GLB mesh | Three.js factory code plus a scene graph |
| Runs on | Self-hosted GPU VM on GCP (TRELLIS-style pipeline) | LLM calls from the backend function |
| Cost to the user | Credits | 0 credits; uses the user's own key or a platform key |
| Doc | [05](05-CLOUD-GENERATION.md) | [06](06-WATER-ENGINE.md) |

The engine is fixed once the user picks it in the UI, and no code path switches a job between engines ([11](11-DECISIONS.md)).

## External services

| Service | Used for | Code |
|---|---|---|
| Clerk | Auth for the frontend, admin and backend | `apps/backend/src/middleware/auth.ts`, `apps/frontend/middleware.ts` |
| Supabase | Postgres database | `apps/backend/src/db.ts`, `apps/backend/sql/` |
| AWS S3 | Generated assets and uploads (default bucket `hydrilla-outputs-1`, `us-east-1`) | `apps/backend/src/lib/s3Upload.ts` |
| GCP Compute | Start, stop and reset the GPU VM; move its static IP | `apps/backend/src/services/gcpCompute.ts` |
| Dodo Payments | Subscriptions | `apps/backend/src/lib/dodopayments.ts` |
| OpenAI, Google Gemini | Image generation and edits | `apps/backend/src/services/imageProviders/` |
| Anthropic, OpenAI, Google, OpenRouter, Cursor | Water LLMs | `apps/backend/src/providers/` |
| Customer.io | Transactional and lifecycle email | `apps/backend/src/lib/customerio.ts`, `apps/backend/src/services/notifications.ts` |
| PostHog | Product analytics and error capture | `apps/frontend/instrumentation-client.ts`, `apps/backend/src/lib/posthog.ts` |
| Google Analytics | Marketing analytics | `apps/frontend/components/analytics/GoogleAnalytics.tsx` |
| Cloudinary | Marketing media | `apps/frontend/lib/cloudinary.ts` |
| Vercel | Hosting, cron, Analytics, Speed Insights | `apps/*/vercel.json` |
