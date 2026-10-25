"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { fetchFollowEdges, profilePath, type AuthorSummary } from "@/lib/community";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { UserAvatar } from "./UserAvatar";

export function FollowListDialog({
  username,
  direction,
  onOpenChange,
}: {
  username: string;
  direction: "followers" | "following";
  onOpenChange: (open: boolean) => void;
}) {
  const [users, setUsers] = useState<AuthorSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (from: string | null) => {
    setLoading(true);
    try {
      const page = await fetchFollowEdges(username, direction, from);
      setUsers((prev) => (from ? [...prev, ...page.users] : page.users));
      setCursor(page.nextCursor);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, direction]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-sm flex-col">
        <div className="px-5 pb-2 pt-5">
          <DialogTitle className="community-display text-[18px] capitalize">{direction}</DialogTitle>
          <DialogDescription className="sr-only">
            {direction === "followers" ? `People following @${username}` : `People @${username} follows`}
          </DialogDescription>
        </div>
        <div className="max-h-[60vh] min-h-[160px] overflow-y-auto px-2 pb-3 scrollbar-minimal">
          {users.length === 0 && !loading && (
            <p className="px-3 py-10 text-center text-[13px] text-neutral-500">
              {direction === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          )}
          <ul>
            {users.map((u) => (
              <li key={u.username}>
                <Link
                  href={profilePath(u.username)}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-neutral-50"
                >
                  <UserAvatar user={u} size={36} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-neutral-900">{u.displayName}</span>
                    <span className="block truncate text-[12px] text-neutral-500">@{u.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          )}
          {cursor && !loading && (
            <button
              type="button"
              onClick={() => void load(cursor)}
              className="mx-3 mt-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
            >
              Show more
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
