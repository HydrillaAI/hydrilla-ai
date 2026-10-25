# Page: /blog/reference-images

| Field | Value |
|---|---|
| Route | `/blog/reference-images` |
| Status | New |
| Title (absolute, do not append the template suffix) | Reference Images for Image to 3D: A Guide \| Hydrilla AI |
| Meta description | How to frame, light, and crop a reference image so image to 3D has a good starting point, plus a checklist to run before you upload. |
| OG title | Preparing reference images for image to 3D |
| H1 | What makes a good reference image for image to 3D? |
| Canonical | `https://hydrilla.ai/blog/reference-images` (self) |
| Robots | index, follow |
| Schema type | Article (datePublished, dateModified = content date) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Article template, question H1, good/poor image pair, checklist. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Short answer]**

Kicker: Guide

# What makes a good reference image for image to 3D?

Date line: publish date | Hydrilla Team

A good reference shows one subject, whole and in focus, against a plain background in soft, even light, from a slight angle rather than flat on. The clearer its outline, the less guessing [image to 3D →](/image-to-3d) in Hydrilla AI does.

The model can only work from what the picture contains. Every shadow, reflection, and cropped edge is information it has to interpret, so a few minutes spent on the photo usually saves several rounds of regeneration.

**[Section 2: Framing and light]**

## Subject, framing, and light

Let the object fill most of the frame, with a small margin on every side. A three-quarter angle shows two faces and a sense of depth. Avoid hard shadows and strong reflections, which can read as shape. A sharp phone photo is enough; you do not need a studio, only a plain wall and light from a window on an overcast day.

Good example caption: One chair, three-quarter view, plain wall, soft daylight, nothing cropped.
Poor example caption: The same chair cut off at the legs, in a busy room, under hard window light.

Alt text (good): A wooden chair photographed from a three-quarter angle against a plain light wall, fully in frame.
Alt text (poor): A wooden chair cropped at the legs in a cluttered room, with a harsh shadow across the seat.
Visual: two-up good and poor pair

**[Section 3: Hidden sides]**

## The sides the camera can't see

A single image can't show the back of an object, so the model has to infer it. When the hidden side matters, pick the angle that shows the faces you care about most. For objects that look very different from behind, such as a chair with a carved back, photograph the side that carries the most detail.

**[Section 4: Background and color]**

## Why the background matters

A busy background competes with the subject for the model's attention, and an object that matches its background loses its outline. Choose a plain surface that contrasts with the subject: a light wall behind a dark object, or a dark cloth behind a light one. Avoid colored light, which can tint the textures the model produces.

**[Section 5: Checklist]**

## Before you upload

- One subject, with nothing touching it
- Sharp at full size, without blur or heavy compression
- The whole object in frame, with every edge visible
- A plain background that contrasts with the subject
- Even light, without blown highlights or colored casts
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| End of article, primary | Start generating | `/app/studio` |

## Internal links on this page
- `/app/studio`
- `/image-to-3d`
