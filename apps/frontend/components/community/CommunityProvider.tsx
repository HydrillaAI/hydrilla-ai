"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  fetchOwnProfile,
  fetchViewerState,
  setFollowing,
  setPostReaction,
  type GetToken,
  type OwnProfile,
} from "@/lib/community";
import { track } from "@/lib/analytics";

const PostComposerDialog = dynamic(
  () => import("./PostComposerDialog").then((m) => ({ default: m.PostComposerDialog })),
  { ssr: false }
);

type Counts = { likeCount: number; saveCount: number };

type CommunityContextValue = {
  isSignedIn: boolean;
  getToken: GetToken;
  me: OwnProfile | null;
  /** True once the signed-in profile request has finished (successfully or not). */
  meLoaded: boolean;
  setMe: (profile: OwnProfile) => void;
  /** Report posts/authors on screen; viewer flags for them load in one batched request. */
  watch: (postIds: string[], usernames: string[]) => void;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  isOwned: (postId: string) => boolean;
  isFollowing: (username: string) => boolean;
  counts: (postId: string, fallback: Counts) => Counts;
  toggleLike: (postId: string, fallback: Counts) => void;
  toggleSave: (postId: string, fallback: Counts) => void;
  toggleFollow: (username: string) => Promise<void>;
  openComposer: (jobIds?: string[]) => void;
  /** Sends signed-out visitors to sign in and back; returns false when that happened. */
  requireSignIn: () => boolean;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function useCommunity(): CommunityContextValue {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used inside <CommunityProvider>");
  return ctx;
}

function toggled(set: Set<string>, key: string, on: boolean): Set<string> {
  const next = new Set(set);
  if (on) next.add(key);
  else next.delete(key);
  return next;
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { isSignedIn = false, isLoaded, getToken: clerkGetToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const getToken = useCallback<GetToken>(async () => (await clerkGetToken()) ?? null, [clerkGetToken]);

  const [me, setMe] = useState<OwnProfile | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [following, setFollowingSet] = useState<Set<string>>(new Set());
  const [countOverrides, setCountOverrides] = useState<Record<string, Counts>>({});
  const [composer, setComposer] = useState<{ open: boolean; jobIds: string[] }>({ open: false, jobIds: [] });

  const known = useRef({ posts: new Set<string>(), users: new Set<string>() });
  const pending = useRef({ posts: new Set<string>(), users: new Set<string>() });
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setMe(null);
      setMeLoaded(true);
      return;
    }
    let cancelled = false;
    setMeLoaded(false);
    fetchOwnProfile(getToken)
      .then((profile) => !cancelled && setMe(profile))
      .catch(() => undefined)
      .finally(() => !cancelled && setMeLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  const flush = useCallback(async () => {
    flushTimer.current = null;
    const postIds = [...pending.current.posts];
    const usernames = [...pending.current.users];
    pending.current = { posts: new Set(), users: new Set() };
    if (postIds.length === 0 && usernames.length === 0) return;
    try {
      const state = await fetchViewerState(getToken, postIds, usernames);
      setLiked((s) => new Set([...s, ...state.liked]));
      setSaved((s) => new Set([...s, ...state.saved]));
      setOwned((s) => new Set([...s, ...state.owned]));
      setFollowingSet((s) => new Set([...s, ...state.following]));
    } catch {
      // Flags are cosmetic; buttons still work and reconcile on click.
    }
  }, [getToken]);

  const watch = useCallback(
    (postIds: string[], usernames: string[]) => {
      if (!isSignedIn) return;
      for (const id of postIds) {
        if (!known.current.posts.has(id)) {
          known.current.posts.add(id);
          pending.current.posts.add(id);
        }
      }
      for (const u of usernames) {
        if (!known.current.users.has(u)) {
          known.current.users.add(u);
          pending.current.users.add(u);
        }
      }
      if (!flushTimer.current && (pending.current.posts.size || pending.current.users.size)) {
        flushTimer.current = setTimeout(() => void flush(), 60);
      }
    },
    [isSignedIn, flush]
  );

  // A different account must not inherit the previous viewer's flags.
  useEffect(() => {
    known.current = { posts: new Set(), users: new Set() };
    setLiked(new Set());
    setSaved(new Set());
    setOwned(new Set());
    setFollowingSet(new Set());
  }, [isSignedIn]);

  const requireSignIn = useCallback(() => {
    if (isSignedIn) return true;
    const back = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;
    router.push(`/sign-in?redirect_url=${encodeURIComponent(back || "/discover")}`);
    return false;
  }, [isSignedIn, pathname, router]);

  const counts = useCallback(
    (postId: string, fallback: Counts) => countOverrides[postId] ?? fallback,
    [countOverrides]
  );

  const react = useCallback(
    (postId: string, fallback: Counts, reaction: "like" | "save") => {
      if (!requireSignIn()) return;
      const set = reaction === "like" ? liked : saved;
      const setSet = reaction === "like" ? setLiked : setSaved;
      const on = !set.has(postId);
      const key = reaction === "like" ? "likeCount" : "saveCount";
      const before = countOverrides[postId] ?? fallback;
      setSet((s) => toggled(s, postId, on));
      setCountOverrides((c) => ({ ...c, [postId]: { ...before, [key]: Math.max(0, before[key] + (on ? 1 : -1)) } }));
      setPostReaction(getToken, postId, reaction, on)
        .then((server) => {
          setCountOverrides((c) => ({ ...c, [postId]: server }));
          if (on) track(reaction === "like" ? "community_post_liked" : "community_post_saved", { post_id: postId });
        })
        .catch(() => {
          setSet((s) => toggled(s, postId, !on));
          setCountOverrides((c) => ({ ...c, [postId]: before }));
        });
    },
    [requireSignIn, liked, saved, countOverrides, getToken]
  );

  const toggleFollow = useCallback(
    async (username: string) => {
      if (!requireSignIn()) return;
      const on = !following.has(username);
      setFollowingSet((s) => toggled(s, username, on));
      try {
        await setFollowing(getToken, username, on);
        if (on) track("community_user_followed");
        setMe((prev) => (prev ? { ...prev, followingCount: Math.max(0, prev.followingCount + (on ? 1 : -1)) } : prev));
      } catch {
        setFollowingSet((s) => toggled(s, username, !on));
      }
    },
    [requireSignIn, following, getToken]
  );

  const openComposer = useCallback(
    (jobIds: string[] = []) => {
      if (!requireSignIn()) return;
      setComposer({ open: true, jobIds });
    },
    [requireSignIn]
  );

  const value = useMemo<CommunityContextValue>(
    () => ({
      isSignedIn,
      getToken,
      me,
      meLoaded,
      setMe,
      watch,
      isLiked: (id) => liked.has(id),
      isSaved: (id) => saved.has(id),
      isOwned: (id) => owned.has(id),
      isFollowing: (u) => following.has(u),
      counts,
      toggleLike: (id, fallback) => react(id, fallback, "like"),
      toggleSave: (id, fallback) => react(id, fallback, "save"),
      toggleFollow,
      openComposer,
      requireSignIn,
    }),
    [isSignedIn, getToken, me, meLoaded, watch, liked, saved, owned, following, counts, react, toggleFollow, openComposer, requireSignIn]
  );

  return (
    <CommunityContext.Provider value={value}>
      {children}
      {composer.open && (
        <PostComposerDialog
          open={composer.open}
          initialJobIds={composer.jobIds}
          onOpenChange={(open) => setComposer((c) => ({ ...c, open }))}
        />
      )}
    </CommunityContext.Provider>
  );
}
