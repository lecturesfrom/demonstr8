-- ============================================
-- Test Event Setup
-- Run this after creating your Supabase user account
-- ============================================

-- STEP 1: Get your user ID
-- Go to: https://supabase.com/dashboard/project/krywcgrrrdpudysphgbp/auth/users
-- Find your user and copy the ID

-- STEP 2: Make yourself a host (replace YOUR_USER_ID)
UPDATE profiles
SET role = 'host'
WHERE id = 'YOUR_USER_ID';

-- STEP 3: Create a test event
INSERT INTO events (host_id, name, token, is_live)
VALUES (
  'YOUR_USER_ID',
  'Test Live Session',
  'test123',
  true
);

-- STEP 4: Verify event created
SELECT id, name, token, is_live FROM events WHERE token = 'test123';

-- ============================================
-- URLs to test:
-- ============================================
-- Submit page: http://localhost:3000/submit/test123
-- Host dashboard: http://localhost:3000/host/[EVENT_ID from step 4]
-- Live page: http://localhost:3000/live/[EVENT_ID from step 4]
-- ============================================
