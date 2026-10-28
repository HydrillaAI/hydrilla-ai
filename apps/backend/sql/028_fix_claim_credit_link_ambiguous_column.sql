-- ============================================================
-- Hydrilla - Fix claim_credit_link "column reference claim_link_id is ambiguous" (42702)
-- The RETURNS TABLE column claim_link_id is also a PL/pgSQL variable, so the
-- already-claimed lookup on credit_ledger.claim_link_id failed on every claim.
-- Same signature and return type as 025, so CREATE OR REPLACE is enough.
-- Run in Supabase SQL Editor.
-- ============================================================

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
  claim_link_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link credit_claim_links%ROWTYPE;
  v_row user_credits%ROWTYPE;
  v_new_bonus integer;
  v_already uuid;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) = 0 OR p_user_id IS NULL OR length(trim(p_user_id)) = 0 THEN
    RETURN QUERY SELECT false, 'invalid_request'::text, 0, 0, 0, 0, 0, NULL::uuid;
    RETURN;
  END IF;

  SELECT *
  INTO v_link
  FROM credit_claim_links
  WHERE token = trim(p_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::text, 0, 0, 0, 0, 0, NULL::uuid;
    RETURN;
  END IF;

  IF v_link.status = 'disabled' THEN
    RETURN QUERY SELECT false, 'disabled'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
    RETURN;
  END IF;

  IF v_link.expires_at IS NOT NULL AND v_link.expires_at <= NOW() THEN
    RETURN QUERY SELECT false, 'expired'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
    RETURN;
  END IF;

  IF v_link.claims_used >= v_link.max_claims THEN
    RETURN QUERY SELECT false, 'exhausted'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
    RETURN;
  END IF;

  IF v_link.allowed_email IS NOT NULL AND length(trim(v_link.allowed_email)) > 0 THEN
    IF p_user_email IS NULL
       OR lower(trim(p_user_email)) <> lower(trim(v_link.allowed_email)) THEN
      RETURN QUERY SELECT false, 'email_mismatch'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
      RETURN;
    END IF;
  END IF;

  -- Qualify with the alias: the OUT column claim_link_id is also a PL/pgSQL variable (42702).
  SELECT cl.id INTO v_already
  FROM credit_ledger cl
  WHERE cl.claim_link_id = v_link.id AND cl.user_id = p_user_id
  LIMIT 1;

  IF v_already IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_claimed'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
    RETURN;
  END IF;

  -- Reserve the claim slot before mutating balances
  UPDATE credit_claim_links
  SET claims_used = claims_used + 1, updated_at = NOW()
  WHERE id = v_link.id
    AND claims_used < max_claims
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'exhausted'::text, v_link.amount, 0, 0, 0, 0, v_link.id;
    RETURN;
  END IF;

  SELECT * INTO v_row FROM user_credits WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, plan, credits_total, credits_used, credits_bonus, reset_at)
    VALUES (p_user_id, NULL, 100, 0, v_link.amount, NOW() + INTERVAL '1 month')
    RETURNING * INTO v_row;
    v_new_bonus := v_link.amount;
  ELSE
    v_new_bonus := COALESCE(v_row.credits_bonus, 0) + v_link.amount;
    UPDATE user_credits
    SET credits_bonus = v_new_bonus, updated_at = NOW()
    WHERE id = v_row.id
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
      'credits_bonus_after', v_new_bonus
    )
  );

  RETURN QUERY SELECT
    true,
    NULL::text,
    v_link.amount,
    (GREATEST(0, v_row.credits_total - v_row.credits_used) + v_new_bonus)::integer,
    v_row.credits_total,
    v_row.credits_used,
    v_new_bonus,
    v_link.id;
END;
$$;

COMMENT ON FUNCTION claim_credit_link(text, text, text) IS
  'Atomically claim a credit link into credits_bonus with FOR UPDATE on link + user row.';
