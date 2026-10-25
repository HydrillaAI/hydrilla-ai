# 03 · Header nav and footer

## Goal
Implement `nav-footer.md` exactly, using the existing header/footer components and `lib/nav.ts` (primary nav + `FOOTER_NAV`), and remove "AI for 3D" from non-homepage shell surfaces. No page body copy changes.

## Inputs
Kit: `README.md`, `nav-footer.md` (source of truth), `routing.md` (to check every link target), `reports/01-audit.md` if present.
Repo: `lib/nav.ts`, the header/mega-menu, mobile menu and footer components (locate), the logo/lockup component.

## Steps
1. **Site-wide, homepage included (Rishi approved, 2026-10-24).** Apply the new header and footer on every page, including `/`, without asking. Do it only through the shared components and `lib/nav.ts`; don't edit the homepage page file or any homepage body section. If `/` renders its own separate header/footer (not the shared one), don't edit it; stop and report so Rishi can decide.
2. Rewrite the data in `lib/nav.ts` to match `nav-footer.md`: menu order, labels, menu lines (e.g. BlueFox "The flagship model", Water Agent "AI 3D agent for studios", if the kit says so), destinations, footer columns, bottom bar (legal links, contact line, social icons with `aria-label`), badges only where the kit lists them.
3. Keep the components' structure and styling. Change the data shape only if the kit needs something the type can't hold (e.g. a menu line); extend the type minimally and explain.
4. Labels and hrefs are copied exactly. The label "BlueFox" replaces any "BlueFox 3D" label; the href is `/bluefox`.
5. **No links to** noindex, signed-in or redirected routes (e.g. `/brand`, `/rigging`, `/library`, `/integrations/connect`, `/usecase/*`, `/bluefox3d`, `/compare/hydrilla-vs-*`, `/docs#…` stand-ins for text/image to 3D), unless the kit lists them. Each page appears at most once in the nav and once in the footer. Header buttons (e.g. "Sign in", "Start generating" → `/app/studio`) follow the kit.
6. **"AI for 3D":** remove it wherever it appears on non-homepage shell surfaces (header lockup, footer, shared metadata defaults used by non-home pages, brand assets used off the homepage). In shared header/footer text it goes away with the new kit nav/footer (site-wide, approved). If it is inside the shared logo/logo lockup, ask Rishi and wait before changing it. Never alter homepage-only occurrences. Nothing replaces the removed words. Image assets with the words baked in: flag, don't edit.
7. Check mobile nav, keyboard focus order, `aria-expanded` on menus and `aria-label` on icon links still work; reuse the existing patterns.
8. Run a link check on the nav and footer data: every href is a kit route (or an external URL/`mailto:` listed in the kit) that returns 200 on `next start`, with no 3xx.

## Acceptance criteria
- Nav and footer render exactly the items, order and labels in `nav-footer.md` (paste a side-by-side table: kit item | rendered label | href | status 200).
- `rg -n "BlueFox 3D|BlueFox3D|/bluefox3d|AI for 3D" lib/nav.ts <header/footer components>` → 0 hits (outside homepage-only files).
- No nav/footer href returns 3xx or 4xx; no duplicate destinations within the nav or within the footer.
- `git diff` touches no homepage page file or homepage section; the new header/footer renders on `/` and every other page; the shared logo is unchanged unless Rishi's yes is quoted.
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
Deliverable format from `00-master.md`, plus the side-by-side table, confirmation that the header/footer renders on `/`, Rishi's answer on the logo (if asked), every "AI for 3D" hit and what was done (removed / left: homepage / flagged: image asset). Commit `site-rebuild: phase 03 nav-footer`, then STOP: "Phase 03 complete. Waiting for review before phase 04."
