import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

export type CodeLang = "bash" | "python" | "typescript" | "json" | "text";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["bash", "python", "typescript", "json"],
    });
  }
  return highlighterPromise;
}

export interface HighlightOptions {
  lang: CodeLang;
  highlightLines?: number[];
  addedLines?: number[];
}

export async function highlight(code: string, options: HighlightOptions): Promise<string> {
  const lang = options.lang === "text" ? "text" : options.lang;
  const hl = new Set(options.highlightLines ?? []);
  const added = new Set(options.addedLines ?? []);
  const highlighter = await getHighlighter();

  const known = ["bash", "python", "typescript", "json"];
  const useLang = known.includes(lang) ? lang : "text";

  if (useLang === "text") {
    return escapeHtml(code);
  }

  return highlighter.codeToHtml(code, {
    lang: useLang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    transformers: [
      {
        line(node, line) {
          if (hl.has(line)) node.properties["data-hl"] = "true";
          if (added.has(line)) node.properties["data-added"] = "true";
        },
      },
    ],
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
