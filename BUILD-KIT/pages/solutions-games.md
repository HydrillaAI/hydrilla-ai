# Page: /solutions/games

| Field | Value |
|---|---|
| Route | `/solutions/games` |
| Status | Rename (was /usecase/gamedev) |
| Title (absolute, do not append the template suffix) | AI 3D Assets for Game Development \| Hydrilla AI |
| Meta description | Generate props and environment fill with BlueFox, and see what still needs retopology and LODs before it goes into your engine. |
| OG title | Hydrilla for game development |
| H1 | 3D props and environment fill for game teams |
| Canonical | `https://hydrilla.ai/solutions/games` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Solution child template: hero still, before/after slider, checklist, engines section, close line. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Solutions

# 3D props and environment fill for game teams

Hydrilla AI gives game teams props and environment pieces for your game engine, generated with BlueFox, Hydrilla's 3D model, from typed briefs or uploaded pictures.

Visual: game scene still
Alt text: A third-person game scene in a harbor, with generated crates, barrels, ropes, and lamp posts along the dock.

**[Section 2: Greybox]**

## From greybox to a filled level

Swap greybox blocks for generated crates, barrels, and debris while the layout is still changing, then keep the pieces that work. Working from a full level brief? [See Water Agent →](/water)

Visual: before and after slider
Alt text: A level shown as grey blocks on the left and dressed with generated props on the right.

**[Section 3: What you still do]**

## What you still do

- Retopology wherever the polygon budget is tight
- LODs for anything seen from several distances
- Collision shapes for anything the player touches
- A material check under your engine's own lighting and post-processing

**[Section 4: Engines]**

## Straight into your engine

The [Unity →](/integrations/unity), [Unreal Engine →](/integrations/unreal), and [Godot →](/integrations/godot) plugins put generated models into your project. Review scale and pivots before you build on them. Importing by hand? Use the [import guide →](/blog/import-ai-meshes).

**[Section 5: Close]**

Close line: Fill the level now, and polish the pieces players will notice.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Close, primary | Start generating | `/app/studio` |
| Close, secondary | Talk to our team | `/enterprise#contact` |

## Internal links on this page
- `/app/studio`
- `/blog/import-ai-meshes`
- `/enterprise#contact`
- `/integrations/godot`
- `/integrations/unity`
- `/integrations/unreal`
- `/water`
