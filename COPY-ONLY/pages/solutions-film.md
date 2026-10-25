# Page: /solutions/film

| Field | Value |
|---|---|
| Route | `/solutions/film` |
| Status | Rename (was /usecase/filmproduction) |
| Title (absolute, do not append the template suffix) | AI 3D Assets for Film Previs and Set Dressing \| Hydrilla AI |
| Meta description | Generate props, set pieces, and lookdev bases with BlueFox for previs and layout, and keep hero assets with your artists. |
| OG title | Hydrilla for film and animation |
| H1 | 3D props and sets for previs and layout |
| Canonical | `https://hydrilla.ai/solutions/film` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Solution child template with 3 stage cards. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D props and sets for previs and layout

Props and environments for animation and VFX often start as stand-ins. Hydrilla AI fills previs and layout scenes with set pieces generated from a [written prompt →](/text-to-3d) or a still.

That changes when decisions can be made. Instead of blocking a sequence with grey shapes and waiting for modeled assets, directors and layout artists can judge framing, scale, and mood against pieces that already look like the world of the film.

Visual: wide, dark still of a previs scene
Alt text: A dim previs frame of a market street, its stalls, crates, and lanterns all generated stand-ins.

**[Section 2: Stages]**

## Where generated assets fit

Generated assets earn their place in the stages where speed of iteration matters more than final detail.

Card 1 title: Previs
Card 1 line: Block a sequence with generated props, so camera and timing work starts early. Work in [Blender →](/integrations/blender) or [Unreal Engine →](/integrations/unreal) with the Hydrilla plugin.

Card 2 title: Background set dressing
Card 2 line: Fill shelves, streets, and rooms far from camera, where silhouette and material read count more than fine detail.

Card 3 title: Lookdev bases
Card 3 line: Begin a material study from a generated model and its PBR maps, then hand it to an artist to refine.

**[Section 3: Sets from a brief]**

## Dress a whole set from one brief

A scene rarely needs one prop. Describe the market street, the workshop, or the ship's hold to [Water Agent →](/water), review its plan, and revise individual pieces until the set supports the shot.

**[Section 4: Limits]**

## Background first, hero by hand

Assets close to camera still need an artist's pass. Use generated models as a starting point for hero work, and check [the limits of BlueFox, Hydrilla's 3D model →](/bluefox#limits). Keeping that line clear protects the quality of the shots audiences study most.

**[Section 5: Close]**

Close line: Generate what the camera passes by, and save artist hours for what it lingers on.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/app/studio`
- `/bluefox#limits`
- `/enterprise#contact`
- `/integrations/blender`
- `/integrations/unreal`
- `/text-to-3d`
- `/water`
