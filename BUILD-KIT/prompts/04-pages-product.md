# 04 · Product pages

## Goal
Build or rewrite the product pages from the kit copy, reusing the existing design system: `/features`, `/bluefox`, `/water`, `/text-to-3d`, `/image-to-3d`, `/pricing`, `/api`.

## Inputs
Kit: `README.md`, `pages/features.md`, `pages/bluefox.md`, `pages/water.md`, `pages/text-to-3d.md`, `pages/image-to-3d.md`, `pages/pricing.md`, `pages/api.md`, `routing.md` (paths, index status), `VERIFY-LIST.md`, `reports/01-audit.md` if present.
Repo: `lib/seo.ts` (`createPageMetadata`), the existing page templates and components, the route folders moved in phase 02.

| Route | Status (per routing plan; confirm in `routing.md`) | Notes |
|---|---|---|
| `/features` | Rewrite | Owns `#exports` (the format list). Its old H1 is a homepage line; replace it with the kit H1 |
| `/bluefox` | Renamed from `/bluefox3d` in 02; rewrite | Needs `#specs` and `#limits` if the kit uses them. "BlueFox 1" only where the kit writes it |
| `/water` | New | Water Agent. CTAs go to `/app/water` and `/docs#water` per the kit |
| `/text-to-3d` | New | |
| `/image-to-3d` | New | |
| `/pricing` | Rebuild lean | Monthly / Hourly toggle, plan cards, compare table, FAQ, CTA. Reuse the existing toggle/card/table; plan buttons go to `/checkout?plan=…` exactly as the kit says. Keep existing checkout wiring; don't change billing logic or prices in code beyond the displayed copy, and flag any mismatch between kit prices and pricing data in code |
| `/api` | Rewrite | |

## Steps (per page)
1. Read the kit page file in full. Follow the kit README conventions (fallback: "How to read a kit page file" in `00-master.md`): render only the text between `COPY:START` and `COPY:END`; section labels, headline-option notes and footer notes aren't rendered; `Visual:` becomes a `TODO(kit)` placeholder in the existing media slot; `[VERIFY …]` tags become code comments, not visible text.
2. Build the page from existing templates and components (see the reuse map in `reports/01-audit.md` if present). Sections in kit order. One H1 per page; heading levels exactly as the kit marks them (`#`, `##`, `###`).
3. Paste copy exactly: headings, body, cards, tables, FAQ, captions, alt text, button labels, link text and hrefs. No paraphrase, no added sentences, no reordering.
4. Add an `id` for every in-page anchor the kit links to (e.g. `#exports`, `#limits`, `#specs`, `#scale`, `#water`, `#sign-in`, `#model-card`, `#contact`).
5. CTAs: use the existing button components with the kit's labels and destinations (at most what the kit lists).
6. Metadata: set the kit's title (absolute, so no second `| Hydrilla` suffix), description, OG title, canonical and robots through `createPageMetadata`. Full JSON-LD comes in phase 07; leave existing JSON-LD on renamed pages alone unless it contradicts the kit (e.g. names "BlueFox 3D"), and flag it.
7. Remove old content on rewritten pages that the kit doesn't contain (that's a copy replacement, not a page deletion). Keep shared components untouched; if one needs a change, make it backwards compatible and list it.
8. After each page: `next build && next start`, open it, check it returns 200, has one H1, and its links resolve to 200 (no 3xx/404, external links excepted).
9. **Pricing data:** if prices or credits are rendered from a data file or API, don't change the source; if the kit's displayed values differ from it, stop on that item and flag it.
10. **Water Agent:** no credential, API-key or third-party model wording near Water Agent; if the kit has none, add none.

## Acceptance criteria
- For each page in scope: returns 200 on `next start`; `<title>`, meta description, canonical and robots match the kit exactly; exactly one `<h1>` equal to the kit H1.
- Copy check: visible text of `<main>` (normalised whitespace) matches the kit copy block with the non-rendered parts removed. List every difference; the target is zero.
- Every internal link on these pages returns 200 directly (no redirect hops); every kit anchor `id` exists.
- `rg -n "BlueFox 3D|BlueFox3D|Pixal3d|AI for 3D"` on the files changed in this phase → 0 hits (the Hugging Face repo href is the only allowed `BlueFox3D`).
- No `[VERIFY` text is visible on any rendered page; every one is a code comment and is listed.
- `git diff` touches no homepage files. Build, lint, typecheck pass.
- `/features#exports`, `/bluefox#specs` (if in kit) and `/docs#water` (target, built in 06) are reported as present or pending.

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
Deliverable format from `00-master.md`, plus a per-page table: route | 200 | title ✓ | H1 ✓ | copy diffs | TODO(kit) | VERIFY count. Commit `site-rebuild: phase 04 pages-product`, then STOP: "Phase 04 complete. Waiting for review before phase 05."
