import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Team: The People Behind Hydrilla AI 3D | Hydrilla AI",
  description:
    "Meet the people at Hydrilla AI who build BlueFox, Hydrilla's 3D model, and the Hydrilla AI 3D workspace.",
  ogTitle: "The Hydrilla team",
  path: "/team",
  absoluteTitle: true,
});

export default function TeamLayout({ children }: { children: ReactNode }) {
  return children;
}
