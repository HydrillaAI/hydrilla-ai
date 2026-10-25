# Header and footer (exact final)

> **Applies site-wide, homepage included.** The shared header and footer below apply to every page, including `/`. Approved by Rishi on 2026-10-24. The homepage **body** (copy, metadata, sections, FAQ, the Free-plan lines) still stays exactly as it is; only the shared header and footer change there.
>
> **"AI for 3D":** the new header is the Hydrilla wordmark only, with no words beside it, so "AI for 3D" leaves the header everywhere. Also remove it from non-homepage page bodies, the llms files, and non-home `.md` mirrors. Nothing replaces it, and the brand line is not put in the header. If "AI for 3D" appears inside the homepage body, leave it there (homepage body is frozen).

All labels are sentence case as written. No page appears twice in the nav or in two footer columns. No noindex, signed-in, or app routes are linked (`/rigging`, `/library`, `/integrations/connect`, `/brand`, `/app/*` are all out).

## Header
Left: Hydrilla wordmark → `/`.

Top nav, left to right: **Product**, **Solutions**, **Resources**, **Company**, **Pricing**.

| Menu | Item label | Destination | Menu line (optional, small text) |
|---|---|---|---|
| Product | Overview | `/features` | |
| Product | BlueFox | `/bluefox` | The flagship model |
| Product | Water Agent | `/water` | AI 3D agent for studios |
| Product | Text to 3D | `/text-to-3d` | |
| Product | Image to 3D | `/image-to-3d` | |
| Product | Integrations | `/integrations` | |
| Product | API | `/api` | |
| Solutions | Game development | `/solutions/games` | |
| Solutions | Film and animation | `/solutions/film` | |
| Solutions | Architecture and interiors | `/solutions/architecture` | |
| Solutions | XR | `/solutions/xr` | |
| Solutions | Product visualization | `/solutions/product` | |
| Solutions | All solutions | `/solutions` | |
| Solutions | Enterprise | `/enterprise` | |
| Resources | Docs | `/docs` | |
| Resources | FAQ | `/faq` | |
| Resources | Blog | `/blog` | |
| Resources | Changelog | `/changelog` | |
| Resources | Compare | `/compare` | |
| Resources (under Compare) | Hydrilla vs Meshy | `/compare/meshy` | |
| Resources (under Compare) | Hydrilla vs Tripo | `/compare/tripo` | |
| Resources (under Compare) | Hydrilla vs Hyper3D | `/compare/hyper3d` | |
| Resources (under Compare) | How to choose an AI 3D generator | `/compare/how-to-choose` | |
| Company | About | `/about` | |
| Company | Research | `/research` | |
| Company | Team | `/team` | |
| Company | Careers | `/careers` | |
| Company | Contact | `/contact` | |
| Company | Security | `/security` | |
| Pricing | (no menu) | `/pricing` | |

Right side: **Sign in** (text link, `/sign-in`), then **Start generating** (primary button, `/app/studio`).

Removed from today's nav: Preview and Exports (`/docs` anchors), Rigging, Startup (`/pricing`), Studios (duplicate of Enterprise), Security under Product, BlueFox under Company > Lab, Brand, Hydrilla vs Luma, Best AI 3D generators, "BlueFox 3D" label.

## Footer
Four columns, then a bottom bar.

1. **Product:** Overview `/features` · BlueFox `/bluefox` · Water Agent `/water` · Text to 3D `/text-to-3d` · Image to 3D `/image-to-3d` · Integrations `/integrations` · API `/api` · Pricing `/pricing`
2. **Solutions:** Game development `/solutions/games` · Film and animation `/solutions/film` · Architecture and interiors `/solutions/architecture` · XR `/solutions/xr` · Product visualization `/solutions/product` · All solutions `/solutions` · Enterprise `/enterprise`
3. **Resources:** Docs `/docs` · FAQ `/faq` · Blog `/blog` · Changelog `/changelog` · Compare `/compare`
4. **Company:** About `/about` · Research `/research` · Team `/team` · Careers `/careers` (badge "We're hiring", shown only while roles are open) · Contact `/contact` · Security `/security`

**Bottom bar:** © Hydrilla · Privacy `/privacy` · Terms `/terms` · Cookies `/cookies` · "Get in touch" founders@hydrilla.ai (`mailto:`) · icons for X (https://x.com/hydrillaai), LinkedIn (https://www.linkedin.com/company/hydrilla-ai), Reddit (https://www.reddit.com/r/hydrilla), Instagram (https://www.instagram.com/hydrilla.ai), each with an `aria-label` ("Hydrilla on X", and so on).

Removed from today's footer: the Use Cases, Compare, Integrations, and Legal columns (merged above), Auto-Rigging, 3D Preview & Viewer, Multi-format Exports, How It Works, 3D Asset Library, Studio Bridge, Brand, "Security & Trust", and "We are hiring!".
