# Page: /solutions/architecture

| Field | Value |
|---|---|
| Route | `/solutions/architecture` |
| Status | Rename (was /usecase/architecture) |
| Title (absolute, do not append the template suffix) | AI 3D Furniture and Interiors for Archviz \| Hydrilla AI |
| Meta description | Generate furniture, fixtures, and interior props from a photo or prompt with BlueFox for architectural visualization and client reviews. |
| OG title | Hydrilla for architecture and interiors |
| H1 | 3D furniture and fixtures for visualization |
| Canonical | `https://hydrilla.ai/solutions/architecture` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Solution child template with a fit table. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D furniture and fixtures for visualization

Furnish rooms for presentations and design reviews with furniture and fixtures generated in Hydrilla AI from a [photo →](/image-to-3d) or a prompt.

Visual: interior render dressed with generated pieces
Alt text: A furnished living room render with a generated sofa, side table, floor lamp, and potted plant.

**[Section 2: Fit]**

## Good fits and poor fits

| Fit | Example |
|---|---|
| Good fit | Generic chairs, lamps, plants, and decor that fill a room |
| Good fit | Placeholder furnishings for an early design review |
| Poor fit | An exact catalogue piece the client intends to buy |
| Poor fit | Fixtures that need manufacturer dimensions ([limits →](/bluefox#limits)) |

**[Section 3: Into your tool]**

## Into your visualization tool

Check scale on import with the [units table →](/docs#scale). Use the [Blender add-on →](/integrations/blender), or pick the [format →](/features#exports) your renderer prefers. Look over the PBR maps under your scene lighting before the review, since materials read differently in every renderer.

**[Section 4: Close]**

Close line: Dress the room with generated pieces, and keep the specified products exact.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/app/studio`
- `/bluefox#limits`
- `/docs#scale`
- `/enterprise#contact`
- `/features#exports`
- `/image-to-3d`
- `/integrations/blender`
