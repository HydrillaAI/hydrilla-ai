# Page: /research

| Field | Value |
|---|---|
| Route | `/research` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Research: The BlueFox 1 AI 3D Model Card \| Hydrilla AI |
| Meta description | Hawan Research Labs, Hydrilla AI's research lab, builds BlueFox. Read the BlueFox 1 model card: inputs, outputs, intended use, and limits. |
| OG title | Hawan Research Labs at Hydrilla AI |
| H1 | Research |
| Canonical | `https://hydrilla.ai/research` (self) |
| Robots | index, follow |
| Schema type | TechArticle (model card; author /research#lab, publisher #organization) + ResearchOrganization (/research#lab) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Research page: hero, focus line, model card table with id="model-card". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Company

# Research

Hawan Research Labs is Hydrilla AI's research lab. It's where we build BlueFox, Hydrilla's 3D model. Below is the model card. [About Hydrilla →](/about)

**[Section 2: What we work on]**

## What we work on

Generating 3D from text and images: meshes split into usable parts, physically based materials, and assets that hold up in game, film, architecture, and XR scenes. [Meet the team →](/team)

**[Section 3: Model card, anchor #model-card]**

## BlueFox 1 model card

The card lists what the current model takes in, what it returns, and what it's for.

| Field | Detail |
|---|---|
| Model | BlueFox 1, in the BlueFox family |
| Built by | Hawan Research Labs, the research lab of Hydrilla AI |
| Availability | Generally available to everyone in Hydrilla |
| Inputs | Text prompt, reference image |
| Outputs | Segmented mesh with UVs and textures (PBR maps) |
| Exports | [Hydrilla's export formats →](/features#exports) |
| Intended use | Props, environments, visualization, and starting assets for an artist pass |
| Not intended for | CAD or precision engineering |
| Training data | Customer data isn't used ([security →](/security)) |
| Repository | [Hugging Face →](https://huggingface.co/Hydrilla/BlueFox3D) |
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| After model card, secondary | Read about BlueFox | `/bluefox` |

## Internal links on this page
- `/about`
- `/bluefox`
- `/features#exports`
- `/security`
- `/team`

## External links
- https://huggingface.co/Hydrilla/BlueFox3D
