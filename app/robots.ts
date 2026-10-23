import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/proxy", "/api/status", "/api/feedback"],
      },
    ],
    sitemap: `${SITE.docsUrl}/sitemap.xml`,
    host: SITE.docsUrl,
  };
}
