import { Router } from "express";
import { z } from "zod";
import { logger } from "../logger.js";
import { communityTags, revalidateCommunityFrontend } from "../lib/communityRevalidate.js";
import { CommunityError } from "../repository/profiles.js";
import {
  listReports,
  resolveReport,
  setCommentStatus,
  setPostFeatured,
  setPostStatus,
  setUserCommunityStatus,
} from "../repository/community.js";

/** Mounted under adminRouter, which already applies requireAuth + requireAdmin. */
export const adminCommunityRouter = Router();

function fail(res: any, err: unknown, label: string) {
  if (err instanceof CommunityError) return res.status(err.status).json({ error: err.message });
  logger.error({ err }, `${label} failed`);
  return res.status(500).json({ error: "Internal Server Error" });
}

adminCommunityRouter.get("/reports", async (req, res) => {
  try {
    const status = z.enum(["open", "actioned", "dismissed"]).catch("open").parse(req.query.status);
    res.json({ reports: await listReports(status, 100) });
  } catch (err) {
    fail(res, err, "GET /api/admin/community/reports");
  }
});

adminCommunityRouter.post("/reports/:id/resolve", async (req, res) => {
  const parsed = z.object({ status: z.enum(["actioned", "dismissed"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "status must be actioned or dismissed" });
  try {
    await resolveReport(req.params.id, parsed.data.status, req.userEmail || req.userId!);
    res.json({ ok: true });
  } catch (err) {
    fail(res, err, "POST /api/admin/community/reports/:id/resolve");
  }
});

adminCommunityRouter.post("/posts/:id/remove", async (req, res) => {
  try {
    const reason = typeof req.body?.reason === "string" ? req.body.reason.slice(0, 200) : undefined;
    const username = await setPostStatus(req.params.id, "removed", reason);
    void revalidateCommunityFrontend([communityTags.feed, communityTags.post(req.params.id), communityTags.user(username)]);
    res.json({ ok: true });
  } catch (err) {
    fail(res, err, "POST /api/admin/community/posts/:id/remove");
  }
});

adminCommunityRouter.post("/posts/:id/restore", async (req, res) => {
  try {
    const username = await setPostStatus(req.params.id, "published");
    void revalidateCommunityFrontend([communityTags.feed, communityTags.post(req.params.id), communityTags.user(username)]);
    res.json({ ok: true });
  } catch (err) {
    fail(res, err, "POST /api/admin/community/posts/:id/restore");
  }
});

for (const [path, featured] of [["feature", true], ["unfeature", false]] as const) {
  adminCommunityRouter.post(`/posts/:id/${path}`, async (req, res) => {
    try {
      await setPostFeatured(req.params.id, featured);
      void revalidateCommunityFrontend([communityTags.feed, communityTags.post(req.params.id)]);
      res.json({ ok: true });
    } catch (err) {
      fail(res, err, `POST /api/admin/community/posts/:id/${path}`);
    }
  });
}

for (const [path, status] of [["remove", "removed"], ["restore", "visible"]] as const) {
  adminCommunityRouter.post(`/comments/:id/${path}`, async (req, res) => {
    try {
      await setCommentStatus(req.params.id, status);
      res.json({ ok: true });
    } catch (err) {
      fail(res, err, `POST /api/admin/community/comments/:id/${path}`);
    }
  });
}

for (const [path, status] of [["suspend", "suspended"], ["unsuspend", "active"]] as const) {
  adminCommunityRouter.post(`/users/:username/${path}`, async (req, res) => {
    try {
      await setUserCommunityStatus(req.params.username, status);
      void revalidateCommunityFrontend([communityTags.feed, communityTags.user(req.params.username)]);
      res.json({ ok: true });
    } catch (err) {
      fail(res, err, `POST /api/admin/community/users/:username/${path}`);
    }
  });
}
