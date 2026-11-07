-- Migration 030: Encrypted developer API key material for email reveal
-- Safe / additive. Run in Supabase SQL Editor.
-- Existing keys stay hashed-only (encrypted_* NULL) and cannot be revealed.

ALTER TABLE developer_api_keys
  ADD COLUMN IF NOT EXISTS encrypted_key TEXT,
  ADD COLUMN IF NOT EXISTS iv TEXT,
  ADD COLUMN IF NOT EXISTS auth_tag TEXT;
