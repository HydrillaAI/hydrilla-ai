# Page: /water

| Field | Value |
|---|---|
| Route | `/water` |
| Status | Expanded product / technical showcase |
| Title (absolute, do not append the template suffix) | Water Agent: BYOK AI 3D Agent for Artists & Studios \| Hydrilla AI |
| Meta description | Hydrilla Water Agent turns a brief into procedural Three.js 3D with multi-pass planning, preview, refine, and export. Bring your own LLM key. Zero Hydrilla credits. |
| OG title | Water Agent: the BYOK AI 3D agent for artists and studios |
| H1 | Water Agent, the BYOK AI 3D agent for artists and studios |
| Canonical | `https://hydrilla.ai/water` (self) |
| Robots | index, follow |
| Schema type | WebPage + SoftwareApplication (water#software) + HowTo (6 steps) + FAQPage (6 Q&As) + BreadcrumbList |

## Layout note
See `BUILD-KIT/pages/water.md`. Temporary hero media is labeled; no Hi3D product imagery.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Product

# Water Agent, the BYOK AI 3D agent for artists and studios

Water Agent turns a creative brief into procedural Three.js you can preview, refine, and export—using your own LLM key, with no Hydrilla credit spend.

Chip: Live in Hydrilla workspace · Object Studio and Character packs · Animation and Game packs partial

Brief it the way you would brief your own team: the look, the pieces, and how they should hold together. Water plans the sculpt, builds through gated passes, and keeps the conversation open so you can revise until the result matches your direction.

**[Section 2: Problem]**

## What Water Agent solves

One-shot mesh tools are strong when you already know a single model. Water is for directed, multi-pass code sculpting: props and characters that need a plan, quality tiers, and follow-up edits—without spending Hydrilla credits, because your provider key pays the LLM.

Prefer a finished Cloud mesh from a prompt or picture? Use text to 3D or image to 3D with BlueFox. Prefer an external agent driving Hydrilla? Use the MCP server.

**[Section 3: Capabilities]**

## Direct the sculpt, pass by pass

Water Agent follows a studio rhythm: agree the plan, build through unlocked passes, preview the factory, then refine. You set intent; the harness carries out the production steps in one workspace thread.

- **Turn a brief into a plan.** Describe the asset in plain language, optionally attach a reference image. Water Agent plans the sculpt first so you can steer before code is generated.
- **Multi-pass build quality.** Choose Fast, Standard, or Studio. Higher tiers unlock more build passes—from blockout through materials, and on Studio through surface, lighting, interaction, and optimization.
- **Refine in conversation.** Ask for a taller lantern or a darker crate. The director can apply scene edits or start a rebuild from the parent job so feedback stays local.
- **Preview and export.** Run the generated TypeScript factory in the browser sandbox, then export GLB, GLTF, OBJ, STL, PNG, or the .ts source for your pipeline.

**[Section 4: Workflow]**

## From brief to export

Every generation follows the same pipeline. Studio quality unlocks the later passes; Fast stops after blockout when you need a quick silhouette.

1. Brief — Text prompt, optional reference image, model, and quality tier.
2. Plan — Planner writes a sculpt spec before code generation begins.
3. Multi-pass build — Blockout → structural → form → material; Studio continues through surface, lighting, interaction, optimization.
4. Preview — The TypeScript createModel() factory runs in the browser sandbox.
5. Refine — Director chat for scene ops or a rebuild child job.
6. Export — GLB, GLTF, OBJ, STL, PNG, or .ts source.

**[Section 5: Audiences]**

## Who it is for

Water Agent is built for people who brief assets in language and need a durable preview they can edit and ship into tools—not a one-prompt black box.

- **For artists.** Brief props and characters the way you brief a teammate. Review the plan, watch pass progress, and refine silhouette or materials without leaving the thread.
- **For game developers.** Use game-oriented packs when the brief calls for named parts, collider hooks, or LOD-minded structure. Export GLB into your engine and keep iterating from chat.
- **For studios.** Water uses your LLM key (BYOK) and spends no Hydrilla credits, so art leads can run volume prop work without burning the studio credit pool.

**[Section 6: Skill packs]**

## Skill packs: live, partial, and coming

The backend picks a skill pack from your prompt. Only live and partial packs run today; stubs stay off the path until they ship.

| Pack | Status | What it steers |
|---|---|---|
| Object Studio | Live | Hard-surface props and products |
| Character | Live | Stylized characters and creatures |
| Animation Ready | Partial | Sockets and idle motion hooks—not a full Auto-skin pipeline |
| Game Ready | Partial | Named parts, collider/LOD hooks prepared in code |
| Environment / World | Coming | Not selectable yet |

**[Section 7: Walkthrough]**

## Walkthrough

Until a Water-only session reel ships, the Hydrilla workflow demo shows the broader generate → review loop. Prefer a silent autoplay start; unmute from the controls if you want audio. Needed original clips: brief→plan, Studio passes, director refine, export.

**[Section 8: Specs]**

## Water Agent at a glance

Specs match the live workspace harness. Water is not Hydrilla Cloud mesh generation; it outputs a gated Three.js factory your browser runs.

| Spec | Water Agent |
|---|---|
| Surface | Hydrilla workspace |
| Inputs | Text brief, optional reference image, BYOK model, quality tier |
| Output | TypeScript Three.js createModel() factory + sandbox preview |
| Exports | GLB, GLTF, OBJ, STL, PNG, .ts |
| Billing | 0 Hydrilla credits · your LLM provider key |
| Quality tiers | Fast · Standard · Studio |

**[Section 9: Resources]**

## Resources

Jump into the product, docs, and related Hydrilla surfaces. Third-party research pages are not required to use Water Agent.

**[Section 10: FAQ]**

## Questions about Water Agent

**What does Water Agent cost?**
Water Agent costs no Hydrilla credits and is included on every plan. You bring your own LLM API key; that provider bills usage.

**Who is it for?**
3D artists, art leads, game developers, and studio teams who want directed, multi-pass procedural assets they can preview and refine in conversation.

**Can a brief be a single asset?**
Yes. A brief can be one prop or a character. The planner scopes only what you ask for.

**When should I use text to 3D instead?**
When you want a Cloud mesh from a single prompt. Text to 3D and image to 3D use BlueFox. Water is the BYOK code-sculpt agent.

**How is Water Agent different from the MCP server?**
Water Agent is the in-app agent inside Hydrilla workspace. The MCP server lets your own AI agent drive Hydrilla from outside.

**Which skill packs are fully live?**
Object Studio and Character are live. Animation Ready and Game Ready are partial. Environment and World are not selectable yet.

**[Section 11: CTA]**

## Bring your next brief

Close line: Open Water Agent in workspace with the brief for your next prop or character.
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero and close, primary | Open Water Agent | `/workspace` |
| Hero and close, secondary | Read the docs | `/docs#water` |
