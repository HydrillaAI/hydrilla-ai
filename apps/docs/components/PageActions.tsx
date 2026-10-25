"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Bot,
  Compass,
  Terminal,
  Link2,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { PAGE_META } from "@/lib/docsData";

export function PageActions() {
  const pathname = usePathname();
  const slug = pathname === "/" ? "quickstart" : pathname.replace(/^\//, "");
  const mdHref = `/${slug}.md`;
  const pageUrl = `${SITE.docsUrl}${pathname === "/" ? "/quickstart" : pathname}`;
  const pageTitle = PAGE_META[pathname]?.heading ?? "Hydrilla API Documentation";

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function markCopied(key: string) {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  }

  async function fetchPageMarkdown(): Promise<string> {
    try {
      const res = await fetch(mdHref);
      if (res.ok) return await res.text();
    } catch {
      /* ignore */
    }
    return `# ${pageTitle}\n\nSource: ${pageUrl}`;
  }

  async function copyPageMarkdown(closeMenuAfter = false) {
    const text = await fetchPageMarkdown();
    try {
      await navigator.clipboard.writeText(text);
      markCopied("page");
      if (closeMenuAfter) setMenuOpen(false);
    } catch {
      /* ignore */
    }
  }

  async function copyLlmsUrl() {
    try {
      await navigator.clipboard.writeText(`${SITE.docsUrl}/llms-full.txt`);
      markCopied("llms");
      setMenuOpen(false);
    } catch {
      /* ignore */
    }
  }

  async function copyCursorConfig() {
    const snippet = JSON.stringify(
      {
        mcpServers: {
          "hydrilla-docs": {
            url: `${SITE.docsUrl}/llms-full.txt`,
          },
        },
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(snippet);
      markCopied("cursor");
      setMenuOpen(false);
    } catch {
      /* ignore */
    }
  }

  function openAskAi() {
    setMenuOpen(false);
    window.dispatchEvent(
      new CustomEvent("hyd-open-ai", {
        detail: {
          pathname,
          prompt: `Explain ${pageTitle} and show a working example.`,
        },
      }),
    );
  }

  const aiPrompt = `Read ${pageUrl}.md (${pageTitle} in the Hydrilla AI Developer Documentation) so I can ask questions about it.`;
  const chatGptUrl = `https://chatgpt.com/?hints=search&q=${encodeURIComponent(aiPrompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;
  const perplexityUrl = `https://www.perplexity.ai/search/new?q=${encodeURIComponent(aiPrompt)}`;

  return (
    <div ref={wrapRef} className="relative inline-flex items-center">
      <div className="inline-flex items-stretch rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={() => copyPageMarkdown(false)}
          className="inline-flex h-8 items-center gap-2 rounded-l-[7px] px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted"
          aria-label="Copy page as Markdown for LLMs"
        >
          {copiedKey === "page" ? (
            <Check className="h-3.5 w-3.5 text-ink" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5 text-ink-2" aria-hidden />
          )}
          <span>{copiedKey === "page" ? "Copied" : "Copy page"}</span>
        </button>

        <span className="w-px self-stretch bg-line" aria-hidden />

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="More page and AI actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-r-[7px] text-ink-2 transition-colors hover:bg-muted hover:text-ink"
        >
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform duration-150"
            style={{ transform: menuOpen ? "rotate(180deg)" : "none" }}
            aria-hidden
          />
        </button>
      </div>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Page and AI actions"
          className="context-menu-popover absolute right-0 top-[calc(100%+6px)] z-50 w-[296px] rounded-xl border border-line bg-surface p-1.5 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => copyPageMarkdown(true)}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              {copiedKey === "page" ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[13px] font-medium leading-4 text-ink">
                Copy page
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Copy page as Markdown for LLMs
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={openAskAi}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center justify-between text-[13px] font-medium leading-4 text-ink">
                <span>Ask AI assistant</span>
                <kbd className="kbd">⌘I</kbd>
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Ask questions with this page as context
              </span>
            </span>
          </button>

          <a
            href={mdHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <FileText className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1 text-[13px] font-medium leading-4 text-ink">
                <span>View as Markdown</span>
                <ExternalLink className="h-3 w-3 text-ink-3" aria-hidden />
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                View this page as plain text
              </span>
            </span>
          </a>

          <div className="my-1 h-px bg-line" role="separator" />

          <a
            href={chatGptUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <MessageSquare className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1 text-[13px] font-medium leading-4 text-ink">
                <span>Open in ChatGPT</span>
                <ExternalLink className="h-3 w-3 text-ink-3" aria-hidden />
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Ask questions about this page
              </span>
            </span>
          </a>

          <a
            href={claudeUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <Bot className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1 text-[13px] font-medium leading-4 text-ink">
                <span>Open in Claude</span>
                <ExternalLink className="h-3 w-3 text-ink-3" aria-hidden />
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Ask questions about this page
              </span>
            </span>
          </a>

          <a
            href={perplexityUrl}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <Compass className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1 text-[13px] font-medium leading-4 text-ink">
                <span>Open in Perplexity</span>
                <ExternalLink className="h-3 w-3 text-ink-3" aria-hidden />
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Search and cite this page
              </span>
            </span>
          </a>

          <div className="my-1 h-px bg-line" role="separator" />

          <button
            type="button"
            role="menuitem"
            onClick={copyLlmsUrl}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <Link2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[13px] font-medium leading-4 text-ink">
                Copy llms-full.txt URL
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Full documentation context for AI agents
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={copyCursorConfig}
            className="context-menu-item"
          >
            <span className="context-menu-icon">
              <Terminal className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[13px] font-medium leading-4 text-ink">
                Connect to Cursor
              </span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-3">
                Copy MCP docs config for Cursor
              </span>
            </span>
          </button>
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {copiedKey ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
