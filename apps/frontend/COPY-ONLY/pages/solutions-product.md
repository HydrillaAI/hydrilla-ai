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
Solution child template with a turntable viewer. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D product models from product photos

Upload a product photo with [image to 3D →](/image-to-3d), and BlueFox, Hydrilla's 3D model, builds a model in Hydrilla AI you can spin and light for storefronts and AR.

Shoppers want to see a product from every side before they buy, and a photo set only goes so far. A model generated from your existing product photography gives marketing and ecommerce teams a 3D view to work with, without commissioning a full modeling job for every item in the range.

Visual: turntable viewer on a white studio background
Alt text: A generated 3D sneaker turning slowly on a plain white background.

**[Section 2: Accuracy]**

## A likeness, not a CAD file

A generated model follows what the photo shows, so treat it as a likeness rather than an engineering replica; for exact dimensions, start from your CAD source ([limits →](/bluefox#limits)). Results improve with a clean, well-lit photo, and the [reference guide →](/blog/reference-images) shows how to shoot one.

**[Section 3: Web and AR]**

## For web viewers and AR

Check file size before you embed, since storefront pages load on phones too. Review the model under the same light as your product photography, so color and material match what customers see elsewhere in the listing. [Which file suits web and AR →](/features#exports)

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
