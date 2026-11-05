# Hydrilla email system (Customer.io)

How Hydrilla's emails are built and sent, what is set up in Customer.io, where it stands, and the Gmail problem we hit during testing.

Last updated: 5 Nov 2026. **Status: transactional emails are live. Every automation is still in draft.** See [EMAIL-REPORT.md](EMAIL-REPORT.md) for every email, when it sends and its format.

Related docs in this folder:

- [CATALOGUE.md](CATALOGUE.md): every email, what it does and when it sends.
- [CUSTOMERIO-SETUP.md](CUSTOMERIO-SETUP.md): Customer.io IDs and settings, plus the remaining manual steps.
- [EDITORIAL.md](EDITORIAL.md): voice, naming, subject-line rules and the pre-send checklist.

---

## 1. Decisions

| Topic | Decision |
|---|---|
| Platform | Customer.io for all email. ZeptoMail is removed completely. |
| Sender | One only. `Hydrilla <hi@mail.hydrilla.ai>` sends every email. Personal notes are signed by Tejesh Varma, Head of Growth, Team Hydrilla AI. |
| Replies | Replies go to the real mailbox `hi@hydrilla.ai`. |
| Sending domain | `mail.hydrilla.ai`, so that marketing reputation stays off the root domain where staff mail lives. Link tracking is on `email.mail.hydrilla.ai`. |
| Volume | Minimal: 22 customer emails and 2 internal alerts, no step-by-step drips. See CATALOGUE.md. |
| Weekly email | A personal recap (models made, credits, one tip, news), sent only to people who made a model that week. |
| Legal footer | Hydrilla AI Pvt Ltd, 5-40A, Ullipatteda, Muthyal Reddy Palli, S V Nagar, Tirupati, Andhra Pradesh 517502, India. |
| Template source | MJML files in this repo, built to HTML and pushed to Customer.io. The repo is the source of truth, not the Customer.io editor. |

## 2. How it works

```
Clerk webhook ──────────┐
Dodo webhooks ──────────┤
GPU job sync ───────────┼─► backend: services/notifications.ts ─► lib/customerio.ts ─► Customer.io ─► inbox
Credits, API keys ──────┤        identify (profile) · track (event) · sendTransactional
Contact / support forms ┘
Weekly cron (Mon) ─► services/weeklyRecap.ts ─► event weekly_recap_ready
```

- **Transactional emails** (11) are sent directly by the backend through Customer.io's Transactional API, by template trigger name (for example `T01_welcome`).
- **Campaign emails** (12 automations, one of them sending two emails) are sent by Customer.io. The backend only tracks events such as `generation_completed`, `credits_low` and `payment_failed`, and the automations react to them.
- **Profiles** in Customer.io use the Clerk user ID as `id`, which matches the 250 profiles that already existed.
- Every Customer.io call is best effort. It logs and returns, and never breaks a user request.

## 3. What was built

### Templates (`hyd-f/email/`)

| Path | What it is |
|---|---|
| `templates/*.mjml` | 24 emails, one file per email. The file name is the template ID and the Customer.io trigger name. |
| `layouts/base.mjml`, `layouts/personal.mjml` | The branded layout (logo header, card, legal footer), and the near-plain-text layout used for Tejesh's notes. |
| `scripts/build.mjs` | Builds `dist/*.html`, `*.txt` and `*.json` plus `manifest.json`. It also lints: subject 50 characters or fewer, no emoji, no exclamation marks, every Liquid variable has a fallback, `trigger.*` in transactional templates and `event.*` in campaign templates. |
| `scripts/sync-customerio.mjs` | Pushes the built HTML, subject, preheader, sender and Reply-To into Customer.io. It creates missing transactional templates without sending anything. |
| `parked/` | T05 plan changed, T07 refund, T13. Cut from the minimal set. |

Commands:

```
npm run email:build:strict
CUSTOMERIO_APP_API_KEY=… node email/scripts/sync-customerio.mjs            # dry run
CUSTOMERIO_APP_API_KEY=… node email/scripts/sync-customerio.mjs --apply
```

Other assets: `public/logo-hydrilla/hydrilla-email-logo.png` is the email logo, 560 px wide, 26 KB, taken from the new Hydrilla logo. `mjml` was added as a dev dependency. `email/dist/` is gitignored.

### Backend (`backend/hydrilla_backend`, separate git repo)

| File | Change |
|---|---|
| `src/lib/customerio.ts` (new) | Client: `identify`, `track`, `deletePerson`, `sendTransactional`, `appApi`. One retry. If a profile's email belongs to another profile, it retries without the email. |
| `src/lib/emailCatalog.ts` (new) | All 24 emails with kind, sender, topic, trigger and purpose. The admin pages read this. |
| `src/services/notifications.ts` (new) | Product moments mapped to Customer.io calls: sign-up, sign-in, deletion, time zone, jobs, checkout, plans, payments, credits, claim links, API keys, forms, GPU alert. |
| `src/services/weeklyRecap.ts` (new) | Builds each active person's recap and tracks `weekly_recap_ready`. |
| `src/routes/webhooks.ts` (new) | `POST /api/webhooks/clerk`, verified with Svix (Standard Webhooks). Handles `user.created/updated/deleted` and `session.created`. |
| `src/routes/cron.ts` (new) | `GET /api/cron/weekly-recap`, protected by `CRON_SECRET`. The schedule is in `vercel.json` (Mondays 00:30 UTC). |
| `src/routes/adminEmails.ts` (new) | Admin API: overview, templates, deliveries, per-person emails, test send, weekly news, weekly preview. |
| `contact.ts`, `support.ts` | Receipts to the sender plus an alert to `hi@hydrilla.ai`. **Fixed a bug:** the Contact and Enterprise forms were rejected with a 400 because of a strict `use_case` list. |
| `payments.ts` | Plan active and cancelled emails, sent once each. Checkout, payment-failed and payment-succeeded events. |
| `jobSync.ts`, `threeD.ts` | Model ready and failed events. Every failure path refunds credits before the event is tracked. |
| `credits.ts` | `credits_low` when the balance crosses 20% of the allowance, and `credits_exhausted` when a generation is blocked. |
| `creditClaims.ts` | No email. The planned send route for claim links is not in the code, so `CL01_claim-link` is not sent by anything. |
| `adminUsers.ts`, `user.ts` | Credits-added email (signed by Tejesh), the API-key security notice, and `POST /api/user/email-profile` (time zone). |
| `middleware/auth.ts` | Fallback welcome email if the Clerk webhook isn't configured. |
| Removed | `src/services/email.ts`, the `zeptomail` package and the `ZEPTOMAIL_*` env vars. |

### Admin app (`hyd-f/admin`, separate git repo)

- **Emails** page with four tabs:
  - Overview: sends and delivery, bounce, spam and unsubscribe rates against targets.
  - Templates: all 24 with live or draft status and a "send me a test" button.
  - Deliveries: a log of every email sent.
  - Weekly recap: an editor for "This week at Hydrilla" and a preview of who gets Monday's recap.
- **Claim links:** no email option yet, because the backend has no send route for it.
- **User detail:** an Emails section listing what that person has received.

### Frontend (`hyd-f`)

- `components/PostHogIdentify.tsx` sends the browser time zone once per session, so the weekly recap sends at 10:00 local time.
- Privacy, terms and cookies pages now have the legal entity and address, name Customer.io as a processor, and describe email tracking and the marketing preferences.

## 4. What is set up in Customer.io

All of this is in workspace "Hydrilla AI" (218428, US region). Full ID tables are in CUSTOMERIO-SETUP.md.

- **Sending domain:** `mail.hydrilla.ai` verified (MX, SPF, DKIM, DMARC). Link tracking on `email.mail.hydrilla.ai`. DNS is at Namecheap.
- **Identities:** sender `hi@mail.hydrilla.ai` (4); reply-to identity `hi@hydrilla.ai` (6).
- **Subscription topics**, opt-out:
  1. Model alerts
  2. Credit alerts
  3. Weekly recap
  4. News and tips
- **Transactional messages (2–12):**
  - T01 Welcome and T08 Credits added, both signed by Tejesh.
  - T04, T06, T09, T10, T11 and T12, from `hi@`.
  - INT01 and INT02, the internal alerts.
- **Automations (8–18), all in draft:**
  - T02, T03, C01, C02
  - R05, W01, L02, C04
  - D01 + D02, C08, R02
- **Broadcast:** N01 Release news (19), API-triggered, draft.
- **Layout:** "Hydrilla full HTML (pass-through)" (2). Customer.io's default layout wrapped our full HTML in a second HTML page and added a bare "Unsubscribe" link, so all our emails use the pass-through layout instead. The default layout is unchanged for other emails.
- **Editor:** all our emails are on the Code editor, so the Customer.io UI won't reformat the HTML.
- **Snippets:** `weekly_news` and `weekly_news_json`, edited from admin.
- **Keys:** the backend `.env.local` holds the Track API key ("Hydrilla-AI-Claude") and the App API key. Never commit these.

Tools used: the Customer.io MCP (Claude Code plugin) for topics, identities, automations and layouts; the App API for transactional templates, content sync and snippets.

## 5. The problem we hit: Gmail rate-limited the new domain

**What happened.** To review every design, 24 test emails were sent to one Gmail address with Customer.io's test-send feature, all within about a minute. None arrived.

**How it was diagnosed.**
- Test sends leave no delivery record in Customer.io. The API only says "accepted", so they looked successful.
- The recipient was not on any suppression list.
- SPF, DKIM, DMARC and MX all resolved correctly.
- One normal, tracked transactional send of T01 to the same address showed the real result: **bounced**, with Gmail's reply:

  > 4.7.28 Gmail has detected an unusual rate of mail originating from your DKIM domain [cio152362.mail.hydrilla.ai]… mail sent from your domain has been temporarily rate limited.

**Cause.** `mail.hydrilla.ai` is a brand-new sending domain with no history at Gmail. A burst of 24 messages from an unknown domain inside a minute looked like spam, so Gmail throttled the domain. Test sends are not retried, so all 24 were dropped.

**What it is not.** It is not a DNS or authentication error, not a suppression, and not a problem with the templates. It is temporary and clears on its own, typically within hours to a day.

**Lessons:**

1. Never burst-send from a new domain. Send tests one at a time, a few minutes apart.
2. Warm the domain up. At go-live, start the automations a few at a time and let volume grow from real sign-ups. Don't start everything, including the weekly recap, on day one.
3. Monitor reputation. Set up [Google Postmaster Tools](https://postmaster.google.com) for `hydrilla.ai`.
4. A Customer.io test send returning "accepted" is not proof of delivery. Use a tracked send to see the real status.
5. To review designs while Gmail is throttled, test to a non-Gmail inbox. The limit is Gmail-only.

Side effect: the diagnostic send created a Customer.io profile for the test address. It is harmless and can be deleted.

## 6. Current state

| Item | State |
|---|---|
| Automations and broadcast | Draft. They cannot send. |
| Transactional messages | Live. All sent from `hi@mail.hydrilla.ai`. |
| Backend email code | Committed and deployed. |
| Live backend | Runs the Customer.io code. ZeptoMail is gone from the code and from Vercel. |
| Old Supabase `sync-customerio` function | Still syncs profiles with the first Track key. It sends no email. |

## 7. Go-live checklist

1. **Commit and deploy the backend, admin and frontend.** All changes are uncommitted on the developer machine, and the backend has other people's uncommitted work too, so review them first.
2. **Vercel backend env:**
   - `CUSTOMERIO_SITE_ID`, `CUSTOMERIO_TRACK_API_KEY`, `CUSTOMERIO_APP_API_KEY`
   - `CUSTOMERIO_REGION=us`
   - `CRON_SECRET`, `CLERK_WEBHOOK_SECRET`
   - `EMAIL_TEAM_INBOX=hi@hydrilla.ai`, `EMAIL_LINK_BASE_URL=https://hydrilla.ai`

   Remove the `ZEPTOMAIL_*` vars.
3. **Clerk webhook:**
   - Endpoint: `https://hydrilla-ai-g1bm.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`, `session.created`
   - Copy the signing secret into `CLERK_WEBHOOK_SECRET`.
4. **Confirm the email logo is live** at `https://hydrilla.ai/logo-hydrilla/hydrilla-email-logo.png`. It 404s until the frontend is deployed.
5. **Wait for Gmail's limit to clear,** then send tests one at a time to check the designs.
6. **Start automations gradually,** in this order: T02, T03, C01, C02, D01 + D02 and C08 first; L02, C04, R05 and R02 next; W01 last.
7. **Delete the setup drafts** in Customer.io → Deliveries & Drafts (one per transactional message, addressed to `hi@hydrilla.ai`).
8. **Disable the old Supabase `sync-customerio` trigger** (keep the code), then revoke the old "Hydrilla AI" Track key.
9. **Set up Google Postmaster Tools** for `hydrilla.ai`.

**Waiting on sign-off:**

- C08 trial wording. The terms still have a placeholder for trial conversion.
- D01 and D02 payment link, which currently points at the pricing page.
- The 8 weekly-recap tips in `weeklyRecap.ts`.

## 8. Changing an email later

1. Edit `email/templates/<ID>.mjml`, following EDITORIAL.md.
2. Run `npm run email:build:strict`.
3. Run `node email/scripts/sync-customerio.mjs`, check the dry run, then run it again with `--apply`.
4. Send one test from admin → Emails → Templates, or from Customer.io.

Never edit email HTML directly in the Customer.io editor. The next sync overwrites it.
