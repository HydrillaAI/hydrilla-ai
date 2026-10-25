import { supabase } from "../db.js";
import type { CreatePostBody, UpdatePostBody } from "../routes/communitySchemas.js";
import {
  AUTHOR_COLUMNS,
  CommunityError,
  getOwnProfileRow,
  isOwnCommunityUpload,
  requireActiveProfile,
  toAuthorSummary,
  type AuthorRow,
  type AuthorSummary,
} from "./profiles.js";

const POSTS_PER_DAY = 10;
const COMMENTS_PER_10_MIN = 20;
const REPORTS_PER_DAY = 20;

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
  license: string;
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

type PostRow = {
  id: string;
  title: string;
  cover_image_url: string | null;
  tags: string[];
  like_count: number;
  save_count: number;
  comment_count: number;
  view_count: number;
  featured_at: string | null;
  published_at: string;
  author: AuthorRow;
  items: { count: number }[];
};

type PostDetailRow = Omit<PostRow, "items"> & {
  user_id: string;
  status: string;
  description: string;
  license: string;
  allow_download: boolean;
  show_prompt: boolean;
  updated_at: string;
  items: {
    id: string;
    position: number;
    kind: "model" | "image";
    job_id: string | null;
    image_url: string | null;
    job: { engine: string | null; prompt: string | null } | null;
  }[];
};

// posts↔users is reachable through user_id and through the likes/saves join tables, so every
// author embed names its foreign key; a bare `users` embed is ambiguous to PostgREST (PGRST201).
const CARD_COLUMNS = `id, title, cover_image_url, tags, like_count, save_count, comment_count, view_count, featured_at, published_at, author:users!community_posts_user_id_fkey!inner(${AUTHOR_COLUMNS}), items:community_post_items(count)`;

const DETAIL_COLUMNS = `id, user_id, status, title, description, cover_image_url, tags, license, allow_download, show_prompt, like_count, save_count, comment_count, view_count, featured_at, published_at, updated_at, author:users!community_posts_user_id_fkey!inner(${AUTHOR_COLUMNS}), items:community_post_items(id, position, kind, job_id, image_url, job:jobs(engine, prompt))`;

function toPostCard(row: PostRow | PostDetailRow): PostCard {
  const itemCount = Array.isArray(row.items)
    ? "count" in (row.items[0] ?? {})
      ? (row.items[0] as { count: number }).count
      : row.items.length
    : 0;
  return {
    id: row.id,
    title: row.title,
    coverImageUrl: row.cover_image_url,
    tags: row.tags ?? [],
    likeCount: row.like_count,
    saveCount: row.save_count,
    commentCount: row.comment_count,
    viewCount: row.view_count,
    itemCount,
    featured: row.featured_at !== null,
    publishedAt: row.published_at,
    author: toAuthorSummary(row.author),
  };
}

function toPostDetail(row: PostDetailRow): PostDetail {
  const items = [...row.items]
    .sort((a, b) => a.position - b.position)
    .map((item): PostItem =>
      item.kind === "model"
        ? { id: item.id, position: item.position, kind: "model", jobId: item.job_id!, engine: item.job?.engine ?? null }
        : { id: item.id, position: item.position, kind: "image", imageUrl: item.image_url! }
    );
  const firstModel = row.items.find((i) => i.kind === "model");
  return {
    ...toPostCard(row),
    description: row.description,
    license: row.license,
    allowDownload: row.allow_download,
    prompt: row.show_prompt ? (firstModel?.job?.prompt ?? null) : null,
    updatedAt: row.updated_at,
    items,
  };
}

/** Escape LIKE wildcards and PostgREST filter separators in user search input. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`).replace(/[,()]/g, " ")}%`;
}

export async function listFeed(opts: {
  sort: FeedSort;
  limit: number;
  cursor?: string;
  tag?: string;
  q?: string;
  viewerId?: string;
}): Promise<{ posts: PostCard[]; nextCursor: string | null }> {
  const { limit, cursor, tag, q } = opts;
  // Search always ranks by recency; trending/featured ordering doesn't apply to a text match.
  const sort = q && opts.sort !== "following" ? "newest" : opts.sort;

  if (sort === "trending") {
    const offset = Math.max(0, Number(cursor) || 0);
    const { data, error } = await supabase
      .rpc("community_feed_trending", { p_limit: limit + 1, p_offset: offset, p_tag: tag ?? null })
      .select(CARD_COLUMNS);
    if (error) throw error;
    const rows = (data ?? []) as unknown as PostRow[];
    return {
      posts: rows.slice(0, limit).map(toPostCard),
      nextCursor: rows.length > limit ? String(offset + limit) : null,
    };
  }

  if (sort === "following") {
    if (!opts.viewerId) throw new CommunityError(401, "Sign in to see posts from people you follow");
    const { data, error } = await supabase
      .rpc("community_feed_following", {
        p_user_id: opts.viewerId,
        p_limit: limit + 1,
        p_before: cursor ?? null,
      })
      .select(CARD_COLUMNS);
    if (error) throw error;
    const rows = (data ?? []) as unknown as PostRow[];
    const page = rows.slice(0, limit);
    return {
      posts: page.map(toPostCard),
      nextCursor: rows.length > limit ? page[page.length - 1].published_at : null,
    };
  }

  const orderColumn = sort === "featured" ? "featured_at" : "published_at";
  let query = supabase
    .from("community_posts")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("author.community_status", "active")
    .order(orderColumn, { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  if (sort === "featured") query = query.not("featured_at", "is", null);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("title", likePattern(q));
  if (cursor) query = query.lt(orderColumn, cursor);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as PostRow[];
  const page = rows.slice(0, limit);
  const last = page[page.length - 1];
  return {
    posts: page.map(toPostCard),
    nextCursor: rows.length > limit && last ? (sort === "featured" ? last.featured_at : last.published_at) : null,
  };
}

async function getPostRow(postId: string): Promise<PostDetailRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return null;
  const { data, error } = await supabase.from("community_posts").select(DETAIL_COLUMNS).eq("id", postId).maybeSingle();
  if (error) throw error;
  return (data as unknown as PostDetailRow | null) ?? null;
}

/** Published post with an active author, else null (removed posts 404 for everyone). */
export async function getPublishedPost(postId: string): Promise<PostDetail | null> {
  const row = await getPostRow(postId);
  if (!row || row.status !== "published" || row.author.community_status !== "active") return null;
  return toPostDetail(row);
}

async function requirePublishedPostRow(postId: string): Promise<PostDetailRow> {
  const row = await getPostRow(postId);
  if (!row || row.status !== "published") throw new CommunityError(404, "Post not found");
  return row;
}

async function requireOwnedPostRow(userId: string, postId: string): Promise<PostDetailRow> {
  const row = await getPostRow(postId);
  if (!row || row.user_id !== userId) throw new CommunityError(404, "Post not found");
  return row;
}

async function assertActiveMember(userId: string): Promise<void> {
  const me = await getOwnProfileRow(userId);
  if (me.community_status !== "active") throw new CommunityError(403, "Your community access is suspended");
}

async function countSince(table: string, userColumn: string, userId: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(userColumn, userId)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

type PostableJob = {
  id: string;
  user_id: string | null;
  status: string;
  result_glb_url: string | null;
  result_kind: string | null;
  preview_image_url: string | null;
};

export async function createPost(userId: string, body: CreatePostBody): Promise<PostDetail> {
  await assertActiveMember(userId);
  if ((await countSince("community_posts", "user_id", userId, 24 * 60)) >= POSTS_PER_DAY) {
    throw new CommunityError(429, `You can share up to ${POSTS_PER_DAY} posts a day`);
  }

  const jobIds = body.items.flatMap((i) => (i.kind === "model" ? [i.jobId] : []));
  if (new Set(jobIds).size !== jobIds.length) throw new CommunityError(400, "Each model can only be added once");

  const jobsById = new Map<string, PostableJob>();
  if (jobIds.length > 0) {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, user_id, status, result_glb_url, result_kind, preview_image_url")
      .in("id", jobIds);
    if (error) throw error;
    for (const job of (data ?? []) as PostableJob[]) jobsById.set(job.id, job);
  }
  for (const jobId of jobIds) {
    const job = jobsById.get(jobId);
    if (!job || job.user_id !== userId) throw new CommunityError(400, "You can only share your own models");
    const isMesh = (job.result_kind ?? "glb") === "glb" && !!job.result_glb_url;
    if (job.status !== "DONE" || !isMesh) {
      throw new CommunityError(400, "Only finished 3D models can be shared");
    }
  }

  const imageUrls = body.items.flatMap((i) => (i.kind === "image" ? [i.imageUrl] : []));
  for (const url of [...imageUrls, ...(body.coverImageUrl ? [body.coverImageUrl] : [])]) {
    if (!isOwnCommunityUpload(userId, url)) throw new CommunityError(400, "Upload images through Hydrilla");
  }

  const first = body.items[0];
  const coverImageUrl =
    body.coverImageUrl ??
    (first.kind === "image" ? first.imageUrl : jobsById.get(first.jobId)?.preview_image_url ?? null);

  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      title: body.title,
      description: body.description,
      tags: [...new Set(body.tags)],
      license: body.license,
      allow_download: body.allowDownload,
      show_prompt: body.showPrompt,
      cover_image_url: coverImageUrl,
    })
    .select("id")
    .single();
  if (postError) throw postError;

  const { error: itemsError } = await supabase.from("community_post_items").insert(
    body.items.map((item, position) =>
      item.kind === "model"
        ? { post_id: post.id, position, kind: "model", job_id: item.jobId }
        : { post_id: post.id, position, kind: "image", image_url: item.imageUrl }
    )
  );
  if (itemsError) {
    // No multi-statement transactions through PostgREST: compensate so no empty post is left behind.
    await supabase.from("community_posts").delete().eq("id", post.id);
    throw itemsError;
  }

  return toPostDetail((await getPostRow(post.id))!);
}

export async function updatePost(userId: string, postId: string, body: UpdatePostBody): Promise<PostDetail> {
  await requireOwnedPostRow(userId, postId);
  if (body.coverImageUrl && !isOwnCommunityUpload(userId, body.coverImageUrl)) {
    throw new CommunityError(400, "Upload images through Hydrilla");
  }
  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.tags !== undefined) patch.tags = [...new Set(body.tags)];
  if (body.license !== undefined) patch.license = body.license;
  if (body.allowDownload !== undefined) patch.allow_download = body.allowDownload;
  if (body.showPrompt !== undefined) patch.show_prompt = body.showPrompt;
  if (body.coverImageUrl !== undefined) patch.cover_image_url = body.coverImageUrl;
  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("community_posts").update(patch).eq("id", postId);
    if (error) throw error;
  }
  return toPostDetail((await getPostRow(postId))!);
}

/** Owner delete is a hard delete; moderators use setPostStatus instead. Returns the author handle. */
export async function deletePost(userId: string, postId: string): Promise<string> {
  const row = await requireOwnedPostRow(userId, postId);
  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) throw error;
  return row.author.username;
}

// ── One-time backfill (sql/028b) owner controls ───────────────────────────

/** Removes every post the backfill published for this owner. Their own posts are untouched. */
export async function unpublishBackfill(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("community_posts")
    .delete()
    .eq("user_id", userId)
    .eq("origin", "backfill")
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

/**
 * Swaps a backfilled post's cover (the job's input photo) for the owner's front-view render.
 * Only when the post is still the untouched backfill: same owner, first item is the job,
 * cover still equals the job's original preview. `makeCoverUrl` (the S3 upload) only runs once a
 * post qualifies. Returns false when nothing matched.
 */
export async function refreshBackfillCover(
  userId: string,
  jobId: string,
  makeCoverUrl: () => Promise<string | null>
): Promise<boolean> {
  const { data: items, error } = await supabase
    .from("community_post_items")
    .select("post_id, position, post:community_posts!inner(id, user_id, origin, status, cover_image_url), job:jobs!inner(preview_image_url)")
    .eq("job_id", jobId)
    .eq("position", 0)
    .eq("post.user_id", userId)
    .eq("post.origin", "backfill")
    .eq("post.status", "published");
  if (error) throw error;

  const rows = (items ?? []) as unknown as {
    post_id: string;
    post: { cover_image_url: string | null };
    job: { preview_image_url: string | null };
  }[];
  // 028b set the cover to the job's preview, or left it empty when the preview wasn't a URL.
  const target = rows.find(
    (r) => r.post.cover_image_url === null || r.post.cover_image_url === r.job.preview_image_url
  );
  if (!target) return false;

  const coverUrl = await makeCoverUrl();
  if (!coverUrl) return false;
  const { error: updateError } = await supabase
    .from("community_posts")
    .update({ cover_image_url: coverUrl })
    .eq("id", target.post_id);
  if (updateError) throw updateError;
  return true;
}

export async function recordView(postId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return;
  const { error } = await supabase.rpc("community_increment_post_view", { p_post_id: postId });
  if (error) throw error;
}

type Reaction = "like" | "save";
const REACTION_TABLE: Record<Reaction, string> = {
  like: "community_post_likes",
  save: "community_post_saves",
};

export async function setReaction(
  userId: string,
  postId: string,
  reaction: Reaction,
  on: boolean
): Promise<{ likeCount: number; saveCount: number }> {
  await requirePublishedPostRow(postId);
  const table = REACTION_TABLE[reaction];
  if (on) {
    await assertActiveMember(userId);
    const { error } = await supabase.from(table).upsert({ post_id: postId, user_id: userId }, { ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  }
  const { data, error } = await supabase
    .from("community_posts")
    .select("like_count, save_count")
    .eq("id", postId)
    .single();
  if (error) throw error;
  return { likeCount: data.like_count, saveCount: data.save_count };
}

type CommentRow = {
  id: string;
  body: string;
  parent_comment_id: string | null;
  created_at: string;
  author: AuthorRow;
};

const COMMENT_COLUMNS = `id, body, parent_comment_id, created_at, author:users!community_comments_user_id_fkey!inner(${AUTHOR_COLUMNS})`;

function toComment(row: CommentRow): PostComment {
  return {
    id: row.id,
    body: row.body,
    parentCommentId: row.parent_comment_id,
    createdAt: row.created_at,
    author: toAuthorSummary(row.author),
  };
}

export async function listComments(
  postId: string,
  opts: { cursor?: string; limit: number }
): Promise<{ comments: PostComment[]; nextCursor: string | null }> {
  await requirePublishedPostRow(postId);
  let query = supabase
    .from("community_comments")
    .select(COMMENT_COLUMNS)
    .eq("post_id", postId)
    .eq("status", "visible")
    .eq("author.community_status", "active")
    .order("created_at", { ascending: false })
    .limit(opts.limit + 1);
  if (opts.cursor) query = query.lt("created_at", opts.cursor);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as CommentRow[];
  const page = rows.slice(0, opts.limit);
  return {
    comments: page.map(toComment),
    nextCursor: rows.length > opts.limit ? page[page.length - 1].created_at : null,
  };
}

export async function createComment(
  userId: string,
  postId: string,
  body: string,
  parentCommentId?: string | null
): Promise<PostComment> {
  await requirePublishedPostRow(postId);
  await assertActiveMember(userId);
  if ((await countSince("community_comments", "user_id", userId, 10)) >= COMMENTS_PER_10_MIN) {
    throw new CommunityError(429, "You're commenting too fast. Try again in a few minutes.");
  }
  if (parentCommentId) {
    const { data: parent, error } = await supabase
      .from("community_comments")
      .select("post_id")
      .eq("id", parentCommentId)
      .maybeSingle();
    if (error) throw error;
    if (!parent || parent.post_id !== postId) throw new CommunityError(400, "Reply target not found");
  }
  const { data, error } = await supabase
    .from("community_comments")
    .insert({ post_id: postId, user_id: userId, body, parent_comment_id: parentCommentId ?? null })
    .select(COMMENT_COLUMNS)
    .single();
  if (error) throw error;
  return toComment(data as unknown as CommentRow);
}

/** Comment author or the post's owner can remove a comment (soft delete). */
export async function removeComment(userId: string, commentId: string): Promise<void> {
  const { data, error } = await supabase
    .from("community_comments")
    .select("user_id, post:community_posts!inner(user_id)")
    .eq("id", commentId)
    .maybeSingle();
  if (error) throw error;
  const row = data as unknown as { user_id: string; post: { user_id: string } } | null;
  if (!row || (row.user_id !== userId && row.post.user_id !== userId)) {
    throw new CommunityError(404, "Comment not found");
  }
  const { error: updateError } = await supabase
    .from("community_comments")
    .update({ status: "removed" })
    .eq("id", commentId);
  if (updateError) throw updateError;
}

export async function createReport(
  userId: string,
  report: { targetType: "post" | "comment" | "user"; targetId: string; reason: string; details?: string | null }
): Promise<void> {
  if ((await countSince("community_reports", "reporter_id", userId, 24 * 60)) >= REPORTS_PER_DAY) {
    throw new CommunityError(429, "You've sent a lot of reports today. Our team is reviewing them.");
  }
  const { error } = await supabase.from("community_reports").insert({
    reporter_id: userId,
    target_type: report.targetType,
    target_id: report.targetId,
    reason: report.reason,
    details: report.details || null,
  });
  // Reporting the same thing twice is a no-op for the reporter.
  if (error && error.code !== "23505") throw error;
}

export async function listUserPosts(
  username: string,
  opts: { cursor?: string; limit: number }
): Promise<{ posts: PostCard[]; nextCursor: string | null }> {
  const owner = await requireActiveProfile(username);
  let query = supabase
    .from("community_posts")
    .select(CARD_COLUMNS)
    .eq("user_id", owner.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(opts.limit + 1);
  if (opts.cursor) query = query.lt("published_at", opts.cursor);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as PostRow[];
  const page = rows.slice(0, opts.limit);
  return {
    posts: page.map(toPostCard),
    nextCursor: rows.length > opts.limit ? page[page.length - 1].published_at : null,
  };
}

/** A user's saved posts — only ever served to that user. */
export async function listSavedPosts(
  userId: string,
  opts: { cursor?: string; limit: number }
): Promise<{ posts: PostCard[]; nextCursor: string | null }> {
  let query = supabase
    .from("community_post_saves")
    .select(`created_at, post:community_posts!inner(${CARD_COLUMNS})`)
    .eq("user_id", userId)
    .eq("post.status", "published")
    .order("created_at", { ascending: false })
    .limit(opts.limit + 1);
  if (opts.cursor) query = query.lt("created_at", opts.cursor);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as { created_at: string; post: PostRow }[];
  const page = rows.slice(0, opts.limit);
  return {
    posts: page.filter((r) => r.post.author.community_status === "active").map((r) => toPostCard(r.post)),
    nextCursor: rows.length > opts.limit ? page[page.length - 1].created_at : null,
  };
}

/** Per-viewer flags for a page of posts, fetched separately so public payloads stay cacheable. */
export async function getViewerPostState(
  userId: string,
  postIds: string[]
): Promise<{ liked: string[]; saved: string[]; owned: string[] }> {
  if (postIds.length === 0) return { liked: [], saved: [], owned: [] };
  const [likes, saves, owned] = await Promise.all([
    supabase.from("community_post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("community_post_saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("community_posts").select("id").eq("user_id", userId).in("id", postIds),
  ]);
  for (const r of [likes, saves, owned]) if (r.error) throw r.error;
  return {
    liked: (likes.data ?? []).map((r) => r.post_id),
    saved: (saves.data ?? []).map((r) => r.post_id),
    owned: (owned.data ?? []).map((r) => r.id),
  };
}

/** True when the job is an item of at least one published post (GLB proxy access rule). */
export async function isJobPubliclyPosted(jobId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("community_post_items")
    .select("post_id, post:community_posts!inner(status)")
    .eq("job_id", jobId)
    .eq("post.status", "published")
    .limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function listSitemapEntries(): Promise<{
  posts: { id: string; updatedAt: string }[];
  users: { username: string }[];
}> {
  const [posts, users] = await Promise.all([
    supabase
      .from("community_posts")
      .select("id, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5000),
    supabase
      .from("users")
      .select("username")
      .eq("community_status", "active")
      .gt("published_posts_count", 0)
      .limit(5000),
  ]);
  if (posts.error) throw posts.error;
  if (users.error) throw users.error;
  return {
    posts: (posts.data ?? []).map((p) => ({ id: p.id, updatedAt: p.updated_at })),
    users: (users.data ?? []).map((u) => ({ username: u.username })),
  };
}

// ── Moderation (admin router only) ─────────────────────────────────────────

export async function listReports(status: "open" | "actioned" | "dismissed", limit: number) {
  const { data, error } = await supabase
    .from("community_reports")
    .select("id, target_type, target_id, reason, details, status, created_at, resolved_at, resolved_by, reporter:users(username)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function resolveReport(reportId: string, status: "actioned" | "dismissed", resolvedBy: string) {
  const { error } = await supabase
    .from("community_reports")
    .update({ status, resolved_by: resolvedBy, resolved_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) throw error;
}

/** Returns the author handle so callers can revalidate the profile page. */
export async function setPostStatus(postId: string, status: "published" | "removed", reason?: string): Promise<string> {
  const row = await getPostRow(postId);
  if (!row) throw new CommunityError(404, "Post not found");
  const { error } = await supabase
    .from("community_posts")
    .update({
      status,
      removed_reason: status === "removed" ? reason || "moderation" : null,
      removed_at: status === "removed" ? new Date().toISOString() : null,
    })
    .eq("id", postId);
  if (error) throw error;
  return row.author.username;
}

export async function setPostFeatured(postId: string, featured: boolean): Promise<void> {
  const { error, count } = await supabase
    .from("community_posts")
    .update({ featured_at: featured ? new Date().toISOString() : null }, { count: "exact" })
    .eq("id", postId);
  if (error) throw error;
  if (!count) throw new CommunityError(404, "Post not found");
}

export async function setCommentStatus(commentId: string, status: "visible" | "removed"): Promise<void> {
  const { error, count } = await supabase
    .from("community_comments")
    .update({ status }, { count: "exact" })
    .eq("id", commentId);
  if (error) throw error;
  if (!count) throw new CommunityError(404, "Comment not found");
}

export async function setUserCommunityStatus(username: string, status: "active" | "suspended"): Promise<void> {
  const { error, count } = await supabase
    .from("users")
    .update({ community_status: status }, { count: "exact" })
    .eq("username", username.toLowerCase());
  if (error) throw error;
  if (!count) throw new CommunityError(404, "User not found");
}
