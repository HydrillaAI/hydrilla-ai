"use client";

import React, { useState } from "react";
import { Check, Copy, WrapText, ChevronsDownUp, ChevronsUpDown } from "lucide-react";

export function CodeBlockShell({
  html,
  lang,
  label,
  lineCount,
  showLines = false,
}: {
  html: string;
  lang: string;
  label: string;
  lineCount: number;
  showLines?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const collapsible = lineCount > 30;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(htmlToText(html));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <figure
      className="codeblock"
      data-wrap={wrap}
      data-lines={showLines ? "true" : "false"}
      data-collapsed={collapsible && !expanded ? "true" : "false"}
    >
      <figcaption className="codeblock-header">
        <span className="codeblock-label">
          <span className="codeblock-lang">{lang}</span>
          <span className="truncate">{label}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            className="codebtn"
            data-active={wrap}
            aria-pressed={wrap}
            onClick={() => setWrap((v) => !v)}
            aria-label={wrap ? "Disable line wrapping" : "Enable line wrapping"}
          >
            <WrapText className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Wrap</span>
          </button>
          {collapsible && (
            <button
              type="button"
              className="codebtn"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">{expanded ? "Collapse" : "Expand"}</span>
            </button>
          )}
          <button
            type="button"
            className="codebtn"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden style={{ color: "var(--success)" }} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden />
                <span>Copy</span>
              </>
            )}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? "Code copied to clipboard" : ""}
          </span>
        </span>
      </figcaption>
      <div
        className="codeblock-body"
        style={collapsible && !expanded ? { maxHeight: 484, overflowY: "hidden" } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {collapsible && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="codeblock-expand"
        >
          Show all {lineCount} lines
        </button>
      )}
    </figure>
  );
}

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
