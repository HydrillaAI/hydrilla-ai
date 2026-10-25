# QA checklist (run before Rishi's review; nothing deploys without him)

## Homepage
- [ ] Homepage body is byte-for-byte unchanged: copy, metadata, sections, FAQ, Free-plan lines (diff the rendered HTML `<main>` against production).
- [ ] The new shared header and footer render on `/` (approved by Rishi, 2026-10-24).
- [ ] The homepage JSON-LD is unchanged unless Rishi approved the optional lab fix.

## Routing
- [ ] Every route in `routing.md` section 1 returns 200, with a self-canonical.
- [ ] Every redirect source in section 2 returns exactly one 301/308, then a 200 (`curl -sIL`), including the slash and `.md` variants.
- [ ] `/bluefox` returns 200 (the old `/bluefox` → `/bluefox3d` rule is gone) and `/bluefox3d` → `/bluefox` in one hop. No loops.
- [ ] `/privacy`, `/terms`, `/cookies` return 200; the old long URLs 301 to them.
- [ ] Merged blog posts and old compare slugs redirect (they're not still served by the blog or compare sources).
- [ ] `sitemap.xml` lists exactly the 42 indexable routes; no redirects, no `/brand`, no `.md`, no app routes.
- [ ] `/brand` and all app routes are noindex. `/brand` isn't disallowed in robots.

## Pages
- [ ] Every page file in `pages/` is built: title (absolute, ends "| Hydrilla AI" once), meta description, OG title, H1, sections in order, CTAs, internal links.
- [ ] One H1 per page.
- [ ] In-page anchors exist: `/features#exports`, `/bluefox#specs`, `/bluefox#limits`, `/docs#preview`, `/docs#export`, `/docs#scale`, `/docs#water`, `/integrations#sign-in`, `/research#model-card`, `/enterprise#contact`, `/terms#ownership`.
- [ ] Every internal link resolves to 200 (no redirect hops in internal links).
- [ ] No page body is over 600 words.
- [ ] `Visual:` slots are placeholders (TODO), not invented or unrelated images.

## Copy rules (scan the rendered HTML, mirrors, llms files, and JSON-LD)
- [ ] No `[VERIFY`, OQ numbers, S-numbers, or other plan jargon.
- [ ] No "AI for 3D" outside the homepage body.
- [ ] No "BlueFox 3D" or "BlueFox3D" in visible text, titles, nav, or alt text (allowed only in redirect sources and the Hugging Face URL as an href).
- [ ] "BlueFox, Hydrilla's 3D model" on each page's first prose mention of BlueFox; "BlueFox 1" only in spec, model-card, docs, changelog, compare-table, llms, and schema spots.
- [ ] Brand line "Hydrilla AI is an AI 3D workspace for studio and artist pipelines." only on `/about` (hero and meta), `/brand`, the llms files, and the Organization schema.
- [ ] No BYOK, "bring your own key", "own key", "pick the model", and no "API key" near Water Agent.
- [ ] Format lists (GLB, FBX, OBJ, USDZ) only on `/features#exports`, `/integrations` pages, `/docs`, and the `/blog/import-ai-meshes` how-to. No "export or send to Blender, Unity, Unreal" elsewhere.
- [ ] No per-plan formats and no "no card needed" on `/pricing`. "33% off" only with Hourly Pro. No "40%".
- [ ] No SSO / single sign-on, SLA / service-level agreement, early access, beta, or waitlist. No claim of training on customer data.
- [ ] "Clerk" only on `/security`.
- [ ] Meshy, Tripo, and Hyper3D named only on `/compare` pages, with no partner, licensed, official, or "available in Hydrilla" wording.
- [ ] Hawan Research Labs is always Hydrilla AI's research lab, never its developer or parent.
- [ ] No banned words: revolutionary, game-changing, cutting-edge, state-of-the-art, next-gen, unleash, unlock, supercharge, seamless, effortless, magic, world-class, best-in-class, industry-leading, leverage, empower, elevate, delve, production-ready (non-home). No em dashes or exclamation marks in copy.

## SEO and GEO
- [ ] JSON-LD per `seo-geo/schema.md`; validate with the Rich Results Test. FAQPage and HowTo text matches the visible text.
- [ ] `/llms.txt` and `/llms-full.txt` match `seo-geo/` word for word (Last updated 2026-10-24).
- [ ] Every indexable route has a `.md` mirror with a canonical `Link` header; `/md/*` isn't public.
- [ ] `robots.txt` matches `seo-geo/mirrors.md`.
- [ ] OG images are 1200 x 630 PNG or JPEG.

## Kit QA (already run on the kit; re-run after edits)
`python3 qa/kit_qa.py` from the kit root. It checks banned terms, `[VERIFY]` leftovers, plan jargon, word counts, the export-phrase owner rule, BlueFox naming, the brand line, and redirect chains. Results from the last run: `qa/kit_qa_results.txt`.
