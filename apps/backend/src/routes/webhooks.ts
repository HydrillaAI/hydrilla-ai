import { Router, Request, Response } from "express";
import { Webhook } from "standardwebhooks";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { syncUserToDatabase } from "../middleware/auth.js";
import {
  onAccountCreated,
  onAccountDeleted,
  onAccountUpdated,
  onSignedIn,
} from "../services/notifications.js";

/**
 * Inbound webhooks (mounted under /api/webhooks with a raw body parser).
 * POST /clerk — Clerk user and session events, signed with Svix (Standard Webhooks).
 *   Set the endpoint in Clerk to https://<backend>/api/webhooks/clerk with events
 *   user.created, user.updated, user.deleted, session.created, then set CLERK_WEBHOOK_SECRET.
 */
export const webhooksRouter = Router();

type ClerkEmail = { id: string; email_address: string };
type ClerkUser = {
  id: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  created_at?: number;
};

function primaryEmail(u: ClerkUser): string | null {
  const list = u.email_addresses || [];
  return list.find((e) => e.id === u.primary_email_address_id)?.email_address || list[0]?.email_address || null;
}

webhooksRouter.post("/clerk", async (req: Request, res: Response) => {
  if (!config.clerkWebhookSecret) {
    return res.status(503).json({ error: "Clerk webhook is not configured" });
  }

  const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body ?? {});
  // Svix uses the Standard Webhooks scheme with svix-* header names.
  const headers = {
    "webhook-id": req.header("svix-id") || req.header("webhook-id") || "",
    "webhook-timestamp": req.header("svix-timestamp") || req.header("webhook-timestamp") || "",
    "webhook-signature": req.header("svix-signature") || req.header("webhook-signature") || "",
  };

  let event: { type: string; data: any };
  try {
    event = new Webhook(config.clerkWebhookSecret).verify(payload, headers) as { type: string; data: any };
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Clerk webhook signature check failed");
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "user.created": {
        const u = event.data as ClerkUser;
        await syncUserToDatabase(u.id);
        onAccountCreated({
          id: u.id,
          email: primaryEmail(u),
          firstName: u.first_name ?? null,
          lastName: u.last_name ?? null,
          createdAt: u.created_at ?? Date.now(),
        });
        break;
      }
      case "user.updated": {
        const u = event.data as ClerkUser;
        onAccountUpdated({ id: u.id, email: primaryEmail(u), firstName: u.first_name ?? null, lastName: u.last_name ?? null });
        break;
      }
      case "user.deleted":
        if (event.data?.id) onAccountDeleted(event.data.id);
        break;
      case "session.created":
        if (event.data?.user_id) onSignedIn(event.data.user_id);
        break;
      default:
        break;
    }
    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err?.message, type: event.type }, "Clerk webhook handling failed");
    // Acknowledge anyway so Clerk does not retry an event we partly handled.
    return res.json({ ok: false });
  }
});
