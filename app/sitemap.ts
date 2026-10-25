import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo";
import { getSitemapEntries } from "@/lib/community-server";

/** Content date from routing.md. Not the build time. */
const CONTENT_DATE = new Date("2026-10-24T00:00:00Z");

/** Community posts and profiles change hourly at most; refresh the list on that cadence. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing = PUBLIC_ROUTES.map(({ path: routePath, changeFrequency, priority }) => ({
    url: absoluteUrl(routePath),
    lastModified: CONTENT_DATE,
    changeFrequency,
    priority,
  }));

  const community = await getSitemapEntries();
  const posts = community.posts.map((p) => ({
    url: absoluteUrl(`/posts/${p.id}`),
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));
  const profiles = community.users.map((u) => ({
    url: absoluteUrl(`/@${u.username}`),
    changeFrequency: "weekly" as const,
    priority: 0.3,
  }));

  return [...marketing, ...posts, ...profiles];
}
