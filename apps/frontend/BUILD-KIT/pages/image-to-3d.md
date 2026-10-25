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
Marketing template. Hero with before/after viewer, three numbered steps, one short text section. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Image to 3D: turn a picture into a 3D model

Upload a picture, and BlueFox, Hydrilla's 3D model, builds a segmented 3D model from it in Hydrilla AI, ready to preview and export.

Visual: before and after viewer (reference photo beside the orbiting 3D result)
Alt text: A photo of a ceramic vase on the left and the generated 3D vase turning slowly on the right.

**[Section 2: Steps]**

## From picture to model in three steps

1. Upload a picture of the object you want.
2. Start the job, and the picture becomes a model split into parts. [Credits per job →](/pricing)
3. Spin it in the preview, check each part, then [export →](/features#exports).

**[Section 3: What the model reads]**

## What BlueFox reads from your image

Image to 3D uses your reference to follow its silhouette, materials, and style. It works from what the camera captured, so sides the photo doesn't show are inferred. [How to shoot a good reference →](/blog/reference-images)
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Start generating | `/app/studio` |
| Hero, secondary | See pricing | `/pricing` |

## Internal links on this page
- `/app/studio`
- `/blog/reference-images`
- `/features#exports`
- `/pricing`
