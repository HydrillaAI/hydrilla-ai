/**
 * Community (Discover, posts, @profiles) — types and backend calls.
 * Public reads also run on the server (lib/community-server.ts); mutations take Clerk's getToken.
 */

const RAW_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://hydrilla-ai-g1bm.vercel.app";
export const COMMUNITY_API = `${RAW_BACKEND.replace(/\/+$/, "")}/api/community`;

export type GetToken = () => Promise<string | null>;

export type AuthorSummary = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type PublicProfile = AuthorSummary & {
  bio: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  joinedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

export type OwnProfile = PublicProfile & {
  usernameIsAuto: boolean;
  usernameChangeAvailableAt: string | null;
  /** Models the one-time launch backfill shared for this owner (view-only); 0 once removed. */
  autoSharedCount?: number;
};

export type FeedSort = "trending" | "newest" | "featured" | "following";

export type PostCard = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  tags: string[];
  likeCount: number;
  saveCount: number;
  commentCount: number;
  viewCount: number;
  itemCount: number;
  featured: boolean;
  publishedAt: string;
  author: AuthorSummary;
};

export type PostItem =
  | { id: string; position: number; kind: "model"; jobId: string; engine: string | null }
  | { id: string; position: number; kind: "image"; imageUrl: string };

export type PostDetail = PostCard & {
  description: string;
  license: PostLicense;
  allowDownload: boolean;
  prompt: string | null;
  updatedAt: string;
  items: PostItem[];
};

export type PostComment = {
  id: string;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
  author: AuthorSummary;
};

export type Page<T, K extends string> = { [P in K]: T[] } & { nextCursor: string | null };
export type FeedPage = Page<PostCard, "posts">;

export type ViewerState = { liked: string[]; saved: string[]; owned: string[]; following: string[] };

export type PostLicense = "cc0" | "cc-by-4.0" | "cc-by-nc-4.0" | "all-rights-reserved";

export const LICENSES: { id: PostLicense; label: string; summary: string }[] = [
  { id: "cc-by-nc-4.0", label: "CC BY-NC 4.0", summary: "Others must credit you; no commercial use" },
  { id: "cc-by-4.0", label: "CC BY 4.0", summary: "Others must credit you; commercial use allowed" },
  { id: "cc0", label: "CC0", summary: "No rights reserved; free for any use" },
  { id: "all-rights-reserved", label: "All rights reserved", summary: "View only; no reuse without permission" },
];

/** Discover filter chips. Values are the tags stored on posts. */
export const COMMUNITY_TAGS: { id: string; label: string }[] = [
  { id: "characters", label: "Characters" },
  { id: "creatures", label: "Creatures" },
  { id: "props", label: "Props" },
  { id: "weapons", label: "Weapons" },
  { id: "vehicles", label: "Vehicles" },
  { id: "environments", label: "Environments" },
  { id: "architecture", label: "Architecture" },
  { id: "game-ready", label: "Game-ready" },
  { id: "3d-print", label: "3D print" },
];

export const FEED_TABS: { id: FeedSort; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "featured", label: "Staff picks" },
  { id: "following", label: "Following" },
];

export class CommunityApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; getToken?: GetToken; signal?: AbortSignal } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.getToken) {
    const token = await init.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${COMMUNITY_API}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: init.signal,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CommunityApiError(data?.error || "Something went wrong. Please try again.", res.status, data?.code);
  }
  return data as T;
}

function query(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ── Reads ──────────────────────────────────────────────────────────────────

export function fetchFeed(
  opts: { sort: FeedSort; tag?: string | null; q?: string | null; cursor?: string | null; limit?: number },
  getToken?: GetToken,
  signal?: AbortSignal
) {
  return request<FeedPage>(
    `/posts${query({ sort: opts.sort, tag: opts.tag, q: opts.q, cursor: opts.cursor, limit: opts.limit ?? 24 })}`,
    { getToken: opts.sort === "following" ? getToken : undefined, signal }
  );
}

export function fetchUserPosts(username: string, cursor?: string | null) {
  return request<FeedPage>(`/users/${encodeURIComponent(username)}/posts${query({ cursor })}`);
}

export function fetchSavedPosts(getToken: GetToken, cursor?: string | null) {
  return request<FeedPage>(`/me/saved${query({ cursor })}`, { getToken });
}

export function fetchComments(postId: string, cursor?: string | null) {
  return request<Page<PostComment, "comments">>(`/posts/${postId}/comments${query({ cursor })}`);
}

export function fetchFollowEdges(username: string, direction: "followers" | "following", cursor?: string | null) {
  return request<Page<AuthorSummary, "users">>(
    `/users/${encodeURIComponent(username)}/${direction}${query({ cursor })}`
  );
}

export function fetchViewerState(getToken: GetToken, postIds: string[], usernames: string[]) {
  return request<ViewerState>(
    `/viewer-state${query({ postIds: postIds.join(","), usernames: usernames.join(",") })}`,
    { getToken }
  );
}

export async function fetchOwnProfile(getToken: GetToken) {
  return (await request<{ profile: OwnProfile }>("/me/profile", { getToken })).profile;
}

export function checkUsername(getToken: GetToken, username: string, signal?: AbortSignal) {
  return request<{ available: boolean; username: string; reason: string | null }>(
    `/usernames/${encodeURIComponent(username)}/availability`,
    { getToken, signal }
  );
}

// ── Writes ─────────────────────────────────────────────────────────────────

export type ProfilePatch = Partial<{
  username: string;
  displayName: string | null;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
}>;

export async function updateOwnProfile(getToken: GetToken, patch: ProfilePatch) {
  return (await request<{ profile: OwnProfile }>("/me/profile", { method: "PATCH", body: patch, getToken })).profile;
}

export type NewPostItem = { kind: "model"; jobId: string } | { kind: "image"; imageUrl: string };

export type NewPost = {
  title: string;
  description: string;
  tags: string[];
  license: PostLicense;
  allowDownload: boolean;
  showPrompt: boolean;
  coverImageUrl: string | null;
  items: NewPostItem[];
};

export async function createCommunityPost(getToken: GetToken, post: NewPost) {
  return (await request<{ post: PostDetail }>("/posts", { method: "POST", body: post, getToken })).post;
}

export function deleteCommunityPost(getToken: GetToken, postId: string) {
  return request<{ ok: true }>(`/posts/${postId}`, { method: "DELETE", getToken });
}

export function setPostReaction(getToken: GetToken, postId: string, reaction: "like" | "save", on: boolean) {
  return request<{ likeCount: number; saveCount: number }>(`/posts/${postId}/${reaction}`, {
    method: on ? "PUT" : "DELETE",
    getToken,
  });
}

export async function setFollowing(getToken: GetToken, username: string, on: boolean) {
  return (
    await request<{ profile: PublicProfile }>(`/users/${encodeURIComponent(username)}/follow`, {
      method: on ? "PUT" : "DELETE",
      getToken,
    })
  ).profile;
}

export async function postComment(getToken: GetToken, postId: string, body: string) {
  return (await request<{ comment: PostComment }>(`/posts/${postId}/comments`, { method: "POST", body: { body }, getToken }))
    .comment;
}

export function deleteComment(getToken: GetToken, commentId: string) {
  return request<{ ok: true }>(`/comments/${commentId}`, { method: "DELETE", getToken });
}

export type ReportReason = "spam" | "nsfw" | "violence" | "harassment" | "copyright" | "other";

export function reportContent(
  getToken: GetToken,
  report: { targetType: "post" | "comment" | "user"; targetId: string; reason: ReportReason; details?: string }
) {
  return request<{ ok: true }>("/reports", { method: "POST", body: report, getToken });
}

/** Removes every post the launch backfill published for the signed-in owner. */
export async function unpublishAutoShared(getToken: GetToken) {
  return (await request<{ removed: number }>("/me/backfill", { method: "DELETE", getToken })).removed;
}

/** Offers a front-view render as the cover of an auto-shared post; a no-op (204) when none matches. */
export function refreshAutoSharedCover(getToken: GetToken, jobId: string, dataUrl: string) {
  return request<{ ok: true } | undefined>("/me/backfill/cover", {
    method: "PUT",
    body: { jobId, dataUrl },
    getToken,
  }).catch(() => undefined);
}

export function recordPostView(postId: string) {
  return request<void>(`/posts/${postId}/view`, { method: "POST" }).catch(() => undefined);
}

/** Uploads a data URL under the caller's own community/ prefix and returns its public URL. */
export async function uploadCommunityImage(
  getToken: GetToken,
  kind: "avatar" | "banner" | "cover" | "image",
  dataUrl: string
) {
  return (await request<{ url: string }>("/uploads", { method: "POST", body: { kind, dataUrl }, getToken })).url;
}

// ── Presentation helpers ───────────────────────────────────────────────────

export function profilePath(username: string): string {
  return `/@${username}`;
}

export function postPath(id: string): string {
  return `/posts/${id}`;
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const steps: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let value = seconds;
  for (const [size, unit] of steps) {
    if (value < size) {
      const n = Math.floor(value);
      if (unit === "second") return "just now";
      return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
    }
    value /= size;
  }
  return "";
}

export function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Deterministic banner when a profile has none: two brand-adjacent hues from the handle. */
export function profileGradient(username: string): string {
  let hash = 0;
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  // Hues stay in the cool brand band (teal → blue → violet) so every banner sits with the UI.
  const a = 180 + (Math.abs(hash) % 90);
  const b = a + 25 + (Math.abs(hash >> 8) % 35);
  return [
    `radial-gradient(120% 140% at 85% 0%, hsl(${b} 70% 72% / 0.55) 0%, transparent 55%)`,
    `radial-gradient(90% 120% at 0% 100%, hsl(${a} 60% 55% / 0.45) 0%, transparent 60%)`,
    `linear-gradient(135deg, hsl(${a} 45% 18%) 0%, hsl(${(a + b) / 2} 50% 28%) 55%, hsl(${b} 45% 40%) 100%)`,
  ].join(", ");
}
