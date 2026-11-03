import { API_SPECS, GUIDE_PAGE_META } from "@/lib/docsData";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    "# Hydrilla API Docs",
    "",
    "> Developer documentation for the Hydrilla API: 3D reconstruction, text-to-3D and image-to-3D pipelines, 2D concept generation, tasks, and account endpoints.",
    "",
    "## Guides",
  ];
  for (const meta of Object.values(GUIDE_PAGE_META)) {
    lines.push(`- [${meta.title}](${SITE.docsUrl}${meta.slug}): ${meta.summary}`);
  }
  lines.push("", "## API reference");
  for (const [slug, spec] of Object.entries(API_SPECS)) {
    lines.push(`- [${spec.method} ${spec.path}](${SITE.docsUrl}/api/${slug}): ${spec.summary}`);
  }
  lines.push(
    "",
    `Full developer docs content: ${SITE.docsUrl}/llms-full.txt`,
    `Product & company index (BlueFox, Water Agent, plugins, comparisons): ${SITE.studioUrl}/llms.txt`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
