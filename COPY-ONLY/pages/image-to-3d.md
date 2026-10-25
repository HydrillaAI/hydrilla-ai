# Page: /image-to-3d

| Field | Value |
|---|---|
| Route | `/image-to-3d` |
| Status | New |
| Title (absolute, do not append the template suffix) | Image to 3D: Turn a Picture into a 3D Model \| Hydrilla AI |
| Meta description | Upload a reference image and BlueFox builds a segmented 3D model that follows its silhouette and materials. Preview it, then export it. |
| OG title | Image to 3D: turn a picture into a 3D model |
| H1 | Image to 3D: turn a picture into a 3D model |
| Canonical | `https://hydrilla.ai/image-to-3d` (self) |
| Robots | index, follow |
| Schema type | WebPage + HowTo (steps match section 2) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Marketing template. Hero with before/after viewer, three numbered steps, one short text section. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Image to 3D: turn a picture into a 3D model

Upload a picture, and BlueFox, Hydrilla's 3D model, builds a segmented 3D model from it in Hydrilla AI, ready to preview and export.

Image to 3D is for the moments when the look is already decided. A product shot, a reference photo from a location scout, or an approved concept frame carries more visual information than any description, and BlueFox uses it as the brief.

Visual: before and after viewer (reference photo beside the orbiting 3D result)
Alt text: A photo of a ceramic vase on the left and the generated 3D vase turning slowly on the right.

**[Section 2: Steps]**

## From picture to model in three steps

The workflow is short on purpose. There is no image stage to approve, because your picture is the approved look.

1. Upload a picture of the object you want.
2. Start the job, and the picture becomes a model split into parts. [Credits per job →](/pricing)
3. Spin it in the preview, check each part, then [export →](/features#exports).

**[Section 3: What the model reads]**

## What BlueFox reads from your image

Image to 3D uses your reference to follow its silhouette, materials, and style. It works from what the camera captured, so sides the photo doesn't show are inferred. Shoot from the side that carries the detail you need, and the model will follow it most closely.

Visual: reference photo with silhouette, material, and style callouts
Alt text: A reference photo of a leather armchair with labels pointing to its outline, its leather surface, and its overall style.

**[Section 4: Better references]**

## Better pictures make better models

The quality of the reference sets the ceiling for the model. One clear subject, in even light, against a plain background, gives BlueFox the least to guess. The guide below walks through framing, light, and a short checklist. [How to shoot a good reference →](/blog/reference-images)

**[Section 5: Choose your start]**

## Starting without a picture

No picture yet? Describe the asset with [text to 3D →](/text-to-3d), which creates a reference for you to refine first. Every result arrives with parts, UVs, and PBR maps, [detailed on the model page →](/bluefox).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Start generating | `/app/studio` |
| Hero, secondary | See pricing | `/pricing` |

## Internal links on this page
- `/app/studio`
- `/blog/reference-images`
- `/bluefox`
- `/features#exports`
- `/pricing`
- `/text-to-3d`
