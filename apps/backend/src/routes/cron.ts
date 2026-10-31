import { Router, Request, Response } from "express";
import { config, timingSafeEqualString } from "../config.js";
import { logger } from "../logger.js";
import { runWeeklyRecap } from "../services/weeklyRecap.js";
import { expireCreditGrants } from "../services/credits.js";
import { isGcpComputeConfigured } from "../services/gcpCompute.js";
import { runDueGpuAutoStops } from "../services/gpuAutoStop.js";

/**
 * Scheduled jobs (mounted under /api/cron). Vercel Cron calls these with
 * `Authorization: Bearer $CRON_SECRET`; the schedule is in vercel.json.
 */
export const cronRouter = Router();

function authorized(req: Request): boolean {
  const header = req.header("authorization") || "";
  return Boolean(config.cronSecret) && timingSafeEqualString(header, `Bearer ${config.cronSecret}`);
}

/** GET /api/cron/weekly-recap — Mondays. Tracks weekly_recap_ready for active people. */
cronRouter.get("/weekly-recap", async (req: Request, res: Response) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const result = await runWeeklyRecap();
    return res.json({ ok: true, ...result });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Weekly recap cron failed");
    return res.status(500).json({ error: "Weekly recap failed" });
  }
});

/**
 * GET /api/cron/expire-credits — daily. Removes claimed credits past their expiry for
 * everyone, so balances are right even for people who have not opened the app.
 */
cronRouter.get("/expire-credits", async (req: Request, res: Response) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const expired = await expireCreditGrants();
  return res.json({ ok: true, expired });
});

/**
 * GET /api/cron/gpu-auto-stop — every minute. Stops a GPU VM whose admin timer
 * has passed, including when nobody has the admin site open.
 */
cronRouter.get("/gpu-auto-stop", async (req: Request, res: Response) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isGcpComputeConfigured()) {
    return res.json({ ok: true, skipped: "gcp not configured", stopped: [], failed: [] });
  }
  const result = await runDueGpuAutoStops();
  if (result.failed.length > 0) {
    return res.status(502).json({ ok: false, ...result });
  }
  return res.json({ ok: true, ...result });
});
