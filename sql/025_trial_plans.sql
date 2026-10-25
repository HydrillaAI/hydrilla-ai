-- 025_trial_plans.sql
-- 14-Day Free Trial Support & Fast Retrieval Indexes for Hydrilla Billing

-- 1. Add trial columns to user_subscriptions (if not existing)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_period_days INTEGER DEFAULT 0;

-- 2. Add anti-abuse trial flag to users table (prevents repeated trials by same account)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;

-- 3. High-performance compound & partial indexes for ultra-fast querying and retrieval:
-- Ultra-fast lookup of active subscriptions during authentication and credit deduction:
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
  ON user_subscriptions (user_id, status);

-- Fast partial index for admin overview and billing queries filtering active trials:
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_trial 
  ON user_subscriptions (is_trial) 
  WHERE is_trial = true;

-- Fast index on user trial usage check during checkout session creation:
CREATE INDEX IF NOT EXISTS idx_users_has_used_trial 
  ON users (has_used_trial) 
  WHERE has_used_trial = true;
