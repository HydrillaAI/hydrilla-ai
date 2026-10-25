# Page: /blog

| Field | Value |
|---|---|
| Route | `/blog` |
| Status | Rewrite intro |
| Title (absolute, do not append the template suffix) | Hydrilla Blog: Guides for AI 3D Workflows \| Hydrilla AI |
| Meta description | Practical guides from the Hydrilla team on reference images, engine import, and getting AI-generated 3D models into a working pipeline. |
| OG title | Hydrilla Blog |
| H1 | Blog |
| Canonical | `https://hydrilla.ai/blog` (self) |
| Robots | index, follow |
| Schema type | CollectionPage + ItemList (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Blog index: H1, intro, 2 post cards with dates. One H1 per page. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

# Blog

Practical guides from the Hydrilla team on working with AI 3D output. Each guide answers one question, from choosing a reference image to bringing an exported mesh into your game engine at the right scale.

We write for the artist at the desk, not the press release. Every guide is short enough to read before you start a task and specific enough to change how you do it.

**[Section 2: Posts (no heading)]**

Card 1 title: [How do you import an AI-generated mesh into a game engine? →](/blog/import-ai-meshes)
Card 1 line: Units, up axis, and material checks for Unity, Unreal, and Godot, with a short checklist.
Card 1 date: publish date (set at publish)

Card 2 title: [What makes a good reference image for image to 3D? →](/blog/reference-images)
Card 2 line: Framing, light, and hidden sides, plus what to check before you upload a photo.
Card 2 date: publish date (set at publish)
<!-- COPY:END -->

## CTAs
None beyond the cards .

## Internal links on this page
- `/blog/import-ai-meshes`
- `/blog/reference-images`
