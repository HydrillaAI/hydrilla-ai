import { adminRequest, TokenGetter } from "./admin-request";

export type EmailKind = "transactional" | "campaign" | "broadcast";

export type MetricTotals = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  spammed: number;
  unsubscribed: number;
  failed: number;
};

export type EmailsOverview = {
  connected: { track: boolean; app: boolean };
  totals: MetricTotals | null;
  transactional: { id: number; name: string; trigger: string; totals: MetricTotals }[];
  campaigns: { id: number; name: string; state: string; active: boolean }[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  kind: EmailKind;
  sender: "hi";
  topic: string | null;
  trigger: string;
  purpose: string;
  internal?: boolean;
  status: string;
  customerioId: number | null;
};

export type EmailDelivery = {
  id: string;
  sentAt: string | null;
  to: string;
  subject: string;
  type: string;
  status: string;
  failure: string | null;
  userId: string | null;
};

export type NewsItem = { title: string; blurb: string; url: string };

export type WeeklyPreview = {
  people: number;
  sample: { userId: string; data: Record<string, unknown> }[] | { userId: string; data: Record<string, unknown> } | null;
};

export function fetchEmailsOverview(getToken: TokenGetter) {
  return adminRequest<EmailsOverview>("/api/admin/emails/overview", { method: "GET" }, getToken, "Failed to load email overview");
}

export function fetchEmailTemplates(getToken: TokenGetter) {
  return adminRequest<{ templates: EmailTemplate[] }>("/api/admin/emails/templates", { method: "GET" }, getToken, "Failed to load templates");
}

export function fetchEmailDeliveries(next: string | null, getToken: TokenGetter) {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  return adminRequest<{ deliveries: EmailDelivery[]; next: string | null }>(
    `/api/admin/emails/deliveries${query}`,
    { method: "GET" },
    getToken,
    "Failed to load deliveries"
  );
}

export function fetchPersonEmails(userId: string, getToken: TokenGetter) {
  return adminRequest<{ found: boolean; attributes: Record<string, unknown> | null; messages: EmailDelivery[] }>(
    `/api/admin/emails/people/${encodeURIComponent(userId)}`,
    { method: "GET" },
    getToken,
    "Failed to load this person's emails"
  );
}

export function sendTestEmail(templateId: string, getToken: TokenGetter) {
  return adminRequest<{ success: boolean; sentTo: string }>(
    "/api/admin/emails/test",
    { method: "POST", body: JSON.stringify({ templateId }) },
    getToken,
    "Test send failed"
  );
}

export function fetchWeeklyNews(getToken: TokenGetter) {
  return adminRequest<{ items: NewsItem[] }>("/api/admin/emails/news", { method: "GET" }, getToken, "Failed to load news");
}

export function saveWeeklyNews(items: NewsItem[], getToken: TokenGetter) {
  return adminRequest<{ success: boolean; items: NewsItem[] }>(
    "/api/admin/emails/news",
    { method: "PUT", body: JSON.stringify({ items }) },
    getToken,
    "Failed to save news"
  );
}

export function fetchWeeklyPreview(getToken: TokenGetter) {
  return adminRequest<WeeklyPreview>("/api/admin/emails/weekly/preview", { method: "GET" }, getToken, "Failed to build the weekly preview");
}
