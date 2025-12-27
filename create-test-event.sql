-- ============================================
-- Create Test Event for LecturesFrom
-- Run this in Supabase SQL Editor after migrations
-- ============================================

-- Create a test event with a known ID
INSERT INTO events (id, host_id, name, token, is_live, created_at)
VALUES (
  '8bbadfb8-fbc5-497b-9add-29f336fc5f2c'::uuid,
  gen_random_uuid(), -- Random host ID for testing
  'Test Live Session',
  'test123',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_live = true,
  name = 'Test Live Session';

-- Verify the event was created
SELECT
  id,
  name,
  token,
  is_live,
  created_at
FROM events
WHERE token = 'test123';

-- URLs to test with this event:
-- Submit: https://unabusive-seatless-joesph.ngrok-free.dev/submit/test123
-- Live: https://unabusive-seatless-joesph.ngrok-free.dev/live/8bbadfb8-fbc5-497b-9add-29f336fc5f2c
-- Host: https://unabusive-seatless-joesph.ngrok-free.dev/host/8bbadfb8-fbc5-497b-9add-29f336fc5f2c