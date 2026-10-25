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
Solution child template with a budget checklist. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D assets for AR, VR, and spatial apps

VR, AR, and spatial apps need many small, believable objects. BlueFox, Hydrilla's 3D model, generates them in Hydrilla AI, so you can check each against a headset's limits.

In a headset, users can walk up to anything, pick it up, and turn it over. That makes a room full of convincing props essential, and it makes the performance budget unforgiving. Generation covers the volume, and your team keeps control of the budget.

Visual: headset-view mockup
Alt text: View through a headset of a room with generated objects placed on a table and a shelf.

**[Section 2: Budget]**

## Check the headset budget

Standalone headsets have tight limits on triangles, draw calls, and texture memory. Measure each asset against your target before it ships, and reduce or bake anything that exceeds it. These are the numbers to track per object.

- Triangle count per asset
- Texture resolution per map
- Draw calls per material
- Collision and grab volumes for objects users can pick up

**[Section 3: Preview first]**

## Check it before the headset build

Preview each object in the browser first, where problems with shape or material are quick to spot, then route headset builds through the [Unity →](/integrations/unity) or [Unreal →](/integrations/unreal) plugin. Testing on the device is still the final word, so keep a short list of assets to review in the headset after every build. [Which file suits each platform →](/features#exports)

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
