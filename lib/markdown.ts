import { API_SPECS, GUIDE_PAGE_META, ENDPOINT_PAGE_META, PAGE_META } from "@/lib/docsData";
import { SITE } from "@/lib/site";

const GUIDE_BODY: Record<string, string[]> = {
  "/introduction": [
    "## Base URL",
    "",
    "`https://api.hydrilla.co`",
    "",
    "## Capabilities",
    "",
    "- **BlueFox 3D cascade pipeline**: Reconstruct dense 3D meshes up to 1536 resolution with watertight geometry, automated UV unwrapping, and PBR textures ready for Blender, Unreal, and Unity.",
    "- **Multi-model 2D generation**: Choose between OpenAI (GPT Image 2.5 Flare & Sunburst) and Google Gemini (Flash & Pro Image) for concept art generation and precise image editing.",
    "- **Automated prompt-to-mesh**: Single-call Text-to-3D handles prompt expansion, multi-view concept rendering, background removal, and 3D reconstruction automatically.",
    "- **Zero-waste refund guarantee**: Credits are checked upfront, deducted atomically, and 100% refunded if an upstream model or GPU worker encounters an error.",
  ],
  "/quickstart": [
    "## Step 1: Get your API key",
    "",
    "Generate a key in the Hydrilla Studio dashboard (`https://hydrilla.co/app/api-keys`). Keys are prefixed with `hyd_live_`.",
    "",
    "```bash",
    'export HYDRILLA_API_KEY="hyd_live_your_api_key_here"',
    "```",
    "",
    "## Step 2: Submit a 3D generation job",
    "",
    "```bash",
    "curl -X POST https://api.hydrilla.co/v1/3d/text-to-3d \\",
    '  -H "Authorization: Bearer $HYDRILLA_API_KEY" \\',
    '  -H "Content-Type: application/json" \\',
    '  -d \'{"prompt": "Futuristic cyberpunk vehicle, high details, game ready prop", "resolution": 1536}\'',
    "```",
    "",
    "## Step 3: Poll for completion and download the mesh",
    "",
    "Poll `GET /v1/3d/tasks/:taskId` every 2–3 seconds until `status` is `completed`, then download `result.mesh_url` (`.glb`).",
    "",
    "```bash",
    "curl -X GET https://api.hydrilla.co/v1/3d/tasks/job_c18ab44d03e192a40 \\",
    '  -H "Authorization: Bearer $HYDRILLA_API_KEY"',
    "```",
  ],
  "/authentication": [
    "## Authorization headers",
    "",
    "Pass your API key in the `Authorization` header using Bearer authentication (recommended):",
    "",
    "```bash",
    "curl -X GET https://api.hydrilla.co/v1/user/me \\",
    '  -H "Authorization: Bearer hyd_live_your_api_key_here"',
    "```",
    "",
    "Or pass it in the `x-api-key` header:",
    "",
    "```bash",
    "curl -X GET https://api.hydrilla.co/v1/user/me \\",
    '  -H "x-api-key: hyd_live_your_api_key_here"',
    "```",
    "",
    "## Error codes",
    "",
    "- `401 Unauthorized`: Invalid, missing, or revoked API key.",
    "- `402 Payment Required`: Account credit balance is insufficient for the requested generation.",
  ],
  "/models": [
    "## Available Models & Credit Costs",
    "",
    "| Model ID | Modality | Resolution / Tier | Credits |",
    "| --- | --- | --- | --- |",
    "| `bluefox-1` | Image-to-3D / Text-to-3D | 1024 standard / 1536 high-detail | 2–5 credits |",
    "| `gemini/flash` | 2D Concept Image | Fast concept generation | 1 credit |",
    "| `gemini/pro` | 2D Concept Image | Studio-grade concept generation | 2 credits |",
    "| `openai/flare` | 2D Concept Image | High-contrast stylized concept | 2 credits |",
    "| `openai/sunburst` | 2D Concept Image | Photorealistic lighting & materials | 3 credits |",
  ],
  "/sdks/python": [
    "## Installation",
    "",
    "```bash",
    "pip install requests",
    "```",
    "",
    "## Example usage",
    "",
    "```python",
    "from hydrilla import Hydrilla",
    "",
    'client = Hydrilla(api_key="hyd_live_your_api_key_here")',
    'task_id = client.text_to_3d(prompt="Cyberpunk drone quadcopter", resolution=1536)',
    "result = client.poll_task(task_id)",
    'print("Download GLB mesh:", result["mesh_url"])',
    "```",
  ],
  "/sdks/typescript": [
    "## Example usage",
    "",
    "```typescript",
    'import { Hydrilla } from "./hydrilla";',
    "",
    "const client = new Hydrilla({ apiKey: process.env.HYDRILLA_API_KEY! });",
    'const { id } = await client.textTo3d("Futuristic cyberpunk street lamp", 1536);',
    "const result = await client.pollUntilReady(id);",
    'console.log("GLB Mesh Ready:", result.mesh_url);',
    "```",
  ],
};

export function markdownFor(slug: string): string | null {
  const normalized = slug.replace(/\.md$/, "").replace(/^\//, "");
  const path = normalized ? `/${normalized}` : "/quickstart";
  const meta = PAGE_META[path];
  if (!meta) return null;

  const lines: string[] = [
    `# ${meta.heading}`,
    "",
    `> ${meta.summary}`,
    "",
    `Canonical URL: ${SITE.docsUrl}${path}`,
    "",
  ];

  if (meta.kind === "endpoint") {
    const spec = API_SPECS[path.replace("/api/", "")];
    if (spec) {
      lines.push(`**Endpoint:** \`${spec.method} ${SITE.apiBaseUrl}${spec.path}\``, "");
      lines.push(`**Credit cost:** ${spec.creditCost}`, "");
      lines.push("## Overview", "", spec.description, "");
      lines.push("## Authentication", "", `\`${spec.authHeader}\``, "");
      lines.push("## Base URL", "", `\`${SITE.apiBaseUrl}\``, "");
      const params = spec.bodyParams ?? spec.queryParams ?? [];
      if (params.length > 0) {
        lines.push(`## ${spec.bodyParams ? "Request body" : "Path & query parameters"}`, "");
        lines.push("| Parameter | Type | Required | Default | Description |");
        lines.push("| --- | --- | --- | --- | --- |");
        for (const param of params) {
          lines.push(
            `| \`${param.name}\` | \`${param.type}\` | ${param.required ? "required" : "optional"} | ${param.default ?? "—"} | ${param.description} |`,
          );
        }
        lines.push("");
      }
      lines.push("## Request example (cURL)", "", "```bash", spec.curlExample, "```", "");
      lines.push("## Request example (Python)", "", "```python", spec.pythonExample, "```", "");
      lines.push("## Request example (TypeScript)", "", "```typescript", spec.tsExample, "```", "");
      lines.push("## Response 200 OK", "", "```json", spec.response200, "```", "");
      if (spec.response401) lines.push("## Response 401 Unauthorized", "", "```json", spec.response401, "```", "");
      if (spec.response402) lines.push("## Response 402 Payment Required", "", "```json", spec.response402, "```", "");
      return lines.join("\n");
    }
  }

  if (GUIDE_BODY[path]) {
    lines.push(...GUIDE_BODY[path], "");
  }

  lines.push("## Sections on this page", "");
  for (const heading of meta.headings) {
    lines.push(`- ${heading.text} (${SITE.docsUrl}${path}#${heading.id})`);
  }
  lines.push("", `Full documentation index: ${SITE.docsUrl}/llms.txt`, "");
  return lines.join("\n");
}

export function allMarkdown(): string {
  const pages = [...Object.values(GUIDE_PAGE_META), ...Object.values(ENDPOINT_PAGE_META)];
  return pages
    .map((meta) => markdownFor(meta.slug))
    .filter((text): text is string => Boolean(text))
    .join("\n\n---\n\n");
}
