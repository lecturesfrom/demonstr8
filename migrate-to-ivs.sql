-- ============================================
-- Migration: Remove Mux, Add AWS IVS Support
-- Run this in Supabase SQL Editor
-- ============================================

-- First, create backup of existing data
CREATE TABLE IF NOT EXISTS events_backup AS SELECT * FROM events;
CREATE TABLE IF NOT EXISTS submissions_backup AS SELECT * FROM submissions;

-- Drop any Mux-related views that might be blocking column drops
-- These views may have been created manually or by previous migrations
DROP VIEW IF EXISTS mux_processing_status CASCADE;
DROP VIEW IF EXISTS mux_assets CASCADE;
DROP VIEW IF EXISTS mux_uploads CASCADE;

-- Drop the mux_webhooks table completely
DROP TABLE IF EXISTS mux_webhooks CASCADE;

-- Update events table: Remove Mux columns, add IVS columns
ALTER TABLE events
  DROP COLUMN IF EXISTS mux_playback_id,
  DROP COLUMN IF EXISTS mux_stream_id,
  DROP COLUMN IF EXISTS mux_stream_key,
  DROP COLUMN IF EXISTS mux_stream_metadata,
  DROP COLUMN IF EXISTS mux_live_status,
  ADD COLUMN IF NOT EXISTS ivs_channel_arn TEXT,
  ADD COLUMN IF NOT EXISTS ivs_stream_key TEXT,
  ADD COLUMN IF NOT EXISTS ivs_playback_url TEXT,
  ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'standard';

-- Update submissions table: Remove Mux columns, add file storage columns
ALTER TABLE submissions
  DROP COLUMN IF EXISTS mux_upload_id,
  DROP COLUMN IF EXISTS mux_asset_id,
  DROP COLUMN IF EXISTS mux_playback_id,
  DROP COLUMN IF EXISTS mux_upload_status,
  DROP COLUMN IF EXISTS mux_metadata,
  DROP COLUMN IF EXISTS mux_error_message,
  DROP COLUMN IF EXISTS upload_id,
  DROP COLUMN IF EXISTS playback_id,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS skip_price_paid_cents INT,
  ADD COLUMN IF NOT EXISTS submission_method TEXT DEFAULT 'manual';

-- Create new tables for demonstr8 features
-- User subscriptions for tiered access
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('free', 'pro', 'platinum')) DEFAULT 'free',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Stripe accounts for payouts
CREATE TABLE IF NOT EXISTS creator_accounts (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User locker for file storage
CREATE TABLE IF NOT EXISTS user_locker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Armed submissions for automated submission
CREATE TABLE IF NOT EXISTS armed_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  locker_file_id UUID REFERENCES user_locker(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic pricing history
CREATE TABLE IF NOT EXISTS skip_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  calculated_price_cents INT,
  queue_length INT,
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Supabase Storage bucket for audio submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-submissions', 'audio-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio submissions
-- Drop existing permissive policy
DROP POLICY IF EXISTS "Anyone can upload audio files" ON storage.objects;

-- Secure INSERT policy: only authenticated users, must upload to their own folder
CREATE POLICY "Authenticated users can upload to their folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'audio-submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT policy: public read access for playback (unchanged)
CREATE POLICY "Anyone can view audio files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'audio-submissions');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_armed_submissions_creator ON armed_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_skip_pricing_session ON skip_pricing_history(session_id);

-- Update RLS policies for new tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locker ENABLE ROW LEVEL SECURITY;
ALTER TABLE armed_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skip_pricing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own creator account" ON creator_accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own locker" ON user_locker
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their armed submissions" ON armed_submissions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view pricing history" ON skip_pricing_history
  FOR SELECT TO anon, authenticated
  USING (true);