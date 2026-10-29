# 09 · Admin and operations

## Admin app (`apps/admin`, admin.hydrilla.ai)

- Next.js 16 with shadcn/ui, a TipTap editor and Clerk. It has **no database client and no API routes**: every action goes to backend `/api/admin/*` through `adminRequest` (`apps/admin/lib/admin-request.ts`) and the `apps/admin/lib/*-api.ts` helpers.
- Access requires an `@hydrilla.ai` email in the UI, and `requireAdmin` on the backend. The two rules differ; see [03](03-SECURITY.md#admin-access-the-two-layers-use-different-rules).
- Crawlers are blocked (`apps/admin/app/robots.ts`).

| Sidebar page | Backend endpoints (`/api/admin/…`) | What you can do |
|---|---|---|
| Home | `/overview` | User count and key status |
| Users | `/users?filter=all\|paying\|trial\|cancelled\|free`, `/users/:id`, `/users/:id/sync` | Look up a user and re-sync their subscription from Dodo |
| Users → credits | `POST /users/:id/credits` (`action: add\|remove`, `reason`, `sendEmail`), `/users/:id/credits/history` | Grant or remove credits; optionally email the user (`sendCreditsGranted`) |
| Claim links | `/credit-claims` (GET, POST, PATCH), `/credit-claims/claims` | Create, disable or edit promo links and see who claimed ([04](04-PAYMENTS-AND-CREDITS.md#claim-links-promo-credits)) |
| Usage & cost | `/usage` | Usage and provider cost metrics |
| GPU | `/gpu`, `/gpu/restart`, `/gpu/trim-memory`, `/gpu/clear-queue`, `/gpu/instance/:action`, `/gpu/gateway`, `/gpu/target-instance`, `/gpu/shift-static-ip` | Operate the GPU VM ([below](#gpu-vm)) |
| Image API keys | `/image-keys` CRUD + verify | Platform keys for OpenAI and Gemini images |
| Water model keys | `/api-keys` (alias `/water-keys`) CRUD + verify | Platform LLM keys for Water |
| Blog | `/blog/posts` CRUD, `/blog/categories`, `/blog/upload-image` | Write posts. They are sanitised server-side, and the frontend cache is revalidated |
| Support & feedback | `/support` list/get/PATCH/DELETE | Triage tickets (`status`, `admin_notes`) |
| Emails | `/emails/overview`, `/templates`, `/deliveries`, `/people/:id`, `/test`, `/news`, `/weekly/preview` | Customer.io views, test sends, release news, weekly recap preview |

The backend routes live in `apps/backend/src/routes/admin.ts` and the `admin*.ts` routers next to it (`adminUsers.ts`, `adminGpu.ts`, `creditClaims.ts`, `adminCommunity.ts`, …).

**Gaps in the admin UI:**
- There is no page for community moderation. The backend exposes `/api/admin/community/*` in `adminCommunity.ts` (reports, remove/restore posts, comment and user actions); for now, call it directly.
- There is no jobs page and no refund button. Credit corrections go through Users → credits.

## GPU VM

- **What it is:** a GCP Compute instance running the BlueFox pipeline behind an HTTP gateway (`api.hydrilla.co` by default). The backend reaches it through the URL in `app_settings.gpu_gateway_url`.
- **Code:**
  - `apps/backend/src/routes/adminGpu.ts`
  - `apps/backend/src/services/gcpCompute.ts`: `runGpuInstanceAction`, `listGpuInstances`, `shiftStaticIp`, `getGpuInstanceInfo`.
  - `apps/backend/src/services/gpuGateway.ts`
- **GCP settings:** `GCP_PROJECT_ID`, `GCP_GPU_ZONE` and `GCP_GPU_INSTANCE` (defaults `hydrilla-486606` / `asia-south1-c`). Auth uses `GCP_SERVICE_ACCOUNT_KEY`.

| Action | Effect |
|---|---|
| `instance/start\|stop\|reset` | GCP Compute lifecycle. Stopping saves money; the UI has an auto-stop timer (`AutoStopTimer`) |
| `restart` | Restarts the pipeline service on the VM through the gateway |
| `trim-memory` | Frees GPU/host memory without a restart |
| `clear-queue` | Drops queued jobs and **refunds** their credits |
| `gateway` | Sets the gateway URL (stored in `app_settings`). It accepts any URL, so double-check before saving |
| `target-instance`, `shift-static-ip` | Moves the static IP to another instance, for swapping VMs without changing DNS |

## Email (Customer.io)

- **Sending:** `apps/backend/src/lib/customerio.ts` (Track and App APIs). Event hooks are in `apps/backend/src/services/notifications.ts`, for example:
  - Account: `onAccountCreated`.
  - Generation: `onGenerationCompleted`, `onGenerationFailed`.
  - Billing: `onPlanActive`, `onPlanCancelled`, `onPaymentFailed`.
  - Credits: `onCreditsLow`, `onCreditsExhausted`, `sendCreditsGranted`.
  - Team alerts: `onGpuOffline`, `onFormMessage`.
- **Templates:** MJML in `apps/frontend/email/templates/` (`T01_welcome`, `T02_model-ready`, `C01_credits-low`, `D01_payment-failed`, `W01_weekly-recap`, …), built with `pnpm --filter hydrilla-frontend email:build`.
- **Docs:** `apps/frontend/email/EMAIL-SYSTEM.md`, `CATALOGUE.md`, `CUSTOMERIO-SETUP.md` and `EDITORIAL.md` cover the email system.
- **Weekly recap:** sent by the Monday cron (`runWeeklyRecap`).
- **Team inbox:** internal alerts go to `EMAIL_TEAM_INBOX`.

## Analytics and logs

| What | Where |
|---|---|
| PostHog (client): `person_profiles: "identified_only"` | `apps/frontend/instrumentation-client.ts`, `apps/frontend/lib/posthog.ts` |
| `track()` helper. **Never send prompt text or PII** | `apps/frontend/lib/analytics.ts` |
| Server errors → PostHog (skips server-action skew errors) | `onRequestError` in `apps/frontend/instrumentation.ts` |
| Server-side events (`checkout_session_created`, `subscription_activated`, …) | `captureServerEvent` in `apps/backend/src/lib/posthog.ts` |
| Google Analytics (ID hardcoded) | `apps/frontend/components/analytics/GoogleAnalytics.tsx` |
| Vercel Analytics and Speed Insights | `apps/frontend/app/layout.tsx` |
| Backend logs (pino and pino-http) | `apps/backend/src/logger.ts`, viewed in Vercel function logs |

There is no APM or alerting. GPU-offline and contact messages reach the team by email.

## Runbooks

### Users say generation is down
1. Admin → GPU: is the instance running? Is the gateway health check green?
2. If the instance is stopped, **start** it, wait for health to come back, then check that the gateway URL is correct.
3. If it is running but stuck, try **trim-memory**, then **restart**, then **reset** as a last resort.
4. If the queue is jammed, **clear-queue** (this refunds the affected users).
5. Jobs stuck in `RUN` update when they are polled ([05](05-CLOUD-GENERATION.md#step-3-job-lifecycle)). Ask users to reopen them.

### A user paid but has no plan
1. Admin → Users → find the user → **Sync**. This calls Dodo and runs the same logic as `/api/payments/sync`.
2. Check Vercel logs for `/api/payments/webhook/dodo` errors. A failed handler returns 500 so Dodo retries; check the Dodo dashboard for the delivery status.
3. Confirm the Dodo webhook points at `https://<backend>/api/payments/webhook/dodo`, **not** `/api/dodo/webhook` (that route isn't mounted).

### Refund or make good on credits
- **Failed generation:** usually refunded automatically. If not, Admin → Users → credits → add, with a reason.
- **Money refunded in Dodo:** credits are **not** removed automatically. Remove them by hand if needed (Users → credits → remove).

### Run a promo
Admin → Claim links → create a link. Set `max_claims`, the link expiry and, if you want, `credits_expire_at`. Share `/claim/<token>`.

### Rotate a secret
Edit the variable in the Vercel project(s) listed below and redeploy each one.

| Secret | Update in | Notes |
|---|---|---|
| `HYDRILLA_INTERNAL_API_SECRET` | backend **and** the GPU VM gateway config | Update both at the same time, or GPU calls fail |
| `CRON_SECRET` | backend | Vercel Cron sends it automatically |
| `BLOG_REVALIDATE_SECRET`, `COMMUNITY_REVALIDATE_SECRET` | backend **and** frontend | |
| `DODO_PAYMENT_WEBHOOK_SECRET` | backend, after rotating it in Dodo | |
| `CLERK_WEBHOOK_SECRET` | backend, after rotating it in Clerk | |
| `USER_API_KEYS_ENCRYPTION_SECRET` | **Don't rotate without a re-encryption script**: every stored BYOK and platform key would become unreadable | |
| `SUPABASE_SERVICE_ROLE_KEY`, AWS keys, `GCP_SERVICE_ACCOUNT_KEY` | backend, after rotating at the provider | |
