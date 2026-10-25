import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Careers: AI 3D Engineering and Research | Hydrilla AI",
  description:
    "Join Hydrilla AI, the team building BlueFox and the Hydrilla AI 3D workspace. See who we hire for engineering, research, and go to market.",
  ogTitle: "Careers at Hydrilla",
  path: "/careers",
  absoluteTitle: true,
});

export default function CareersLayout({ children }: { children: ReactNode }) {
  return children;
}
