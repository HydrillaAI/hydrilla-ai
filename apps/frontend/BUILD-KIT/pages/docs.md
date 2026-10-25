# Page: /docs

| Field | Value |
|---|---|
| Route | `/docs` |
| Status | Trim |
| Title (absolute, do not append the template suffix) | Docs: Get Started with Hydrilla AI 3D \| Hydrilla AI |
| Meta description | Create a workspace, generate your first model from text or an image with BlueFox, preview it in the browser, and export it for your tools. |
| OG title | Get started with Hydrilla |
| H1 | Get started with Hydrilla |
| Canonical | `https://hydrilla.ai/docs` (self) |
| Robots | index, follow |
| Schema type | TechArticle + HowTo (first-export steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Docs article with side "On this page" nav. Anchors: id="preview", id="export", id="scale", id="water". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Documentation

# Get started with Hydrilla

This guide takes a new Hydrilla AI account to its first AI 3D export, step by step, in the browser.

**[Section 2: First export]**

## Your first export

1. Sign up, then open Studio.
2. Create a workspace so a project's generations stay together.
3. Generate: write a prompt in [text to 3D →](/text-to-3d), or drop a photo into [image to 3D →](/image-to-3d).
4. Preview the model: orbit it and check parts and materials.
5. Choose a format in the export menu and export.
6. Import the file into Blender, Unity, Unreal, or Godot, or send it with a [plugin →](/integrations).

Screenshots: one per step
Alt text: Studio screen for the current step, with the relevant button highlighted.

**[Section 3: Preview and export, anchors #preview and #export]**

## Preview and export

The preview shows the model under light, so shape and material problems appear before you download. The export menu lists every format; [which suits which tool →](/features#exports).

**[Section 4: Workspaces and credits]**

## Workspaces and credits

A workspace keeps a project's generations and versions in one place. Each generation spends plan credits, and your account shows what is left. [Cost per model →](/pricing)

**[Section 5: Scale, anchor #scale]**

## Get the scale right on import

Every tool assumes its own unit and up axis. A mesh in meters arrives a hundred times too small in a tool expecting centimeters, unless the importer converts it.

| Tool | Unit | Up axis | What to watch |
|---|---|---|---|
| Blender | Meters | Z up | Apply scale before you export again |
| Unreal Engine | Centimeters | Z up | Check the import scale field |
| Unity | Meters | Y up | Compare against a default cube |
| glTF 2.0 (GLB) | Meters | Y up | Importers read this as the source |
| Godot 4 | Meters | Y up | Compare against a one-meter box |

**[Section 6: Water Agent, anchor #water]**

## Water Agent

Open Water Agent in the Hydrilla app, or through the Hydrilla plugin inside Blender, Unity, Unreal, or Godot. Describe your brief, review the plan, and revise piece by piece until the set is right. [What Water Agent does →](/water)

Note: Running jobs from code? See the [REST API →](/api). Account questions are in the [FAQ →](/faq).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Start generating | `/app/studio` |
| Hero, secondary | See pricing | `/pricing` |

## Internal links on this page
- `/api`
- `/app/studio`
- `/faq`
- `/features#exports`
- `/image-to-3d`
- `/integrations`
- `/pricing`
- `/text-to-3d`
- `/water`
