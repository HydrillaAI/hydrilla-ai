"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, Sparkles } from "lucide-react";
import type { SearchEntry } from "@/lib/searchIndex";
import { MethodBadge, type HttpMethod } from "@/components/MethodBadge";

const RECENT_KEY = "hyd-recent-searches";

const SUGGESTED: { title: string; href: string }[] = [
  { title: "Quickstart", href: "/quickstart" },
  { title: "Authentication", href: "/authentication" },
  { title: "Text to 3D", href: "/api/text-to-3d" },
];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    if (!index && !loadError) {
      import("@/lib/searchIndex")
        .then((mod) => setIndex(mod.SEARCH_INDEX))
        .catch(() => setLoadError(true));
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])',
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
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!index || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const scored = index
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const pathText = (entry.path ?? "").toLowerCase();
        const haystack = `${title} ${entry.keywords} ${pathText}`;
        if (!terms.every((term) => haystack.includes(term))) return { entry, score: 0 };
        let score = 0;
        if (title === q) score += 8;
        if (title.startsWith(terms[0])) score += 5;
        if (title.includes(q)) score += 3;
        if (pathText.includes(q)) score += 3;
        for (const term of terms) if (haystack.includes(term)) score += 1;
        return { entry, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24);
    return scored.map((r) => r.entry);
  }, [index, query]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: SearchEntry[] }[] = [];
    for (const group of ["Guides", "API reference"] as const) {
      const items = results.filter((r) => r.group === group);
      if (items.length > 0) groups.push({ label: group, items });
    }
    return groups;
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const go = useCallback(
    (entry: SearchEntry) => {
      if (query.trim()) {
        const next = [query.trim(), ...recent.filter((r) => r !== query.trim())].slice(0, 5);
        setRecent(next);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      onClose();
      router.push(entry.href);
    },
    [query, recent, onClose, router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  };

  if (!open) return null;

  const renderEntry = (entry: SearchEntry) => {
    const position = flat.indexOf(entry);
    return (
      <a
        key={entry.id}
        id={`search-opt-${position}`}
        href={entry.href}
        role="option"
        aria-selected={position === active}
        className="search-result"
        data-active={position === active}
        onMouseEnter={() => setActive(position)}
        onClick={(e) => {
          e.preventDefault();
          go(entry);
        }}
      >
        {entry.method ? (
          <MethodBadge method={entry.method as HttpMethod} />
        ) : (
          <span className="status-dot" style={{ background: "var(--accent)" }} aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-small font-medium text-ink">{entry.title}</span>
          <span className="block truncate text-caption uppercase tracking-wider text-ink-3">
            {entry.method && entry.path ? `${entry.path} · ${entry.breadcrumb}` : entry.breadcrumb}
          </span>
        </span>
        <CornerDownLeft className="h-4 w-4 text-ink-3" aria-hidden />
      </a>
    );
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        ref={dialogRef}
      >
        <div className="search-row">
          <Search className="h-5 w-5 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search docs…"
            aria-label="Search documentation"
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `search-opt-${active}` : undefined}
            role="combobox"
            aria-expanded={flat.length > 0}
            autoComplete="off"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div id="search-results" role="listbox" aria-label="Search results" className="max-h-[60vh] overflow-y-auto py-1">
          <button
            type="button"
            className="search-result w-full border-b border-line text-left"
            onClick={() => {
              const prompt = query.trim();
              onClose();
              window.dispatchEvent(
                new CustomEvent("hyd-open-ai", {
                  detail: prompt ? { prompt } : {},
                }),
              );
            }}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-ink" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-small font-medium text-ink">
                {query.trim()
                  ? `Ask AI assistant: “${query.trim()}”`
                  : "Ask AI assistant"}
              </span>
              <span className="block truncate text-[12px] text-ink-3">
                Instant answers grounded in Hydrilla API documentation
              </span>
            </span>
            <kbd className="kbd">⌘I</kbd>
          </button>

          {!query.trim() && (
            <div>
              <p className="search-group">Suggested</p>
              {SUGGESTED.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="search-result"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    router.push(item.href);
                  }}
                >
                  <span className="status-dot" style={{ background: "var(--accent)" }} aria-hidden />
                  <span className="flex-1 text-small text-ink">{item.title}</span>
                </a>
              ))}
              {recent.length > 0 && (
                <>
                  <p className="search-group">Recent</p>
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="search-result w-full text-left"
                      onClick={() => setQuery(r)}
                    >
                      <Search className="h-4 w-4 text-ink-3" aria-hidden />
                      <span className="flex-1 text-small text-ink">{r}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {query.trim() && !index && !loadError && (
            <div className="space-y-2 p-4" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-9 w-full" />
              ))}
            </div>
          )}

          {loadError && (
            <div className="p-4">
              <p className="text-small text-ink-2">Search is unavailable right now. Try these pages:</p>
              <div className="mt-2">
                {SUGGESTED.map((item) => (
                  <a key={item.href} href={item.href} className="search-result" onClick={() => onClose()}>
                    <span className="flex-1 text-small text-ink">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {index && query.trim() && flat.length === 0 && (
            <p className="px-4 py-6 text-small text-ink-2">
              No results for “{query.trim()}”. Try “tasks” or “credits”.
            </p>
          )}

          {grouped.map((group) => (
            <div key={group.label} role="group" aria-label={group.label}>
              <p className="search-group">{group.label}</p>
              {group.items.map((entry) => renderEntry(entry))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12px] leading-4 text-ink-3">
          <span>↑↓ to navigate · Enter to open</span>
          <span>{flat.length > 0 ? `${flat.length} results` : "Hydrilla docs"}</span>
        </div>
      </div>
    </div>
  );
}
