# Hydrilla internal docs

These docs explain how Hydrilla AI works today, across all four apps in this monorepo.
They were written against `main` on 2026-10-29, and every claim points to the file it comes from.

> **Rule: code wins.** If a doc and the code disagree, the code is right and the doc is a bug.
> When you change behaviour these docs describe, update the doc in the same PR.

Older docs are kept in [`archive/`](archive/README.md). Don't treat them as a reference.

## Reading order

| # | Doc | Read it when you need to know… |
|---|---|---|
| 01 | [Architecture](01-ARCHITECTURE.md) | What the apps are, how a request flows, which external services we use |
| 02 | [Dev setup and deploy](02-DEV-SETUP-AND-DEPLOY.md) | How to run things locally, env var names, Vercel projects, crons, migrations, checks |
| 03 | [Security](03-SECURITY.md) | Auth, admin access, secrets, webhooks, encryption, and the **known gaps** list |
| 04 | [Payments and credits](04-PAYMENTS-AND-CREDITS.md) | Plans, Dodo checkout and webhooks, the credit ledger, costs, claim links, refunds |
| 05 | [Cloud generation (BlueFox)](05-CLOUD-GENERATION.md) | Text→image, image→3D on the GPU VM, the job lifecycle, S3 storage |
| 06 | [Water engine](06-WATER-ENGINE.md) | LLM-written Three.js generation, passes, tiers, providers, contracts |
| 07 | [Data model](07-DATA-MODEL.md) | Supabase tables, RPCs, migrations |
| 08 | [Developer API and integrations](08-DEVELOPER-API-AND-INTEGRATIONS.md) | `/v1` API, `hyd_live_` keys, the docs site, MCP, DCC plugins |
| 09 | [Admin and operations](09-ADMIN-AND-OPERATIONS.md) | The admin app, GPU VM control, emails, analytics, runbooks |
| 10 | [Site, SEO and content](10-SITE-SEO-AND-CONTENT.md) | Routes, redirects, sitemap/robots/`llms.txt`, blog, community |
| 11 | [Decisions](11-DECISIONS.md) | Locked product and architecture decisions, and what is built vs. planned |

## Facts that surprise people

- **Auth is Clerk, the database is Supabase Postgres, and payments run on Dodo Payments.** There is no Firebase and no Stripe.
- **The frontend has almost no server code.** Business logic lives in the Express backend (`apps/backend`), and the browser calls it directly with a Clerk JWT.
- **Production and local dev run the backend differently.** On Vercel it runs as one function (`apps/backend/api/index.ts`); locally it runs as a long-lived server (`apps/backend/src/server.ts`). Only the local server runs the background job-sync loop and mounts `/api/dodo/*`. See [01](01-ARCHITECTURE.md#two-backend-entrypoints).
- **Every backend function, including a Water run, is limited to 60 seconds.** See [06](06-WATER-ENGINE.md#time-limits).
- **The backend uses the Supabase service-role key,** so row-level security does not protect anything the backend does.

## Conventions used in these docs

- Paths are relative to the repo root (`apps/...`).
- Env vars are listed by **name only.** Never paste values into a doc.
- "Cloud" and "BlueFox" mean the GPU mesh engine (catalog id `trilles`). "Water" means the LLM Three.js engine.
