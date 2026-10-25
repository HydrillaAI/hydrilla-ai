import { randomUUID } from "node:crypto";
import { Router, type Response } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { logger } from "../logger.js";
import { uploadDataUrlToS3 } from "../lib/s3Upload.js";
import { communityTags, revalidateCommunityFrontend } from "../lib/communityRevalidate.js";
import {
  backfillCoverSchema,
  commentSchema,
  createPostSchema,
  firstIssue,
  reportSchema,
  updatePostSchema,
  updateProfileSchema,
  uploadSchema,
} from "./communitySchemas.js";
import {
  CommunityError,
  checkUsernameAvailability,
  followUser,
  getFollowingUsernames,
  getOwnProfile,
  getOwnProfileRow,
  listFollowEdges,
  resolveProfile,
  toPublicProfile,
  unfollowUser,
  updateProfile,
} from "../repository/profiles.js";
import {
  createComment,
  createPost,
  createReport,
  deletePost,
  getPublishedPost,
  getViewerPostState,
  listComments,
  listFeed,
  listSavedPosts,
  listSitemapEntries,
  listUserPosts,
  recordView,
  refreshBackfillCover,
  unpublishBackfill,
  removeComment,
  setReaction,
  updatePost,
  type FeedSort,
} from "../repository/community.js";

export const communityRouter = Router();

const FEED_SORTS: FeedSort[] = ["trending", "newest", "featured", "following"];
const PUBLIC_CACHE = "public, max-age=0, s-maxage=30, stale-while-revalidate=300";

function sendError(res: Response, err: unknown, label: string) {
  if (err instanceof CommunityError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  logger.error({ err }, `${label} failed`);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}

function pageLimit(raw: unknown, fallback: number, max: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : fallback;
}

function queryString(raw: unknown, max = 100): string | undefined {
  return typeof raw === "string" && raw.trim() ? raw.trim().slice(0, max) : undefined;
}

// ── Feed & posts ───────────────────────────────────────────────────────────

communityRouter.get("/posts", optionalAuth, async (req, res) => {
  try {
    const sort = FEED_SORTS.includes(req.query.sort as FeedSort) ? (req.query.sort as FeedSort) : "trending";
    const tag = queryString(req.query.tag, 24)?.toLowerCase();
    const result = await listFeed({
      sort,
      limit: pageLimit(req.query.limit, 24, 60),
      cursor: queryString(req.query.cursor),
      tag,
      q: queryString(req.query.q, 80),
      viewerId: req.userId,
    });
    if (sort !== "following") res.setHeader("Cache-Control", PUBLIC_CACHE);
    res.json(result);
  } catch (err) {
    sendError(res, err, "GET /api/community/posts");
  }
});

communityRouter.post("/posts", requireAuth, async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const post = await createPost(req.userId!, parsed.data);
    void revalidateCommunityFrontend([communityTags.feed, communityTags.user(post.author.username)]);
    res.status(201).json({ post });
  } catch (err) {
    sendError(res, err, "POST /api/community/posts");
  }
});

communityRouter.get("/posts/:id", async (req, res) => {
  try {
    const post = await getPublishedPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.setHeader("Cache-Control", PUBLIC_CACHE);
    res.json({ post });
  } catch (err) {
    sendError(res, err, "GET /api/community/posts/:id");
  }
});

communityRouter.patch("/posts/:id", requireAuth, async (req, res) => {
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const post = await updatePost(req.userId!, req.params.id, parsed.data);
    void revalidateCommunityFrontend([
      communityTags.feed,
      communityTags.post(post.id),
      communityTags.user(post.author.username),
    ]);
    res.json({ post });
  } catch (err) {
    sendError(res, err, "PATCH /api/community/posts/:id");
  }
});

communityRouter.delete("/posts/:id", requireAuth, async (req, res) => {
  try {
    const username = await deletePost(req.userId!, req.params.id);
    void revalidateCommunityFrontend([
      communityTags.feed,
      communityTags.post(req.params.id),
      communityTags.user(username),
    ]);
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err, "DELETE /api/community/posts/:id");
  }
});

communityRouter.post("/posts/:id/view", async (req, res) => {
  try {
    await recordView(req.params.id);
    res.status(204).end();
  } catch (err) {
    sendError(res, err, "POST /api/community/posts/:id/view");
  }
});

for (const reaction of ["like", "save"] as const) {
  communityRouter.put(`/posts/:id/${reaction}`, requireAuth, async (req, res) => {
    try {
      res.json(await setReaction(req.userId!, req.params.id, reaction, true));
    } catch (err) {
      sendError(res, err, `PUT /api/community/posts/:id/${reaction}`);
    }
  });
  communityRouter.delete(`/posts/:id/${reaction}`, requireAuth, async (req, res) => {
    try {
      res.json(await setReaction(req.userId!, req.params.id, reaction, false));
    } catch (err) {
      sendError(res, err, `DELETE /api/community/posts/:id/${reaction}`);
    }
  });
}

communityRouter.get("/posts/:id/comments", async (req, res) => {
  try {
    res.json(
      await listComments(req.params.id, {
        cursor: queryString(req.query.cursor),
        limit: pageLimit(req.query.limit, 20, 50),
      })
    );
  } catch (err) {
    sendError(res, err, "GET /api/community/posts/:id/comments");
  }
});

communityRouter.post("/posts/:id/comments", requireAuth, async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const comment = await createComment(req.userId!, req.params.id, parsed.data.body, parsed.data.parentCommentId);
    res.status(201).json({ comment });
  } catch (err) {
    sendError(res, err, "POST /api/community/posts/:id/comments");
  }
});

communityRouter.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    await removeComment(req.userId!, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err, "DELETE /api/community/comments/:id");
  }
});

/** Liked/saved/owned flags for posts on screen + which of the given authors the viewer follows. */
communityRouter.get("/viewer-state", requireAuth, async (req, res) => {
  try {
    const list = (raw: unknown) =>
      (queryString(raw, 4000) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 100);
    const [posts, following] = await Promise.all([
      getViewerPostState(req.userId!, list(req.query.postIds)),
      getFollowingUsernames(req.userId!, list(req.query.usernames)),
    ]);
    res.setHeader("Cache-Control", "private, no-store");
    res.json({ ...posts, following });
  } catch (err) {
    sendError(res, err, "GET /api/community/viewer-state");
  }
});

communityRouter.post("/uploads", requireAuth, async (req, res) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const ext = parsed.data.dataUrl.slice(11, parsed.data.dataUrl.indexOf(";")).replace("jpeg", "jpg");
    const key = `community/${req.userId}/${parsed.data.kind}/${randomUUID()}.${ext}`;
    const url = await uploadDataUrlToS3(parsed.data.dataUrl, key);
    if (!url) return res.status(413).json({ error: "Image must be under 2 MB" });
    res.status(201).json({ url });
  } catch (err) {
    sendError(res, err, "POST /api/community/uploads");
  }
});

communityRouter.post("/reports", requireAuth, async (req, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    await createReport(req.userId!, parsed.data);
    res.status(201).json({ ok: true });
  } catch (err) {
    sendError(res, err, "POST /api/community/reports");
  }
});

// ── Profiles ───────────────────────────────────────────────────────────────

communityRouter.get("/me/profile", requireAuth, async (req, res) => {
  try {
    res.setHeader("Cache-Control", "private, no-store");
    res.json({ profile: await getOwnProfile(req.userId!) });
  } catch (err) {
    sendError(res, err, "GET /api/community/me/profile");
  }
});

communityRouter.patch("/me/profile", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const { profile, previousUsername } = await updateProfile(req.userId!, parsed.data);
    void revalidateCommunityFrontend([
      communityTags.feed,
      communityTags.user(previousUsername),
      communityTags.user(profile.username),
    ]);
    res.json({ profile });
  } catch (err) {
    sendError(res, err, "PATCH /api/community/me/profile");
  }
});

communityRouter.get("/me/saved", requireAuth, async (req, res) => {
  try {
    res.setHeader("Cache-Control", "private, no-store");
    res.json(
      await listSavedPosts(req.userId!, {
        cursor: queryString(req.query.cursor),
        limit: pageLimit(req.query.limit, 24, 60),
      })
    );
  } catch (err) {
    sendError(res, err, "GET /api/community/me/saved");
  }
});

/** Owner removes everything the one-time backfill (sql/028b) published for them. */
communityRouter.delete("/me/backfill", requireAuth, async (req, res) => {
  try {
    const removed = await unpublishBackfill(req.userId!);
    const me = await getOwnProfileRow(req.userId!);
    void revalidateCommunityFrontend([communityTags.feed, communityTags.user(me.username)]);
    res.json({ removed });
  } catch (err) {
    sendError(res, err, "DELETE /api/community/me/backfill");
  }
});

/** Upgrade a backfilled post's cover from the input photo to the owner's front-view render. */
communityRouter.put("/me/backfill/cover", requireAuth, async (req, res) => {
  const parsed = backfillCoverSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed.error) });
  try {
    const { jobId, dataUrl } = parsed.data;
    const ext = dataUrl.slice(11, dataUrl.indexOf(";")).replace("jpeg", "jpg");
    const updated = await refreshBackfillCover(req.userId!, jobId, () =>
      uploadDataUrlToS3(dataUrl, `community/${req.userId}/cover/${randomUUID()}.${ext}`)
    );
    if (!updated) return res.status(204).end();
    void revalidateCommunityFrontend([communityTags.feed]);
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err, "PUT /api/community/me/backfill/cover");
  }
});

communityRouter.get("/usernames/:username/availability", requireAuth, async (req, res) => {
  try {
    res.setHeader("Cache-Control", "private, no-store");
    res.json(await checkUsernameAvailability(req.userId!, req.params.username));
  } catch (err) {
    sendError(res, err, "GET /api/community/usernames/:username/availability");
  }
});

communityRouter.get("/users/:username", async (req, res) => {
  try {
    const resolved = await resolveProfile(req.params.username);
    if (!resolved) return res.status(404).json({ error: "Profile not found" });
    res.setHeader("Cache-Control", PUBLIC_CACHE);
    if ("redirectTo" in resolved) return res.json({ redirectTo: resolved.redirectTo });
    res.json({ profile: toPublicProfile(resolved.profile) });
  } catch (err) {
    sendError(res, err, "GET /api/community/users/:username");
  }
});

communityRouter.get("/users/:username/posts", async (req, res) => {
  try {
    res.setHeader("Cache-Control", PUBLIC_CACHE);
    res.json(
      await listUserPosts(req.params.username, {
        cursor: queryString(req.query.cursor),
        limit: pageLimit(req.query.limit, 24, 60),
      })
    );
  } catch (err) {
    sendError(res, err, "GET /api/community/users/:username/posts");
  }
});

for (const direction of ["followers", "following"] as const) {
  communityRouter.get(`/users/:username/${direction}`, async (req, res) => {
    try {
      res.json(
        await listFollowEdges(req.params.username, direction, {
          cursor: queryString(req.query.cursor),
          limit: pageLimit(req.query.limit, 30, 60),
        })
      );
    } catch (err) {
      sendError(res, err, `GET /api/community/users/:username/${direction}`);
    }
  });
}

communityRouter.put("/users/:username/follow", requireAuth, async (req, res) => {
  try {
    const profile = await followUser(req.userId!, req.params.username);
    const me = await getOwnProfileRow(req.userId!);
    void revalidateCommunityFrontend([communityTags.user(profile.username), communityTags.user(me.username)]);
    res.json({ profile });
  } catch (err) {
    sendError(res, err, "PUT /api/community/users/:username/follow");
  }
});

communityRouter.delete("/users/:username/follow", requireAuth, async (req, res) => {
  try {
    const profile = await unfollowUser(req.userId!, req.params.username);
    const me = await getOwnProfileRow(req.userId!);
    void revalidateCommunityFrontend([communityTags.user(profile.username), communityTags.user(me.username)]);
    res.json({ profile });
  } catch (err) {
    sendError(res, err, "DELETE /api/community/users/:username/follow");
  }
});

communityRouter.get("/sitemap", async (_req, res) => {
  try {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
    res.json(await listSitemapEntries());
  } catch (err) {
    sendError(res, err, "GET /api/community/sitemap");
  }
});
