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
Apple-style model page. One-word H1, interactive parts viewer, 4 advantage cards, exploded view, spec table with id="specs", limits section with id="limits". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Model

# BlueFox

BlueFox, Hydrilla's 3D model, turns a prompt or a picture into a segmented 3D model with UVs and PBR textures. It's built by Hydrilla AI. Begin with a [typed prompt →](/text-to-3d) or an [uploaded picture →](/image-to-3d).

Spec line: Current version BlueFox 1, generally available to everyone in Hydrilla.

Visual: interactive viewer of a segmented sample with a parts toggle
Alt text: A generated lantern in a 3D viewer, its frame, glass, and handle highlighted as separate parts.

**[Section 2: Advantages]**

## Ready for your pipeline from the first export

BlueFox is made for the many props, set pieces, and visualization assets a studio needs, and it delivers them in a shape your tools already read.

Card 1 title: UVs and textures included
Card 1 line: Every model arrives unwrapped, with PBR maps already attached, so it reacts to your scene's lights straight away.
Card 2 title: Parts split for you
Card 2 line: Handles, lids, and panels come back as separate pieces you can select, hide, or rework, with no fused mesh to cut apart first.
Card 3 title: Works with your tools
Card 3 line: Every Hydrilla plugin works with it, in your engine or DCC. [Integrations →](/integrations)
Card 4 title: No training on your data
Card 4 line: Your prompts, pictures, and models stay out of our training sets. [How we handle data →](/security)

**[Section 3: Parts and materials]**

## Parts, UVs, and PBR textures

BlueFox returns a mesh split into parts, with UVs and PBR texture maps. Select one part in Studio and leave the rest alone, or repaint the maps in your own tools.

Visual: exploded view of the sample's parts
Alt text: The lantern pulled apart into its frame, glass panels, handle, and base.

**[Section 4: Specs, anchor #specs]**

## BlueFox at a glance

| Spec | BlueFox 1 |
|---|---|
| Version | BlueFox 1 |
| Availability | Generally available to everyone in Hydrilla |
| Inputs | Typed prompt or uploaded image |
| Output | Mesh in parts, UV-unwrapped, with PBR maps |
| Exports | [Hydrilla's export formats →](/features#exports) |

**[Section 5: Fit and limits, anchor #limits]**

## Where BlueFox fits, and where it stops

Use it for props, environment pieces, and visualization assets an artist will finish. BlueFox isn't built for CAD, manufacturing drawings, or finished hero assets that skip an artist pass. The full [model card →](/research#model-card) lists intended use and inputs.
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
