# Customer.io setup

State of the "Hydrilla AI" workspace (218428) as of 25 Oct 2026, and what is still manual.

## Built in Customer.io

**Sending:**
- **Domain:** `mail.hydrilla.ai` is verified, with link tracking on `email.mail.hydrilla.ai`.
- **From identities:** `Hydrilla <hi@mail.hydrilla.ai>` (4) and `Rishi from Hydrilla <rishi@mail.hydrilla.ai>` (5).
- **Reply-to identities:** `hi@hydrilla.ai` (6) and `rishi@hydrilla.ai` (7). Every email replies to the real mailbox.
- **Layout:** every email uses "Hydrilla full HTML (pass-through)" (layout 2). Our templates are complete HTML documents with their own footer and unsubscribe links. The workspace default "Empty Layout" is unchanged for other emails.
- **Editor:** all our emails use the Code editor (`html`).

**Subscription topics (all on by default, opt-out):**

| ID | Topic | Emails |
|---|---|---|
| 1 | Model alerts | T02, T03 |
| 2 | Credit alerts | C01, C02 |
| 3 | Weekly recap | W01 |
| 4 | News and tips | L02, C04, R02, R05, N01 |

**Transactional messages** (sent by the backend by Trigger Name):

| ID | Name | Trigger Name |
|---|---|---|
| 2 | T01 Welcome (Rishi) | `T01_welcome` |
| 4 | INT01 New message alert (internal) | `INT01_new-message` |
| 5 | INT02 GPU offline alert (internal) | `INT02_gpu-offline` |
| 6 | T04 Plan active | `T04_plan-active` |
| 7 | T06 Plan cancelled | `T06_plan-cancelled` |
| 8 | T08 Credits added (Rishi) | `T08_credits-granted` |
| 9 | T09 API key created | `T09_api-key-created` |
| 10 | T10 Deletion request received | `T10_deletion-request` |
| 11 | T11 Message received | `T11_contact-received` |
| 12 | T12 Enterprise enquiry received | `T12_enterprise-received` |

**Automations (all built, all in draft):**

| ID | Automation | Entry | Steps | Re-entry | Topic | Unsubscribed |
|---|---|---|---|---|---|---|
| 8 | T02 Model ready | event `generation_completed`, `notify = true` | email | every 2 h max | 1 | no |
| 9 | T03 Generation failed | event `generation_failed`, `notify = true` | email | every 2 h max | 1 | no |
| 10 | C01 Credits low | event `credits_low` | email | every 25 days max | 2 | no |
| 11 | C02 Credits out | event `credits_exhausted` | email | every 25 days max | 2 | no |
| 12 | R05 Cancel question | event `subscription_cancelled` | wait 3 days, then email | every 90 days max | 4 | no |
| 13 | W01 Weekly recap | event `weekly_recap_ready` | wait for Mon/Tue 09:00–18:00 local (fallback Asia/Kolkata), then email | every event | 3 | no |
| 14 | L02 First model nudge | event `account_created` | wait up to 2 days for `generation_completed`. If it arrives, exit; if not, email | — | 4 | no |
| 15 | C04 Checkout help | event `checkout_started` | wait up to 24 h for `subscription_activated`. If it arrives, exit; if not, email | every 30 days max | 4 | no |
| 16 | D01 + D02 Payment failed | event `payment_failed` | D01; wait up to 5 days for `payment_succeeded`. If it arrives, exit; if not, D02 | every 20 days max | none | yes |
| 17 | C08 Trial ending | date `trial_ends_at`, 3 days before, 10:00 local | email, only if `plan_status = trial` | once | none | yes |
| 18 | R02 Win-back | `last_seen_at` and `created_at` both more than 30 days ago | wait for weekday 10:00–17:00 local, then email | once per person, ever | 4 | no |
| 19 | N01 Release news | API-triggered broadcast | email | per trigger | 4 | no |

**Snippets:** `weekly_news` and `weekly_news_json`, edited from admin → Emails → Weekly recap.

**Content:** every email's subject, body, preheader, sender and Reply-To comes from `email/dist`. Push changes with:

```
npm run email:build:strict
CUSTOMERIO_APP_API_KEY=… node email/scripts/sync-customerio.mjs --apply
```

## Still manual

1. **Start the automations** after the backend is deployed:
   1. In Customer.io, open each automation and click **Start**.
   2. Start the system ones first: T02, T03, C01, C02, D01 + D02 and C08.
   3. Start L02, C04, R05, R02 and W01 once you've read their copy.
   4. N01 is only triggered when you send release news.

   Nothing sends while they're in draft.
2. **Delete the setup drafts.** Creating the transactional messages left one draft each (addressed to `hi@hydrilla.ai`) under **Deliveries & Drafts → Drafts**. Delete them, and don't send them.
3. **Clerk webhook:** see below.
4. **Backend env on Vercel:** see below.
5. **Turn off the old Supabase sync** after deploy: see below.

## Clerk webhook

It isn't strictly required, but without it:
- the welcome email only goes out when the user first hits certain backend routes, and some users never get one;
- R02 win-back never fires, because it needs `last_seen_at`;
- deleted accounts stay in Customer.io.

Set it up:
1. Clerk Dashboard → pick the **Production** instance → **Configure → Webhooks → Add Endpoint**.
2. Endpoint URL: `https://hydrilla-backend.vercel.app/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`, `session.created`. Leave everything else unticked.
4. Create it, then copy the **Signing Secret** (`whsec_…`).
5. Put it in `CLERK_WEBHOOK_SECRET` in the backend's Vercel env (and in `.env.local` for local runs), then redeploy.
6. In Clerk, use **Testing → Send example** for `user.created`. It should return 200.

The route only exists once the backend is deployed. Clerk retries on failure, so creating the endpoint first is harmless.

## Backend env on Vercel

| Variable | Value |
|---|---|
| `CUSTOMERIO_SITE_ID`, `CUSTOMERIO_TRACK_API_KEY` | the "Hydrilla-AI-Claude" Track key (in `.env.local`) |
| `CUSTOMERIO_APP_API_KEY` | App API key (in `.env.local`) |
| `CUSTOMERIO_REGION` | `us` |
| `CRON_SECRET` | same value as in `.env.local` |
| `CLERK_WEBHOOK_SECRET` | from the Clerk step above |
| `EMAIL_TEAM_INBOX` | `hi@hydrilla.ai` |
| `EMAIL_LINK_BASE_URL` | `https://hydrilla.ai` |

Remove `ZEPTOMAIL_*`.

## The old Supabase functions

`sync-customerio` and `backfill-customerio` still use the first Track key. After the backend is live:
1. Disable the trigger or webhook that calls `sync-customerio`, keeping the code.
2. Revoke the old "Hydrilla AI" Track key.
3. Don't run `backfill-customerio` again.
