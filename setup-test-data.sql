-- ============================================
-- Test Data Setup for LecturesFrom
-- Run this in Supabase Dashboard → SQL Editor
-- Creates a test event with sample submissions
-- ============================================

-- Create a test profile (replace with your actual user ID)
INSERT INTO profiles (id, display_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed test host ID
  'Test Host',
  'host'
)
ON CONFLICT (id) DO NOTHING;

-- Create a test event with a known token
INSERT INTO events (id, host_id, name, token, is_live, mux_live_playback_id, starts_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM profiles WHERE role = 'host' LIMIT 1),
  'Friday Night Listening Party',
  'demo123',
  true,
  'placeholder-playback-id', -- Replace with actual Mux playback ID if available
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample submissions in different states
INSERT INTO submissions (id, event_id, artist_name, track_title, status, queue_position, playback_id, upload_id, created_at)
VALUES
  -- Pending submissions (not approved yet)
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Emerging Artist', 'Midnight Dreams', 'pending', NULL, NULL, 'upload_001', NOW() - INTERVAL '10 minutes'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Local Band', 'Summer Vibes', 'pending', NULL, 'test-playback-1', 'upload_002', NOW() - INTERVAL '8 minutes'),

  -- Approved submissions (in queue)
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'DJ Shadow', 'Building Steam', 'approved', 1, 'test-playback-2', 'upload_003', NOW() - INTERVAL '6 minutes'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Boards of Canada', 'Roygbiv', 'approved', 2, 'test-playback-3', 'upload_004', NOW() - INTERVAL '5 minutes'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Four Tet', 'Two Thousand and Seventeen', 'approved', 3, 'test-playback-4', 'upload_005', NOW() - INTERVAL '4 minutes'),

  -- Currently playing
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Burial', 'Archangel', 'playing', NULL, 'test-playback-5', 'upload_006', NOW() - INTERVAL '3 minutes'),

  -- History (already played)
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Aphex Twin', 'Xtal', 'done', NULL, 'test-playback-6', 'upload_007', NOW() - INTERVAL '15 minutes'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   'Skip Test', 'Bad Quality Track', 'skipped', NULL, 'test-playback-7', 'upload_008', NOW() - INTERVAL '12 minutes')
ON CONFLICT DO NOTHING;

-- Set the currently playing track
INSERT INTO now_playing (event_id, submission_id, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  NOW()
)
ON CONFLICT (event_id)
DO UPDATE SET
  submission_id = EXCLUDED.submission_id,
  updated_at = NOW();

-- Add some event logs for analytics
INSERT INTO event_logs (event_id, action, payload, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'submit',
   '{"submission_id": "test1", "artist_name": "Emerging Artist", "track_title": "Midnight Dreams"}'::jsonb,
   NOW() - INTERVAL '10 minutes'),

  ('11111111-1111-1111-1111-111111111111', 'approve',
   '{"submission_id": "test2", "queue_position": 1}'::jsonb,
   NOW() - INTERVAL '6 minutes'),

  ('11111111-1111-1111-1111-111111111111', 'play',
   '{"submission_id": "test3"}'::jsonb,
   NOW() - INTERVAL '3 minutes'),

  ('11111111-1111-1111-1111-111111111111', 'skip',
   '{"submission_id": "test4", "reason": "manual"}'::jsonb,
   NOW() - INTERVAL '12 minutes');

-- Verify the setup
SELECT 'Test Event Created' as status,
       '/submit/demo123' as submission_url,
       '/host/11111111-1111-1111-1111-111111111111' as host_dashboard_url,
       '/live/11111111-1111-1111-1111-111111111111' as live_page_url;

-- Count submissions by status
SELECT status, COUNT(*) as count
FROM submissions
WHERE event_id = '11111111-1111-1111-1111-111111111111'
GROUP BY status
ORDER BY status;