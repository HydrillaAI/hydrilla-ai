import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cookie Policy | Hydrilla AI",
  description:
    "How Hydrilla uses essential session cookies, preferences, and analytics on hydrilla.ai, and how you can manage them.",
  ogTitle: "Cookie Policy",
  path: "/cookies",
  absoluteTitle: true,
});

export default function CookiePolicyLayout({ children }: { children: ReactNode }) {
  return children;
}
