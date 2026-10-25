# Page: /water

| Field | Value |
|---|---|
| Route | `/water` |
| Status | New |
| Title (absolute, do not append the template suffix) | Water Agent: The AI 3D Agent for Studios \| Hydrilla AI |
| Meta description | Hydrilla Water Agent is the AI 3D agent that works with artists and studios, from brief to finished 3D assets, inside the tools they already use. |
| OG title | Water Agent: the AI 3D agent for artists and studios |
| H1 | Water Agent, the AI 3D agent for artists and studios |
| Canonical | `https://hydrilla.ai/water` (self) |
| Robots | index, follow |
| Schema type | WebPage + SoftwareApplication (water#software) + HowTo (4 steps) + FAQPage (5 Q&As) + BreadcrumbList (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Product page in the Meshy/Tripo agent-page order: hero with session capture, intro line plus 4 capability cards (2x2), 4-step strip, a short "made for scenes" band, a "where it works" band, FAQ accordion, CTA band. Visual-led, with full paragraphs. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Water Agent, the AI 3D agent for artists and studios

Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.

Brief it the way you would brief your own team: the look, the pieces, and the scene they belong to. It plans the set, shows you the plan, and works through each piece with you until the result matches your direction.

Visual: real Water Agent session capture; a short brief in the chat panel resolves into a 3 x 3 grid of matching props turning slowly
Alt text: A Water Agent session in Hydrilla, with a chat brief for a fantasy armory on the left and nine matching props, including a helmet, a rune dagger, and a supply crate, on the right.

**[Section 2: Capabilities]**

## Direct the set, piece by piece

Water Agent follows the way creative leads already work. You set the intent and make the calls, and it carries out the production steps in one conversation.

Card 1 title: Turn a brief into a plan
Card 1 line: Describe what the scene needs in plain language. Water Agent breaks the brief into pieces and shows you the plan first, so you can change course before work begins.

Card 2 title: Direct the look
Card 2 line: Set the style, mood, and level of detail in your brief, then keep refining it in the same conversation, with the plan, your notes, and every revision in one thread.

Card 3 title: Revise piece by piece
Card 3 line: Ask for a taller lantern or a darker crate, and only that piece changes. The rest of the set stays as it is, so feedback rounds stay small.

Card 4 title: Work inside your tools
Card 4 line: Brief and revise from the DCC or engine you already use, through the Hydrilla plugin. Each piece lands in the project you have open.

**[Section 3: How it works]**

## From brief to finished set

Every session follows the rhythm of a good art review: agree the plan, build, review, refine.

1. Write the brief like a creative director: the pieces, the style, and where the assets will be used.
2. Review the plan and adjust it until it matches your intent.
3. Water Agent builds the set to the direction you gave it.
4. Check each piece, ask for changes in the conversation, and take the finished set into your project.

**[Section 4: Why a set needs an agent]**

## Made for scenes, not single prompts

A single prompt suits a single model. A market street, an armory, or a furnished room needs many pieces that answer the same brief. Water Agent is designed for that scale, so an art lead describes the scene once and spends the session directing instead of retyping.

**[Section 5: Where it works]**

## Where Water Agent works

Water Agent works in the Hydrilla app, and inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin. The plugin generates models directly in your tool, and Water Agent works there through the same plugin. [Set up the plugin →](/integrations)

**[Section 6: FAQ]**

## Questions about Water Agent

**What does Water Agent cost?**
Water Agent costs no credits and is included on every plan.

**Who is it for?**
3D artists, art leads, and studio teams who brief whole sets of assets and want to direct the result rather than operate every step.

**Can a brief be a single asset?**
Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for.

**When should I use text to 3D instead?**
When you already know the one model you want. [Text to 3D →](/text-to-3d) starts from a prompt, and [image to 3D →](/image-to-3d) starts from a reference.

**How is Water Agent different from the MCP server?**
Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside. [MCP server →](/integrations/mcp)

**[Section 7: CTA]**

## Bring your next brief

Close line: Open Water Agent with the brief for your next set.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero and close, primary | Open Water Agent | `/app/water` (signed-out users go through sign-in) |
| Hero and close, secondary | Read the docs | `/docs#water` |

## Internal links on this page
- `/app/water`
- `/docs#water`
- `/image-to-3d`
- `/integrations`
- `/integrations/mcp`
- `/text-to-3d`
