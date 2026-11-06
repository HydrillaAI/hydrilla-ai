# Routing: routes, redirects, PUBLIC_ROUTES, sitemap, noindex

Source of truth: `ROUTING-FULL.md` (live) plus the approved URL scheme (Rishi, 24 Oct 2026). Nothing here is deployed until Rishi says so. Repo paths (`lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `next.config.js`, `lib/integrations.ts`, `content/compare/`) come from the earlier docs; confirm them in the repo before editing.

## 0. Do these in the same deploy, or the site loops
1. **Remove the live `/bluefox` → `/bluefox3d` redirect** (and `/bluefox/`). `/bluefox` becomes the real model page. Then add `/bluefox3d` → `/bluefox`. If both rules exist at once, visitors loop.
2. **Remove the live `/privacy` → `/privacy-policy` and `/terms` → `/terms-and-conditions` rules**, then add the reversed ones below.
3. **Replace** the live `/blog?category=` and `/blog?page=` rules (they point at `/blog/category/*` and `/blog/page/*`, which would chain).
4. **Repoint** every old alias that targets `/bluefox3d`, `/usecase`, or `/about` (roadmap) straight to its final target, as listed in section 2.

## 1. Final public routes (43)
All self-canonical, `index, follow`, with a `.md` mirror, unless stated. Page copy for each route is in `pages/` (file name = route with `/` replaced by `-`; `/` is the homepage and has no page file).

| Route | Page file | Status | Sitemap priority | In llms.txt |
|---|---|---|---|---|
| `/` | none (homepage body frozen) | Body untouched; new shared header and footer apply; optional hidden schema fix, see section 7 | 1.0 weekly | yes (`/index.md`) |
| `/features` | `features.md` | Rewrite | 0.9 weekly | yes |
| `/bluefox` | `bluefox.md` | Rewrite + rename from `/bluefox3d` | 0.9 monthly | yes |
| `/water` | `water.md` | **New** (live 404 today) | 0.9 monthly | yes |
| `/text-to-3d` | `text-to-3d.md` | **New** | 0.9 monthly | yes |
| `/image-to-3d` | `image-to-3d.md` | **New** | 0.9 monthly | yes |
| `/integrations` | `integrations.md` | Rewrite | 0.7 weekly | yes |
| `/integrations/blender` | `integrations-blender.md` | Rewrite | 0.6 monthly | yes |
| `/integrations/unity` | `integrations-unity.md` | Rewrite | 0.6 monthly | yes |
| `/integrations/unreal` | `integrations-unreal.md` | Rewrite | 0.6 monthly | yes |
| `/integrations/godot` | `integrations-godot.md` | Rewrite | 0.5 monthly | yes |
| `/integrations/mcp` | `integrations-mcp.md` | Rewrite | 0.5 monthly | yes |
| `/api` | `api.md` | Rewrite | 0.8 monthly | yes |
| `/pricing` | `pricing.md` | Rebuilt lean | 0.9 weekly | yes |
| `/solutions` | `solutions.md` | Rename from `/usecase` | 0.7 monthly | yes |
| `/solutions/games` | `solutions-games.md` | Rename from `/usecase/gamedev` | 0.7 monthly | yes |
| `/solutions/film` | `solutions-film.md` | Rename from `/usecase/filmproduction` | 0.6 monthly | yes |
| `/solutions/architecture` | `solutions-architecture.md` | Rename from `/usecase/architecture` | 0.6 monthly | yes |
| `/solutions/xr` | `solutions-xr.md` | Rename from `/usecase/arvr` | 0.6 monthly | yes |
| `/solutions/product` | `solutions-product.md` | Rename from `/usecase/productdesign` | 0.6 monthly | yes |
| `/enterprise` | `enterprise.md` | Rewrite | 0.8 monthly | yes |
| `/docs` | `docs.md` | Trim | 0.7 monthly | yes |
| `/faq` | `faq.md` | Narrow | 0.6 monthly | yes |
| `/blog` | `blog.md` | Rewrite intro | 0.5 weekly | yes |
| `/blog/reference-images` | `blog-reference-images.md` | **New** | 0.5 monthly | yes |
| `/blog/import-ai-meshes` | `blog-import-ai-meshes.md` | **New** | 0.5 monthly | yes |
| `/changelog` | `changelog.md` | Keep, extend | 0.5 weekly | yes |
| `/compare` | `compare.md` | Rewrite | 0.6 monthly | yes |
| `/compare/meshy` | `compare-meshy.md` | Rename + rewrite | 0.6 monthly | yes |
| `/compare/tripo` | `compare-tripo.md` | Rename + rewrite | 0.6 monthly | yes |
| `/compare/hyper3d` | `compare-hyper3d.md` | **New** | 0.6 monthly | yes |
| `/compare/trellis` | `compare-trellis.md` | **New** | 0.6 monthly | yes |
| `/compare/sloyd` | `compare-sloyd.md` | **New** | 0.6 monthly | yes |
| `/compare/how-to-choose` | `compare-how-to-choose.md` | **New** (replaces the "best" article) | 0.6 monthly | yes |
| `/about` | `about.md` | Rewrite | 0.7 monthly | yes |
| `/research` | `research.md` | Rewrite | 0.7 monthly | yes |
| `/team` | `team.md` | Keep | 0.5 monthly | yes |
| `/careers` | `careers.md` | Light rewrite | 0.5 monthly | yes |
| `/contact` | `contact.md` | Rewrite | 0.6 monthly | yes |
| `/security` | `security.md` | Extend | 0.6 monthly | yes |
| `/privacy` | `privacy.md` | Rename from `/privacy-policy`, metadata only | 0.2 yearly | Optional section |
| `/terms` | `terms.md` | Rename from `/terms-and-conditions`, metadata only | 0.2 yearly | Optional section |
| `/cookies` | `cookies.md` | Rename from `/cookie-policy`, metadata only | 0.2 yearly | Optional section |
| `/brand` | `brand.md` | Keep, unlinked. **noindex, nofollow** | not in sitemap | no |

42 indexable routes (including `/`) plus `/brand`. Use the content date for `lastmod`, not the build time.

## 2. Redirect map: 301, one hop, straight to the final target
Each rule matches the slash form, the no-slash form, and the `.md` form (for example `/usecase/gamedev.md` → `/solutions/games.md`). The old `.md` → new `.md` mapping is the same table with `.md` appended to both sides. Either 301 or 308 is fine; use `permanent: true`.

| Source (plus `/` and `.md` variants) | Target | Note |
|---|---|---|
| `/bluefox3d` | `/bluefox` | New. Remove the live reverse rule in the same deploy |
| `/bluefox-3d` | `/bluefox` | Repointed (was `/bluefox3d`) |
| `/3d-ai` | `/bluefox` | Repointed |
| `/science-technology` | `/bluefox` | Repointed |
| `/models` | `/bluefox` | Repointed. No Models hub |
| `/usecase` | `/solutions` | Rename |
| `/usecase/gamedev` | `/solutions/games` | Rename |
| `/usecase/filmproduction` | `/solutions/film` | Rename |
| `/usecase/architecture` | `/solutions/architecture` | Rename |
| `/usecase/arvr` | `/solutions/xr` | Rename |
| `/usecase/productdesign` | `/solutions/product` | Rename |
| `/case-study` | `/solutions` | Repointed (was `/usecase`, would chain) |
| `/blog/text-to-3d` | `/text-to-3d` | Merged into the owner |
| `/blog/image-to-3d` | `/image-to-3d` | Merged |
| `/blog/export-formats` | `/features` | Merged (exports section) |
| `/blog/hydrilla-for-unity` | `/integrations/unity` | Merged |
| `/blog/hydrilla-for-unreal` | `/integrations/unreal` | Merged |
| `/blog/hydrilla-for-blender` | `/integrations/blender` | Merged |
| `/blog/hydrilla-pricing-explained` | `/pricing` | Merged |
| `/blog/how-bluefox-works` | `/bluefox` | Merged |
| `/blog/category/:any*` | `/blog` | Categories cut |
| `/blog/page/:n` | `/blog` | Empty pagination |
| `/blog?category=<name>`, `/blog?page=<n>` | `/blog` (drop the query) | Replaces the live rules |
| `/compare/hydrilla-vs-meshy` | `/compare/meshy` | Rename |
| `/compare/hydrilla-vs-tripo` | `/compare/tripo` | Rename |
| `/compare/hydrilla-vs-luma` | `/compare` | Article cut |
| `/compare/best-ai-3d-generators` | `/compare/how-to-choose` | Replaced |
| `/integrations/api` | `/api` | Same intent |
| `/privacy-policy` | `/privacy` | Remove the live `/privacy` → `/privacy-policy` rule |
| `/terms-and-conditions` | `/terms` | Remove the live `/terms` → `/terms-and-conditions` rule |
| `/cookie-policy` | `/cookies` | Rename |
| `/hawan` | `/research` | Keep the live rule. Not linked, not in the sitemap |
| `/roadmap` | `/changelog` | Repointed (was `/about`) |
| `/earlyaccess` | `/pricing` | Was a 307 to signed-in `/app/pricing`. There is no early-access programme |
| `https://www.hydrilla.ai/:path*` | `https://hydrilla.ai/<final path>` | Host redirect at the edge, one hop even for old paths on www |
| `http://hydrilla.ai/:path*` | `https://hydrilla.ai/:path*` | Check the host already does this |

**No chains, no loops:** no target in this table is also a source. `/bluefox` is a target only. Check after deploy with `curl -sIL` on every source: exactly one 3xx, then a 200.

**App redirects (not SEO, keep):** `/generate` → `/workspace` (302; ideally have auth middleware send logged-out users straight to `/sign-in?redirect_url=/workspace`). `/app` opens `/app/studio` in the page.

## 3. `PUBLIC_ROUTES` changes (`lib/seo.ts`)
Remove: `/bluefox3d`, `/usecase`, `/usecase/gamedev`, `/usecase/filmproduction`, `/usecase/architecture`, `/usecase/arvr`, `/usecase/productdesign`, `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`.

Add: `/bluefox`, `/water`, `/text-to-3d`, `/image-to-3d`, `/solutions`, `/solutions/games`, `/solutions/film`, `/solutions/architecture`, `/solutions/xr`, `/solutions/product`, `/privacy`, `/terms`, `/cookies`.

Keep: `/`, `/features`, `/pricing`, `/docs`, `/api`, `/integrations`, `/enterprise`, `/faq`, `/blog`, `/changelog`, `/compare`, `/about`, `/research`, `/team`, `/careers`, `/contact`, `/security`.

Dynamic sources (added in `app/sitemap.ts`, not in `PUBLIC_ROUTES`):
- Integration slugs (`lib/integrations.ts`): `blender`, `unity`, `unreal`, `godot`, `mcp`. Remove any `api` or `connect` slug from the sitemap (`/integrations/api` is a redirect; `/integrations/connect` is signed-in).
- Blog slugs: only `reference-images` and `import-ai-meshes`. The merged posts in section 2 must leave the blog source, or they will 200 instead of redirecting.
- Compare articles (`content/compare/`): `meshy`, `tripo`, `hyper3d`, `how-to-choose`. Remove `hydrilla-vs-meshy`, `hydrilla-vs-tripo`, `hydrilla-vs-luma`, `best-ai-3d-generators`.

Titles: every kit title already ends in "| Hydrilla AI". Set them as absolute titles (`absoluteTitle: true`) so the `%s | Hydrilla` template doesn't add a second suffix.

## 4. Sitemap (`app/sitemap.ts`)
Exactly the 42 indexable routes in section 1 (`/` plus 41), with the priorities shown. Not listed: `/brand`, every redirect source, every `.md` mirror, `/llms.txt`, `/llms-full.txt`, and every route in section 5.

## 5. noindex and robots
**noindex, nofollow (and disallowed in robots, except `/brand`):** `/app/*` (including `/app/water`, `/app/studio`, `/app/api-keys`), `/workspace`, `/workspace/<id>`, `/generate`, `/generations`, `/viewer`, `/checkout`, `/checkout/success`, `/claim/<token>`, `/sign-in`, `/sign-up`, `/library`, `/rigging`, `/integrations/connect`, `/md/*`.

**`/brand`:** noindex, nofollow, but **not** disallowed in robots, so crawlers can see the noindex. Not in nav, footer, sitemap, or llms. The robots file itself is in `seo-geo/mirrors.md`.

None of these routes appears in the nav, footer, sitemap, or llms files. In-page buttons may link to them (for example `/app/studio`, `/app/water`, `/app/api-keys`).

## 6. Mirrors
Every indexable route gets `<path>.md` (homepage `/index.md`). Details in `seo-geo/mirrors.md`.

## 7. Homepage (body frozen)
No change to the homepage body: copy, metadata, sections, FAQ, and the Free-plan lines stay exactly as they are (Rishi, 24 Oct 2026). The new shared header and footer (`nav-footer.md`) do apply on `/` too (approved by Rishi on 2026-10-24).

**OPTIONAL, not visible, needs Rishi's yes before it ships:** fix the homepage JSON-LD so Hawan Research Labs is a `subOrganization` of Hydrilla AI (and the lab node gets `parentOrganization` → `#organization`), removing today's reversed links. Exact change in `seo-geo/schema.md` section 2. If Rishi says no, leave the homepage JSON-LD as it is.
