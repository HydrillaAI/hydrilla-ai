# `.md` mirrors, llms files, and robots

## `.md` mirrors
| Rule | Detail |
|---|---|
| Every indexable page has a mirror at `<path>.md` | All 41 non-home routes in `routing.md` section 1 (including `/water`, `/text-to-3d`, `/image-to-3d`, `/solutions/*`, `/compare/*`, the two new posts, the integration pages that 404 today, and the legal pages). Homepage: `/index.md` (unchanged content). |
| No mirror for noindex, signed-in, or app routes | `/brand`, `/app/*`, `/library`, `/rigging`, `/integrations/connect`, `/workspace`, `/checkout` |
| A mirror is the page's own content | H1, sections in order, tables, FAQ answers, and links as absolute URLs. Generate it from the same source as the HTML so they can't drift. The page text in `seo-geo/llms-full.txt` shows the expected shape for each page. No `Visual:`/`Alt text:` lines, no section labels. |
| No homepage lines in other mirrors | Today `features.md` repeats the homepage H1 and meta. Fix it. |
| No "AI for 3D" in any non-home mirror | The homepage mirror `/index.md` is left as it is (homepage body frozen). |
| Canonical header | Every `.md` response sends `Link: <https://hydrilla.ai/<path>>; rel="canonical"` and `Content-Type: text/markdown; charset=utf-8`. |
| Advertise only real mirrors | The HTML `<link rel="alternate" type="text/markdown">` is emitted only where the mirror returns 200. |
| `/md/<path>` is not public | Return 404 or 301 to `<path>.md`. Today `/md/features` serves 200. |
| Redirected routes' mirrors redirect too | `/usecase/gamedev.md` → `/solutions/games.md`, `/bluefox3d.md` → `/bluefox.md`, and so on (one hop, same table as `routing.md` section 2). |

## llms files
- Replace `public/llms.txt` (or the route that serves it) with `seo-geo/llms.txt`, and `public/llms-full.txt` with `seo-geo/llms-full.txt`, word for word.
- If `llms-full.txt` is generated at build time instead, it must produce the same content from the page sources, with the pricing facts pulled from the same source as `/pricing` so numbers can't drift.
- Set "Last updated" to the content date at publish (2026-10-24 for this release).
- Neither file is in the nav, footer, or sitemap.

## robots.txt (`app/robots.ts`)
Keep AI crawlers allowed. Changes from live:
1. Collapse the 12 identical groups into one `User-agent: *` group (if Rishi wants named agents visible, generate every group from one shared list).
2. Remove `Disallow: /brand` (the page is noindex; a disallowed URL never shows its noindex).
3. Add `Disallow: /integrations/connect` and `Disallow: /claim/`.
4. Use consistent no-trailing-slash prefixes (`/sign-in/` doesn't match `/sign-in`).
5. Remove `Host:` (Yandex-only).
6. Remove `Disallow: /earlyaccess` (it now 301s to `/pricing`; crawlers must see the redirect).
7. Keep the `Sitemap:` line. Leave any training-signal directives as they are (Rishi's call).

```text
User-agent: *
Allow: /
Disallow: /app/
Disallow: /workspace
Disallow: /generate
Disallow: /generations
Disallow: /library
Disallow: /checkout
Disallow: /rigging
Disallow: /sign-in
Disallow: /sign-up
Disallow: /viewer
Disallow: /claim/
Disallow: /md/
Disallow: /integrations/connect

Sitemap: https://hydrilla.ai/sitemap.xml
```

`/water` (the public page) is not blocked. `/app/water` (the app) is covered by `/app/`.
