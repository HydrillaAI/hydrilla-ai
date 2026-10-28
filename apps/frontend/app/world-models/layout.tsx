import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "World Models for 3D Creation | Hydrilla AI",
  description:
    "Explore Hydrilla AI's world-model stack: BlueFox 1 for production-ready 3D assets and Water for controllable, agent-led 3D workflows.",
  ogTitle: "World Models for 3D Creation from Hydrilla AI",
  path: "/world-models",
  absoluteTitle: true,
  keywords: [
    "world models",
    "AI world models",
    "spatial intelligence",
    "AI 3D models",
    "3D asset generation",
    "BlueFox 1",
    "Hydrilla AI",
  ],
});

export default function WorldModelsLayout({ children }: { children: ReactNode }) {
  return children;
}
