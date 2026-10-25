"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { neighbors } from "./feedOrder";

/** Overlay for a post opened from the Discover grid (intercepted /posts/[id]). */
export function PostModal({ postId, children }: { postId: string; children: ReactNode }) {
  const router = useRouter();
  const [{ prev, next }, setNav] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null });

  useEffect(() => setNav(neighbors(postId)), [postId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if (e.key === "Escape") router.back();
      if (typing) return;
      if (e.key === "ArrowLeft" && prev) router.replace(`/posts/${prev}`, { scroll: false });
      if (e.key === "ArrowRight" && next) router.replace(`/posts/${next}`, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [router, prev, next]);

  const navButton =
    "flex h-9 items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-35";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/45 backdrop-blur-md community-overlay-in" onClick={() => router.back()}>
      <div
        role="dialog"
        aria-modal="true"
        className="community-pop-in flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--app-canvas)] p-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] sm:m-4 sm:rounded-[26px] sm:p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-end gap-2 sm:mb-3">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && router.replace(`/posts/${prev}`, { scroll: false })}
            className={navButton}
            aria-label="Previous post"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && router.replace(`/posts/${next}`, { scroll: false })}
            className={navButton}
            aria-label="Next post"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => router.back()} className={navButton}>
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
