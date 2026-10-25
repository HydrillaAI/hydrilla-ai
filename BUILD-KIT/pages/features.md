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
Product overview. Hero loop, inputs row with a small Water Agent H3 block, preview section, exports table with id="exports", logo row linking each integration, one-line close. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Generate, check, and export 3D with BlueFox

Generate from text or an image with BlueFox, Hydrilla's 3D model, check the result in the browser, and export it to your engine or DCC.

Visual: looping Studio capture (prompt or image in, segmented model orbiting, export menu open)
Alt text: Hydrilla Studio screen showing a prompt field, a segmented 3D model turning in the preview, and the export menu open.

**[Section 2: Inputs]**

## Start from a prompt, an image, or a conversation

Describe the asset with [text to 3D →](/text-to-3d), or upload a picture with [image to 3D →](/image-to-3d). BlueFox builds either one.

### Water Agent

Give Water Agent the brief for a whole set, and work through it piece by piece in one conversation, as you would with your art team. [How Water Agent works →](/water)

Visual: three-up (prompt, reference image, Water Agent chat)
Alt text: Three input panels in Hydrilla Studio: a typed prompt, an uploaded reference image, and a Water Agent chat thread.

**[Section 3: Preview]**

## Check every model before you export

Orbit it, select parts, and check materials under light. Each result is a segmented mesh with UVs and PBR maps, [explained here →](/bluefox).

Visual: preview capture with parts highlighted
Alt text: Browser preview of a generated model with one part selected and its material settings shown beside it.

**[Section 4: Exports, anchor #exports]**

## Export to the format your tool opens

Hydrilla exports GLB, FBX, OBJ, and USDZ, on every plan, Free included.

| Format | Use |
|---|---|
| GLB | Web viewers and real-time engines |
| FBX | DCC tools and engines that expect FBX |
| OBJ | Plain geometry between modeling tools |
| USDZ | AR viewers on iPhone and iPad |

**[Section 5: Tools]**

## Send it straight into your tools

Engine and DCC plugins take models over the local Bridge, agents use MCP, and code calls the [REST API →](/api). [All integrations →](/integrations)

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
- `/image-to-3d`
- `/integrations`
- `/pricing`
- `/text-to-3d`
- `/water`
