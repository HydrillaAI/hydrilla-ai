import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Enterprise: AI 3D for Studio Pipelines | Hydrilla AI",
  description:
    "Team seats, API concurrency, custom plans, and pipeline support for studios generating 3D with BlueFox at volume. Book a demo.",
  ogTitle: "Hydrilla for studios and enterprise teams",
  path: "/enterprise",
  absoluteTitle: true,
});

export default function EnterpriseLayout({ children }: { children: ReactNode }) {
  return children;
}
