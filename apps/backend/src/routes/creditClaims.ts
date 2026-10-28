import { Router, Request, Response } from "express";
import crypto from "crypto";
import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { config } from "../config.js";
import { clerk, optionalAuth, requireAuth } from "../middleware/auth.js";

export const adminCreditClaimsRouter = Router();
export const publicCreditClaimsRouter = Router();

async function getUserDetails(userId: string): Promise<{ email: string | null; name: string | null }> {
  const { data: dbUser } = await supabase
    .from("users")
    .select("email, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (dbUser?.email) {
    const fullName = [dbUser.first_name, dbUser.last_name].filter(Boolean).join(" ").trim() || null;
    return { email: dbUser.email, name: fullName };
  }

  try {
    const clerkUser = await clerk.users.getUser(userId);
    const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
    const email = primary?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || null;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || null;
    return { email, name };
  } catch (err: any) {
    logger.warn({ err: err?.message, userId }, "Failed to fetch user details from Clerk");
    return { email: null, name: null };
  }
}

/** Optional ISO date from a request body: null when empty, "invalid" when it does not parse. */
function parseOptionalDate(value: unknown): string | null | "invalid" {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return "invalid";
  }
  return date.toISOString();
}

function isPast(iso: string | null | undefined): boolean {
  return Boolean(iso) && new Date(iso as string).getTime() <= Date.now();
}

// ============================================================
// Admin Routes (mounted under /api/admin/credit-claims)
// ============================================================

adminCreditClaimsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const amount = Number(req.body.amount);
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : null;
    const expiresAt = parseOptionalDate(req.body.expiresAt);
    const creditsExpireAt = parseOptionalDate(req.body.creditsExpireAt);
    const maxClaims = Number(req.body.maxClaims);
    const claimsLimit = Number.isInteger(maxClaims) && maxClaims > 0 ? maxClaims : 1;
    const rawAllowedEmail = typeof req.body.allowedEmail === "string" ? req.body.allowedEmail.trim() : "";
    const allowedEmail = rawAllowedEmail ? rawAllowedEmail.toLowerCase() : null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    if (expiresAt === "invalid" || creditsExpireAt === "invalid") {
      return res.status(400).json({ error: "Invalid date" });
    }
    if (isPast(creditsExpireAt)) {
      return res.status(400).json({ error: "Credit expiry must be in the future" });
    }
    if (expiresAt && creditsExpireAt && new Date(creditsExpireAt) < new Date(expiresAt)) {
      return res.status(400).json({ error: "Credits cannot expire before the link stops accepting claims" });
    }

    const token = crypto.randomBytes(16).toString("hex");

    const { data: link, error } = await supabase
      .from("credit_claim_links")
      .insert({
        token,
        amount,
        reason,
        expires_at: expiresAt,
        credits_expire_at: creditsExpireAt,
        max_claims: claimsLimit,
        claims_used: 0,
        status: "active",
        allowed_email: allowedEmail,
        created_by_admin_id: req.userId || null,
        created_by_admin_email: req.userEmail || null,
      })
      .select("*")
      .single();

    if (error || !link) {
      logger.error({ error }, "Failed to create credit claim link");
      return res.status(500).json({ error: error?.message || "Failed to create claim link" });
    }

    const claimUrl = `${config.frontendUrl}/claim/${link.token}`;
    return res.json({
      success: true,
      link,
      claimUrl,
    });
  } catch (err: any) {
    logger.error({ err }, "POST /api/admin/credit-claims failed");
    return res.status(500).json({ error: "Failed to create claim link" });
  }
});

adminCreditClaimsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const baseQuery = supabase.from("credit_claim_links").select("*");
    const filteredQuery = req.query.status === "active" || req.query.status === "disabled"
      ? baseQuery.eq("status", req.query.status)
      : baseQuery;

    const { data, error } = await filteredQuery.order("created_at", { ascending: false }).limit(200);

    if (error) {
      logger.error({ error }, "Failed to list credit claim links");
      return res.status(500).json({ error: "Failed to list claim links" });
    }

    const links = (data || []).map((link) => ({
      ...link,
      claimUrl: `${config.frontendUrl}/claim/${link.token}`,
    }));

    return res.json({ links });
  } catch (err: any) {
    logger.error({ err }, "GET /api/admin/credit-claims failed");
    return res.status(500).json({ error: "Failed to list claim links" });
  }
});

adminCreditClaimsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Link ID is required" });
    }

    const patchPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof req.body.status === "string" && ["active", "disabled"].includes(req.body.status)) {
      patchPayload.status = req.body.status;
    }
    if (req.body.expiresAt !== undefined) {
      const expiresAt = parseOptionalDate(req.body.expiresAt);
      if (expiresAt === "invalid") {
        return res.status(400).json({ error: "Invalid date" });
      }
      patchPayload.expires_at = expiresAt;
    }
    // Applies to future claims only; credits already claimed keep the date they were claimed with.
    if (req.body.creditsExpireAt !== undefined) {
      const creditsExpireAt = parseOptionalDate(req.body.creditsExpireAt);
      if (creditsExpireAt === "invalid" || isPast(creditsExpireAt)) {
        return res.status(400).json({ error: "Credit expiry must be a future date" });
      }
      patchPayload.credits_expire_at = creditsExpireAt;
    }
    if (typeof req.body.maxClaims === "number" && req.body.maxClaims > 0) {
      patchPayload.max_claims = req.body.maxClaims;
    }

    const { data: updated, error } = await supabase
      .from("credit_claim_links")
      .update(patchPayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      logger.error({ error, id }, "Failed to update credit claim link");
      return res.status(500).json({ error: "Failed to update claim link" });
    }

    if (!updated) {
      return res.status(404).json({ error: "Claim link not found" });
    }

    return res.json({
      success: true,
      link: {
        ...updated,
        claimUrl: `${config.frontendUrl}/claim/${updated.token}`,
      },
    });
  } catch (err: any) {
    logger.error({ err, id: req.params.id }, "PATCH /api/admin/credit-claims/:id failed");
    return res.status(500).json({ error: "Failed to update claim link" });
  }
});

/**
 * Claims made through claim links, newest first, with the account that claimed, the link it
 * came from, and what is left of credits that expire. Pass linkId to limit to one link.
 */
async function listClaims(linkId?: string) {
  const baseQuery = supabase
    .from("credit_ledger")
    .select("id, user_id, delta, created_at, claim_link_id")
    .eq("source", "claim_link")
    .not("claim_link_id", "is", null);
  const { data: rows, error } = await (linkId ? baseQuery.eq("claim_link_id", linkId) : baseQuery)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  const claims = rows || [];
  const userIds = [...new Set(claims.map((row) => row.user_id))];
  const linkIds = [...new Set(claims.map((row) => String(row.claim_link_id)))];
  const ledgerIds = claims.map((row) => row.id);

  const [usersRes, linksRes, grantsRes] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, email, first_name, last_name").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    linkIds.length
      ? supabase.from("credit_claim_links").select("id, token, reason").in("id", linkIds)
      : Promise.resolve({ data: [], error: null }),
    ledgerIds.length
      ? supabase
          .from("credit_grants")
          .select("ledger_id, remaining, expires_at, expired_at, expired_amount")
          .in("ledger_id", ledgerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (usersRes.error || linksRes.error || grantsRes.error) {
    logger.warn(
      { usersError: usersRes.error, linksError: linksRes.error, grantsError: grantsRes.error, linkId },
      "Partial data while listing credit claims"
    );
  }

  const userById = new Map((usersRes.data || []).map((user) => [user.id, user]));
  const linkById = new Map((linksRes.data || []).map((link) => [String(link.id), link]));
  const grantByLedgerId = new Map((grantsRes.data || []).map((grant) => [String(grant.ledger_id), grant]));

  return claims.map((row) => {
    const user = userById.get(row.user_id);
    const link = linkById.get(String(row.claim_link_id));
    const grant = grantByLedgerId.get(String(row.id));
    return {
      id: row.id,
      userId: row.user_id,
      email: user?.email ?? null,
      name: [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || null,
      amount: Number(row.delta) || 0,
      claimedAt: row.created_at,
      linkId: String(row.claim_link_id),
      linkToken: link?.token ?? null,
      linkReason: link?.reason ?? null,
      expiresAt: grant?.expires_at ?? null,
      expiredAt: grant?.expired_at ?? null,
      expiredAmount: Number(grant?.expired_amount) || 0,
      remaining: grant ? Number(grant.remaining) || 0 : null,
    };
  });
}

/** GET /api/admin/credit-claims/claims?linkId= — who claimed, across all links or one. */
adminCreditClaimsRouter.get("/claims", async (req: Request, res: Response) => {
  try {
    const linkId = typeof req.query.linkId === "string" && req.query.linkId ? req.query.linkId : undefined;
    return res.json({ claims: await listClaims(linkId) });
  } catch (err: any) {
    logger.error({ err }, "GET /api/admin/credit-claims/claims failed");
    return res.status(500).json({ error: "Failed to list claims" });
  }
});

// ============================================================
// Public / User Routes (mounted under /api/credits/claim)
// ============================================================

publicCreditClaimsRouter.get("/:token", optionalAuth, async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token || "").trim();
    if (!token) {
      return res.status(400).json({ error: "Token is required", status: "not_found" });
    }

    const { data: link, error } = await supabase
      .from("credit_claim_links")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error || !link) {
      return res.status(404).json({
        status: "not_found",
        error: "Claim link not found or invalid.",
      });
    }

    const base = {
      amount: link.amount,
      reason: link.reason,
      expiresAt: link.expires_at,
      creditsExpireAt: link.credits_expire_at ?? null,
    };

    // Checked first so someone who used up a single-use link sees "already claimed", not "exhausted".
    if (req.userId) {
      const { data: alreadyClaimed } = await supabase
        .from("credit_ledger")
        .select("id")
        .eq("claim_link_id", link.id)
        .eq("user_id", req.userId)
        .eq("source", "claim_link")
        .limit(1);

      if (alreadyClaimed && alreadyClaimed.length > 0) {
        return res.json({ ...base, status: "exhausted", alreadyClaimedByUser: true });
      }
    }

    if (link.status === "disabled") {
      return res.json({ ...base, status: "disabled" });
    }

    if (isPast(link.expires_at) || isPast(link.credits_expire_at)) {
      return res.json({ ...base, status: "expired" });
    }

    if (link.claims_used >= link.max_claims) {
      return res.json({ ...base, status: "exhausted" });
    }

    if (req.userId) {
      if (link.allowed_email) {
        const userDetails = await getUserDetails(req.userId);
        const linkEmail = link.allowed_email.trim().toLowerCase();
        const userEmail = (userDetails.email || "").trim().toLowerCase();

        if (!userEmail || userEmail !== linkEmail) {
          return res.json({
            ...base,
            status: "email_mismatch",
            allowedEmail: link.allowed_email,
            userEmail: userDetails.email,
          });
        }
      }

      return res.json({ ...base, status: "ok", requiresAuth: false });
    }

    return res.json({ ...base, status: "ok", requiresAuth: true });
  } catch (err: any) {
    logger.error({ err, token: req.params.token }, "GET /api/credits/claim/:token failed");
    return res.status(500).json({ error: "Failed to inspect claim link", status: "not_found" });
  }
});

publicCreditClaimsRouter.post("/:token", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token || "").trim();
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userDetails = await getUserDetails(userId);

    // Atomic claim: lock link, increment claims_used, grant into credits_bonus, ledger — one RPC.
    const { data: rpcData, error: rpcError } = await supabase.rpc("claim_credit_link", {
      p_token: token,
      p_user_id: userId,
      p_user_email: userDetails.email || null,
    });

    if (rpcError) {
      logger.error({ error: rpcError, token, userId }, "claim_credit_link RPC failed");
      return res.status(500).json({ error: "Failed to claim credits" });
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!row) {
      return res.status(500).json({ error: "Failed to claim credits" });
    }

    if (!row.success) {
      const code = String(row.error_code || "failed");
      if (code === "not_found") {
        return res.status(404).json({ error: "Claim link not found", status: "not_found" });
      }
      if (code === "disabled") {
        return res.status(400).json({ error: "This claim link has been disabled", status: "disabled" });
      }
      if (code === "expired") {
        return res.status(400).json({ error: "This claim link has expired", status: "expired" });
      }
      if (code === "exhausted" || code === "already_claimed") {
        return res.status(400).json({
          error:
            code === "already_claimed"
              ? "You have already claimed this credit link"
              : "This claim link has reached its maximum claims",
          status: "exhausted",
        });
      }
      if (code === "email_mismatch") {
        return res.status(403).json({
          error: "This credit link is restricted to a different email",
          status: "email_mismatch",
        });
      }
      return res.status(400).json({ error: "Unable to claim this credit link", status: code });
    }

    const amount = Number(row.amount) || 0;
    const remaining = Number(row.remaining) || 0;

    // No email on claim: the person sees the result on screen.
    return res.json({
      success: true,
      amount,
      remaining,
      total: Number(row.total) || 0,
      bonus: Number(row.bonus) || 0,
      creditsExpireAt: row.credits_expire_at ?? null,
    });
  } catch (err: any) {
    logger.error({ err, token: req.params.token }, "POST /api/credits/claim/:token failed");
    return res.status(500).json({ error: "Failed to claim credits" });
  }
});
