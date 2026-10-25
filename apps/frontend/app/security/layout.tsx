import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Security: How Hydrilla Protects Studio Assets | Hydrilla AI",
  description:
    "How Hydrilla secures accounts, keeps generated meshes scoped to your workspace, and never uses your data to train its models.",
  ogTitle: "Security at Hydrilla AI",
  path: "/security",
  absoluteTitle: true,
});

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return children;
}
