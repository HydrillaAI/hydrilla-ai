import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Enterprise AI 3D Generator for Studios | Hydrilla AI",
  description:
    "Hydrilla Enterprise gives studios an AI 3D workspace and API: team seats, API concurrency, custom credit plans, and pipeline support. Book a demo.",
  ogTitle: "Hydrilla for Enterprise: AI 3D across your whole studio",
  path: "/enterprise",
  absoluteTitle: true,
});

export default function EnterpriseLayout({ children }: { children: ReactNode }) {
  return children;
}
