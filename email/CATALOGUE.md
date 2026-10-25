# Hydrilla email catalogue

22 customer emails plus 2 internal alerts. Template source is in `email/templates/`, and each file name is the template's ID and its Trigger Name in Customer.io. The backend keeps the same list in `backend/hydrilla_backend/src/lib/emailCatalog.ts`.

## Principles

1. One email for each moment that matters. No step-by-step drips.
2. Never email what the app already shows on screen.
3. A nudge exists only if it changes what the person does next.
4. Every automated sequence has an exit, and most are a single email.
5. At most 1 lifecycle email a day and 2 a week, not counting system mail and the weekly recap.
6. Disengaged people are silently suppressed. There is no "should we keep emailing you" email.

## Two senders

| Sender | Used for |
|---|---|
| Hydrilla `hi@mail.hydrilla.ai`, replies to `hi@hydrilla.ai` | The product reporting on the account: jobs, plans, payments, credits, security, form receipts |
| Rishi `rishi@mail.hydrilla.ai`, replies to `rishi@hydrilla.ai` | The team talking to the person: welcome, nudges, gifts, win-back, weekly recap, release news |

## Subscription topics

| Topic | Emails |
|---|---|
| `model-alerts` | T02, T03 |
| `credit-alerts` | C01, C02 |
| `weekly-recap` | W01 |
| `news-and-tips` | L02, C04, R02, R05, N01 |
| none, always sent | everything else (account, billing, security, receipts) |

## How each email is sent

- **Transactional:** the backend sends it directly through the Transactional API. These are already set up in Customer.io, using `email/scripts/sync-customerio.mjs`.
- **Campaign:** the backend tracks an event, and a Customer.io campaign sends the email. These are built once with the MCP or the dashboard (see `CUSTOMERIO-SETUP.md`).
- **Broadcast:** sent by hand from Customer.io.

## From Hydrilla (13)

| ID | Email | Kind | Trigger | What it does |
|---|---|---|---|---|
| T02 | Your model is ready | campaign | `generation_completed` with `notify = true` | Brings people back to a finished model. `notify` is true only when the job ran 3 minutes or more, so people still on the page get nothing. |
| T03 | Your generation didn't finish | campaign | `generation_failed` with `notify = true` | Says the job failed and that its credits were returned (every failure path refunds first). |
| T04 | You're on Hydrilla {plan} | transactional | Dodo `subscription.active` / plan change | Confirms the plan or trial and its credits. Sent once per plan. |
| T06 | Your Hydrilla plan is cancelled | transactional | cancellation scheduled, or immediate cancel | States when paid access ends. Sent once per cancellation. |
| D01 | Payment didn't go through | campaign | `payment_failed` | Asks them to update payment details. |
| D02 | Final notice: your payment is still due | campaign | 5 days after D01, unless `payment_succeeded` | Last warning. |
| C01 | You have {n} credits left | campaign | `credits_low` (crossing 20% of the period allowance) | Warns before they're blocked. |
| C02 | You've used all your credits | campaign | `credits_exhausted` (a generation was blocked) | Gives two options: wait for the reset date, or upgrade. |
| C08 | Your trial ends on {date} | campaign | 3 days before `trial_ends_at` | The only trial reminder. |
| T09 | A new API key was created | transactional | developer API key created | Security notice. |
| T10 | We received your deletion request | transactional | not wired yet: deletion is by email today | Ready for when self-serve deletion exists. |
| T11 | We've got your message | transactional | contact, support or feedback form | One receipt for all three. |
| T12 | Thanks for your interest in Hydrilla for teams | transactional | enterprise form | Receipt with the demo link. A person follows up; there is no automated sales email. |

## From Rishi (9)

| ID | Email | Kind | Trigger | What it does |
|---|---|---|---|---|
| T01 | Welcome to Hydrilla | transactional | sign-up (Clerk `user.created`) | Short personal welcome and first steps. |
| L02 | Text or image? Pick the faster start | campaign | 2 days after `account_created`, only if no `generation_completed` | The single onboarding nudge. |
| C04 | Anything I can help with? | campaign | 24 hours after `checkout_started`, unless `subscription_activated` | One human question, no discount. |
| CL01 | {n} Hydrilla credits for you | transactional | admin clicks **Send** on a claim link | Gives someone a claim link. |
| T08 | {n} credits added to your account | transactional | admin adds credits with "send email" on | Tells them credits were added. |
| R02 | Your Hydrilla account is waiting | campaign | `last_seen_at` older than 30 days, once | The only win-back. |
| R05 | A short question | campaign | 3 days after `subscription_cancelled` | One question about why they left. |
| W01 | Your week in Hydrilla | campaign | `weekly_recap_ready` (Mondays, active people only) | Models made, credits left, one tip, and news edited in admin. |
| N01 | Release news | broadcast | sent by hand, at most 2 a month | What shipped. |

## Internal alerts (to `hi@hydrilla.ai`)

| ID | Email | Trigger |
|---|---|---|
| INT01 | New {kind} message from {name} | any form. Reply-To is the sender, so the team replies directly. |
| INT02 | GPU offline reported | the GPU offline error. At most one every 10 minutes per server. |

## Claim links

An admin creates a link on the Claim links page, then:
- clicks **Send** on its row, or ticks "Email it … from Rishi" when the link is restricted to one address.
- Rishi's CL01 goes out through Customer.io. A restricted link can only be sent to its own address.
- When someone claims the link they see the result on screen, so no email is sent at claim time.

## Cut, and why

| Cut | Reason |
|---|---|
| L01, L03 to L07 | Six-email drip for one goal. Replaced by the welcome and one nudge. |
| C03, C05, C06, C07, C09, D03 | Repeat what the app or another email already says. |
| T05 plan changed, T07 refund | Parked in `email/parked/`. Dodo Payments probably sends these, as merchant of record. |
| T13 | Merged into T11. |
| R01, R03, R04 | One win-back and silent suppression instead. |
| W02, N02 | The recap skips inactive people. Posts go into W01 and N01. |
| S02, S03 | Enterprise leads get a person, and cal.com confirms bookings itself. |
