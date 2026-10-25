import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Research: The BlueFox 1 AI 3D Model Card | Hydrilla AI",
  description:
    "Hawan Research Labs, Hydrilla AI's research lab, builds BlueFox. Read the BlueFox 1 model card: inputs, outputs, intended use, and limits.",
  ogTitle: "Hawan Research Labs at Hydrilla AI",
  path: "/research",
  absoluteTitle: true,
});

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return children;
}
