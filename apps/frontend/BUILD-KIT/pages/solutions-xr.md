# Page: /solutions/xr

| Field | Value |
|---|---|
| Route | `/solutions/xr` |
| Status | Rename (was /usecase/arvr) |
| Title (absolute, do not append the template suffix) | AI 3D Assets for AR, VR, and Spatial Apps \| Hydrilla AI |
| Meta description | Generate 3D assets with BlueFox for AR, VR, and spatial apps, and check each one against your headset's budget before it ships. |
| OG title | Hydrilla for XR |
| H1 | 3D assets for AR, VR, and spatial apps |
| Canonical | `https://hydrilla.ai/solutions/xr` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Solution child template with a budget checklist. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D assets for AR, VR, and spatial apps

VR, AR, and spatial apps need many small, believable objects. BlueFox, Hydrilla's 3D model, generates them in Hydrilla AI, so you can check each against a headset's limits.

Visual: headset-view mockup
Alt text: View through a headset of a room with generated objects placed on a table and a shelf.

**[Section 2: Budget]**

## Check the headset budget

Standalone headsets have tight limits on triangles, draw calls, and texture memory. Measure each asset against your target before it ships, and reduce or bake anything that exceeds it.

- Triangle count per asset
- Texture resolution per map
- Draw calls per material
- Collision and grab volumes for objects users can pick up

**[Section 3: Preview first]**

## Check it before the headset build

Preview each object in the browser first, then route headset builds through the [Unity →](/integrations/unity) or [Unreal →](/integrations/unreal) plugin. [Which file suits each platform →](/features#exports)

**[Section 4: Close]**

Close line: Prototype the space with generated objects, then budget each one for the headset.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/app/studio`
- `/enterprise#contact`
- `/features#exports`
- `/integrations/unity`
- `/integrations/unreal`
