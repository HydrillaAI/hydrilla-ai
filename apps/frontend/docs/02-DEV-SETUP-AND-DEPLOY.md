# 02 · Dev setup and deploy

## Local development

Use **pnpm only** (`packageManager: pnpm@11.24.0` in the root `package.json`). Don't use npm or yarn.

```bash
pnpm install                 # once, from the repo root
pnpm dev:frontend            # http://localhost:3000
pnpm dev:backend             # http://localhost:4000  (tsx watch src/server.ts)
pnpm dev:admin               # http://localhost:3001
pnpm dev:docs                # http://localhost:3002
pnpm --filter <package-name> add <dep>   # add a dependency to one app
```

- No app declares `engines` and there is no `.nvmrc`. Use a current Node LTS. The parked `apps/frontend/agent` package asks for Node 24.
- The backend loads `.env`, then `.env.local` (`apps/backend/src/config.ts`). It refuses to start without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; any other missing var only logs a warning.
- In local dev, uploads go to `apps/backend/uploads/` and are served at `/uploads`. On Vercel they go to S3. Never commit `uploads/`, `.env*` or `gcp-key.json`.
- The local backend also runs the background job-sync loop that Vercel does not ([01](01-ARCHITECTURE.md#two-backend-entrypoints)). Because of that, local runs can refund failed jobs sooner than production does.

## Env var names by app

These are names only; the values live in Vercel project settings and local `.env.local` files. The authoritative list is whatever `process.env.*` the code reads; `apps/backend/src/config.ts` is the backend's hub.

**Frontend** (`apps/frontend`)
- **Backend and site:** `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_API_URL` (GPU health check), `NEXT_PUBLIC_SITE_URL`
- **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_JS_VERSION`, `CLERK_SECRET_KEY` (read by the SDK)
- **Analytics:** `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- **Media:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Cache revalidation:** `BLOG_REVALIDATE_SECRET`, `COMMUNITY_REVALIDATE_SECRET`

**Backend** (`apps/backend`)
- **Core:** `PORT`, `NODE_ENV`, `LOG_LEVEL`, `CORS_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`, `EMAIL_LINK_BASE_URL`, `POLL_INTERVAL_MS`
- **Supabase:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. `DATABASE_URL` is read but not used.
- **Clerk and admin:** `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SECRET`, `ADMIN_EMAILS`
- **Internal secrets:** `HYDRILLA_INTERNAL_API_SECRET`, `CRON_SECRET`, `BLOG_REVALIDATE_SECRET`, `COMMUNITY_REVALIDATE_SECRET`, `USER_API_KEYS_ENCRYPTION_SECRET`
- **GPU and GCP:** `HYDRILLA_GPU_API_URL`, `HUNYUAN_API_URL`, `GCP_PROJECT_ID`, `GCP_GPU_ZONE`, `GCP_GPU_INSTANCE`, `GCP_SERVICE_ACCOUNT_KEY`
- **S3:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PRESIGNED_URL_EXPIRY`, `S3_PUBLIC_BASE_URL`, `S3_PUT_ACL`, `LEGACY_S3_BUCKETS`
- **Dodo:** `DODO_PAYMENT_API_KEY`, `DODO_PAYMENT_MODE` (`test`/`live`), `DODO_PAYMENT_WEBHOOK_SECRET`, `DODO_PAYMENT_STARTER_PRODUCT_ID`, `DODO_PAYMENT_STUDIO_PRODUCT_ID` (**this is the Pro product**), `DODO_PAYMENT_SLOT_PRODUCT_ID`, `DODO_PAYMENT_SLOT_PRO_PRODUCT_ID`, `DODO_PAYMENTS_RETURN_URL`, `SKIP_WEBHOOK_VERIFICATION` (ignored in production)
- **Images:**
  - Keys: `IMAGE_OPENAI_API_KEY`, `IMAGE_GEMINI_API_KEY`, `IMAGE_GOOGLE_API_KEY`
  - Models: `OPENAI_IMAGE_MODEL_LOW`, `OPENAI_IMAGE_MODEL_HIGH`, `GEMINI_IMAGE_MODEL_LOW`, `GEMINI_IMAGE_MODEL_HIGH`
  - OpenAI options: `OPENAI_IMAGE_QUALITY_LOW`, `OPENAI_IMAGE_QUALITY_HIGH`, `OPENAI_IMAGE_MODERATION`
  - Other: `IMAGE_PRICING_JSON`, `GEMINI_API_BACKEND`, `GEMINI_BASE_URL`, `GEMINI_VERTEX_BASE_URL`, `OPENAI_BASE_URL`
- **Water LLM fallbacks:** `WATER_{OPENAI,GOOGLE,GEMINI,ANTHROPIC,OPENROUTER,CURSOR}_API_KEY`, plus the plain `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `CURSOR_API_KEY`
- **Email:** `CUSTOMERIO_SITE_ID`, `CUSTOMERIO_TRACK_API_KEY`, `CUSTOMERIO_APP_API_KEY`, `CUSTOMERIO_REGION`, `EMAIL_TEAM_INBOX`
- **PostHog:** `POSTHOG_API_KEY`, `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`

**Admin** (`apps/admin`): `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_JS_VERSION`, `NEXT_PUBLIC_SITE_URL`, `CLERK_SECRET_KEY`

**Docs** (`apps/docs`): `HYDRILA_API_BASE` (spelled with one L in the code), `STATUS_URL`, `NEXT_PUBLIC_STATUS_URL`, `NEXT_PUBLIC_GITHUB_URL`

### S3 browser uploads

The frontend uploads images and 3D models directly to S3 using a short-lived URL
issued by `POST /api/3d/upload-url`. This avoids routing the file bytes through
the backend host. Configure the S3 bucket CORS policy to allow the production
site and local development origins to `PUT` objects with `Content-Type`:

```json
[
  {
    "AllowedHeaders": ["Content-Type", "x-amz-acl"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["https://hydrilla.ai", "https://www.hydrilla.ai", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Add `https://admin.hydrilla.ai` if admins upload files directly. Keep the
existing IAM permission for `s3:PutObject` on the configured uploads prefix.

## Deploys (Vercel)

Each app is its own Vercel project with its own `vercel.json`.

| App | Config | Install | Notes |
|---|---|---|---|
| frontend | `apps/frontend/vercel.json` | `pnpm install --filter hydrilla-frontend...` | Region `iad1` |
| backend | `apps/backend/vercel.json` | default | Legacy `builds` → `api/index.ts`; all routes go to it; **`maxDuration: 60`** (in `apps/backend/api/index.ts`) |
| admin | `apps/admin/vercel.json` | `pnpm install --filter hydrilla-admin...` | |
| docs | `apps/docs/vercel.json` | `pnpm install --filter hydrilla-docs...` | |

- **Every** `vercel.json` has `ignoreCommand: git diff --quiet ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD -- .`, so a project skips the build when its folder did not change.
- There is **no CI**: no `.github/` folder and no Dockerfiles. Vercel's build is the only automated check.
- `main` is protected. Changes go in through PRs from `<type>/<name>` branches (root `CLAUDE.md`).

### Crons

These are defined in `apps/backend/vercel.json` and handled in `apps/backend/src/routes/cron.ts` (`Bearer CRON_SECRET`, timing-safe compare).

| Path | Schedule (UTC) | Does |
|---|---|---|
| `/api/cron/weekly-recap` | `30 0 * * 1` (Mon 00:30) | `runWeeklyRecap`: weekly email recap |
| `/api/cron/expire-credits` | `5 0 * * *` (daily 00:05) | `expireCreditGrants`: expires claim-link / promo credits past `credits_expire_at` |

`GET /api/cron/gpu-auto-stop` uses the same `CRON_SECRET` check. Cloud Scheduler in project `hydrilla-486606` calls it every minute (`* * * * *`). It is not a Vercel cron, because a Hobby project can only schedule a job once a day.

## Database migrations

- SQL lives in `apps/backend/sql/`. **There is no migration runner.** You apply files by hand in the Supabase SQL editor, in number order.
- Numbered files run `001`–`029`. Some numbers are used twice (`018`, `024`, `025`, `027`, `028`). When two files share a number, read both before running either.
- Un-numbered files (`add_*`, `backfill_*`, `optimize_*`, `schema.sql`, `subscriptions_schema.sql`) are earlier one-offs. `apps/backend/sql/RUN_ALL_CREDITS_MIGRATIONS.sql` bundles the credits migrations.
- The full table list is in [07](07-DATA-MODEL.md).

## Checks you can run

There is no unified test or typecheck command.

| What | Command |
|---|---|
| Backend typecheck and build (strict `tsc`) | `pnpm --filter hydrilla-backend build` |
| Water/Create contract checks (pure, offline) | `pnpm --filter hydrilla-backend verify:all` (runs `verify:create`, `verify:mesh`, `verify:pipeline`, `verify:agents`) |
| Image provider checks (**call live APIs**) | `pnpm --filter hydrilla-backend verify:images`, `test:image-prompts`, `test:qa-generation` |
| The one unit test | `pnpm --filter hydrilla-backend exec tsx --test src/services/slotClock.test.ts` |
| Admin lint | `pnpm --filter hydrilla-admin lint` |
| Frontend / admin / docs typecheck | `pnpm --filter <pkg> exec tsc --noEmit`, or `pnpm --filter <pkg> build` |
| Email templates | `pnpm --filter hydrilla-frontend email:build` |

`next lint` (the frontend `lint` script) was removed in Next 16, so expect that script to fail.

The repo rule is **no browser automation**: verify UI by reading the code, type-checking or running tests, and say what was not checked in a browser.
