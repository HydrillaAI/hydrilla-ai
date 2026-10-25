"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, CalendarDays, Check, Globe, Grid3x3, Link2, Loader2, PenLine, Plus, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  unpublishAutoShared,
  fetchSavedPosts,
  fetchUserPosts,
  formatCount,
  formatJoined,
  profileGradient,
  profilePath,
  type FeedPage,
  type PublicProfile,
} from "@/lib/community";
import { useCommunity } from "./CommunityProvider";
import { EditProfileDialog } from "./EditProfileDialog";
import { FollowListDialog } from "./FollowListDialog";
import { EmptyState, PostGrid } from "./PostGrid";
import { UserAvatar } from "./UserAvatar";

type Tab = "published" | "saved";

/** Number over label on phones (Instagram row), inline "12 followers" from sm up. */
function Stat({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="text-[16px] font-semibold tabular-nums text-neutral-900 sm:text-[15px]">{formatCount(value)}</span>
      <span className="text-[12px] text-neutral-500 sm:text-[15px]">{label}</span>
    </>
  );
  const cls = "flex flex-col items-center leading-tight sm:flex-row sm:items-baseline sm:gap-1.5";
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(cls, "rounded-lg transition-opacity hover:opacity-70")}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function ActionButton({
  children,
  onClick,
  primary = false,
  className,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] px-4 text-[13px] font-semibold transition-colors sm:h-10 sm:rounded-full sm:px-5",
        primary
          ? "bg-neutral-900 text-white hover:bg-neutral-700"
          : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 sm:border sm:border-neutral-200 sm:bg-white sm:hover:bg-neutral-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ProfileView({
  profile: initialProfile,
  initialPosts = null,
  inApp = false,
}: {
  profile: PublicProfile;
  initialPosts?: FeedPage | null;
  /** Rendered at /app/profile inside the app shell (your own profile), not the public /@handle page. */
  inApp?: boolean;
}) {
  const router = useRouter();
  const { me, setMe, getToken, isFollowing, toggleFollow, watch, openComposer } = useCommunity();
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState<Tab>("published");
  const [editing, setEditing] = useState(false);
  const [list, setList] = useState<"followers" | "following" | null>(null);
  const [copied, setCopied] = useState(false);
  const [followDelta, setFollowDelta] = useState(0);
  // Bumped after "Unpublish all" so the Published grid reloads from the server.
  const [gridVersion, setGridVersion] = useState(0);
  const [autoSharedDismissed, setAutoSharedDismissed] = useState(true);
  const [unpublishing, setUnpublishing] = useState(false);
  const dismissKey = `hyd:autoShared:dismissed:${profile.username}`;

  useEffect(() => {
    try {
      setAutoSharedDismissed(localStorage.getItem(dismissKey) === "1");
    } catch {
      setAutoSharedDismissed(false);
    }
  }, [dismissKey]);

  useEffect(() => setProfile(initialProfile), [initialProfile]);
  useEffect(() => setFollowDelta(0), [profile.username, profile.followersCount]);
  useEffect(() => watch([], [profile.username]), [profile.username, watch]);

  const isSelf = me?.username === profile.username;
  // Own counts come from /me (always fresh); everyone else's from the cached page.
  const shown = isSelf && me ? { ...profile, ...me } : profile;
  const following = isFollowing(profile.username);
  const followers = Math.max(0, shown.followersCount + (isSelf ? 0 : followDelta));

  const onFollow = async () => {
    const wasFollowing = following;
    await toggleFollow(profile.username);
    setFollowDelta((d) => d + (wasFollowing ? -1 : 1));
  };

  const share = async () => {
    const url = `${window.location.origin}${profilePath(profile.username)}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: `${shown.displayName} on Hydrilla`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // share sheet dismissed / clipboard blocked
    }
  };

  const loadPublished = useCallback((cursor: string | null) => fetchUserPosts(profile.username, cursor), [profile.username]);
  const loadSaved = useCallback((cursor: string | null) => fetchSavedPosts(getToken, cursor), [getToken]);

  const tabs: { id: Tab; label: string; icon: typeof Grid3x3 }[] = [
    { id: "published", label: "Published", icon: Grid3x3 },
    ...(isSelf ? [{ id: "saved" as const, label: "Saved", icon: Bookmark }] : []),
  ];

  const stats = (
    <>
      <Stat value={shown.postsCount} label={shown.postsCount === 1 ? "post" : "posts"} />
      <Stat value={followers} label={followers === 1 ? "follower" : "followers"} onClick={() => setList("followers")} />
      <Stat value={shown.followingCount} label="following" onClick={() => setList("following")} />
    </>
  );

  const primaryAction = isSelf ? (
    <ActionButton onClick={() => setEditing(true)} className="sm:min-w-[132px]">
      <PenLine className="h-4 w-4" />
      Edit profile
    </ActionButton>
  ) : (
    <ActionButton onClick={() => void onFollow()} primary={!following} className="sm:min-w-[120px]">
      {following ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Following" : "Follow"}
    </ActionButton>
  );

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-[1200px] sm:px-6 sm:pt-5">
        {/* Banner */}
        <div
          className="relative h-[136px] overflow-hidden sm:h-[240px] sm:rounded-[28px]"
          style={shown.bannerUrl ? undefined : { background: profileGradient(profile.username) }}
        >
          {shown.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>

        {/* Header */}
        <section className="px-4 sm:px-8">
          <div className="-mt-11 flex items-end gap-5 sm:-mt-[68px] sm:gap-6">
            <UserAvatar
              user={shown}
              size={136}
              className="!h-[88px] !w-[88px] shrink-0 ring-4 ring-[var(--app-canvas)] shadow-[0_12px_32px_-14px_rgba(0,0,0,0.5)] sm:!h-[136px] sm:!w-[136px] sm:ring-[6px]"
            />
            <div className="grid flex-1 grid-cols-3 pb-1.5 sm:hidden">{stats}</div>
            <div className="ml-auto hidden items-center gap-2 pb-3 sm:flex">
              {primaryAction}
              <ActionButton onClick={() => void share()} label="Share profile" className="w-10 shrink-0 px-0 sm:px-0">
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </ActionButton>
            </div>
          </div>

          <div className="mt-3 sm:mt-5">
            <h1 className="community-display truncate text-[20px] leading-tight text-neutral-900 sm:text-[32px]">
              {shown.displayName}
            </h1>
            <p className="mt-0.5 text-[14px] text-neutral-500 sm:mt-1 sm:text-[15px]">@{profile.username}</p>

            <div className="mt-4 hidden items-center gap-7 sm:flex">{stats}</div>

            {shown.bio && (
              <p className="mt-3 max-w-[560px] whitespace-pre-wrap break-words text-[14px] leading-relaxed text-neutral-800 sm:text-[15px]">
                {shown.bio}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-neutral-500">
              {shown.websiteUrl && (
                <a
                  href={shown.websiteUrl}
                  target="_blank"
                  rel="nofollow ugc noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-1.5 font-medium text-[color-mix(in_srgb,var(--hyd-400)_80%,var(--color-neutral-900))] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{shown.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                </a>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Joined {formatJoined(profile.joinedAt)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
            {primaryAction}
            <ActionButton onClick={() => void share()}>
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Link copied" : "Share profile"}
            </ActionButton>
          </div>

          {isSelf && me && (me.autoSharedCount ?? 0) > 0 && !autoSharedDismissed && (
            <div className="mt-5 flex flex-col gap-3 rounded-[18px] bg-neutral-50 px-4 py-4 ring-1 ring-neutral-200/80 sm:mt-6 sm:max-w-[640px] sm:flex-row sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hyd-100)] text-neutral-800">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">
                  We shared {me.autoSharedCount} of your {me.autoSharedCount === 1 ? "model" : "models"} to the community
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-neutral-600">
                  They&apos;re view-only: downloads off, all rights reserved. Remove any post from its page, or all of them here.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(dismissKey, "1");
                    } catch {
                      // storage blocked: hide for this visit only
                    }
                    setAutoSharedDismissed(true);
                  }}
                  className="h-8 rounded-full px-3.5 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Keep them
                </button>
                <button
                  type="button"
                  disabled={unpublishing}
                  onClick={async () => {
                    const n = me.autoSharedCount ?? 0;
                    if (!window.confirm(`Remove ${n} auto-shared ${n === 1 ? "post" : "posts"} from the community? Posts you shared yourself stay up. Your models stay in Assets.`)) return;
                    setUnpublishing(true);
                    try {
                      const removed = await unpublishAutoShared(getToken);
                      setMe({ ...me, autoSharedCount: 0, postsCount: Math.max(0, me.postsCount - removed) });
                      setGridVersion((v) => v + 1);
                      router.refresh();
                    } catch (err) {
                      window.alert(err instanceof Error ? err.message : "Couldn't remove the posts. Please try again.");
                    } finally {
                      setUnpublishing(false);
                    }
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 text-[12px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                  {unpublishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Unpublish all
                </button>
              </div>
            </div>
          )}

          {isSelf && me?.usernameIsAuto && (
            <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-[var(--hyd-50)] px-4 py-3.5 ring-1 ring-[var(--hyd-200)]/60 sm:mt-6 sm:max-w-[560px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">Claim your username</p>
                <p className="mt-0.5 text-[12px] leading-snug text-neutral-600">
                  You&apos;re <span className="font-medium">@{me.username}</span> for now. Pick the handle people will find you by.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="h-8 shrink-0 rounded-full bg-neutral-900 px-3.5 text-[12px] font-semibold text-white hover:bg-neutral-700"
              >
                Choose
              </button>
            </div>
          )}
        </section>

        {/* Tabs */}
        <nav className="mt-6 border-t border-neutral-200/80 sm:mx-8 sm:mt-10" aria-label="Profile sections">
          <div className="flex justify-center sm:gap-14">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={cn(
                  "-mt-px inline-flex h-12 flex-1 items-center justify-center gap-2 border-t-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors sm:flex-none sm:px-1",
                  tab === t.id ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Grid */}
        <div className="sm:mt-2 sm:px-8">
          {tab === "published" ? (
            <PostGrid
              key={`published:${profile.username}:${gridVersion}`}
              variant="tiles"
              loadPage={loadPublished}
              resetKey={`published:${profile.username}:${gridVersion}`}
              initial={gridVersion === 0 ? initialPosts : null}
              empty={
                <div className="px-4 pt-8">
                  {isSelf ? (
                    <EmptyState
                      icon={<Grid3x3 className="h-5 w-5" />}
                      title="Share your first model"
                      body="Pick a model from your assets and post it. It shows up here and on Discover."
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
                  ) : (
                    <EmptyState
                      icon={<Grid3x3 className="h-5 w-5" />}
                      title="Nothing published yet"
                      body={`When @${profile.username} shares a model, it will show up here.`}
                    />
                  )}
                </div>
              }
            />
          ) : (
            <PostGrid
              key="saved"
              variant="tiles"
              loadPage={loadSaved}
              resetKey="saved"
              empty={
                <div className="px-4 pt-8">
                  <EmptyState
                    icon={<Bookmark className="h-5 w-5" />}
                    title="No saved models"
                    body="Tap the star on any post to save it here. Only you can see what you've saved."
                  />
                </div>
              }
            />
          )}
        </div>
      </div>

      {editing && me && (
        <EditProfileDialog
          open
          onOpenChange={setEditing}
          profile={me}
          onSaved={(next) => {
            setProfile((p) => ({ ...p, ...next }));
            if (!inApp && next.username !== profile.username) router.replace(profilePath(next.username));
            router.refresh();
          }}
        />
      )}
      {list && <FollowListDialog username={profile.username} direction={list} onOpenChange={(o) => !o && setList(null)} />}
    </main>
  );
}
