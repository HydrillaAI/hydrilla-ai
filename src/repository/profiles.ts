import { supabase } from "../db.js";
import { syncUserToDatabase } from "../middleware/auth.js";
import { publicUrlForS3Key } from "../lib/s3Upload.js";
import { usernameSchema, type UpdateProfileBody } from "../routes/communitySchemas.js";

/** Thrown for expected failures; the router maps `status` straight to the response. */
export class CommunityError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export const USERNAME_COOLDOWN_DAYS = 30;

/** Never select email / first_name / last_name into anything public. */
export const PROFILE_COLUMNS =
  "id, username, username_updated_at, display_name, bio, avatar_url, image_url, banner_url, website_url, community_status, followers_count, following_count, published_posts_count, created_at";

/** Embedded author shape for posts and comments (PostgREST resource embedding). */
export const AUTHOR_COLUMNS = "username, display_name, avatar_url, image_url, community_status";

export type ProfileRow = {
  id: string;
  username: string;
  username_updated_at: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  image_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  community_status: "active" | "suspended";
  followers_count: number;
  following_count: number;
  published_posts_count: number;
  created_at: string;
};

export type AuthorRow = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  image_url: string | null;
  community_status?: string;
};

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
  /** Published posts created by the one-time backfill (sql/028b) that the owner hasn't removed. */
  autoSharedCount: number;
};

export function toAuthorSummary(row: AuthorRow): AuthorSummary {
  return {
    username: row.username,
    displayName: row.display_name?.trim() || row.username,
    avatarUrl: row.avatar_url || row.image_url || null,
  };
}

export function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    ...toAuthorSummary(row),
    bio: row.bio,
    bannerUrl: row.banner_url,
    websiteUrl: row.website_url,
    joinedAt: row.created_at,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    postsCount: row.published_posts_count,
  };
}

function usernameChangeAvailableAt(row: ProfileRow): string | null {
  if (!row.username_updated_at) return null;
  const next = new Date(row.username_updated_at);
  next.setDate(next.getDate() + USERNAME_COOLDOWN_DAYS);
  return next.getTime() > Date.now() ? next.toISOString() : null;
}

function toOwnProfile(row: ProfileRow, autoSharedCount: number): OwnProfile {
  return {
    ...toPublicProfile(row),
    usernameIsAuto: row.username_updated_at === null,
    usernameChangeAvailableAt: usernameChangeAvailableAt(row),
    autoSharedCount,
  };
}

async function countAutoShared(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("community_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("origin", "backfill")
    .eq("status", "published");
  // Before sql/028a runs the column doesn't exist; the profile must still load.
  if (error) return 0;
  return count ?? 0;
}

/** Uploaded community images must live under the caller's own S3 prefix. */
export function communityUploadPrefix(userId: string): string {
  return publicUrlForS3Key(`community/${userId}/`);
}

export function isOwnCommunityUpload(userId: string, url: string): boolean {
  return url.startsWith(communityUploadPrefix(userId));
}

export async function getProfileRowById(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("users").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function getProfileRowByUsername(username: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("users")
    .select(PROFILE_COLUMNS)
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

/** Active profile by handle, or the handle it was renamed to. Suspended users read as missing. */
export async function resolveProfile(
  username: string
): Promise<{ profile: ProfileRow } | { redirectTo: string } | null> {
  const row = await getProfileRowByUsername(username);
  if (row) return row.community_status === "active" ? { profile: row } : null;

  const { data, error } = await supabase
    .from("user_username_history")
    .select("user_id")
    .eq("old_username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const current = await getProfileRowById(data.user_id);
  if (!current || current.community_status !== "active") return null;
  return { redirectTo: current.username };
}

export async function requireActiveProfile(username: string): Promise<ProfileRow> {
  const row = await getProfileRowByUsername(username);
  if (!row || row.community_status !== "active") throw new CommunityError(404, "Profile not found");
  return row;
}

/** The signed-in user's row, creating it from Clerk on first visit (same path as /api/3d/me). */
export async function getOwnProfileRow(userId: string): Promise<ProfileRow> {
  let row = await getProfileRowById(userId);
  if (!row) {
    await syncUserToDatabase(userId);
    row = await getProfileRowById(userId);
  }
  if (!row) throw new CommunityError(404, "Profile not found");
  return row;
}

export async function getOwnProfile(userId: string): Promise<OwnProfile> {
  const [row, autoSharedCount] = await Promise.all([getOwnProfileRow(userId), countAutoShared(userId)]);
  return toOwnProfile(row, autoSharedCount);
}

export async function checkUsernameAvailability(
  userId: string,
  raw: string
): Promise<{ available: boolean; username: string; reason: string | null }> {
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return { available: false, username: raw, reason: parsed.error.issues[0]?.message ?? "Invalid username" };
  }
  const username = parsed.data;
  const { data, error } = await supabase.rpc("community_username_available", {
    p_username: username,
    p_user_id: userId,
  });
  if (error) throw error;
  return { available: data === true, username, reason: data === true ? null : "That username isn't available" };
}

async function changeUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase.rpc("community_change_username", {
    p_user_id: userId,
    p_new_username: username,
  });
  if (!error) return;
  if (error.message?.includes("username_cooldown")) {
    throw new CommunityError(409, `You can change your username once every ${USERNAME_COOLDOWN_DAYS} days`, "username_cooldown");
  }
  if (error.message?.includes("username_unavailable") || error.code === "23505") {
    throw new CommunityError(409, "That username isn't available", "username_unavailable");
  }
  if (error.code === "23514") throw new CommunityError(400, "That username isn't valid", "username_invalid");
  throw error;
}

/** Returns the updated profile plus the previous handle so callers can revalidate both. */
export async function updateProfile(
  userId: string,
  body: UpdateProfileBody
): Promise<{ profile: OwnProfile; previousUsername: string }> {
  const before = await getOwnProfileRow(userId);
  if (before.community_status !== "active") throw new CommunityError(403, "Your community access is suspended");

  for (const url of [body.avatarUrl, body.bannerUrl]) {
    if (url && !isOwnCommunityUpload(userId, url)) throw new CommunityError(400, "Upload images through Hydrilla");
  }

  if (body.username && body.username !== before.username) {
    await changeUsername(userId, body.username);
  }

  const patch: Record<string, unknown> = {};
  if (body.displayName !== undefined) patch.display_name = body.displayName || null;
  if (body.bio !== undefined) patch.bio = body.bio || null;
  if (body.website !== undefined) patch.website_url = body.website;
  if (body.avatarUrl !== undefined) patch.avatar_url = body.avatarUrl;
  if (body.bannerUrl !== undefined) patch.banner_url = body.bannerUrl;

  if (Object.keys(patch).length > 0) {
    patch.updated_at = new Date().toISOString();
    const { error } = await supabase.from("users").update(patch).eq("id", userId);
    if (error) {
      if (error.code === "23514") throw new CommunityError(400, "Some profile fields are invalid");
      throw error;
    }
  }

  return { profile: await getOwnProfile(userId), previousUsername: before.username };
}

export async function followUser(followerId: string, username: string): Promise<PublicProfile> {
  const target = await requireActiveProfile(username);
  if (target.id === followerId) throw new CommunityError(400, "You can't follow yourself");
  await getOwnProfileRow(followerId);
  const { error } = await supabase
    .from("user_follows")
    .upsert({ follower_id: followerId, following_id: target.id }, { ignoreDuplicates: true });
  if (error) throw error;
  return toPublicProfile((await getProfileRowById(target.id))!);
}

export async function unfollowUser(followerId: string, username: string): Promise<PublicProfile> {
  const target = await requireActiveProfile(username);
  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", target.id);
  if (error) throw error;
  return toPublicProfile((await getProfileRowById(target.id))!);
}

type FollowEdgeRow = { created_at: string; user: AuthorRow | null };

export async function listFollowEdges(
  username: string,
  direction: "followers" | "following",
  opts: { cursor?: string; limit: number }
): Promise<{ users: AuthorSummary[]; nextCursor: string | null }> {
  const target = await requireActiveProfile(username);
  // followers of X: rows where following_id = X, show the follower; and vice versa.
  const [matchColumn, embed] =
    direction === "followers"
      ? ["following_id", `user:users!user_follows_follower_id_fkey(${AUTHOR_COLUMNS})`]
      : ["follower_id", `user:users!user_follows_following_id_fkey(${AUTHOR_COLUMNS})`];

  let query = supabase
    .from("user_follows")
    .select(`created_at, ${embed}`)
    .eq(matchColumn, target.id)
    .order("created_at", { ascending: false })
    .limit(opts.limit + 1);
  if (opts.cursor) query = query.lt("created_at", opts.cursor);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as FollowEdgeRow[];
  const page = rows.slice(0, opts.limit);
  return {
    users: page
      .filter((r) => r.user && r.user.community_status === "active")
      .map((r) => toAuthorSummary(r.user!)),
    nextCursor: rows.length > opts.limit ? page[page.length - 1].created_at : null,
  };
}

export async function getFollowingUsernames(followerId: string, usernames: string[]): Promise<string[]> {
  if (usernames.length === 0) return [];
  const { data, error } = await supabase
    .from("user_follows")
    .select("target:users!user_follows_following_id_fkey!inner(username)")
    .eq("follower_id", followerId)
    .in("target.username", usernames.map((u) => u.toLowerCase()));
  if (error) throw error;
  return ((data ?? []) as unknown as { target: { username: string } }[]).map((r) => r.target.username);
}
