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
Docs article with side "On this page" nav. Anchors: id="preview", id="export", id="scale", id="water". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: Documentation

# Get started with Hydrilla

This guide takes a new Hydrilla AI account to its first AI 3D export, step by step, in the browser.

It is written for the first hour with Hydrilla. Follow the steps in order and you will finish with a model in your own tool, plus the settings that keep every later import consistent. Each product page goes deeper; this page stays practical.

**[Section 2: First export]**

## Your first export

Six steps take you from sign-up to a file in your project. None of them need a plugin, so you can start in any browser.

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

The preview shows the model under light, so shape and material problems appear before you download. Orbit it from every side, select parts to check how the mesh is divided, and look at the materials in light and shadow. When it looks right, open the export menu; it lists every format, and [this table shows which suits which tool →](/features#exports).

**[Section 4: Workspaces and credits]**

## Workspaces and credits

A workspace keeps a project's generations and versions in one place, so it is easy to compare drafts and find the version you approved. Each generation spends plan credits, and your account shows what is left. [Cost per model →](/pricing)

**[Section 5: Scale, anchor #scale]**

## Get the scale right on import

Every tool assumes its own unit and up axis. A mesh in meters arrives a hundred times too small in a tool expecting centimeters, unless the importer converts it. Check the first asset you bring into a project against the table, then save the importer settings so the next import matches.

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

**[Section 7: Next steps]**

## Where to go next

Running jobs from code? See the [REST API →](/api). Working inside an engine or DCC every day? Install a [plugin →](/integrations). Account and licensing questions are answered in the [FAQ →](/faq).
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
