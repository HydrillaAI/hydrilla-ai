"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Package, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "./controls";

type Props = {
  /** Collection label, usually the engine that made the model. */
  title: string;
  parts: string[];
  colors: Record<string, string>;
  edited: ReadonlySet<string>;
  hidden: ReadonlySet<string>;
  selected: string | null;
  onSelect: (name: string) => void;
  onToggleHidden: (name: string) => void;
  /** Alt-click an eye to show only that part. */
  onIsolate: (name: string) => void;
  onShowAll: () => void;
};

/** Search appears once the list is long enough to need it. */
const SEARCH_FROM = 7;

export function LayersList({ title, parts, colors, edited, hidden, selected, onSelect, onToggleHidden, onIsolate, onShowAll }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const needle = query.trim().toLowerCase();
  const shown = useMemo(() => (needle ? parts.filter((name) => name.toLowerCase().includes(needle)) : parts), [parts, needle]);
  const hiddenCount = parts.filter((name) => hidden.has(name)).length;

  return (
    <div className="flex flex-col gap-2">
      {parts.length >= SEARCH_FROM ? (
        <label className="flex h-9 items-center gap-2 rounded-xl bg-neutral-100 px-2.5 text-neutral-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-neutral-300">
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.stopPropagation();
                setQuery("");
              }
            }}
            placeholder="Search parts"
            aria-label="Search parts"
            className="studio-bare-field h-full min-w-0 flex-1 bg-transparent text-[12px] text-neutral-950 outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className={cn("rounded text-neutral-400 hover:text-neutral-900", FOCUS_RING)}>
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : null}
        </label>
      ) : null}

      <div className="flex h-8 items-center gap-2 pl-0.5">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-md text-left", FOCUS_RING)}
        >
          <Package className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} aria-hidden />
          <span className="truncate text-[12px] font-medium text-neutral-950">{title}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-neutral-400">{parts.length}</span>
          <ChevronDown className={cn("ml-auto h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-200", open && "rotate-180")} strokeWidth={2} />
        </button>
        {hiddenCount > 0 ? (
          <button
            type="button"
            onClick={onShowAll}
            title="Show all parts (Alt+H)"
            className={cn("h-6 shrink-0 rounded-md px-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950", FOCUS_RING)}
          >
            Show all
          </button>
        ) : null}
      </div>

      {open ? (
        shown.length === 0 ? (
          <p className="py-2 pl-6 text-[12px] text-neutral-400">No parts match “{query.trim()}”</p>
        ) : (
          <ul aria-label="Parts" className="-mx-1 flex max-h-[264px] flex-col gap-px overflow-y-auto">
            {shown.map((name) => {
              const isSelected = name === selected;
              const isHidden = hidden.has(name);
              return (
                <li
                  key={name}
                  className={cn(
                    "group relative flex h-8 shrink-0 items-center rounded-lg pl-6 pr-1 transition-colors",
                    isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"
                  )}
                >
                  {isSelected ? <span className="absolute left-2.5 h-3.5 w-[2px] rounded-full bg-sky-500" aria-hidden /> : null}
                  <button
                    type="button"
                    onClick={() => onSelect(name)}
                    aria-pressed={isSelected}
                    title={name}
                    className={cn("flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-md pl-1 text-left", FOCUS_RING)}
                  >
                    <span
                      className={cn("h-3 w-3 shrink-0 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]", isHidden && "opacity-40")}
                      style={{ backgroundColor: colors[name] ?? "#888888" }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "truncate text-[12px]",
                        isHidden ? "text-neutral-400" : isSelected ? "font-medium text-neutral-950" : "text-neutral-700"
                      )}
                    >
                      {name}
                    </span>
                    {edited.has(name) ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="Material edited" aria-label="Material edited" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => (event.altKey ? onIsolate(name) : onToggleHidden(name))}
                    aria-label={isHidden ? `Show ${name}` : `Hide ${name}`}
                    aria-pressed={isHidden}
                    title={isHidden ? "Show (H) · Alt-click to isolate" : "Hide (H) · Alt-click to isolate"}
                    className={cn(
                      "ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-opacity hover:bg-white hover:text-neutral-950",
                      isHidden ? "opacity-100" : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
                      FOCUS_RING
                    )}
                  >
                    {isHidden ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.85} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.85} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : null}
    </div>
  );
}
