"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DOC_SECTIONS } from "@/lib/docsData";
import { MethodBadge } from "@/components/MethodBadge";

const STORAGE_KEY = "hyd-sidebar-collapsed";

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollapsed(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  function toggle(section: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <nav aria-label="Docs" className="docs-sidebar" data-open={isOpen}>
      <div className="space-y-6">
        {DOC_SECTIONS.map((section) => {
          const isCollapsed = collapsed[section.title] ?? false;
          const panelId = `sidebar-${section.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
          return (
            <div key={section.title}>
              <button
                type="button"
                onClick={() => toggle(section.title)}
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
              >
                <span className="sidebar-group-label !px-0">{section.title}</span>
                <ChevronDown
                  className="h-3.5 w-3.5 text-ink-3 transition-transform"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : "none" }}
                  aria-hidden
                />
              </button>
              <ul id={panelId} hidden={isCollapsed} className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        ref={isActive ? activeRef : undefined}
                        data-active={isActive}
                        aria-current={isActive ? "page" : undefined}
                        className="sidebar-link"
                      >
                        <span className="truncate">{item.title}</span>
                        {item.method && <MethodBadge method={item.method} />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
