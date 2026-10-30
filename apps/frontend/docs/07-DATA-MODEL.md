# 07 · Data model

All persistent data is in **Supabase Postgres**, except binary assets, which live in S3 ([05](05-CLOUD-GENERATION.md#storage)). Only the backend talks to the database, and it uses the service-role key (`apps/backend/src/db.ts`).

**RLS posture:** many tables enable row-level security (for example `schema.sql`, `027_community_profiles_and_posts.sql`, `job_parents_rls_policies.sql`), but the service-role key bypasses it. Treat RLS as defense-in-depth for any future direct client access, not as the access control that protects us today. Ownership checks live in backend code.

Repositories (query helpers) are in `apps/backend/src/repository/`. Some services query directly, for example `apps/backend/src/services/credits.ts`.

## Tables by domain

### Users

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Mirror of Clerk users (id = Clerk user id) plus community profile fields | `id`, `email`, `first_name`, `last_name`, `image_url`, username fields |
| `user_model_prefs` | Water model toggles | `user_id`, enabled models |
| `reserved_usernames`, `user_username_history` | Community username rules and history | |

`syncUserToDatabase` and the Clerk webhook write `users` ([03](03-SECURITY.md#who-is-calling-identity)). The `users_before_insert_community_defaults` trigger sets a default username.

### Jobs and workspaces

| Table | Purpose | Key columns |
|---|---|---|
| `jobs` | One row per generation (Cloud, Water and image jobs) | `id`, `user_id`, `status` (`WAIT`/`RUN`/`DONE`/`FAIL`), `generate_type`, `prompt`, `image_url`, `result_glb_url`, `preview_image_url`, `credits_used`, `engine` (`trilles` by default), `result_kind` (`glb` / `three_factory`), `factory_code`, `sculpt_spec`, `llm_provider`, `llm_model`, `llm_*_tokens`, `workspace_id`, `chat_id`, `parent_job_id`, `source_images` |
| `job_parents` | Many-to-many edit lineage (replaces `parent_job_id`) | Read via `get_job_lineage` |
| `workspaces` | Groups of jobs | |
| `chats` | Conversations around generations | |

### Billing and credits

| Table | Purpose | Key columns |
|---|---|---|
| `user_credits` | One balance row per user | `credits_total`, `credits_used`, `credits_bonus`, `plan`, `reset_at` |
| `credit_ledger` | Append-only log of every balance change | `delta`, `source` (`spend`/`refund`/`admin_grant`/`admin_remove`/`claim_link`/`system`/`period_reset`/`expired`), `reason`, `admin_email`, `claim_link_id`, `metadata` |
| `credit_claim_links` | Admin-created promo links | token, amount, `max_claims`, `allowed_email`, `expires_at`, `credits_expire_at`, `created_by_admin_email` |
| `credit_grants` | Expiring bonus grants (from claims) | remaining amount, `expires_at` |
| `user_subscriptions` | Dodo subscription state | `plan`, `status`, `dodo_subscription_id`, `dodo_customer_id`, `product_id`, `current_period_start/end`, `cancelled_at`, `metadata` |
| `subscription_payments` | Payment and refund records | |
| `payment_attempts` | Checkout attempts and trial tracking | |
| `webhook_events` | Webhook dedup (`webhook_id` is unique) | |
| `slot_bookings`, `slot_hours` | Hourly-plan bookings and seat counts | |

Plan ids allowed in constraints: `free`, `starter`, `pro`, `slot`, `slot_pro` (see `021_current_plans_only.sql`, `024_slot_plans.sql`). Subscription statuses are in `022_subscription_lifecycle_statuses.sql`.

### Keys and usage

| Table | Purpose |
|---|---|
| `user_api_keys` | User-supplied LLM keys (AES-256-GCM encrypted) |
| `platform_api_keys` | Admin-managed Water LLM keys (encrypted) |
| `image_platform_api_keys` | Admin-managed image provider keys (encrypted) |
| `developer_api_keys` | `hyd_live_` keys (SHA-256 hash only) |
| `developer_api_key_usage` | Per-call usage of developer keys (`record_developer_key_usage`) |
| `image_generation_usage` | Image provider cost tracking (the admin reports `admin_image_usage_by_model` / `_by_user` read it) |

### Water and Create

| Table | Purpose |
|---|---|
| `water_projects`, `water_assets`, `water_scenes`, `water_scene_nodes`, `water_scene_ops`, `water_runs`, `water_pass_reviews`, `water_messages` | Water engine state ([06](06-WATER-ENGINE.md#data)) |
| `job_cards`, `job_card_stages` | JobCard and per-stage state. `job_cards_freeze_engine` stops the engine from changing |
| `evidence_captures` | Turntables, gate reports, score reports |

### Content, community and support

| Table | Purpose |
|---|---|
| `blog_posts` | Blog, edited in the admin app |
| `community_posts`, `community_post_items`, `community_post_likes`, `community_post_saves`, `community_comments`, `community_reports` | Discover, posts and moderation |
| `user_follows` | Follow graph |
| `contact_messages`, `support_feedback` | Contact form and support tickets |
| `app_settings` | Key/value runtime settings, e.g. `gpu_gateway_url` |

## RPCs (Postgres functions)

| Function | Used for |
|---|---|
| `deduct_user_credits` | Atomic spend: period credits first, then bonus |
| `refund_user_credits` | Atomic refund |
| `claim_credit_link` | Atomic claim: checks limits, adds bonus, writes a grant and a ledger row |
| `expire_credit_grants` | Expires overdue grants (cron, plus on every credits read) |
| `set_slot` | Books an hourly slot under `pg_advisory_xact_lock` |
| `get_job_lineage` | Recursive lineage lookup |
| `record_developer_key_usage` | Developer API usage counter |
| `community_*`, `generate_unique_username`, `user_follows_changed` | Community feeds, counters, usernames |
| `admin_image_usage_by_model`, `admin_image_usage_by_user` | Admin usage reports |

## Migrations

These are applied by hand in the Supabase SQL editor; there is no runner ([02](02-DEV-SETUP-AND-DEPLOY.md#database-migrations)).

| Range | Theme |
|---|---|
| `schema.sql`, `subscriptions_schema.sql`, `add_*`, `backfill_*`, `optimize_*` | Original schema and early one-off fixes |
| `001`–`004` | Job credits, credit backfill, the deduct function, cleanup |
| `005`–`008`, `011`–`012` | Water: tokens, platform keys, Google provider, enabled models, engine tables |
| `009` | Blog |
| `010` | JobCards |
| `013`–`016` | Image usage, image keys, developer keys and usage |
| `017`, `023`, `025_credits_bonus_and_breaches` | Refund function, allotments, bonus credits |
| `018_support_feedback`, `018_unified_usage_and_sources` | Support and unified usage (**number used twice**) |
| `019`–`022`, `024_slot_plans`, `025_trial_plans` | Plan renames, lifecycle statuses, hourly plans, trials |
| `024_credit_ledger_and_claims`, `028_fix_claim_credit_link_ambiguous_column`, `029_claim_credit_expiry` | Ledger, claim links, credit expiry |
| `026` | `app_settings` |
| `027` (+`.down.sql`), `028a`, `028b` | Community |

**Before adding a migration:** use the next free number (`030_…`), make it idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`), and note in the PR that someone has to run it in Supabase. Code that depends on it must not ship before it has run.
