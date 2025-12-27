# Testing Guide - Mux + Supabase Integration

## Prerequisites

1. ✅ Environment variables set up in `.env.local`
2. ✅ Supabase realtime enabled for `submissions` and `now_playing` tables
3. ✅ Mux webhook configured to point to your domain
4. ✅ Database migration applied (from `migration.sql`)

## End-to-End Testing Flow

### Step 1: Create a Test Event

1. **Manual Database Insert** (for testing):
   ```sql
   INSERT INTO events (id, host_id, name, token, is_live, starts_at)
   VALUES (
     gen_random_uuid(),
     'your-user-id-here', -- Replace with actual user ID
     'Test Event',
     'test-token-123',
     true,
     NOW()
   );
   ```

2. **Or use the setup script**:
   ```bash
   # If you have setup-test-event.sql
   psql your_supabase_connection_string -f setup-test-event.sql
   ```

### Step 2: Test Submission Flow

1. **Navigate to submission page**:
   ```
   http://localhost:3000/submit/test-token-123
   ```

2. **Upload a small audio file**:
   - Use a short MP3/WAV file (< 10MB for faster testing)
   - Fill in artist name and track title
   - Click "Submit Track"

3. **Verify in Supabase**:
   ```sql
   SELECT * FROM submissions WHERE event_id = 'your-event-id';
   ```
   - Should show `upload_id` populated
   - Should show `playback_id` as `NULL` (initially)

### Step 3: Test Mux Processing

1. **Check Mux Dashboard**:
   - Go to your Mux dashboard → Assets
   - Look for the uploaded file
   - Wait for status to change from "preparing" to "ready"

2. **Verify Webhook Processing**:
   ```sql
   SELECT * FROM submissions WHERE event_id = 'your-event-id';
   ```
   - `playback_id` should now be populated
   - Processing badge should show "✓ Ready"

### Step 4: Test Host Dashboard

1. **Navigate to host dashboard**:
   ```
   http://localhost:3000/host/your-event-id
   ```

2. **Test Approval**:
   - Find your submission in "Pending" section
   - Click "Approve"
   - Should move to "Queue" section

3. **Test Playback**:
   - Click "Play" on an approved submission
   - Should update "Now Playing" section
   - Should show "🎵 Playing" badge

### Step 5: Test Live Page

1. **Navigate to live page**:
   ```
   http://localhost:3000/live/your-event-id
   ```

2. **Verify Mux Player**:
   - Player should load (may show "Stream not available" if no live stream)
   - This is expected if you don't have a live stream set up

3. **Test Real-time Updates**:
   - Open host dashboard in another tab
   - Play different tracks
   - Live page should update "Now Playing" in real-time (< 1 second)

### Step 6: Test Queue Reordering (Optional)

1. **In Host Dashboard**:
   - Approve multiple submissions
   - Drag and drop to reorder in the queue
   - Verify order updates in real-time

## Troubleshooting Common Issues

### Webhook Not Working

**Symptoms**: `playback_id` remains `NULL` after Mux processing

**Debug Steps**:
1. Check Mux dashboard webhook logs
2. Check your API logs for webhook requests
3. Verify `MUX_WEBHOOK_SECRET` matches exactly
4. Test webhook endpoint manually:
   ```bash
   curl -X POST https://yourdomain.com/api/mux/webhook \
     -H "Content-Type: application/json" \
     -H "mux-signature: your-test-signature" \
     -d '{"type":"test"}'
   ```

### No Real-time Updates

**Symptoms**: Changes in host dashboard don't appear on live page

**Debug Steps**:
1. Verify Supabase realtime is enabled:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('submissions', 'now_playing');
   ```

2. Check browser console for Supabase connection errors
3. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Player Not Loading

**Symptoms**: Mux player shows "Stream not available"

**Debug Steps**:
1. Verify `MUX_LIVE_PLAYBACK_ID_DEFAULT` is set and valid
2. Check browser console for Mux player errors
3. Verify the playback ID format (should be alphanumeric, not UUID)

### CORS Errors

**Symptoms**: Upload fails with CORS errors

**Debug Steps**:
1. Verify `NEXT_PUBLIC_APP_URL` matches your actual domain
2. Check Mux dashboard → Settings → CORS origins
3. Ensure your domain is in the allowed origins list

## Performance Testing

### Large File Upload
1. Test with files up to 500MB
2. Verify progress tracking works
3. Check that uploads can be resumed if interrupted

### Concurrent Users
1. Open multiple browser tabs to live page
2. Have multiple people submit tracks simultaneously
3. Verify real-time updates work for all viewers

### Network Issues
1. Test with slow network connections
2. Verify upload progress shows correctly
3. Test real-time updates with intermittent connectivity

## Success Criteria

✅ **Upload Flow**: Files upload successfully and appear in submissions table
✅ **Processing Flow**: Webhook updates playback_id after Mux processing
✅ **Host Controls**: Approve/play/skip work and update database
✅ **Real-time Sync**: Changes appear instantly on live page
✅ **Player Integration**: Mux player loads and displays content
✅ **Error Handling**: Graceful handling of failed uploads/processing
✅ **UI Feedback**: Processing badges and loading states work correctly

## Next Steps After Testing

Once basic flow works:
1. Set up user authentication (Supabase Auth)
2. Add payment integration (Stripe)
3. Implement replay monetization
4. Add advanced analytics
5. Optimize for mobile devices
