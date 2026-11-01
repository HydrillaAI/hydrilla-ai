import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { onCreditsExhausted, onCreditsLow } from "./notifications.js";

/** "Low credits" fires when the balance crosses this share of the period allowance. */
const LOW_CREDITS_SHARE = 0.2;

export const FREE_TIER_CREDITS = 100;

export type CreditsRow = {
  id: string;
  credits_used: number;
  credits_total: number;
  credits_bonus: number;
  plan: string | null;
  reset_at: string | null;
};

type DeductRpcRow = {
  remaining: number;
  success: boolean;
  period_used_after?: number;
  bonus_after?: number;
  period_taken?: number;
  bonus_taken?: number;
};

type RefundRpcRow = {
  remaining: number;
  success: boolean;
  period_used_after?: number;
  bonus_after?: number;
  period_restored?: number;
  bonus_restored?: number;
};

function addOneMonth(from: Date): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export function availableCredits(row: {
  credits_total: number;
  credits_used: number;
  credits_bonus?: number | null;
}): number {
  const period = Math.max(0, Number(row.credits_total) - Number(row.credits_used));
  const bonus = Math.max(0, Number(row.credits_bonus) || 0);
  return period + bonus;
}

function mapCreditsRow(row: Record<string, unknown> | null): CreditsRow | null {
  if (!row) {
    return null;
  }
  return {
    id: String(row.id),
    credits_used: Number(row.credits_used) || 0,
    credits_total: Number(row.credits_total) || 0,
    credits_bonus: Number(row.credits_bonus) || 0,
    plan: (row.plan as string | null) ?? null,
    reset_at: (row.reset_at as string | null) ?? null,
  };
}

/**
 * Get user_credits row for a user (by user_id only).
 */
export async function getCreditsRow(userId: string): Promise<CreditsRow | null> {
  const row = (
    await supabase
      .from("user_credits")
      .select("id, credits_used, credits_total, credits_bonus, plan, reset_at")
      .eq("user_id", userId)
      .maybeSingle()
  ).data;
  return mapCreditsRow(row);
}

async function insertPeriodResetLedger(
  userId: string,
  row: CreditsRow,
  reason: string
): Promise<void> {
  const { error } = await supabase.from("credit_ledger").insert({
    user_id: userId,
    delta: 0,
    balance_total_after: row.credits_total,
    balance_used_after: row.credits_used,
    source: "period_reset",
    reason,
    metadata: {
      credits_bonus: row.credits_bonus,
      reset_at: row.reset_at,
    },
  });
  if (error) {
    logger.warn({ error, userId }, "[Credits] Failed to record period_reset ledger");
  }
}

/**
 * Free tier: when reset_at is due (or missing), hard-reset period to 100/0 and advance reset_at.
 * Bonus is preserved. Paid plans are left alone (Dodo renewal owns their reset).
 * Only skips users with entitled paid access (active / past_due). on_hold / failed / paused
 * are treated as free so they can keep generating after billing fails.
 */
export async function applyFreePeriodResetIfDue(userId: string): Promise<CreditsRow | null> {
  const row = await getCreditsRow(userId);
  if (!row) {
    return null;
  }
  if (row.plan) {
    return row;
  }

  const { data: subs } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .limit(1);
  if (subs && subs.length > 0) {
    return row;
  }

  const now = new Date();
  const resetAt = row.reset_at ? new Date(row.reset_at) : null;
  const due = !resetAt || Number.isNaN(resetAt.getTime()) || resetAt.getTime() <= now.getTime();
  if (!due) {
    return row;
  }

  const base = resetAt && !Number.isNaN(resetAt.getTime()) ? resetAt : now;
  const nextReset = addOneMonth(base);
  // If we jumped multiple months offline, keep advancing until nextReset is in the future.
  while (nextReset.getTime() <= now.getTime()) {
    nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
  }

  const { data: updated, error } = await supabase
    .from("user_credits")
    .update({
      credits_total: FREE_TIER_CREDITS,
      credits_used: 0,
      reset_at: nextReset.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", row.id)
    .select("id, credits_used, credits_total, credits_bonus, plan, reset_at")
    .single();

  if (error || !updated) {
    logger.error({ error, userId }, "Failed to apply free period reset");
    return row;
  }

  const mapped = mapCreditsRow(updated)!;
  await insertPeriodResetLedger(userId, mapped, "Free monthly credit reset");
  logger.info({ userId, resetAt: mapped.reset_at }, "Free-tier credits period reset");
  return mapped;
}

/**
 * Remove what is left of claimed credits whose expiry date has passed.
 * Omit userId to sweep every user. Returns the number of credits expired.
 * Spends also expire inside deduct_user_credits, so a failure here only delays what balances show.
 */
export async function expireCreditGrants(userId?: string): Promise<number> {
  const { data, error } = await supabase.rpc("expire_credit_grants", {
    p_user_id: userId ?? null,
  });
  if (error) {
    logger.warn({ error, userId }, "[Credits] expire_credit_grants RPC failed");
    return 0;
  }
  const expired = Number(data) || 0;
  if (expired > 0) {
    logger.info({ userId, expired }, "[Credits] Expired claimed credits");
  }
  return expired;
}

export type ExpiringCredits = { amount: number; expiresAt: string };

/**
 * Open (not yet expired) claimed credits, soonest first. Each amount is capped so the
 * running total never exceeds the bonus the user actually holds.
 */
export async function listExpiringCredits(userId: string, bonus: number): Promise<ExpiringCredits[]> {
  const { data, error } = await supabase
    .from("credit_grants")
    .select("remaining, expires_at")
    .eq("user_id", userId)
    .is("expired_at", null)
    .gt("remaining", 0)
    .order("expires_at", { ascending: true });

  if (error) {
    logger.warn({ error, userId }, "[Credits] Failed to fetch credit_grants");
    return [];
  }

  const budget = { left: Math.max(0, bonus) };
  return (data || [])
    .map((grant) => {
      const amount = Math.min(Number(grant.remaining) || 0, budget.left);
      budget.left -= amount;
      return { amount, expiresAt: String(grant.expires_at) };
    })
    .filter((grant) => grant.amount > 0);
}

/**
 * Ensure a user has a credits row. Creates free-tier (100 credits) with reset_at if missing.
 */
export async function ensureCreditsRow(userId: string): Promise<CreditsRow | null> {
  const existing = await getCreditsRow(userId);
  if (existing) {
    await expireCreditGrants(userId);
    return applyFreePeriodResetIfDue(userId);
  }

  const resetAt = addOneMonth(new Date()).toISOString();
  logger.info({ userId }, "Creating free-tier credits row (100 credits)");
  const { data: newRow, error: insertErr } = await supabase
    .from("user_credits")
    .insert({
      user_id: userId,
      plan: null,
      credits_total: FREE_TIER_CREDITS,
      credits_used: 0,
      credits_bonus: 0,
      reset_at: resetAt,
    })
    .select("id, credits_used, credits_total, credits_bonus, plan, reset_at")
    .single();

  if (!insertErr && newRow) {
    return mapCreditsRow(newRow);
  }

  if (insertErr?.code === "23505") {
    return applyFreePeriodResetIfDue(userId);
  }

  logger.error({ error: insertErr, userId }, "Failed to create free-tier credits row");
  return null;
}

async function insertSpendLedger(
  userId: string,
  amount: number,
  row: CreditsRow,
  source: "spend" | "refund",
  meta: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("credit_ledger").insert({
    user_id: userId,
    delta: source === "spend" ? -amount : amount,
    balance_total_after: row.credits_total,
    balance_used_after: row.credits_used,
    source,
    reason: source === "spend" ? "Generation spend" : "Generation refund",
    metadata: {
      ...meta,
      credits_bonus: row.credits_bonus,
      remaining: availableCredits(row),
    },
  });
  if (error) {
    logger.warn({ error, userId, source }, "[Credits] Failed to record spend/refund ledger");
  }
}

/**
 * Deduct credits for the user. Atomic RPC only (fail closed if RPC missing).
 * Spends period remaining first, then bonus. on_hold / failed billing does not block spend —
 * those users are on free-tier credits and can keep generating.
 */
export async function deductCredit(
  userId: string,
  amount: number = 1,
  requireCredits: boolean = true
): Promise<{ ok: true; remaining: number } | { ok: false; error: string }> {
  if (amount <= 0) {
    return { ok: true, remaining: 0 };
  }

  const row = await ensureCreditsRow(userId);

  if (!row) {
    if (requireCredits) {
      return { ok: false, error: "No credit balance. Please subscribe to generate." };
    }
    return { ok: true, remaining: 0 };
  }

  const remainingBefore = availableCredits(row);
  if (remainingBefore < amount) {
    onCreditsExhausted(userId, row.reset_at, row.plan);
    return {
      ok: false,
      error: `Insufficient credits. You have ${remainingBefore} left; ${amount} required.`,
    };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("deduct_user_credits", {
    p_credits_row_id: row.id,
    p_amount: amount,
  });

  if (rpcError) {
    logger.error({ error: rpcError, userId }, "deduct_user_credits RPC failed (fail closed)");
    return {
      ok: false,
      error: "Credits service temporarily unavailable. Please try again shortly.",
    };
  }

  if (!rpcData || !Array.isArray(rpcData) || rpcData.length === 0) {
    logger.error({ userId }, "deduct_user_credits RPC returned empty result");
    return {
      ok: false,
      error: "Credits service temporarily unavailable. Please try again shortly.",
    };
  }

  const first = rpcData[0] as DeductRpcRow;
  if (!first.success) {
    onCreditsExhausted(userId, row.reset_at, row.plan);
    return {
      ok: false,
      error: `Insufficient credits. You have ${first.remaining} left; ${amount} required.`,
    };
  }

  const after: CreditsRow = {
    ...row,
    credits_used: Number(first.period_used_after ?? row.credits_used),
    credits_bonus: Number(first.bonus_after ?? row.credits_bonus),
  };
  await insertSpendLedger(userId, amount, after, "spend", {
    period_taken: first.period_taken ?? 0,
    bonus_taken: first.bonus_taken ?? 0,
  });

  logger.info({ userId, remaining: first.remaining }, "Credit deducted (atomic)");

  const lowMark = Math.floor(row.credits_total * LOW_CREDITS_SHARE);
  if (lowMark > 0 && remainingBefore > lowMark && first.remaining <= lowMark) {
    onCreditsLow(userId, first.remaining, row.reset_at);
  }
  return { ok: true, remaining: first.remaining };
}

/** Give back credits charged for an operation that failed upstream. */
export async function refundCredit(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    return;
  }
  const row = await getCreditsRow(userId);
  if (!row) {
    return;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("refund_user_credits", {
    p_credits_row_id: row.id,
    p_amount: amount,
  });

  if (rpcError) {
    logger.error({ error: rpcError, userId, amount }, "refund_user_credits RPC failed (fail closed)");
    return;
  }

  if (!rpcData || !Array.isArray(rpcData) || rpcData.length === 0) {
    logger.error({ userId, amount }, "refund_user_credits RPC returned empty result");
    return;
  }

  const first = rpcData[0] as RefundRpcRow;
  if (!first.success) {
    logger.warn({ userId, amount, first }, "refund_user_credits reported unsuccessful");
    return;
  }

  const after: CreditsRow = {
    ...row,
    credits_used: Number(first.period_used_after ?? row.credits_used),
    credits_bonus: Number(first.bonus_after ?? row.credits_bonus),
  };
  await insertSpendLedger(userId, amount, after, "refund", {
    period_restored: first.period_restored ?? 0,
    bonus_restored: first.bonus_restored ?? 0,
  });

  logger.info({ userId, amount, remaining: first.remaining }, "Credits refunded (atomic)");
}

export interface CreditLedgerRow {
  id: string;
  user_id: string;
  delta: number;
  balance_total_after: number;
  balance_used_after: number;
  source:
    | "admin_grant"
    | "admin_remove"
    | "claim_link"
    | "system"
    | "spend"
    | "refund"
    | "period_reset"
    | "expired";
  reason: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  claim_link_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GrantCreditsOptions {
  reason?: string;
  adminUserId?: string;
  adminEmail?: string;
  source?: "admin_grant" | "claim_link" | "system";
  claimLinkId?: string;
  metadata?: Record<string, unknown>;
}

export interface RemoveCreditsOptions {
  reason?: string;
  adminUserId?: string;
  adminEmail?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Grant credits to a user into credits_bonus (survives period renewal) and log ledger.
 */
export async function grantCredits(
  userId: string,
  amount: number,
  meta: GrantCreditsOptions = {}
): Promise<{ ok: true; remaining: number; total: number; used: number; bonus: number } | { ok: false; error: string }> {
  if (amount <= 0) {
    return { ok: false, error: "Grant amount must be greater than zero." };
  }

  const row = await ensureCreditsRow(userId);
  if (!row) {
    return { ok: false, error: "Failed to load user credits row." };
  }

  const newBonus = row.credits_bonus + amount;
  const { error: updateErr } = await supabase
    .from("user_credits")
    .update({
      credits_bonus: newBonus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateErr) {
    logger.error({ error: updateErr, userId }, "Failed to update user_credits on grant");
    return { ok: false, error: updateErr.message || "Failed to update user credits." };
  }

  const { error: ledgerErr } = await supabase.from("credit_ledger").insert({
    user_id: userId,
    delta: amount,
    balance_total_after: row.credits_total,
    balance_used_after: row.credits_used,
    source: meta.source || "admin_grant",
    reason: meta.reason || null,
    admin_user_id: meta.adminUserId || null,
    admin_email: meta.adminEmail || null,
    claim_link_id: meta.claimLinkId || null,
    metadata: {
      ...(meta.metadata || {}),
      credits_bonus_after: newBonus,
    },
  });

  if (ledgerErr) {
    logger.warn({ error: ledgerErr, userId }, "[Credits] Failed to record credit_ledger row");
  }

  const remaining = availableCredits({
    credits_total: row.credits_total,
    credits_used: row.credits_used,
    credits_bonus: newBonus,
  });
  return {
    ok: true,
    remaining,
    total: row.credits_total,
    used: row.credits_used,
    bonus: newBonus,
  };
}

/**
 * Remove credits from bonus first, then from unused period total (never below used).
 */
export async function removeCredits(
  userId: string,
  amount: number,
  meta: RemoveCreditsOptions = {}
): Promise<
  | { ok: true; remaining: number; total: number; used: number; bonus: number; removed: number }
  | { ok: false; error: string }
> {
  if (amount <= 0) {
    return { ok: false, error: "Remove amount must be greater than zero." };
  }

  const row = await ensureCreditsRow(userId);
  if (!row) {
    return { ok: false, error: "Failed to load user credits row." };
  }

  const fromBonus = Math.min(row.credits_bonus, amount);
  const remainingToRemove = amount - fromBonus;
  const periodUnused = Math.max(0, row.credits_total - row.credits_used);
  const fromPeriod = Math.min(periodUnused, remainingToRemove);
  const actualRemoved = fromBonus + fromPeriod;

  if (actualRemoved <= 0) {
    return { ok: false, error: "Cannot remove credits below used balance." };
  }

  const newBonus = row.credits_bonus - fromBonus;
  const newTotal = row.credits_total - fromPeriod;

  const { error: updateErr } = await supabase
    .from("user_credits")
    .update({
      credits_bonus: newBonus,
      credits_total: newTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateErr) {
    logger.error({ error: updateErr, userId }, "Failed to update user_credits on remove");
    return { ok: false, error: updateErr.message || "Failed to update user credits." };
  }

  const { error: ledgerErr } = await supabase.from("credit_ledger").insert({
    user_id: userId,
    delta: -actualRemoved,
    balance_total_after: newTotal,
    balance_used_after: row.credits_used,
    source: "admin_remove",
    reason: meta.reason || null,
    admin_user_id: meta.adminUserId || null,
    admin_email: meta.adminEmail || null,
    metadata: {
      ...(meta.metadata || {}),
      credits_bonus_after: newBonus,
      from_bonus: fromBonus,
      from_period: fromPeriod,
    },
  });

  if (ledgerErr) {
    logger.warn({ error: ledgerErr, userId }, "[Credits] Failed to record credit_ledger row");
  }

  const remaining = availableCredits({
    credits_total: newTotal,
    credits_used: row.credits_used,
    credits_bonus: newBonus,
  });
  return {
    ok: true,
    remaining,
    total: newTotal,
    used: row.credits_used,
    bonus: newBonus,
    removed: actualRemoved,
  };
}

export type CreditReward = {
  id: string;
  amount: number;
  reason: string | null;
  source: string;
  createdAt: string;
  expiresAt: string | null;
  expiredAt: string | null;
  expiredAmount: number;
};

const USER_REWARD_SOURCES = ["claim_link", "admin_grant", "system"];

/**
 * Credits a user received (claim links, admin and system grants), newest first, with the
 * expiry of each claim. Queried by source so spend rows cannot push rewards out of the page.
 */
export async function listCreditRewards(userId: string): Promise<CreditReward[]> {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("id, delta, reason, source, created_at")
    .eq("user_id", userId)
    .in("source", USER_REWARD_SOURCES)
    .gt("delta", 0)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.warn({ error, userId }, "[Credits] Failed to fetch credit rewards");
    return [];
  }

  const rows = data || [];
  const ledgerIds = rows.map((row) => row.id);
  const grantsResult = ledgerIds.length
    ? await supabase
        .from("credit_grants")
        .select("ledger_id, expires_at, expired_at, expired_amount")
        .eq("user_id", userId)
        .in("ledger_id", ledgerIds)
    : { data: [], error: null };

  if (grantsResult.error) {
    logger.warn({ error: grantsResult.error, userId }, "[Credits] Failed to fetch credit_grants for rewards");
  }

  const grantByLedgerId = new Map(
    (grantsResult.data || []).map((grant) => [String(grant.ledger_id), grant])
  );

  return rows.map((row) => {
    const grant = grantByLedgerId.get(String(row.id));
    return {
      id: row.id,
      amount: Number(row.delta) || 0,
      reason: row.reason,
      source: row.source,
      createdAt: row.created_at,
      expiresAt: grant?.expires_at ?? null,
      expiredAt: grant?.expired_at ?? null,
      expiredAmount: Number(grant?.expired_amount) || 0,
    };
  });
}

/**
 * List credit ledger audit rows for a specific user.
 */
export async function listCreditLedger(userId: string): Promise<CreditLedgerRow[]> {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.warn({ error, userId }, "[Credits] Failed to fetch credit_ledger");
    return [];
  }

  return (data || []) as CreditLedgerRow[];
}
