"use client";

import { Search } from "lucide-react";

export function SearchTrigger({
  className = "btn btn-secondary mt-5",
  label = "Search docs",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("hyd-open-search"))}
    >
      <Search className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
