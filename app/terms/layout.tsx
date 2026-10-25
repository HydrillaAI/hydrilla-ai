import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Service | Hydrilla AI",
  description:
    "The terms for using Hydrilla and BlueFox generation, including accounts, payments, ownership of generated 3D assets, and acceptable use.",
  ogTitle: "Terms of Service",
  path: "/terms",
  absoluteTitle: true,
});

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
