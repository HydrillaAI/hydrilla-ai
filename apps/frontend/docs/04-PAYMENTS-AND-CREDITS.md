# 04 · Payments and credits

All billing runs through **Dodo Payments**. Credits are tracked in Supabase by the backend. The frontend only shows prices and redirects to Dodo's checkout.

## Plans

The UI catalog is in `apps/frontend/lib/pricing.ts`. Credits granted per period are in `PLAN_CREDITS` in `apps/backend/src/routes/payments.ts` and `planConfig` in `apps/backend/src/config.ts`. **Keep the two in sync.**

| Plan id | UI label | Price / month | Credits / period | Generation window | Dodo product env var |
|---|---|---|---|---|---|
| `free` | Free | $0 | 100 (`FREE_TIER_CREDITS`) | any time | — |
| `starter` | Starter | $5 | 900 | any time | `DODO_PAYMENT_STARTER_PRODUCT_ID` |
| `pro` | Pro | $12 | 3,000 | any time | `DODO_PAYMENT_STUDIO_PRODUCT_ID` (the name says "studio", but this is Pro) |
| `slot` | Hourly | $3 | 900 | 1 hour daily, 2 seats per hour | `DODO_PAYMENT_SLOT_PRODUCT_ID` |
| `slot_pro` | Hourly Pro | $8 | 3,000 | 2 hours daily, 4 seats per window | `DODO_PAYMENT_SLOT_PRO_PRODUCT_ID` |

- **Exports:** Free gets GLB only. Paid plans get GLB, FBX, OBJ and USDZ (`exports` in `apps/frontend/lib/pricing.ts`).
- **Trial:** every paid plan has a 14-day trial, **once per user** (`trial_period_days: 14` in `/create-checkout`; trial state is tracked with `checkUserTrialUsed` / `markUserTrialUsed`).
- **Internal vs UI names:** the code calls the hourly plans `slot`/`slot_pro`; the UI calls them "Hourly"/"Hourly Pro". Old docs say "Slot".
- **Unused credits:** period credits do not roll over. Bonus credits (from claims and admin grants) survive renewals until spent or expired.

### Hourly (slot) plans

Code: `apps/backend/src/services/slotAccess.ts`, `apps/backend/src/services/slotClock.ts`.
- The user books a daily start hour and timezone in Settings → Billing (`POST /api/payments/slot` → `bookSlot`).
- Seat limits come from `config.slot.seats` / `config.slot.proSeats`. They are enforced in SQL by `set_slot`, which takes `pg_advisory_xact_lock` (`apps/backend/sql/024_slot_plans.sql`).
- **Every generation route checks the window first:** `slotGenerationBlock` is called from `apps/backend/src/routes/threeD.ts`, `apps/backend/src/routes/codeSculpt.ts` and `apps/backend/src/routes/v1/developerApi.ts`.
- The check fails closed. It returns `slot_required` when no hour is booked, `slot_closed` outside the window, and `slot_check_failed` if the DB read fails.

## Checkout flow

```
/checkout (apps/frontend/app/checkout/page.tsx)
  GET  /api/payments/trial-eligibility
  POST /api/payments/create-checkout {plan, email}
        → dodo.checkoutSessions.create(metadata: plan, user_id, email, is_trial)
        ← checkoutUrl → browser redirects to Dodo
Dodo → /checkout/success (apps/frontend/app/checkout/success/page.tsx)
  POST /api/payments/sync {payment_id | subscription_id}
        → signedInUserOwnsCheckout (metadata.user_id, else email match)
        → upsert user_subscriptions + user_credits
  poll  /api/payments/subscription + /credits for up to ~30 s
```

The webhook (below) is still the source of truth. `/sync` only makes the success page quick.

### Other user endpoints (`apps/backend/src/routes/payments.ts`, all `requireAuth`)

| Endpoint | Purpose |
|---|---|
| `GET /subscription` | Current plan and status |
| `GET /billing` | Billing summary and payment history |
| `POST /cancel` | Cancel at the next billing date (no immediate cut-off) |
| `GET`/`POST /slot` | Read or book the daily hour |
| `GET /credits` | Balance. Also runs `expireCreditGrants(userId)` first |
| `GET /credits/history` | Ledger rows (`listCreditLedger`) |
| `GET /usage`, `/usage/history` | Usage summaries |
| `GET /test` | Admin-only diagnostics |

## Webhook

`POST /api/payments/webhook/dodo`. Verification and dedup are described in [03](03-SECURITY.md#webhooks).

| Event | Effect |
|---|---|
| `subscription.active`, `subscription.plan_changed` | Activate the plan and set `credits_total` to the plan allotment. `stopReplacedSubscriptions` sets any older Starter/Pro subscription to cancel at its next billing date |
| `subscription.renewed` | New period: set the plan allotment, reset `credits_used`, keep the bonus, and move `reset_at` to the period end |
| `subscription.cancelled`, `subscription.expired` | Set the status to `cancelled`/`expired`, release the booked hour on slot plans, and send the cancellation notice |
| `subscription.on_hold`, `subscription.paused`, `subscription.failed`, `subscription.past_due` | Status change. **`deductCredit` blocks spending** while the status is `on_hold`/`paused`/`failed` |
| `subscription.unpaused`, `subscription.updated` | Status sync |
| `payment.succeeded`, `payment.failed` | Record a `subscription_payments` row |
| `refund.succeeded`, `payment.refunded` | Record the payment as `refunded`. **Credits are not clawed back**; do that by hand in the admin panel if needed |
| `credit.added` | Find the user by subscription id (or email) and apply the incremental credits (`handleCreditAdded`) |

The `/api/dodo/*` router in `apps/backend/src/routes/dodopayments/` only logs webhooks, and production does not mount it ([01](01-ARCHITECTURE.md#two-backend-entrypoints)). Don't point Dodo at it.

## The credit ledger

Code: `apps/backend/src/services/credits.ts`. Tables are in [07](07-DATA-MODEL.md#billing-and-credits).

```
available = user_credits.credits_total − credits_used + credits_bonus
```

| Function | What it does |
|---|---|
| `deductCredit(userId, amount)` | Blocks if the subscription is on hold. Calls the atomic RPC `deduct_user_credits`, which takes period credits first and then bonus. **Fails closed** if the RPC errors. Writes a `spend` ledger row. Sends the "low credits" notification when the balance crosses 20%, and "exhausted" at zero |
| `refundCredit(userId, amount)` | RPC `refund_user_credits` restores period and bonus credits; writes a `refund` row |
| `grantCredits(userId, amount, meta)` | Adds to `credits_bonus` and writes an `admin_grant` / `claim_link` / `system` row. (Not atomic; see [03 gap #6](03-SECURITY.md#known-gaps)) |
| `removeCredits` | Takes from bonus first, then unused period credits, never below what was used; writes `admin_remove` |
| `applyFreePeriodResetIfDue` | Monthly reset of the free tier to 100 credits (`period_reset`) |
| `expireCreditGrants(userId?)` | RPC `expire_credit_grants` removes unspent credits from grants past `credits_expire_at` (`expired`) |

Ledger `source` values: `spend`, `refund`, `admin_grant`, `admin_remove`, `claim_link`, `system`, `period_reset`, `expired`.

## What each action costs

| Action | Credits | Defined in |
|---|---|---|
| Text→image or image edit, low quality | 15 | `IMAGE_CREDITS` in `apps/backend/src/services/imageProviders/config.ts` |
| Text→image or image edit, high quality | 30 | same |
| Image→3D, standard | 30 | `CREDITS_IMAGE_TO_3D` in `apps/backend/src/routes/threeD.ts` |
| Image→3D, high quality | 40 | `CREDITS_IMAGE_TO_3D_HIGH` in the same file |
| Text→3D (image plus model) | 45 at default quality | the sum of the two above; shown as `CREDIT_MATH` in `apps/frontend/lib/pricing.ts` |
| Developer API image→3D | 30 (plus image credits for text→3D) | `CREDITS_3D` in `apps/backend/src/routes/v1/developerApi.ts` |
| Water generation | 0 | `creditsUsed: 0` in `apps/backend/src/routes/codeSculpt.ts` |

At default quality that means Free ≈ 3 models, Starter / Hourly ≈ 30 models and Pro / Hourly Pro ≈ 100 models a month. The UI mirror is `GENERATION_CREDITS` in `apps/frontend/lib/pricing.ts`. **If you change a backend cost, change it there too.**

`STAGE_CREDITS` in `apps/backend/src/lib/create/route.ts` is only an estimate for the parked agent path; nobody is charged from it.

## Refunds when generation fails

| Where | When |
|---|---|
| `apps/backend/src/routes/threeD.ts`: submit paths | Right away, if the GPU gateway submit fails |
| `apps/backend/src/routes/threeD.ts`: `GET /status/:id` | When a job is `FAIL` and still has `credits_used > 0`, it refunds and then sets `credits_used = 0` (race: [03 gap #5](03-SECURITY.md#known-gaps)) |
| `apps/backend/src/services/jobSync.ts` | Hard timeouts and failures. **Local server only** |
| `apps/backend/src/routes/adminGpu.ts` | Admin "clear queue" refunds the jobs it removes |
| `apps/backend/src/routes/v1/developerApi.ts` | Failed or cancelled developer API tasks |

API responses include a `creditsRefunded` flag so the UI can say so.

## Claim links (promo credits)

Code: `apps/backend/src/routes/creditClaims.ts`. Schema: `apps/backend/sql/024_credit_ledger_and_claims.sql`, `apps/backend/sql/029_claim_credit_expiry.sql`.

1. An admin creates a link in Admin → Claim links (`POST /api/admin/credit-claims`). They set the amount, `max_claims`, an optional `allowed_email`, the link's `expires_at`, and an optional `credits_expire_at` for the granted credits.
2. The user opens `/claim/<token>` (`apps/frontend/app/claim/[token]/page.tsx`).
   - `GET /api/credits/claim/:token` previews the link and doesn't need sign-in.
   - `POST` claims it and does need sign-in.
3. The claim itself is the atomic RPC `claim_credit_link`. It adds bonus credits, writes a `claim_link` ledger row and creates a `credit_grants` row.
4. Expiry: the daily cron `/api/cron/expire-credits` runs `expireCreditGrants()`. It also runs on every `GET /credits` read and in the admin user view, so balances are never shown stale.

## Changing pricing safely

1. Update `PLAN_CREDITS` (`apps/backend/src/routes/payments.ts`) and `planConfig` (`apps/backend/src/config.ts`).
2. Update `PRICING` / `SLOT_PRICING` / `GENERATION_CREDITS` in `apps/frontend/lib/pricing.ts`.
3. Update the price in the Dodo dashboard. The product id stays the same unless you create a new product, in which case update the `DODO_PAYMENT_*_PRODUCT_ID` env var.
4. Update the marketing copy: `apps/frontend/public/llms.txt`, `apps/frontend/public/llms-full.txt`, and the email templates in `apps/frontend/email/` that mention credits.
5. Add a SQL migration if plan ids or constraints change. See `apps/backend/sql/021_current_plans_only.sql` for how the plan check constraint is defined.
