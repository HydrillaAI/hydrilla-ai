"use client";

import { useEffect, useState } from "react";

export type LanguageId = "curl" | "python" | "typescript";

const KEY = "hyd-code-language";
const EVENT = "hyd-language-change";

export function useLanguage(): [LanguageId, (lang: LanguageId) => void] {
  const [lang, setLang] = useState<LanguageId>("curl");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as LanguageId | null;
      if (stored === "curl" || stored === "python" || stored === "typescript") setLang(stored);
    } catch {
      /* ignore */
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LanguageId>).detail;
      if (detail) setLang(detail);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  function update(next: LanguageId) {
    setLang(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent<LanguageId>(EVENT, { detail: next }));
  }

  return [lang, update];
}
