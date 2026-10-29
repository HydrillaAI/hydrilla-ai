# 10 · Site, SEO and content

The frontend (`apps/frontend`) serves both the marketing site and the product app. `SITE_URL` comes from `NEXT_PUBLIC_SITE_URL` and defaults to `https://hydrilla.ai` (`apps/frontend/lib/brand.ts`).

## Route map (`apps/frontend/app/`)

**Product (sign-in required; enforced by `apps/frontend/middleware.ts`)**

| Route | What it is |
|---|---|
| `/workspace`, `/workspace/[workspaceId]` | The main create UI for Cloud and Water. `/generate` → `/workspace` |
| `/app` → `/app/studio` | The dashboard: `studio`, `assets` (`/app/image` → `?tab=images`), `usage`, `api-keys`, `settings`, `pricing`, `profile` |
| `/library`, `/generations` | Asset lists |
| `/rigging` | Rigging and animation in the browser |
| `/checkout`, `/checkout/success` | Dodo checkout ([04](04-PAYMENTS-AND-CREDITS.md#checkout-flow)) |

**Public but not indexed:** `/viewer`, `/claim/[token]`, `/sign-in`, `/sign-up`, `/integrations/connect` (plugin sign-in).

**Community (public):**
- `/discover`. A post opened from the feed shows in a modal, via the intercepting route `@modal/(..)posts/[id]`.
- `/posts/[id]` for a single post.
- `/u/[username]` for profiles. `/@username` is rewritten to `/u/username` in `next.config.js`.

**Marketing:**
- **Products:** `/`, `/bluefox`, `/water` (Water Agent), `/features`, `/text-to-3d`, `/image-to-3d`, `/pricing`, `/enterprise`, `/faq`, `/api`, `/docs`.
- **Solutions:** `/solutions/{games,film,architecture,product,xr}`.
- **Comparisons:** `/compare/{meshy,tripo,hyper3d,how-to-choose}` (+ `/compare/[slug]` from `apps/frontend/content/compare`).
- **Integrations:** `/integrations/{blender,unity,unreal,godot,mcp}`.
- **Blog:** `/blog`, `/blog/[slug]`.
- **Company:** `/about`, `/team`, `/careers`, `/research`, `/changelog`, `/brand` (noindex), `/contact`.
- **Legal:** `/privacy`, `/terms`, `/cookies`, `/security`, `/community-guidelines`.

## Redirects (`REDIRECT_PAIRS` in `apps/frontend/next.config.js`, all 301)

The site was restructured in October 2026, and old URLs redirect to new ones. Some archived docs describe it the other way round; ignore them.

| Old | New |
|---|---|
| `/bluefox3d`, `/bluefox-3d`, `/3d-ai`, `/science-technology`, `/models` | `/bluefox` |
| `/usecase/*`, `/case-study` | `/solutions/*` |
| Old blog posts (`/blog/text-to-3d`, `/blog/hydrilla-for-unity`, …) | The matching product, integration or pricing page |
| `/compare/hydrilla-vs-*`, `/compare/best-ai-3d-generators` | `/compare/<name>`, `/compare/how-to-choose` |
| `/integrations/api` | `/api` |
| `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy` | `/privacy`, `/terms`, `/cookies` |
| `/roadmap` | `/changelog` |
| `/hawan` | `/research` |
| `/earlyaccess` | `/pricing` |

Middleware also 301s `/blog?category=` and `?page=` back to `/blog`.

**When you move a page,** add a pair here, update `PUBLIC_ROUTES`, `apps/frontend/lib/nav.ts`, `llms.txt` and `llms-full.txt`, and search the code for internal links to the old path.

## Search engines and AI crawlers

| File | What it does |
|---|---|
| `apps/frontend/app/sitemap.ts` | Built from `PUBLIC_ROUTES` (`apps/frontend/lib/seo.ts`) plus community posts and profiles (`getSitemapEntries` in `apps/frontend/lib/community-server.ts`); revalidates hourly |
| `apps/frontend/app/robots.ts` | `User-agent: *`. Allows everything except the app, auth, `/viewer`, `/claim/`, `/md/` and `/integrations/connect`. AI crawlers are **not** listed by name |
| `apps/frontend/public/llms.txt`, `apps/frontend/public/llms-full.txt` | Static summaries for LLMs. They describe BlueFox, Water Agent and the Hourly plans, and carry a "Last updated" date to bump on every edit |
| `.md` mirrors | `/<page>.md` is rewritten to `apps/frontend/app/markdown-mirror/[[...path]]/route.ts`, which serves content from `apps/frontend/lib/markdown-pages.ts`. `apps/frontend/app/md/` is a legacy route that always returns 404 |

**Metadata and structured data:** these live in `apps/frontend/lib/seo.ts`.
- **Page metadata:** `createPageMetadata` (title, description, canonical, OG), `absoluteUrl`, `markdownUrl`.
- **JSON-LD builders:** `getHomepageJsonLd`, `getBlueFoxJsonLd`, `getPricingJsonLd`, `getFaqJsonLd`, `getArticleJsonLd`, `getUseCaseJsonLd`, `breadcrumbJsonLd`, among others. The entity `@id`s come from `apps/frontend/lib/brand.ts`, along with `BRAND_SENTENCE`.
- **Kit pages:** `apps/frontend/lib/kit-schema.ts` and `apps/frontend/lib/kit-markdown.ts`.

**Known inconsistencies:**
- The `bluefox` JSON-LD `@id` in `apps/frontend/lib/brand.ts` still points at `/bluefox3d#software`, which is now a redirect. Change it to `/bluefox#software`.
- Both `hydrilla.ai` and `hydrilla.co` domains appear. The site is `.ai`; the GPU gateway and the API base for the docs proxy are `api.hydrilla.co`.

## Blog

- Posts live in Supabase `blog_posts`. They are written in Admin → Blog and served by the public backend routes `/api/blog/posts`, `/posts/:slug`, `/categories` and `/slugs`.
- On publish, the backend calls `POST /api/revalidate/blog` (Bearer `BLOG_REVALIDATE_SECRET`) to refresh the ISR cache (`apps/backend/src/lib/blogRevalidate.ts`).
- Post HTML is sanitised on save (`apps/backend/src/lib/blogSanitize.ts`) and rendered by `apps/frontend/components/content/ArticleBody.tsx`.
- `apps/backend/scripts/seed-blog-posts.ts` seeds starter content.

## Community (Discover)

- **Backend:** `apps/backend/src/routes/community.ts` with `apps/backend/src/repository/community.ts`.
  - Features: posts (models a user shares from their jobs), likes, saves, comments, follows, profiles, reports and view counts.
  - Per-user write limits return 429.
- **Data:** the `community_*` tables, `user_follows` and the username tables (`apps/backend/sql/027_community_profiles_and_posts.sql`, `028a`, `028b`).
- **GLB access:** a model in a published post is viewable by anyone (`isJobPubliclyPosted` in `canServeJobGlb`).
- **Cache refresh:** writes call `POST /api/revalidate/community` (`COMMUNITY_REVALIDATE_SECRET`).
- **Moderation:** backend routes under `/api/admin/community/*`. There is no admin UI yet ([09](09-ADMIN-AND-OPERATIONS.md#admin-app-appsadmin-adminhydrillaai)).
- **Rules page:** `apps/frontend/app/community-guidelines`.

## Content sources

| Content | Where |
|---|---|
| Page copy and data | `apps/frontend/lib/content.ts`, `apps/frontend/content/` |
| Navigation and footer | `apps/frontend/lib/nav.ts` |
| Pricing copy | `apps/frontend/lib/pricing.ts` ([04](04-PAYMENTS-AND-CREDITS.md)) |
| Marketing media | Cloudinary (`apps/frontend/lib/cloudinary.ts`) |
| Brand constants | `apps/frontend/lib/brand.ts` |
