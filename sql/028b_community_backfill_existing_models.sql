-- 028b: ONE-TIME backfill — publish every finished web-Studio 3D model to Discover,
-- attributed to the account that generated it. View-only: all rights reserved,
-- downloads off, prompt hidden. Tagged origin = 'backfill' so owners can "Unpublish all".
--
-- Run order: 028a → deploy backend + frontend (owner notice / Unpublish all) → this file.
-- Idempotent: jobs already in any post are skipped, so a re-run publishes nothing twice.
-- Full undo at any time:
--   DELETE FROM community_posts WHERE origin = 'backfill';
--
-- Included: jobs.status = 'DONE' with a GLB, result_kind glb, web source, owner active.
-- Excluded: developer-API jobs, Water scenes (wt_/cs_ ids, three_factory), images,
--           failed / running jobs, suspended users, jobs without an owner.

-- ── Preflight (read-only): what will be published ─────────────────────────
-- SELECT count(*) AS models, count(DISTINCT j.user_id) AS owners
-- FROM jobs j
-- JOIN users u ON u.id = j.user_id AND u.community_status = 'active'
-- WHERE j.status = 'DONE'
--   AND coalesce(j.result_glb_url, '') <> ''
--   AND coalesce(j.result_kind, 'glb') = 'glb'
--   AND j.id NOT LIKE 'wt\_%' AND j.id NOT LIKE 'cs\_%'
--   AND coalesce(j.source, 'web') = 'web'
--   AND NOT EXISTS (SELECT 1 FROM community_post_items i WHERE i.job_id = j.id);

BEGIN;

CREATE TEMP TABLE _community_backfill ON COMMIT DROP AS
SELECT
  gen_random_uuid() AS post_id,
  j.id              AS job_id,
  j.user_id,
  j.created_at,
  -- Only real URLs make covers; data: URLs are huge and belong to Water thumbnails.
  CASE WHEN j.preview_image_url ~* '^https?://' THEN j.preview_image_url END AS cover,
  btrim(regexp_replace(regexp_replace(coalesce(j.prompt, ''), '[[:cntrl:]]', ' ', 'g'), '\s+', ' ', 'g')) AS clean_prompt
FROM jobs j
JOIN users u ON u.id = j.user_id AND u.community_status = 'active'
WHERE j.status = 'DONE'
  AND coalesce(j.result_glb_url, '') <> ''
  AND coalesce(j.result_kind, 'glb') = 'glb'
  AND j.id NOT LIKE 'wt\_%' AND j.id NOT LIKE 'cs\_%'
  AND coalesce(j.source, 'web') = 'web'
  AND NOT EXISTS (SELECT 1 FROM community_post_items i WHERE i.job_id = j.id);

INSERT INTO community_posts (
  id, user_id, title, description, cover_image_url, tags, license,
  allow_download, show_prompt, status, origin, published_at, created_at
)
SELECT
  post_id,
  user_id,
  CASE
    WHEN clean_prompt = '' THEN 'Untitled model'
    WHEN char_length(clean_prompt) > 70 THEN left(clean_prompt, 69) || '…'
    ELSE clean_prompt
  END,
  '',
  cover,
  '{}',
  'all-rights-reserved',
  FALSE,
  FALSE,
  'published',
  'backfill',
  created_at,   -- keep the original order in Newest
  created_at
FROM _community_backfill;

INSERT INTO community_post_items (post_id, position, kind, job_id)
SELECT post_id, 0, 'model', job_id
FROM _community_backfill;

COMMIT;

-- ── Verification (read-only) ──────────────────────────────────────────────
-- 1) Backfilled posts per owner (should equal the preflight totals):
-- SELECT count(*) AS posts, count(DISTINCT user_id) AS owners FROM community_posts WHERE origin = 'backfill';
--
-- 2) Every backfilled post has exactly one model item (expect 0 rows):
-- SELECT p.id FROM community_posts p
-- LEFT JOIN community_post_items i ON i.post_id = p.id
-- WHERE p.origin = 'backfill' GROUP BY p.id HAVING count(i.id) <> 1;
--
-- 3) Each job is in at most one backfilled post (expect 0 rows):
-- SELECT i.job_id FROM community_post_items i JOIN community_posts p ON p.id = i.post_id
-- WHERE p.origin = 'backfill' GROUP BY i.job_id HAVING count(*) > 1;
--
-- 4) Profile counters are consistent (expect 0 rows):
-- SELECT u.id, u.published_posts_count, count(p.id) AS actual
-- FROM users u LEFT JOIN community_posts p ON p.user_id = u.id AND p.status = 'published'
-- GROUP BY u.id HAVING u.published_posts_count <> count(p.id);
