"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { FeedPage, PostCard as PostCardData } from "@/lib/community";
import { useCommunity } from "./CommunityProvider";
import { PostCard, PostCardSkeleton, PostTile, PostTileSkeleton } from "./PostCard";
import { setFeedOrder } from "./feedOrder";

/**
 * Responsive post grid with infinite scroll. `loadPage(null)` loads the first page;
 * changing `resetKey` (tab, tag, search) starts over. `initial` skips the first fetch.
 */
export function PostGrid({
  loadPage,
  resetKey,
  initial,
  empty,
  variant = "cards",
}: {
  loadPage: (cursor: string | null, signal: AbortSignal) => Promise<FeedPage>;
  resetKey: string;
  initial?: FeedPage | null;
  empty: ReactNode;
  /** "cards" (Discover: author + actions) or "tiles" (profile: dense cover grid). */
  variant?: "cards" | "tiles";
}) {
  const { watch } = useCommunity();
  const [posts, setPosts] = useState<PostCardData[]>(initial?.posts ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(initial ? "idle" : "loading");
  const [done, setDone] = useState(initial ? !initial.nextCursor : false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const firstKey = useRef(initial ? resetKey : null);

  const fetchMore = useCallback(
    async (from: string | null, replace: boolean) => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      setStatus("loading");
      try {
        const page = await loadPage(from, controller.signal);
        if (controller.signal.aborted) return;
        setPosts((prev) => {
          if (replace) return page.posts;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...page.posts.filter((p) => !seen.has(p.id))];
        });
        setCursor(page.nextCursor);
        setDone(!page.nextCursor);
        setStatus("idle");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setStatus("error");
      }
    },
    [loadPage]
  );

  useEffect(() => {
    if (firstKey.current === resetKey) {
      firstKey.current = null;
      return;
    }
    setPosts([]);
    setDone(false);
    void fetchMore(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const ids = posts.map((p) => p.id);
    watch(ids, []);
    setFeedOrder(ids);
  }, [posts, watch]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || status !== "idle") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void fetchMore(cursor, false);
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, done, status, fetchMore]);

  useEffect(() => () => inflight.current?.abort(), []);

  const showSkeleton = status === "loading" && posts.length === 0;

  if (!showSkeleton && status !== "error" && posts.length === 0 && done) {
    return <>{empty}</>;
  }

  return (
    <>
      <div
        className={
          variant === "tiles"
            ? "grid grid-cols-3 gap-0.5 sm:gap-3 lg:grid-cols-4 lg:gap-4"
            : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
        }
      >
        {posts.map((post, i) =>
          variant === "tiles" ? (
            <PostTile key={post.id} post={post} priority={i < 6} />
          ) : (
            <PostCard key={post.id} post={post} priority={i < 6} />
          )
        )}
        {(showSkeleton || (status === "loading" && posts.length > 0)) &&
          Array.from({ length: showSkeleton ? (variant === "tiles" ? 9 : 10) : 5 }, (_, i) =>
            variant === "tiles" ? <PostTileSkeleton key={`s${i}`} /> : <PostCardSkeleton key={`s${i}`} />
          )}
      </div>
      {status === "error" && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-[14px] text-neutral-500">We couldn&apos;t load posts.</p>
          <button
            type="button"
            onClick={() => void fetchMore(posts.length ? cursor : null, posts.length === 0)}
            className="inline-flex h-9 items-center rounded-full border border-neutral-200 px-4 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Try again
          </button>
        </div>
      )}
      <div ref={sentinel} aria-hidden className="h-px" />
    </>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="community-surface mx-auto flex max-w-md flex-col items-center gap-3 rounded-[24px] px-8 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">{icon}</span>
      <h3 className="community-display text-[20px] text-neutral-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-neutral-500">{body}</p>
      {action}
    </div>
  );
}
