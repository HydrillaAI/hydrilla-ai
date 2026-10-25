"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type CodeLang = "curl" | "python" | "typescript";

const KEYWORDS: Record<CodeLang, string[]> = {
  curl: ["curl"],
  python: ["import", "from", "as", "def", "return", "print", "True", "False", "None", "for", "in", "if", "else"],
  typescript: ["import", "from", "const", "let", "await", "async", "return", "new", "true", "false", "null", "export", "function"],
};

/** One pass, longest-first alternation; good enough for short request snippets (no nesting). */
function tokenize(line: string, lang: CodeLang, secret?: string): ReactNode[] {
  const comment = lang === "typescript" ? "\\/\\/.*$" : "#.*$";
  const kw = KEYWORDS[lang].join("|");
  const re = new RegExp(
    `(${comment})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|(\\s-{1,2}[A-Za-z][\\w-]*)|\\b(${kw})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|([A-Za-z_]\\w*)(?=\\()`,
    "g"
  );
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [text, cmt, str, flag, keyword, num, fn] = m;
    if (cmt) out.push(<span key={m.index} className="text-[#6b7686] italic">{text}</span>);
    else if (str) out.push(<Fragment key={m.index}>{highlightSecret(text, secret)}</Fragment>);
    else if (flag) out.push(<span key={m.index} className="text-[#7eb1e3]">{text}</span>);
    else if (keyword) out.push(<span key={m.index} className="text-[#c4a7ff]">{text}</span>);
    else if (num) out.push(<span key={m.index} className="text-[#f6b26b]">{text}</span>);
    else if (fn) out.push(<span key={m.index} className="text-[#8bd5ff]">{text}</span>);
    last = m.index + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** Strings are green; the API key inside one is called out so people see what to replace. */
function highlightSecret(text: string, secret?: string): ReactNode {
  if (!secret || !text.includes(secret)) return <span className="text-[#9fdc9a]">{text}</span>;
  const [before, after] = text.split(secret);
  return (
    <span className="text-[#9fdc9a]">
      {before}
      <span className="rounded bg-amber-400/15 px-0.5 text-[#ffd479] ring-1 ring-amber-300/25">{secret}</span>
      {after}
    </span>
  );
}

/** Dark, editor-style code panel with language tabs, line numbers and copy. Same look in light and dark themes. */
export function CodeBlock({
  snippets,
  lang,
  onLangChange,
  secret,
  title,
}: {
  snippets: Record<CodeLang, string>;
  lang: CodeLang;
  onLangChange: (lang: CodeLang) => void;
  /** Substring to call out (the API key placeholder or the freshly created key). */
  secret?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const code = snippets[lang];
  const lines = useMemo(() => code.split("\n"), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked
    }
  };

  const tabs: { id: CodeLang; label: string }[] = [
    { id: "curl", label: "cURL" },
    { id: "python", label: "Python" },
    { id: "typescript", label: "TypeScript" },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] bg-[#0d1015] text-[#e6e9ef] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
        <div role="tablist" aria-label="Language" className="flex items-center gap-0.5 rounded-full bg-white/[0.06] p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={lang === t.id}
              onClick={() => onLangChange(t.id)}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-semibold transition-colors",
                lang === t.id ? "bg-white text-[#0d1015]" : "text-white/60 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {title && <span className="ml-2 hidden truncate font-mono text-[12px] text-white/45 sm:inline">{title}</span>}
        <button
          type="button"
          onClick={() => void copy()}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto py-4">
        <pre className="min-w-max font-mono text-[12.5px] leading-[1.7]">
          {lines.map((line, i) => (
            <div key={i} className="flex pr-6">
              <span className="w-12 shrink-0 select-none pr-4 text-right text-white/25 tabular-nums">{i + 1}</span>
              <code>{line ? tokenize(line, lang, secret) : " "}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
