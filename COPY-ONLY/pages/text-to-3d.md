# Page: /text-to-3d

| Field | Value |
|---|---|
| Route | `/text-to-3d` |
| Status | New |
| Title (absolute, do not append the template suffix) | Text to 3D: Generate a 3D Model from a Prompt \| Hydrilla AI |
| Meta description | Write a prompt, refine the reference image, then let BlueFox generate a segmented 3D model with PBR maps. Preview it and export it. |
| OG title | Text to 3D with BlueFox |
| H1 | Text to 3D with BlueFox |
| Canonical | `https://hydrilla.ai/text-to-3d` (self) |
| Robots | index, follow |
| Schema type | WebPage + HowTo (steps match section 2) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Marketing template. Hero with three-frame sequence, numbered step list, a two-column prompt table, short close. No pricing blocks. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Text to 3D with BlueFox

Describe an asset, approve a picture of it, and BlueFox, Hydrilla's 3D model, builds it as a segmented 3D model in Hydrilla AI. [About BlueFox →](/bluefox)

Text to 3D is the right start when the idea exists only as words: a prop list from a level designer, a line in a script, or a note from an art director. You write what the asset is and how it will be used, and Hydrilla turns that description into a model you can preview and take further.

Visual: three frames in sequence (prompt, reference image, 3D model)
Alt text: Three frames left to right: a typed prompt for a brass lantern, the image it produced, and the finished 3D lantern.

**[Section 2: Steps]**

## Four steps from prompt to model

Text to 3D starts with a reference image that you can refine before the 3D model is generated. That picture is your chance to agree on the look before any geometry exists.

1. Write a prompt naming the subject, its style, and its use.
2. An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame.
3. Adjust the image with an Edit prompt until it looks right.
4. Generate the 3D model, then preview it and [export →](/features#exports).

Every model comes back UV-unwrapped, with PBR maps, so it is ready for material work from the start. [What BlueFox returns →](/bluefox)

**[Section 3: Prompts]**

## Write prompts that say how the asset will be used

Be specific about scale and use. A prompt that names the use, the scale, and how close the camera will get gives BlueFox a clearer brief than a list of adjectives. The examples below show the difference that one extra detail makes.

| Prompt | Why it works |
|---|---|
| Low-poly wooden crate for a Unity mobile game | Names the style and engine |
| Weathered brass ship lantern with worn edges | Sets the material and detail level |
| Walnut lounge chair at real scale, for interior renders | Gives scale and use |
| Cargo container for a background set | Says it sits far from camera |

**[Section 4: Refine]**

## Refine the image before you spend on 3D

Settle the look at the image stage, where a change is one more Edit prompt. Adjust color, proportion, or wear on the picture until it reads the way you want, then generate the model once. It keeps review short and credits focused on the version you actually approve.

**[Section 5: Choose your start]**

## When another start fits better

If you already have a photo or concept image, start from it with [image to 3D →](/image-to-3d). If the job is a whole set of pieces rather than one model, brief [Water Agent →](/water) instead. [See what a model costs →](/pricing)
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Start generating | `/app/studio` |
| Hero, secondary | See pricing | `/pricing` |

## Internal links on this page
- `/app/studio`
- `/bluefox`
- `/features#exports`
- `/image-to-3d`
- `/pricing`
- `/water`
