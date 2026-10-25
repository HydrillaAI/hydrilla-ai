"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { TableOfContents } from "@/components/TableOfContents";
import { Footer } from "@/components/Footer";
import { SearchDialog } from "@/components/SearchDialog";
import { AskAiSheet } from "@/components/AskAiSheet";
import { RouteProgress } from "@/components/RouteProgress";

export function DocsChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const sidebarWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setAiOpen((v) => !v);
      } else if (e.key === "/" && !typing && !searchOpen && !drawerOpen && !aiOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, drawerOpen, aiOpen]);

  useEffect(() => {
    const lock = searchOpen || drawerOpen || aiOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, drawerOpen, aiOpen]);

  useEffect(() => {
    const openSearch = () => setSearchOpen(true);
    const openAi = (e: Event) => {
      const custom = e as CustomEvent<{ prompt?: string }>;
      if (custom.detail?.prompt) {
        setAiInitialPrompt(custom.detail.prompt);
      }
      setSearchOpen(false);
      setAiOpen(true);
    };
    window.addEventListener("hyd-open-search", openSearch);
    window.addEventListener("hyd-open-ai", openAi);
    return () => {
      window.removeEventListener("hyd-open-search", openSearch);
      window.removeEventListener("hyd-open-ai", openAi);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (e.key === "Tab" && sidebarWrapRef.current) {
        const focusables = sidebarWrapRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <RouteProgress />
      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAi={() => setAiOpen(true)}
        onToggleSidebar={() => setDrawerOpen((v) => !v)}
      />

      {drawerOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      <div className="docs-shell">
        <div ref={sidebarWrapRef} className="contents">
          <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
        <main id="main" tabIndex={-1} className="docs-main">
          {children}
          <Footer pathname={pathname} />
        </main>
        <TableOfContents />
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AskAiSheet
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        initialPrompt={aiInitialPrompt}
        onConsumePrompt={() => setAiInitialPrompt(null)}
      />
    </>
  );
}
