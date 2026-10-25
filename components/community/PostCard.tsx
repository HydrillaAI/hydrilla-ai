"use client";

import Link from "next/link";
import { Box, Heart, Layers, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCount, postPath, profilePath, type PostCard as PostCardData } from "@/lib/community";
import { useCommunity } from "./CommunityProvider";
import { UserAvatar } from "./UserAvatar";

export function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  const { isLiked, isSaved, counts, toggleLike, toggleSave } = useCommunity();
  const base = { likeCount: post.likeCount, saveCount: post.saveCount };
  const { likeCount, saveCount } = counts(post.id, base);
  const liked = isLiked(post.id);
  const saved = isSaved(post.id);

  return (
    <article className="community-surface group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5">
      <Link
        href={postPath(post.id)}
        scroll={false}
        className="community-stage relative block aspect-[3/4] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--hyd-sky)]"
        aria-label={post.title}
      >
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-400">
            <Box className="h-8 w-8" strokeWidth={1.4} />
          </span>
        )}

        <span className="absolute left-3 top-3 flex items-center gap-1.5">
          {post.featured && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-scrim/55 px-2.5 text-[11px] font-semibold text-on-scrim backdrop-blur-md">
              <Sparkles className="h-3 w-3" strokeWidth={2.2} />
              Staff pick
            </span>
          )}
          {post.itemCount > 1 && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-scrim/55 px-2 text-[11px] font-semibold text-on-scrim backdrop-blur-md">
              <Layers className="h-3 w-3" strokeWidth={2.2} />
              {post.itemCount}
            </span>
          )}
        </span>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-4 pb-3.5 pt-14 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-white">{post.title}</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 px-3.5 py-3">
        <Link
          href={profilePath(post.author.username)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full text-neutral-700 transition-colors hover:text-neutral-900"
        >
          <UserAvatar user={post.author} size={24} />
          <span className="truncate text-[13px] font-medium">{post.author.displayName}</span>
        </Link>
        <button
          type="button"
          onClick={() => toggleLike(post.id, base)}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2 text-[12px] tabular-nums transition-colors hover:bg-neutral-100",
            liked ? "text-rose-500" : "text-neutral-500"
          )}
        >
          <Heart className="h-[15px] w-[15px]" strokeWidth={2} fill={liked ? "currentColor" : "none"} />
          {formatCount(likeCount)}
        </button>
        <button
          type="button"
          onClick={() => toggleSave(post.id, base)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2 text-[12px] tabular-nums transition-colors hover:bg-neutral-100",
            saved ? "text-amber-500" : "text-neutral-500"
          )}
        >
          <Star className="h-[15px] w-[15px]" strokeWidth={2} fill={saved ? "currentColor" : "none"} />
          {formatCount(saveCount)}
        </button>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="community-surface overflow-hidden rounded-[20px]">
      <div className="studio-skeleton aspect-[3/4]" />
      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="studio-skeleton h-6 w-6 rounded-full" />
        <div className="studio-skeleton h-3 w-24 rounded-full" />
      </div>
    </div>
  );
}

/** Profile grid tile: cover only, counts on hover (Instagram-style), no author footer. */
export function PostTile({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  const { counts } = useCommunity();
  const { likeCount, saveCount } = counts(post.id, { likeCount: post.likeCount, saveCount: post.saveCount });

  return (
    <Link
      href={postPath(post.id)}
      aria-label={post.title}
      className="community-stage group relative block aspect-[3/4] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--hyd-sky)] sm:rounded-[16px]"
    >
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-neutral-400">
          <Box className="h-7 w-7" strokeWidth={1.4} />
        </span>
      )}

      <span className="absolute right-2 top-2 flex items-center gap-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {post.featured && <Sparkles className="h-4 w-4" strokeWidth={2.2} />}
        {post.itemCount > 1 && <Layers className="h-4 w-4" strokeWidth={2.2} />}
      </span>

      <span className="absolute inset-0 hidden flex-col items-center justify-center gap-3 bg-black/40 px-4 text-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:flex">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug">{post.title}</span>
        <span className="flex items-center gap-5 text-[14px] font-semibold tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-[18px] w-[18px]" fill="currentColor" />
            {formatCount(likeCount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-[18px] w-[18px]" fill="currentColor" />
            {formatCount(saveCount)}
          </span>
        </span>
      </span>
    </Link>
  );
}

export function PostTileSkeleton() {
  return <div className="studio-skeleton aspect-[3/4] sm:rounded-[16px]" />;
}
