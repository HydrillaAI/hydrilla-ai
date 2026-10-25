import type { MetadataRoute } from "next";
import { PAGE_ORDER } from "@/lib/docsData";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...PAGE_ORDER.map((path) => ({
      url: `${SITE.docsUrl}${path}`,
      lastModified: now,
      changeFrequency: (path === "/introduction" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "/quickstart" ? 1 : 0.8,
    })),
    {
      url: `${SITE.docsUrl}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
