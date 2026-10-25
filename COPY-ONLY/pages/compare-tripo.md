# Page: /compare/tripo

| Field | Value |
|---|---|
| Route | `/compare/tripo` |
| Status | Rename + rewrite (was /compare/hydrilla-vs-tripo) |
| Title (absolute, do not append the template suffix) | Hydrilla vs Tripo: Inputs, Exports, and API \| Hydrilla AI |
| Meta description | Hydrilla and Tripo both turn text or images into 3D. Compare BlueFox with Tripo on outputs, formats, plugins, API, and plans, with dates. |
| OG title | Hydrilla vs Tripo |
| H1 | How does Hydrilla compare to Tripo? |
| Canonical | `https://hydrilla.ai/compare/tripo` (self) |
| Robots | index, follow |
| Schema type | Article; about -> Thing (name, sameAs tripo3d.ai) only (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Compare template. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Short answer]**

Kicker: Compare

# How does Hydrilla compare to Tripo?

Hydrilla AI and Tripo both turn text or images into 3D. They come from separate companies with separate models: BlueFox, Hydrilla's 3D model, on one side, Tripo's own model line on the other.

The table compares what each product says it offers on its public pages, from inputs and outputs to plugins and plans. Use it to narrow the field, then run a [bake-off →](/compare/how-to-choose) in your own scene before you decide.

**[Section 2: Table]**

## Side by side

| | Hydrilla | Tripo (confirm on tripo3d.ai) |
|---|---|---|
| Generation model | [BlueFox 1 →](/bluefox) | Tripo's own model line |
| Input types | A prompt, or a single reference image | Its API page lists multiview input alongside text and image |
| What comes back | A mesh in parts, PBR maps included | Textured models; API services for segmentation, retopology, and rigging |
| File formats | Four [export formats →](/features#exports) | GLB, FBX, OBJ, USDZ, and more; STL and 3MF for printing |
| Plugins | Four engine and DCC [plugins →](/integrations), plus the local Bridge | A DCC bridge for Blender, 3ds Max, Unity, Unreal, Maya, Cocos, Godot, and ZBrush |
| Developer access | Job-based REST API, plus MCP for AI agents | Credit-priced API with task completion notices |
| Plans | Free, paid, and Hourly plans, all priced in credits ([plans →](/pricing)) | Free, Pro, Max, and per-seat Team plans, priced in credits |
| Public limits | Stated on the [BlueFox page →](/bluefox#limits) and model card | Confirm on tripo3d.ai |
| AI 3D agent | [Water Agent →](/water) builds and revises whole asset sets in conversation, on every plan, no credits | Confirm on tripo3d.ai |

**[Section 3: Fit]**

## When each one fits

Choose Hydrilla when you want segmented parts, a public model card, and an AI 3D agent that directs whole sets with you, from input to export. Hourly plans also suit artists who generate at the same time each day.

Tripo may fit better when the work also covers 3D printing, rigging, or a tool on its bridge list that Hydrilla doesn't support. Test the steps your pipeline depends on most.

**[Section 4: Check]**

## Check before you decide

Plans and features change over time, so confirm every row on [tripo3d.ai →](https://www.tripo3d.ai) before you choose, and note the date you checked.

**[Section 5: Date line]**

Date line: Checked 24 Oct 2026 | Hydrilla Team
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| End, primary | Start generating | `/app/studio` |

## Internal links on this page
- `/app/studio`
- `/bluefox`
- `/bluefox#limits`
- `/compare/how-to-choose`
- `/features#exports`
- `/integrations`
- `/pricing`
- `/water`

## External links
- https://www.tripo3d.ai
