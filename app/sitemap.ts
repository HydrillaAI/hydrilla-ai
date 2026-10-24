import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo";

const APP_ROOT = path.join(process.cwd(), "app");
const CONTENT_ROOT = path.join(process.cwd(), "content");
const COMPONENTS_ROOT = path.join(process.cwd(), "components");

/** Content release date per routing.md ("Use the content date for lastmod, not the build time"). */
const CONTENT_DATE = new Date("2026-10-24T00:00:00Z");

const INTEGRATION_SITEMAP_ENTRIES: Array<{ slug: string; priority: number }> = [
  { slug: "blender", priority: 0.6 },
  { slug: "unity", priority: 0.6 },
  { slug: "unreal", priority: 0.6 },
  { slug: "godot", priority: 0.5 },
  { slug: "mcp", priority: 0.5 },
];

const BLOG_SITEMAP_SLUGS = ["reference-images", "import-ai-meshes"] as const;

const COMPARE_SITEMAP_SLUGS = [
  "meshy",
  "tripo",
  "hyper3d",
  "how-to-choose",
] as const;

function mtimeIfExists(abs: string): Date | null {
  try {
    return fs.statSync(abs).mtime;
  } catch {
    return null;
  }
}

function routeLastModified(routePath: string): Date {
  if (routePath === "/") {
    return (
      mtimeIfExists(path.join(APP_ROOT, "page.tsx")) ||
      mtimeIfExists(path.join(COMPONENTS_ROOT, "sections", "Hero.tsx")) ||
      CONTENT_DATE
    );
  }

  const trimmed = routePath.replace(/^\//, "").replace(/\/+$/, "");
  return (
    mtimeIfExists(path.join(APP_ROOT, trimmed, "page.tsx")) ||
    mtimeIfExists(path.join(APP_ROOT, trimmed, "layout.tsx")) ||
    CONTENT_DATE
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = PUBLIC_ROUTES.map(
    ({ path: routePath, changeFrequency, priority }) => ({
      url: absoluteUrl(routePath),
      lastModified: routeLastModified(routePath),
      changeFrequency,
      priority,
    })
  );

  const integrationEntries: MetadataRoute.Sitemap =
    INTEGRATION_SITEMAP_ENTRIES.map(({ slug, priority }) => ({
      url: absoluteUrl(`/integrations/${slug}`),
      lastModified: routeLastModified("/integrations"),
      changeFrequency: "monthly" as const,
      priority,
    }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_SITEMAP_SLUGS.map((slug) => ({
    url: absoluteUrl(`/blog/${slug}`),
    lastModified: CONTENT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const compareEntries: MetadataRoute.Sitemap = COMPARE_SITEMAP_SLUGS.map(
    (slug) => {
      const contentFile = path.join(CONTENT_ROOT, "compare", `${slug}.md`);
      return {
        url: absoluteUrl(`/compare/${slug}`),
        lastModified: mtimeIfExists(contentFile) ?? CONTENT_DATE,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    }
  );

  return [
    ...pages,
    ...integrationEntries,
    ...blogEntries,
    ...compareEntries,
  ];
}
