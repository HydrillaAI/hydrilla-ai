-- ============================================================
-- Hydrilla - Claim credit expiry
-- A claim link can set credits_expire_at. Credits claimed from it are tracked
-- in credit_grants; spends use the soonest-expiring grant first, and on the
-- expiry date whatever is left is removed from credits_bonus and logged as
-- an 'expired' ledger row.
-- Requires 025 and 028. Run in Supabase SQL Editor before deploying the backend.
--
-- Note for every function below: names in RETURNS TABLE are also PL/pgSQL
-- variables, so table columns that share a name (remaining, amount, ...) must
-- be qualified with a table alias or Postgres raises 42702.
-- ============================================================

-- 1) When credits claimed from a link expire (NULL = never)
ALTER TABLE credit_claim_links
  ADD COLUMN IF NOT EXISTS credits_expire_at TIMESTAMPTZ;

COMMENT ON COLUMN credit_claim_links.credits_expire_at IS
  'Credits claimed from this link are removed on this date. NULL means they never expire.';

-- 2) Expiring grants. Only credits with an expiry are tracked here; the rest
-- of credits_bonus never expires.
CREATE TABLE IF NOT EXISTS credit_grants (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          INTEGER     NOT NULL CHECK (amount > 0),
  remaining       INTEGER     NOT NULL CHECK (remaining >= 0),
  expires_at      TIMESTAMPTZ NOT NULL,
  source          TEXT        NOT NULL,
  claim_link_id   UUID        REFERENCES credit_claim_links(id) ON DELETE SET NULL,
  ledger_id       UUID        REFERENCES credit_ledger(id) ON DELETE SET NULL,
  expired_at      TIMESTAMPTZ,
  expired_amount  INTEGER     NOT NULL DEFAULT 0 CHECK (expired_amount >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_grants_user_open
  ON credit_grants (user_id, expires_at)
  WHERE expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credit_grants_due
  ON credit_grants (expires_at)
  WHERE expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credit_grants_ledger_id
  ON credit_grants (ledger_id);

COMMENT ON TABLE credit_grants IS
  'Bonus credits with an expiry date (from claim links). remaining is what is left to spend.';

-- 3) Allow 'expired' ledger rows
ALTER TABLE credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_source_check;
ALTER TABLE credit_ledger
  ADD CONSTRAINT credit_ledger_source_check
  CHECK (source IN (
    'admin_grant',
    'admin_remove',
    'claim_link',
    'system',
    'spend',
    'refund',
    'period_reset',
    'expired'
  ));

-- 4) Expire due grants. p_user_id NULL sweeps every user (daily cron).
-- Locks user_credits before credit_grants, the same order deduct_user_credits uses.
CREATE OR REPLACE FUNCTION expire_credit_grants(p_user_id text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id text;
  v_row user_credits%ROWTYPE;
  v_has_row boolean;
  v_bonus integer;
  v_grant credit_grants%ROWTYPE;
  v_take integer;
  v_user_expired integer;
  v_total_expired integer := 0;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT g.user_id
    FROM credit_grants g
    WHERE g.expired_at IS NULL
      AND g.expires_at <= NOW()
      AND (p_user_id IS NULL OR g.user_id = p_user_id)
  LOOP
    SELECT * INTO v_row FROM user_credits uc WHERE uc.user_id = v_user_id FOR UPDATE;
    v_has_row := FOUND;
    v_bonus := CASE WHEN v_has_row THEN GREATEST(0, COALESCE(v_row.credits_bonus, 0)) ELSE 0 END;
    v_user_expired := 0;

    FOR v_grant IN
      SELECT *
      FROM credit_grants g
      WHERE g.user_id = v_user_id
        AND g.expired_at IS NULL
        AND g.expires_at <= NOW()
      ORDER BY g.expires_at
      FOR UPDATE
    LOOP
      -- Never take more than the bonus actually holds (an admin may have removed some).
      v_take := LEAST(v_grant.remaining, v_bonus);
      v_bonus := v_bonus - v_take;
      v_user_expired := v_user_expired + v_take;

      UPDATE credit_grants g
      SET remaining = 0, expired_at = NOW(), expired_amount = v_take
      WHERE g.id = v_grant.id;

      IF v_take > 0 AND v_has_row THEN
        INSERT INTO credit_ledger (
          user_id,
          delta,
          balance_total_after,
          balance_used_after,
          source,
          reason,
          claim_link_id,
          metadata
        ) VALUES (
          v_user_id,
          -v_take,
          v_row.credits_total,
          v_row.credits_used,
          'expired',
          'Claimed credits expired',
          v_grant.claim_link_id,
          jsonb_build_object(
            'grant_id', v_grant.id,
            'expires_at', v_grant.expires_at,
            'credits_bonus_after', v_bonus
          )
        );
      END IF;
    END LOOP;

    IF v_has_row AND v_user_expired > 0 THEN
      UPDATE user_credits uc
      SET credits_bonus = v_bonus, updated_at = NOW()
      WHERE uc.id = v_row.id;
    END IF;

    v_total_expired := v_total_expired + v_user_expired;
  END LOOP;

  RETURN v_total_expired;
END;
$$;

COMMENT ON FUNCTION expire_credit_grants(text) IS
  'Remove what is left of due credit_grants from credits_bonus and log expired ledger rows.';

-- 5) Deduct: expire due grants first, then spend period, then bonus.
-- The bonus part draws down the soonest-expiring grants first.
-- Same signature and return type as 025, so CREATE OR REPLACE is enough.
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_credits_row_id uuid,
  p_amount integer
)
RETURNS TABLE(
  remaining integer,
  success boolean,
  period_used_after integer,
  bonus_after integer,
  period_taken integer,
  bonus_taken integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id text;
  v_total integer;
  v_used integer;
  v_bonus integer;
  v_period_rem integer;
  v_period_take integer;
  v_bonus_take integer;
  v_new_used integer;
  v_new_bonus integer;
  v_left integer;
  v_grant_id uuid;
  v_grant_left integer;
  v_take integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT 0::integer, false, 0::integer, 0::integer, 0::integer, 0::integer;
    RETURN;
  END IF;

  SELECT uc.user_id INTO v_user_id FROM user_credits uc WHERE uc.id = p_credits_row_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::integer, false, 0::integer, 0::integer, 0::integer, 0::integer;
    RETURN;
  END IF;

  -- Expired credits must not be spendable even if no sweep has run yet.
  PERFORM expire_credit_grants(v_user_id);

  SELECT uc.credits_total, uc.credits_used, COALESCE(uc.credits_bonus, 0)
  INTO v_total, v_used, v_bonus
  FROM user_credits uc
  WHERE uc.id = p_credits_row_id
  FOR UPDATE;

  v_period_rem := GREATEST(0, v_total - v_used);
  IF (v_period_rem + v_bonus) < p_amount THEN
    RETURN QUERY SELECT (v_period_rem + v_bonus)::integer, false, v_used, v_bonus, 0, 0;
    RETURN;
  END IF;

  v_period_take := LEAST(v_period_rem, p_amount);
  v_bonus_take := p_amount - v_period_take;
  v_new_used := v_used + v_period_take;
  v_new_bonus := v_bonus - v_bonus_take;

  UPDATE user_credits uc
  SET
    credits_used = v_new_used,
    credits_bonus = v_new_bonus,
    updated_at = NOW()
  WHERE uc.id = p_credits_row_id;

  v_left := v_bonus_take;
  IF v_left > 0 THEN
    FOR v_grant_id, v_grant_left IN
      SELECT g.id, g.remaining
      FROM credit_grants g
      WHERE g.user_id = v_user_id
        AND g.expired_at IS NULL
        AND g.remaining > 0
      ORDER BY g.expires_at
      FOR UPDATE
    LOOP
      EXIT WHEN v_left <= 0;
      v_take := LEAST(v_left, v_grant_left);
      UPDATE credit_grants g SET remaining = g.remaining - v_take WHERE g.id = v_grant_id;
      v_left := v_left - v_take;
    END LOOP;
  END IF;

  RETURN QUERY SELECT
    (GREATEST(0, v_total - v_new_used) + v_new_bonus)::integer,
    true,
    v_new_used,
    v_new_bonus,
    v_period_take,
    v_bonus_take;
END;
$$;

COMMENT ON FUNCTION deduct_user_credits(uuid, integer) IS
  'Atomically deduct credits: expire due grants, then period remaining, then credits_bonus (soonest-expiring grants first).';

-- 6) Claim: adds credits_expire_at to the result, records an expiring grant,
-- and reports already_claimed before link state so a person who used up a
-- single-use link is told they already claimed it.
-- Return type changes, so DROP first (CREATE OR REPLACE cannot change it, 42P13).
DROP FUNCTION IF EXISTS claim_credit_link(text, text, text);

CREATE OR REPLACE FUNCTION claim_credit_link(
  p_token text,
  p_user_id text,
  p_user_email text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  error_code text,
  amount integer,
  remaining integer,
  total integer,
  used integer,
  bonus integer,
  claim_link_id uuid,
  credits_expire_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link credit_claim_links%ROWTYPE;
  v_row user_credits%ROWTYPE;
  v_new_bonus integer;
  v_already uuid;
  v_ledger_id uuid;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) = 0 OR p_user_id IS NULL OR length(trim(p_user_id)) = 0 THEN
    RETURN QUERY SELECT false, 'invalid_request'::text, 0, 0, 0, 0, 0, NULL::uuid, NULL::timestamptz;
    RETURN;
  END IF;

  SELECT *
  INTO v_link
  FROM credit_claim_links l
  WHERE l.token = trim(p_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::text, 0, 0, 0, 0, 0, NULL::uuid, NULL::timestamptz;
    RETURN;
  END IF;

  SELECT cl.id INTO v_already
  FROM credit_ledger cl
  WHERE cl.claim_link_id = v_link.id
    AND cl.user_id = p_user_id
    AND cl.source = 'claim_link'
  LIMIT 1;

  IF v_already IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_claimed'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
    RETURN;
  END IF;

  IF v_link.status = 'disabled' THEN
    RETURN QUERY SELECT false, 'disabled'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
    RETURN;
  END IF;

  -- A link whose credits have already expired is as good as expired.
  IF (v_link.expires_at IS NOT NULL AND v_link.expires_at <= NOW())
     OR (v_link.credits_expire_at IS NOT NULL AND v_link.credits_expire_at <= NOW()) THEN
    RETURN QUERY SELECT false, 'expired'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
    RETURN;
  END IF;

  IF v_link.claims_used >= v_link.max_claims THEN
    RETURN QUERY SELECT false, 'exhausted'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
    RETURN;
  END IF;

  IF v_link.allowed_email IS NOT NULL AND length(trim(v_link.allowed_email)) > 0 THEN
    IF p_user_email IS NULL
       OR lower(trim(p_user_email)) <> lower(trim(v_link.allowed_email)) THEN
      RETURN QUERY SELECT false, 'email_mismatch'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
      RETURN;
    END IF;
  END IF;

  -- Reserve the claim slot before mutating balances
  UPDATE credit_claim_links l
  SET claims_used = l.claims_used + 1, updated_at = NOW()
  WHERE l.id = v_link.id
    AND l.claims_used < l.max_claims
    AND l.status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'exhausted'::text, v_link.amount, 0, 0, 0, 0, v_link.id, v_link.credits_expire_at;
    RETURN;
  END IF;

  SELECT * INTO v_row FROM user_credits uc WHERE uc.user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, plan, credits_total, credits_used, credits_bonus, reset_at)
    VALUES (p_user_id, NULL, 100, 0, v_link.amount, NOW() + INTERVAL '1 month')
    RETURNING * INTO v_row;
    v_new_bonus := v_link.amount;
  ELSE
    v_new_bonus := COALESCE(v_row.credits_bonus, 0) + v_link.amount;
    UPDATE user_credits uc
    SET credits_bonus = v_new_bonus, updated_at = NOW()
    WHERE uc.id = v_row.id
    RETURNING * INTO v_row;
  END IF;

  INSERT INTO credit_ledger (
    user_id,
    delta,
    balance_total_after,
    balance_used_after,
    source,
    reason,
    claim_link_id,
    metadata
  ) VALUES (
    p_user_id,
    v_link.amount,
    v_row.credits_total,
    v_row.credits_used,
    'claim_link',
    COALESCE(v_link.reason, 'Credit claim link'),
    v_link.id,
    jsonb_build_object(
      'token', v_link.token,
      'credits_bonus_after', v_new_bonus,
      'credits_expire_at', v_link.credits_expire_at
    )
  )
  RETURNING id INTO v_ledger_id;

  IF v_link.credits_expire_at IS NOT NULL THEN
    INSERT INTO credit_grants (user_id, amount, remaining, expires_at, source, claim_link_id, ledger_id)
    VALUES (p_user_id, v_link.amount, v_link.amount, v_link.credits_expire_at, 'claim_link', v_link.id, v_ledger_id);
  END IF;

  RETURN QUERY SELECT
    true,
    NULL::text,
    v_link.amount,
    (GREATEST(0, v_row.credits_total - v_row.credits_used) + v_new_bonus)::integer,
    v_row.credits_total,
    v_row.credits_used,
    v_new_bonus,
    v_link.id,
    v_link.credits_expire_at;
END;
$$;

COMMENT ON FUNCTION claim_credit_link(text, text, text) IS
  'Atomically claim a credit link into credits_bonus; records an expiring credit_grant when the link sets credits_expire_at.';
