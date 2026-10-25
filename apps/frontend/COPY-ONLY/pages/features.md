# Page: /features

| Field | Value |
|---|---|
| Route | `/features` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | AI 3D Workspace for Studios and Artists \| Hydrilla AI |
| Meta description | Generate 3D models from text or images with BlueFox, check parts and PBR maps in the browser, and export GLB, FBX, OBJ, or USDZ to your tools. |
| OG title | Generate, check, and export 3D with BlueFox |
| H1 | Generate, check, and export 3D with BlueFox |
| Canonical | `https://hydrilla.ai/features` (self) |
| Robots | index, follow |
| Schema type | WebPage + SoftwareApplication (features#software, the one full Hydrilla app node) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Product overview. Hero loop, inputs row with a small Water Agent H3 block, preview section, exports table with id="exports", logo row linking each integration, one-line close. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Generate, check, and export 3D with BlueFox

Generate from text or an image with BlueFox, Hydrilla's 3D model, check the result in the browser, and export it to your engine or DCC.

Hydrilla keeps generation, review, and handoff in one browser workspace, so an artist can move from an idea to a file the pipeline accepts without changing tools. Each step below links to the page that covers it in depth.

Visual: looping Studio capture (prompt or image in, segmented model orbiting, export menu open)
Alt text: Hydrilla Studio screen showing a prompt field, a segmented 3D model turning in the preview, and the export menu open.

**[Section 2: Inputs]**

## Start from a prompt, an image, or a conversation

Pick the input that matches what you already have. A written description works while the idea is still in your head, and a picture works once the look is decided. [Text to 3D →](/text-to-3d) and [image to 3D →](/image-to-3d) both run on BlueFox, so results arrive in the same structure whichever way you start.

### Water Agent

When the job is a whole set rather than one model, give Water Agent the brief and work through it piece by piece in one conversation, as you would with your art team. [How Water Agent works →](/water)

Visual: three-up (prompt, reference image, Water Agent chat)
Alt text: Three input panels in Hydrilla Studio: a typed prompt, an uploaded reference image, and a Water Agent chat thread.

**[Section 3: Preview]**

## Check every model before you export

Every result opens in an in-browser preview, so you can judge it before it reaches your project. Orbit the model, select individual parts, and look at materials under light to catch shape or texture problems while they are still cheap to fix. Each result is a segmented mesh with UVs and PBR maps, [explained here →](/bluefox).

Visual: preview capture with parts highlighted
Alt text: Browser preview of a generated model with one part selected and its material settings shown beside it.

**[Section 4: Exports, anchor #exports]**

## Export to the format your tool opens

Hydrilla exports GLB, FBX, OBJ, and USDZ, on every plan, Free included. Choose the format by where the asset goes next; the table is a quick guide, and the [units table →](/docs#scale) helps you check scale on import.

| Format | Use |
|---|---|
| GLB | Web viewers and real-time engines |
| FBX | DCC tools and engines that expect FBX |
| OBJ | Plain geometry between modeling tools |
| USDZ | AR viewers on iPhone and iPad |

**[Section 5: Tools]**

## Send it straight into your tools

Plugins for Blender, Unity, Unreal, and Godot take models over the local Bridge, so a result can move from the preview into your open scene without a manual download. AI agents connect through MCP, and your own code calls the [REST API →](/api). [All integrations →](/integrations)

Logo row (each links to its page): Blender | Unity | Unreal | Godot | MCP | API
Alt text (logo row): Logos for Blender, Unity, Unreal Engine, Godot, and MCP, with an API label.

**[Section 6: Close]**

New models will be available through Water Agent as they arrive.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | See pricing | `/pricing` |

## Internal links on this page
- `/api`
- `/app/studio`
- `/bluefox`
- `/docs#scale`
- `/image-to-3d`
- `/integrations`
- `/pricing`
- `/text-to-3d`
- `/water`
