# Page: /blog/import-ai-meshes

| Field | Value |
|---|---|
| Route | `/blog/import-ai-meshes` |
| Status | New |
| Title (absolute, do not append the template suffix) | Import AI 3D Meshes into Unity, Unreal, Godot \| Hydrilla AI |
| Meta description | Fix axis and material problems when you import a generated GLB or FBX into Unity, Unreal, or Godot, with a step-by-step checklist. |
| OG title | Importing AI meshes into game engines |
| H1 | How do you import an AI-generated mesh into a game engine? |
| Canonical | `https://hydrilla.ai/blog/import-ai-meshes` (self) |
| Robots | index, follow |
| Schema type | Article (datePublished, dateModified = content date) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Article template, question H1, numbered checklist. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Short answer]**

Kicker: Guide

# How do you import an AI-generated mesh into a game engine?

Date line: publish date | Hydrilla Team

[Export a GLB or FBX →](/features#exports), then check the up axis and materials on import. Most problems come from tools disagreeing about orientation and texture setup, not from the mesh itself.

The good news is that these problems repeat. Once you have fixed them for one asset and saved the settings, every later import from the same source arrives the same way. This guide covers the two checks that matter and a checklist to keep beside your engine.

**[Section 2: Axis]**

## Why does the model arrive on its side?

Tools disagree on the up axis: Blender and Unreal use Z up, while Unity, Godot, and glTF use Y up, so a model can arrive lying on its side. Fix it in the importer rather than rotating the object, so the correction applies to every asset and pivots stay where they should be. Units and scale are covered in the [docs →](/docs#scale).

**[Section 3: Materials]**

## How do you keep the materials?

GLB packs its textures inside the file, so materials usually arrive assigned. Other formats often point to separate texture files, so keep the maps beside the mesh and check the UVs came through. Base color is sRGB; roughness, metalness, and normal maps are linear. If a material looks washed out or too dark, a color-space setting is the first thing to check.

**[Section 4: Checklist]**

## Import checklist

1. Pick the format your importer prefers: GLB or FBX.
2. Fix the up axis in import settings, not by rotating the object.
3. Open each material and confirm every texture slot has a map.
4. If bumps look inverted, flip the normal map's green channel (Unreal uses DirectX style).
5. Save the import settings as a preset, so every later asset arrives the same way.

**[Section 5: Plugins]**

## Prefer a plugin?

Plugins for the three engines, [Unity →](/integrations/unity), [Unreal Engine →](/integrations/unreal), and [Godot →](/integrations/godot), place GLB files in a fixed project folder for you, so most of these checks are handled once and reused.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| End of article, primary | Start generating | `/app/studio` |

## Internal links on this page
- `/app/studio`
- `/docs#scale`
- `/features#exports`
- `/integrations/godot`
- `/integrations/unity`
- `/integrations/unreal`
