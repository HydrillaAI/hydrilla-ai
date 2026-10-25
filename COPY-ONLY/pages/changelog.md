# Page: /changelog

| Field | Value |
|---|---|
| Route | `/changelog` |
| Status | Keep, extend |
| Title (absolute, do not append the template suffix) | Hydrilla Changelog: AI 3D Product Updates \| Hydrilla AI |
| Meta description | Dated release notes for Hydrilla and BlueFox 1: generation, Studio, integrations, exports, and the REST API. |
| OG title | Hydrilla changelog |
| H1 | Changelog |
| Canonical | `https://hydrilla.ai/changelog` (self) |
| Robots | index, follow |
| Schema type | CollectionPage + ItemList (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Dated list, newest first. Add new entries on top as releases ship. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

# Changelog

Releases to Hydrilla AI and BlueFox, Hydrilla's 3D model, newest first.

Each entry records what shipped and links to the page that explains it. When something changes how you work, such as a new input, a new integration, or a change to plans, it appears here first.

**[Section 2: Entries]**

## 19 Aug 2026: BlueFox 1 in Studio

BlueFox 1 now runs in Studio: text or image input, segmented meshes with PBR maps, and a browser preview. Artists can generate, check parts and materials, and download results in one place. [About BlueFox →](/bluefox)

## 19 Aug 2026: REST API

Job-based generation for pipelines: send a prompt or a reference, track the job, fetch the files. Teams can now run the same generation as the workspace from their own code. [REST API →](/api)

## 19 Aug 2026: Docs, FAQ, and pipeline notes

Getting-started docs, a buyer FAQ, and the BlueFox 1 model card went public, so teams can evaluate Hydrilla before they sign up. [Docs →](/docs)
<!-- COPY:END -->

## CTAs
Inline links only .

## Internal links on this page
- `/api`
- `/bluefox`
- `/docs`
