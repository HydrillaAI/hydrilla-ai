# Page: /integrations/godot

| Field | Value |
|---|---|
| Route | `/integrations/godot` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Godot 4 Plugin for AI 3D Models \| Hydrilla AI |
| Meta description | Install the Hydrilla plugin for Godot 4 and bring GLB models generated with BlueFox into your project. |
| OG title | Hydrilla for Godot 4 |
| H1 | Hydrilla for Godot 4 |
| Canonical | `https://hydrilla.ai/integrations/godot` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication (plugin) + HowTo (install steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Integration child template. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: [Integrations →](/integrations)

# Hydrilla for Godot 4

Bring Hydrilla GLB into Godot 4 projects. The editor plugin generates through the API with your key and listens on the Bridge for models sent from Studio, so both routes end in the same folder.

Date line: Available | Hydrilla Team

**[Section 2: Install]**

## Install

1. Download the plugin and copy addons/hydrilla into your Godot project.
2. Open Project Settings > Plugins and enable the Hydrilla plugin.
3. Open the Hydrilla dock and add your hyd_live_ key.
4. Generate from the dock, or listen on the Bridge for Studio sends.

**[Section 3: Where models land]**

## Where models land

Imported meshes land under res://hydrilla/, so every generated asset sits in one folder you can move or version. For scale, see the [units table →](/docs#scale); for axis and materials, the [import guide →](/blog/import-ai-meshes).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Install the Godot plugin | existing plugin download URL on the live page |
| Hero, secondary | Get an API key | `/app/api-keys` |

## Internal links on this page
- `/app/api-keys`
- `/blog/import-ai-meshes`
- `/docs#scale`
- `/integrations`
