# 05 · Integrations and solutions pages

## Goal
Build or rewrite the integrations hub and its children, and the solutions hub and its children, from the kit copy with existing components.

## Inputs
Kit: `README.md`, `routing.md`, `VERIFY-LIST.md`, `reports/01-audit.md` if present, and these page files (names per the README mapping; nested routes use a hyphen):

| Route | Kit file | Status (confirm in `routing.md`) |
|---|---|---|
| `/integrations` | `pages/integrations.md` | Rewrite; owns `#sign-in` if the kit links to it |
| `/integrations/blender` | `pages/integrations-blender.md` | Rewrite |
| `/integrations/unity` | `pages/integrations-unity.md` | Rewrite |
| `/integrations/unreal` | `pages/integrations-unreal.md` | Rewrite |
| `/integrations/godot` | `pages/integrations-godot.md` | Rewrite |
| `/integrations/mcp` | `pages/integrations-mcp.md` | Rewrite |
| `/solutions` | `pages/solutions.md` | Renamed from `/usecase` in 02; rewrite |
| `/solutions/games` | `pages/solutions-games.md` | Renamed from `/usecase/gamedev` |
| `/solutions/film` | `pages/solutions-film.md` | Renamed from `/usecase/filmproduction` |
| `/solutions/architecture` | `pages/solutions-architecture.md` | Renamed from `/usecase/architecture` |
| `/solutions/xr` | `pages/solutions-xr.md` | Renamed from `/usecase/arvr` |
| `/solutions/product` | `pages/solutions-product.md` | Renamed from `/usecase/productdesign` |

If the kit has an integration or solution page not in this table, build it the same way and list it. If a row here has no kit file, don't build it; flag it. `/integrations/api` and `/integrations/connect` are not built here (one redirects to `/api`, the other is the signed-in Bridge page; leave it as is).

## Steps (per page)
1. Read the kit page file in full. Follow the kit README conventions (fallback: "How to read a kit page file" in `00-master.md`): render only the text between `COPY:START` and `COPY:END`; section labels, headline-option notes and footer notes aren't rendered; `Visual:` becomes a `TODO(kit)` placeholder in the existing media slot; `[VERIFY …]` tags become code comments, not visible text.
2. Build the page from existing templates and components (see the reuse map in `reports/01-audit.md` if present). Sections in kit order. One H1 per page; heading levels exactly as the kit marks them (`#`, `##`, `###`).
3. Paste copy exactly: headings, body, cards, tables, FAQ, captions, alt text, button labels, link text and hrefs. No paraphrase, no added sentences, no reordering.
4. Add an `id` for every in-page anchor the kit links to (e.g. `#exports`, `#limits`, `#specs`, `#scale`, `#water`, `#sign-in`, `#model-card`, `#contact`).
5. CTAs: use the existing button components with the kit's labels and destinations (at most what the kit lists).
6. Metadata: set the kit's title (absolute, so no second `| Hydrilla` suffix), description, OG title, canonical and robots through `createPageMetadata`. Full JSON-LD comes in phase 07; leave existing JSON-LD on renamed pages alone unless it contradicts the kit (e.g. names "BlueFox 3D"), and flag it.
7. Remove old content on rewritten pages that the kit doesn't contain (that's a copy replacement, not a page deletion). Keep shared components untouched; if one needs a change, make it backwards compatible and list it.
8. After each page: `next build && next start`, open it, check it returns 200, has one H1, and its links resolve to 200 (no 3xx/404, external links excepted).
9. **Plugin downloads:** install buttons keep the existing download URLs/files on the live pages unless the kit gives new ones. Never invent a version number, store link or file name.
10. **Hubs:** hub cards link to the child routes exactly as the kit lists them; reuse the existing card grid. Remove any copied SoftwareApplication/Offer markup from solution pages only in phase 07 (schema), not here.

## Acceptance criteria
- For each page in scope: returns 200 on `next start`; `<title>`, meta description, canonical and robots match the kit exactly; exactly one `<h1>` equal to the kit H1.
- Copy check: visible text of `<main>` (normalised whitespace) matches the kit copy block with the non-rendered parts removed. List every difference; the target is zero.
- Every internal link on these pages returns 200 directly (no redirect hops); every kit anchor `id` exists.
- `rg -n "BlueFox 3D|BlueFox3D|Pixal3d|AI for 3D"` on the files changed in this phase → 0 hits (the Hugging Face repo href is the only allowed `BlueFox3D`).
- No `[VERIFY` text is visible on any rendered page; every one is a code comment and is listed.
- `git diff` touches no homepage files. Build, lint, typecheck pass.
- Each hub links to every child the kit lists, and each child links back the way the kit says.

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
Deliverable format from `00-master.md`, plus the per-page table: route | 200 | title ✓ | H1 ✓ | copy diffs | TODO(kit) | VERIFY count. Commit `site-rebuild: phase 05 pages-integrations-solutions`, then STOP: "Phase 05 complete. Waiting for review before phase 06."
