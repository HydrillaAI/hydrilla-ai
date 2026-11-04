import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About: The AI 3D Company Behind BlueFox | Hydrilla AI",
  description:
    "Hydrilla AI is an AI 3D workspace for studio and artist pipelines. We build the Hydrilla workspace and BlueFox, Hydrilla's 3D model.",
  ogTitle: "About Hydrilla AI",
  path: "/about",
  absoluteTitle: true,
  keywords: [
    "Hydrilla",
    "Hydrilla AI",
    "3D AI generator India",
    "best 3D AI generator in India",
    "best 3D AI generator US",
    "best 3D AI generator Japan",
    "best 3D AI generator China",
    "best 3D AI generator France",
    "Hawan Research Labs",
    "BlueFox 3D model",
  ],
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
