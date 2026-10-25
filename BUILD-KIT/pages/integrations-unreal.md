# Page: /integrations/unreal

| Field | Value |
|---|---|
| Route | `/integrations/unreal` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Unreal Engine Plugin for AI 3D Models \| Hydrilla AI |
| Meta description | Install the Hydrilla plugin for Unreal Engine and bring BlueFox meshes into the Unreal Editor, ready to place, light, and test. |
| OG title | Hydrilla for Unreal Engine |
| H1 | Hydrilla for Unreal Engine |
| Canonical | `https://hydrilla.ai/integrations/unreal` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication (plugin) + HowTo (install steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Integration child template. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: [Integrations →](/integrations)

# Hydrilla for Unreal Engine

Generate 3D models and bring them into Unreal Editor. A Python editor plugin runs generation from the toolbar, and it receives models you send from Studio over the Bridge.

Date line: Available | Hydrilla Team

**[Section 2: Install]**

## Install

1. Enable the Python Editor Script Plugin in Unreal, then restart the editor.
2. Unzip the download and place its Hydrilla folder in Content/Python or Plugins.
3. Open the Hydrilla actions from the editor toolbar.
4. Set your API key there, or switch on the Bridge listener.

**[Section 3: Generate]**

## Generate from the editor

Run a job from the Hydrilla toolbar with your own brief. GLB files land in Content/Hydrilla, where the glTF importer turns them into assets you can place, light, and test.

Visual: screenshot of the Hydrilla toolbar in Unreal
Alt text: Unreal Editor with the Hydrilla toolbar actions open and an imported model in the Content Browser.

**[Section 4: Check]**

## Check the import

Check scale with the [units table →](/docs#scale), and axis and materials with the [import guide →](/blog/import-ai-meshes).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Install the Unreal plugin | existing plugin download URL on the live page |
| Hero, secondary | Get an API key | `/app/api-keys` |

## Internal links on this page
- `/app/api-keys`
- `/blog/import-ai-meshes`
- `/docs#scale`
- `/integrations`
