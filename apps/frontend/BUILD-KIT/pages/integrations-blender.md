# Page: /integrations/blender

| Field | Value |
|---|---|
| Route | `/integrations/blender` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Blender Add-on for AI 3D Generation \| Hydrilla AI |
| Meta description | Install the Hydrilla add-on for Blender, sign in, and generate from a prompt or image in the Hydrilla tab, or import GLB from Studio. |
| OG title | Hydrilla for Blender |
| H1 | Hydrilla for Blender |
| Canonical | `https://hydrilla.ai/integrations/blender` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication (plugin) + HowTo (install steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Integration child template: kicker link back to hub, install steps, one screenshot, troubleshooting Q&A. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: [Integrations →](/integrations)

# Hydrilla for Blender

The Hydrilla add-on for Blender generates from a prompt or image inside your scene. It also receives models that you send from Studio through the local Bridge.

Date line: Available | Hydrilla Team

**[Section 2: Install]**

## Install from disk

1. Download hydrilla-blender.zip using the button on this page.
2. In Blender, open Edit > Preferences > Add-ons.
3. Open the menu at the top right and choose Install from Disk.
4. Select hydrilla-blender.zip, then tick the box to enable the Hydrilla add-on.
5. In the 3D Viewport, press N to open the sidebar, then click the Hydrilla tab.

**[Section 3: Generate]**

## Generate in the Hydrilla tab

Paste your API key once, then generate from a typed prompt or a picture. Click Run Bridge to receive models from Send to DCC in Studio or from your AI agent.

Visual: screenshot of the Hydrilla sidebar tab
Alt text: Blender viewport with the Hydrilla sidebar tab open, showing the API key field, Generate, and Run Bridge.

**[Section 4: Troubleshooting]**

## Troubleshooting

**The add-on says my key was not accepted.**
Create a new key under API keys, paste it into the Hydrilla tab, and choose Check. The add-on uses an API key, so there is no browser sign-in to keep open.

**Nothing arrives when I send from Studio.**
Check that Run Bridge is active in the Hydrilla panel and Blender is open on a scene, then send again. Formats other than GLB are covered on [exports →](/features#exports).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Install the Blender add-on | existing download URL for `hydrilla-blender.zip` on the live page |
| Hero, secondary | Get an API key | `/app/api-keys` |

## Internal links on this page
- `/app/api-keys`
- `/features#exports`
- `/integrations`
