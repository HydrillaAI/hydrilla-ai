# Page: /integrations/unity

| Field | Value |
|---|---|
| Route | `/integrations/unity` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Unity Plugin for AI 3D Models \| Hydrilla AI |
| Meta description | Install the Hydrilla plugin for Unity, generate with BlueFox from the editor, and receive GLB models straight into your project. |
| OG title | Hydrilla for Unity |
| H1 | Hydrilla for Unity |
| Canonical | `https://hydrilla.ai/integrations/unity` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication (plugin) + HowTo (install steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Integration child template. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: [Integrations →](/integrations)

# Hydrilla for Unity

Generate and import 3D models without leaving the Unity Editor. The plugin adds an Editor window that generates with your API key, and it accepts Studio sends over the Bridge whenever the project is open.

Unity teams use it to fill scenes while the design is still moving. A designer can generate a stand-in prop beside the Scene view, drop it into a level, and keep iterating on layout without waiting on an art queue.

Date line: Available | Hydrilla Team

**[Section 2: Install]**

## Install

Installation is a folder copy, with no package registry to configure.

1. Download hydrilla-unity.zip from this page and unzip it.
2. Copy the Hydrilla folder into your project's Assets folder.
3. In the menu bar, open Window > Hydrilla.
4. Paste your API key, or click Run Bridge to receive models.

**[Section 3: Generate]**

## Generate from the editor

Type a prompt or choose an image in the Hydrilla window and generate. Finished models download as GLB into Assets/Hydrilla, ready to drag into a scene. Keeping every generated asset in one folder makes it easy to review, rename, or move them into your own project structure later.

Visual: screenshot of the Hydrilla window in Unity
Alt text: Unity Editor with the Hydrilla window docked beside the Scene view.

**[Section 4: Check]**

## Check the import

Unity works in meters with Y up, which matches GLB, so most models arrive at a sensible size and orientation. If scale still looks off, check the [units table →](/docs#scale). For axis or material questions, work through the [import checklist →](/blog/import-ai-meshes) before you change anything by hand.

**[Section 5: Close]**

Close line: Generate the prop you need beside the Scene view, and keep building.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Install the Unity plugin | existing download URL for `hydrilla-unity.zip` on the live page |
| Hero, secondary | Get an API key | `/app/api-keys` |

## Internal links on this page
- `/app/api-keys`
- `/blog/import-ai-meshes`
- `/docs#scale`
- `/integrations`
