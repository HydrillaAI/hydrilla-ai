# 03 · Security

This doc covers how access control works and lists the known gaps. Each gap in the [table at the end](#known-gaps) was checked against code on 2026-10-29. When you fix one, delete its row in the same PR.

## Who is calling: identity

| Caller | How it proves identity | Checked in |
|---|---|---|
| Signed-in user (frontend, admin) | `Authorization: Bearer <Clerk JWT>` | `optionalAuth` / `requireAuth` in `apps/backend/src/middleware/auth.ts`, which call `clerk.verifyToken` and set `req.userId` |
| Admin | Clerk user plus an admin rule (below) | `requireAdmin` in `apps/backend/src/middleware/auth.ts` |
| Developer API client | `hyd_live_…` key, sent as `Bearer` or `x-api-key` | `apps/backend/src/middleware/developerAuth.ts`. Keys are stored as SHA-256 hashes (`apps/backend/src/repository/developerApiKeys.ts`) |
| GPU VM → backend, backend → GPU, parked agents | `X-Hydrilla-Internal: <HYDRILLA_INTERNAL_API_SECRET>` | `assertInternalSecret` / `timingSafeEqualString` (`apps/backend/src/config.ts`) |
| Vercel Cron | `Bearer CRON_SECRET` | `apps/backend/src/routes/cron.ts` (timing-safe) |
| Backend → frontend cache bust | `Bearer BLOG_REVALIDATE_SECRET` / `COMMUNITY_REVALIDATE_SECRET` | `apps/frontend/app/api/revalidate/*/route.ts` |
| Dodo webhook | Standard Webhooks signature | `dodo.webhooks.unwrap` in `apps/backend/src/routes/payments.ts` |
| Clerk webhook | Svix signature (`CLERK_WEBHOOK_SECRET`) | `apps/backend/src/routes/webhooks.ts` |

`syncUserToDatabase` (also in `auth.ts`) upserts the Clerk user into the Supabase `users` table. The Clerk `user.*` webhooks keep that table current.

### Frontend route protection

`apps/frontend/middleware.ts` runs `clerkMiddleware`. It sends signed-out users on `/app`, `/workspace`, `/generate`, `/generations`, `/library`, `/checkout` and `/rigging` to `/sign-in?redirect_url=…`.

It also does two other things:
- It returns 404 for POSTs whose `next-action` header is malformed (shorter than 40 characters), which blocks server-action scanners.
- It sets the `__vdpl` skew-protection cookie.

This is a UX guard only. **The backend checks every request again** and does not trust the frontend.

### Admin access: the two layers use different rules

| Layer | Rule |
|---|---|
| Admin UI (`apps/admin/middleware.ts` and `apps/admin/app/(dashboard)/layout.tsx`) | Clerk sign-in **and** an email ending `@hydrilla.ai` (`isHydrillaEmail` in `apps/admin/lib/email.ts`) |
| Backend `/api/admin/*` (`requireAdmin`) | Clerk `publicMetadata.role === "admin"` **or** an email ending `@hydrilla.ai` **or** an email in `ADMIN_EMAILS` |

`requireAdmin` reads the primary email, or the first email if there is no primary. It does not check the email's verification status itself; it relies on Clerk's sign-up settings to require verified email. **Keep email verification on in Clerk.** Without it, anyone could register an `@hydrilla.ai` address and become admin.

## Secrets and keys

- **Secret values** live only in Vercel env settings and local `.env.local` files. Names are in [02](02-DEV-SETUP-AND-DEPLOY.md#env-var-names-by-app). Never commit, print or paste them, including in docs and PRs.
- **API keys users bring (BYOK)** and **admin-managed platform keys** for Water and images are encrypted at rest with AES-256-GCM. The encryption key is derived (scrypt) from `USER_API_KEYS_ENCRYPTION_SECRET` (`apps/backend/src/lib/userApiKeysCrypto.ts`). They are used by `apps/backend/src/repository/userApiKeys.ts`, `platformApiKeys.ts` and `imagePlatformApiKeys.ts`. **If this secret is rotated, every stored key becomes unreadable.**
- **Supabase:** the backend uses the **service-role key** (`apps/backend/src/db.ts`), which bypasses row-level security. Every ownership check has to happen in backend code; RLS policies in `apps/backend/sql/` are not a safety net.
- **GCP:** the service-account JSON comes from `GCP_SERVICE_ACCOUNT_KEY` (raw or base64) and is only used for Compute (`apps/backend/src/services/gcpCompute.ts`).

## Webhooks

**Dodo:** `POST /api/payments/webhook/dodo`
- Parses the raw body and verifies it with `dodo.webhooks.unwrap`.
- Drops repeats: it inserts the `webhook-id` into `webhook_events` first. If a handler then fails, it deletes that row and returns 500, so Dodo retries.
- `SKIP_WEBHOOK_VERIFICATION=true` works outside production only; in production it is ignored and an error is logged.

**Clerk:** `POST /api/webhooks/clerk` verifies the Svix signature and handles `user.created/updated/deleted` and `session.created`.

## Input and network controls

| Control | Where |
|---|---|
| CORS allowlist from `CORS_ORIGINS`, or the default hydrilla `.ai`/`.co` domains plus localhost. `admin.hydrilla.ai` is always added. `credentials: true` | `apps/backend/src/config.ts`, `apps/backend/api/index.ts` |
| JSON body limit 10 MB; 3D uploads 100 MB with an extension/MIME allowlist (multer); support uploads 15 MB | `apps/backend/src/routes/threeD.ts`, `apps/backend/src/routes/support.ts` |
| Image proxy only fetches our S3 buckets and `api.hydrilla.co` (`isAllowedImageProxyUrl`) | `apps/backend/src/routes/threeD.ts` |
| Image prompts must be 2–4,000 characters (`validateImagePrompt`) | `apps/backend/src/services/imageProviders/config.ts` |
| zod schemas on community, blog, create-tools and provider inputs | `apps/backend/src/routes/*`, `apps/backend/src/providers/schemas.ts` |
| Blog HTML is sanitised server-side with `xss` | `apps/backend/src/lib/blogSanitize.ts` |
| Per-user limits on community posts, comments and reports (HTTP 429) | `apps/backend/src/repository/community.ts` |
| A submission already in progress can't be sent again (dedup lock, per instance) | `apps/backend/src/services/inFlight3d.ts`, `apps/backend/src/services/imageProviders/inFlight.ts` |
| Docs site sets CSP, `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy | `apps/docs/next.config.mjs` |
| Docs "Try it" proxy forwards only to `HYDRILA_API_BASE`, checks the origin, and passes only `Authorization` | `apps/docs/app/api/proxy/route.ts` |

## Known gaps

Severity reflects our current judgement. Fix the **High** items before any marketing push that could bring a traffic spike.

| # | Severity | Gap | Evidence | Suggested fix |
|---|---|---|---|---|
| 1 | High | **Anyone with a job id can download its GLB.** `canServeJobGlb` only refuses when the caller *is signed in* and isn't the owner. Anonymous callers pass | `canServeJobGlb` in `apps/backend/src/routes/threeD.ts` (used by `/glb/:jobId` and `/glb/:jobId/signed-url`) | Deny when `!userId && job.userId` unless `isJobPubliclyPosted` |
| 2 | High | **SSRF in Water image intake.** `admitWaterImageUrl` fetches any user URL with `redirect: "follow"` and no host or private-IP check | `apps/backend/src/lib/water/harness/imageIntake.ts` | Allow only https and our S3 hosts, or resolve the host and block private and metadata IP ranges; don't follow redirects |
| 3 | High | **No rate limiting.** Nothing global, and nothing on public endpoints such as `POST /api/contact`, `POST /api/support`, `/api/3d/image-proxy` or `/api/community/posts/:id/view` | No limiter in `apps/backend/api/index.ts` or `apps/frontend/middleware.ts` | Add a per-IP limiter on public routes and a per-user limiter on spend routes, e.g. Upstash or Vercel KV |
| 4 | Medium | **No security headers** (CSP, HSTS, X-Frame-Options, nosniff) on the frontend, backend or admin app | `headers()` in `apps/frontend/next.config.js` only sets Cache-Control and Content-Type; `apps/admin/next.config.ts` sets none | Copy the docs app's header set and tune the CSP |
| 5 | Medium | **Possible double refund.** `/status/:id` refunds a failed job and only then sets `credits_used = 0`, so two polls at the same time can both refund | `apps/backend/src/routes/threeD.ts` (the "Safety check: if job failed" block) | Clear `credits_used` with a conditional update first (`WHERE credits_used > 0 RETURNING`), and refund only if a row came back |
| 6 | Medium | **Non-atomic grant.** `grantCredits` reads `credits_bonus` and then writes `bonus + amount`, so two grants at once can lose one | `grantCredits` in `apps/backend/src/services/credits.ts` | Move it into an RPC, like `deduct_user_credits` |
| 7 | Medium | **Water can spend our keys for free.** `resolveWaterApiKey` falls back from the user's key to the platform key and then the env key, while Water charges 0 credits | `apps/backend/src/repository/platformApiKeys.ts`, `apps/backend/src/routes/codeSculpt.ts` | Decide on a policy: charge credits when `source !== "user"`, or cap platform-key use per user |
| 8 | Low | Revalidate secrets are compared with `!==`, not timing-safe | `apps/frontend/app/api/revalidate/blog/route.ts`, `.../community/route.ts` | Use `crypto.timingSafeEqual` |
| 9 | Low | `next.config.js` `images.remotePatterns` allows `**.amazonaws.com` | `apps/frontend/next.config.js` | Narrow it to our bucket hosts |
| 10 | Low | Blog HTML is rendered without client-side sanitising, so it relies on the backend `xss` pass | `apps/frontend/components/content/ArticleBody.tsx` | Fine while only admins write posts; add DOMPurify if that changes |
| 11 | Info | Requests with no `Origin` header pass CORS. That's normal for server-to-server calls, but don't rely on CORS for auth | `apps/backend/api/index.ts` | — |

## Reporting and handling

- Treat a leaked secret as an incident. Rotate it in Vercel, redeploy the affected apps, and check logs for misuse. The rotation order for each secret is in [09 · Runbooks](09-ADMIN-AND-OPERATIONS.md#runbooks).
- The public security page is `apps/frontend/app/security/page.tsx`. Keep its claims in line with this doc.
