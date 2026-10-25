"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Check, Download, Eye, Flag, Heart, Link2, MessageCircle, Sparkles, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadGlbWithAuth, getProxyGlbUrl } from "@/lib/api";
import {
  deleteCommunityPost,
  formatCount,
  LICENSES,
  profilePath,
  recordPostView,
  timeAgo,
  type PostDetail,
} from "@/lib/community";
import { useCommunity } from "./CommunityProvider";
import { PostComments } from "./PostComments";
import { PostStage } from "./PostStage";
import { ReportDialog } from "./ReportDialog";
import { UserAvatar } from "./UserAvatar";

const VIEWED_KEY = "hyd:community:viewed";

/** Count one view per post per browser session. */
function useRecordView(postId: string) {
  useEffect(() => {
    try {
      const seen = new Set<string>(JSON.parse(sessionStorage.getItem(VIEWED_KEY) || "[]"));
      if (seen.has(postId)) return;
      seen.add(postId);
      sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...seen].slice(-200)));
    } catch {
      // storage unavailable: still count it
    }
    void recordPostView(postId);
  }, [postId]);
}

export function PostView({ post, variant = "page" }: { post: PostDetail; variant?: "page" | "modal" }) {
  const router = useRouter();
  const {
    me,
    getToken,
    watch,
    isLiked,
    isSaved,
    isOwned,
    isFollowing,
    counts,
    toggleLike,
    toggleSave,
    toggleFollow,
    isSignedIn,
  } = useCommunity();
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Phones show one pane at a time; from lg up both sit side by side and this is ignored.
  const [pane, setPane] = useState<"model" | "details">("model");

  useRecordView(post.id);
  useEffect(() => setPane("model"), [post.id]);
  useEffect(() => watch([post.id], [post.author.username]), [post.id, post.author.username, watch]);

  const base = { likeCount: post.likeCount, saveCount: post.saveCount };
  const { likeCount, saveCount } = counts(post.id, base);
  const liked = isLiked(post.id);
  const saved = isSaved(post.id);
  const isSelf = me?.username === post.author.username;
  const owner = isSelf || isOwned(post.id);
  const following = isFollowing(post.author.username);
  const license = LICENSES.find((l) => l.id === post.license);
  const firstModel = post.items.find((i) => i.kind === "model");

  const share = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: post.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // user dismissed the share sheet
    }
  };

  const download = () => {
    if (!firstModel || firstModel.kind !== "model") return;
    const safe = post.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "model";
    void downloadGlbWithAuth(getProxyGlbUrl(firstModel.jobId), `${safe}.glb`, getToken).catch((err) =>
      alert(err instanceof Error ? err.message : "Download failed")
    );
  };

  const remove = async () => {
    if (!window.confirm("Delete this post? The model stays in your assets.")) return;
    setDeleting(true);
    try {
      await deleteCommunityPost(getToken, post.id);
      router.replace(profilePath(post.author.username));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete the post");
      setDeleting(false);
    }
  };

  const actionClass =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium tabular-nums transition-colors hover:bg-neutral-100";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-3",
        variant === "page" ? "h-[calc(100dvh-64px-24px)] lg:h-[calc(100dvh-64px-32px)]" : "h-full"
      )}
    >
      <div className={cn("relative min-h-0 flex-1 lg:h-full", pane !== "model" && "hidden lg:block")}>
        <PostStage
          items={post.items}
          title={post.title}
          footer={
            <div className="flex items-center gap-1 rounded-[20px] border border-white/50 bg-white/85 p-1.5 pl-2 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setPane("details")}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[14px] py-1 text-left"
              >
                <UserAvatar user={post.author} size={36} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold leading-tight text-neutral-900">{post.title}</span>
                  <span className="block truncate text-[12px] text-neutral-500">
                    {post.author.displayName} · {timeAgo(post.publishedAt)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleLike(post.id, base)}
                aria-pressed={liked}
                aria-label={liked ? "Unlike" : "Like"}
                className={cn(
                  "flex h-11 min-w-11 flex-col items-center justify-center rounded-[14px] px-1.5 text-[11px] font-medium tabular-nums",
                  liked ? "text-rose-500" : "text-neutral-600"
                )}
              >
                <Heart className="h-[18px] w-[18px]" fill={liked ? "currentColor" : "none"} />
                {formatCount(likeCount)}
              </button>
              <button
                type="button"
                onClick={() => toggleSave(post.id, base)}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save"}
                className={cn(
                  "flex h-11 min-w-11 flex-col items-center justify-center rounded-[14px] px-1.5 text-[11px] font-medium tabular-nums",
                  saved ? "text-amber-500" : "text-neutral-600"
                )}
              >
                <Star className="h-[18px] w-[18px]" fill={saved ? "currentColor" : "none"} />
                {formatCount(saveCount)}
              </button>
            </div>
          }
        />
      </div>

      <aside
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scrollbar-minimal lg:overflow-visible",
          pane !== "details" && "hidden lg:flex"
        )}
      >
        <div className="community-surface flex items-center gap-3 rounded-[20px] px-4 py-3.5">
          <Link href={profilePath(post.author.username)} className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar user={post.author} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold text-neutral-900">{post.author.displayName}</span>
              <span className="block truncate text-[12px] text-neutral-500">
                @{post.author.username} · {timeAgo(post.publishedAt)}
              </span>
            </span>
          </Link>
          {!isSelf && (
            <button
              type="button"
              onClick={() => void toggleFollow(post.author.username)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors",
                following
                  ? "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  : "bg-neutral-900 text-white hover:bg-neutral-700"
              )}
            >
              {following && <Check className="h-3.5 w-3.5" />}
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="community-surface rounded-[20px] px-5 py-4">
          <div className="flex items-start gap-2">
            <h1 className="community-display min-w-0 flex-1 break-words text-[22px] leading-tight text-neutral-900">
              {post.title}
            </h1>
            {post.featured && (
              <span className="mt-1 inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-[var(--hyd-100)] px-2.5 text-[11px] font-semibold text-neutral-800">
                <Sparkles className="h-3 w-3" />
                Staff pick
              </span>
            )}
          </div>
          {post.description && (
            <p className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-neutral-600">
              {post.description}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/discover?tag=${encodeURIComponent(t)}`}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12px] text-neutral-600 hover:text-neutral-900"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
          {post.prompt && (
            <div className="mt-3 rounded-2xl bg-neutral-50 px-3.5 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">Prompt</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-700">{post.prompt}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-0.5 border-t border-neutral-200/70 pt-3">
            <button
              type="button"
              onClick={() => toggleLike(post.id, base)}
              aria-pressed={liked}
              className={cn(actionClass, liked ? "text-rose-500" : "text-neutral-600")}
            >
              <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
              {formatCount(likeCount)}
            </button>
            <button
              type="button"
              onClick={() => toggleSave(post.id, base)}
              aria-pressed={saved}
              className={cn(actionClass, saved ? "text-amber-500" : "text-neutral-600")}
            >
              <Star className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
              {formatCount(saveCount)}
            </button>
            <span className={cn(actionClass, "pointer-events-none text-neutral-600")}>
              <MessageCircle className="h-4 w-4" />
              {formatCount(commentCount)}
            </span>
            <span className={cn(actionClass, "pointer-events-none text-neutral-400")} title="Views">
              <Eye className="h-4 w-4" />
              {formatCount(post.viewCount)}
            </span>
            <span className="ml-auto flex items-center gap-0.5">
              {isSignedIn && !owner && (
                <button
                  type="button"
                  onClick={() => setReporting(true)}
                  aria-label="Report post"
                  title="Report"
                  className={cn(actionClass, "w-9 justify-center px-0 text-neutral-400 hover:text-neutral-700")}
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
              {owner && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void remove()}
                  aria-label="Delete post"
                  title="Delete post"
                  className={cn(actionClass, "w-9 justify-center px-0 text-neutral-400 hover:text-red-600")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={() => void share()} className={cn(actionClass, "text-neutral-700")}>
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                {copied ? "Copied" : "Share"}
              </button>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-neutral-500">
            {license && (
              <span className="rounded-full border border-neutral-200 px-2.5 py-1" title={license.summary}>
                {license.label}
              </span>
            )}
            {post.allowDownload && firstModel && (
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-700 hover:bg-neutral-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download GLB
              </button>
            )}
            <Link
              href={isSignedIn ? "/app/studio" : "/sign-up"}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--hyd-100)] px-3 py-1 font-medium text-neutral-800 hover:bg-[var(--hyd-200)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create with Hydrilla
            </Link>
          </div>
        </div>

        <div className="community-surface flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[20px] lg:min-h-0">
          <PostComments
            postId={post.id}
            initialCount={post.commentCount}
            isPostOwner={owner}
            onCountChange={setCommentCount}
          />
        </div>
      </aside>

      <div
        role="tablist"
        aria-label="Post view"
        className="grid shrink-0 grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {(
          [
            { id: "model", label: "3D view", icon: Box },
            { id: "details", label: "Details", icon: MessageCircle },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={pane === tab.id}
            onClick={() => setPane(tab.id)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors",
              pane === tab.id
                ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                : "text-neutral-500"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === "details" && commentCount > 0 && (
              <span className="rounded-full bg-neutral-900 px-1.5 py-px text-[10px] tabular-nums text-white">
                {formatCount(commentCount)}
              </span>
            )}
          </button>
        ))}
      </div>

      {reporting && <ReportDialog open onOpenChange={setReporting} targetType="post" targetId={post.id} />}
    </div>
  );
}
