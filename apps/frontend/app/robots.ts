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

const AI_AND_SEARCH_AGENTS = [
  "*",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: AI_AND_SEARCH_AGENTS.map((userAgent) => ({
      userAgent,
      allow: ["/", "/llms.txt", "/llms-full.txt"],
      disallow: DISALLOW,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
