import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { track } from "../lib/customerio.js";
import { availableCredits } from "./credits.js";

/**
 * Weekly recap (W01). Once a week, for every person who finished at least one model in the
 * last 7 days, track `weekly_recap_ready` with their numbers. The Customer.io campaign on that
 * event waits until Monday 10:00 in the person's time zone and sends W01, signed by Tejesh.
 * People with no models that week get nothing.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Eight tips, one per week in rotation, so none repeats within 8 weeks. */
const TIPS = [
  { title: "Start from an image", body: "A clean reference image with one object on a plain background gives the most faithful image-to-3D result.", url: "https://hydrilla.ai/image-to-3d" },
  { title: "Keep prompts to one object", body: "Text-to-3D works best when the prompt describes a single object, its material and its style.", url: "https://hydrilla.ai/text-to-3d" },
  { title: "Group work in Workspaces", body: "Keep the models for one project together so they are easy to find and export later.", url: "https://hydrilla.ai/app/studio" },
  { title: "Bring models into your engine", body: "Models download as GLB, a standard format that Blender and Unreal import directly, and Unity imports with its glTF package.", url: "https://hydrilla.ai/integrations" },
  { title: "Iterate from a result", body: "Edit the reference image and generate again instead of starting from scratch.", url: "https://hydrilla.ai/app/studio" },
  { title: "Automate with the API", body: "Generate models from your own tools with the REST API and an API key.", url: "https://hydrilla.ai/docs" },
  { title: "Reuse prompts that worked", body: "Keep a short list of prompts that gave you good results and use them as the starting point for new objects.", url: "https://hydrilla.ai/app/studio" },
  { title: "Plan credits for a project", body: "Each plan has a monthly credit allowance. Compare plans before a big batch so nothing stops mid-project.", url: "https://hydrilla.ai/app/pricing" },
];

function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export type RecapPayload = {
  userId: string;
  data: {
    models_count: number;
    thumb_1: string | null;
    thumb_2: string | null;
    thumb_3: string | null;
    credits_left: number | null;
    reset_on: string | null;
    tip_title: string;
    tip_body: string;
    tip_url: string;
    week_of: string;
  };
};

/** Build the recap payloads. Pass userId to build one person's recap (admin preview). */
export async function buildWeeklyRecaps(now = new Date(), userId?: string): Promise<RecapPayload[]> {
  const since = new Date(now.getTime() - WEEK_MS).toISOString();
  let query = supabase
    .from("jobs")
    .select("user_id, preview_image_url, created_at")
    .eq("status", "DONE")
    .not("result_glb_url", "is", null)
    .not("user_id", "is", null)
    .gte("updated_at", since)
    .order("updated_at", { ascending: false })
    .limit(10000);
  if (userId) query = query.eq("user_id", userId);

  const { data: jobs, error } = await query;
  if (error) throw new Error(`Weekly recap job query failed: ${error.message}`);

  const byUser = new Map<string, { count: number; thumbs: string[] }>();
  for (const job of jobs || []) {
    const entry = byUser.get(job.user_id) || { count: 0, thumbs: [] };
    entry.count += 1;
    if (job.preview_image_url && entry.thumbs.length < 3) entry.thumbs.push(job.preview_image_url);
    byUser.set(job.user_id, entry);
  }
  if (byUser.size === 0) return [];

  const { data: credits } = await supabase
    .from("user_credits")
    .select("user_id, credits_total, credits_used, credits_bonus, reset_at")
    .in("user_id", [...byUser.keys()]);
  const creditsByUser = new Map((credits || []).map((c: any) => [c.user_id, c]));

  const tip = TIPS[isoWeek(now) % TIPS.length];
  const weekOf = formatDate(now.toISOString()) || "";

  return [...byUser.entries()].map(([id, stats]) => {
    const c: any = creditsByUser.get(id);
    return {
      userId: id,
      data: {
        models_count: stats.count,
        thumb_1: stats.thumbs[0] || null,
        thumb_2: stats.thumbs[1] || null,
        thumb_3: stats.thumbs[2] || null,
        credits_left: c ? availableCredits(c) : null,
        reset_on: c ? formatDate(c.reset_at) : null,
        tip_title: tip.title,
        tip_body: tip.body,
        tip_url: tip.url,
        week_of: weekOf,
      },
    };
  });
}

/** Track `weekly_recap_ready` for everyone with a recap this week. */
export async function runWeeklyRecap(now = new Date()): Promise<{ people: number }> {
  const recaps = await buildWeeklyRecaps(now);
  for (let i = 0; i < recaps.length; i += 10) {
    await Promise.all(recaps.slice(i, i + 10).map((r) => track(r.userId, "weekly_recap_ready", r.data)));
  }
  logger.info({ people: recaps.length }, "Weekly recap events tracked");
  return { people: recaps.length };
}
