# Page: /api

| Field | Value |
|---|---|
| Route | `/api` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | REST API: BlueFox Text and Image to 3D \| Hydrilla AI |
| Meta description | Generate 3D models from your own code with BlueFox. Submit a text or image job, poll its status, and download the mesh and maps. |
| OG title | Hydrilla REST API |
| H1 | Hydrilla REST API |
| Canonical | `https://hydrilla.ai/api` (self) |
| Robots | index, follow |
| Schema type | WebAPI (provider #organization). No quota numbers. (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Developer page: dark code panel, 4-step lifecycle strip, two-column send/get-back lists, short access section. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Eyebrow: Developers

# Hydrilla REST API

Run BlueFox, Hydrilla's 3D model, from your own code. The REST API uses the same AI 3D generation as the Hydrilla AI workspace, for asset pipelines, engines, and internal tools.

Visual: dark code panel with the documented submit request and its job response, copied from the real API reference. No sample is written here, so no endpoint is invented.
Alt text: Code panel showing an API request that submits a generation job and the job record it returns.

**[Section 2: Lifecycle]**

## Submit, poll, download

Submit a job, poll its status, then download the mesh and maps. Each job moves from queued to processing and ends completed or failed, so your pipeline can retry.

Diagram (four steps): Submit | Queued | Processing | Completed or failed
Alt text: Four-step strip: submit a job, queued, processing, then completed or failed.

**[Section 3: Inputs and outputs]**

## What you can send and get back

**You send**
- A text prompt describing the asset and its use
- Or a reference image to follow
- Your API key with every request

**You get back**
- A job ID and its current status
- A mesh in parts, with UVs and texture maps
- Files in any of Hydrilla's [export formats →](/features#exports)

**[Section 4: Access]**

## Access and authentication

Create a key in your account; keep it server-side. Plan access is on [pricing →](/pricing), and volume through [Enterprise →](/enterprise). Building for an AI agent? Use the [MCP server →](/integrations/mcp).
<!-- COPY:END -->

## CTAs
| Placement | Label | Destination |
|---|---|---|
| Hero, primary | Get an API key | `/app/api-keys` |
| Hero, secondary | Read the docs | `/docs` |

## Internal links on this page
- `/app/api-keys`
- `/docs`
- `/enterprise`
- `/features#exports`
- `/integrations/mcp`
- `/pricing`
