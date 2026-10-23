"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyPath({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5">
      <code className="mono text-[15px] font-medium text-ink">{value}</code>
      <button
        type="button"
        className="icon-btn !h-8 !w-8 !min-w-8"
        aria-label={`Copy path ${value}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Path copied" : ""}
      </span>
    </span>
  );
}
