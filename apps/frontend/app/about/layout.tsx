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
    "Hydrilla AI",
    "Hydrilla AI Private Limited",
    "3D AI generator India",
    "best 3D AI generator in India",
    "Hawan Research Labs",
    "BlueFox 3D model",
  ],
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
