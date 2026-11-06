import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";
import { WHY_HYDRILLA_MEDIA } from "@/lib/cloudinary";

export const metadata = createPageMetadata({
  title: "BlueFox: Hydrilla's AI 3D Model | Hydrilla AI",
  description:
    "BlueFox, Hydrilla's 3D model, turns a text prompt or reference image into a segmented mesh with UVs and PBR textures. Generally available.",
  ogTitle: "BlueFox from Hydrilla AI",
  path: "/bluefox",
  absoluteTitle: true,
  ogImage: WHY_HYDRILLA_MEDIA.bluefox.poster,
  keywords: [
    "BlueFox",
    "BlueFox 1",
    "Hydrilla 3D model",
    "best 3D AI generator",
    "best 3D AI generator in India",
    "best 3D AI generator US",
    "best 3D AI generator Japan",
    "best 3D AI generator China",
    "best 3D AI generator France",
    "segmented 3D mesh AI",
    "Hawan Research Labs",
  ],
});

export default function BlueFoxLayout({ children }: { children: ReactNode }) {
  return children;
}
