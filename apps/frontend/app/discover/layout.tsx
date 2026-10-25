import type { ReactNode } from "react";
import { CommunityShell } from "@/components/community/CommunityShell";

/** `modal` is the @modal slot: a post opened from the grid renders there as an overlay. */
export default function DiscoverLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <CommunityShell>
      {children}
      {modal}
    </CommunityShell>
  );
}
