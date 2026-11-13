# Page: /enterprise

| Field | Value |
|---|---|
| Route | `/enterprise` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Enterprise AI 3D Workspace, Agent & Plugins \| Hydrilla AI |
| Meta description | Hydrilla Enterprise gives studios BlueFox, Water Agent, native 3D plugins for Blender, Unity, Unreal, and Godot, MCP server, and REST API concurrency. Book a demo. |
| OG title | Hydrilla for Enterprise: AI 3D Workspace, Agent & Plugins for Studios |
| H1 | AI 3D built for the enterprise |
| Canonical | `https://hydrilla.ai/enterprise` (self) |
| Robots | index, follow |
| Schema type | WebPage + SoftwareApplication + ContactPoint (sales) + FAQPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Editorial layout with a compact hero above a curved showcase strip (`components/ui/tilted-grid-hero.tsx`), a two-column Enterprise Sales band with the Contact Sales form (`#contact-sales`), four studio metrics, an interactive four-tab visual pipeline showcase (`Water Agent`, `3D Plugins`, `Studio Workspace`, `API & MCP`), a clean 2x2 media showcase, five solution cards, Pro vs Enterprise comparison, security & IP cards, FAQ accordion (`lib/enterprise-faq.ts`), and a closing band (`#contact`) where the hyd01 flower resolves out of liquid glass.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Hydrilla AI / Enterprise

# AI 3D built for the enterprise

Hydrilla Enterprise brings BlueFox, Hydrilla's 3D model, and Water Agent to your studio inside one private workspace, across every 3D plugin, MCP, and the REST API.

- 4 3D software plugins: Blender, Unity, Unreal Engine, and Godot 4
- $0 Water Agent cost: AI 3D agent included with zero credits
- 1 shared studio workspace: generations, part reviews, and approved assets
- 0% customer data trained on: prompts, references, and outputs stay private

**[Section 2: Enterprise Sales]**

## Connect with our 3D AI experts

Plan seats, plugin setup, MCP automation, and API concurrency around your studio's monthly output.

Form fields: First name | Last name | Company / Studio | Job title | Work email | Team size | Primary 3D software or pipeline | What are you interested in | Pipeline notes
Form submit: Continue

**[Section 3: Studio Control & Platform]**

## Pro control over your 3D pipeline

Switch between Water Agent, native 3D plugins, the shared Studio workspace, and API automation.

## Built for studios, agents, and 3D software

- Water Agent for multi-asset briefs: describe an entire prop set or scene once, review the plan before generation starts, and revise individual pieces inside Studio or your 3D tool.
- Native plugins across 3D software: [Integrations](/integrations) inside Blender, Unity, Unreal Engine, and Godot 4 over the local Bridge.
- Segmented parts, UVs, and PBR maps: [BlueFox](/bluefox) returns meshes split into logical parts with unwrapped UVs and PBR maps attached.
- MCP server and REST API concurrency: run batch 3D jobs from your backend or connect AI coding agents over [MCP](/integrations/mcp) and the [REST API](/api).

**[Section 4: Teams]**

## Built for every 3D team

- [Game development](/solutions/games): level dressing, environment props, and asset sets inside Unity, Unreal Engine, and Godot 4.
- [Film and animation](/solutions/film): set pieces and props for previs, layout, and background dressing inside Blender.
- [Architecture and interiors](/solutions/architecture): furniture and fixtures for client presentations and design reviews.
- [AR, VR, and XR](/solutions/xr): segmented 3D objects with clean UVs and PBR maps checked against frame budgets.
- [Product visualization](/solutions/product): product photography turned into editable 3D meshes for web viewers, campaigns, and AR.

**[Section 5: Pro vs Enterprise]**

## Pro vs Enterprise

| Capability | Pro | Enterprise |
|---|---|---|
| Agreement | Self-serve monthly plan on [pricing](/pricing) | Custom agreement shaped around your studio |
| Workspace | Individuals and small teams | Shared studio seats across art, lookdev, and pipeline |
| Water Agent | Included at zero credit cost | Included across Studio and plugins at zero credit cost |
| Plugins & Bridge | Blender, Unity, Unreal, and Godot plugins | Plugins, local Bridge, and pipeline onboarding |
| MCP & REST API | Standard API and stdio MCP access | Concurrency and queue priority sized to volume |
| Credits | 3,000 monthly credits | Custom credit pools shared across teams |
| Model training | Never trains on customer data | Never trains on customer data |

**[Section 6: Security]**

## Your work stays yours

Details live on the [security page](/security); the [Privacy Policy](/privacy) and [Terms](/terms) are the binding documents.

- Zero model training: prompts, reference images, and generated 3D assets are never used to train our models on any plan.
- Full output ownership: as between you and Hydrilla AI, and to the extent the law allows, you own generated outputs for commercial use under the [Terms](/terms#ownership).
- Scoped to your workspace: sessions stay isolated per user, assets stay scoped to your studio, and Bridge transfers stay local on your machine.

Need a vendor review or custom legal agreement? Send your questionnaire to founders@hydrilla.ai with your studio name and timeline.

**[Section 7: FAQ]**

## Enterprise questions, answered

See `lib/enterprise-faq.ts` for all eight questions and answers rendered on `/enterprise` and emitted in `FAQPage` JSON-LD.

**[Section 8: Closing, anchor #contact]**

## Get Hydrilla Enterprise

Ready to bring BlueFox, Water Agent, and native 3D plugins to your studio?
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero and closing, primary | Book a demo | https://cal.com/hydrilla |
| Hero and closing, secondary | Contact sales | `#contact-sales` |
| Form | Continue | form submit |

## Internal links on this page
- `/pricing`, `/features`, `/bluefox`, `/water`, `/api`, `/integrations`, `/integrations/blender`, `/integrations/unity`, `/integrations/unreal`, `/integrations/godot`, `/integrations/mcp`
- `/solutions/games`, `/solutions/film`, `/solutions/architecture`, `/solutions/xr`, `/solutions/product`
- `/security`, `/privacy`, `/terms`, `/terms#ownership`
