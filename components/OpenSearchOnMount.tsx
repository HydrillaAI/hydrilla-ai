"use client";

import { useEffect } from "react";

export function OpenSearchOnMount() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.dispatchEvent(new Event("hyd-open-search"));
    }, 150);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
