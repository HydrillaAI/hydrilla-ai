import React from "react";
import { highlight, type CodeLang } from "@/lib/shiki";
import { CodeBlockShell } from "./CodeBlockShell";

export interface CodeBlockProps {
  code: string;
  lang?: CodeLang;
  filename?: string;
  label?: string;
  showLines?: boolean;
  highlightLines?: number[];
  addedLines?: number[];
}

export async function CodeBlock({
  code,
  lang = "bash",
  filename,
  label,
  showLines = false,
  highlightLines,
  addedLines,
}: CodeBlockProps) {
  const html = await highlight(code, { lang, highlightLines, addedLines });
  const lineCount = code.split("\n").length;
  return (
    <CodeBlockShell
      html={html}
      lang={lang}
      label={filename ?? label ?? lang}
      lineCount={lineCount}
      showLines={showLines}
    />
  );
}
