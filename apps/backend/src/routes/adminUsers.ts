import { Router } from "express";
import { config } from "../config.js";
import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { clerk } from "../middleware/auth.js";
import { expireCreditGrants, grantCredits, removeCredits, listCreditLedger } from "../services/credits.js";
import { sendCreditsGranted } from "../services/notifications.js";
import { coversHour, isValidTimeZone, rangeInZone } from "../services/slotClock.js";
import { getDodoPaymentsClient } from "../lib/dodopayments.js";

export const adminUsersRouter = Router();

type UserRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  has_used_trial?: boolean | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: string;
  plan: string | null;
  dodo_payment_id: string | null;
  dodo_subscription_id: string | null;
  created_at: string;
};

type SubRow = {
  id?: string;
  user_id: string | null;
  plan: string | null;
  status: string;
  product_id: string | null;
  dodo_subscription_id: string | null;
  dodo_customer_id?: string | null;
  recurring_amount?: number | null;
  currency?: string | null;
  customer_name?: string | null;
  current_period_start?: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  is_trial?: boolean | null;
  trial_ends_at?: string | null;
  trial_period_days?: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string;
};

type CreditRow = {
  user_id: string;
  plan: string | null;
  credits_total: number | null;
  credits_used: number | null;
  credits_bonus?: number | null;
  reset_at: string | null;
  subscription_id: string | null;
};

type SlotBookingRow = {
  user_id: string;
  plan: string;
  timezone: string;
  start_hour: number;
  duration_hours: number;
  changed_on: string | null;
};

function emailKey(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

let localClerkIdsCache: { at: number; ids: Set<string> } | null = null;

/** User ids from the development Clerk instance. Those are local sign-ins, not the original accounts. */
async function localClerkUserIds(): Promise<Set<string>> {
  if (!config.clerk.secretKey.startsWith("sk_test_")) return new Set();
  const now = Date.now();
  if (localClerkIdsCache && now - localClerkIdsCache.at < 60_000) return localClerkIdsCache.ids;
  const ids = new Set<string>();
  try {
    let offset = 0;
    for (;;) {
      const page = await clerk.users.getUserList({ limit: 100, offset });
      for (const user of page) ids.add(user.id);
      if (page.length < 100) break;
      offset += page.length;
      if (offset >= 500) break;
    }
    localClerkIdsCache = { at: now, ids };
  } catch (err) {
    logger.warn({ err }, "Could not list local Clerk users");
    return localClerkIdsCache?.ids ?? new Set();
  }
  return ids;
}

function personName(user: UserRow, customerName?: string | null): string | null {
  const fromProfile = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fromProfile || customerName || null;
}

function paymentsForUser(user: UserRow, payments: PaymentRow[]): PaymentRow[] {
  const email = emailKey(user.email);
  return payments.filter((row) => row.user_id === user.id || (email && emailKey(row.email) === email));
}

function publicPayment(row: PaymentRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    amount: row.amount_cents ?? 0,
    currency: row.currency || "INR",
    status: row.status,
    plan: row.plan,
    paymentId: row.dodo_payment_id,
    subscriptionId: row.dodo_subscription_id,
  };
}

function checkIsTrial(sub: SubRow | null | undefined): boolean {
  if (!sub) return false;
  const meta = (sub.metadata || {}) as Record<string, unknown>;
  if (sub.is_trial === true || meta.is_trial === true || meta.is_trial === "true") {
    return true;
  }
  if (
    sub.status === "active" &&
    typeof meta.trial_ends_at === "string" &&
    new Date(meta.trial_ends_at).getTime() > Date.now()
  ) {
    return true;
  }
  if (
    sub.status === "active" &&
    typeof sub.trial_ends_at === "string" &&
    new Date(sub.trial_ends_at).getTime() > Date.now()
  ) {
    return true;
  }
  return false;
}

function isPaidPlan(plan: string | null | undefined): boolean {
  if (!plan) return false;
  const p = plan.toLowerCase();
  return (
    p === "starter" ||
    p === "pro" ||
    p === "slot" ||
    p === "slot_pro" ||
    p === "creator" ||
    p === "studio"
  );
}

function subsForUser(user: UserRow, subs: SubRow[]): SubRow[] {
  const email = emailKey(user.email);
  return subs.filter((row) => {
    if (row.user_id === user.id) return true;
    const meta = (row.metadata || {}) as Record<string, unknown>;
    if (meta.user_id && meta.user_id === user.id) return true;
    if (email) {
      if (emailKey(meta.email as string) === email) return true;
      if (emailKey((row as any).email) === email) return true;
    }
    return false;
  });
}

function pickPrimarySub(ownSubs: SubRow[]): SubRow | null {
  if (ownSubs.length === 0) return null;
  const activeSub = ownSubs.find(
    (s) => s.status === "active" || s.status === "past_due" || s.status === "on_hold"
  );
  if (activeSub) return activeSub;
  return ownSubs[0] || null;
}

function publicSubscription(row: SubRow) {
  const meta = (row.metadata || {}) as Record<string, unknown>;
  const isTrial = checkIsTrial(row);
  const trialEndsAt = isTrial
    ? (meta.trial_ends_at as string) || row.trial_ends_at || row.current_period_end
    : null;
  const trialPeriodDays = isTrial ? Number(row.trial_period_days || meta.trial_period_days || 14) : 0;
  const cancelAtPeriodEnd = meta.cancel_at_next_billing_date === true;
  const nextBillingDate = (meta.next_billing_date as string) || row.current_period_end || null;
  const renewsAt = !cancelAtPeriodEnd && row.status === "active" ? nextBillingDate : null;
  const accessUntil = cancelAtPeriodEnd ? (row.current_period_end || nextBillingDate) : null;

  return {
    subscriptionId: row.dodo_subscription_id,
    plan: row.plan,
    status: row.status,
    isTrial,
    trialEndsAt,
    trialPeriodDays,
    productId: row.product_id,
    recurringAmount: row.recurring_amount ?? null,
    currency: row.currency || "USD",
    periodStart: row.current_period_start || null,
    periodEnd: row.current_period_end || null,
    renewsAt,
    accessUntil,
    cancelledAt: row.cancelled_at,
    cancelAtPeriodEnd,
    createdAt: row.created_at,
    updatedAt: row.updated_at || null,
  };
}

async function loadBillingTables() {
  const [users, payments, subs, credits] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, first_name, last_name, has_used_trial, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("subscription_payments")
      .select("id, user_id, email, amount_cents, currency, status, plan, dodo_payment_id, dodo_subscription_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("user_subscriptions")
      .select("id, user_id, plan, status, product_id, recurring_amount, currency, customer_name, dodo_subscription_id, dodo_customer_id, current_period_start, current_period_end, cancelled_at, is_trial, trial_ends_at, trial_period_days, metadata, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("user_credits")
      .select("user_id, plan, credits_total, credits_used, credits_bonus, reset_at, subscription_id")
      .limit(1000),
  ]);
  if (users.error) throw users.error;
  if (payments.error) throw payments.error;
  if (subs.error) throw subs.error;
  if (credits.error) throw credits.error;
  return {
    users: (users.data || []) as UserRow[],
    payments: (payments.data || []) as PaymentRow[],
    subs: (subs.data || []) as SubRow[],
    credits: (credits.data || []) as CreditRow[],
  };
}

function isSlotPlan(plan: string | null | undefined): boolean {
  return plan === "slot" || plan === "slot_pro";
}

/** Slot hour for admin. Null for every other plan. Missing table returns an empty map so the user list still loads. */
async function loadSlotBookings(): Promise<Map<string, SlotBookingRow>> {
  try {
    const { data, error } = await supabase
      .from("slot_bookings")
      .select("user_id, plan, timezone, start_hour, duration_hours, changed_on");
    if (error) {
      logger.warn({ err: error }, "slot_bookings unavailable; admin users omit hours");
      return new Map();
    }
    return new Map(((data || []) as SlotBookingRow[]).map((row) => [row.user_id, row]));
  } catch (err) {
    logger.warn({ err }, "slot_bookings unavailable; admin users omit hours");
    return new Map();
  }
}

function publicSlot(plan: string | null, booking: SlotBookingRow | undefined) {
  const slotPlan = isSlotPlan(plan) ? plan : isSlotPlan(booking?.plan) ? booking?.plan : null;
  if (!slotPlan) return null;
  if (!booking) {
    return {
      plan: slotPlan,
      timezone: null,
      startHour: null,
      durationHours: slotPlan === "slot_pro" ? 2 : 1,
      label: null,
      open: false,
      changedOn: null,
    };
  }
  const zone = isValidTimeZone(booking.timezone) ? booking.timezone : "UTC";
  const now = new Date();
  return {
    plan: booking.plan,
    timezone: zone,
    startHour: booking.start_hour,
    durationHours: booking.duration_hours,
    label: rangeInZone(booking.start_hour, booking.duration_hours, zone, now),
    open: coversHour(booking.start_hour, booking.duration_hours, now.getUTCHours()),
    changedOn: booking.changed_on,
  };
}

function summarize(
  user: UserRow,
  payments: PaymentRow[],
  subs: SubRow[],
  credit: CreditRow | undefined,
  booking: SlotBookingRow | undefined
) {
  const mine = paymentsForUser(user, payments);
  const ownSubs = subsForUser(user, subs);
  const latest = pickPrimarySub(ownSubs);
  const meta = (latest?.metadata || {}) as Record<string, unknown>;
  const isTrial = checkIsTrial(latest);
  const trialEndsAt = isTrial
    ? (meta.trial_ends_at as string) || latest?.trial_ends_at || latest?.current_period_end || null
    : null;
  const cancelAtPeriodEnd = meta.cancel_at_next_billing_date === true;
  const nextBillingDate = (meta.next_billing_date as string) || latest?.current_period_end || null;
  const renewsAt = latest?.status === "active" && !cancelAtPeriodEnd ? (nextBillingDate || credit?.reset_at || null) : null;
  const accessUntil = cancelAtPeriodEnd ? (latest?.current_period_end || nextBillingDate) : null;

  const hasActiveSub = latest?.status === "active" || latest?.status === "past_due";
  const plan = latest?.plan || credit?.plan || null;
  const paidPlan = isPaidPlan(plan);
  const paying = Boolean(hasActiveSub && paidPlan && !isTrial);
  const hasPaidBefore = mine.some((row) => row.status === "succeeded");

  const hasUsedTrial = Boolean(
    user.has_used_trial === true ||
    ownSubs.some((s) => checkIsTrial(s) || (s.metadata as any)?.is_trial === true || Number((s.metadata as any)?.trial_period_days || 0) > 0)
  );

  const last = mine[0] || null;
  return {
    id: user.id,
    email: user.email,
    name: personName(user, latest?.customer_name || null),
    createdAt: user.created_at,
    paying,
    hasPaidBefore,
    isTrial,
    trialEndsAt,
    trialPeriodDays: isTrial ? Number(latest?.trial_period_days || meta.trial_period_days || 14) : 0,
    hasUsedTrial,
    plan,
    subscriptionStatus: latest?.status || null,
    cancelAtPeriodEnd,
    periodEnd: latest?.current_period_end || null,
    renewsAt,
    accessUntil,
    recurringAmount: latest?.recurring_amount ?? null,
    currency: latest?.currency || "USD",
    creditsUsed: credit?.credits_used ?? 0,
    creditsTotal: credit?.credits_total ?? 0,
    creditsBonus: credit?.credits_bonus ?? 0,
    creditsResetAt: credit?.reset_at || null,
    lastPaymentAt: last?.created_at || null,
    lastPaymentAmount: last?.amount_cents ?? null,
    lastPaymentCurrency: last?.currency || null,
    lastPaymentStatus: last?.status || null,
    paymentCount: mine.length,
    slot: publicSlot(latest?.plan || credit?.plan || null, booking),
  };
}

adminUsersRouter.get("/", async (req, res) => {
  try {
    const filter = String(req.query.filter || "all");
    const [{ users, payments, subs, credits }, slots] = await Promise.all([loadBillingTables(), loadSlotBookings()]);
    const localIds = await localClerkUserIds();
    const people = users.filter((user) => !localIds.has(user.id));
    const visiblePayments = payments.filter((row) => !row.user_id || !localIds.has(row.user_id));
    const creditByUser = new Map(credits.map((row) => [row.user_id, row]));
    const rows = people.map((user) =>
      summarize(user, visiblePayments, subs, creditByUser.get(user.id), slots.get(user.id))
    );

    const payingCount = rows.filter((r) => r.paying).length;
    const trialCount = rows.filter((r) => r.isTrial).length;
    const cancelledCount = rows.filter(
      (r) => r.cancelAtPeriodEnd || r.subscriptionStatus === "cancelled" || r.subscriptionStatus === "expired"
    ).length;
    const freeCount = rows.filter((r) => !r.paying && !r.isTrial).length;

    let filtered = rows;
    if (filter === "paying") {
      filtered = rows.filter((r) => r.paying);
    } else if (filter === "trial") {
      filtered = rows.filter((r) => r.isTrial);
    } else if (filter === "cancelled") {
      filtered = rows.filter(
        (r) => r.cancelAtPeriodEnd || r.subscriptionStatus === "cancelled" || r.subscriptionStatus === "expired"
      );
    } else if (filter === "free") {
      filtered = rows.filter((r) => !r.paying && !r.isTrial);
    }

    res.json({
      filter,
      totalCount: rows.length,
      payingCount,
      trialCount,
      cancelledCount,
      freeCount,
      users: filtered,
    });
  } catch (err: any) {
    logger.error({ err }, "GET /api/admin/users failed");
    res.status(500).json({ error: "Failed to load users" });
  }
});

adminUsersRouter.get("/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId || "");
    await expireCreditGrants(userId);
    const [{ users, payments, subs, credits }, slots] = await Promise.all([loadBillingTables(), loadSlotBookings()]);
    // Test accounts from the local Clerk instance stay out of the users list, but a page opened
    // for one directly (for example from "Claimed by") still loads.
    const localIds = await localClerkUserIds();
    // The bulk tables only hold the newest rows, so load this user's own rows directly when missing.
    const user =
      users.find((row) => row.id === userId) ??
      ((
        await supabase
          .from("users")
          .select("id, email, first_name, last_name, has_used_trial, created_at")
          .eq("id", userId)
          .maybeSingle()
      ).data as UserRow | null);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const visiblePayments = payments.filter(
      (row) => !row.user_id || row.user_id === userId || !localIds.has(row.user_id)
    );
    const credit =
      credits.find((row) => row.user_id === userId) ??
      ((
        await supabase
          .from("user_credits")
          .select("user_id, plan, credits_total, credits_used, credits_bonus, reset_at, subscription_id")
          .eq("user_id", userId)
          .maybeSingle()
      ).data as CreditRow | null) ??
      undefined;
    const summary = summarize(user, visiblePayments, subs, credit, slots.get(userId));
    const history = paymentsForUser(user, visiblePayments).map(publicPayment);
    const subscriptions = subsForUser(user, subs).map(publicSubscription);

    const [jobsRes, creditLedger] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, status, generate_type, credits_used, created_at, prompt, engine")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      listCreditLedger(userId),
    ]);

    const jobs = (jobsRes.data || []).map((job) => ({
      id: job.id,
      status: job.status,
      generateType: job.generate_type,
      creditsUsed: job.credits_used ?? 0,
      createdAt: job.created_at,
      prompt: job.prompt || null,
      engine: job.engine || null,
    }));

    return res.json({
      user: summary,
      subscriptions,
      payments: history,
      jobs,
      creditLedger,
    });
  } catch (err: any) {
    logger.error({ err }, "GET /api/admin/users/:userId failed");
    return res.status(500).json({ error: "Failed to load user" });
  }
});

/**
 * Manually synchronize a user's subscription and payments directly from Dodo Payments.
 * Updates user_subscriptions, subscription_payments, and resets credits/dates accordingly.
 */
adminUsersRouter.post("/:userId/sync", async (req, res) => {
  try {
    const userId = String(req.params.userId || "");
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", userId)
      .maybeSingle();

    if (!userRow) return res.status(404).json({ error: "User not found" });

    const { data: userSubs } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const targetSub = userSubs?.find((s) => s.dodo_subscription_id) || null;
    if (!targetSub?.dodo_subscription_id) {
      return res.status(400).json({ error: "No Dodo subscription found on this user to sync" });
    }

    const dodo = getDodoPaymentsClient();
    const subscriptionId = targetSub.dodo_subscription_id;
    const sub: any = await dodo.subscriptions.retrieve(subscriptionId);

    const trialDays = Number(sub.trial_period_days ?? 0);
    const isTrial = Boolean(
      (trialDays > 0 && (sub.trial_amount == null || Number(sub.trial_amount) === 0)) ||
      sub.metadata?.is_trial === true ||
      sub.metadata?.is_trial === "true"
    );
    const trialEndsAt = isTrial ? (sub.next_billing_date || null) : null;
    const cancelScheduled = sub.cancel_at_next_billing_date === true;

    const existingMeta = targetSub.metadata && typeof targetSub.metadata === "object" ? targetSub.metadata : {};
    const updatePayload: Record<string, unknown> = {
      status: sub.status || targetSub.status,
      product_id: sub.product_id || targetSub.product_id,
      recurring_amount: sub.recurring_pre_tax_amount ?? targetSub.recurring_amount,
      currency: sub.currency || targetSub.currency || "INR",
      customer_name: sub.customer?.name || sub.customer_name || targetSub.customer_name || null,
      current_period_start: sub.previous_billing_date || sub.current_period_start || targetSub.current_period_start,
      current_period_end: sub.next_billing_date || sub.current_period_end || targetSub.current_period_end,
      is_trial: isTrial,
      trial_ends_at: trialEndsAt,
      trial_period_days: trialDays,
      metadata: {
        ...existingMeta,
        ...(sub.metadata || {}),
        cancel_at_next_billing_date: cancelScheduled,
        next_billing_date: sub.next_billing_date,
        is_trial: isTrial,
        trial_ends_at: trialEndsAt,
        trial_period_days: trialDays,
        last_synced_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    };

    if (sub.status === "cancelled" || sub.status === "expired") {
      updatePayload.cancelled_at = new Date().toISOString();
    }

    await supabase
      .from("user_subscriptions")
      .update(updatePayload)
      .eq("dodo_subscription_id", subscriptionId);

    try {
      const payList = await dodo.payments.list({ subscription_id: subscriptionId, page_size: 10 });
      const items = payList.items || [];
      for (const rawItem of items) {
        const item = rawItem as any;
        if (item.payment_id) {
          const payStatus = item.status === "succeeded" ? "succeeded" : item.status === "refunded" ? "refunded" : "failed";
          await supabase
            .from("subscription_payments")
            .upsert(
              {
                user_id: userId,
                email: userRow.email,
                dodo_payment_id: item.payment_id,
                dodo_subscription_id: subscriptionId,
                amount_cents: item.total_amount ?? item.amount ?? 0,
                currency: item.currency || "INR",
                status: payStatus,
                created_at: item.created_at || new Date().toISOString(),
              },
              { onConflict: "dodo_payment_id" }
            );
        }
      }
    } catch (err: any) {
      logger.warn({ err: err?.message, subscriptionId }, "Could not sync payments for subscription");
    }

    if (sub.status === "active" && sub.next_billing_date) {
      await supabase
        .from("user_credits")
        .update({ reset_at: sub.next_billing_date, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    logger.info({ userId, subscriptionId, status: sub.status }, "Admin synced user subscription from Dodo Payments");

    res.json({
      ok: true,
      message: "Subscription synced successfully from Dodo Payments",
      status: sub.status,
      renewsAt: sub.next_billing_date,
      isTrial,
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to sync subscription");
    res.status(500).json({ error: err?.message || "Failed to sync subscription" });
  }
});

adminUsersRouter.post("/:userId/credits", async (req, res) => {
  try {
    const userId = String(req.params.userId || "");
    const amount = Number(req.body.amount);
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    const action = req.body.action === "remove" ? "remove" : "add";
    const sendEmail = req.body.sendEmail !== false;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    if (action === "remove") {
      const result = await removeCredits(userId, amount, {
        reason: reason || undefined,
        adminUserId: req.userId,
        adminEmail: req.userEmail,
      });

      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        success: true,
        action: "remove",
        amount: result.removed,
        remaining: result.remaining,
        total: result.total,
        used: result.used,
        bonus: result.bonus,
      });
    }

    const result = await grantCredits(userId, amount, {
      reason: reason || undefined,
      adminUserId: req.userId,
      adminEmail: req.userEmail,
      source: "admin_grant",
    });

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    const emailResult =
      sendEmail && userRow?.email
        ? await sendCreditsGranted(userId, amount, reason || null, result.remaining)
        : null;

    return res.json({
      success: true,
      action: "add",
      amount,
      remaining: result.remaining,
      total: result.total,
      used: result.used,
      bonus: result.bonus,
      emailSent: emailResult ? emailResult.ok : false,
      emailError: emailResult && !emailResult.ok ? emailResult.error : undefined,
    });
  } catch (err: any) {
    logger.error({ err, userId: req.params.userId }, "POST /api/admin/users/:userId/credits failed");
    return res.status(500).json({ error: "Failed to update user credits" });
  }
});

adminUsersRouter.get("/:userId/credits/history", async (req, res) => {
  try {
    const userId = String(req.params.userId || "");
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const history = await listCreditLedger(userId);
    return res.json({ history });
  } catch (err: any) {
    logger.error({ err, userId: req.params.userId }, "GET /api/admin/users/:userId/credits/history failed");
    return res.status(500).json({ error: "Failed to fetch credit history" });
  }
});
