"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, ExternalLink, Sparkles } from "lucide-react";
import { SITE } from "@/lib/site";
import { DocsLogo } from "@/components/DocsLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar({
  onOpenSearch,
  onOpenAi,
  onToggleSidebar,
}: {
  onOpenSearch: () => void;
  onOpenAi: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="topbar">
      <div className="flex h-full w-full items-center gap-4 px-4 lg:px-5">
        <button
          type="button"
          className="icon-btn lg:hidden"
          aria-label="Open documentation menu"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <Link href="/quickstart" className="flex items-center gap-2.5" aria-label="Hydrilla docs home">
          <DocsLogo />
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <span className="hidden text-[13px] font-medium tracking-[-0.011em] text-ink-2 sm:inline">
            Docs
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <Link
            href="/introduction"
            className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-muted hover:text-ink"
          >
            Guides
          </Link>
          <Link
            href="/api/text-to-3d"
            className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-muted hover:text-ink"
          >
            API Reference
          </Link>
          <Link
            href="/sdks/python"
            className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-muted hover:text-ink"
          >
            SDKs
          </Link>
          <Link
            href="/changelog"
            className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-muted hover:text-ink"
          >
            Changelog
          </Link>
          <a
            href={SITE.studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-muted hover:text-ink"
          >
            Studio
            <ExternalLink className="h-3 w-3 text-ink-3" aria-hidden />
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="icon-btn sm:hidden"
            aria-label="Search docs"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden h-9 w-52 items-center gap-2 rounded-lg border border-line bg-subtle px-3 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 sm:flex lg:w-60"
            aria-label="Search docs"
          >
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="flex-1 truncate text-left">Search documentation…</span>
            <kbd className="kbd">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={onOpenAi}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-subtle px-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-muted hover:text-ink"
            aria-label="Ask AI assistant"
            title="Ask AI assistant (⌘I)"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-ink" aria-hidden />
            <span className="hidden sm:inline">Ask AI</span>
            <kbd className="kbd hidden lg:inline">⌘I</kbd>
          </button>

          <ThemeToggle />

          <a
            href={SITE.apiKeysUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Get API Key
          </a>
        </div>
      </div>
    </header>
  );
}
