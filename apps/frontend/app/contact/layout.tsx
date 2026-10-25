import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact Hydrilla: AI 3D Support and Press | Hydrilla AI",
  description:
    "Reach Hydrilla for product support or press at founders@hydrilla.ai. For studio plans, volume, or a demo, go to Enterprise.",
  ogTitle: "Contact Hydrilla",
  path: "/contact",
  absoluteTitle: true,
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
