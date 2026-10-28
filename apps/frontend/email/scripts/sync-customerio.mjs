// Pushes built templates (email/dist) into Customer.io through the App API.
//
//   CUSTOMERIO_APP_API_KEY=... node email/scripts/sync-customerio.mjs            # dry run: show what would change
//   CUSTOMERIO_APP_API_KEY=... node email/scripts/sync-customerio.mjs --apply    # create missing and update all
//   ... --only=T01_welcome,T08_credits-granted                                    # limit to some templates
//
// Transactional templates: a missing one is created by its Trigger Name with auto_create plus
// queue_draft, so nothing is sent (a single draft addressed to the team inbox is left in
// Deliveries and Drafts). Then subject, body, preheader, sender and Reply-To are set.
//
// Campaign and broadcast templates: the automations themselves are built once in Customer.io
// (see email/CUSTOMERIO-SETUP.md). Each email step is named starting with its template code,
// e.g. "T02 Your model is ready" or "D02 Final notice…"; this script finds those steps and sets
// their subject, body, preheader, sender and Reply-To.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.CUSTOMERIO_APP_API_KEY;
const BASE = process.env.CUSTOMERIO_REGION === "eu" ? "https://api-eu.customer.io" : "https://api.customer.io";
const TEAM_INBOX = process.env.EMAIL_TEAM_INBOX || "hi@hydrilla.ai";
const apply = process.argv.includes("--apply");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);

// From addresses live on the sending subdomain; replies go to the real mailboxes. Both are
// sender identities in Customer.io, looked up by email.
const SENDERS = {
  hi: { email: "hi@mail.hydrilla.ai", from: "Hydrilla <hi@mail.hydrilla.ai>", replyEmail: "hi@hydrilla.ai" },
  rishi: { email: "rishi@mail.hydrilla.ai", from: "Rishi from Hydrilla <rishi@mail.hydrilla.ai>", replyEmail: "rishi@hydrilla.ai" },
};

if (!KEY) {
  console.error("Set CUSTOMERIO_APP_API_KEY (it is in backend/hydrilla_backend/.env.local).");
  process.exit(1);
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.meta?.error || data?.errors?.[0]?.detail || JSON.stringify(data)?.slice(0, 300);
    throw new Error(`${method} ${path} -> ${res.status}: ${msg}`);
  }
  return data;
}

const manifest = JSON.parse(await readFile(join(root, "dist", "manifest.json"), "utf8")).filter(
  (t) => !only.length || only.includes(t.file)
);

const identities = (await api("/v1/sender_identities")).sender_identities || [];
const identityId = (email) => identities.find((s) => s.email === email)?.id;
const senderId = (key) => identityId(SENDERS[key].email);
const replyId = (key) => identityId(SENDERS[key].replyEmail);
for (const key of Object.keys(SENDERS)) {
  if (!senderId(key)) throw new Error(`Sender ${SENDERS[key].email} is not set up in Customer.io`);
  if (!replyId(key)) throw new Error(`Reply-to identity ${SENDERS[key].replyEmail} is not set up in Customer.io`);
}

/** The content every email gets, whatever kind it is. */
function content(t, html) {
  return {
    subject: t.subject,
    body: html,
    preheader_text: t.preheader,
    from_id: senderId(t.sender),
    reply_to_id: replyId(t.sender),
  };
}

async function listTransactional() {
  const list = (await api("/v1/transactional")).messages || [];
  return new Map(list.filter((m) => m.trigger_name).map((m) => [m.trigger_name.toLowerCase(), m]));
}

console.log(apply ? "Applying changes to Customer.io\n" : "Dry run (add --apply to make changes)\n");

// ---------------------------------------------------------------- transactional

let existing = await listTransactional();

for (const t of manifest.filter((m) => m.kind === "transactional")) {
  const html = await readFile(join(root, "dist", `${t.file}.html`), "utf8");
  let message = existing.get(t.file.toLowerCase());

  if (!message) {
    console.log(`+ create  ${t.file}`);
    if (!apply) continue;
    await api("/v1/send/email", {
      method: "POST",
      body: {
        transactional_message_id: t.file,
        auto_create: true,
        queue_draft: true,
        to: TEAM_INBOX,
        identifiers: { email: TEAM_INBOX },
        from: SENDERS[t.sender].from,
        subject: t.subject,
        body: html,
      },
    });
    // The new record takes a moment to appear in the list.
    for (let attempt = 0; attempt < 10 && !message; attempt++) {
      await new Promise((r) => setTimeout(r, 1500));
      existing = await listTransactional();
      message = existing.get(t.file.toLowerCase());
    }
    if (!message) throw new Error(`${t.file} was not created`);
  }

  const contents = (await api(`/v1/transactional/${message.id}/contents`)).contents || [];
  const target = contents.find((c) => !c.language) || contents[0];
  if (!target) throw new Error(`${t.file} has no content to update`);

  console.log(`~ update  ${t.file}  (transactional ${message.id})`);
  if (!apply) continue;
  await api(`/v1/transactional/${message.id}/content/${target.id}`, {
    method: "PUT",
    body: { name: `${t.id} ${t.name}`, ...content(t, html) },
  });
}

// ---------------------------------------------------------------- campaigns and broadcasts

/** Every email step in every automation and API-triggered broadcast, keyed by its template code. */
async function emailSteps() {
  const steps = new Map();
  const campaigns = (await api("/v1/campaigns")).campaigns || [];
  const broadcasts = (await api("/v1/broadcasts")).broadcasts || [];
  const owners = [
    ...campaigns.map((c) => ({ kind: "campaigns", id: c.id, name: c.name })),
    ...broadcasts.map((b) => ({ kind: "broadcasts", id: b.id, name: b.name })),
  ];
  for (const owner of owners) {
    const actions = (await api(`/v1/${owner.kind}/${owner.id}/actions`)).actions || [];
    for (const a of actions) {
      if (a.type !== "email") continue;
      const code = String(a.name || "").split(" ")[0];
      if (code) steps.set(code, { ...owner, actionId: a.id, actionName: a.name });
    }
  }
  return steps;
}

const pending = manifest.filter((m) => m.kind !== "transactional");
const steps = pending.length ? await emailSteps() : new Map();
const missing = [];

for (const t of pending) {
  const step = steps.get(t.id);
  if (!step) {
    missing.push(t);
    continue;
  }
  const html = await readFile(join(root, "dist", `${t.file}.html`), "utf8");
  console.log(`~ update  ${t.file}  (${step.kind} ${step.id} "${step.name}", step ${step.actionId})`);
  if (!apply) continue;
  await api(`/v1/${step.kind}/${step.id}/actions/${step.actionId}`, { method: "PUT", body: content(t, html) });
}

// ---------------------------------------------------------------- snippets

// Used by the weekly recap; created if missing.
const snippets = (await api("/v1/snippets")).snippets || [];
for (const name of ["weekly_news", "weekly_news_json"]) {
  if (snippets.some((s) => s.name === name)) continue;
  console.log(`+ snippet ${name}`);
  // Customer.io rejects blank snippets; W01 hides the news block while weekly_news_json is "[]".
  if (apply) await api("/v1/snippets", { method: "PUT", body: { name, value: name.endsWith("json") ? "[]" : "<!-- no news -->" } });
}

if (missing.length) {
  console.log(`\nNo email step found in Customer.io for (see email/CUSTOMERIO-SETUP.md):`);
  for (const t of missing) console.log(`  ${t.file.padEnd(24)} ${t.kind.padEnd(9)} ${t.trigger}`);
}
