import {
  BRAND_SENTENCE,
  MODEL_NAME,
  RESEARCH_LAB,
  SITE_NAME,
  SITE_URL,
} from "@/lib/brand";
import { kitPageMarkdown, legalPageMarkdown } from "@/lib/kit-markdown";
import { PRICING, SLOT_PRICING } from "@/lib/pricing";

/** Homepage mirror. Leave this text unchanged. */
const INDEX_MARKDOWN = `# ${SITE_NAME}

> ${BRAND_SENTENCE}

Generate from a text prompt or a reference image, preview in the browser, and export GLB, FBX, OBJ, or USDZ into Unity, Unreal, Blender, and other pipelines.

## Entities
- **Hydrilla** is the product: studio, workspaces, credits, preview, and export.
- **BlueFox 3D** is the model family. **${MODEL_NAME}** is the model that runs generation today. ${SITE_URL}/bluefox3d
- **${RESEARCH_LAB}** builds BlueFox. ${SITE_URL}/research

## How it works
1. Describe the asset or drop a reference image.
2. ${MODEL_NAME} generates a segmented mesh with PBR maps (base color, metalness, roughness, normals).
3. Preview in the browser. Inspect materials and parts before you download.
4. Export GLB, FBX, OBJ, or USDZ and drop into your engine or DCC.

Hydrilla is for production-ready generated assets you can refine. It is not CAD, not print-ready engineering, and not a finished hero with no artist pass.

Plans: Free ($${PRICING.free.monthly}, ${PRICING.free.creditsLabel}), Starter ($${PRICING.starter.monthly}/mo), Pro ($${PRICING.pro.monthly}/mo), Slot ($${SLOT_PRICING.slot.monthly}/mo, ${SLOT_PRICING.slot.detail}), and Slot Pro ($${SLOT_PRICING.slot_pro.monthly}/mo, ${SLOT_PRICING.slot_pro.detail}).
`;

export async function getMarkdownForSlug(slugParts: string[]): Promise<string | null> {
  const slug = slugParts.join("/") || "index";
  if (slug === "index") return INDEX_MARKDOWN;

  const kit = kitPageMarkdown(slug);
  if (kit) return kit;

  if (slug === "privacy" || slug === "terms" || slug === "cookies") {
    return legalPageMarkdown(slug);
  }

  return null;
}
