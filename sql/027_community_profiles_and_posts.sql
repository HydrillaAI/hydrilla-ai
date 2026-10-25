-- 027: Community — public profiles (@username), posts, likes, saves, comments,
-- follows, reports. Additive only: defaulted columns on users + new tables.
BEGIN;

-- ── 1. Profile columns on users (Clerk-synced columns untouched) ──────────
-- image_url stays the Clerk-synced avatar; avatar_url is the user's override.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username              TEXT,
  ADD COLUMN IF NOT EXISTS username_updated_at   TIMESTAMPTZ,  -- NULL = auto-assigned, never changed
  ADD COLUMN IF NOT EXISTS display_name          TEXT,
  ADD COLUMN IF NOT EXISTS bio                   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url            TEXT,
  ADD COLUMN IF NOT EXISTS banner_url            TEXT,
  ADD COLUMN IF NOT EXISTS website_url           TEXT,
  ADD COLUMN IF NOT EXISTS community_status      TEXT    NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS followers_count       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_posts_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_format;
ALTER TABLE users ADD CONSTRAINT users_username_format CHECK (
  username IS NULL OR (
    char_length(username) BETWEEN 3 AND 30
    AND username ~ '^[a-z0-9]([a-z0-9._]*[a-z0-9])?$'
    AND username !~ '[._]{2}'
  ));
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_display_name_length;
ALTER TABLE users ADD CONSTRAINT users_display_name_length
  CHECK (display_name IS NULL OR char_length(display_name) <= 50);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_bio_length;
ALTER TABLE users ADD CONSTRAINT users_bio_length
  CHECK (bio IS NULL OR char_length(bio) <= 280);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_website_url_format;
ALTER TABLE users ADD CONSTRAINT users_website_url_format
  CHECK (website_url IS NULL OR website_url ~* '^https?://');
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_community_status_check;
ALTER TABLE users ADD CONSTRAINT users_community_status_check
  CHECK (community_status IN ('active', 'suspended'));

CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username);

-- ── 2. Username support tables ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reserved_usernames (
  username   TEXT PRIMARY KEY,
  reason     TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO reserved_usernames (username) VALUES
  ('admin'),('administrator'),('root'),('system'),('support'),('help'),('staff'),
  ('team'),('official'),('moderator'),('mod'),('security'),('billing'),('sales'),
  ('hydrilla'),('hydrillaai'),('bluefox'),('bluefox3d'),('water'),('api'),('app'),
  ('www'),('mail'),('about'),('blog'),('careers'),('changelog'),('contact'),('docs'),
  ('enterprise'),('faq'),('features'),('pricing'),('privacy'),('terms'),('cookies'),
  ('settings'),('discover'),('community'),('explore'),('trending'),('featured'),
  ('posts'),('post'),('profile'),('user'),('users'),('me'),('login'),('logout'),
  ('signin'),('signup'),('workspace'),('studio'),('assets'),('library'),('generate'),
  ('generations'),('viewer'),('research'),('solutions'),('integrations'),('brand'),
  ('null'),('undefined'),('anonymous'),('everyone'),('here'),('new'),('edit')
ON CONFLICT (username) DO NOTHING;

-- Old handles keep redirecting to the new one; also blocks takeover of old links.
CREATE TABLE IF NOT EXISTS user_username_history (
  old_username TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_username_history_user_id ON user_username_history (user_id);

-- ── 3. Community tables ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 70),
  description     TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  cover_image_url TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(tags) <= 5),
  license         TEXT NOT NULL DEFAULT 'cc-by-nc-4.0'
                  CHECK (license IN ('cc0','cc-by-4.0','cc-by-nc-4.0','all-rights-reserved')),
  allow_download  BOOLEAN NOT NULL DEFAULT TRUE,
  show_prompt     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','removed')),
  removed_reason  TEXT,
  removed_at      TIMESTAMPTZ,
  featured_at     TIMESTAMPTZ,                -- staff pick
  like_count      INTEGER NOT NULL DEFAULT 0,
  save_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  view_count      INTEGER NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_posts_feed_newest
  ON community_posts (status, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user
  ON community_posts (user_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured
  ON community_posts (featured_at DESC) WHERE featured_at IS NOT NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN (tags);

-- Up to 10 ordered items per post: models (a user's job) or uploaded images.
-- ON DELETE CASCADE on job_id: deleting an asset removes it from posts.
CREATE TABLE IF NOT EXISTS community_post_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  position   SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 9),
  kind       TEXT NOT NULL CHECK (kind IN ('model','image')),
  job_id     VARCHAR(64) REFERENCES jobs(id) ON DELETE CASCADE,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_post_items_payload CHECK (
    (kind = 'model' AND job_id IS NOT NULL AND image_url IS NULL) OR
    (kind = 'image' AND image_url IS NOT NULL AND job_id IS NULL)),
  CONSTRAINT community_post_items_position_key UNIQUE (post_id, position)
);
CREATE UNIQUE INDEX IF NOT EXISTS community_post_items_post_job_key
  ON community_post_items (post_id, job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_post_items_job_id ON community_post_items (job_id);

CREATE TABLE IF NOT EXISTS community_post_likes (
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user ON community_post_likes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_post_saves (
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_post_saves_user ON community_post_saves (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- replies (UI later)
  body              TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status            TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','removed')),
  edited_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_comments_user ON community_comments (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_follows (
  follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_no_self CHECK (follower_id <> following_id)
);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows (following_id, created_at DESC);

CREATE TABLE IF NOT EXISTS community_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','user')),
  target_id   TEXT NOT NULL,
  reason      TEXT NOT NULL CHECK (reason IN ('spam','nsfw','violence','harassment','copyright','other')),
  details     TEXT CHECK (details IS NULL OR char_length(details) <= 1000),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','actioned','dismissed')),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS community_reports_once_per_reporter
  ON community_reports (reporter_id, target_type, target_id) WHERE reporter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_reports_queue ON community_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports (target_type, target_id);

-- ── 4. Username functions ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION community_username_part(p_value TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT left(regexp_replace(
           translate(lower(coalesce(p_value, '')),
                     'áàâäãåāéèêëēíìîïīóòôöõøōúùûüūñçýÿ',
                     'aaaaaaaeeeeeiiiiiooooooouuuuuncyy'),
           '[^a-z0-9]+', '', 'g'), 20)
$$;

CREATE OR REPLACE FUNCTION community_username_available(p_username TEXT, p_user_id TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT char_length(p_username) BETWEEN 3 AND 30
     AND p_username NOT LIKE '%hydrilla%'
     AND NOT EXISTS (SELECT 1 FROM users WHERE username = p_username AND id IS DISTINCT FROM p_user_id)
     AND NOT EXISTS (SELECT 1 FROM reserved_usernames WHERE username = p_username)
     AND NOT EXISTS (SELECT 1 FROM user_username_history
                     WHERE old_username = p_username AND user_id IS DISTINCT FROM p_user_id)
$$;

-- first name → first.last → first+4 digits → creator+4 digits → creator+random
CREATE OR REPLACE FUNCTION generate_unique_username(p_first_name TEXT, p_last_name TEXT)
RETURNS TEXT LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  v_first     TEXT := community_username_part(p_first_name);
  v_last      TEXT := community_username_part(p_last_name);
  v_base      TEXT;
  v_candidate TEXT;
  v_attempt   INT  := 0;
BEGIN
  IF char_length(v_first) >= 3 AND community_username_available(v_first) THEN
    RETURN v_first;
  END IF;
  IF v_first <> '' AND v_last <> '' THEN
    v_candidate := left(v_first, 14) || '.' || left(v_last, 15);
    IF community_username_available(v_candidate) THEN RETURN v_candidate; END IF;
  END IF;
  v_base := CASE WHEN v_first <> '' THEN v_first
                 WHEN v_last  <> '' THEN v_last
                 ELSE 'creator' END;
  IF v_base LIKE '%hydrilla%' THEN
    v_base := 'creator';
  END IF;
  LOOP
    v_attempt   := v_attempt + 1;
    v_candidate := v_base || (floor(random() * 9000) + 1000)::int::text;
    IF community_username_available(v_candidate) THEN RETURN v_candidate; END IF;
    IF v_attempt >= 20 THEN
      RETURN 'creator' || substr(md5(random()::text || clock_timestamp()::text), 1, 10);
    END IF;
  END LOOP;
END;
$$;

-- Atomic rename with 30-day cooldown (first change is free) + history for redirects.
CREATE OR REPLACE FUNCTION community_change_username(p_user_id TEXT, p_new_username TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_old        TEXT;
  v_changed_at TIMESTAMPTZ;
BEGIN
  SELECT username, username_updated_at INTO v_old, v_changed_at
  FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_old IS NULL THEN RAISE EXCEPTION 'user_not_found'; END IF;
  IF v_old = p_new_username THEN RETURN v_old; END IF;
  IF v_changed_at IS NOT NULL AND v_changed_at > now() - interval '30 days' THEN
    RAISE EXCEPTION 'username_cooldown';
  END IF;
  IF NOT community_username_available(p_new_username, p_user_id) THEN
    RAISE EXCEPTION 'username_unavailable';
  END IF;
  DELETE FROM user_username_history WHERE old_username = p_new_username AND user_id = p_user_id;
  INSERT INTO user_username_history (old_username, user_id) VALUES (v_old, p_user_id)
    ON CONFLICT (old_username) DO UPDATE SET user_id = EXCLUDED.user_id, changed_at = now();
  UPDATE users SET username = p_new_username, username_updated_at = now(), updated_at = now()
  WHERE id = p_user_id;
  RETURN p_new_username;
END;
$$;

-- Every new users row (sync-user, /me, water routes, admin) gets a username +
-- a display_name snapshot. Backend insert code is unchanged.
CREATE OR REPLACE FUNCTION users_before_insert_community_defaults()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.username IS NULL THEN
    NEW.username := generate_unique_username(NEW.first_name, NEW.last_name);
  END IF;
  IF NEW.display_name IS NULL THEN
    NEW.display_name := nullif(left(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), 50), '');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_users_community_defaults ON users;
CREATE TRIGGER trg_users_community_defaults
  BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION users_before_insert_community_defaults();

-- ── 5. Backfill existing users (oldest first get the cleanest handles) ───
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, first_name, last_name FROM users
           WHERE username IS NULL ORDER BY created_at, id LOOP
    UPDATE users SET username = generate_unique_username(r.first_name, r.last_name)
    WHERE id = r.id;
  END LOOP;
END $$;
UPDATE users
SET display_name = nullif(left(trim(concat_ws(' ', first_name, last_name)), 50), '')
WHERE display_name IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- ── 6. Denormalized counters (recount = drift-proof) ─────────────────────
CREATE OR REPLACE FUNCTION community_refresh_post_counts(p_post_id UUID)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE community_posts SET
    like_count    = (SELECT count(*) FROM community_post_likes WHERE post_id = p_post_id),
    save_count    = (SELECT count(*) FROM community_post_saves WHERE post_id = p_post_id),
    comment_count = (SELECT count(*) FROM community_comments
                     WHERE post_id = p_post_id AND status = 'visible')
  WHERE id = p_post_id;
$$;

CREATE OR REPLACE FUNCTION community_post_engagement_changed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM community_refresh_post_counts(OLD.post_id);
  ELSE
    PERFORM community_refresh_post_counts(NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_community_post_likes_counts ON community_post_likes;
CREATE TRIGGER trg_community_post_likes_counts AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW EXECUTE FUNCTION community_post_engagement_changed();
DROP TRIGGER IF EXISTS trg_community_post_saves_counts ON community_post_saves;
CREATE TRIGGER trg_community_post_saves_counts AFTER INSERT OR DELETE ON community_post_saves
  FOR EACH ROW EXECUTE FUNCTION community_post_engagement_changed();
DROP TRIGGER IF EXISTS trg_community_comments_counts ON community_comments;
CREATE TRIGGER trg_community_comments_counts AFTER INSERT OR DELETE OR UPDATE OF status ON community_comments
  FOR EACH ROW EXECUTE FUNCTION community_post_engagement_changed();

CREATE OR REPLACE FUNCTION community_refresh_user_counts(p_user_id TEXT)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE users SET
    followers_count       = (SELECT count(*) FROM user_follows WHERE following_id = p_user_id),
    following_count       = (SELECT count(*) FROM user_follows WHERE follower_id = p_user_id),
    published_posts_count = (SELECT count(*) FROM community_posts
                             WHERE user_id = p_user_id AND status = 'published')
  WHERE id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION user_follows_changed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM community_refresh_user_counts(OLD.follower_id);
    PERFORM community_refresh_user_counts(OLD.following_id);
  ELSE
    PERFORM community_refresh_user_counts(NEW.follower_id);
    PERFORM community_refresh_user_counts(NEW.following_id);
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_user_follows_counts ON user_follows;
CREATE TRIGGER trg_user_follows_counts AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION user_follows_changed();

CREATE OR REPLACE FUNCTION community_posts_changed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM community_refresh_user_counts(OLD.user_id);
  ELSE
    PERFORM community_refresh_user_counts(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_community_posts_user_counts ON community_posts;
CREATE TRIGGER trg_community_posts_user_counts AFTER INSERT OR DELETE OR UPDATE OF status ON community_posts
  FOR EACH ROW EXECUTE FUNCTION community_posts_changed();

-- A post whose last item was deleted (asset deleted) is auto-removed.
CREATE OR REPLACE FUNCTION community_post_items_deleted()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE community_posts
  SET status = 'removed', removed_reason = 'source_deleted', removed_at = now()
  WHERE id = OLD.post_id AND status = 'published'
    AND NOT EXISTS (SELECT 1 FROM community_post_items WHERE post_id = OLD.post_id);
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_community_post_items_deleted ON community_post_items;
CREATE TRIGGER trg_community_post_items_deleted AFTER DELETE ON community_post_items
  FOR EACH ROW EXECUTE FUNCTION community_post_items_deleted();

-- updated_at only on content edits (likes/views don't bump it). Reuses existing fn.
DROP TRIGGER IF EXISTS trg_community_posts_updated_at ON community_posts;
CREATE TRIGGER trg_community_posts_updated_at
  BEFORE UPDATE OF title, description, cover_image_url, tags, license, allow_download, show_prompt
  ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_community_comments_updated_at ON community_comments;
CREATE TRIGGER trg_community_comments_updated_at BEFORE UPDATE OF body ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 7. Feed RPCs ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION community_feed_trending(p_limit INT DEFAULT 24, p_offset INT DEFAULT 0, p_tag TEXT DEFAULT NULL)
RETURNS SETOF community_posts LANGUAGE sql STABLE AS $$
  SELECT p.* FROM community_posts p
  JOIN users u ON u.id = p.user_id AND u.community_status = 'active'
  WHERE p.status = 'published' AND (p_tag IS NULL OR p.tags @> ARRAY[p_tag])
  ORDER BY (p.like_count * 2 + p.save_count * 3 + p.comment_count * 2 + p.view_count * 0.02 + 1)
           / power(extract(epoch FROM (now() - p.published_at)) / 3600.0 + 2, 1.5) DESC,
           p.published_at DESC, p.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 60) OFFSET GREATEST(p_offset, 0);
$$;

CREATE OR REPLACE FUNCTION community_feed_following(p_user_id TEXT, p_limit INT DEFAULT 24, p_before TIMESTAMPTZ DEFAULT NULL)
RETURNS SETOF community_posts LANGUAGE sql STABLE AS $$
  SELECT p.* FROM community_posts p
  JOIN user_follows f ON f.following_id = p.user_id AND f.follower_id = p_user_id
  JOIN users u ON u.id = p.user_id AND u.community_status = 'active'
  WHERE p.status = 'published' AND (p_before IS NULL OR p.published_at < p_before)
  ORDER BY p.published_at DESC, p.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 60);
$$;

CREATE OR REPLACE FUNCTION community_increment_post_view(p_post_id UUID)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE community_posts SET view_count = view_count + 1
  WHERE id = p_post_id AND status = 'published';
$$;

-- ── 8. Lock down: service_role only (backend), matching water_* tables ───
ALTER TABLE reserved_usernames    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_username_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_saves  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows          ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports     ENABLE ROW LEVEL SECURITY;

REVOKE EXECUTE ON FUNCTION
  community_username_available(TEXT, TEXT), generate_unique_username(TEXT, TEXT),
  community_change_username(TEXT, TEXT), community_refresh_post_counts(UUID),
  community_refresh_user_counts(TEXT), community_feed_trending(INT, INT, TEXT),
  community_feed_following(TEXT, INT, TIMESTAMPTZ), community_increment_post_view(UUID)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  community_username_available(TEXT, TEXT), generate_unique_username(TEXT, TEXT),
  community_change_username(TEXT, TEXT), community_refresh_post_counts(UUID),
  community_refresh_user_counts(TEXT), community_feed_trending(INT, INT, TEXT),
  community_feed_following(TEXT, INT, TIMESTAMPTZ), community_increment_post_view(UUID)
TO service_role;

COMMIT;
