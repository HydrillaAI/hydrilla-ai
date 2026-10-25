"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, MessageCircle, SendHorizontal, Trash2 } from "lucide-react";
import {
  deleteComment,
  fetchComments,
  postComment,
  profilePath,
  timeAgo,
  type PostComment,
} from "@/lib/community";
import { track } from "@/lib/analytics";
import { useCommunity } from "./CommunityProvider";
import { ReportDialog } from "./ReportDialog";
import { UserAvatar } from "./UserAvatar";

export function PostComments({
  postId,
  initialCount,
  isPostOwner,
  onCountChange,
}: {
  postId: string;
  initialCount: number;
  isPostOwner: boolean;
  onCountChange: (count: number) => void;
}) {
  const { me, isSignedIn, getToken, requireSignIn } = useCommunity();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(initialCount);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState<string | null>(null);

  const load = useCallback(
    async (from: string | null) => {
      setLoading(true);
      try {
        const page = await fetchComments(postId, from);
        setComments((prev) => (from ? [...prev, ...page.comments] : page.comments));
        setCursor(page.nextCursor);
      } catch {
        // keep whatever loaded
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const updateCount = (n: number) => {
    setCount(n);
    onCountChange(n);
  };

  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    if (!requireSignIn()) return;
    setSending(true);
    setError(null);
    try {
      const comment = await postComment(getToken, postId, body);
      setComments((prev) => [comment, ...prev]);
      setDraft("");
      updateCount(count + 1);
      track("community_comment_created", { post_id: postId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post your comment");
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    const before = comments;
    setComments((prev) => prev.filter((c) => c.id !== id));
    updateCount(Math.max(0, count - 1));
    try {
      await deleteComment(getToken, id);
    } catch {
      setComments(before);
      updateCount(count);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h2 className="px-5 pt-4 text-[15px] font-semibold text-neutral-900">
        {count} {count === 1 ? "Comment" : "Comments"}
      </h2>

      <div className="min-h-[120px] flex-1 overflow-y-auto px-5 py-3 scrollbar-minimal">
        {comments.length === 0 && !loading ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center text-neutral-400">
            <MessageCircle className="h-5 w-5" />
            <p className="text-[13px]">No comments yet. Say something nice.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((c) => {
              const mine = me?.username === c.author.username;
              return (
                <li key={c.id} className="group flex gap-3">
                  <Link href={profilePath(c.author.username)} className="shrink-0">
                    <UserAvatar user={c.author} size={30} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={profilePath(c.author.username)}
                        className="truncate text-[13px] font-semibold text-neutral-900 hover:underline"
                      >
                        {c.author.displayName}
                      </Link>
                      <span className="shrink-0 text-[11px] text-neutral-400">{timeAgo(c.createdAt)}</span>
                      <span className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        {(mine || isPostOwner) && (
                          <button
                            type="button"
                            onClick={() => void remove(c.id)}
                            aria-label="Delete comment"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {!mine && isSignedIn && (
                          <button
                            type="button"
                            onClick={() => setReporting(c.id)}
                            aria-label="Report comment"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-neutral-700">
                      {c.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {cursor && (
          <button
            type="button"
            disabled={loading}
            onClick={() => void load(cursor)}
            className="mt-4 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
          >
            {loading ? "Loading…" : "Show more comments"}
          </button>
        )}
      </div>

      <form
        className="border-t border-neutral-200/70 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-[18px] border border-neutral-200 bg-white px-3 py-2 focus-within:border-neutral-400">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => !isSignedIn && requireSignIn()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder={isSignedIn ? "Add a comment…" : "Sign in to comment"}
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Post comment"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-opacity hover:bg-neutral-700 disabled:opacity-30"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-1.5 px-1 text-[12px] text-red-600">{error}</p>}
      </form>

      {reporting && (
        <ReportDialog
          open
          onOpenChange={(open) => !open && setReporting(null)}
          targetType="comment"
          targetId={reporting}
        />
      )}
    </section>
  );
}
