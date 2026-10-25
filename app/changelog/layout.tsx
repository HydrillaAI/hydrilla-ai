import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla Changelog: AI 3D Product Updates | Hydrilla AI",
  description:
    "Dated release notes for Hydrilla and BlueFox 1: generation, Studio, integrations, exports, and the REST API.",
  ogTitle: "Hydrilla changelog",
  path: "/changelog",
  absoluteTitle: true,
});

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  return children;
}
