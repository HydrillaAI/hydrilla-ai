# hydrilla.ai rebuild: build kit

This kit holds everything a Cursor coding agent needs to rebuild the hydrilla.ai marketing site in Rishi's Next.js repo: final copy for every new or rewritten page, routing and redirects, the header and footer, JSON-LD, the llms files, mirror and robots rules, a QA checklist, and step-by-step prompts. The copy is final and ready to ship. It contains no `[VERIFY]` markers or plan jargon. Anything still unconfirmed was cut or reworded to something true, and is listed in `VERIFY-LIST.md`.

Prepared 2026-10-24 (IST). Nothing here has been deployed.

## Phase order
Start with **`prompts/00-master.md`**. Paste it at the start of every Cursor session, then run one phase prompt per session, in order, stopping after each phase for Rishi's review:

`01-audit` → `02-routing-redirects` → `03-nav-footer` → `04-pages-product` → `05-pages-integrations-solutions` → `06-pages-compare-company-resources` → `07-seo-geo` → `08-qa`

## File map
| Path | What it is |
|---|---|
| `README.md` | This file: conventions and guardrails (read first, every phase) |
| `prompts/` | Phase prompts `00-master.md` to `08-qa.md` (written by Prompty) |
| `pages/<route>.md` | Final copy for one page: metadata, H1, sections in order, CTAs, internal links, layout note, schema type |
| `pages/_metadata-only.md` | The three legal pages that change only route and metadata |
| `routing.md` | Final routes, every 301 (one hop), `PUBLIC_ROUTES` changes, sitemap, noindex, homepage note |
| `nav-footer.md` | The exact header and footer |
| `seo-geo/schema.md` | JSON-LD per page type, including the optional homepage lab fix |
| `seo-geo/llms.txt`, `seo-geo/llms-full.txt` | Drop-in replacements for the live files (`llms-full.txt` holds the full final text of every page) |
| `seo-geo/mirrors.md` | `.md` mirror rules, llms placement, and `robots.txt` |
| `VERIFY-LIST.md` | 43 grouped facts for Rishi to confirm (nothing in the copy depends on them) |
| `QA-CHECKLIST.md` | Checks to run on the built site |
| `qa/kit_qa.py`, `qa/kit_qa_results.txt` | Automated kit QA script and its last results |

## Page file naming
`pages/` is flat. The file name is the route without its leading slash, with every other `/` replaced by `-`:
- `/integrations/blender` → `pages/integrations-blender.md`
- `/compare/meshy` → `pages/compare-meshy.md`
- `/blog/reference-images` → `pages/blog-reference-images.md`
- `/solutions/games` → `pages/solutions-games.md`

The homepage `/` has no page file, because its body isn't changing.

Pages included (41): **new** `text-to-3d`, `image-to-3d`, `water`, `blog-reference-images`, `blog-import-ai-meshes`, `compare-hyper3d`, `compare-how-to-choose`. **Rewritten** `features`, `bluefox`, `integrations` (+ `-blender`, `-unity`, `-unreal`, `-godot`, `-mcp`), `api`, `pricing`, `solutions` (+ `-games`, `-film`, `-architecture`, `-xr`, `-product`), `enterprise`, `docs`, `faq`, `blog`, `compare`, `compare-meshy`, `compare-tripo`, `about`, `research`, `careers`, `contact`. **Kept or extended** `changelog`, `team`, `security`, `brand` (noindex). **Metadata only** `privacy`, `terms`, `cookies`.

## How to read a page file
- The **metadata table** gives the route, status, title, meta description, OG title, H1, canonical, robots, and schema type. Titles already end in "| Hydrilla AI", so set them as absolute titles and don't let the `%s | Hydrilla` template add a second suffix.
- Render only the text between `<!-- COPY:START -->` and `<!-- COPY:END -->`.
- `**[Section N: …]**` labels show structure and are not rendered. "(anchor `#x`)" in a label means that section gets `id="x"`. "(no heading)" means the section has no visible heading.
- `Eyebrow:` / `Kicker:` go in the eyebrow slot. `Card N title:` / `Card N line:` go in the card component. `Close line:`, `Spec line:`, `Note:`, `Date line:`, and `Form note:` are rendered as text, without the label.
- `Visual:` is a placeholder for a real capture: leave a `TODO(kit): visual` slot. Don't generate or reuse unrelated images. `Alt text:` is that image's alt.
- Links: use the exact href and anchor text. "→" marks an inline link arrow.
- The **CTAs** table gives button labels and destinations. Use at most two buttons per page.
- There are **no `[VERIFY]` tags** in this kit. If you find one, stop and report it.

## Guardrails (all phases)
1. **Homepage `/` body is frozen.** No text, metadata, section, or component change in the homepage body. That includes the Free-plan lines ("GLB export", "No card required"), which stay as they are even though they contradict `/pricing` (logged in `VERIFY-LIST.md`).
2. **The shared header and footer apply site-wide, homepage included** (approved by Rishi on 2026-10-24). The new header is the wordmark only.
3. **"AI for 3D"** is removed from every non-homepage page, the new header and footer, `llms.txt`, `llms-full.txt`, and non-home `.md` mirrors. If it appears inside the homepage body, it stays.
4. **The only other homepage item is OPTIONAL and invisible:** the JSON-LD fix that makes Hawan Research Labs a `subOrganization` of Hydrilla AI (`seo-geo/schema.md` section 2). Do it only after Rishi says yes. Otherwise leave the homepage JSON-LD as it is.
5. **Nothing is invented.** Use only the words in this kit. Don't add claims, numbers, features, testimonials, logos, dates, or images. If something is missing, leave a `TODO(kit)` and report it.
6. **Nothing is deployed without Rishi.** Work on a branch, commit per phase, run locally only, and stop after each phase. No production deploys, DNS, or analytics changes.
7. Remove the live `/bluefox` → `/bluefox3d` redirect **in the same deploy** as the new `/bluefox3d` → `/bluefox`, or visitors loop (`routing.md` section 0).
8. **Copy rules the kit already follows** (keep them if anything is edited):
   - BlueFox's first mention on a page is "BlueFox, Hydrilla's 3D model". "BlueFox 1" appears only in spec and schema spots. "BlueFox 3D" and "BlueFox3D" never appear in visible text.
   - Water Agent is the AI 3D agent for artists and studios. It works inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin, costs no credits, and is included on every plan.
   - No BYOK, "own key", or "pick the model" wording, and no key wording near Water Agent.
   - Formats are listed only on `/features#exports`, `/integrations`, and the `/docs` import detail (plus the import how-to). Every plan exports every format, so there are no per-plan formats.
   - "33% off" goes only with Hourly Pro.
   - No SSO, SLA, or early access. Clerk is named only on `/security`.
   - Meshy, Tripo, and Hyper3D are named only on `/compare` pages, never as partners or as available in Hydrilla.
   - The brand line goes only on `/about`, `/brand`, the llms files, and the Organization schema.
   - Pages stay at 600 words or fewer.
