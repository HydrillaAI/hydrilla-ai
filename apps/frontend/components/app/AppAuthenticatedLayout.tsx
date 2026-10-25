"use client";

import type { ReactNode } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { AppLayoutProvider } from "@/context/AppLayoutContext";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppNavbar } from "@/components/app/AppNavbar";

export function AppAuthenticatedLayout({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const shellRef = useRef<HTMLDivElement>(null);
  const lastTheme = useRef(resolvedTheme);

  useEffect(() => {
    document.body.classList.add("app-shell");
    return () => document.body.classList.remove("app-shell");
  }, []);

  // Cross-fade surfaces only while the theme flips; idle UI carries no transition rule.
  useEffect(() => {
    if (lastTheme.current === resolvedTheme) return;
    lastTheme.current = resolvedTheme;
    const el = shellRef.current;
    if (!el) return;
    el.classList.add("theme-switching");
    const id = window.setTimeout(() => el.classList.remove("theme-switching"), 240);
    return () => window.clearTimeout(id);
  }, [resolvedTheme]);

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <AppLayoutProvider>
          <div ref={shellRef} className="app-themed app-pickle h-dvh flex bg-[var(--app-canvas)]">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <AppNavbar />
              <div className="flex-1 min-h-0 overflow-auto bg-[var(--app-canvas)]">
                {children}
              </div>
            </div>
          </div>
        </AppLayoutProvider>
      </SignedIn>
    </>
  );
}

function RedirectToSignIn() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);
  return (
    <div className="h-dvh flex items-center justify-center bg-neutral-50">
      <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  );
}
