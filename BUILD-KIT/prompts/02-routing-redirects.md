# 02 · Routing and redirects

## Goal
Implement `routing.md`: every old URL reaches its final page in **one 301 hop**, renamed routes serve 200 at their new paths, and `PUBLIC_ROUTES`, the sitemap and noindex match the kit. No page copy changes in this phase.

## Inputs
Kit: `README.md`, `routing.md` (source of truth), `reports/01-audit.md` if present.
Repo: `next.config.js` (redirects, rewrites, `trailingSlash`), middleware (if any), `lib/seo.ts` (`PUBLIC_ROUTES`, `createPageMetadata` robots), `app/sitemap.ts`, `app/robots.ts`, the route folders under `app/`.

## Steps
1. **Remove the live `/bluefox` → `/bluefox3d` redirect (both slash forms) in this same change**, and add `/bluefox3d` → `/bluefox` (301). `/bluefox` must serve a page, not redirect. Shipping one without the other creates a loop or a 404.
2. **Move renamed routes** so targets resolve 200 now, keeping their current content (copy changes come in 04–06): e.g. `/bluefox3d`→`/bluefox`, `/usecase`→`/solutions`, `/usecase/gamedev|filmproduction|architecture|arvr|productdesign`→`/solutions/games|film|architecture|xr|product`, `/compare/hydrilla-vs-meshy|tripo`→`/compare/meshy|tripo`, `/privacy-policy|terms-and-conditions|cookie-policy`→`/privacy|terms|cookies`. Use `git mv` so history follows. Follow `routing.md` for the exact list. Brand-new routes (e.g. `/water`, `/text-to-3d`, `/image-to-3d`, `/compare/hyper3d`, `/compare/how-to-choose`, new blog posts) are built in 04–06; their redirects may point at them now and are reported as "target pending phase NN".
3. **Write every redirect in `routing.md`** as permanent with status **301** (in `next.config.js`, `permanent: true` emits 308; use `statusCode: 301` unless `routing.md` says 308 is acceptable).
4. **Single hop, no chains.** Resolve every rule to its final target: if A→B and B→C exist, write A→C. Rewrite existing rules too, e.g. `/bluefox-3d`, `/3d-ai`, `/science-technology`, `/models` → `/bluefox` (not via `/bluefox3d`); `/case-study` → `/solutions` (not via `/usecase`); `/blog?category=…` and `/blog?page=…` → `/blog`.
5. **Remove reversed rules in the same change**: `/privacy`→`/privacy-policy` and `/terms`→`/terms-and-conditions` (they would loop with the new direction). Same for any other rule whose source is now a live page.
6. **Variants:** each rule covers the no-slash, trailing-slash and `.md` forms (e.g. `/usecase/gamedev.md` → `/solutions/games.md`). Check Next's built-in trailing-slash redirect doesn't add a second hop; if it does, fix it (matching patterns, or the existing middleware) and explain.
7. **Query strings:** Next forwards the source query by default. Where `routing.md` says to drop it (the `/blog?` rules), confirm `Location` has no query; if `next.config.js` can't do it, use the existing middleware and explain.
8. **Out of scope unless `routing.md` asks for it AND it can be done in app code:** www → apex and http → https (hosting/edge config is off-limits; flag them), and auth-middleware changes for `/generate`. Flag; don't touch hosting.
9. **Index control:** update `PUBLIC_ROUTES` to exactly the indexable routes in `routing.md` (add new routes, remove redirected ones). Make `app/sitemap.ts` list only those routes (no redirect sources, no `/brand`, no signed-in routes, no `.md` or text files). Set noindex per kit (e.g. `/brand`: `noindex, nofollow`, out of the sitemap). Leave `robots.ts` rule changes to phase 07 unless `routing.md` assigns them here.
10. Don't delete page files for redirected routes beyond the moves in step 2; list leftover files that are now unreachable for Rishi to decide.
11. **Verify with a script** at `<kit>/scripts/check-redirects.mjs` (Node built-ins only, `fetch` with `redirect: 'manual'`), fed by a table built from `routing.md`. Run it against `next build && next start` on `http://localhost:3000`. For each source and each variant print: source → status → `Location` → status of `Location`. Equivalent curl spot checks:
    ```bash
    curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/bluefox3d
    curl -sIL http://localhost:3000/bluefox3d | grep -iE "^(HTTP|location)"
    ```

## Acceptance criteria
- `/bluefox` → 200 (not a redirect). `/bluefox3d`, `/bluefox3d/` → 301 `Location: /bluefox`.
- No rule in `next.config.js` or middleware has `/bluefox` as a source.
- Every `routing.md` source (plus slash and `.md` variants) returns **301** with `Location` = its final target, and that target returns 200 or is listed as "pending phase NN". Zero results where `Location` itself returns 3xx (no chains); zero loops.
- `/privacy`, `/terms`, `/cookies` → 200; `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy` → 301 to them.
- `/blog?category=x` and `/blog?page=2` → 301 `Location: /blog` (no query), if `routing.md` says so.
- `PUBLIC_ROUTES` and `/sitemap.xml` match the indexable list in `routing.md` exactly (paste the diff). `/brand` serves `noindex`.
- The homepage is unchanged (`git diff` shows no homepage files). Build, lint, typecheck pass.

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
Use the deliverable format in `00-master.md`, plus: the script output table, the full new redirect list, the targets pending later phases, leftover unreachable files, and flagged out-of-scope items (www, http, `/generate`). Commit `site-rebuild: phase 02 routing-redirects`, then STOP: "Phase 02 complete. Waiting for review before phase 03."
