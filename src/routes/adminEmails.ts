import { Router, Request, Response } from "express";
import { logger } from "../logger.js";
import { appApi, appEnabled, sendTransactional, trackEnabled } from "../lib/customerio.js";
import { EMAIL_CATALOG, catalogEntry } from "../lib/emailCatalog.js";
import { buildWeeklyRecaps } from "../services/weeklyRecap.js";

/**
 * Admin Emails System (mounted under /api/admin/emails, admin-only).
 * Everything is read live from Customer.io, so there is no email table to keep in sync.
 */
export const adminEmailsRouter = Router();

type CioTransactional = { id: number; name: string; trigger_name: string; updated_at?: number };
type CioCampaign = { id: number; name: string; state: string; active: boolean; type: string };

const METRIC_KEYS = ["sent", "delivered", "opened", "clicked", "bounced", "spammed", "unsubscribed", "failed"] as const;

function sumSeries(series: Record<string, number[]> | undefined): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const key of METRIC_KEYS) {
    totals[key] = (series?.[key] || []).reduce((a, b) => a + (Number(b) || 0), 0);
  }
  return totals;
}

/** Catalogue code at the start of a template ID, e.g. "T02" from "T02_model-ready". */
function codeOf(id: string): string {
  return id.split("_")[0];
}

/** GET /overview — connection status and 30-day totals for every transactional message. */
adminEmailsRouter.get("/overview", async (_req: Request, res: Response) => {
  try {
    const connected = { track: trackEnabled(), app: appEnabled() };
    if (!connected.app) return res.json({ connected, totals: null, transactional: [], campaigns: [] });

    const [tx, camps] = await Promise.all([
      appApi<{ messages: CioTransactional[] }>("/v1/transactional"),
      appApi<{ campaigns: CioCampaign[] }>("/v1/campaigns"),
    ]);
    const messages = (tx.data?.messages || []).filter((m) => m.trigger_name);
    const withMetrics = await Promise.all(
      messages.map(async (m) => {
        const metrics = await appApi<{ metric?: { series?: Record<string, number[]> } }>(
          `/v1/transactional/${m.id}/metrics?period=days&steps=30`
        );
        return { id: m.id, name: m.name, trigger: m.trigger_name, totals: sumSeries(metrics.data?.metric?.series) };
      })
    );
    const totals = sumSeries(
      Object.fromEntries(METRIC_KEYS.map((k) => [k, withMetrics.map((m) => m.totals[k])])) as Record<string, number[]>
    );
    return res.json({
      connected,
      totals,
      transactional: withMetrics,
      campaigns: (camps.data?.campaigns || []).map((c) => ({ id: c.id, name: c.name, state: c.state, active: c.active })),
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/overview failed");
    return res.status(500).json({ error: "Failed to load email overview" });
  }
});

/** GET /templates — the catalogue, each marked with whether it exists in Customer.io. */
adminEmailsRouter.get("/templates", async (_req: Request, res: Response) => {
  try {
    const [tx, camps, broadcasts] = await Promise.all([
      appApi<{ messages: CioTransactional[] }>("/v1/transactional"),
      appApi<{ campaigns: CioCampaign[] }>("/v1/campaigns"),
      appApi<{ broadcasts: { id: number; name: string }[] }>("/v1/broadcasts"),
    ]);
    const txByTrigger = new Map((tx.data?.messages || []).map((m) => [m.trigger_name.toLowerCase(), m]));
    const campaigns = camps.data?.campaigns || [];
    const broadcastList = broadcasts.data?.broadcasts || [];

    const templates = EMAIL_CATALOG.map((entry) => {
      const code = codeOf(entry.id).toLowerCase();
      if (entry.kind === "transactional") {
        const m = txByTrigger.get(entry.id.toLowerCase());
        return { ...entry, status: m ? "live" : "missing", customerioId: m?.id ?? null };
      }
      // Automations are named with their codes, e.g. "T02 Model ready" or "D01 + D02 Payment failed".
      const pool = entry.kind === "campaign" ? campaigns : broadcastList;
      const codeWord = new RegExp(`(^|\\W)${code}(\\W|$)`, "i");
      const match = pool.find((c: any) => codeWord.test(c.name));
      const state = match && "state" in match ? ((match as CioCampaign).active ? "live" : (match as CioCampaign).state) : match ? "ready" : "missing";
      return { ...entry, status: state, customerioId: match?.id ?? null };
    });
    return res.json({ templates });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/templates failed");
    return res.status(500).json({ error: "Failed to load templates" });
  }
});

type CioMessage = {
  id: string;
  created: number;
  recipient: string;
  subject: string;
  type: string;
  failure_message: string | null;
  campaign_id: number | null;
  broadcast_id: number | null;
  customer_identifiers?: { id?: string | null; email?: string | null };
  metrics?: Record<string, number>;
};

function messageStatus(m: CioMessage): string {
  const order = ["failed", "bounced", "spammed", "unsubscribed", "clicked", "opened", "delivered", "sent", "drafted"];
  return order.find((k) => m.metrics?.[k]) || "queued";
}

function mapMessages(messages: CioMessage[] | undefined) {
  return (messages || []).map((m) => ({
    id: m.id,
    sentAt: m.created ? new Date(m.created * 1000).toISOString() : null,
    to: m.recipient,
    subject: m.subject,
    type: m.type,
    status: messageStatus(m),
    failure: m.failure_message,
    userId: m.customer_identifiers?.id || null,
  }));
}

/** GET /deliveries?limit=50&next=<cursor> — latest sends across all emails. */
adminEmailsRouter.get("/deliveries", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const params = new URLSearchParams({ limit: String(limit) });
    if (typeof req.query.next === "string" && req.query.next) params.set("start", req.query.next);
    const result = await appApi<{ messages: CioMessage[]; next?: string }>(`/v1/messages?${params}`);
    if (!result.ok) return res.status(502).json({ error: "Customer.io did not return deliveries" });
    return res.json({ deliveries: mapMessages(result.data?.messages), next: result.data?.next || null });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/deliveries failed");
    return res.status(500).json({ error: "Failed to load deliveries" });
  }
});

/** GET /people/:userId — one person's email timeline and attributes in Customer.io. */
adminEmailsRouter.get("/people/:userId", async (req: Request, res: Response) => {
  try {
    const id = encodeURIComponent(String(req.params.userId));
    const [attrs, msgs] = await Promise.all([
      appApi<{ customer?: { attributes?: Record<string, unknown>; unsubscribed?: boolean } }>(`/v1/customers/${id}/attributes?id_type=id`),
      appApi<{ messages: CioMessage[] }>(`/v1/customers/${id}/messages?id_type=id&limit=50`),
    ]);
    if (attrs.status === 404) return res.json({ found: false, attributes: null, messages: [] });
    return res.json({
      found: attrs.ok,
      attributes: attrs.data?.customer?.attributes || null,
      messages: mapMessages(msgs.data?.messages),
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/people/:userId failed");
    return res.status(500).json({ error: "Failed to load this person's emails" });
  }
});

/** Sample data so a test send of each transactional template renders realistically. */
const SAMPLE_DATA: Record<string, Record<string, unknown>> = {
  "T04_plan-active": { plan_name: "Pro", credits_total: 3000, renews_on: "25 Nov 2026", is_trial: false },
  "T06_plan-cancelled": { plan_name: "Pro", access_ends_on: "25 Nov 2026" },
  "T08_credits-granted": { amount: 250, reason: "Thanks for the feedback", balance: 340 },
  "T09_api-key-created": { key_name: "Pipeline key", created_on: "25 Oct 2026" },
  "T10_deletion-request": {},
  "T11_contact-received": { name: "Alex", message: "This is a test message from the admin Emails page." },
  "T12_enterprise-received": { name: "Alex", company: "Example Studio" },
  "CL01_claim-link": { name: "Alex", amount: 250, reason: "Beta tester thanks", claim_url: "https://hydrilla.ai/claim/test", expires_on: "30 Nov 2026" },
  "T01_welcome": {},
  "INT01_new-message": { kind: "contact", name: "Alex", email: "alex@example.com", message: "Test alert.", details: "" },
  "INT02_gpu-offline": { user_id: "user_test", user_email: "alex@example.com", error_message: "Test alert.", reported_at: new Date().toISOString() },
};

/** POST /test { templateId } — send a transactional template to the signed-in admin with sample data. */
adminEmailsRouter.post("/test", async (req: Request, res: Response) => {
  try {
    const entry = catalogEntry(String(req.body?.templateId || ""));
    if (!entry) return res.status(400).json({ error: "Unknown template" });
    if (entry.kind !== "transactional") {
      return res.status(400).json({ error: "Campaign emails are tested from Customer.io" });
    }
    const to = req.userEmail;
    if (!to) return res.status(400).json({ error: "Your admin account has no email address" });
    const result = await sendTransactional({
      template: entry.id,
      to,
      identifiers: { email: to.toLowerCase() },
      sender: entry.sender,
      data: SAMPLE_DATA[entry.id] || {},
    });
    if (!result.ok) return res.status(502).json({ error: result.error });
    return res.json({ success: true, sentTo: to });
  } catch (err: any) {
    logger.error({ err: err?.message }, "POST /api/admin/emails/test failed");
    return res.status(500).json({ error: "Test send failed" });
  }
});

/** The weekly recap's "This week at Hydrilla" block lives in two Customer.io snippets. */
const NEWS_SNIPPET = "weekly_news";
const NEWS_JSON_SNIPPET = "weekly_news_json";

type NewsItem = { title: string; blurb: string; url: string };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function newsHtml(items: NewsItem[]): string {
  return items
    .map(
      (i) =>
        `<p style="margin:0 0 12px"><a href="${escapeHtml(i.url)}" style="color:#002664;font-weight:600">${escapeHtml(i.title)}</a><br />${escapeHtml(i.blurb)}</p>`
    )
    .join("");
}

/** GET /news — current weekly news items. */
adminEmailsRouter.get("/news", async (_req: Request, res: Response) => {
  try {
    const result = await appApi<{ snippets: { name: string; value: string }[] }>("/v1/snippets");
    const raw = result.data?.snippets?.find((s) => s.name === NEWS_JSON_SNIPPET)?.value;
    let items: NewsItem[] = [];
    try {
      items = raw ? JSON.parse(raw) : [];
    } catch {
      items = [];
    }
    return res.json({ items });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/news failed");
    return res.status(500).json({ error: "Failed to load news" });
  }
});

/** PUT /news { items } — up to 2 items, written to Customer.io snippets used by W01. */
adminEmailsRouter.put("/news", async (req: Request, res: Response) => {
  try {
    const input = Array.isArray(req.body?.items) ? req.body.items : [];
    const items: NewsItem[] = input
      .slice(0, 2)
      .map((i: any) => ({
        title: String(i?.title || "").trim().slice(0, 80),
        blurb: String(i?.blurb || "").trim().slice(0, 200),
        url: String(i?.url || "").trim(),
      }))
      .filter((i: NewsItem) => i.title && /^https:\/\//.test(i.url));
    const [html, json] = await Promise.all([
      // Customer.io rejects blank snippets; W01 hides the block while the JSON snippet is "[]".
      appApi("/v1/snippets", { method: "PUT", body: { name: NEWS_SNIPPET, value: newsHtml(items) || "<!-- no news -->" } }),
      appApi("/v1/snippets", { method: "PUT", body: { name: NEWS_JSON_SNIPPET, value: JSON.stringify(items) } }),
    ]);
    if (!html.ok || !json.ok) return res.status(502).json({ error: "Customer.io did not save the news" });
    return res.json({ success: true, items });
  } catch (err: any) {
    logger.error({ err: err?.message }, "PUT /api/admin/emails/news failed");
    return res.status(500).json({ error: "Failed to save news" });
  }
});

/** GET /weekly/preview?userId= — the recap a person would get this week (nothing is sent). */
adminEmailsRouter.get("/weekly/preview", async (req: Request, res: Response) => {
  try {
    const userId = typeof req.query.userId === "string" && req.query.userId ? req.query.userId : undefined;
    const recaps = await buildWeeklyRecaps(new Date(), userId);
    return res.json({ people: recaps.length, sample: userId ? recaps[0] || null : recaps.slice(0, 5) });
  } catch (err: any) {
    logger.error({ err: err?.message }, "GET /api/admin/emails/weekly/preview failed");
    return res.status(500).json({ error: "Failed to build the weekly preview" });
  }
});
