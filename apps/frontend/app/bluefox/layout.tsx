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
});

export default function BlueFoxLayout({ children }: { children: ReactNode }) {
  return children;
}
