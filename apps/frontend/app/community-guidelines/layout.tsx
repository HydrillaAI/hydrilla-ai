import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Community Guidelines",
  description:
    "What you can share in the Hydrilla community, how licenses on shared models work, and how we handle reports.",
  path: "/community-guidelines",
  noMarkdown: true,
});

export default function CommunityGuidelinesLayout({ children }: { children: ReactNode }) {
  return children;
}
