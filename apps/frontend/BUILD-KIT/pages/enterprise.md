# Page: /enterprise

| Field | Value |
|---|---|
| Route | `/enterprise` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Enterprise AI 3D Generator for Studios \| Hydrilla AI |
| Meta description | Hydrilla Enterprise gives studios an AI 3D workspace and API: team seats, API concurrency, custom credit plans, and pipeline support. Book a demo. |
| OG title | Hydrilla for Enterprise: AI 3D across your whole studio |
| H1 | Hydrilla for Enterprise |
| Canonical | `https://hydrilla.ai/enterprise` (self) |
| Robots | index, follow |
| Schema type | WebPage + ContactPoint (sales) + FAQPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Editorial layout: centred hero over a curved row of showcase stills (`components/ui/tilted-grid-hero.tsx`), large type, hairlines, no second navbar, and a closing light-grey band where the hyd01 flower resolves out of liquid glass above the contact form (id="contact"). The only page with "Book a demo". FAQ answers live in `lib/enterprise-faq.ts`, which also feeds the FAQPage JSON-LD; keep this copy in step with it. Only state claims Hydrilla can back up: no customer logos, usage numbers, or certifications until they are confirmed.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Studios

# Hydrilla for Enterprise

Production 3D assets at enterprise scale, across your whole studio.

Hydrilla Enterprise brings BlueFox, Hydrilla's 3D model, and Water Agent to your team in one shared workspace and through the API, with seats, API concurrency, custom plans, and pipeline support.

- 4 export formats: GLB, FBX, OBJ, and USDZ
- 4 engine and DCC plugins: Blender, Unity, Unreal, and Godot
- 1 shared workspace: generations, reviews, and approved versions
- 0 customer data used for training, on any plan

Visual: curved row of Hydrilla showcase stills, streaming across the page

**[Section 2: Workflow]**

## From a prompt or an image to an asset in your pipeline

Brief it, review it in the browser, and move it into the tools your team already uses.

Card 1 title: Brief the asset
Card 1 line: Type a prompt or upload a reference image. For a whole set, brief Water Agent as you would brief your team: the look, the pieces, the scene.

Card 2 title: Generate and review
Card 2 line: BlueFox returns a mesh in parts, UV-unwrapped, with PBR maps attached. Orbit it, select parts, and check materials under light, right in the browser.

Card 3 title: Export into your pipeline
Card 3 line: Download GLB, FBX, OBJ, or USDZ, or send the model over the local Bridge into Blender, Unity, Unreal, or Godot.

**[Section 3: Organization]**

## Hydrilla across your organization

Each part of Enterprise is shaped around how your studio works rather than a fixed tier.

Card 1 title: Seats in a shared workspace
Card 1 line: Art, lookdev, and pipeline staff work together in one shared workspace, so generations, reviews, and approved versions live in the same place.

Card 2 title: API concurrency
Card 2 line: Jobs from your own backend, sized to your volume, for asset libraries, build steps, and internal tools.

Card 3 title: Custom credit pools
Card 3 line: Custom plans with credit pools set around your monthly volume, instead of individual allowances.

Card 4 title: Queue priority
Card 4 line: Priority is part of your plan, set around the monthly volume your pipeline needs.

Card 5 title: Pipeline support
Card 5 line: Help connecting the Bridge and plugins to your pipeline, so artists get generation inside the tools they already use.

Card 6 title: Water Agent for the team
Card 6 line: The AI 3D agent works alongside artists from brief to finished assets, in the Hydrilla app and inside their tools. It costs no credits.

**[Section 4: Workspace and API]**

## Two ways to use Hydrilla: the workspace and the API

Use either one, or both. Artists work in Studio and their own tools, while engineers run the same generation from your backend.

### Workspace

For artists and art teams, in the browser and inside their tools.

- Text to 3D and image to 3D with BlueFox
- Water Agent, at no credit cost
- Review in the browser: orbit, select parts, check materials
- Plugins for Blender, Unity, Unreal, and Godot

### API

For pipeline engineers building generation into your own systems.

- REST API with keys you keep server-side
- Submit a job, then poll its status
- A mesh in parts, with UVs and texture maps
- Concurrency sized to your volume on Enterprise

**[Section 5: Teams]**

## How studio teams use Hydrilla

Five ways teams put BlueFox to work, each with its fit, limits, and tools.

- [Game development](/solutions/games): level dressing and prop sets for your game engine.
- [Film and animation](/solutions/film): set pieces and props for previs, layout, and background dressing.
- [Architecture and interiors](/solutions/architecture): furniture and fixtures that dress rooms for presentations and reviews.
- [AR, VR, and XR](/solutions/xr): objects for headsets and spatial apps, checked against a frame budget.
- [Product visualization](/solutions/product): product photos turned into 3D for web viewers, campaigns, and AR.

**[Section 6: Pro vs Enterprise]**

## How Enterprise differs from Pro

Pro is built for individuals and small teams who buy online. Enterprise is for studios that need an agreement around their volume and their tools.

| | Pro | Enterprise |
|---|---|---|
| How you buy | Self-serve and monthly, on [pricing](/pricing) | An agreement shaped around your studio |
| Built for | Individuals and small teams | Whole studios, with seats in a shared workspace |
| Credits | 3,000 monthly credits on a set plan | Custom plans and credit pools |
| API | REST API access | API concurrency sized to your volume |
| Pipeline | Plugins and docs | Help connecting the Bridge and plugins |
| Water Agent | Included, at no credit cost | Included, at no credit cost |
| Export formats | GLB, FBX, OBJ, and USDZ | GLB, FBX, OBJ, and USDZ |
| Training on your data | Never | Never |

**[Section 7: Security]**

## Security, data, and IP

Work made in a 3D workspace is often unreleased. The [security page](/security) sets out how it's handled; the [Privacy Policy](/privacy) and [Terms](/terms) are the binding documents.

Card 1 title: Your data doesn't train our models
Card 1 line: That holds on every plan, including your prompts, the reference images you upload, and the models you generate.

Card 2 title: You own your output
Card 2 line: As between you and Hydrilla AI, and to the extent the law allows, you own what the service generates for you and may use it commercially. [Read the exact wording](/terms#ownership).

Card 3 title: Your work stays scoped to you
Card 3 line: Sign-in runs through Clerk, generated meshes stay scoped to your workspace, and files sent over the local Bridge travel on your machine to the tool you have open.

Running a vendor review? Send your questionnaire to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm.

**[Section 8: FAQ]**

## Enterprise questions, answered

**What's the difference between Pro and Enterprise?**
Pro is a self-serve monthly plan for individuals and small teams: $12 a month for 3,000 credits, with REST API access. Enterprise is an agreement shaped around your studio, with seats in a shared workspace, API concurrency sized to your volume, custom credit pools, queue priority, and help connecting your pipeline. [See self-serve plans](/pricing).

**What drives Enterprise pricing?**
Enterprise is quoted, not listed. The price follows your seats, API concurrency, monthly generation volume, and queue priority. Tell us those numbers, and we'll come back with a plan around them.

**How do credits work on Enterprise?**
Instead of individual allowances, your studio gets a credit pool set around its monthly volume. On public plans, a model at default quality costs 45 credits from text and 30 from an uploaded image, and Water Agent costs no credits. Your agreement sets the terms of your pool.

**What happens to our assets if we don't renew?**
Files you've already exported stay in your own pipeline. For work still in the workspace, export what you want to keep before your account closes: under the [Terms](/terms), content is deleted as described in the [Privacy Policy](/privacy) when an account closes.

**Can we sign our own agreement?**
Enterprise runs on an agreement shaped around your studio. Send your legal team's requirements or your own paper with your inquiry, and we'll tell you in writing what we can agree to.

**Who owns what we generate, and do you train on our data?**
You keep all rights in what you upload. As between you and Hydrilla AI, and to the extent the law allows, you own the output generated for you and may use it commercially. The [ownership section of the Terms](/terms#ownership) has the exact wording. We don't use your prompts, reference images, or generated models to train our models, on any plan. [How we handle data](/security).

**Will Hydrilla fit the pipeline we already run?**
Hydrilla exports GLB, FBX, OBJ, and USDZ on every plan. [Plugins](/integrations) for Blender, Unity, Unreal, and Godot connect through a local Bridge, the [REST API](/api) runs jobs from your own backend, and an [MCP server](/integrations/mcp) serves AI agents. Enterprise adds help connecting these to your pipeline.

**Can we start on Pro and move up later?**
Yes. You can evaluate on any self-serve plan first. When you get in touch, tell us what you run today, and we'll plan Enterprise around it.

**Can we send a security questionnaire?**
Yes. Send it to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm.

**[Section 9: Closing, anchor #contact]**

## Get Hydrilla Enterprise

Tell us your studio size, engine, and expected monthly volume, and whether you already generate on Pro. The more we know about your pipeline, the more useful the first conversation will be.

Form fields: Full name | Work email | Studio | Studio size | Engine | Expected monthly volume | Message
Form submit: Send message
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, organization, and closing, primary | Book a demo | https://cal.com/hydrilla |
| Hero, secondary | Talk to our team | `#contact` |
| Form | Send message | form submit |

## Internal links on this page
- `/pricing`, `/features`, `/api`, `/integrations`, `/integrations/mcp`
- `/solutions/games`, `/solutions/film`, `/solutions/architecture`, `/solutions/xr`, `/solutions/product`
- `/security`, `/privacy`, `/terms`, `/terms#ownership`

## External links
- https://cal.com/hydrilla
