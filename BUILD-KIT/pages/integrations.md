# Page: /integrations

| Field | Value |
|---|---|
| Route | `/integrations` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | Integrations: Blender, Unity, Unreal, Godot \| Hydrilla AI |
| Meta description | Send Hydrilla models into Blender, Unity, Unreal, and Godot through plugins and the local Bridge, or connect AI agents over MCP and code over REST. |
| OG title | Hydrilla integrations |
| H1 | Integrations |
| Canonical | `https://hydrilla.ai/integrations` (self) |
| Robots | index, follow |
| Schema type | CollectionPage + ItemList (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Hub. Hero, Bridge diagram, 6 tool cards, capability matrix, sign-in note with id="sign-in". Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Integrations

Hydrilla AI connects to the tools you already run: a Blender add-on, plugins for Unity, Unreal, and Godot, a local Bridge from Studio, and MCP and REST for custom pipelines.

**[Section 2: Bridge]**

## From Studio to your open scene

The local Bridge runs on your machine and sends meshes from Studio into Blender, Unity, Unreal, or Godot. Start it from a plugin, then use Send to DCC in Studio.

Diagram labels: Studio | Bridge on your machine, 127.0.0.1:7345 | Your open tool
Alt text: Diagram: Hydrilla Studio in the browser, an arrow to the Bridge running locally on port 7345, and an arrow to an open Blender scene.

**[Section 3: Tools (no heading)]**

Card 1 title: [Blender →](/integrations/blender)
Card 1 line: Generation in a sidebar tab, plus Studio sends.
Card 2 title: [Unity →](/integrations/unity)
Card 2 line: Generation and GLB import inside the Unity Editor.
Card 3 title: [Unreal Engine →](/integrations/unreal)
Card 3 line: A Python editor plugin for generation and import.
Card 4 title: [Godot →](/integrations/godot)
Card 4 line: A Godot 4 editor dock that generates and receives.
Card 5 title: [MCP server →](/integrations/mcp)
Card 5 line: Hydrilla generation for any MCP client.
Card 6 title: [REST API →](/api)
Card 6 line: Generation jobs from your own code.

**[Section 4: Matrix]**

## What each integration does

| Tool | Generate in the tool | Receive from Studio | Sign-in |
|---|---|---|---|
| Blender | Yes | Bridge | Studio account or API key |
| Unity | Yes | Bridge | API key |
| Unreal Engine | Yes | Bridge | API key |
| Godot 4 | Yes | Bridge | API key |
| MCP server | Through your agent | No | API key |
| REST API | From your code | No | API key |

Sign-in (anchor #sign-in): The Blender add-on can use your Studio sign-in in the browser. Every plugin, and the MCP server, also accepts a hyd_live_ API key.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Get an API key | `/app/api-keys` |
| Hero, secondary | Read the docs | `/docs` |

## Internal links on this page
- `/api`
- `/app/api-keys`
- `/docs`
- `/integrations/blender`
- `/integrations/godot`
- `/integrations/mcp`
- `/integrations/unity`
- `/integrations/unreal`
