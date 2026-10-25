# 00 · Master prompt: hydrilla.ai site rebuild

Paste this file at the start of **every** Cursor session, then paste the one phase prompt for that session (01 to 08). One phase per session, in order. Stop between phases.

## Context
You are working in the hydrilla.ai Next.js repo (App Router). The goal is to rebuild the marketing site from a prepared build kit. Nothing is deployed from this work; Rishi reviews every phase.

Brand facts (for spotting errors, not for writing copy; all copy comes from the kit):
- **Hydrilla AI** is the main brand: the company and the product. "Hydrilla" for short.
- **Hawan Research Labs** is Hydrilla AI's research lab, under Hydrilla AI. In schema it is a `subOrganization` of the Hydrilla AI Organization; never its parent, developer or publisher.
- **BlueFox** is Hydrilla's flagship 3D model. Copy says "BlueFox". "BlueFox 1" appears only where the version matters (spec tables, model card, docs, changelog, llms files, schema `softwareVersion`), exactly as the kit writes it. **"BlueFox 3D" / "BlueFox3D" never appear in copy, titles, nav or alt text.** The only allowed occurrences are old-route redirect sources (`/bluefox3d`, `/bluefox-3d`) and the Hugging Face repo URL `https://huggingface.co/Hydrilla/BlueFox3D` used as an href.
- **Water Agent** is a key product: public page `/water`, app at `/app/water`.
- Meshy, Tripo and Hyper3D are named only on `/compare` pages.
- Banned in new copy: "Pixal3d", "BlueFox 3D", "BlueFox3D" (outside the exceptions above), and "AI for 3D" (remove it from non-homepage pages, `llms.txt`, `llms-full.txt` and non-homepage `.md` mirrors).
- **Homepage `/` is frozen (Rishi):** no visible text or component changes, except that the new shared header and footer apply site-wide including `/` (approved). Only other homepage item: the hidden JSON-LD lab fix, and only after Rishi says yes during the run. Homepage "AI for 3D" or "BlueFox 3D" occurrences stay as they are.

## Where things are
**Build kit** (source of truth). Before anything else, ask Rishi to confirm where the kit lives in the repo; the default is a `BUILD-KIT/` folder at the repo root. All kit paths below are relative to that folder:
- `README.md`: how the kit is organised, file-to-route mapping, any conventions (read first, every phase)
- `pages/<route>.md`: final copy per page (nested routes use a hyphen, e.g. `pages/integrations-blender.md` for `/integrations/blender`; confirm in README)
- `routing.md`: routes, 301s, `PUBLIC_ROUTES`, sitemap, noindex
- `nav-footer.md`: header menus and footer columns
- `seo-geo/schema.md`, `seo-geo/llms.txt`, `seo-geo/llms-full.txt`, `seo-geo/mirrors.md`
- `VERIFY-LIST.md`: facts still awaiting Rishi's confirmation
- `QA-CHECKLIST.md`: final checks
- `prompts/`: these prompts
- `reports/01-audit.md`: the phase 01 report, if Rishi saved it (later phases read it when present)

**Repo landmarks** (known from the live site; confirm exact paths in phase 01):
- `lib/seo.ts`: `createPageMetadata` (per-page metadata; title template `… | Hydrilla`) and `PUBLIC_ROUTES` (indexed routes)
- `app/sitemap.ts`, `app/robots.ts`
- `next.config.js`: redirects, plus the rewrite that serves `<path>.md` from `app/md` (`/md/...`)
- `lib/nav.ts`: primary nav and `FOOTER_NAV`
- `public/llms.txt`, `public/llms-full.txt` (or a route that serves them; locate)
- JSON-LD builders (locate; the homepage has an `@graph` with `#organization` and a Hawan Research Labs node)
Any other path: locate it in the repo. Don't assume.

## How to read a kit page file
Kit README conventions win. If the README doesn't say otherwise:
- **Metadata table:** Title, Meta description, OG title, Canonical/robots. Kit titles already end in `| Hydrilla AI`, so set them as **absolute** titles; never let the `… | Hydrilla` template append a second suffix.
- Render only the text between `<!-- COPY:START -->` and `<!-- COPY:END -->`.
- Not rendered: `**[Section N: …]**` labels (structure only), `> Headline options…` notes, footer notes, "Facts used" tables, word counts.
- `Eyebrow:` / `Kicker:` → the existing eyebrow/kicker slot. `Card N title:` / `Card N line:` → the existing card component. Tables → the existing table component. `Caption:` → caption.
- `Visual:` → a placeholder in the existing media slot with `TODO(kit): visual – <description>`. Don't generate, source or reuse unrelated images. `Alt text:` → that image's `alt`.
- `[VERIFY …]` tags are not page text: don't render the bracket tag; keep the sentence exactly as written; put a code comment `VERIFY: <tag text>` next to it; list it in the report. Every one must match an item in `VERIFY-LIST.md`; flag any that don't.
- Links: use the exact hrefs and anchor text. In-page anchors the kit links to must exist as `id`s (e.g. `/features#exports`, `/bluefox#limits`, `/bluefox#specs`, `/docs#scale`, `/docs#water`, `/integrations#sign-in`, `/research#model-card`, `/enterprise#contact`).
- `CTAs` table: button labels and destinations, as written.

## Phases (one per session, in order)
| # | File | Edits? | Scope |
|---|---|---|---|
| 01 | `01-audit.md` | No | Map repo vs kit, report gaps |
| 02 | `02-routing-redirects.md` | Yes | Redirects (single-hop 301s), route renames, `PUBLIC_ROUTES`, sitemap, noindex |
| 03 | `03-nav-footer.md` | Yes | Header, footer, `lib/nav.ts`; "AI for 3D" off non-homepage surfaces |
| 04 | `04-pages-product.md` | Yes | `/features`, `/bluefox`, `/water`, `/text-to-3d`, `/image-to-3d`, `/pricing`, `/api` |
| 05 | `05-pages-integrations-solutions.md` | Yes | `/integrations` + 5 children, `/solutions` + 5 children |
| 06 | `06-pages-compare-company-resources.md` | Yes | Compare, company, resources (and other kit pages) |
| 07 | `07-seo-geo.md` | Yes | Metadata, JSON-LD (optional homepage lab fix, only on Rishi's yes), llms files, `.md` mirrors, sitemap/robots |
| 08 | `08-qa.md` | No fixes until listed | Full QA, pass/fail report |

## Session routine
1. Confirm the kit location; read `README.md` and the kit files named in the phase prompt (and `reports/01-audit.md` if present).
2. Check out `site-rebuild`; confirm the previous phase's commit is there and the tree is clean. If not, stop and report.
3. Do only what the phase prompt says.
4. Run build, lint, typecheck. For runtime checks: `next build && next start` (port 3000) locally only.
5. Commit (phases that change files): `site-rebuild: phase NN <name>`.
6. Post the deliverable (format below) and STOP.

## Deliverable format (every phase)
```
Phase NN – <name> – DONE | BLOCKED
Branch / commit: site-rebuild @ <sha>
Files changed: <path – one-line why>
Routes affected: <route – new | rewritten | renamed | redirected | metadata only>
Checks: build ✅/❌ · lint ✅/❌ · typecheck ✅/❌ (pre-existing failures noted)
TODO(kit) / VERIFY items: <list>
Skipped / flagged: <list with reason>
Open questions for Rishi: <list>
Next: phase NN+1 (not started)
```

## Guardrails (identical in every phase prompt; they override anything else)
1. **Reuse.** Use the existing components, layouts and design system (tokens, type, spacing, icons). Add no new dependency unless it is needed; if you add one, justify it in the report (why existing code can't do it, package name, size).
2. **Copy exactly.** Take every visible string from the kit files, character for character (punctuation, capitals, links). Never invent facts, copy, stats, testimonials, logos, images or claims. If copy is missing, leave a marked `TODO(kit): <what is missing>` and list it in the report. No filler, no "improvements".
3. **Homepage.** Don't edit any visible homepage text or component. The only homepage item is the hidden JSON-LD fix making Hawan Research Labs a `subOrganization` of Hydrilla AI (not its parent); it is OPTIONAL and applied only if Rishi explicitly approves it during the prompt run (ask and wait for a yes before touching it; phase 07). "AI for 3D" is removed only from non-homepage pages, `llms.txt` / `llms-full.txt`, and `.md` mirrors of non-homepage pages; homepage occurrences stay as they are. Exception (Rishi approved, 2026-10-24): the new shared header and footer from `nav-footer.md` apply site-wide, homepage included; apply them on `/` without asking. Everything else on the homepage (body text, sections, components) stays unchanged. If "AI for 3D" sits inside the shared logo/logo lockup, ask Rishi before changing it.
4. **Checks.** After the phase, run build, lint and typecheck with the repo's own scripts (e.g. `npm run build`, `npm run lint`, `npx tsc --noEmit`, or the pnpm/yarn equivalents). Fix failures this phase caused. Report pre-existing failures; don't fix them.
5. **Stop.** End with the diff summary: files changed, routes affected, anything skipped or flagged, open questions. Then STOP for review. Don't start the next phase.
6. **Git.** Work only on branch `site-rebuild` (create it from the default branch if it doesn't exist), one commit per phase that changes files: `site-rebuild: phase NN <name>`. Never push to production, never deploy, never change env vars, secrets, hosting, CDN or deployment config. Don't push the branch unless Rishi asks.
- Don't delete existing pages, routes or components the kit doesn't cover; flag them. Never edit kit files.
- Kit files are the source of truth and beat plan docs, the live site and your judgment. If two kit files conflict, stop and ask.
