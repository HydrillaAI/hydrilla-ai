# Page: /compare/trellis

| Field | Value |
|---|---|
| Route | `/compare/trellis` |
| Status | New |
| Title (absolute, do not append the template suffix) | Hydrilla vs Trellis: Studio Workspace and Open Weights \| Hydrilla AI |
| Meta description | How Hydrilla with BlueFox and Microsoft's open-weights Trellis compare on hosting, outputs, exports, integrations, API, and studio workflows. |
| OG title | Hydrilla vs Trellis |
| H1 | How does Hydrilla compare to Trellis? |
| Canonical | `https://hydrilla.ai/compare/trellis` (self) |
| Robots | index, follow |
| Schema type | Article; about -> Thing (name, sameAs github.com/microsoft/TRELLIS) only (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Compare template: short answer, side-by-side table, fit, check, date line. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Short answer]**

Kicker: Compare

# How does Hydrilla compare to Trellis?

Hydrilla AI and Trellis take different routes to 3D generation. Hydrilla is a hosted AI 3D workspace running BlueFox, Hydrilla's 3D model, with plugins, an API, and Water Agent, while Trellis is an open-weights 3D model released by Microsoft Research that teams host on their own GPUs.

**[Section 2: Table]**

## Side by side

| | Hydrilla | Trellis (confirm on github.com/microsoft/TRELLIS) |
|---|---|---|
| Model | [BlueFox 1 →](/bluefox), hosted in Hydrilla | TRELLIS open-weights checkpoints, run on your own GPU or a third-party host |
| Inputs | A text prompt or one reference image | Image or text variants, per its repository |
| Output | Segmented mesh with UVs and PBR maps | Structured 3D latents decoded to radiance fields, Gaussian splats, or meshes |
| Export formats | Four formats ([list →](/features#exports)) | GLB and Gaussian splat ply exports in the reference code |
| Engine and DCC tools | Four plugins plus a local Bridge ([integrations →](/integrations)) | Community scripts and ComfyUI nodes; no first-party DCC bridge |
| API and agents | Managed REST API and an MCP server ([API →](/api)) | Self-hosted Python inference or third-party inference endpoints |
| Pricing model | Monthly credit plans with a Free tier; costs per model on [pricing →](/pricing) | Open-source code under MIT license; you pay for GPU hardware and hosting |
| Model card | Published on [research →](/research#model-card), with limits | Research paper and GitHub repository documentation |
| AI 3D agent | [Water Agent →](/water) builds and revises whole asset sets in conversation, on every plan, no credits | None included in the repository |

**[Section 3: Fit]**

## When each one fits

Hydrilla fits studios and artists who want a managed workspace, segmented parts with PBR maps, plugins that connect through a local Bridge, and an AI 3D agent that plans and revises whole asset sets without managing GPU servers. Trellis fits ML engineers and technical teams who have Linux GPUs, want to inspect or fine-tune open weights locally, or need 3D Gaussian splat outputs from code.

**[Section 4: Check]**

## Check before you decide

Trellis checkpoints, community integrations, and license terms live in its public repository. Check [github.com/microsoft/TRELLIS →](https://github.com/microsoft/TRELLIS) before you plan infrastructure around it, and run a [bake-off →](/compare/how-to-choose) on your own brief.

**[Section 5: Date line]**

Date line: Checked 24 Oct 2026 | Hydrilla Team
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| End, primary | Start generating | `/app/studio` |

## Internal links on this page
- `/api`
- `/app/studio`
- `/bluefox`
- `/compare/how-to-choose`
- `/features#exports`
- `/integrations`
- `/pricing`
- `/research#model-card`
- `/water`

## External links
- https://github.com/microsoft/TRELLIS
