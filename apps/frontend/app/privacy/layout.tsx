import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy | Hydrilla AI",
  description:
    "How Hydrilla collects, uses, shares, and protects account and service information, and the rights and choices you have.",
  ogTitle: "Privacy Policy",
  path: "/privacy",
  absoluteTitle: true,
});

export default function PrivacyPolicyLayout({ children }: { children: ReactNode }) {
  return children;
}
