import {
  BRAND_SENTENCE,
  MODEL_NAME,
  RESEARCH_LAB,
  SITE_NAME,
  SITE_URL,
} from "@/lib/brand";
import { kitPageMarkdown, legalPageMarkdown } from "@/lib/kit-markdown";
import { AGENT_SKILL_SLUG, agentGuideMarkdown, agentSkillMarkdown } from "@/lib/mcp-setup";
import { PRICING, SLOT_PRICING } from "@/lib/pricing";

/** Homepage mirror. Leave this text unchanged. */
const INDEX_MARKDOWN = `# ${SITE_NAME}

> ${BRAND_SENTENCE}

Generate from a text prompt or a reference image, preview in the browser, and export GLB, FBX, OBJ, or USDZ into Unity, Unreal, Blender, Godot 4, and other pipelines.

## Entities
- **Hydrilla AI** ("Hydrilla" for short) is the company and the AI 3D workspace: Studio, workspaces, credits, preview, export, plugins, MCP server, and REST API. Available worldwide including the United States, India, Japan, China, and France.
- **BlueFox** is Hydrilla's 3D model, built by Hydrilla AI. **${MODEL_NAME}** is the current version, generally available to everyone in Hydrilla. ${SITE_URL}/bluefox
- **Water Agent** (Hydrilla Water Agent) is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the Hydrilla app and inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin. Included on every plan, no credits. ${SITE_URL}/water
- **${RESEARCH_LAB}** is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built. ${SITE_URL}/research

## AI 3D Plugins & Integrations
- **Blender add-on**: Generate in the N-panel sidebar tab, run Water Agent, or receive GLB over the local Bridge (127.0.0.1:7345). ${SITE_URL}/integrations/blender
- **Unity plugin**: Generate from Window > Hydrilla > Generate 3D or receive over the Bridge into Assets/Hydrilla. ${SITE_URL}/integrations/unity
- **Unreal Engine plugin**: Python editor toolbar plugin importing GLB into Content/Hydrilla. ${SITE_URL}/integrations/unreal
- **Godot 4 plugin**: Editor dock importing native glTF/GLB into res://hydrilla/. ${SITE_URL}/integrations/godot
- **MCP server**: Local stdio Model Context Protocol server for Cursor, Claude Code, and AI coding agents. ${SITE_URL}/integrations/mcp
- **REST API**: Job-based text-to-3D and image-to-3D generation from code. ${SITE_URL}/api

## How it works
1. Describe the asset, upload a reference image, or brief a full set with Water Agent.
2. ${MODEL_NAME} generates a segmented mesh with UVs and PBR maps (base color, metalness, roughness, normals).
3. Preview in the browser. Inspect materials and individual parts before you download.
4. Export GLB, FBX, OBJ, or USDZ on any plan (Free included), or send directly into Blender, Unity, Unreal, or Godot via the local Bridge.

Hydrilla is for props, environment pieces, and visualization assets an artist will finish. It is not CAD, not manufacturing drawings, and not a finished hero asset that skips an artist pass.

Plans: Free ($${PRICING.free.monthly}/mo, 100 credits), Starter ($${PRICING.starter.monthly}/mo, 900 credits), Pro ($${PRICING.pro.monthly}/mo, 3,000 credits, REST API access), Hourly ($${SLOT_PRICING.slot.monthly}/mo, 900 credits in one chosen hour a day), and Hourly Pro ($${SLOT_PRICING.slot_pro.monthly}/mo, 3,000 credits in a chosen daily window, 33% off Pro).
`;

export async function getMarkdownForSlug(slugParts: string[]): Promise<string | null> {
  const slug = slugParts.join("/") || "index";
  if (slug === "index") return INDEX_MARKDOWN;

  if (slug === AGENT_SKILL_SLUG) {
    return agentSkillMarkdown();
  }

  const kit = kitPageMarkdown(slug);
  if (kit && slug === "integrations/mcp") {
    // Agents read this file to set themselves up, so it carries the same prompts as the page.
    return `${kit.trimEnd()}\n\n${agentGuideMarkdown()}`;
  }
  if (kit) return kit;

  if (slug === "privacy" || slug === "terms" || slug === "cookies") {
    return legalPageMarkdown(slug);
  }

  return null;
}
