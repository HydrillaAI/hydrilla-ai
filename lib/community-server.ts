/**
 * Server-side reads for community pages. Public data only (no auth()), cached with tags the
 * backend revalidates through /api/revalidate/community after mutations.
 */
import {
  COMMUNITY_API,
  type FeedPage,
  type FeedSort,
  type PostDetail,
  type PublicProfile,
} from "./community";

const REVALIDATE_SECONDS = 60;

export const communityTags = {
  feed: "community:feed",
  post: (id: string) => `community:post:${id}`,
  user: (username: string) => `community:user:${username.toLowerCase()}`,
};

async function getJson<T>(path: string, tags: string[], revalidate = REVALIDATE_SECONDS): Promise<T | null> {
  try {
    const res = await fetch(`${COMMUNITY_API}${path}`, {
      next: { revalidate, tags },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Community API ${res.status} for ${path}`);
    return (await res.json()) as T;
  } catch (err) {
    console.error("[community-server]", err);
    return null;
  }
}

export async function getFeedPage(sort: Exclude<FeedSort, "following">, tag?: string | null): Promise<FeedPage> {
  const q = new URLSearchParams({ sort, limit: "24" });
  if (tag) q.set("tag", tag);
  return (await getJson<FeedPage>(`/posts?${q}`, [communityTags.feed])) ?? { posts: [], nextCursor: null };
}

export async function getPost(id: string): Promise<PostDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await getJson<{ post: PostDetail }>(`/posts/${id}`, [communityTags.post(id)]))?.post ?? null;
}

export async function getProfile(
  username: string
): Promise<{ profile: PublicProfile } | { redirectTo: string } | null> {
  return getJson(`/users/${encodeURIComponent(username)}`, [communityTags.user(username)]);
}

export async function getProfilePosts(username: string): Promise<FeedPage> {
  return (
    (await getJson<FeedPage>(`/users/${encodeURIComponent(username)}/posts`, [communityTags.user(username)])) ?? {
      posts: [],
      nextCursor: null,
    }
  );
}

export async function getSitemapEntries(): Promise<{
  posts: { id: string; updatedAt: string }[];
  users: { username: string }[];
}> {
  return (await getJson(`/sitemap`, [], 3600)) ?? { posts: [], users: [] };
}
