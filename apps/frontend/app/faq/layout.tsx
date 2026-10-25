import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Hydrilla FAQ: Licensing, Accounts, and Support | Hydrilla AI",
  description:
    "Answers about owning what you generate with Hydrilla, accounts and data, and getting support. Plans and formats have their own pages.",
  ogTitle: "Hydrilla FAQ",
  path: "/faq",
  absoluteTitle: true,
});

export default function FAQLayout({ children }: { children: ReactNode }) {
  return children;
}
