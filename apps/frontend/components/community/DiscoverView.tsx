"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Plus, Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMUNITY_TAGS, FEED_TABS, fetchFeed, type FeedPage, type FeedSort } from "@/lib/community";
import { useCommunity } from "./CommunityProvider";
import { EmptyState, PostGrid } from "./PostGrid";

export function DiscoverView({
  initial,
  initialSort,
  initialTag,
}: {
  initial: FeedPage | null;
  initialSort: FeedSort;
  initialTag: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { getToken, isSignedIn, openComposer, requireSignIn } = useCommunity();
  const [sort, setSort] = useState<FeedSort>(initialSort);
  const [tag, setTag] = useState<string | null>(initialTag);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // "/" jumps to search, like the rest of the app's quick-find fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep tab + tag in the URL so feeds are shareable; search stays local.
  useEffect(() => {
    if (pathname !== "/discover") return;
    const params = new URLSearchParams();
    if (sort !== "trending") params.set("sort", sort);
    if (tag) params.set("tag", tag);
    const next = params.toString();
    if (next !== window.location.search.replace(/^\?/, "")) {
      router.replace(next ? `/discover?${next}` : "/discover", { scroll: false });
    }
  }, [sort, tag, pathname, router]);

  const loadPage = useCallback(
    (cursor: string | null, signal: AbortSignal) => fetchFeed({ sort, tag, q, cursor }, getToken, signal),
    [sort, tag, q, getToken]
  );

  const chooseSort = (next: FeedSort) => {
    if (next === "following" && !requireSignIn()) return;
    setSort(next);
  };

  const followingLocked = sort === "following" && !isSignedIn;

  return (
    <main className="px-3 pb-24 pt-8 sm:px-4 sm:pt-12 md:px-[clamp(16px,4vw,56px)]">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-400">Community</p>
          <h1 className="community-display mt-2 text-[40px] leading-[1.05] text-neutral-900 sm:text-[52px]">
            Discover what people build
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-neutral-500 sm:text-[17px]">
            3D models made with Hydrilla and shared by their creators. Open any model to inspect it in 3D.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openComposer()}
          className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-neutral-900 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-700 md:self-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Share a model
        </button>
      </section>

      <div className="sticky top-14 z-30 -mx-3 mt-8 border-b border-neutral-200/60 bg-[color-mix(in_srgb,var(--app-canvas)_88%,transparent)] px-3 py-2.5 backdrop-blur-xl sm:-mx-4 sm:px-4 md:-mx-[clamp(16px,4vw,56px)] md:px-[clamp(16px,4vw,56px)]">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
          <div role="tablist" aria-label="Feed" className="flex shrink-0 items-center gap-1">
            {FEED_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={sort === t.id}
                onClick={() => chooseSort(t.id)}
                className={cn(
                  "relative h-9 rounded-full px-3 text-[14px] font-medium transition-colors hover:bg-neutral-100",
                  "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  sort === t.id
                    ? "text-neutral-900 after:bg-neutral-900"
                    : "text-neutral-500 after:bg-transparent hover:text-neutral-900"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span aria-hidden className="hidden h-5 w-px bg-neutral-200 lg:block" />

          <div className="hide-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,transparent,#000_8px,#000_calc(100%-24px),transparent)]">
            <button type="button" className="community-chip" data-active={tag === null} onClick={() => setTag(null)}>
              All
            </button>
            {COMMUNITY_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="community-chip"
                data-active={tag === t.id}
                onClick={() => setTag(tag === t.id ? null : t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="relative flex h-9 w-full shrink-0 items-center lg:w-64">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models"
              aria-keyshortcuts="/"
              maxLength={80}
              className="h-full w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-8 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
            />
            {!search && (
              <kbd
                aria-hidden
                className="pointer-events-none absolute right-2.5 hidden h-5 min-w-5 items-center justify-center rounded-md border border-neutral-200 px-1 text-[11px] font-medium text-neutral-400 lg:flex"
              >
                /
              </kbd>
            )}
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>
      </div>

      <div className="mt-6">
        {followingLocked ? null : (
          <PostGrid
            loadPage={loadPage}
            resetKey={`${sort}|${tag ?? ""}|${q}`}
            initial={initial && sort === initialSort && tag === initialTag && !q ? initial : null}
            empty={
              sort === "following" ? (
                <EmptyState
                  icon={<Users className="h-5 w-5" />}
                  title="Nothing from people you follow yet"
                  body="Follow creators from their profile or any post, and their new models show up here."
                  action={
                    <button type="button" className="community-chip mt-2" onClick={() => setSort("trending")}>
                      Browse trending
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Compass className="h-5 w-5" />}
                  title={q || tag ? "No models match" : "Be the first to share"}
                  body={
                    q || tag
                      ? "Try another tag or search term."
                      : "Share a model from your assets and it will appear here for everyone."
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => openComposer()}
                      className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[13px] font-semibold text-white hover:bg-neutral-700"
                    >
                      <Plus className="h-4 w-4" />
                      Share a model
                    </button>
                  }
                />
              )
            }
          />
        )}
      </div>
    </main>
  );
}
