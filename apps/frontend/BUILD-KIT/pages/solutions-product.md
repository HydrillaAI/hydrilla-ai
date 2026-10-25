# Page: /solutions/product

| Field | Value |
|---|---|
| Route | `/solutions/product` |
| Status | Rename (was /usecase/productdesign) |
| Title (absolute, do not append the template suffix) | AI 3D Product Models for E-commerce \| Hydrilla AI |
| Meta description | Turn product photos into 3D models with BlueFox for marketing, web viewers, and AR, with a clear note on where a likeness differs from CAD. |
| OG title | Hydrilla for product visualization |
| H1 | 3D product models from product photos |
| Canonical | `https://hydrilla.ai/solutions/product` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Solution child template with a turntable viewer. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D product models from product photos

Upload a product photo with [image to 3D →](/image-to-3d), and BlueFox, Hydrilla's 3D model, builds a model in Hydrilla AI you can spin and light for storefronts and AR.

Visual: turntable viewer on a white studio background
Alt text: A generated 3D sneaker turning slowly on a plain white background.

**[Section 2: Accuracy]**

## A likeness, not a CAD file

A generated model follows what the photo shows, so treat it as a likeness rather than an engineering replica; for exact dimensions, start from your CAD source ([limits →](/bluefox#limits)). For better results, follow the [reference guide →](/blog/reference-images).

**[Section 3: Web and AR]**

## For web viewers and AR

Check file size before you embed, since storefront pages load on phones too. [Which file suits web and AR →](/features#exports)

**[Section 4: Close]**

Close line: Show the product in 3D, and keep the spec sheet as the source of truth.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/app/studio`
- `/blog/reference-images`
- `/bluefox#limits`
- `/enterprise#contact`
- `/features#exports`
- `/image-to-3d`
