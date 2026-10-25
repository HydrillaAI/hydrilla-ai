"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, List } from "lucide-react";
import { PAGE_META } from "@/lib/docsData";

function useHeadings() {
  const pathname = usePathname();
  return PAGE_META[pathname]?.headings ?? [];
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join("|")]);

  return active;
}

export function TableOfContents() {
  const headings = useHeadings();
  const active = useActiveHeading(headings.map((h) => h.id));

  if (headings.length === 0) {
    return <aside aria-label="On this page" className="docs-toc" />;
  }

  return (
    <aside aria-label="On this page" className="docs-toc">
      <div>
        <p className="toc-label mb-2">On this page</p>
        <nav aria-label="On this page">
          <ul className="space-y-0.5">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className="toc-link"
                  data-active={active === heading.id}
                  aria-current={active === heading.id ? "true" : undefined}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export function TocDropdown() {
  const headings = useHeadings();
  const active = useActiveHeading(headings.map((h) => h.id));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (headings.length === 0) return null;

  const current = headings.find((h) => h.id === active) ?? headings[0];

  return (
    <div className="toc-dropdown-wrap relative my-4" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="btn btn-secondary w-full justify-between"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <List className="h-4 w-4 text-ink-3" aria-hidden />
          <span className="text-ink-3">On this page:</span>
          <span className="truncate text-ink">{current.text}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-3" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute top-[calc(100%+6px)] z-50 w-full rounded border border-line bg-surface py-1 shadow-card">
          {headings.map((heading) => (
            <a
              key={heading.id}
              role="menuitem"
              href={`#${heading.id}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-small text-ink-2 hover:bg-muted hover:text-ink"
            >
              {heading.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
