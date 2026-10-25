import { getMarkdownForSlug } from "@/lib/markdown-pages";
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
  const canonicalPath = slug === "index" ? "/" : `/${slug}`;

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      Link: `<${SITE_URL}${canonicalPath}>; rel="canonical"`,
    },
  });
}
