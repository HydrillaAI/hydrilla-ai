import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const DISALLOW = [
  "/app/",
  "/workspace",
  "/generate",
  "/generations",
  "/library",
  "/checkout",
  "/rigging",
  "/sign-in",
  "/sign-up",
  "/viewer",
  "/claim/",
  "/md/",
  "/integrations/connect",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
