# Manual End-to-End Testing Guide

This guide walks through testing the complete submission flow to verify real-time updates work correctly.

## Prerequisites

1. Database migration has been run (`migrate-to-ivs.sql`)
2. Test event exists (use `create-test-event.sql` or existing event)
3. Dev server is running: `cd app && npm run dev`
4. Supabase Realtime is enabled for `submissions` and `now_playing` tables

## Test Event

Use the existing test event:
- **Token**: `test123`
- **Event ID**: `8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
- **URLs**:
  - Submit: `http://localhost:3000/submit/test123`
  - Host: `http://localhost:3000/host/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
  - Live: `http://localhost:3000/live/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`

## Test Flow

### Step 1: Submit a Track (Submit Page)

1. Open browser tab 1: `http://localhost:3000/submit/test123`
2. Fill in form:
   - Artist Name: "Test Artist"
   - Track Title: "Test Track"
3. Upload an audio file (MP3, WAV, etc.)
4. Click "Submit Track"
5. **Expected**: Redirects to live page, submission appears in database

### Step 2: Approve Submission (Host Dashboard)

1. Open browser tab 2: `http://localhost:3000/host/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
2. **Expected**: New submission appears in "Pending" column within 1 second
3. Click "Approve" button on the submission
4. **Expected**: 
   - Submission moves to "Queue" column
   - Queue position is assigned
   - Button changes to "Play" and "Skip"

### Step 3: Play Submission (Host Dashboard)

1. In host dashboard, click "Play" button on approved submission
2. **Expected**:
   - Submission status changes to "playing"
   - Submission moves to "Now Playing" section
   - "Play" button becomes disabled
   - Submission appears in "History" column

### Step 4: Verify Real-time Updates (Live Page)

1. Open browser tab 3: `http://localhost:3000/live/8bbadfb8-fbc5-497b-9add-29f336fc5f2c`
2. **Expected**: 
   - "Now Playing" section shows the track that was just played
   - Track info displays: "Test Track" by "Test Artist"
   - Audio player is visible and functional
   - Updates appear **within 1 second** of host clicking Play

### Step 5: Test Real-time Sync

1. Keep both host dashboard and live page open
2. In host dashboard, approve another submission
3. **Expected**: Live page queue updates automatically (no refresh needed)
4. In host dashboard, play the new submission
5. **Expected**: Live page "Now Playing" updates instantly

### Step 6: Test Queue Reordering (Host Dashboard)

1. In host dashboard, approve 2-3 submissions
2. Drag and drop to reorder items in the Queue column
3. **Expected**:
   - Queue positions update
   - Order persists after refresh
   - Live page queue reflects new order

### Step 7: Test Skip Functionality

1. In host dashboard, click "Skip" on a playing track
2. **Expected**:
   - Track status changes to "skipped"
   - Track moves to "History" column
   - "Now Playing" clears (or shows next track if one is queued)

## Verification Checklist

- [ ] Submission appears in host dashboard <1 second after submit
- [ ] Approve button works and moves submission to queue
- [ ] Play button works and updates "Now Playing"
- [ ] Live page updates in real-time when host plays track
- [ ] Queue reordering works via drag-and-drop
- [ ] Skip functionality works correctly
- [ ] Event logs are populated in database (check `event_logs` table)
- [ ] No console errors in browser DevTools
- [ ] Files are immediately available after upload (no processing delay)

## Troubleshooting

**Real-time updates not working:**
- Check Supabase dashboard → Database → Replication
- Verify `submissions` and `now_playing` have realtime enabled
- Check browser console for WebSocket connection errors
- Verify Supabase URL and keys are correct in `.env.local`

**Upload fails:**
- Check Supabase Storage bucket `audio-submissions` exists
- Verify bucket is public
- Check file size (should be <500MB)
- Check browser console for errors

**Play button disabled:**
- Verify `file_url` is set in submissions table
- Check that file uploaded successfully to Supabase Storage
- Verify file URL is accessible (try opening in new tab)

## Expected Database State After Testing

After completing the flow, check the database:

```sql
-- Should have submission entries
SELECT id, artist_name, track_title, status, queue_position, file_url 
FROM submissions 
WHERE event_id = '8bbadfb8-fbc5-497b-9add-29f336fc5f2c'
ORDER BY created_at DESC;

-- Should have event log entries
SELECT action, payload, created_at 
FROM event_logs 
WHERE event_id = '8bbadfb8-fbc5-497b-9add-29f336fc5f2c'
ORDER BY created_at DESC;

-- Should have now_playing entry if track is playing
SELECT * FROM now_playing 
WHERE event_id = '8bbadfb8-fbc5-497b-9add-29f336fc5f2c';
```

## Success Criteria

✅ All steps complete without errors
✅ Real-time updates work across all browser tabs
✅ Database reflects all actions correctly
✅ Event logs capture all operations
✅ UI matches Digital Workwear design system
✅ No TypeScript or runtime errors

