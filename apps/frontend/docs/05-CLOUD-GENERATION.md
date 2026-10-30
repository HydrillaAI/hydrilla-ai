# 05 · Cloud generation (BlueFox)

"Cloud" is the engine that turns an image into a **GLB mesh** on our own GPU VM. The same engine goes by several names:

| Name | Where you see it |
|---|---|
| **BlueFox 1** | User-facing label (`apps/frontend/lib/models.ts`, marketing) |
| `trilles` | Catalog id and the value stored in `jobs.engine` |
| TRELLIS | The upstream model family the GPU pipeline is based on |
| Pixal3D | Old pack prose; [11 · D3](11-DECISIONS.md) says it is the same engine |

Hunyuan 3D is listed in `MODEL_CATALOG` but marked `comingSoon`.

## Pipeline overview

```
text prompt ──► text→image (OpenAI / Gemini) ──► S3 ──┐
uploaded image ──► /api/3d/upload-image ──► S3 ───────┤
                                                      ▼
                        POST /api/3d/generate {imageUrl}
                                                      │  checks GPU ready, slot window, dedup lock
                                                      │  deductCredit(30 | 40)
                                                      ▼
                        GPU gateway  /image-to-3d  (X-Hydrilla-Internal)
                                                      │
          ┌──────── client polls GET /api/3d/status/:id ◄──┤  GPU may also POST /api/3d/webhook/job-update
          ▼                                                ▼
   jobs row: WAIT → RUN → DONE | FAIL           S3: image/<jobId>/mesh.glb, preview
          │
          ▼
   viewer loads GLB via /api/3d/glb/:id/signed-url  (falls back to /api/3d/glb/:id stream)
```

## Step 1: the source image

Code: `apps/backend/src/services/imageProviders/`.

| Piece | File | Notes |
|---|---|---|
| Providers | `openai.ts`, `gemini.ts` | The default provider is OpenAI, at low quality, 1:1 |
| Models | `config.ts` | `gpt-image-2.5-flare` and `gemini-3.1-flash-image` for **both** tiers by default. Override with `OPENAI_IMAGE_MODEL_LOW/HIGH` and `GEMINI_IMAGE_MODEL_LOW/HIGH`. OpenAI `quality` defaults to `medium` for both tiers |
| Sizes | `config.ts` | Low: 1024 px class. High: 2048 px class (OpenAI). Gemini `1K`/`2K` |
| Prompt rewrite | `rewriter.ts` | Rewrites the prompt into a front-facing, well-framed product shot that suits 3D. Uses `gpt-4o-mini` or `gemini-2.5-flash` |
| Edit prompts | `editPrompts.ts` | Prompt templates for `/api/3d/edit-image` |
| Keys | `keys.ts` | `IMAGE_*` env vars, or admin-managed `image_platform_api_keys` (Admin → Image API keys) |
| Cost tracking | `usage.ts`, `pricing.ts` | Writes `image_generation_usage`; `IMAGE_PRICING_JSON` overrides the cost table |
| Dedup | `inFlight.ts` | Blocks an identical request that is still in flight |

Credits: 15 for low quality, 30 for high ([04](04-PAYMENTS-AND-CREDITS.md#what-each-action-costs)). Prompts must be 2–4,000 characters.

## Step 2: image → 3D on the GPU VM

- **The gateway URL comes from the admin panel, not the env.** It is stored in `app_settings.gpu_gateway_url` (`apps/backend/src/services/appSettings.ts`, cached 20 s) and mirrored into `HYDRILLA_GPU_API_URL`. Admin → GPU changes it. If it is empty, `submitImageTo3dGpu` throws `GpuOfflineError`.
- **Client:** `apps/backend/src/services/gpuGateway.ts`.
  - `submitImageTo3dGpu`: multipart or URL submit; resolution 1024 and seed 42 by default.
  - `fetchGpuJobStatus`, `cancelGpuJob`, `fetchGpuQueueInfo`.
  - `submitWithGpuRestartRetry` retries transient errors for 2–5 s.
  - Every call carries `withInternalSecretHeaders`.
- **Before submit:** `assertGpuReadyFor3d` checks the GPU health endpoint, `rejectIfSlotClosed` applies the hourly-plan window, and `runDeduplicated3DSubmission` (`apps/backend/src/services/inFlight3d.ts`) collapses double clicks.
- **Charge:** `deductCredit` runs *inside* the dedup lock. If the GPU submit then fails, the credits are refunded at once.
- **VM lifecycle:** the VM is a GCP Compute instance (default project `hydrilla-486606`, zone `asia-south1-c`). It is started, stopped and reset from Admin → GPU through `apps/backend/src/services/gcpCompute.ts`. See [09](09-ADMIN-AND-OPERATIONS.md#gpu-vm).
- `NEXT_PUBLIC_API_URL` on the frontend is used for the GPU health indicator. `POST /api/3d/notify-gpu-offline` lets the UI tell the team.

## Step 3: job lifecycle

Jobs live in the `jobs` table ([07](07-DATA-MODEL.md#jobs-and-workspaces)) and move through `WAIT → RUN → DONE | FAIL`.

| Mechanism | Where | Runs in production? |
|---|---|---|
| Client polling `GET /api/3d/status/:id` | `apps/frontend/lib/polling.ts` (paused while the tab is hidden) → `apps/backend/src/routes/threeD.ts` | Yes. **This is the main way jobs update** |
| GPU push `POST /api/3d/webhook/job-update` | `apps/backend/src/routes/threeD.ts` (internal secret) | Yes |
| Background `syncAllJobs` (with a circuit breaker) | `apps/backend/src/services/jobSync.ts` | **No, local server only** |

On completion the backend stores normalized S3 URLs in `jobs.result_glb_url` and `jobs.preview_image_url`. A failed job is refunded ([04](04-PAYMENTS-AND-CREDITS.md#refunds-when-generation-fails)).

Because nothing runs in the background on Vercel, **a job no one polls stays in `RUN`** until someone opens it. That includes jobs whose refunds are pending.

## Storage

- S3 bucket from `S3_BUCKET` (default `hydrilla-outputs-1`, region `us-east-1`). Older buckets in `LEGACY_S3_BUCKETS` are still readable.
- Key layout: `image/<jobId>/mesh.glb`, `text/<jobId>/mesh.glb`, `image/<jobId>/processed_image.png` (see `apps/backend/src/routes/threeD.ts` and `apps/backend/src/utils/s3Urls.ts`).
- Uploads: `apps/backend/src/lib/s3Upload.ts` (multer, 100 MB limit for `/upload-image` and `/upload-model`).
- Downloads: `/glb/:id/signed-url` returns a 1-hour presigned URL, so the browser fetches straight from S3 instead of streaming through the function (which costs CPU time). `/glb/:id` streams the file as a fallback. Both use `canServeJobGlb`; that check has a gap, see [03 gap #1](03-SECURITY.md#known-gaps).
- `/api/3d/image-proxy` serves our S3 images with CORS headers, for canvas use. Only allowlisted hosts are fetched.

## Workspaces, chats and lineage

- **Workspaces** (`/api/3d/workspaces*`) group jobs. The UI is `apps/frontend/app/workspace/page.tsx` and `apps/frontend/app/workspace/[workspaceId]`.
- **Chats** (`/api/3d/chats*`) hold the conversation around a set of generations.
- **Lineage:** `job_parents` links a job to the job it was edited from; `GET /api/3d/jobs/:id/lineage` reads it through the `get_job_lineage` RPC.
- `POST /api/3d/register-job` records jobs created elsewhere, for example from DCC plugins.

## In the browser

- The viewer is three.js. The source of truth for the frontend model catalog is `apps/frontend/lib/models.ts`; engine metadata is in `apps/frontend/lib/engines.ts` (and `apps/backend/src/lib/engines.ts`).
- Rigging and animation run **client-side** (`apps/frontend/lib/rigging/`, `apps/frontend/app/rigging`). They don't call the backend and cost no credits.

## Not built yet

- No quality gate on Cloud output. `apps/backend/src/lib/create/` defines gates and a compile step, but `threeD.ts` does not call them.
- No refusal of character prompts on Cloud, even though D2 in [11](11-DECISIONS.md) calls for one.
- No video generation and no third-party 3D providers (Tripo, Meshy and fal appear only on comparison pages).
