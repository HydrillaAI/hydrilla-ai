# Page: /integrations/mcp

| Field | Value |
|---|---|
| Route | `/integrations/mcp` |
| Status | Rewrite |
| Title (absolute, do not append the template suffix) | MCP Server for AI 3D Generation \| Hydrilla AI |
| Meta description | Connect an MCP client to Hydrilla so your AI agent can generate 3D models from text or images with BlueFox through the REST API. |
| OG title | Hydrilla MCP server |
| H1 | Hydrilla MCP server |
| Canonical | `https://hydrilla.ai/integrations/mcp` (self) |
| Robots | index, follow |
| Schema type | SoftwareApplication (MCP server) + HowTo (install steps) (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Integration child template with a config code block. Use the site's existing components. `Visual:` lines are placeholders for real captures (leave a `TODO(kit): visual` slot; never generate or reuse unrelated images). `Alt text:` is that image's alt. Copy refresh (24 Oct 2026): every section now carries full paragraphs, and some pages gained a section. Where this note and the copy disagree on sections, follow the copy. Render every paragraph in order; don't shorten, merge, or summarise them.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)

<!-- COPY:START -->
**[Section 1: Hero]**

Kicker: [Integrations →](/integrations)

# Hydrilla MCP server

Let AI agents generate 3D through Hydrilla over MCP. Hydrilla's MCP server calls the [REST API →](/api) on an agent's behalf, running locally over stdio for Cursor, Claude Code, and other MCP clients.

Your agent describes the asset, and the server handles the job from submission to the finished files. It suits developers and technical artists who already work with an AI coding agent and want 3D generation available as one more tool it can call.

Visual: config block registering the server with `HYDRILLA_API_KEY=hyd_live_…` in its environment (copy the exact block from the live integration guide; don't write a new one)
Alt text: Code block showing an MCP client configuration entry for the Hydrilla server, with the API key set as an environment variable.

**[Section 2: Install]**

## Install

Setup takes three steps, and the server runs on your own machine.

1. Install Node.js 20 or newer. The server is the npm package hydrilla-mcp, started with npx -y hydrilla-mcp.
2. Add your API key in a Hydrilla plugin, or set HYDRILLA_API_KEY in the server's MCP config. Never paste it into the chat.
3. Register the server in your MCP client with the command on this page, then restart the client.

**[Section 3: How it works]**

## What happens when your agent asks for a model

The agent sends a request to the server in plain language. The server submits a generation job, follows its status, and returns the finished files to the agent, so the agent can place them in a project or report back to you.

**[Section 4: Access]**

Note: the MCP server needs REST API access, included with Pro. [Plans →](/pricing)

**[Section 5: Related]**

## Looking for an agent inside Hydrilla?

The MCP server is for your own agent. If you want an agent that plans and builds whole sets with you inside Hydrilla, [see Water Agent →](/water).
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
- `/integrations`
- `/pricing`
- `/water`
