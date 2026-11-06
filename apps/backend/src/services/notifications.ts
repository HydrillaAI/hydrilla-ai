import { supabase } from "../db.js";
import { config } from "../config.js";
import { logger } from "../logger.js";
import {
  deletePerson,
  identify,
  sendTransactional,
  track,
  unixSeconds,
  type SendResult,
} from "../lib/customerio.js";
import { FREE_TIER_CREDITS } from "./credits.js";

/**
 * Product moments -> Customer.io. Route code calls these and moves on: every function here
 * is best effort and never throws. Transactional emails are sent directly; campaign emails
 * are started in Customer.io by the events tracked here (see lib/emailCatalog.ts).
 */

/** Links in emails always point at the live site, even from local or preview backends. */
const SITE = (process.env.EMAIL_LINK_BASE_URL || "https://hydrilla.ai").replace(/\/+$/, "");
const STUDIO_URL = `${SITE}/app/studio`;

/** A finished or failed job emails the person only if it ran this long (they have likely left the tab). */
const NOTIFY_AFTER_MS = 3 * 60 * 1000;

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  slot: "Slot",
  slot_pro: "Slot Pro",
};

export function planLabel(plan: string | null | undefined): string {
  if (!plan) return "Hydrilla";
  return PLAN_LABELS[plan] || config.planConfig[plan]?.label || plan;
}

/** "25 Oct 2026" */
function formatDate(value: string | number | Date | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Run in the background; log, never throw. */
function background(label: string, work: () => Promise<unknown>): void {
  void work().catch((err: any) => logger.warn({ err: err?.message, label }, "[notifications] failed"));
}

type Contact = { email: string | null; firstName: string | null; name: string | null };

async function contactFor(userId: string): Promise<Contact> {
  const { data } = await supabase
    .from("users")
    .select("email, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  const name = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim() || null;
  return { email: data?.email || null, firstName: data?.first_name || null, name };
}

async function sendToUser(
  userId: string,
  template: string,
  sender: "hi",
  data: Record<string, unknown> = {}
): Promise<SendResult> {
  const contact = await contactFor(userId);
  if (!contact.email) return { ok: false, error: "User has no email address" };
  return sendTransactional({ template, to: contact.email, identifiers: { id: userId }, sender, data });
}

// ---------------------------------------------------------------- account

export type AccountUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt?: number | string | null;
};

/** New sign-up: profile, the account_created event (starts onboarding), and the welcome signed by Tejesh. */
export function onAccountCreated(user: AccountUser): void {
  background("account_created", async () => {
    await identify(user.id, {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      created_at: unixSeconds(user.createdAt ?? Date.now()),
      plan: "free",
      plan_status: "free",
      credits_remaining: FREE_TIER_CREDITS,
    });
    await track(user.id, "account_created");
    if (user.email) {
      await sendTransactional({
        template: "T01_welcome",
        to: user.email,
        identifiers: { id: user.id },
        sender: "hi",
      });
    }
  });
}

export function onAccountUpdated(user: AccountUser): void {
  background("account_updated", () =>
    identify(user.id, { email: user.email, first_name: user.firstName, last_name: user.lastName })
  );
}

export function onSignedIn(userId: string): void {
  background("signed_in", () => identify(userId, { last_seen_at: unixSeconds(Date.now()) }));
}

/** IANA time zone from the browser (e.g. "Asia/Kolkata"), used for local-time sends. */
export function onTimeZone(userId: string, timezone: string): void {
  background("timezone", () => identify(userId, { timezone }));
}

export function onAccountDeleted(userId: string): void {
  background("account_deleted", () => deletePerson(userId));
}

// ---------------------------------------------------------------- generations

export type JobInfo = {
  userId: string | null | undefined;
  jobId: string;
  kind?: string | null;
  prompt?: string | null;
  createdAt?: string | number | Date | null;
};

function ranLongEnough(createdAt: JobInfo["createdAt"]): boolean {
  if (!createdAt) return false;
  const started = new Date(createdAt).getTime();
  return Number.isFinite(started) && Date.now() - started >= NOTIFY_AFTER_MS;
}

function kindLabel(kind: string | null | undefined): string {
  if (!kind) return "3D";
  if (/image/i.test(kind) && /3d/i.test(kind)) return "image-to-3D";
  if (/text/i.test(kind) && /3d/i.test(kind)) return "text-to-3D";
  return "3D";
}

export function onGenerationCompleted(job: JobInfo & { glbUrl: string; previewUrl?: string | null }): void {
  const userId = job.userId;
  if (!userId) return;
  background("generation_completed", async () => {
    await identify(userId, { last_generation_at: unixSeconds(Date.now()) });
    await track(userId, "generation_completed", {
      job_id: job.jobId,
      kind: kindLabel(job.kind),
      prompt: job.prompt ? job.prompt.slice(0, 200) : null,
      thumbnail_url: job.previewUrl || null,
      download_url: job.glbUrl,
      studio_url: STUDIO_URL,
      notify: ranLongEnough(job.createdAt),
    });
  });
}

export function onGenerationFailed(job: JobInfo & { creditsRefunded: number }): void {
  const userId = job.userId;
  if (!userId) return;
  background("generation_failed", () =>
    track(userId, "generation_failed", {
      job_id: job.jobId,
      kind: kindLabel(job.kind),
      credits_refunded: job.creditsRefunded,
      retry_url: STUDIO_URL,
      notify: ranLongEnough(job.createdAt),
    })
  );
}

// ---------------------------------------------------------------- billing

export function onCheckoutStarted(userId: string | null | undefined, plan: string): void {
  if (!userId) return;
  background("checkout_started", () => track(userId, "checkout_started", { plan, plan_name: planLabel(plan) }));
}

export type PlanActive = {
  userId: string | null;
  email?: string | null;
  plan: string;
  creditsTotal: number;
  isTrial: boolean;
  trialEndsAt?: string | null;
  renewsAt?: string | null;
};

/** Paid plan or trial started (also plan changes). Sends T04 and updates plan attributes. */
export function onPlanActive(p: PlanActive): void {
  const userId = p.userId;
  if (!userId) return;
  background("subscription_activated", async () => {
    await identify(userId, {
      plan: p.plan,
      plan_status: p.isTrial ? "trial" : "active",
      credits_total: p.creditsTotal,
      trial_ends_at: p.isTrial ? unixSeconds(p.trialEndsAt) : null,
    });
    await track(userId, "subscription_activated", { plan: p.plan, is_trial: p.isTrial });
    await sendToUser(userId, "T04_plan-active", "hi", {
      plan_name: planLabel(p.plan),
      credits_total: p.creditsTotal,
      renews_on: formatDate(p.renewsAt),
      is_trial: p.isTrial,
      trial_ends_on: formatDate(p.trialEndsAt),
    });
  });
}

/**
 * Plan cancelled. accessEndsAt is set when the cancellation is scheduled for the end of the
 * period; null when access ended immediately. Callers must only call this once per cancellation.
 */
export function onPlanCancelled(userId: string | null | undefined, plan: string | null, accessEndsAt: string | null): void {
  if (!userId) return;
  background("subscription_cancelled", async () => {
    await identify(userId, { plan_status: "cancelled", access_ends_at: unixSeconds(accessEndsAt) ?? null });
    await track(userId, "subscription_cancelled", { plan: plan || null });
    await sendToUser(userId, "T06_plan-cancelled", "hi", {
      plan_name: planLabel(plan),
      access_ends_on: formatDate(accessEndsAt),
    });
  });
}

export function onPaymentFailed(userId: string | null | undefined, plan: string | null): void {
  if (!userId) return;
  background("payment_failed", async () => {
    await identify(userId, { plan_status: "past_due" });
    await track(userId, "payment_failed", { plan: plan || null, plan_name: planLabel(plan), billing_url: `${SITE}/app/pricing` });
  });
}

export function onPaymentSucceeded(userId: string | null | undefined): void {
  if (!userId) return;
  background("payment_succeeded", () => track(userId, "payment_succeeded"));
}

// ---------------------------------------------------------------- credits

export function onCreditsLow(userId: string, remaining: number, resetAt: string | null): void {
  background("credits_low", async () => {
    await identify(userId, { credits_remaining: remaining });
    await track(userId, "credits_low", { remaining, reset_on: formatDate(resetAt) ?? null, pricing_url: `${SITE}/app/pricing` });
  });
}

export function onCreditsExhausted(userId: string, resetAt: string | null, plan: string | null): void {
  background("credits_exhausted", async () => {
    await identify(userId, { credits_remaining: 0 });
    await track(userId, "credits_exhausted", {
      plan: plan || "free",
      reset_on: formatDate(resetAt) ?? null,
      pricing_url: `${SITE}/app/pricing`,
    });
  });
}

/** Admin added credits directly to an account. Signed by Tejesh. Awaited so the admin sees the result. */
export async function sendCreditsGranted(
  userId: string,
  amount: number,
  reason: string | null,
  balance: number | null
): Promise<SendResult> {
  try {
    return await sendToUser(userId, "T08_credits-granted", "hi", { amount, reason, balance });
  } catch (err: any) {
    return { ok: false, error: err?.message || "Send failed" };
  }
}

// ---------------------------------------------------------------- security

export function onApiKeyCreated(userId: string, keyName: string | null): void {
  background("api_key_created", async () => {
    await track(userId, "api_key_created");
    await sendToUser(userId, "T09_api-key-created", "hi", {
      key_name: keyName || "Untitled",
      created_on: formatDate(Date.now()),
    });
  });
}

// ---------------------------------------------------------------- forms

export type FormKind = "contact" | "enterprise" | "support" | "feedback";

export type FormMessage = {
  kind: FormKind;
  name: string | null;
  email: string | null;
  company?: string | null;
  message: string;
  requestType?: string | null;
  userId?: string | null;
  details?: Record<string, string | null | undefined>;
};

/** Receipt to the sender (T11 or T12) and an alert to the team inbox (INT01). */
export function onFormMessage(m: FormMessage): void {
  background(`form_${m.kind}`, async () => {
    if (m.email) {
      const receipt = m.kind === "enterprise" ? "T12_enterprise-received" : "T11_contact-received";
      await sendTransactional({
        template: receipt,
        to: m.email,
        identifiers: m.userId ? { id: m.userId } : { email: m.email.toLowerCase() },
        sender: "hi",
        data: {
          name: m.name,
          company: m.company || null,
          message: m.message.slice(0, 1000),
          request_type: (m.requestType || "message").toLowerCase(),
        },
      });
    }
    const team = config.customerio.teamInbox;
    await sendTransactional({
      template: "INT01_new-message",
      to: team,
      identifiers: { email: team },
      sender: "hi",
      replyTo: m.email,
      data: {
        kind: m.kind,
        name: m.name || "Unknown",
        email: m.email,
        company: m.company || null,
        request_type: m.requestType || null,
        message: m.message.slice(0, 4000),
        details: Object.entries(m.details || {})
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      },
    });
  });
}

// ---------------------------------------------------------------- internal

let lastGpuAlertAt = 0;

/** Tell the team generation is down. At most one alert every 10 minutes per server instance. */
export function onGpuOffline(userId: string | null, userEmail: string | null, errorMessage: string): void {
  if (Date.now() - lastGpuAlertAt < 10 * 60 * 1000) return;
  lastGpuAlertAt = Date.now();
  const team = config.customerio.teamInbox;
  background("gpu_offline", () =>
    sendTransactional({
      template: "INT02_gpu-offline",
      to: team,
      identifiers: { email: team },
      sender: "hi",
      data: {
        user_id: userId,
        user_email: userEmail,
        error_message: errorMessage.slice(0, 1000),
        reported_at: new Date().toISOString(),
      },
    })
  );
}
