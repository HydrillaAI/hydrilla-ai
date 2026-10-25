# Page: /bluefox

| Field | Value |
|---|---|
| Route | `/bluefox` |
| Status | Rewrite + rename (was /bluefox3d) |
| Title (absolute, do not append the template suffix) | BlueFox: Hydrilla's AI 3D Model \| Hydrilla AI |
| Meta description | BlueFox, Hydrilla's 3D model, turns a text prompt or reference image into a segmented mesh with UVs and PBR textures. Generally available. |
| OG title | BlueFox from Hydrilla AI |
| H1 | BlueFox |
| Canonical | `https://hydrilla.ai/bluefox` (self) |
| Robots | index, follow |
| Schema type | WebPage + SoftwareApplication (bluefox#model) + BreadcrumbList (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Apple-style model page. One-word H1, interactive parts viewer, 4 advantage cards, exploded view, spec table with id="specs", limits section with id="limits". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Model

# BlueFox

BlueFox, Hydrilla's 3D model, turns a prompt or a picture into a segmented 3D model with UVs and PBR textures. It's built by Hydrilla AI. Begin with a [typed prompt →](/text-to-3d) or an [uploaded picture →](/image-to-3d).

BlueFox is the flagship of the Hydrilla workspace. It is designed for the volume work that fills a studio's schedule, the props, set pieces, and visualization assets that every scene needs and few teams have time to model by hand.

Spec line: Current version BlueFox 1, generally available to everyone in Hydrilla.

Visual: interactive viewer of a segmented sample with a parts toggle
Alt text: A generated lantern in a 3D viewer, its frame, glass, and handle highlighted as separate parts.

**[Section 2: Advantages]**

## Ready for your pipeline from the first export

A generated model is only useful if your tools can work with it. BlueFox delivers assets in a structure artists already expect, so the first minutes after generation go into creative decisions rather than repair.

Card 1 title: UVs and textures included
Card 1 line: Every model arrives unwrapped, with PBR maps already attached. It reacts to your scene's lights straight away, and the maps are ready to repaint if the look needs to change.

Card 2 title: Parts split for you
Card 2 line: Handles, lids, and panels come back as separate pieces you can select, hide, or rework. There is no fused mesh to cut apart before material work can start.

Card 3 title: Works with your tools
Card 3 line: Every Hydrilla plugin works with BlueFox, in your engine or DCC, so results reach the scene you are building. [Integrations →](/integrations)

Card 4 title: No training on your data
Card 4 line: Your prompts, pictures, and models stay out of our training sets, on every plan. [How we handle data →](/security)

**[Section 3: Parts and materials]**

## Parts, UVs, and PBR textures

BlueFox returns a mesh split into parts, with UVs and PBR texture maps. That structure is what makes a generated asset editable: select one part in Studio and leave the rest alone, assign a different material to a single panel, or repaint the maps in your own tools without unwrapping anything first.

Visual: exploded view of the sample's parts
Alt text: The lantern pulled apart into its frame, glass panels, handle, and base.

**[Section 4: Specs, anchor #specs]**

## BlueFox at a glance

The current release is BlueFox 1. The table summarizes what it takes in and what it returns; the full model card on the research page covers intended use in more detail.

| Spec | BlueFox 1 |
|---|---|
| Version | BlueFox 1 |
| Availability | Generally available to everyone in Hydrilla |
| Inputs | Typed prompt or uploaded image |
| Output | Mesh in parts, UV-unwrapped, with PBR maps |
| Exports | [Hydrilla's export formats →](/features#exports) |

**[Section 5: Fit and limits, anchor #limits]**

## Where BlueFox fits, and where it stops

Use it for props, environment pieces, and visualization assets an artist will finish. BlueFox isn't built for CAD, manufacturing drawings, or finished hero assets that skip an artist pass. Being clear about that line helps teams plan where generation saves time and where a modeler should lead. The full [model card →](/research#model-card) lists intended use and inputs.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Start generating | `/app/studio` |
| Section 5, secondary | Read the model card | `/research#model-card` |

## Internal links on this page
- `/app/studio`
- `/features#exports`
- `/image-to-3d`
- `/integrations`
- `/research#model-card`
- `/security`
- `/text-to-3d`
