# 07 · SEO and GEO: metadata, JSON-LD, llms files, mirrors, sitemap/robots

## Goal
Make every indexable page's metadata, structured data, `.md` mirror and the site-wide text files match the kit, and make the sitemap, robots and `PUBLIC_ROUTES` consistent with each other.

## Inputs
Kit: `README.md`, `routing.md`, `seo-geo/schema.md`, `seo-geo/llms.txt`, `seo-geo/llms-full.txt`, `seo-geo/mirrors.md`, all `pages/*.md` (metadata tables), `VERIFY-LIST.md`, `reports/01-audit.md` if present.
Repo: `lib/seo.ts` (`createPageMetadata`, `PUBLIC_ROUTES`), `app/sitemap.ts`, `app/robots.ts`, `next.config.js` (the `.md` rewrite to `/md/`), `app/md/…`, the JSON-LD builders, `public/llms.txt`, `public/llms-full.txt` (or the routes that serve them; locate).

## Steps
1. **Metadata:** for every kit page, confirm title (absolute; ends `| Hydrilla AI` once), description, OG title, canonical (self, absolute `https://hydrilla.ai/<path>`), robots and OG image go through `createPageMetadata`. Fix gaps left by 04–06. Extend the helper only if needed (e.g. an absolute-title option), backwards compatible.
2. **JSON-LD per `seo-geo/schema.md`:** build each page's graph with the existing builders. Shared nodes (`#organization`, the lab node, `bluefox#model`, `features#software`) are defined once and referenced by `@id`. Use the exact strings in `schema.md`. Remove nodes the kit says to remove (e.g. copied Offer/SoftwareApplication blocks on pages that shouldn't have them). Offers only where `schema.md` puts them. FAQ/HowTo text must match the visible page text.
3. **Optional homepage lab fix (ask first).** Ask Rishi: "May I change the homepage JSON-LD so Hawan Research Labs is a subOrganization of Hydrilla AI (not its parent), per schema.md? Nothing visible changes. Yes/no?" **Wait for an explicit yes.** If yes: on `#organization` remove `parentOrganization` and add `subOrganization` → lab; on the lab node remove `subOrganization`, add `parentOrganization` → `#organization`, set its description per `schema.md`. Change nothing else in the homepage graph or page. If no or no answer: leave the homepage untouched and record "not approved". Non-homepage pages use the corrected relationship either way, per `schema.md`.
4. **llms files:** replace `llms.txt` and `llms-full.txt` with the kit's `seo-geo/llms.txt` and `seo-geo/llms-full.txt`, byte for byte (keep the serving mechanism). If the kit file still contains `[VERIFY` or `<placeholder>` text, don't publish it silently: copy it, list each line, and flag it as launch-blocking. They must contain no "AI for 3D".
5. **`.md` mirrors per `seo-geo/mirrors.md`:** every indexable non-homepage route in `routing.md` has a mirror at `<path>.md` returning 200 with `Content-Type: text/markdown`, generated from the same source as the HTML (H1, sections in order, tables, FAQ). Add an HTTP `Link: <https://hydrilla.ai/<path>>; rel="canonical"` header. Emit `rel="alternate" type="text/markdown"` only on pages whose mirror returns 200. `/md/*` direct access → 404 or 301 per `mirrors.md`. No mirrors for noindex or signed-in routes. Mirrors of non-homepage pages contain no "AI for 3D". **Leave `/index.md` (the homepage mirror) unchanged.**
6. **Sitemap / robots / PUBLIC_ROUTES:** the three sets agree: sitemap = `PUBLIC_ROUTES` = indexable routes in `routing.md`; `lastmod` uses content dates if the kit gives them (not build time). `robots.ts` per the kit (e.g. one `User-agent: *` group; disallow signed-in paths, `/md/`; don't disallow noindex pages like `/brand` whose noindex must be seen; keep the `Sitemap:` line). Don't change AI-crawler or training-signal directives unless the kit says so.
7. Validate: parse every page's JSON-LD with `JSON.parse` in a small script under `<kit>/scripts/` (Node built-ins only); if network use is allowed, spot-check 3 pages in the Schema.org validator / Rich Results Test and paste results.

## Acceptance criteria
- Script table for every indexable route: title ✓, description ✓, canonical ✓, robots ✓, JSON-LD parses ✓, types match `schema.md` ✓, `.md` 200 ✓, `Link` canonical header ✓, alternate tag only if mirror 200 ✓.
- `curl -s localhost:3000/llms.txt | diff - <kit>/seo-geo/llms.txt` → no diff; same for `llms-full.txt`.
- `rg -n "AI for 3D|BlueFox 3D"` on llms files, non-homepage mirrors and schema output → 0 hits (Hugging Face href excepted).
- No schema node makes Hawan Research Labs the parent, creator, developer or publisher of Hydrilla.
- Homepage: either no diff at all, or (with Rishi's quoted yes) a diff limited to the JSON-LD lab relationship and lab description.
- `/sitemap.xml` URL set == `PUBLIC_ROUTES` == `routing.md` indexable list (paste the diff, expected empty). `/md/features` doesn't serve 200.
- Build, lint, typecheck pass.

## Guardrails (identical in every phase prompt; they override anything else)
1. **Reuse.** Use the existing components, layouts and design system (tokens, type, spacing, icons). Add no new dependency unless it is needed; if you add one, justify it in the report (why existing code can't do it, package name, size).
2. **Copy exactly.** Take every visible string from the kit files, character for character (punctuation, capitals, links). Never invent facts, copy, stats, testimonials, logos, images or claims. If copy is missing, leave a marked `TODO(kit): <what is missing>` and list it in the report. No filler, no "improvements".
3. **Homepage.** Don't edit any visible homepage text or component. The only homepage item is the hidden JSON-LD fix making Hawan Research Labs a `subOrganization` of Hydrilla AI (not its parent); it is OPTIONAL and applied only if Rishi explicitly approves it during the prompt run (ask and wait for a yes before touching it; phase 07). "AI for 3D" is removed only from non-homepage pages, `llms.txt` / `llms-full.txt`, and `.md` mirrors of non-homepage pages; homepage occurrences stay as they are. Exception (Rishi approved, 2026-10-24): the new shared header and footer from `nav-footer.md` apply site-wide, homepage included; apply them on `/` without asking. Everything else on the homepage (body text, sections, components) stays unchanged. If "AI for 3D" sits inside the shared logo/logo lockup, ask Rishi before changing it.
4. **Checks.** After the phase, run build, lint and typecheck with the repo's own scripts (e.g. `npm run build`, `npm run lint`, `npx tsc --noEmit`, or the pnpm/yarn equivalents). Fix failures this phase caused. Report pre-existing failures; don't fix them.
5. **Stop.** End with the diff summary: files changed, routes affected, anything skipped or flagged, open questions. Then STOP for review. Don't start the next phase.
6. **Git.** Work only on branch `site-rebuild` (create it from the default branch if it doesn't exist), one commit per phase that changes files: `site-rebuild: phase NN <name>`. Never push to production, never deploy, never change env vars, secrets, hosting, CDN or deployment config. Don't push the branch unless Rishi asks.
- Don't delete existing pages, routes or components the kit doesn't cover; flag them. Never edit kit files.
- Kit files are the source of truth and beat plan docs, the live site and your judgment. If two kit files conflict, stop and ask.

## Deliverable / stop
Deliverable format from `00-master.md`, plus the validation table, Rishi's answer on the homepage lab fix (quoted, or "not asked / not approved"), and launch-blocking `[VERIFY]` lines in the text files. Commit `site-rebuild: phase 07 seo-geo`, then STOP: "Phase 07 complete. Waiting for review before phase 08."
