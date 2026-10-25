import type { ReactNode } from "react";
import { CommunityProvider } from "./CommunityProvider";
import { CommunityHeader } from "./CommunityHeader";

/** Theme-aware frame for /discover, /posts/[id] and /@username. */
export function CommunityShell({ children }: { children: ReactNode }) {
  return (
    <CommunityProvider>
      <div className="app-themed community-root min-h-dvh bg-[var(--app-canvas)]">
        <CommunityHeader />
        {children}
      </div>
    </CommunityProvider>
  );
}
