import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Customer.io client.
 * - Track API: people (identify) and events (track). Basic auth with site ID + Track API key.
 * - App API: transactional sends and reads for the admin Emails pages. Bearer App API key.
 * Every call is best effort: it logs and returns, and never throws into product code.
 */

export type Attributes = Record<string, string | number | boolean | null | undefined>;

/** One sender for every email. Replies go to the real mailbox on the root domain. */
export const SENDERS = {
  hi: { from: "Hydrilla <hi@mail.hydrilla.ai>", replyTo: "hi@hydrilla.ai" },
} as const;

export type SenderKey = keyof typeof SENDERS;

function trackBase(): string {
  return config.customerio.region === "eu" ? "https://track-eu.customer.io" : "https://track.customer.io";
}

function appBase(): string {
  return config.customerio.region === "eu" ? "https://api-eu.customer.io" : "https://api.customer.io";
}

export function trackEnabled(): boolean {
  return Boolean(config.customerio.siteId && config.customerio.trackApiKey);
}

export function appEnabled(): boolean {
  return Boolean(config.customerio.appApiKey);
}

function trackAuth(): string {
  const raw = `${config.customerio.siteId}:${config.customerio.trackApiKey}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

/** One retry on network errors, 429 and 5xx. Returns null when the request never got a response. */
async function request(url: string, init: RequestInit): Promise<Response | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
      if ((res.status === 429 || res.status >= 500) && attempt === 1) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      return res;
    } catch (err: any) {
      if (attempt === 2) {
        logger.warn({ err: err?.message, url }, "[customerio] request failed");
        return null;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

function clean(attributes: Attributes): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(attributes)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Unix seconds, which Customer.io expects for timestamp attributes. */
export function unixSeconds(value: string | number | Date | null | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const ms = value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
}

/**
 * Create or update a person, keyed by Clerk user ID (the same `id` the existing profiles use).
 * If the email already belongs to another profile (for example an older Clerk account with the
 * same address), Customer.io rejects the email change. We retry without the email so the rest
 * of the attributes and later events still land.
 */
export async function identify(userId: string, attributes: Attributes): Promise<void> {
  if (!trackEnabled() || !userId) return;
  const url = `${trackBase()}/api/v1/customers/${encodeURIComponent(userId)}`;
  const send = (body: Attributes) =>
    request(url, {
      method: "PUT",
      headers: { Authorization: trackAuth(), "Content-Type": "application/json" },
      body: JSON.stringify(clean(body)),
    });

  const res = await send(attributes);
  if (!res || res.ok) return;
  const text = await res.text().catch(() => "");
  if (res.status === 400 && "email" in attributes && /email/i.test(text)) {
    const { email: _ignored, ...rest } = attributes;
    logger.warn({ userId }, "[customerio] email belongs to another profile; updating without email");
    await send(rest);
    return;
  }
  logger.warn({ userId, status: res.status, body: text.slice(0, 300) }, "[customerio] identify failed");
}

/** Record an event on a person. Campaigns in Customer.io are triggered by these. */
export async function track(userId: string, name: string, data: Attributes = {}): Promise<void> {
  if (!trackEnabled() || !userId) return;
  const res = await request(`${trackBase()}/api/v1/customers/${encodeURIComponent(userId)}/events`, {
    method: "POST",
    headers: { Authorization: trackAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, data: clean(data) }),
  });
  if (res && !res.ok) {
    const text = await res.text().catch(() => "");
    logger.warn({ userId, name, status: res.status, body: text.slice(0, 300) }, "[customerio] track failed");
  }
}

/** Remove a person (account deleted). */
export async function deletePerson(userId: string): Promise<void> {
  if (!trackEnabled() || !userId) return;
  const res = await request(`${trackBase()}/api/v1/customers/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: { Authorization: trackAuth() },
  });
  if (res && !res.ok && res.status !== 404) {
    logger.warn({ userId, status: res.status }, "[customerio] delete failed");
  }
}

export type TransactionalOptions = {
  /** Trigger name of the transactional message in Customer.io, for example "T01_welcome". */
  template: string;
  to: string;
  identifiers: { id: string } | { email: string };
  sender: SenderKey;
  /** Overrides the sender's Reply-To, e.g. the customer's address on internal alerts. */
  replyTo?: string | null;
  data?: Record<string, unknown>;
  /** System mail goes to unsubscribed people too. Default true. */
  sendToUnsubscribed?: boolean;
};

export type SendResult = { ok: true; deliveryId: string | null } | { ok: false; error: string };

/** Send one transactional email from a template that already exists in Customer.io. */
export async function sendTransactional(opts: TransactionalOptions): Promise<SendResult> {
  if (!appEnabled()) return { ok: false, error: "Customer.io App API key is not configured" };
  if (!opts.to) return { ok: false, error: "No recipient address" };
  const sender = SENDERS[opts.sender];
  const res = await request(`${appBase()}/v1/send/email`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.customerio.appApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      transactional_message_id: opts.template,
      to: opts.to,
      identifiers: opts.identifiers,
      from: sender.from,
      reply_to: opts.replyTo || sender.replyTo,
      message_data: opts.data || {},
      send_to_unsubscribed: opts.sendToUnsubscribed ?? true,
    }),
  });
  if (!res) return { ok: false, error: "Customer.io did not respond" };
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = body?.meta?.error || body?.error || `HTTP ${res.status}`;
    logger.warn({ template: opts.template, status: res.status, error }, "[customerio] transactional send failed");
    return { ok: false, error: String(error) };
  }
  return { ok: true, deliveryId: body?.delivery_id ?? null };
}

/** Raw App API call for the admin pages. */
export async function appApi<T = any>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!appEnabled()) return { ok: false, status: 0, data: null };
  const res = await request(`${appBase()}${path}`, {
    method: init.method || "GET",
    headers: { Authorization: `Bearer ${config.customerio.appApiKey}`, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res) return { ok: false, status: 0, data: null };
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}
