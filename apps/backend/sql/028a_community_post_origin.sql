-- 028a: Mark where a community post came from. Additive; existing rows become 'user'.
-- 'backfill' = published once by 028b on the owner's behalf (view-only; owner can unpublish all).
-- Run this BEFORE deploying the backend that reads `origin`, and before 028b.
BEGIN;

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'user';

ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_origin_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_origin_check
  CHECK (origin IN ('user', 'backfill'));

CREATE INDEX IF NOT EXISTS idx_community_posts_user_backfill
  ON community_posts (user_id) WHERE origin = 'backfill';

COMMIT;
