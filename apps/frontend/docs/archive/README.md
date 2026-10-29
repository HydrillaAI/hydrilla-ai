# Archive

These are the internal docs from before October 2026. They are kept for history.
**Don't use them as a reference.** Many of them cite old paths (`backend/hydrilla_backend/...`,
`frontend/...` instead of `apps/backend/...` and `apps/frontend/...`), old URLs, and old numbers.
The current docs are in [`../`](../README.md).

Status was checked against the code on 2026-10-29:

- **current**: still accurate apart from paths
- **partly stale**: some sections are wrong
- **obsolete**: describes a site or pipeline that has since changed
- **brief**: a one-off prompt or plan, not a reference

| File | What it covered | Status | Replaced by |
|---|---|---|---|
| `PAYMENTS.md` | Dodo plans, checkout, webhooks, Slot hours, trial | current | [04-PAYMENTS-AND-CREDITS](../04-PAYMENTS-AND-CREDITS.md) |
| `pricing-and-models.md` | Models per month on each plan | current | [04-PAYMENTS-AND-CREDITS](../04-PAYMENTS-AND-CREDITS.md) |
| `WATER_PROVIDERS.md` | Water LLM connectors, key resolution, model prefs | current | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `DECISIONS_LOCKED.md` | D1–D4 product decisions | current (except `lib/cloud`, `TRELLIS_*`) | [11-DECISIONS](../11-DECISIONS.md) |
| `adr/0001-water-agents-cloud-untouched.md` | Water agents in-process; Cloud is not an agent | current | [11-DECISIONS](../11-DECISIONS.md) |
| `contracts/JOB_CARD.md` | JobCard shape, stages, refine caps | current (Cloud half not wired) | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `contracts/EVIDENCE_MANIFEST.md` | Evidence needed before promotion | current | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `contracts/TOOL_SURFACE.md` | The 12 frozen tool IDs | current | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `ENGINES.md` | Cloud vs Water hub | partly stale (760 s cap, "no skill chips") | [01-ARCHITECTURE](../01-ARCHITECTURE.md), [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `WATER_ORCHESTRATION.md` | Water planner, passes, packs, Vercel limits | partly stale (800 s, "no skillId") | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `GENERATION_FLOWS.md` | Cloud image → GPU → GLB flow | partly stale (credit table, image models, `TRELLIS_*`) | [05-CLOUD-GENERATION](../05-CLOUD-GENERATION.md) |
| `CREATE_ORCHESTRATION_PLAN.md` | Grok pack adoption plan and status log | partly stale | [06-WATER-ENGINE](../06-WATER-ENGINE.md), [11-DECISIONS](../11-DECISIONS.md) |
| `SECURITY.md` | Frontend security audit | partly stale (most findings still open) | [03-SECURITY](../03-SECURITY.md) |
| `WATER_FULL_GUIDE.md` | Old Water reference (6 skills, `tick`, 760 s) | obsolete | [06-WATER-ENGINE](../06-WATER-ENGINE.md) |
| `ROUTING.md` | URL moves, nav, page titles | obsolete (redirects now point the other way) | [10-SITE-SEO-AND-CONTENT](../10-SITE-SEO-AND-CONTENT.md) |
| `SITE-PAGES.md` | Route map with priorities | obsolete | [10-SITE-SEO-AND-CONTENT](../10-SITE-SEO-AND-CONTENT.md) |
| `SEO-GEO.md` | Indexed URL inventory | obsolete | [10-SITE-SEO-AND-CONTENT](../10-SITE-SEO-AND-CONTENT.md) |
| `SEO-GEO-RULES.md` | Robots/sitemap/JSON-LD rules | obsolete | [10-SITE-SEO-AND-CONTENT](../10-SITE-SEO-AND-CONTENT.md) |
| `GEO-TEXT-FILES.md` | `llms.txt` and `.md` mirrors | obsolete | [10-SITE-SEO-AND-CONTENT](../10-SITE-SEO-AND-CONTENT.md) |
| `hydrilla-seo-geo-cursor-brief.md` | Cursor prompt for the SEO build-out | brief (executed, then overtaken) | — |
| `GROK-3D-HARNESS-BRIEF.md` | Grok strategy brief for quality harness | brief (partly superseded) | — |
