-- Rollback for 027_community_profiles_and_posts.sql.
-- Drops only what 027 created; pre-existing users/jobs data is untouched.
-- WARNING: permanently deletes all community posts, comments, follows and profile edits.
BEGIN;

DROP TRIGGER IF EXISTS trg_users_community_defaults ON users;

-- Functions whose return type is the community_posts row type go before the tables.
DROP FUNCTION IF EXISTS community_feed_trending(INT, INT, TEXT);
DROP FUNCTION IF EXISTS community_feed_following(TEXT, INT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS community_increment_post_view(UUID);

DROP TABLE IF EXISTS community_reports;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS community_comments;
DROP TABLE IF EXISTS community_post_saves;
DROP TABLE IF EXISTS community_post_likes;
DROP TABLE IF EXISTS community_post_items;
DROP TABLE IF EXISTS community_posts;
DROP TABLE IF EXISTS user_username_history;
DROP TABLE IF EXISTS reserved_usernames;

-- Trigger functions go after the tables (their triggers drop with them).
DROP FUNCTION IF EXISTS community_post_items_deleted();
DROP FUNCTION IF EXISTS community_posts_changed();
DROP FUNCTION IF EXISTS user_follows_changed();
DROP FUNCTION IF EXISTS community_refresh_user_counts(TEXT);
DROP FUNCTION IF EXISTS community_post_engagement_changed();
DROP FUNCTION IF EXISTS community_refresh_post_counts(UUID);
DROP FUNCTION IF EXISTS users_before_insert_community_defaults();
DROP FUNCTION IF EXISTS community_change_username(TEXT, TEXT);
DROP FUNCTION IF EXISTS generate_unique_username(TEXT, TEXT);
DROP FUNCTION IF EXISTS community_username_available(TEXT, TEXT);
DROP FUNCTION IF EXISTS community_username_part(TEXT);

DROP INDEX IF EXISTS users_username_key;
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_username_format,
  DROP CONSTRAINT IF EXISTS users_display_name_length,
  DROP CONSTRAINT IF EXISTS users_bio_length,
  DROP CONSTRAINT IF EXISTS users_website_url_format,
  DROP CONSTRAINT IF EXISTS users_community_status_check,
  DROP COLUMN IF EXISTS username,
  DROP COLUMN IF EXISTS username_updated_at,
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS banner_url,
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS community_status,
  DROP COLUMN IF EXISTS followers_count,
  DROP COLUMN IF EXISTS following_count,
  DROP COLUMN IF EXISTS published_posts_count;

COMMIT;
