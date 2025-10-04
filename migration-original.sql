-- ============================================
-- Supabase Database Migration
-- Live Listening Platform (lecturesfrom)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles
-- Maps Supabase Auth users to app roles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT CHECK (role IN ('fan', 'host', 'admin')) DEFAULT 'fan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- TABLE: events
-- Live listening sessions created by hosts
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  mux_live_playback_id TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_token ON events(token);
CREATE INDEX idx_events_is_live ON events(is_live);

-- ============================================
-- TABLE: submissions
-- Audio track submissions from fans
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_name TEXT,
  track_title TEXT,
  upload_id TEXT,           -- Mux Direct Upload ID
  playback_id TEXT,         -- Set by webhook when asset ready
  tip_cents INT DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'approved', 'playing', 'skipped', 'done')) DEFAULT 'pending',
  queue_position INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queue management
CREATE INDEX idx_submissions_event_id ON submissions(event_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_upload_id ON submissions(upload_id);
CREATE INDEX idx_submissions_queue_position ON submissions(event_id, queue_position) WHERE status = 'approved';

-- ============================================
-- TABLE: now_playing
-- Current track playing in each event
-- ============================================
CREATE TABLE IF NOT EXISTS now_playing (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: event_logs
-- Analytics and audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS event_logs (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID,
  profile_id UUID,
  action TEXT,  -- submit | approve | play | skip | upload_rejected
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_event_logs_event_id ON event_logs(event_id);
CREATE INDEX idx_event_logs_action ON event_logs(action);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at DESC);

-- ============================================
-- TABLE: recordings (M3 - Monetized Replay)
-- Saved recordings of live sessions
-- ============================================
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  mux_asset_id TEXT NOT NULL,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recordings_event_id ON recordings(event_id);

-- ============================================
-- TABLE: unlocks (M3 - Monetized Replay)
-- Tracks which users have purchased replay access
-- ============================================
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  stripe_payment_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)  -- One unlock per user per event
);

CREATE INDEX idx_unlocks_user_id ON unlocks(user_id);
CREATE INDEX idx_unlocks_event_id ON unlocks(event_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Public can read live events
CREATE POLICY "public_read_live_events" ON events
  FOR SELECT
  TO anon, authenticated
  USING (is_live = true);

-- Hosts can read their own events (even if not live)
CREATE POLICY "hosts_read_own_events" ON events
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- Hosts can create events
CREATE POLICY "hosts_create_events" ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

-- Hosts can update their own events
CREATE POLICY "hosts_update_own_events" ON events
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

-- Admins can manage all events
CREATE POLICY "admins_manage_events" ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- SUBMISSIONS POLICIES
-- ============================================

-- Public can read submissions for live events
CREATE POLICY "public_read_submissions" ON submissions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = submissions.event_id
      AND events.is_live = true
    )
  );

-- Anyone (anon or authed) can insert submissions
CREATE POLICY "anon_insert_submissions" ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only event hosts can update submissions (approve, skip, reorder)
CREATE POLICY "hosts_update_submissions" ON submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = submissions.event_id
      AND events.host_id = auth.uid()
    )
  );

-- Only event hosts or admins can delete submissions
CREATE POLICY "hosts_delete_submissions" ON submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = submissions.event_id
      AND events.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- NOW_PLAYING POLICIES
-- ============================================

-- Public can read what's currently playing
CREATE POLICY "public_read_now_playing" ON now_playing
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only event hosts can control playback
CREATE POLICY "hosts_control_playback" ON now_playing
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = now_playing.event_id
      AND events.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = now_playing.event_id
      AND events.host_id = auth.uid()
    )
  );

-- ============================================
-- EVENT_LOGS POLICIES
-- ============================================

-- Anyone can insert event logs (analytics)
CREATE POLICY "anon_insert_logs" ON event_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only event hosts and admins can read logs
CREATE POLICY "hosts_read_logs" ON event_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_logs.event_id
      AND events.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- RECORDINGS POLICIES (M3)
-- ============================================

-- Public can read recordings for events they've unlocked
CREATE POLICY "public_read_unlocked_recordings" ON recordings
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM unlocks
      WHERE unlocks.event_id = recordings.event_id
      AND unlocks.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = recordings.event_id
      AND events.host_id = auth.uid()
    )
  );

-- Only hosts can create recordings of their events
CREATE POLICY "hosts_create_recordings" ON recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = recordings.event_id
      AND events.host_id = auth.uid()
    )
  );

-- ============================================
-- UNLOCKS POLICIES (M3)
-- ============================================

-- Users can read their own unlocks
CREATE POLICY "users_read_own_unlocks" ON unlocks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System (service role) can create unlocks after Stripe payment
-- This is handled server-side, no RLS policy needed (service role bypasses RLS)

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'fan'  -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update now_playing timestamp on update
CREATE OR REPLACE FUNCTION public.update_now_playing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update now_playing timestamp
DROP TRIGGER IF EXISTS on_now_playing_update ON now_playing;
CREATE TRIGGER on_now_playing_update
  BEFORE UPDATE ON now_playing
  FOR EACH ROW EXECUTE FUNCTION public.update_now_playing_timestamp();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Create admin user (update with your Supabase auth user ID)
-- To get your user ID: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- INSERT INTO profiles (id, display_name, role)
-- VALUES ('your-user-uuid-here', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE event_logs_id_seq TO anon, authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify migration succeeded
-- ============================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies created
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Enable Realtime: Database → Replication → Enable for 'submissions' and 'now_playing'
-- 2. Create test event token: INSERT INTO events (host_id, name, token, is_live) VALUES (...)
-- 3. Test RLS policies with different user roles
-- ============================================
