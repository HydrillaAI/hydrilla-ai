import { getMarkdownForSlug } from "@/lib/markdown-pages";
import { AGENT_SKILL_SLUG } from "@/lib/mcp-setup";
import { SITE_URL } from "@/lib/seo";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const parts = path || ["index"];
  const markdown = await getMarkdownForSlug(parts);

  if (!markdown) {
    return new Response("Not found", { status: 404 });
  }

  const slug = parts.join("/");
  // The agent skill has no HTML page, so the Markdown file is its own canonical URL.
  const pagePath = slug === AGENT_SKILL_SLUG ? `/${slug}.md` : `/${slug}`;
  const canonicalPath = slug === "index" ? "/" : pagePath;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      Link: `<${SITE_URL}${canonicalPath}>; rel="canonical"`,
    },
  });
}
