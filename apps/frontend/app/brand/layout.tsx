import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Press Kit | Hydrilla AI",
  description: "Hydrilla logos, naming, and approved boilerplate for press.",
  ogTitle: "Hydrilla press kit",
  path: "/brand",
  absoluteTitle: true,
  noIndex: true,
});

export default function BrandLayout({ children }: { children: ReactNode }) {
  return children;
}
