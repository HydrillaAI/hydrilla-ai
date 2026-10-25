# 01 · Audit: map the repo against the kit (read-only)

## Goal
Produce a structured gap report that maps the current repo to the build kit, so phases 02 to 08 can run without surprises. **Make no edits:** no file changes, no installs, no commits, no formatting runs. The only commands allowed are reads, searches (`rg`, `git`), and build/lint/typecheck to record the baseline.

## Inputs (kit, relative to the confirmed kit folder)
`README.md`, `routing.md`, `nav-footer.md`, every file in `pages/`, `seo-geo/schema.md`, `seo-geo/llms.txt`, `seo-geo/llms-full.txt`, `seo-geo/mirrors.md`, `VERIFY-LIST.md`, `QA-CHECKLIST.md`.

## Steps
1. Confirm the kit location with Rishi. List the kit files present and missing against the layout in `00-master.md`.
2. **Repo basics:** Next.js version, App Router layout, package manager, scripts for build/lint/typecheck, current branch, whether `site-rebuild` exists, and whether the tree is clean.
3. **Baseline checks:** run build, lint, typecheck now and record the results, so later phases can tell new failures from old ones.
4. **Route inventory:** for every route in `routing.md` and every file in `pages/`, find the page file (or note it's missing), its current H1, and how its metadata is set. Mark each route: exists / rename needed (e.g. `/bluefox3d`→`/bluefox`, `/usecase/*`→`/solutions/*`, `/compare/hydrilla-vs-meshy`→`/compare/meshy`, `/privacy-policy`→`/privacy`) / new (e.g. `/water`, `/text-to-3d`, `/image-to-3d`, `/compare/hyper3d`, `/compare/how-to-choose`, new blog posts).
5. **Routes in the repo the kit doesn't mention:** list them (don't propose deletions; flag only). Include signed-in routes (`/app/*`, `/workspace`, `/library`, `/rigging`, `/integrations/connect`, etc.) and how they're kept out of the index.
6. **Components to reuse:** for each kit page, name the existing layout/template and components that fit each section type (hero, eyebrow/kicker, cards, tables, FAQ/accordion, steps, compare table, spec table, code block, CTA pair, breadcrumb, media/visual slot). Note any section type with no existing component.
7. **Metadata:** document `createPageMetadata` in `lib/seo.ts` (signature, title template, how absolute titles, canonical, robots, OG and `alternate` markdown links are set). Confirm how a kit title ending in `| Hydrilla AI` can be set without a double suffix.
8. **Redirects:** list every redirect in `next.config.js` and in middleware (source, destination, status, `permanent` vs `statusCode`). Compare with `routing.md`: missing, extra, chains, loops (including the live `/bluefox`→`/bluefox3d` and the `/privacy`↔`/privacy-policy`, `/terms`↔`/terms-and-conditions` reversals). Record `trailingSlash` / `skipTrailingSlashRedirect` settings and whether `/x/` forms would take two hops. Note how query strings are handled (Next forwards them by default).
9. **Index files:** current `PUBLIC_ROUTES`, `app/sitemap.ts` output source and `lastmod` logic, `app/robots.ts` rules. Diff against `routing.md` and `seo-geo/`.
10. **Mirrors:** how `<path>.md` is served (rewrite to `app/md`), which routes have mirrors, whether they are generated from the same source as the HTML, the `Link: rel="canonical"` header, `rel="alternate" type="text/markdown"` tags, and whether `/md/*` is publicly reachable. Diff against `seo-geo/mirrors.md`.
11. **JSON-LD:** where it's built, shared `@id` nodes (`#organization`, lab node, model node), per-page types. Quote the homepage `@graph` lab relationship with file:line (the optional homepage lab fix in phase 07, applied only on Rishi's yes).
12. **Nav/footer:** structure of `lib/nav.ts` (primary nav, `FOOTER_NAV`), the components that render them, and whether the homepage uses the same shared header/footer. If it does, note it: Rishi approved the new header/footer site-wide, homepage included, so phase 03 applies it on `/` too. If the homepage uses its own separate header/footer, flag that, since making it shared would need a homepage edit.
13. **"AI for 3D":** `rg -n -i "AI for 3D"` across the repo (code, MDX, JSON, SVG, metadata, `public/`, llms files, mirrors). List every hit with file:line and classify it: **homepage-only → "leave as is"**; **shared header/footer text** → "replaced by kit nav/footer in phase 03" (approved site-wide); **inside the shared logo/logo lockup** → "ask Rishi"; **non-homepage page, llms file or non-homepage mirror → "remove"** (phase 03 for shell/nav surfaces, the page phases for page copy, phase 07 for llms and mirrors). Also list brand assets that may hold it as image pixels (logo lockups, OG images, favicons) that grep can't confirm.
14. **Banned terms baseline:** `rg -n "BlueFox 3D|BlueFox3D|Bluefox|Blue Fox|Pixal3d|AI for 3D"` outside the kit folder. Report counts per file (informational; the homepage keeps its own lines).
15. **Kit consistency:** every `pages/` file has a route in `routing.md` and vice versa; nav/footer links point to kit routes; count `[VERIFY` tags per page and check each appears in `VERIFY-LIST.md`; list any `TODO` or empty sections in the kit.

## Report format (print in chat; Rishi may save it as `reports/01-audit.md` in the kit)
```
A. Kit files: present / missing
B. Repo basics + baseline checks (build/lint/typecheck results)
C. Route table: route | kit page file | repo file | status (exists/rename/new) | phase
D. Repo routes not in kit (flag only)
E. Reuse map: page | template | components per section | gaps
F. Metadata helper findings (+ double-suffix plan)
G. Redirects: current vs kit | chains | loops | trailing-slash | status codes | query strings
H. PUBLIC_ROUTES / sitemap / robots diff
I. Mirrors diff
J. JSON-LD map + homepage lab relationship (file:line)
K. Nav/footer structure; homepage uses shared header? (y/n)
L. "AI for 3D" hits (file:line) | leave as is (homepage) / phase 03 (shared header/footer) / ask Rishi (shared logo) / remove | unverifiable assets
M. Banned-term baseline (homepage hits marked "leave as is")
N. Kit inconsistencies, VERIFY count vs VERIFY-LIST
O. Conflicts (kit vs repo constraints) and open questions
P. Risks per phase 02–08
```

## Acceptance criteria
- `git status` is clean and no commit was made (show the output).
- Every route in `routing.md` and every `pages/` file appears in table C exactly once.
- Every redirect in `next.config.js`/middleware appears in section G.
- Sections L and J give file:line references, or say "not found" with the search command used.

## Guardrails (identical in every phase prompt; they override anything else)
1. **Reuse.** Use the existing components, layouts and design system (tokens, type, spacing, icons). Add no new dependency unless it is needed; if you add one, justify it in the report (why existing code can't do it, package name, size).
2. **Copy exactly.** Take every visible string from the kit files, character for character (punctuation, capitals, links). Never invent facts, copy, stats, testimonials, logos, images or claims. If copy is missing, leave a marked `TODO(kit): <what is missing>` and list it in the report. No filler, no "improvements".
3. **Homepage.** Don't edit any visible homepage text or component. The only homepage item is the hidden JSON-LD fix making Hawan Research Labs a `subOrganization` of Hydrilla AI (not its parent); it is OPTIONAL and applied only if Rishi explicitly approves it during the prompt run (ask and wait for a yes before touching it; phase 07). "AI for 3D" is removed only from non-homepage pages, `llms.txt` / `llms-full.txt`, and `.md` mirrors of non-homepage pages; homepage occurrences stay as they are. Exception (Rishi approved, 2026-10-24): the new shared header and footer from `nav-footer.md` apply site-wide, homepage included; apply them on `/` without asking. Everything else on the homepage (body text, sections, components) stays unchanged. If "AI for 3D" sits inside the shared logo/logo lockup, ask Rishi before changing it.
4. **Checks.** After the phase, run build, lint and typecheck with the repo's own scripts (e.g. `npm run build`, `npm run lint`, `npx tsc --noEmit`, or the pnpm/yarn equivalents). Fix failures this phase caused. Report pre-existing failures; don't fix them.
5. **Stop.** End with the diff summary: files changed, routes affected, anything skipped or flagged, open questions. Then STOP for review. Don't start the next phase.
6. **Git.** Work only on branch `site-rebuild` (create it from the default branch if it doesn't exist), one commit per phase that changes files: `site-rebuild: phase NN <name>`. Never push to production, never deploy, never change env vars, secrets, hosting, CDN or deployment config. Don't push the branch unless Rishi asks.
- Don't delete existing pages, routes or components the kit doesn't cover; flag them. Never edit kit files.
- Kit files are the source of truth and beat plan docs, the live site and your judgment. If two kit files conflict, stop and ask.

## Stop
Post the report, then: "Phase 01 complete. No files changed. Waiting for review before phase 02." Don't start phase 02.
